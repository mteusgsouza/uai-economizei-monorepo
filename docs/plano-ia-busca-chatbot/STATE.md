# STATE — estado global do plano

> Fonte de verdade do progresso. Todo agente **lê este arquivo antes de começar**
> e o **atualiza ao iniciar e ao terminar** sua etapa. Uma etapa por vez neste checkout.

## Status

| Etapa | Status | Sessão/agente | Última atualização | Commit |
|---|---|---|---|---|
| 1 — Campos de atendimento | concluída (migration aplicada no Neon; aba Atendimento não conferida no browser) | sessão principal | 2026-11-10 | — |
| 2 — Chatbot de ajuda | concluída (typecheck/lint ok; não conferido no browser) | sessão principal | 2026-11-10 | — |
| 3 — Gerador de sinônimos | concluída (typecheck/lint/test ok; testado no browser até a API, que recusou por falta de créditos — geração real e dedupe na 2ª rodada não conferidos) | sessão principal | 2026-11-11 | — |
| 4 — Assistente de busca | concluída (typecheck/lint/test ok; testado de ponta a ponta com DeepSeek: conversa, preços, recusa, 400, 429 e widget no browser) | sessão principal | 2026-11-11 | — |

Valores de status: `pendente` · `em andamento` · `concluída` · `bloqueada (motivo)`.

## Interface publicada por etapa

Preencha ao concluir. É o contrato que as etapas seguintes consomem — escreva o que
elas precisam saber, não um diário do que você fez.

### Etapa 1 → consumida pela 2
- `StoreSettings.support: SupportChannels` (`lib/commerce.ts`) = `{ whatsapp, phone, email, hours }`, todos `string | null`.
- Migration: `20261110_231832_add_store_support_fields` (`.ts` + `.json`), só `ADD COLUMN support_*`. Aplicada no Neon.
- Chave de cache: `catalog-store-settings-v8`.

### Etapa 2 → consumida pela 4
Em `apps/front/components/chat/`:
- `ChatShell` (`chat-shell.tsx`, client): `{ variant: "floating" | "inline"; title: string; children; onClose?; onBack?; footer?: ReactNode; className? }`. `floating` = fixed `bottom-20 right-4 z-40` (largura total no mobile, w-96 no desktop, altura `min(32rem,75dvh)`); `inline` = `w-full` no fluxo (altura vem do `className`). Corpo é `flex-col gap-3 overflow-y-auto p-3`; `footer` é onde entra o campo de mensagem.
- `ChatBubble` (`chat-bubbles.tsx`, sem "use client"): `{ role: "user" | "assistant"; children; className? }` — `whitespace-pre-line`.
- `ChatOptionButton`: props de `Button` sem `variant` (aceita `asChild`, `onClick`).
- `ChatLauncher`: `{ open; onToggle; label }`, fixo `bottom-4 right-4 z-40`.
- `HelpWidget` em `help-widget/help-widget.tsx`, montado em `app/(front)/layout.tsx` ao lado do `CookieConsent`. A etapa 4 pode mudar o título/estado do launcher se quiser unificar.

### Etapa 3 → consumida pela 4
- `apps/front/lib/ai/anthropic.ts`: `AI_MODEL = "claude-haiku-5-5"`, `aiEnabled`, `getAnthropicClient()` (singleton). Sem `import 'server-only'` (pacote não instalado; não adicionei dependência). O cliente fixa `baseURL: "https://api.anthropic.com"` e `authToken: null` (ver Desvios) e manda `anthropic-workspace-id` se `ANTHROPIC_WORKSPACE_ID` existir. **Use sempre `getAnthropicClient()`**, nunca `new Anthropic()` solto.
- `@anthropic-ai/sdk` 1.8.0. `.env.example` tem `ANTHROPIC_API_KEY` e `ANTHROPIC_WORKSPACE_ID` (opcional); as duas estão no `globalEnv` do `turbo.json`.
- Structured output que funcionou no typecheck: `client.messages.parse({ model, max_tokens, system, messages, output_config: { effort: 'low', format: zodOutputFormat(Schema) } })` e ler `response.parsed_output` (checar `stop_reason === 'refusal'` antes). **Importe `z` de `'zod/v4'`** (o zod do repo é 3.25; `zodOutputFormat` não aceita o `z` raiz).
- `lib/ai/synonyms/*` (dedupe, prompt) e `src/admin/actions/generate-synonyms.ts` (`ensureAdmin` + `aiEnabled`) são o padrão a copiar.

### Etapa 4
- Rota `app/(front)/assistente-busca/route.ts` → `POST /assistente-busca`. Body (zod): `{ term: string 1–120, messages: { role: 'user'|'assistant', content: string 1–300 }[] 1–6 }`, primeira e última fala do cliente. Respostas: 200 `{ message, products: Product[] ≤6 }` · 400 `{ error }` · 429 cota (navegador ou IP) · 503 sem chave de IA ou falha ao contar o IP · 500 genérico. `maxDuration = 30`.
- Cota: 10 mensagens/hora por navegador (`lib/ai/search-assistant/quota.ts`), cookie HttpOnly `ue_ai_quota` assinado com HMAC de `PAYLOAD_SECRET`, `path=/assistente-busca`. Conta também quando o modelo falha (500). Cookie inválido = janela nova — por isso existe a segunda trava:
- Limite por IP: 30 mensagens/hora (`lib/ai/search-assistant/ip-limit.ts`), contado na coleção oculta `ai-rate-limits` (tabela `ai_rate_limits`, migration `20261112_005443_ai_rate_limits`) por upsert SQL atômico. Guarda HMAC do IP, nunca o IP. IP lido de `x-real-ip`/`x-forwarded-for` (confiáveis só atrás da Vercel). Falha do banco → 503 (não chama o modelo). Testado: rajada paralela de 35 sem cookie → 30×200 e 5×429.
- Modelo: `claude-haiku-5-5`, `max_tokens 700`, effort `low`, até 4 rodadas de tools (`search_products`, `list_taxonomy`); breakpoint de cache no system (tools vêm antes, cobertos pelo mesmo prefixo).
- Client: `components/product/search-assistant/` (`search-assistant.tsx`, `use-search-assistant.ts`, `search-assistant-results.tsx`). 5 turnos do cliente por conversa; manda só os últimos 5 itens. 429/503 ou fim dos turnos → grava `ue-search-assistant-off` no `sessionStorage` e desativa o input orientando a busca normal.
- Página: aparece com `searchTerm` + `aiEnabled`; aberto quando a busca não achou nada, recolhido (botão-convite) quando `search.mode === 'any'`.

## Desvios e notas

_(qualquer decisão tomada diferente do arquivo da etapa, com o porquê — para o
usuário e os próximos agentes não serem surpreendidos)_

- **Etapa 3 — `baseURL` fixo no cliente.** A máquina de dev tem `ANTHROPIC_BASE_URL`/`ANTHROPIC_AUTH_TOKEN` de usuário apontando para o DeepSeek (configuração de CLI); o SDK honra essas variáveis e mandava a chave da loja para lá (401). Fixar no cliente isola o app do ambiente.
- **Etapa 3 — chave `sk-ant-usr-` não serve sem workspace**: a API devolve 400 pedindo `anthropic-workspace-id`. Use chave de workspace (`sk-ant-api03-`) ou preencha `ANTHROPIC_WORKSPACE_ID`.
- **Etapa 3 — IA sem créditos (2026-11-11).** O usuário não vai comprar créditos de API (o plano Claude Pro não inclui API). Os recursos de IA ficam implementados mas inativos na prática: sem chave o botão mostra o aviso de configuração. **Isso também afeta a etapa 4** — o assistente de busca depende da mesma chave; confirme com o usuário antes de implementá-la. Erros da API (créditos, chave inválida) só aparecem no log do servidor; no admin o toast é genérico.
- **Etapa 4 — widget em pasta própria.** O plano previa `components/product/search-assistant.tsx` único; virou a pasta `components/product/search-assistant/` com hook e grid separados para respeitar o limite de 150 linhas.
- **Provedor DeepSeek (2026-11-11).** Sem créditos na Anthropic, `lib/ai/anthropic.ts` passou a usar o endpoint da DeepSeek compatível com a Messages API quando `DEEPSEEK_API_KEY` existe (prioridade sobre `ANTHROPIC_API_KEY`), modelo `deepseek-flash`, mesmo SDK. `AI_PROVIDER` e `AI_MODEL` são exportados; `aiEnabled` vale para qualquer das duas chaves. A DeepSeek ignora `cache_control`, `strict` e `is_error` e **não tem saída estruturada**. Por isso o gerador de sinônimos chama `lib/ai/synonyms/request.ts`: na Anthropic usa `messages.parse` + `zodOutputFormat`; na DeepSeek pede JSON no prompt e valida com zod (`parseGroupsJson`). Geração testada direto contra a DeepSeek (9 grupos válidos); o botão do admin não foi clicado, para não gravar sinônimos no banco principal.
- **Catálogo com produtos duplicados.** Vários produtos existem 2–3 vezes com o mesmo nome e ids diferentes (ex.: "Headset Gamer Warrior 2.0 … Ph244": 329, 663, 1086). O assistente e a busca normal mostram as cópias; é dado, não código.
