-- Três mudanças aditivas que entram juntas.
--
-- 1) `Order.stockApplied` — o estoque passa a ser baixado quando o admin
--    confirma o pedido, e devolvido no cancelamento. A coluna é o que torna a
--    operação idempotente: sem ela, CONFIRMED -> SHIPPED -> CONFIRMED baixaria
--    duas vezes.
--
-- 2) `WishlistItem` — favoritos deixam o localStorage e passam a viver na
--    conta. `productId` aponta para o Payload sem FK, como em `OrderItem`.
--
-- 3) `PushSubscription.scope` + `firebaseUid` opcional — o sino de novos
--    pedidos é do admin, que autentica pelo Payload e não tem uid do Firebase.
--    O `scope` é o que impede o envio de virar broadcast para clientes.
--
-- Nada destrutivo: as duas colunas novas têm default e a única alteração de
-- coluna existente é o afrouxamento de NOT NULL.

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "stockApplied" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" SERIAL NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WishlistItem_customerId_idx" ON "WishlistItem"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_customerId_productId_key" ON "WishlistItem"("customerId", "productId");

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "PushScope" AS ENUM ('ADMIN', 'CUSTOMER');

-- AlterTable
ALTER TABLE "PushSubscription" ADD COLUMN     "scope" "PushScope" NOT NULL DEFAULT 'CUSTOMER',
ALTER COLUMN "firebaseUid" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "PushSubscription_scope_idx" ON "PushSubscription"("scope");
