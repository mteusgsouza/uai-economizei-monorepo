export const formatBRL = (cents: number): string =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('pt-BR')

export const formatDateTime = (value: string): string =>
  new Date(value).toLocaleString('pt-BR')
