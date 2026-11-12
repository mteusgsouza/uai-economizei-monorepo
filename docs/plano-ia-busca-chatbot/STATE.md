# STATE — estado global do plano

> Fonte de verdade do progresso. Todo agente **lê este arquivo antes de começar**
> e o **atualiza ao iniciar e ao terminar** sua etapa. Uma etapa por vez neste checkout.

## Status

| Etapa | Status | Sessão/agente | Última atualização | Commit |
|---|---|---|---|---|
| 1 — Campos de atendimento | concluída (migration aplicada no Neon; aba Atendimento não conferida no browser) | sessão principal | 2026-11-10 | — |
| 2 — Chatbot de ajuda | concluída (typecheck/lint ok; não conferido no browser) | sessão principal | 2026-11-10 | — |
| 3 — Gerador de sinônimos | concluída (typecheck/lint/test ok; testado no browser até a API, que recusou por falta de créditos — geração real e dedupe na 2ª rodada não conferidos) | sessão principal | 2026-11-11 | — |
| 4 — Assistente de busca | pendente | — | — | — |

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
_(preencher: contrato final da rota `POST /assistente-busca`; limites efetivos da cota)_

## Desvios e notas

_(qualquer decisão tomada diferente do arquivo da etapa, com o porquê — para o
usuário e os próximos agentes não serem surpreendidos)_

- **Etapa 3 — `baseURL` fixo no cliente.** A máquina de dev tem `ANTHROPIC_BASE_URL`/`ANTHROPIC_AUTH_TOKEN` de usuário apontando para o DeepSeek (configuração de CLI); o SDK honra essas variáveis e mandava a chave da loja para lá (401). Fixar no cliente isola o app do ambiente.
- **Etapa 3 — chave `sk-ant-usr-` não serve sem workspace**: a API devolve 400 pedindo `anthropic-workspace-id`. Use chave de workspace (`sk-ant-api03-`) ou preencha `ANTHROPIC_WORKSPACE_ID`.
- **Etapa 3 — IA sem créditos (2026-11-11).** O usuário não vai comprar créditos de API (o plano Claude Pro não inclui API). Os recursos de IA ficam implementados mas inativos na prática: sem chave o botão mostra o aviso de configuração. **Isso também afeta a etapa 4** — o assistente de busca depende da mesma chave; confirme com o usuário antes de implementá-la. Erros da API (créditos, chave inválida) só aparecem no log do servidor; no admin o toast é genérico.
