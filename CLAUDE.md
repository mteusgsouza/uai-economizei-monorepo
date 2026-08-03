# Contexto do projeto

Este projeto é um monorepo para o sistema uai-economizei: API Nest.js e Front Next.js com Payload CMS embutido (site público + admin).

# Estrutura do monorepo

- `apps/api` — Nest.js API (pedidos, clientes, auth Firebase, notificações push, upload, CEP)
- `apps/front` — Next.js (App Router) com Payload CMS 3 embutido:
  - `app/(front)` — site público (e-commerce)
  - `app/(payload)` — admin do Payload em `/admin` e REST em `/api/*`
  - `src/collections` — catálogo e conteúdo (Products, Brands, Categories, Banners, CepShipping, Media, Pages, Posts, ProductDescriptions, Users)
  - `migrations/` — migrations do `@payloadcms/db-postgres` (Neon; `push: false`)
- `packages/prisma` — Prisma (somente Order, Customer, PushSubscription — o catálogo vive no Payload)
- `packages/ui` — Componentes shadcn/ui reutilizáveis
- `packages/eslint-config` — Configurações ESLint compartilhadas
- `packages/typescript-config` — Configurações TypeScript compartilhadas

# Arquitetura de dados

- Site público lê o catálogo via **Payload Local API** em server components (`lib/catalog/`), com cache/revalidate do Next
- A Nest acessa produtos do Payload via REST server-to-server (`PAYLOAD_API_URL`) apenas para pedidos
- Admin do Payload acessa a Nest server-side com o header `x-internal-key` (`INTERNAL_API_KEY`, nunca no client)

# Regras

- Use sempre **pnpm** como gerenciador de pacotes
- **Commite apenas quando solicitado** — deixe as alterações no working tree e informe o que mudou; quem decide o momento de commitar é o usuário
- Commits no padrão **Conventional Commits**
- **NUNCA** mantenha a API ou qualquer projeto rodando em background sem solicitação explícita do usuário. Se precisar iniciar algo para testes, encerre o processo logo após a verificação. Sempre mate processos de desenvolvimento (Nest, Next, tsx watch, etc.) ao finalizar a tarefa
- **Antes de subir algo, verifique se já não está rodando** (`Get-NetTCPConnection -LocalPort 3000 -State Listen`). Se a porta já estiver ocupada, reutilize o processo existente em vez de abrir outra instância — subir o mesmo serviço várias vezes deixa processos órfãos e cria confusão sobre qual build está no ar
- **Feche o que você abriu**: toda porta/processo iniciado para teste é responsabilidade de quem iniciou — encerre ao terminar e confirme que as portas ficaram livres (3000 do front, 8080 da API, e qualquer porta alternativa usada). Nunca deixe o ambiente do usuário com processos órfãos
- A API aceita CORS apenas de `http://localhost:3000` (e `:5173`, do dashboard removido) — testes no browser precisam rodar o front na 3000, senão o preflight falha
- Evite usar `any` na tipagem TypeScript
- Estilização com **shadcn/ui** — siga as convenções de nomeação e estrutura de arquivos
- Respeite a estrutura do monorepo: crie/edite arquivos dentro do workspace apropriado (`apps/*` ou `packages/*`)
- Não adicione dependências desnecessárias; reutilize as já existentes no monorepo
- Importe componentes do pacote `ui`: `import { Button } from "@workspace/ui/components/button"`
- **Não** importe `@workspace/ui/globals.css` dentro do grupo `(payload)` — o preflight do Tailwind quebra o CSS do admin do Payload
- Após registrar/alterar componentes do admin do Payload, rode `pnpm --filter @store/front generate:importmap`; após alterar collections, rode `generate:types`
- Migrations do Payload: criar com `payload migrate:create` e validar em um branch do Neon antes de aplicar no banco principal

Para adicionar componentes shadcn/ui em um workspace específico, use a flag -c:
    shadcn add [component] -c apps/front
    shadcn add [component] -c packages/ui
