# Plano: Payload CMS 3.0 no Monorepo

> **Status:** 📋 Planejado — não iniciado  
> **Data da decisão:** 2026-07-18

## Objetivo

Substituir o CRUD manual de conteúdo (posts, páginas, descrições ricas) por um CMS headless,
usando **Payload CMS 3.0** embutido no `apps/front` existente.

## Motivação

1. **Posts no dashboard são UI-only** — hooks, formulários e rotas existem mas sem modelo
   Prisma, sem API, sem migration. Seria preciso construir tudo do zero.
2. **Necessidade de editor rico** — posts com formatação avançada, embeds de produtos
   no meio do texto, templates de página.
3. **Payload 3.0 é nativo Next.js** — não é um serviço separado, é uma biblioteca que
   adiciona `/admin` e API de conteúdo ao Next.js existente.

## Arquitetura Alvo

```
ANTES                                     DEPOIS
──────                                    ──────
apps/front (Next.js)                      apps/front (Next.js + Payload CMS)
  / → loja                                  / → loja (igual)
  /produtos → loja                          /produtos → loja (igual)
  /login → loja                             /login → loja (igual)
  /carrinho → loja                          /carrinho → loja (igual)
                                            /admin → Payload Admin UI ✨
apps/dashboard (Vite) ❌                    apps/dashboard → 🗑️ removido ao final
apps/api (NestJS) ✅                       apps/api (NestJS) → mantido
apps/cms (NÃO CRIAR) 🚫
```

**Resultado: 2 apps, não 4.** Front + API. Payload não é um app separado.

## Divisão de Responsabilidades

| `apps/front` (Next.js + Payload) | `apps/api` (NestJS + Prisma) |
|---|---|
| Posts, blog, artigos | Pedidos + pagamentos |
| Páginas institucionais customizáveis | Clientes + endereços |
| Templates de página (Payload blocks) | Auth Firebase |
| Editor rico (Lexical) | Notificações push |
| Mídia — upload e redimensionamento | CEP/frete |
| Embed de produtos no texto (bloco customizado) | Catálogo de produtos |
| Descrições ricas dos produtos | Sincronia de preços (Firestore) |
| Admin UI para conteúdo | Regras de negócio complexas |

### Coexistência no banco

- Tabelas Payload → mesmo PostgreSQL (Neon), sem conflito com Prisma
- Tabelas Prisma → continuam sendo gerenciadas pelo `packages/prisma`
- Cada um cria e gerencia suas próprias tabelas

## Collections Payload Planejadas

### Posts
```typescript
{
  slug: 'posts',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText' },  // editor Lexical
    { name: 'publishedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' },
  ],
}
```

### Pages (templates)
```typescript
{
  slug: 'pages',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'template', type: 'select', options: ['default', 'landing', 'faq', 'contact'] },
    { name: 'layout', type: 'blocks', blocks: [
      HeroBlock,
      ContentBlock,
      ProductGridBlock,
      CTABlock,
      FAQBlock,
    ]},
  ],
}
```

### ProductEmbedBlock (bloco customizado no editor)
```typescript
{
  slug: 'product-embed',
  labels: { singular: 'Produto', plural: 'Produtos' },
  fields: [
    { name: 'productId', type: 'text', required: true },
    { name: 'layout', type: 'select', options: ['card', 'inline', 'banner'], defaultValue: 'card' },
  ],
}
```

> **Nota:** O productId referencia o catálogo da API Nest.js (não uma collection Payload).  
> O front faz fetch dos dados do produto via API no momento do render.

## Autenticação

| Sistema | Quem usa | Onde |
|---|---|---|
| **Payload Auth** | Admins/editores de conteúdo | `/admin` |
| **Firebase Auth** | Clientes da loja | `/login`, `/produtos`, `/carrinho` |

Dois sistemas de auth independentes no mesmo domínio. Sem conflito — rotas diferentes, propósitos diferentes.

### Por que Firebase Auth (clientes) + Payload Auth (admins)

**Firebase Auth já está profundamente integrado e funcionando** em todo o monorepo:

| Camada | Arquivo | Função |
|---|---|---|
| Front | `apps/front/lib/auth-context.tsx` | AuthProvider: login, register, logout, Google Sign-In, React Query |
| Front | `apps/front/lib/firebase.ts` | SDK Firebase client-side |
| Front | `apps/front/components/auth/auth-guard.tsx` | RequireAuth + RedirectIfAuth |
| Front | `apps/front/components/auth/google-sign-in-button.tsx` | Google sign-in via popup |
| API | `apps/api/src/auth/firebase-auth.guard.ts` | Guard que verifica Firebase ID tokens |
| API | `apps/api/src/auth/firebase-admin.module.ts` | Inicialização do Firebase Admin SDK |
| API | `apps/api/src/customer-auth/customer-auth.service.ts` | `findOrCreateFromFirebase` → sincroniza com Prisma |
| Prisma | `packages/prisma/schema/models/customer.prisma` | Model `Customer` com `firebaseUid` + `googleId` |

**Custo: $0** — Firebase Auth é gratuito até 50k MAU.

### O que Payload Auth oferece para admins

- Email/senha com bcrypt, JWT em cookie HTTP-only, refresh token automático
- Account lockout (5 tentativas → 10min bloqueio)
- RBAC via campo `role` (admin, editor)
- API keys para server-to-server
- Tudo **nativo, gratuito, zero configuração extra**

### Arquitetura final

```
apps/front (Next.js)
  /admin                        → Payload Auth (HTTP-only cookie payload-token)
  /login, /produtos, /carrinho  → Firebase Auth (Bearer token via sessionStorage)

apps/api (NestJS)
  FirebaseAdminModule + FirebaseAuthGuard → permanecem intactos
  Nenhuma alteração necessária
```

## Consumo do Conteúdo pelo Front

### Server Components (recomendado para páginas públicas)
```typescript
// app/posts/[slug]/page.tsx — Server Component
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const post = await payload.find({
  collection: 'posts',
  where: { slug: { equals: params.slug } },
})
// Renderiza post com ProductEmbedBlock → fetch product data via API
```

### Client Components (para hooks React Query existentes)
```typescript
// hooks/use-posts.ts — Client Component
const { data } = await fetch('/api/posts?where[slug][equals]=...')
// Integra com React Query, mesmo padrão atual
```

## O Que Desaparece

| Item | Motivo |
|---|---|
| `apps/dashboard` (Vite) | Payload Admin UI substitui o CRUD de conteúdo. Layout do dashboard é **convertido** para Next.js e mantido como template admin. |
| Tiptap no dashboard | Payload vem com Lexical (editor mais completo) |
| `use-posts-admin.ts` | Vira config declarativa no Payload |
| `post-form.tsx` | Troca pelo form nativo do Payload |
| Rotas `/dashboard/posts/*` | Substituídas por `/admin/collections/posts` |
| Upload manual p/ Vercel Blob | Payload tem plugin de mídia integrado |

## O Que Permanece Intocado

- `apps/front` — páginas da loja: `/produtos`, `/carrinho`, `/login`, etc.
- `apps/api` — Nest.js com pedidos, clientes, auth Firebase
- `packages/prisma` — schema de negócio (Product, Order, Customer, etc.)
- `packages/ui` — shadcn/ui compartilhado
- `packages/eslint-config` e `packages/typescript-config`

## O Que É Convertido (não descartado)

- Layout do `apps/dashboard` (sidebar, header) → template admin em Next.js
- Páginas customizadas do dashboard (analytics, relatórios) → rotas admin em `apps/front`
- Componentes UI específicos do dashboard → `packages/ui`

## Templates: Loja + Admin

O projeto terá **2 templates** coexistindo no `apps/front`:

| Template | Local | Framework | Função |
|---|---|---|---|
| **Loja** | `apps/front/app/` (rotas públicas) | Next.js App Router | `/`, `/produtos`, `/carrinho`, `/login`, páginas de conteúdo |
| **Admin** | Payload Admin UI + custom pages | Next.js + Payload | `/admin` (Payload nativo) + páginas admin customizadas |

### Reaproveitamento do layout do dashboard

O layout do `apps/dashboard` (sidebar, header, estrutura de navegação) será **convertido de Vite para Next.js**, não descartado. A conversão é necessária porque:

- O Payload Admin UI cobre CRUD de conteúdo (posts, páginas, mídia) nativamente
- Páginas customizadas do dashboard (ex: dashboard de vendas, relatórios, gestão de pedidos) são convertidas para Next.js e mantidas como rotas admin
- Componentes de UI do dashboard que não existirem no `packages/ui` são migrados para lá

### O que converte vs o que o Payload substitui

| Componente Vite | Destino | Nota |
|---|---|---|
| Layout (sidebar + header) | Template admin Next.js | Convertido, estrutura de navegação mantida |
| Páginas de posts/páginas | Payload Admin UI | CRUD nativo do Payload substitui |
| Páginas de produtos, categorias, marcas | Payload Admin UI | Gerenciadas via collections Payload |
| Dashboard de vendas, relatórios | Convertido p/ Next.js | Payload não cobre analytics |
| Gestão de pedidos | Convertido p/ Next.js | Pedidos continuam no NestJS |
| Componentes UI reutilizáveis | `packages/ui` | Centralizar no design system |

## Descrições de Produtos

As descrições dos produtos migram para o Payload como **rich text** usando o editor Lexical.

### Motivação

- O campo `Product.description` atual no Prisma é texto plano (sem formatação)
- Com Payload, descrições ganham: negrito, itálico, listas, headings, imagens inline, embeds de produtos relacionados
- O editor Lexical do Payload é superior ao Tiptap que estava planejado para o dashboard

### Arquitetura

```
Product no Prisma (NestJS)         Product Description no Payload
├── id                             ├── productId (referência externa)
├── name                           ├── description (richText — Lexical)
├── price                          ├── features (richText)
├── stock                          └── specs (JSON estruturado)
├── sku
├── images[]
└── categoryId
```

**Front consome:** descrição rica via Payload API (Server Component) + dados de catálogo via NestJS API. As duas chamadas são feitas em paralelo no Server Component.

### Exemplo de consumo

```typescript
// app/produtos/[slug]/page.tsx — Server Component
import { getPayload } from 'payload'
import config from '@payload-config'
import { api } from '@/lib/api'  // HTTP client p/ NestJS

export default async function ProductPage({ params }) {
  const [product, description] = await Promise.all([
    api.get(`/products/${params.slug}`),           // NestJS: preço, estoque
    payload.find({ collection: 'product-descriptions', where: { productId: { equals: params.slug } } }),
  ])
  return <ProductView product={product} description={description} />
}
```

## Estratégia de SEO

SEO é implementado diretamente no front (Next.js), com o plugin `@payloadcms/plugin-seo` como apoio no admin para campos de meta.

### Camadas de SEO

| Camada | O quê | Onde | Exemplo |
|---|---|---|---|
| **Metadata API** | `generateMetadata()` em cada página pública | `apps/front/app/**/page.tsx` | title, description, openGraph, twitter |
| **Payload SEO Plugin** | Campos de meta title/description/og:image no admin | Config das collections Posts/Pages | Editor preenche meta no Payload |
| **Sitemap** | `sitemap.xml` dinâmico | `apps/front/app/sitemap.ts` | Lista posts, páginas, produtos |
| **Robots.txt** | Gerado estaticamente | `apps/front/app/robots.ts` | Allow/disallow crawlers |
| **Structured Data** | JSON-LD | Componentes Server/Client | Product, BreadcrumbList, FAQPage, Article |
| **OG Images** | Open Graph dinâmicas | API route via `ImageResponse` | Imagens de share para posts/produtos |

### Implementação progressiva

| Fase | O quê | Quando |
|---|---|---|
| Metadata base | `generateMetadata()` para páginas estáticas e dinâmicas | Junto com Fase 6 (integração front) |
| Plugin SEO | `@payloadcms/plugin-seo` nas collections Posts/Pages | Junto com Fase 5 (páginas) |
| Sitemap + Robots | Rotas `sitemap.xml` e `robots.txt` | Após Fase 6 |
| Structured Data | JSON-LD para Product, Article, BreadcrumbList, FAQ | Conforme templates são implementados |
| OG Images | `ImageResponse` para posts e produtos | Após Fase 7 (descrições) |

## Plano de Implementação

| Fase | O quê | Esforço estimado |
|------|-------|------------------|
| **1. Setup** | Instalar Payload 3.0 no `apps/front`, conectar PostgreSQL | ~2h |
| **2. Posts** | Collection Posts + admin UI para criação/edição | ~3h |
| **3. Media** | Collection Media + upload de imagens | ~1h |
| **4. ProductEmbed** | Bloco customizado no editor Lexical | ~4h |
| **5. Páginas** | Collection Pages + sistema de templates com blocks | ~3h |
| **6. Integração front** | Páginas públicas consumindo Payload API | ~2h |
| **7. Descrições ricas** | Migrar `Product.description` para rich text via Payload | ~2h |
| **8. Limpeza** | Remover telas de posts/produtos do `apps/dashboard` | ~1h |
| **9. Sunset dashboard** | Se Vite estiver vazio, deletar o workspace | ~30min |

## Decisões Tomadas

- [x] **Manter Firebase Auth para clientes + Payload Auth para admins** — Firebase já está integrado, gratuito, e separado do Payload sem conflito. Payload Auth é nativo, gratuito e cobre todas as necessidades de admin (RBAC, lockout, JWT). Ver seção [Autenticação](#autenticação).
- [x] **Templates de página iniciais: default, landing, faq, contact** — expandir conforme necessidade. Ver seção [Templates](#templates-loja--admin).
- [x] **Descrições de produtos migram para Payload** — usando editor Lexical (rich text). Preço/estoque/SKU permanecem no NestJS + Prisma. Ver seção [Descrições de Produtos](#descrições-de-produtos).
- [x] **SEO reforçado no front** — metadata API do Next.js, sitemap, robots.txt, structured data (JSON-LD), OG images. O plugin `@payloadcms/plugin-seo` serve como apoio no admin. Ver seção [Estratégia de SEO](#estratégia-de-seo).

## Referências

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Payload 3.0 + Next.js](https://payloadcms.com/docs/beta/getting-started/installation)
- [Payload Lexical Editor](https://payloadcms.com/docs/rich-text/overview)
- [Custom Blocks](https://payloadcms.com/docs/fields/blocks)
- [Payload Authentication](https://payloadcms.com/docs/authentication/jwt)
- [@payloadcms/plugin-seo](https://payloadcms.com/docs/plugins/seo)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js Sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [JSON-LD Structured Data](https://schema.org/)
