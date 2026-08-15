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
- Migrations do Payload seguem o processo da seção **Migrations** — leia antes de mexer em qualquer collection ou global

Para adicionar componentes shadcn/ui em um workspace específico, use a flag -c:
    shadcn add [component] -c apps/front
    shadcn add [component] -c packages/ui

# Migrations

O banco é Neon (Postgres) e o schema do catálogo é do Payload, com `push: false` —
ou seja, **nada chega ao banco sem uma migration**. O `vercel.json` aponta o build
para `ci:build`, que é `pnpm payload migrate && next build`: **migration commitada é
migration aplicada no próximo deploy**, automaticamente. Uma migration errada não
quebra só o banco, quebra o deploy.

## Fluxo padrão

1. Altere a collection ou o global em `apps/front/src/`
2. `pnpm --filter @store/front generate:types`
3. `pnpm --filter @store/front payload migrate:create <nome_em_snake_case>`
4. **Leia o SQL gerado** antes de qualquer outra coisa (checklist abaixo)
5. `pnpm --filter @store/front payload migrate:status` — confirma que só a nova está pendente
6. `pnpm --filter @store/front payload migrate` — aplica

Nunca escreva a migration à mão quando o `migrate:create` puder gerá-la: os nomes de
coluna vêm do schema Drizzle do Payload (`campaign` + `name` vira `campaign_name`,
um `group` vira prefixo, um `array` vira tabela própria) e errar um nome só aparece
em runtime, quando o admin tenta salvar.

## A regra do snapshot

`migrate:create` gera **dois** arquivos: o `.ts` com o SQL e o `.json` com o snapshot
do schema. **Commite os dois.** O `.json` não é subproduto — é o estado "anterior"
que o Payload usa para diferenciar e gerar a *próxima* migration.

Sem o snapshot, o gerador compara o schema atual com um estado defasado e passa a
propor mudanças que já estão no banco. Foi o que aconteceu com
`20260726_200500_products_subcategory_slug`, commitada só como `.ts`: toda geração
seguinte de migration ficou travada num prompt até o snapshot ser reconstruído.

Se precisar mesmo de uma migration escrita à mão (uma migração de dados, por
exemplo), gere primeiro com `migrate:create` e edite o `.ts` — mantendo o `.json`
que veio junto.

## Se o `migrate:create` fizer uma pergunta

Um prompt do tipo *"is column X created or renamed from another column?"* é **sintoma
de snapshot desatualizado**, não uma pergunta legítima sobre o que você acabou de
fazer. Responder no chute produz SQL para uma mudança que já está aplicada, e a
migration quebra no deploy.

Pare, conserte o snapshot e rode de novo. Para reconstruir: copie o último `.json`
válido, aplique nele a transformação que a migration órfã fez (a mão, editando as
colunas), encadeie `prevId` = `id` do anterior e gere um `id` novo. Depois disso o
`migrate:create` volta a rodar sem perguntar.

## Antes de aplicar — revise o SQL

- **Aditivo é seguro**: `CREATE TABLE`, `ADD COLUMN ... DEFAULT`. Em Postgres, adicionar
  coluna com default não reescreve a tabela
- **`DROP COLUMN`, `DROP TABLE` e mudança de tipo perdem dados** — se a coluna tem
  conteúdo, a migration precisa copiar antes de derrubar
- Coluna nova em tabela com dados precisa aceitar `NULL` ou ter `DEFAULT`
- Confira se o `down` desfaz de verdade o que o `up` fez
- Se o SQL mexer em algo que você não alterou, o snapshot está fora de sincronia —
  volte para a seção acima

## Validar antes do banco principal

Só existe a branch `main` no Neon hoje. Para mudanças destrutivas ou grandes, crie uma
branch no dashboard do Neon e valide nela primeiro:

    DATABASE_URL="<url-da-branch>" pnpm --filter @store/front payload migrate

Para mudanças puramente aditivas, `migrate:status` limpo + revisão do SQL cobrem bem.

## Nunca

- Ligar `push: true` no `postgresAdapter` — sincroniza o schema por fora e dessincroniza
  os snapshots
- Alterar o schema direto no Neon (SQL manual, editor do dashboard)

As duas coisas deixam o banco à frente dos snapshots, que é exatamente a situação que
faz a próxima migration nascer errada.
