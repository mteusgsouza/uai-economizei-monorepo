/**
 * Envia o arquivo pro Media do Payload e devolve a URL final.
 *
 * Existe pra que colar/soltar uma imagem no editor nunca vire base64 inline no
 * HTML da descrição — um data: URI de alguns MB multiplicado por produto infla
 * a coluna no banco e o custo de qualquer busca que passe por ela. Sobe uma vez
 * pro Media (staticDir local ou Vercel Blob em produção, conforme payload.config)
 * e o texto guarda só a URL.
 */
export interface UploadedImage {
  url: string
  alt: string
}

export async function uploadImage(file: File): Promise<UploadedImage> {
  const form = new FormData()
  form.append('file', file)
  form.append('_payload', JSON.stringify({ alt: file.name.replace(/\.[^./]+$/, '') }))

  const res = await fetch('/api/media', {
    method: 'POST',
    credentials: 'same-origin',
    body: form,
  })

  if (!res.ok) throw new Error('Falha ao enviar a imagem')

  const { doc } = (await res.json()) as { doc: { url: string; alt?: string } }
  return { url: doc.url, alt: doc.alt ?? '' }
}
