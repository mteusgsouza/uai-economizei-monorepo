# Etapa 4 — Assistente IA de fallback da busca

**Objetivo:** quando a busca do site não encontra nada (ou encontra mal), a página de
resultados oferece um mini-chat ("me conta o que você procura") que usa o Claude Haiku 5.5
com tool use **sobre a busca existente** e devolve produtos reais do catálogo.
**Depende de:** etapa 2 (shell de chat) e etapa 3 (infra `lib/ai/anthropic.ts`) concluídas —
confira as seções *Interface publicada* no `STATE.md`. **Workspace:** `apps/front`. **Antes de começar e ao terminar:** atualize o `STATE.md`.

## Contexto mínimo

- Busca: `/produtos?search=...` em `app/(front)/produtos/(lista)/page.tsx` (server component). Resultado vazio renderiza `<ListingEmpty …/>` (linha ~101). `getSearchResults(query, canonicalSearch(term))` vive em `lib/catalog/search-results.ts` (retorna docs já mapeados + `search.mode 'all'|'any'` + `correctedTerm`); `canonicalSearch` em `lib/catalog/listing-params.ts` (conferir export). Taxonomia: `getCategories()` e `getSubcategoryCounts()` em `lib/catalog/taxonomy.ts`.
- **Rotas `/api/*` pertencem ao Payload** (grupo `app/(payload)`) — a rota nova fica fora: `app/(front)/assistente-busca/route.ts`.
- Shell de chat da etapa 2: `components/chat/chat-shell.tsx` (`variant="inline"`), `chat-bubbles.tsx` — props no `STATE.md`.
- Infra IA da etapa 3: `lib/ai/anthropic.ts` (`AI_MODEL`, `aiEnabled`, `getAnthropicClient()`).
- Cards de produto: `ProductCard` em `components/product/product-card.tsx` (recebe `pixDiscountPercent`/`maxInstallments` — no client, de `useStoreSettings()`).
- Regras do Haiku 5.5: mesmas da etapa 3 (seção homônima naquele arquivo); formas exatas do SDK na skill `claude-api` (TypeScript), não de memória. Zod já é dependência.

## Design (fixo)

- **O modelo nunca serializa produto**: só conversa e chama tools; o servidor acumula os `docs` do último `search_products` com resultado e os devolve junto do texto final. Impossível inventar preço/estoque.
- **Contrato** `POST /assistente-busca` (zod): request `{ term ≤120 chars, messages ≤6 itens { role: 'user'|'assistant', content ≤300 chars } (último = user) }` → 200 `{ message: string, products: Product[] ≤6 }` | 400 inválido | 429 cota | 503 sem chave | 500 genérico.
- **Anti-abuso em camadas**: cota servidor de **10 mensagens/hora por navegador** (cookie HttpOnly assinado) antes de gastar token; 5 turnos por conversa no client; `max_tokens: 700`; effort low; prompt caching. Estourou → UI desativa e orienta a **busca normal sem IA**.

## Tarefas

1. **Novo** `lib/ai/search-assistant/quota.ts` (~60 l): cookie HttpOnly assinado (HMAC `node:crypto` com `PAYLOAD_SECRET`) carregando `{count, windowStart}`; limite 10/hora (constante). Cookie inválido/ausente = janela nova (aceitável para o porte da loja).
2. **Novo** `lib/ai/search-assistant/prompt.ts` (~40 l): system fixo pt-BR — responder curto (1–3 frases); SEMPRE usar `search_products` antes de afirmar que algo existe; falar só de produtos retornados pelas tools; NUNCA inventar preço/estoque/marca; sem resultado, sugerir categorias de `list_taxonomy`; recusar assuntos fora da loja.
3. **Novo** `lib/ai/search-assistant/tools.ts` (~110 l): definições `Anthropic.Tool` + executores — `search_products {term}` → `getSearchResults({ page: 1, limit: 6 }, canonicalSearch(term))`, devolve ao modelo resumo textual (nome, marca, categoria, preço formatado) e guarda os `docs` num acumulador; `list_taxonomy {}` → categorias/subcategorias com contagem, escondendo zerados.
4. **Novo** `lib/ai/search-assistant/run.ts` (~120 l): loop manual de tool use — `messages.create` com tools, `tool_choice: { type: 'auto' }`, `max_tokens: 700`, effort low; enquanto `stop_reason === 'tool_use'` (máx 4 iterações), executar todos os `tool_use` do turno e devolver **todos** os `tool_result` numa única mensagem user; ao final extrair texto dos blocos `type === 'text'`; tratar `refusal` com mensagem padrão. Prompt caching: system + tools fixos com `cache_control: { type: 'ephemeral' }`, histórico volátil depois.
5. **Novo** `app/(front)/assistente-busca/route.ts` (~70 l): `export const maxDuration = 30`; valida com zod → cota → `runSearchAssistant(input)` → `NextResponse.json`; try/catch com log e 500 genérico; 503 quando `!aiEnabled`.
6. **Novo** `components/product/search-assistant.tsx` (~140 l, `'use client'`): convite "Não achou? Me conta o que você procura" com `ChatShell variant="inline"` + bubbles; estado local de mensagens; fetch POST; input com `maxLength`; loading/erro com retry; produtos em grid com `ProductCard`. Limite client de 5 turnos; **em 429 ou após os turnos**: desativa o input, mostra a mensagem orientando a busca normal e grava flag em `sessionStorage` (widget nasce desativado no resto da sessão). Se passar de 150 l, extrair `search-assistant-results.tsx`.
7. **Editar** `app/(front)/produtos/(lista)/page.tsx`: abaixo do `<ListingEmpty …/>`, quando `searchTerm` existe **e** `aiEnabled` (import server de `lib/ai/anthropic.ts`), renderizar `<SearchAssistant term={searchTerm} />`. Recomendado: também colapsado (`defaultOpen={false}`) quando `result.search?.mode === 'any'` (resultados fracos).

## Verificação

- `pnpm --filter @store/front typecheck && pnpm --filter @store/front lint && pnpm --filter @store/front test`
- Com `ANTHROPIC_API_KEY` local, subir o front (3000; porta livre antes, **matar ao final**):
  - `/produtos?search=xablau` → widget aparece; conversar ("quero um fone barato") → cards reais com preços idênticos aos da vitrine;
  - limites: input >300 chars bloqueado; 6º turno bloqueado no client; 11ª mensagem na mesma hora → 429 e widget desativado orientando a busca normal;
  - sem a chave: widget não renderiza; pergunta fora do escopo (ex. "quanto é 2+2?") → recusa educada.
- Rodar a skill `quality-gate`.

## Riscos locais

- +1 função serverless na Vercel (orçamento apertado) — se o teto apertar, alternativa futura é mover para a Nest; não é o plano.
- Custo: Haiku 5.5 ≈ US$1–2 por 1.000 conversas com caching; acompanhar o console da Anthropic no início.

## Ao concluir

No `STATE.md`: status `concluída` + **Interface publicada → Etapa 4** (contrato final da rota, limites efetivos). Commit sugerido (só quando o usuário pedir): `feat(busca): assistente IA quando a busca não encontra`.
