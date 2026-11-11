# Plano: IA na busca + chatbot de ajuda

Plano aprovado em 2026-11-10, segmentado para execução por agentes/sessões separados.
Cada etapa é **autossuficiente**: o agente lê só o arquivo da sua etapa + o `STATE.md`.

## Como executar uma etapa

1. Leia `STATE.md`. Confira que os **pré-requisitos** da sua etapa estão `concluída` e que nenhuma outra etapa está `em andamento` neste checkout (uma etapa por vez).
2. Marque sua etapa como `em andamento` no `STATE.md` (tabela + seu nome de sessão).
3. Execute o arquivo da etapa.
4. Rode a skill `quality-gate` do repo.
5. Atualize o `STATE.md`: status `concluída`, preencha a seção **Interface publicada** da sua etapa (o que as próximas precisam saber) e anote desvios do plano.
6. **Não commite** — deixe no working tree e informe o que mudou (regra do repo).

## Etapas e dependências

| Etapa | Arquivo | Depende de | Entrega |
|---|---|---|---|
| 1 | `etapa-1-campos-atendimento.md` | — | Campos de contato no StoreSettings + migration |
| 2 | `etapa-2-chatbot-ajuda.md` | 1 | Chat shell compartilhado + widget de ajuda sem IA |
| 3 | `etapa-3-gerador-sinonimos.md` | — | Infra de IA + botão gerador de sinônimos no admin |
| 4 | `etapa-4-assistente-busca.md` | 2 e 3 | Assistente IA de fallback da busca |

Etapas 1→2 e 3 são independentes entre si, mas **não rode duas etapas ao mesmo tempo** neste checkout (todas editam `STATE.md` e a 3 mexe em `package.json`/lockfile).

## Decisões fixas (não rediscutir)

- Modelo: **Claude Haiku 5.5** (`claude-haiku-5-5`) via `@anthropic-ai/sdk`, chave `ANTHROPIC_API_KEY` server-only no front.
- Sinônimos gerados por **botão no admin** (server action), nunca script CLI.
- O assistente de busca **nunca inventa produto/preço**: só conversa e chama tools; os cards vêm de `getSearchResults`.
- Abuso no assistente: cota servidor de 10 msgs/hora por navegador → 429 → UI degrada para a busca normal sem IA.
- Commit por etapa, Conventional Commits, **só quando o usuário pedir**.
