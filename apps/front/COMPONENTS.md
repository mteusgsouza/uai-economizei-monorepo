# Components — @store/front

Catálogo dos componentes do frontend, organizados por domínio.

## Estrutura

```
components/
├── ui/                  # Primitivos atômicos reutilizáveis
├── product/             # Cards, grids e seções de produto
├── cart/                # Carrinho e resumo do pedido
├── category/            # Categorias e seções por categoria
├── checkout/            # Formulários e informações de checkout
├── layout/              # Header, footer, hero, temas, scroll
└── auth/                # Guardas de autenticação e sign-in
```

---

## UI (primitivos atômicos)

### `ProductImage`
Renderiza imagem de produto com fallback automático "Sem imagem".

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `src` | `string \| null \| undefined` | — | URL da imagem |
| `alt` | `string` | — | Texto alternativo |
| `aspectRatio` | `"3/4" \| "2/3" \| "1/1" \| "4/3"` | `"3/4"` | Proporção do container |
| `className` | `string?` | — | Classes extras no container |
| `imageClassName` | `string?` | — | Classes extras na tag `<img>` |
| `priority` | `boolean?` | `false` | Remove `loading="lazy"` |
| `sizes` | `string?` | — | Atributo `sizes` para responsividade |

**Estados:** loaded (imagem visível), empty (placeholder "Sem imagem").

```tsx
import { ProductImage } from "@/components/ui/product-image";

<ProductImage src={product.productMainImg} alt={product.name} />
<ProductImage src={img.url} alt="Foto 1" aspectRatio="1/1" />
```

---

### `QuantitySelector`
Seletor de quantidade com botões +/-.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `value` | `number` | — | Quantidade atual |
| `onChange` | `(v: number) => void` | — | Callback ao alterar |
| `min` | `number?` | `1` | Valor mínimo (botão - desabilitado) |
| `max` | `number?` | `Infinity` | Valor máximo (botão + desabilitado) |
| `size` | `"sm" \| "md"` | `"md"` | Tamanho (sm = compacto para carrinho) |

**Estados:** normal, at-min (botão - disabled), at-max (botão + disabled).

```tsx
import { QuantitySelector } from "@/components/ui/quantity-selector";

<QuantitySelector value={qty} onChange={setQty} />
<QuantitySelector value={qty} onChange={setQty} max={product.stock} size="sm" />
```

---

### `SectionHeader`
Cabeçalho de seção com título, descrição opcional e link "Ver todos".

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `title` | `string` | — | Título da seção |
| `description` | `string?` | — | Subtítulo descritivo |
| `href` | `string?` | — | Link "Ver todos" |
| `linkLabel` | `string?` | `"Ver todos"` | Rótulo do link |

```tsx
import { SectionHeader } from "@/components/ui/section-header";

<SectionHeader
  title="Mais Vendidos"
  description="Os produtos mais populares."
  href="/mais-vendidos"
/>
```

---

### `ProductGridSkeleton`
Skeleton placeholder para grid de produtos durante carregamento.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `count` | `number?` | `8` | Quantidade de cards skeleton |

```tsx
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";

{isLoading && <ProductGridSkeleton count={4} />}
```

---

## Product

### `ProductCard`
Card de produto com imagem, nome, marca, preço e wishlist. Usa `ProductImage` internamente.

| Prop | Tipo | Descrição |
|---|---|---|
| `product` | `Product` | Dados do produto |

**Estados:** normal, hover (shadow + wishlist button), sem imagem (fallback).

```tsx
import { ProductCard } from "@/components/product/product-card";

{products.map((p) => <ProductCard key={p.id} product={p} />)}
```

---

### `ProductCardCompact`
Card de produto compacto (150px largura) para scroll horizontal.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `product` | `Product` | — | Dados do produto |
| `aspectRatio` | `"3/4" \| "2/3"` | `"3/4"` | Proporção da imagem |

```tsx
import { ProductCardCompact } from "@/components/product/product-card-compact";

<ProductCardCompact product={product} />
```

---

### `FeaturedProductsSection`
Seção de produtos em destaque com estados de loading, erro e vazio.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `limit` | `number?` | `4` | Máximo de produtos exibidos |
| `filter` | `"new"?` | — | Filtra apenas novidades |

**Estados:** loading (ProductGridSkeleton), error (mensagem + botão retry), empty (mensagem), loaded (grid).

```tsx
import { FeaturedProductsSection } from "@/components/product/featured-products-section";

<FeaturedProductsSection limit={4} />
<FeaturedProductsSection limit={8} filter="new" />
```

---

## Cart

### `CartItemCard`
Linha do carrinho com imagem, nome, quantidade e botão remover.

| Prop | Tipo | Descrição |
|---|---|---|
| `item` | `CartItem` | Item do carrinho (product + quantity) |

**Estados:** normal, último item (sem separador — controlado pelo pai).

```tsx
import { CartItemCard } from "@/components/cart/cart-item-card";

{items.map((item) => <CartItemCard key={item.product.id} item={item} />)}
```

---

### `OrderSummary`
Resumo do pedido com subtotal, frete e total. Botão de finalizar compra.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `shippingLabel` | `string?` | — | Rótulo do frete |
| `shippingCost` | `number?` | `0` | Custo do frete |
| `showShipping` | `boolean?` | `false` | Exibe custo do frete |
| `checkoutHref` | `string?` | `"/carrinho/endereco"` | Rota do botão |
| `buttonLabel` | `string?` | `"Finalizar Compra"` | Rótulo do botão |
| `onAction` | `() => void?` | — | Sobrescreve navegação do botão |

**Estados:** normal, carrinho vazio (botão desabilitado).

```tsx
import { OrderSummary } from "@/components/cart/order-summary";

<OrderSummary />
<OrderSummary showShipping shippingLabel="PAC" shippingCost={29.90} buttonLabel="Pagar" />
```

---

## Category

### `CategoryCard`
Card de categoria com imagem e overlay gradiente.

| Prop | Tipo | Descrição |
|---|---|---|
| `category` | `CategoryWithSubcategories` | Dados da categoria |
| `imageProduct` | `Product \| null?` | Produto para fallback de imagem |
| `className` | `string?` | Classes extras |

**Estados:** com imagem, sem imagem (gradient placeholder).

```tsx
import { CategoryCard } from "@/components/category/category-card";

<CategoryCard category={category} imageProduct={product} />
```

---

### `CategoriesSection`
Seção de categorias com scroll horizontal.

Busca categorias via `useCategories`.

```tsx
import { CategoriesSection } from "@/components/category/categories-section";

<CategoriesSection />
```

---

### `CategoryProductSection`
Seção de produtos filtrados por slug de categoria.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `categorySlug` | `string` | — | Slug da categoria |
| `title` | `string` | — | Título da seção |
| `limit` | `number?` | `4` | Máximo de produtos |

**Estados:** loading (ProductGridSkeleton), empty (renderiza null), loaded (grid).

```tsx
import { CategoryProductSection } from "@/components/category/category-product-section";

<CategoryProductSection categorySlug="eletronicos" title="Eletrônicos" />
```

---

## Layout

| Componente | Arquivo | Descrição |
|---|---|---|
| `SiteHeader` | `layout/site-header.tsx` | Header sticky com nav, busca, carrinho e wishlist |
| `SiteFooter` | `layout/site-footer.tsx` | Footer com links e copyright |
| `HeroSection` | `layout/hero-section.tsx` | Hero da home com carousel |
| `HeroCarousel` | `layout/hero-carousel.tsx` | Carousel de banners (usa Embla) |
| `ThemeProvider` | `layout/theme-provider.tsx` | Provedor next-themes (dark/light) |
| `HorizontalScroll` | `layout/horizontal-scroll.tsx` | Container de scroll horizontal com setas |
| `BrandsSection` | `layout/brands-section.tsx` | Seção de marcas com scroll horizontal |

---

## Auth

| Componente | Arquivo | Descrição |
|---|---|---|
| `RequireAuth` | `auth/auth-guard.tsx` | Redireciona para /login se não autenticado |
| `RedirectIfAuth` | `auth/auth-guard.tsx` | Redireciona para / se já autenticado |
| `GoogleSignInButton` | `auth/google-sign-in-button.tsx` | Botão de sign-in com Google (Firebase) |

---

## Checkout

| Componente | Arquivo | Descrição |
|---|---|---|
| `AddressForm` | `checkout/address-form.tsx` | Formulário de endereço de entrega |
| `ShippingOptions` | `checkout/shipping-options.tsx` | Seleção de opção de frete |
| `PaymentMethodSelector` | `checkout/payment-method-selector.tsx` | Seleção de método de pagamento |
| `CreditCardForm` | `checkout/credit-card-form.tsx` | Formulário de cartão de crédito |
| `PixInfo` | `checkout/pix-info.tsx` | Informações de pagamento PIX |
| `BoletoInfo` | `checkout/boleto-info.tsx` | Informações de pagamento boleto |

---

## Convenções

- **Nome de arquivo:** kebab-case (`product-card.tsx`)
- **Nome de componente:** PascalCase (`ProductCard`)
- **Imports:** alias `@/components/<domain>/<file>` (sem extensão)
- **Primitivos shadcn:** importados de `@workspace/ui/components/<name>`
- **"use client":** obrigatório em componentes com estado, efeitos ou navegação
- **Estados:** todo componente que busca dados deve tratar loading, error, empty e loaded
- **Tipagem:** props com `interface` explícita; proibido `any`
- **Reuso:** antes de criar, verificar se já existe em `components/ui/` ou `packages/ui/`
