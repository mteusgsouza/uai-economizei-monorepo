import type { Field } from 'payload'

/**
 * Aparência da vitrine.
 *
 * O sistema Industry é mono: existe **um** acento, e dele sai uma rampa de nove
 * tons usada em link, tag, hover e foco. Por isso o admin guarda só a cor base —
 * a rampa é derivada no site (`app/(front)/theme.ts`). Guardar os nove tons aqui
 * seria pedir à loja que mantivesse uma escala perceptual à mão.
 *
 * Em branco, nada é injetado e valem os valores de `brand.css` — o padrão do
 * design, sem regressão.
 */
export const appearanceField: Field = {
  name: 'theme',
  type: 'group',
  label: 'Aparência',
  admin: {
    description: 'Em branco, a loja usa as cores e o formato originais do design.',
  },
  fields: [
    {
      name: 'primaryColor',
      type: 'text',
      label: 'Cor primária',
      admin: {
        description:
          'O único acento do sistema: botão principal, links, etiquetas, foco e o duotone das fotos. A escala de tons claros e escuros sai desta cor.',
        components: { Field: '/src/admin/fields/color-field.tsx#ColorField' },
      },
      validate: (value: unknown) => {
        if (!value) return true
        return /^#[0-9a-f]{6}$/i.test(String(value))
          ? true
          : 'Use uma cor em hexadecimal de seis dígitos, como #5980a6.'
      },
    },
    {
      name: 'radius',
      type: 'select',
      label: 'Cantos',
      defaultValue: 'square',
      options: [
        { label: 'Retos — o wireframe original', value: 'square' },
        { label: 'Levemente suavizados', value: 'soft' },
        { label: 'Arredondados', value: 'round' },
      ],
      admin: {
        description:
          'O design nasceu com cantos retos: card, figura e botão são desenhos de linha. Arredondar descaracteriza a direção, mas é reversível.',
      },
    },
  ],
}
