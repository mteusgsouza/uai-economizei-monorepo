# STATE — estado global do plano

> Fonte de verdade do progresso. Todo agente **lê este arquivo antes de começar**
> e o **atualiza ao iniciar e ao terminar** sua etapa. Uma etapa por vez neste checkout.

## Status

| Etapa | Status | Sessão/agente | Última atualização | Commit |
|---|---|---|---|---|
| 1 — Campos de atendimento | concluída (migration aplicada no Neon; aba Atendimento não conferida no browser) | sessão principal | 2026-11-10 | — |
| 2 — Chatbot de ajuda | concluída (typecheck/lint ok; não conferido no browser) | sessão principal | 2026-11-10 | — |
| 3 — Gerador de sinônimos | pendente | — | — | — |
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
_(preencher: confirmação de que `apps/front/lib/ai/anthropic.ts` existe com `AI_MODEL`, `aiEnabled`, `getAnthropicClient()`; versão instalada do `@anthropic-ai/sdk`; forma de structured output/caching que funcionou, para a 4 repetir)_

### Etapa 4
_(preencher: contrato final da rota `POST /assistente-busca`; limites efetivos da cota)_

## Desvios e notas

_(qualquer decisão tomada diferente do arquivo da etapa, com o porquê — para o
usuário e os próximos agentes não serem surpreendidos)_
