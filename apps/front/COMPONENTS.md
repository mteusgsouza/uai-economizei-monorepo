# Components — @store/front

Catálogo dos componentes do storefront, organizados por domínio. A linguagem
visual é o design system **Industry**: fundo claro, aço como único acento,
cantos retos e objetos desenhados como wireframe.

## Estrutura

```
components/
├── ui/                  # Primitivos atômicos reutilizáveis
├── product/             # Cards, filtros e painel de compra
├── cart/                # Sacola, gaveta e resumo do pedido
├── category/            # Índice e vitrines de categoria
├── checkout/            # Etapas, formulários e meios de pagamento
├── account/             # Conta, endereços e pedidos do cliente
├── layout/              # Barra, gavetas, rodapé, hero e faixas
├── cms/ + rich-text/    # Blocos e texto do Payload
└── auth/                # Guardas de autenticação e sign-in
```

## Gramática visual

Três classes de `app/(front)/brand.css` carregam o sistema e são aplicadas
direto no `className` — não há componente wrapper para elas:

| Classe | O que faz |
|---|---|
| `blueprint` | Moldura de fio de cabelo, canto reto. Todo card e figura usa. |
| `duotone` | Lava a imagem no acento (`mix-blend-mode: color`). |
| `pcard` / `ccell` | Célula de produto / de índice, com o hover tingido no aço. |

Rótulos de ficha técnica passam pelo `<Mono>`; nunca escreva `font-mono
uppercase tracking-[…]` na mão.

---

## UI (primitivos atômicos)

### `Mono`
Rótulo monoespaçado, caixa-alta, `letter-spacing: .14em`. Metadado apenas —
breadcrumb, contagem, preço PIX, período. Nunca para texto corrido.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `as` | `ElementType` | `"span"` | Tag renderizada (`div`, `p`, `nav`…) |

### `Tag`
Etiqueta quadrada tingida na rampa do aço.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `variant` | `"accent" \| "neutral" \| "outline" \| "solid"` | `"accent"` | Tinta |
| `as` | `ElementType` | `"span"` | Tag renderizada |

### `Segmented`
Escolha única numa moldura só — ordenação, abas, filtro de status.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `options` | `{ value, label }[]` | — | Células |
| `value` / `onChange` | `T` / `(v: T) => void` | — | Controlado |
| `block` | `boolean` | `false` | Divide a largura por igual |

### `AddToCartButton`
O botão de compra com os três estados do sistema: disponível, `Adicionando…`
com spinner e `Indisponível` desabilitado. **Use este** em vez de chamar
`addItem` de um `<Button>` solto.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `product` | `Product` | — | Produto a adicionar |
| `quantity` | `number` | `1` | Quantidade |
| `label` | `string` | `"Adicionar"` | Rótulo do estado normal |
| `size` | `"default" \| "sm" \| "lg"` | `"default"` | Altura |

### `ProductImage`
Imagem com fallback mudo (ícone esmaecido) quando não há URL ou ela falha.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `src` | `string \| null \| undefined` | — | URL |
| `alt` | `string` | — | Texto alternativo |
| `aspectRatio` | `"3/4" \| "2/3" \| "1/1" \| "4/3" \| "16/9"` | `"1/1"` | Proporção |
| `priority` / `sizes` | `boolean` / `string` | — | Repassados ao `next/image` |

### `BlueprintSkeleton` e `LoadBar`
`sk` (bloco tingido com varredura) e a barra de 2px sob o cabeçalho.

### `ProductGridSkeleton`
Grade de cartões em esqueleto — a moldura já desenhada, só o miolo tingido.

| Prop | Tipo | Padrão |
|---|---|---|
| `count` | `number` | `8` |
| `className` | `string?` | — |

### `RouteLoading`
Esqueleto padrão de rota: `LoadBar` + blocos de breadcrumb e título. O miolo
específico entra como `children`. É o corpo dos `loading.tsx`.

### `EmptyState`
O vazio como objeto desenhado: moldura, título condensado e uma saída.

| Prop | Tipo | Descrição |
|---|---|---|
| `title` / `description` | `string` | Texto |
| `actionLabel` / `actionHref` | `string?` | Botão de saída |

### `QuantitySelector`, `SectionHeader`, `PaginationNav`
Seletor `seg` de quantidade, cabeçalho de seção (kicker mono + h3 + link) e a
paginação em botões-ícone.

---

## Product

| Componente | Arquivo | Descrição |
|---|---|---|
| `ProductCard` | `product/product-card.tsx` | Cartão da vitrine: figura duotone, taxonomia mono, preço/PIX/parcela e `AddToCartButton` |
| `ProductCardCompact` | `product/product-card-compact.tsx` | Variante de uma linha, usada em `/marcas` e no embed de texto |
| `WishlistCard` | `product/wishlist-card.tsx` | Produto salvo: coração preenchido remove, variante sem estoque |
| `ProductPurchasePanel` | `product/product-purchase-panel.tsx` | Coluna de compra da ficha do produto |
| `ProductGallery` | `product/product-gallery.tsx` | Miniaturas + figura principal |
| `ProductDetailSections` | `product/product-detail-sections.tsx` | Descrição e ficha técnica (omitida sem conteúdo) |
| `ShowcasePage` | `product/showcase-page.tsx` | Enquadramento das vitrines simples (novidades, mais vendidos) |
| `ShippingEstimate` | `product/shipping-estimate.tsx` | Caixa de CEP com o prazo |
| `filters/*` | `product/filters/` | Sidebar, chips, faixa de preço, ordenação e barra mobile |

`ProductCard` recebe `pixDiscountPercent` e `maxInstallments` das configurações
da loja; sem eles, a linha de PIX e a de parcela não aparecem.

---

## Account

| Componente | Arquivo | Descrição |
|---|---|---|
| `AccountShell` | `account/account-shell.tsx` | Enquadramento das telas de conta + breadcrumb |
| `AccountSidebar` | `account/account-sidebar.tsx` | Cartão de perfil e menu de células |
| `AccountStats` | `account/account-stats.tsx` | Em trânsito / pedidos no ano / entregues |
| `ProfileForm` | `account/profile-form.tsx` | `PATCH /customers/me` (nome, sobrenome, celular) |
| `AddressList` | `account/address-list.tsx` | Lista e criação de endereços |
| `OrderCard` | `account/order-card.tsx` | Pedido completo: cabeçalho, itens e acompanhamento |
| `OrderTimeline` | `account/order-timeline.tsx` | Etapas derivadas do `OrderStatus` |
| `order-status.ts` | `account/order-status.ts` | Rótulos, total cobrado, método de pagamento e filtros |

Sem modelo, portanto ausentes: economia acumulada, cupons, alerta de preço e
código de rastreio real.

---

## Cart e Checkout

| Componente | Arquivo | Descrição |
|---|---|---|
| `CartDrawer` / `CartDrawerItem` | `cart/` | Sacola lateral com progresso de frete grátis |
| `CartItemCard` | `cart/cart-item-card.tsx` | Item na página do carrinho |
| `OrderSummary` | `cart/order-summary.tsx` | Subtotal, frete, desconto PIX e total |
| `FreeShippingBar` | `cart/free-shipping-bar.tsx` | Barra de progresso do frete grátis |
| `CheckoutShell` / `CheckoutSteps` | `checkout/` | Cabeçalho enxuto e as 3 etapas |
| `AddressForm` | `checkout/address-form.tsx` | Endereço com busca por CEP (reusado em `/conta`) |
| `ShippingOptions`, `PaymentMethodSelector`, `CreditCardForm`, `PixInfo`, `BoletoInfo` | `checkout/` | Frete e meios de pagamento |

---

## Layout

| Componente | Arquivo | Descrição |
|---|---|---|
| `SiteShell` | `layout/site-shell.tsx` | Chrome de toda rota pública (barra + faixa + rodapé) |
| `SiteHeader` | `layout/site-header.tsx` | Barra com megamenu, busca, conta, favoritos e carrinho |
| `AccountMenu` | `layout/account-menu.tsx` | Menu da conta no hover (dados, pedidos, favoritos, sair) |
| `MegaMenu` | `layout/mega-menu.tsx` | Índice de categorias em 4 colunas |
| `MobileNavDrawer` | `layout/mobile-nav-drawer.tsx` | Navegação em gaveta com accordions |
| `PromoCarousel` / `PromoSlide` | `layout/` | Hero de campanha, alimentado pela collection `Promotions` |
| `StatsStrip`, `BenefitsBand`, `BrandsSection`, `SiteFooter`, `Logo`, `SearchField` | `layout/` | Faixas, rodapé e utilitários da barra |

`SiteShell` aceita `showBenefits={false}` — conta, pedidos e checkout não
levam a faixa de benefícios.

`StatsStrip` e `BenefitsBand` são conteúdo editável: a loja monta as duas faixas
no global **Configurações da loja** (régua de destaques e faixa de vantagens), e
`lib/storefront-content.ts` resolve os itens — inclusive os calculados (desconto
do catálogo, parcelas, PIX, frete grátis), que somem sozinhos quando não há o que
anunciar. Sem nada configurado, valem os padrões daquele módulo.

---

## Auth

| Componente | Arquivo | Descrição |
|---|---|---|
| `RequireAuth` | `auth/auth-guard.tsx` | Redireciona para `/login` se não autenticado |
| `RedirectIfAuth` | `auth/auth-guard.tsx` | Redireciona para a origem se já autenticado |
| `AuthShell` / `AuthTabs` | `auth/` | Split aço + card do login e do cadastro |
| `GoogleSignInButton` | `auth/google-sign-in-button.tsx` | Sign-in com Google (Firebase) |

---

## Convenções

- **Nome de arquivo:** kebab-case (`product-card.tsx`)
- **Nome de componente:** PascalCase (`ProductCard`)
- **Imports:** alias `@/components/<domain>/<file>` (sem extensão)
- **Primitivos shadcn:** importados de `@workspace/ui/components/<name>`
- **"use client":** obrigatório em componentes com estado, efeitos ou navegação
- **Estados:** todo componente que busca dados trata loading, empty e loaded
- **Tipagem:** props com `interface` explícita; proibido `any`
- **Reuso:** antes de criar, verificar `components/ui/` e `packages/ui/`
- **Tema:** light-only; não escreva variantes `dark:`
