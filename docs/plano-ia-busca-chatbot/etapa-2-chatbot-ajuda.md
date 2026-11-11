# Etapa 2 — Chat shell + chatbot de ajuda (sem IA)

**Objetivo:** widget flutuante global no site com menu predefinido — última compra +
status, pedidos, contato com a loja, retirada no balcão. Zero IA. Também nasce aqui o
shell visual de chat que a etapa 4 reutiliza.
**Depende de:** etapa 1 concluída (campos `support` no settings — confira no `STATE.md`,
seção *Interface publicada → Etapa 1*). **Workspace:** `apps/front`. **Antes de começar e ao terminar:** atualize o `STATE.md`.

## Contexto mínimo

- Layout raiz público: `app/(front)/layout.tsx` — providers (AuthProvider, ReactQueryProvider, StoreSettingsProvider...) e, no fim, `<CookieConsent />` (único client component global hoje; usa `z-50`). O widget entra ao lado dele.
- Auth do cliente: `useAuth()` de `lib/auth-context.tsx`; CTA de login segue o padrão de `components/auth/auth-guard.tsx` + `lib/auth-redirect.ts`.
- Pedidos: `useOrders(enabled)` em `hooks/use-orders.ts` (React Query via proxy `/bff`; a API já retorna do mais novo para o mais antigo → última compra = primeiro item). Labels/formatadores prontos em `components/account/order-status.ts*` (`statusLabel`, `tagVariant`, `formatOrderDate`, `orderTotal`) e tipo em `types/order.ts`.
- Settings no client: `useStoreSettings()` de `lib/store-settings-context.tsx` (tem `support` após a etapa 1 e `pickupAddress` desde sempre). Formatador de endereço: `lib/address.ts` (`addressLines()`).
- UI: shadcn/ui de `@workspace/ui` (`import { Button } from "@workspace/ui/components/button"`), ícones lucide, estilo sóbrio do design system (referência visual: `components/layout/cookie-consent.tsx`). Máx ~150 linhas por arquivo, sem `any`.

## Tarefas

Shell compartilhado em `components/chat/` (será reusado pela etapa 4 — API limpa):
1. `chat-shell.tsx` (~90 l): moldura — header (título + fechar opcional), área rolável, rodapé opcional; prop `variant: 'floating' | 'inline'` (floating = card fixo bottom-right no desktop, largura total no mobile; inline = card no fluxo da página).
2. `chat-bubbles.tsx` (~60 l): `ChatBubble` (user/assistant) + `ChatOptionButton` (opção de menu, `Button variant="outline"`).
3. `chat-launcher.tsx` (~50 l): botão flutuante redondo `fixed bottom-4 right-4 z-40` (abaixo do cookie banner), ícone `MessageCircle`, `aria-label`, controla aberto/fechado.

Widget em `components/chat/help-widget/` (tudo `"use client"`):
4. `help-widget.tsx` (~80 l): launcher + shell floating; estado `view: 'menu' | 'lastOrder' | 'orders' | 'contact' | 'pickup'` com voltar.
5. `menu.tsx` (~50 l): opções condicionais — "Minha última compra"; "Status dos meus pedidos" (texto curto + `Link` para `/pedidos`); "Falar com a loja" (só se `support` tem ao menos um canal); "Retirada na loja" (só se `pickupAddress` existe).
6. `last-order.tsx` (~90 l): deslogado → mensagem + CTA de login; logado → `useOrders(open && isAuthenticated)` (nada busca com o painel fechado), renderiza nº/data/total/status com os helpers de `order-status` + link "ver detalhes" para `/pedidos`. Estados loading/erro/vazio.
7. `contact.tsx` (~60 l): âncoras `https://wa.me/<dígitos>` (`target="_blank" rel="noopener"`), `tel:+<dígitos>`, `mailto:` + `hours` como texto (helper local `onlyDigits`).
8. `pickup.tsx` (~40 l): `pickupAddress` renderizado com `addressLines()`.
9. **Editar** `app/(front)/layout.tsx`: `<HelpWidget />` ao lado de `<CookieConsent />` (dentro dos providers).

## Verificação

- `pnpm --filter @store/front typecheck && pnpm --filter @store/front lint`
- Subir API (8080) + front (3000) — conferir portas livres antes; **matar os dois ao final**:
  - botão flutuante aparece na home; deslogado, "última compra" leva ao CTA de login; logado (Firebase), mostra o pedido com label/tag corretos;
  - contato abre wa.me/tel/mailto; retirada mostra o endereço; sem `support` preenchido, a opção some.
- Rodar a skill `quality-gate`.

## Ao concluir

No `STATE.md`: status `concluída` + **Interface publicada → Etapa 2** (props exatas de `ChatShell`/`ChatBubble`/`ChatOptionButton`, para a etapa 4 reusar sem ler o código inteiro). Commit sugerido (só quando o usuário pedir): `feat(front): chatbot de ajuda com menu de atendimento`.
