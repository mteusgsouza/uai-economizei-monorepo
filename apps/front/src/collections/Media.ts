import { randomUUID } from 'crypto'

import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { blobStorageEnabled, runningOnVercel } from '../storage'

/**
 * O Payload só evita repetir nome consultando os documentos da collection
 * (`getSafeFileName`), e o Vercel Blob recusa gravar por cima de um arquivo
 * existente. Basta um upload morrer no meio — o arquivo já foi para o Blob, a
 * transação do documento volta atrás — para aquele nome ficar queimado: não há
 * documento para o Payload desviar, e o Blob nega toda tentativa seguinte.
 *
 * Sufixo aleatório no nome resolve na origem: cada envio nasce com um nome que
 * ninguém tem, órfão no Blob ou não. O nome original fica na frente para o
 * arquivo continuar reconhecível na listagem de mídia.
 *
 * O sufixo do próprio plugin (`addRandomSuffix`) não serve: ele renomeia
 * depois do upload e grava o nome sorteado em `data.filename` uma vez por
 * arquivo — inclusive para cada `imageSize` —, então o documento termina com o
 * nome de um dos recortes e as miniaturas apontam para URL que não existe.
 */
function withUniqueSuffix(name: string): string {
  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot) : ''
  return `${base}-${randomUUID().slice(0, 8)}${ext}`
}

/**
 * O nome de cada recorte sai do nome do arquivo — e por padrão o Payload usa as
 * dimensões como sufixo (`foto-1200x630.webp`). Dois recortes do mesmo tamanho,
 * como `cover` e `og`, produzem então o mesmo nome: os dois sobem em paralelo,
 * o Vercel Blob aceita o primeiro e recusa o segundo ("This blob already
 * exists"), e o envio inteiro volta atrás deixando os arquivos que já subiram
 * órfãos no store.
 *
 * Em disco isso passava batido — gravar por cima é silencioso — o que fez o
 * problema só aparecer em produção. Nomear pelo recorte em vez das dimensões
 * resolve na origem: `name` é único por definição dentro da collection.
 */
const IMAGE_SIZES = [
  { name: 'thumbnail', width: 400, height: 300 },
  { name: 'cover', width: 1200, height: 630 },
  { name: 'og', width: 1200, height: 630 },
].map((size) => ({
  ...size,
  position: 'centre' as const,
  generateImageName: ({
    extension,
    originalName,
    sizeName,
  }: {
    extension: string
    originalName: string
    sizeName: string
  }) => `${originalName}-${sizeName}.${extension}`,
}))

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Mídia',
    plural: 'Mídia',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeOperation: [
      ({ args, operation }) => {
        if (operation !== 'create' && operation !== 'update') return

        // Sem o Blob, o Payload cai no `staticDir` — que na Vercel é um
        // filesystem somente leitura. O erro cru vira "Something went wrong."
        // na tela, sem dizer o que falta; este aviso troca isso por uma
        // instrução.
        if (runningOnVercel && !blobStorageEnabled) {
          throw new APIError(
            'Armazenamento de arquivos não configurado: falta a variável BLOB_READ_WRITE_TOKEN (Vercel Blob). Sem ela o upload não tem onde gravar.',
            500,
          )
        }

        // `req.file` já está montado aqui e só é lido adiante, em
        // `generateFileData` — que deriva daqui o nome de cada `imageSize`.
        const file = args.req?.file
        if (file?.name) file.name = withUniqueSuffix(file.name)

        return args
      },
    ],
  },
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*'],
    imageSizes: IMAGE_SIZES,
    adminThumbnail: 'thumbnail',
  },
  fields: [
    { name: 'alt', type: 'text', label: 'Texto alternativo' },
  ],
}
