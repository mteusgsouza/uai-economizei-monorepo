import type { Field } from 'payload'

/**
 * Quem a loja é: o nome que aparece na aba do navegador, na marca, no rodapé e
 * nos dados estruturados que o Google lê.
 *
 * Isto mora no banco, e não em env ou no código, porque é o que diferencia uma
 * loja da outra rodando o mesmo código — e porque é o lojista quem sabe
 * escrever o próprio nome. Cada deploy tem o seu banco; trocar de loja é
 * preencher este formulário, não editar arquivo.
 *
 * Tudo opcional: em branco, o site cai no nome padrão e deriva a marca dele
 * (ver `lib/store-identity.ts`). Uma loja nova mostra "Loja" até preencher,
 * que é um recado melhor do que um nome de outra loja.
 */
export const identityField: Field = {
  name: 'identity',
  type: 'group',
  label: 'Identidade',
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nome da loja',
      admin: {
        description:
          'Usado no título das páginas, na prévia em redes sociais e como vendedor nos dados estruturados do Google.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'logoMark',
          type: 'text',
          label: 'Sigla da marca',
          maxLength: 4,
          admin: {
            description:
              'O quadrado colorido do logo. Em branco, usa as três primeiras letras da primeira palavra do nome.',
          },
        },
        {
          name: 'logoWord',
          type: 'text',
          label: 'Palavra da marca',
          admin: {
            description:
              'O texto grande ao lado do quadrado. Em branco, usa o nome sem a primeira palavra.',
          },
        },
      ],
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Frase do rodapé',
      admin: {
        description: 'Uma linha sob a marca, no rodapé. Ex.: Sua loja online de confiança.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'legalName',
          type: 'text',
          label: 'Razão social',
          admin: { description: 'Assina a linha de copyright do rodapé. Em branco, usa o nome da loja.' },
        },
        {
          name: 'taxId',
          type: 'text',
          label: 'CNPJ',
          admin: { description: 'Aparece no rodapé ao lado do copyright. Em branco, a linha some.' },
        },
      ],
    },
  ],
}
