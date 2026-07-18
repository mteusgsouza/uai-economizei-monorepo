---
name: quality-gate
description: Gate de qualidade obrigatório para revisar e testar implementações no monorepo. Use SEMPRE após implementar ou alterar código (features, fixes, refactors) e ANTES de finalizar a tarefa ou commitar — valida SOLID, lint, typecheck, testes, tipagem forte com types globais do Prisma, limite de 150 linhas por arquivo e reutilização de componentes.
---

# Quality Gate

Checklist obrigatório antes de considerar qualquer implementação concluída. Nenhuma tarefa está finalizada enquanto todos os itens abaixo não passarem.

## 1. Revisão de código (SOLID)

Revise cada função/classe criada ou alterada contra os princípios SOLID:

- **S — Single Responsibility**: cada função, classe, service, hook ou componente faz UMA coisa. Se a descrição precisa de "e" ("busca E formata E salva"), divida.
- **O — Open/Closed**: prefira extensão via props, composição, injeção de dependência e configuração em vez de modificar código existente com `if`/`switch` crescentes.
- **L — Liskov Substitution**: implementações de uma interface/classe base devem ser intercambiáveis sem quebrar quem consome.
- **I — Interface Segregation**: interfaces e props enxutas e específicas. Não force consumidores a depender de campos que não usam; divida types/DTOs grandes.
- **D — Dependency Inversion**: dependa de abstrações. Na API Nest.js, use injeção de dependência (providers) — nunca instancie dependências diretamente com `new` dentro de services.

Regras complementares:

- **Proibido `any`** — tipagem explícita ou inferida, sempre.
- Nomes descritivos; sem código morto, `console.log` esquecido ou comentários redundantes.

## 2. Tipagem forte (types globais do Prisma)

- Os types gerados pelo Prisma em `@workspace/database` são a **fonte única de verdade** para models, enums e payloads. Importe-os em qualquer workspace (API, dashboard, front):
  - Models e enums: `import { PaymentMethod, type Product } from "@workspace/database"`.
  - Helpers do namespace `Prisma`: `Prisma.ProductWhereInput`, `Prisma.OrderUpdateInput`, etc.
- **Nunca replique tipagem** que já existe no Prisma — não redeclare interfaces de model/enum manualmente em apps. Duplicar tipagem é redundância e dessincroniza com o schema.
- Para variações, **derive** dos types do Prisma em vez de redeclarar campos:
  - Utilitários TS: `Pick`, `Omit`, `Partial`.
  - Payloads com relações: `Prisma.OrderGetPayload<{ include: { items: true } }>`.
- **Componentes fortemente tipados**: toda prop com `type`/`interface` explícito (referenciando types do Prisma quando representam dados do banco), handlers e eventos tipados, genéricos (`<T>`) em componentes/hooks reutilizáveis. Proibido `any` e props implícitas.
- DTOs da API podem validar entrada (class-validator/zod), mas devem referenciar os enums/types do Prisma quando o campo existe no schema (ex.: `PaymentMethod`), nunca literais duplicados.

## 3. Limite de 150 linhas por arquivo

- Arquivos **não devem passar de 150 linhas**, salvo se for **extremamente necessário** (ex.: schema, migration, arquivo de configuração gerado).
- Ao se aproximar do limite, extraia:
  - **Dashboard/Front**: subcomponentes, hooks customizados (`use-*.ts`), utils, constantes.
  - **API**: services auxiliares, DTOs em arquivos próprios, helpers.
- Se exceder 150 linhas, justifique explicitamente ao usuário por que a divisão não era viável.

## 4. Reutilização de componentes

- **Antes de criar qualquer componente, hook ou util, procure um existente**: `packages/ui/src/components`, `apps/*/src/components`, `apps/*/src/hooks`, `apps/*/src/lib`.
- Zero redundância: se a lógica/UI já existe, reutilize ou generalize a existente — nunca duplique.
- Lógica/UI usada em mais de um app pertence a `packages/ui` (ou pacote compartilhado), não copiada entre apps.
- Componentes devem ser **reutilizáveis e editáveis**:
  - Configuráveis via props (variants, sizes, `className` com `cn()`), seguindo o padrão shadcn/ui.
  - Use composição (`children`, slots) em vez de props booleanas que multiplicam variações.
  - Sem valores hardcoded de negócio dentro de componentes visuais — receba por props.
  - Novos componentes shadcn: `pnpm dlx shadcn@latest add <component> -c <workspace>` e importe de `@workspace/ui/components/<component>`.

## 5. Verificação automatizada (obrigatória)

Execute nos workspaces afetados e corrija até tudo passar — não finalize com erros:

```bash
# Lint (obrigatório em qualquer alteração)
pnpm --filter @store/api lint
pnpm --filter @store/dashboard lint
pnpm --filter @store/front lint
# ou na raiz: pnpm lint

# Typecheck
pnpm typecheck

# Testes (obrigatório na API; crie/atualize testes para o que implementou)
pnpm --filter @store/api test
```

- Alterou a API → rode lint + testes da API. Alterou dashboard/front → rode lint + typecheck do workspace.
- Teste que quebrou por mudança de comportamento intencional: atualize o teste. Quebrou por bug: corrija o código.
- Se subir algum processo para verificação manual, **encerre-o imediatamente após verificar**.

## 6. Relatório final

Ao concluir, reporte de forma honesta:

- ✅/❌ de cada verificação executada (lint, typecheck, testes) com o resultado real.
- Arquivos que excederam 150 linhas e a justificativa.
- Componentes/hooks reutilizados ou extraídos para reuso.
- Nunca declare a tarefa concluída com alguma verificação falhando ou não executada.
