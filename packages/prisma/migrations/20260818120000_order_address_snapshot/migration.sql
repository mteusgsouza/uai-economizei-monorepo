-- Duas mudanças que andam juntas.
--
-- 1) O pedido passa a guardar a própria cópia do endereço, como era no Firebase.
--    Antes ele apontava para uma linha de "Address" do cliente: editar o endereço
--    reescrevia o histórico e excluir zerava o endereço de entrega do pedido
--    (o FK era ON DELETE SET NULL).
--
-- 2) Sem esse vínculo, os endereços repetidos podem ser fundidos. Eles nasceram
--    da importação do Firebase, que criava uma linha por pedido e outra a cada
--    re-execução. O `fingerprint` calculado aqui espelha, campo a campo, a função
--    `addressFingerprint()` em packages/prisma/src/address-parts.ts — mudou lá,
--    muda aqui.
--
-- Sem volta: as linhas fundidas não são recuperáveis.

-- AlterTable: a cópia do endereço no pedido
ALTER TABLE "Order" ADD COLUMN     "address" JSONB;

-- O snapshot vem do endereço que o pedido referenciava — antes de fundir nada.
UPDATE "Order" o
SET "address" = jsonb_build_object(
  'street', a."street",
  'number', a."number",
  'complement', a."complement",
  'neighborhood', a."neighborhood",
  'city', a."city",
  'state', a."state",
  'postalCode', a."postalCode",
  'country', a."country"
)
FROM "Address" a
WHERE o."addressId" = a."id";

-- DropForeignKey / AlterTable: o vínculo direto sai de cena
ALTER TABLE "Order" DROP CONSTRAINT "Order_addressId_fkey";
ALTER TABLE "Order" DROP COLUMN "addressId";

-- AlterTable: a agenda de endereços do cliente
ALTER TABLE "Address" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fingerprint" TEXT;

-- CEP só com dígitos, demais campos sem espaço sobrando, tudo minúsculo.
-- `country` fica de fora — "BR" e "Brasil" são o mesmo país.
UPDATE "Address" SET "fingerprint" = lower(
  regexp_replace(coalesce("postalCode", ''), '[^0-9]', '', 'g') || '|' ||
  btrim(regexp_replace(coalesce("street", ''), '\s+', ' ', 'g')) || '|' ||
  btrim(regexp_replace(coalesce("number", ''), '\s+', ' ', 'g')) || '|' ||
  btrim(regexp_replace(coalesce("complement", ''), '\s+', ' ', 'g')) || '|' ||
  btrim(regexp_replace(coalesce("neighborhood", ''), '\s+', ' ', 'g')) || '|' ||
  btrim(regexp_replace(coalesce("city", ''), '\s+', ' ', 'g')) || '|' ||
  btrim(regexp_replace(coalesce("state", ''), '\s+', ' ', 'g'))
);

-- Sobra uma linha por endereço distinto; ninguém mais aponta para as outras.
DELETE FROM "Address" a
USING (
  SELECT "customerId", "fingerprint", MIN("id") AS keep_id
  FROM "Address"
  GROUP BY "customerId", "fingerprint"
) c
WHERE a."customerId" = c."customerId"
  AND a."fingerprint" = c."fingerprint"
  AND a."id" <> c.keep_id;

-- Padrão = o mais recente de cada cliente, que é o critério que a lista usava.
UPDATE "Address" SET "isDefault" = true
WHERE "id" IN (
  SELECT DISTINCT ON ("customerId") "id"
  FROM "Address"
  ORDER BY "customerId", "createdAt" DESC, "id" DESC
);

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "fingerprint" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Address_customerId_fingerprint_key" ON "Address"("customerId", "fingerprint");
