import type { GlobalConfig } from 'payload'

import { revalidateGlobalAfterChange } from '../collections/hooks/revalidate'
import { appearanceField } from './fields/appearance'
import { benefitsField } from './fields/benefits'
import { cardFeesField } from './fields/card-fees'
import { homeStatsField } from './fields/home-stats'

/**
 * Regras comerciais da loja inteira — o que não pertence a um produto só.
 *
 * Estes valores mudam o que o cliente paga: o site mostra e a Nest cobra a
 * partir daqui (`apps/api/src/common/pricing.ts` lê este global pelo REST).
 * Mexer aqui é mexer no caixa.
 *
 * Os textos da vitrine que a loja edita (régua e faixa de vantagens) estão em
 * `fields/`, para este arquivo continuar sendo só as regras.
 */
export const StoreSettings: GlobalConfig = {
  slug: 'store-settings',
  label: 'Configurações da loja',
  hooks: {
    afterChange: [revalidateGlobalAfterChange('store-settings')],
  },
  access: {
    read: () => true,
  },
  admin: {
    group: 'Configurações',
  },
  // Abas sem `name`: só agrupam a tela, não aninham nada no schema — nenhuma
  // migration. A divisão separa o que a Nest cobra (Pagamento, Frete) do que é
  // texto de vitrine (Vitrine): assuntos com consequências muito diferentes que
  // hoje dividem o mesmo formulário corrido.
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Pagamento',
          description:
            'Estes valores mudam o que o cliente paga: o site mostra e a API cobra a partir daqui.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'pixDiscountPercent',
                  type: 'number',
                  label: 'Desconto no PIX (%)',
                  min: 0,
                  max: 100,
                  defaultValue: 10,
                  admin: {
                    description: 'Vale para os produtos marcados com "Desconto no PIX".',
                  },
                },
                {
                  name: 'maxInstallments',
                  type: 'number',
                  label: 'Parcelas no cartão',
                  min: 1,
                  max: 24,
                  defaultValue: 12,
                },
              ],
            },
            cardFeesField,
          ],
        },
        {
          label: 'Frete',
          description:
            'A entrega continua limitada às faixas de "Regiões de Frete" — nada aqui amplia a área atendida.',
          fields: [
            {
              name: 'freeShipping',
              type: 'group',
              label: 'Frete grátis',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Oferecer frete grátis acima de um valor',
                  defaultValue: false,
                },
                {
                  name: 'minValue',
                  type: 'number',
                  label: 'Valor mínimo do pedido (centavos)',
                  min: 0,
                  defaultValue: 19900,
                  admin: {
                    description: 'O carrinho mostra quanto falta para chegar lá.',
                    condition: (_, siblingData) => siblingData?.enabled === true,
                    // Mesmo tratamento do preço do produto: mostra o valor em
                    // reais ao lado do campo em centavos.
                    components: { afterInput: ['/src/admin/fields/price-hint.tsx#PriceHint'] },
                  },
                },
                {
                  name: 'area',
                  type: 'text',
                  label: 'Onde o frete grátis vale',
                  defaultValue: 'Belo Horizonte e região',
                  admin: {
                    description:
                      'A entrega segue limitada às faixas da tabela de CEP — este texto só diz ao cliente qual é a área.',
                    condition: (_, siblingData) => siblingData?.enabled === true,
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Retirada',
          description:
            'Onde o cliente busca o pedido quando escolhe retirada no balcão em vez de entrega.',
          fields: [
            {
              name: 'pickupAddress',
              type: 'group',
              label: 'Endereço da loja',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'street', type: 'text', label: 'Rua' },
                    { name: 'number', type: 'text', label: 'Número' },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'complement', type: 'text', label: 'Complemento' },
                    { name: 'neighborhood', type: 'text', label: 'Bairro' },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'city', type: 'text', label: 'Cidade' },
                    { name: 'state', type: 'text', label: 'UF', maxLength: 2 },
                    { name: 'postalCode', type: 'text', label: 'CEP' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Vitrine',
          description: 'Só textos e números exibidos na home — nada aqui altera preço.',
          fields: [
            {
              name: 'campaign',
              type: 'group',
              label: 'Campanha em cartaz',
              admin: {
                description:
                  'Assina o topo da vitrine da home. O período ao lado é calculado das datas das promoções ativas.',
              },
              fields: [{ name: 'name', type: 'text', label: 'Nome' }],
            },
            homeStatsField,
            benefitsField,
          ],
        },
        {
          label: 'Aparência',
          description:
            'Reveste a vitrine inteira. Não mexe em preço nem em regra de venda.',
          fields: [appearanceField],
        },
      ],
    },
  ],
}
