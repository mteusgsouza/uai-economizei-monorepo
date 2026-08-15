---
name: orders-import-errors-customers-not-found
description: 3 pedidos que falharam na importação porque os clientes não existem no banco Neon — precisam ser cadastrados manualmente
metadata:
  type: reference
---

# Pedidos com erro na importação (clientes não encontrados)

Data da importação: 2026-07-12

Estes 3 pedidos do Firestore falharam porque o email do cliente não existe na tabela `Customer` do Neon:

| Ordem Firestore | Cliente | Email | UID Firebase |
|---|---|---|---|
| `J4b2IhxVNPTX4kpKxCPu` | Gabriel campolina | gabrielcampolinabarcelos@gmail.com | `9E2h6ziEI1SzhAvn5w7tS0JYoFI2` |
| `K0lgv7c97TwxjES27wqd` | Marcos Nunes Sanguinete | sanguinete1000@gmail.com | `6BR4j3hw4DZ6UsKslAjCzni4ZBx1` |
| `YSq7NxWbBPtHXlxpp0Jk` | Fernando Evangelista | fernando33633880@gmail.com | `pFsqbLBGQ2Q38BGY1uIHmTf8wwC2` |

## Para corrigir

1. Importar esses clientes do Firestore (coleção `users`) para o Neon executando:
   ```
   cd packages/prisma && npx tsx scripts/import-firebase.ts
   ```
   (importação completa — a fase 3 de customers vai criar esses 3 que faltam)
   
   Ou cadastrar manualmente no banco com os dados acima.

2. Depois re-importar só os pedidos:
   ```
   cd packages/prisma && npx tsx scripts/import-firebase.ts --orders-only --delete-orders
   ```

**How to apply:** Cadastrar os 3 clientes faltantes (via re-importação ou manual) e depois rodar `--orders-only --delete-orders` para importar esses 3 pedidos.
