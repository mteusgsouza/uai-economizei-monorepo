# Contexto do projeto

Este projeto é um monorepo para o sistema bookstore: API Nest.js, Dashboard Vite, Front Next.js.

# Estrutura do monorepo

- `apps/api` — Nest.js API (backend)
- `apps/dashboard` — Vite + React (dashboard administrativo)
- `apps/front` — Next.js (frontend público)
- `packages/prisma` — Prisma schema, migrations e cliente compartilhado
- `packages/ui` — Componentes shadcn/ui reutilizáveis
- `packages/eslint-config` — Configurações ESLint compartilhadas
- `packages/typescript-config` — Configurações TypeScript compartilhadas

# Regras

- Use sempre **pnpm** como gerenciador de pacotes
- Commits no padrão **Conventional Commits**
- Evite usar `any` na tipagem TypeScript
- Estilização com **shadcn/ui** — siga as convenções de nomeação e estrutura de arquivos
- Respeite a estrutura do monorepo: crie/edite arquivos dentro do workspace apropriado (`apps/*` ou `packages/*`)
- Não adicione dependências desnecessárias; reutilize as já existentes no monorepo
- Para adicionar componentes shadcn/ui: `pnpm dlx shadcn@latest add <component> -c apps/web`
- Importe componentes do pacote `ui`: `import { Button } from "@workspace/ui/components/button"`

To use shadcn in a specific workspace, use the -c flag:
    shadcn add [component] -c apps/dashboard
    shadcn add [component] -c apps/front
    shadcn add [component] -c packages/ui