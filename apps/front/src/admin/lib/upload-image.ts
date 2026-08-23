/**
 * Envia o arquivo pro Media do Payload e devolve a URL final.
 *
 * Usado pelos campos do admin que guardam a imagem como URL (imagem principal
 * e adicionais do produto, imagens da descrição). Existe pra que enviar um
 * arquivo nunca vire base64 inline: um data: URI de alguns MB multiplicado por
 * produto infla a coluna no banco e o custo de qualquer busca que passe por
 * ela. Sobe uma vez pro Media (staticDir local ou Vercel Blob em produção,
 * conforme payload.config) e o campo guarda só a URL.
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

  // A mensagem do servidor volta em `errors[0].message` — é ela que diz se o
  // arquivo é grande demais, se o tipo não serve ou se falta configuração de
  // armazenamento. Engolir isso num texto fixo já custou uma investigação.
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      errors?: { message?: string }[]
    } | null
    throw new Error(body?.errors?.[0]?.message || 'Falha ao enviar a imagem')
  }

  const { doc } = (await res.json()) as { doc: { url: string; alt?: string } }
  return { url: doc.url, alt: doc.alt ?? '' }
}
