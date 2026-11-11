# Etapa 3 — Gerador de sinônimos com IA (botão no admin)

**Objetivo:** botão na lista da collection *Sinônimos de busca* do admin que chama o
Claude Haiku 5.5 para sugerir grupos de sinônimos a partir do catálogo, deduplicados
contra os já cadastrados; os docs nascem na collection para o lojista revisar/editar.
Esta etapa também cria a **infra de IA compartilhada** que a etapa 4 consome.
**Depende de:** nada. **Workspace:** `apps/front`. **Antes de começar e ao terminar:** atualize o `STATE.md`.

## Contexto mínimo

- Collection `search-synonyms` em `src/collections/SearchSynonyms.ts`: um campo `terms` (text); **cada doc = um grupo** ("fone de ouvido, headset, headphone"); validação exige ≥2 termos; hooks de revalidate já existem (a busca usa os novos grupos na hora).
- Parsing existente para reusar: `splitTerms` em `lib/search/synonyms.ts` (separa por vírgula/;/quebra de linha) e `foldText` em `lib/search/normalize.ts`.
- Catálogo via Payload Local API: `getPayloadClient()` em `lib/catalog/payload-client.ts`; `loadSearchDocs(payload, where)` e `loadSynonymRows(payload)` em `lib/catalog/search-data.ts`; filtro `AVAILABLE` em `lib/catalog/filters.ts`.
- Padrão de server action do admin com checagem de sessão: `src/admin/actions/push-subscription.ts` (`ensureAdmin()` via `payload.auth({ headers })` — copie o padrão; a action é HTTP-acessível, sem isso vira rota aberta).
- Admin UI: `Button` e `toast` de `@payloadcms/ui`.
- **Importante:** consulte a skill `claude-api` (TypeScript) para as formas exatas do SDK (structured outputs, tipos) — não escrever de memória. Zod já é dependência do front.

## Regras do Haiku 5.5 (para esta etapa e a 4)

- Modelo `claude-haiku-5-5`. Não enviar `thinking: {type:"disabled"}` nem `budget_tokens`; usar `output_config: { effort: "low" }`.
- Não usar `tool_choice` forçado (`any`/`tool`). Não enviar `temperature`/`top_p` custom.
- Checar `stop_reason` antes de ler `content`; tratar `refusal` com mensagem padrão.
- Tipos sempre do SDK (`Anthropic.MessageParam` etc.), nunca redefinidos.

## Tarefas

Infra compartilhada (se já existir — ver `STATE.md` —, pule):
1. `pnpm --filter @store/front add @anthropic-ai/sdk`
2. `.env.example`: adicionar `ANTHROPIC_API_KEY=` com comentário (server-only; usada pelo gerador de sinônimos e pelo assistente de busca).
3. **Novo** `lib/ai/anthropic.ts` (~30 l): `import 'server-only'`; `export const AI_MODEL = 'claude-haiku-5-5'`; `export const aiEnabled = Boolean(process.env.ANTHROPIC_API_KEY)`; singleton lazy `getAnthropicClient()` (o SDK lê a chave do ambiente).

Gerador:
4. **Novo** `lib/ai/synonyms/dedupe.ts` (~70 l, puro): `existingTermSet(rows: string[]): Set<string>` (aplica `splitTerms` + `foldText` nos cadastrados); `filterNewGroups(groups: string[][], existing): { kept; skipped }` — descarta grupo se **qualquer** termo já existe, grupo com <2 termos válidos, e deduplica entre os gerados na mesma rodada.
5. **Novo** `lib/ai/synonyms/dedupe.test.ts` — node:test (o script `test` do front já roda `lib/**/*.test.ts` com tsx).
6. **Novo** `lib/ai/synonyms/prompt.ts` (~60 l): system fixo pt-BR — grupos de termos que o cliente digitaria para o MESMO tipo de produto; ≥2 termos por grupo; não inventar marcas; não repetir termos já cadastrados; incluir variações regionais, anglicismos e abreviações — + `buildUserMessage(catalog, existingRows)` serializando nomes únicos, marcas, categorias/subcategorias e grupos existentes.
7. **Novo** `src/admin/lib/synonym-catalog.ts` (~60 l): snapshot do catálogo — `loadSearchDocs(payload, { and: AVAILABLE })` + `loadSynonymRows(payload)`; dedupe de nomes; cap ~2000 nomes (acima, lotes de 500 com chamadas sequenciais e dedupe acumulativo).
8. **Novo** `src/admin/actions/generate-synonyms.ts` (~90 l, `'use server'`): `ensureAdmin()` (senão `{ ok: false, error: 'Sessão expirada.' }`) → `aiEnabled` (senão erro amigável pedindo a chave) → `messages.create` com `max_tokens: 4000`, effort low, pedindo saída estruturada `{ groups: string[][] }` validada com zod → `filterNewGroups` → um `payload.create({ collection: 'search-synonyms', data: { terms: group.join(', ') } })` por grupo → `{ ok: true, created, skipped }`.
9. **Novo** `src/admin/components/generate-synonyms-button.tsx` (~70 l, `'use client'`): botão + `useTransition` + toast "X grupos criados, Y já cobertos" + `router.refresh()`; texto visível "A IA sugere; revise e edite os grupos criados."
10. **Editar** `src/collections/SearchSynonyms.ts`: `admin.components.beforeListTable: ['/src/admin/components/generate-synonyms-button.tsx#GenerateSynonymsButton']`.
11. **`pnpm --filter @store/front generate:importmap`** e manter o importmap gerado (esquecer quebra o admin em produção). Sem migration (mudança só de `admin`), sem `generate:types`.

## Verificação

- `pnpm --filter @store/front typecheck && pnpm --filter @store/front lint && pnpm --filter @store/front test` (inclui `dedupe.test.ts`).
- Com `ANTHROPIC_API_KEY` no `.env` local, subir o front (3000; porta livre antes, matar ao final): `/admin` → Sinônimos de busca → botão gera grupos; **rodar 2x** e conferir que a 2ª deduplica (`skipped > 0`); editar/excluir um doc gerado funciona; buscar no site por um sinônimo novo encontra o produto.
- Sem a chave: botão mostra erro amigável, nada quebra.
- Rodar a skill `quality-gate`.

## Ao concluir

No `STATE.md`: status `concluída` + **Interface publicada → Etapa 3** (confirmar `lib/ai/anthropic.ts` e exports; versão do SDK instalada; forma de structured output que funcionou — a etapa 4 repete). Commit sugerido (só quando o usuário pedir): `feat(admin): gerador de sinônimos de busca com IA` — incluir o importmap.
