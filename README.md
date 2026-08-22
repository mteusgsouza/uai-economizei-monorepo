# uai-economizei

Monorepo do **uai economizei** — e-commerce completo com site público, CMS/admin
e API de pedidos. O catálogo é gerido no Payload CMS e a operação (pedidos,
clientes, notificações) roda numa API Nest.js separada.

- **Site público** (Next.js) — vitrine, busca, carrinho, checkout, conta do cliente
- **Admin** (Payload CMS, em `/admin`) — catálogo, conteúdo editorial, pedidos e clientes
- **API** (Nest.js) — pedidos, clientes, autenticação Firebase, push, upload, CEP

---

## Stack

| Camada | Tecnologias |
| --- | --- |
| Monorepo | pnpm workspaces + [Turborepo](https://turbo.build) |
| Front | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| CMS | Payload CMS 3 embutido no Next (`@payloadcms/db-postgres`, Lexical, Vercel Blob) |
| UI | shadcn/ui + Tailwind CSS 4, Radix/Base UI, Embla, Sonner, Recharts |
| Estado/dados | TanStack Query, TanStack Form, Zod |
| API | Nest.js 11, class-validator, Prisma 7 |
| Banco | Postgres (Neon) — schema do catálogo pelo Payload, schema transacional pelo Prisma |
| Auth | Firebase Auth (login no front) + Firebase Admin (validação do token na API) |
| Extras | Web Push (VAPID), Vercel Blob (uploads), ViaCEP |
| Deploy | Front na **Vercel**, API no **Render** (`render.yaml`) |

---

## Estrutura

```
apps/
  api/                     Nest.js — pedidos, clientes, auth, push, upload, CEP
  front/                   Next.js + Payload CMS
    app/(front)/           site público (e-commerce)
    app/(front)/bff/       proxy browser -> API Nest (mascara API_URL, allowlist de rotas)
    app/(payload)/         admin em /admin e REST do Payload em /api/*
    src/collections/       Products, Brands, Categories, Promotions, CepShipping,
                           Media, Pages, Posts, ProductDescriptions, Users
    src/globals/           StoreSettings
    src/admin/             views e componentes customizados do admin
    lib/catalog/           leitura do catálogo via Payload Local API
    migrations/            migrations do @payloadcms/db-postgres
packages/
  prisma/                  @workspace/database — Order, Customer, Address, Payment,
                           PushSubscription (o catálogo NÃO vive aqui)
  ui/                      @workspace/ui — componentes shadcn/ui compartilhados
  firebase/                config/tipos do Firebase
  eslint-config/           configs ESLint compartilhadas
  typescript-config/       configs TypeScript compartilhadas
```

### Como os dados fluem

- O **site público** lê o catálogo direto pela **Payload Local API** em server
  components (`lib/catalog/`), com cache/revalidate do Next — sem HTTP no meio.
- O **browser** nunca fala com a API Nest diretamente: passa pelo **BFF**
  (`app/(front)/bff/[...path]`), que esconde a `API_URL` e só deixa passar uma
  allowlist de rotas de cliente. O `Authorization` (ID token do Firebase) é
  repassado; quem valida é a API.
- A **API Nest** consulta produtos do Payload por REST server-to-server
  (`PAYLOAD_API_URL`), apenas para montar pedidos.
- O **admin do Payload** chama a Nest server-side com o header `x-internal-key`
  (`INTERNAL_API_KEY`) — essa chave nunca chega ao client.

---

## Requisitos

- **Node 22** (veja `.node-version`; `engines` exige `>=20`)
- **pnpm 9.15.9** — este projeto usa pnpm, não npm/yarn
- Um Postgres acessível (o projeto usa **Neon**)
- Conta Firebase (Auth), token do Vercel Blob e chaves VAPID para o fluxo completo

> O `.npmrc` fixa `node-linker=hoisted`: a estrutura symlinkada do pnpm quebra o
> empacotamento serverless do Payload na Vercel. Não remova.

---

## Como iniciar

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar as variáveis de ambiente

Copie os exemplos e preencha:

```bash
cp apps/front/.env.example apps/front/.env
```

```bash
cp apps/api/.env.example apps/api/.env
```

**`apps/front/.env`**

| Variável | Para que serve |
| --- | --- |
| `DATABASE_URL` | Postgres do Payload (use `sslmode=verify-full`) |
| `PAYLOAD_SECRET` | Segredo do Payload |
| `API_URL` | URL da API Nest — só server-side (padrão `http://localhost:8080`) |
| `INTERNAL_API_KEY` | Chave compartilhada com a Nest (nunca `NEXT_PUBLIC`) |
| `NEXT_PUBLIC_SITE_URL` | URL pública (robots.txt / sitemap.xml) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob; sem ele os uploads caem no disco local |

**`apps/api/.env`**

| Variável | Para que serve |
| --- | --- |
| `DATABASE_URL` / `DATABASE_URL_UNPOOLED` | Postgres (pooled para a app, unpooled para migrations) |
| `FIREBASE_SERVICE_ACCOUNT` | JSON da service account — **sem ela a API não sobe** |
| `PAYLOAD_API_URL` | REST do Payload (`http://localhost:3000/api`) |
| `INTERNAL_API_KEY` | Mesma chave configurada no front |
| `CORS_ORIGIN` | Origens extras, separadas por vírgula |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Web Push |
| `BLOB_READ_WRITE_TOKEN` | Upload via Vercel Blob |

### 3. Preparar o banco

```bash
pnpm --filter @workspace/database db:migrate:deploy
```

```bash
pnpm --filter @store/front payload migrate
```

### 4. Rodar

Tudo de uma vez (Turborepo):

```bash
pnpm dev
```

Ou separadamente:

```bash
pnpm --filter @store/front dev
```

```bash
pnpm --filter @store/api dev
```

| Serviço | URL |
| --- | --- |
| Site público | http://localhost:3000 |
| Admin do Payload | http://localhost:3000/admin |
| REST do Payload | http://localhost:3000/api |
| API Nest | http://localhost:8080 (health em `/health`) |

> A API só aceita CORS de `http://localhost:3000` por padrão — rode o front
> nessa porta ou o preflight falha.

---

## Scripts

### Raiz (Turborepo)

```bash
pnpm dev
```

```bash
pnpm build
```

```bash
pnpm lint
```

```bash
pnpm typecheck
```

```bash
pnpm format
```

### Front (`@store/front`)

Tipos do Payload — rode após mexer em collections:

```bash
pnpm --filter @store/front generate:types
```

Import map — rode após registrar componentes do admin:

```bash
pnpm --filter @store/front generate:importmap
```

```bash
pnpm --filter @store/front payload migrate:status
```

### Banco (`@workspace/database`)

```bash
pnpm --filter @workspace/database db:migrate:dev
```

```bash
pnpm --filter @workspace/database db:studio
```

### API (`@store/api`)

```bash
pnpm --filter @store/api test
```

```bash
pnpm --filter @store/api test:e2e
```

---

## Endpoints da API

| Rota | Descrição |
| --- | --- |
| `GET /health` | Health check (usado pelo Render) |
| `POST /auth/customer/login`, `GET /auth/customer/me` | Sessão do cliente (Firebase) |
| `GET/PATCH /customers/me` | Perfil do cliente |
| `GET/POST/PATCH/DELETE /customers/me/addresses[/:id]` | Endereços (+ `/default`) |
| `POST /orders`, `GET /orders`, `GET /orders/:id` | Pedidos do cliente |
| `GET /orders/all`, `GET /orders/summary`, `GET/PATCH /orders/admin/:id` | Área administrativa |
| `GET /notifications/public-key`, `POST/DELETE /notifications/subscriptions` | Web Push |
| `POST /products/sync-prices`, `POST /products/sync-subcategories` | Sincronizações com o Payload |
| `GET /cep/lookup` | Consulta de CEP / frete |
| `POST /upload` | Upload para o Vercel Blob |

Rotas administrativas exigem o header `x-internal-key`; as de cliente exigem o
ID token do Firebase em `Authorization`.

---

## Migrations

O banco é Neon e o Payload roda com `push: false` — **nada chega ao banco sem
migration**. O `vercel.json` aponta o build para `ci:build`
(`pnpm payload migrate && next build`): **migration commitada é migration
aplicada no próximo deploy**.

Fluxo padrão:

1. Altere a collection/global em `apps/front/src/`
2. `pnpm --filter @store/front generate:types`
3. `pnpm --filter @store/front payload migrate:create <nome_em_snake_case>`
4. **Leia o SQL gerado** — `DROP COLUMN`/`DROP TABLE`/mudança de tipo perdem dados
5. `payload migrate:status` → só a nova deve estar pendente
6. `payload migrate` → aplica

`migrate:create` gera **dois** arquivos (`.ts` + `.json` de snapshot).
**Commite os dois** — sem o snapshot, a próxima migration nasce errada. Se o
gerador perguntar *"is column X created or renamed from another column?"*, o
snapshot está desatualizado: pare e conserte antes de continuar.

Nunca ligue `push: true` nem altere o schema direto no dashboard do Neon.

Detalhes completos em [CLAUDE.md](CLAUDE.md).

---

## Convenções

- **pnpm** sempre; adicione componentes shadcn com a flag `-c`:
  `pnpm dlx shadcn@latest add button -c apps/front`
- Importe do pacote UI: `import { Button } from "@workspace/ui/components/button"`
- **Não** importe `@workspace/ui/globals.css` dentro do grupo `(payload)` — o
  preflight do Tailwind quebra o CSS do admin
- Commits em [Conventional Commits](https://www.conventionalcommits.org/)
- Evite `any`; respeite os limites de cada workspace (`apps/*`, `packages/*`)

---

## Deploy

| Alvo | Onde | Como |
| --- | --- | --- |
| Front + Payload | Vercel | `apps/front/vercel.json` → `pnpm run ci:build` (migrate + build) |
| API | Render | `render.yaml` — build filtrado (`@store/api...`), health em `/health`, `NODE_VERSION=22` |

O Render pula o deploy quando o commit toca apenas `apps/front/**` ou
`packages/ui/**`.
