import type { BeforeListTableServerProps } from 'payload'

import { GenerateSynonymsButton } from './generate-synonyms-button'

// Fuso fixo: o servidor da Vercel roda em UTC e a loja lê no horário de Brasília.
const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
})

/**
 * Barra acima da lista de sinônimos: botão da IA e quando a lista mudou pela
 * última vez (geração, edição ou cadastro manual). O botão dá `router.refresh()`
 * ao terminar, então a data se atualiza sozinha.
 */
export async function SynonymsToolbar({ payload }: BeforeListTableServerProps) {
  const { docs } = await payload.find({
    collection: 'search-synonyms',
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
    pagination: false,
    select: { updatedAt: true },
  })
  const updatedAt = docs[0]?.updatedAt

  return (
    <GenerateSynonymsButton
      lastUpdatedLabel={
        updatedAt
          ? `Última atualização: ${dateTime.format(new Date(updatedAt))}`
          : 'Nenhum sinônimo cadastrado ainda.'
      }
    />
  )
}
