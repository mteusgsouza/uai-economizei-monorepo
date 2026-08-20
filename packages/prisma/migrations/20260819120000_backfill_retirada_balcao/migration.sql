-- Retirada no balcão nunca foi gravada: a coluna existe desde o começo, o filtro
-- do admin sempre usou ela, e nenhum dos 763 pedidos estava marcado. Quem
-- retirava aparecia como entrega no endereço da própria loja
-- (Rua Judith Binatti, 181 — CEP 31270-250), o que a listagem do dashboard não
-- tinha como separar.
--
-- Aqui a flag passa a valer sozinha. Tudo no CEP da loja é retirada, inclusive as
-- três variações de digitação do mesmo lugar, mais os pedidos que ficaram sem
-- endereço nenhum. São 223 no total.
--
-- Sem volta: o endereço da loja gravado nesses pedidos é apagado junto.

-- O endereço guardado nesses pedidos é o da própria loja, não uma entrega.
-- Zerando junto, `address IS NULL` ⇔ `retiraBalcao` vira invariante — que é o que
-- os pedidos novos passam a gravar.
UPDATE "Order"
SET "retiraBalcao" = true,
    "address" = NULL
WHERE regexp_replace(coalesce("address"->>'postalCode', ''), '[^0-9]', '', 'g') = '31270250'
   OR "address" IS NULL;

-- Endereço de loja não é endereço de entrega de ninguém: sai da agenda do cliente
-- que o tinha salvo (veio da importação antiga, que copiava o endereço do pedido).
DELETE FROM "Address"
WHERE regexp_replace("postalCode", '[^0-9]', '', 'g') = '31270250'
  AND btrim("number") = '181';

-- Se a linha apagada era a padrão do cliente, o mais recente que sobrou assume —
-- mesma regra que a Nest aplica ao excluir um endereço pela tela.
UPDATE "Address" SET "isDefault" = true
WHERE "id" IN (
  SELECT DISTINCT ON ("customerId") "id"
  FROM "Address"
  WHERE "customerId" NOT IN (SELECT "customerId" FROM "Address" WHERE "isDefault")
  ORDER BY "customerId", "createdAt" DESC, "id" DESC
);
