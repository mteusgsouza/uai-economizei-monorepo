import type { CollectionConfig } from "payload"

import { authenticatedOrInternalKey } from "../access/internal-key"
import { revalidateAfterChange, revalidateAfterDelete } from "./hooks/revalidate"

const imageField = { Field: "/src/admin/fields/image-url-field.tsx#ImageUrlField" }
const priceHint = { afterInput: ["/src/admin/fields/price-hint.tsx#PriceHint"] }

export const Products: CollectionConfig = {
  slug: "products",
  hooks: {
    afterChange: [revalidateAfterChange("products")],
    afterDelete: [revalidateAfterDelete("products")],
  },
  labels: {
    singular: "Produto",
    plural: "Produtos",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "price", "stock", "brand", "category", "active"],
    components: {
      edit: {
        beforeDocumentControls: ["/src/admin/components/status-pill.tsx#StatusPill"],
      },
    },
  },
  access: {
    read: () => true,
    // A Nest sincroniza preço e subcategoria do Firestore via REST — sem isso
    // o PATCH server-to-server volta 403 e a sincronização não escreve nada.
    update: authenticatedOrInternalKey,
  },
  // Abas sem `name`: agrupam a tela sem aninhar nada no schema — o caminho dos
  // dados continua o mesmo, então não geram migration. A descrição fica na
  // última aba, sozinha: é o campo mais alto e precisa da largura toda.
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Conteúdo",
          fields: [
            {
              name: "productMainImg",
              type: "text",
              label: "Imagem principal (URL)",
              admin: { components: imageField },
            },
            { name: "name", type: "text", required: true, label: "Nome" },
            {
              type: "row",
              fields: [
                { name: "brand", type: "relationship", relationTo: "brands", label: "Marca" },
                {
                  name: "category",
                  type: "relationship",
                  relationTo: "categories",
                  label: "Categoria",
                },
                {
                  name: "subcategory",
                  type: "text",
                  label: "Subcategoria",
                  admin: {
                    components: {
                      Field: "/src/admin/fields/subcategory-field.tsx#SubcategoryField",
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          label: "Preço & estoque",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "price",
                  type: "number",
                  required: true,
                  label: "Preço (centavos)",
                  min: 0,
                  admin: { components: priceHint },
                },
                {
                  name: "paidPrice",
                  type: "number",
                  label: "Preço pago (centavos)",
                  min: 0,
                  admin: { components: priceHint },
                },
                { name: "stock", type: "number", label: "Estoque", min: 0, defaultValue: 0 },
              ],
            },
            {
              name: "discountPercent",
              type: "number",
              label: "Desconto (%)",
              min: 0,
              max: 100,
              defaultValue: 0,
              admin: {
                description:
                  "Abate do preço acima. O site mostra o valor cheio riscado ao lado do preço com desconto — e é o preço com desconto que é cobrado.",
              },
            },
          ],
        },
        {
          label: "Mídia",
          fields: [
            {
              name: "productImages",
              type: "array",
              label: "Imagens adicionais",
              labels: { singular: "Imagem", plural: "Imagens" },
              admin: { initCollapsed: true },
              fields: [
                { name: "name", type: "text", label: "Nome" },
                {
                  name: "url",
                  type: "text",
                  required: true,
                  label: "URL",
                  admin: { components: imageField },
                },
              ],
            },
          ],
        },
        {
          label: "Descrição",
          fields: [
            {
              name: "description",
              type: "code",
              label: "Descrição",
              admin: {
                language: "html",
                description:
                  "Use a aba Visual para escrever e formatar, ou a aba HTML para colar código pronto.",
                components: { Field: "/src/admin/fields/html-editor/index.tsx#HtmlEditorField" },
              },
            },
          ],
        },
      ],
    },
    // Status: sempre visível na lateral, fora do fluxo de cadastro
    {
      name: "active",
      type: "checkbox",
      label: "Ativo",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
    {
      name: "pixDiscount",
      type: "checkbox",
      label: "Desconto no PIX",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Aplica a porcentagem definida em Configurações da loja.",
      },
    },
    // Estado de conservação, não "novidade de catálogo" — veio do Firebase como
    // texto ("novo"/"usado"). O nome `isNew` ficou por compatibilidade com a
    // sincronização da Nest; a loja só destaca o caso informativo (usado).
    {
      name: "isNew",
      type: "checkbox",
      label: "Produto novo",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Desmarque para anunciar como usado.",
      },
    },
  ],
}
