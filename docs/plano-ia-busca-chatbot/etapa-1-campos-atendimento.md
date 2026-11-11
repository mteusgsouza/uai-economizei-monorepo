# Etapa 1 — Campos de atendimento no StoreSettings

**Objetivo:** o lojista cadastrar WhatsApp, telefone, e-mail e horário de atendimento no
admin do Payload, para o chatbot de ajuda (etapa 2) mostrar ao cliente.
**Depende de:** nada. **Workspace:** `apps/front`. **Antes de começar e ao terminar:** atualize `docs/plano-ia-busca-chatbot/STATE.md`.

## Contexto mínimo

- O global `store-settings` fica em `src/globals/StoreSettings.ts` (~181 linhas, organizado em tabs; campos maiores vivem em arquivos de `src/globals/fields/` — siga esse padrão).
- Banco Neon com `push: false`: **toda** mudança de schema exige migration (processo completo na seção *Migrations* do `CLAUDE.md` da raiz — leia antes).
- O settings chega ao site por `lib/catalog/settings.ts` (mapeia o doc para o tipo `StoreSettings` de `lib/commerce.ts`, com `unstable_cache`) e ao client por `lib/store-settings-context.tsx`.

## Tarefas

1. **Novo** `src/globals/fields/support.ts` (~45 l): exportar um group `support` com:
   - `whatsapp` (text) — descrição "Só números, com DDD e país. Ex.: 5531999999999" (vira link `wa.me/<valor>`)
   - `phone` (text) — para `tel:` (pode ter máscara; quem consome limpa não-dígitos)
   - `email` (text) — para `mailto:`
   - `hours` (text) — ex. "Seg a sex, 9h às 18h"
2. **Editar** `src/globals/StoreSettings.ts`: nova tab sem `name` — `{ label: 'Atendimento', description: 'Canais que o chatbot de ajuda do site mostra ao cliente.', fields: [supportField] }`.
3. `pnpm --filter @store/front generate:types`
4. Migration (ordem importa): `pnpm --filter @store/front payload migrate` (snapshot em dia ANTES) → `payload migrate:create add_store_support_fields` → **revisar o SQL**: deve ser só `ALTER TABLE store_settings ADD COLUMN support_whatsapp/...` (aditivo; qualquer DROP ou pergunta de rename = snapshot defasado, PARE e siga o CLAUDE.md) → manter `.ts` **e** `.json` em `apps/front/migrations/` → `payload migrate`.
5. Plumbing:
   - `lib/commerce.ts`: tipo `StoreSettings` ganha `support: { whatsapp: string | null; phone: string | null; email: string | null; hours: string | null }`.
   - `lib/catalog/settings.ts`: mapear `doc.support?.*` com `?? null`; adicionar `support` ao `FALLBACK`; **bump da chave de cache `catalog-store-settings-v7` → `v8`** (linha ~152 — a regra está comentada no próprio arquivo; esquecer serve objeto sem `support`).
   - `lib/store-settings-context.tsx`: mesmo `support` no `FALLBACK` local.

## Verificação

- `pnpm --filter @store/front typecheck && pnpm --filter @store/front lint`
- Subir o front (porta 3000 — confira antes se já não está em uso; mate o processo ao final): `/admin` → Configurações da loja → aba Atendimento salva e persiste após reload.
- Rodar a skill `quality-gate`.

## Ao concluir

No `STATE.md`: status `concluída` + preencher **Interface publicada → Etapa 1** (shape de `support`, nome da migration, chave de cache nova). Commit sugerido (só quando o usuário pedir): `feat(settings): aba Atendimento com contatos da loja` — incluir migration `.ts` + `.json`.
