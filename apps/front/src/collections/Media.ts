import { randomUUID } from 'crypto'

import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { SOCIAL_SIZE, sizedImageName } from '../../lib/media-url'
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
 * Dois recortes de mesmas dimensões geravam o mesmo nome de arquivo pelo padrão
 * do Payload (`foto-1200x630.webp`): subiam em paralelo, o Vercel Blob aceitava
 * o primeiro e recusava o segundo, e o envio inteiro voltava atrás deixando
 * órfãos no store. Em disco a colisão passava batido — gravar por cima é
 * silencioso —, então só aparecia em produção. Nomear pelo recorte resolve: o
 * `name` é único por definição dentro da collection.
 *
 * `withoutEnlargement` no recorte social: sem ele, imagem menor que 1200x630
 * simplesmente não gera arquivo, e a URL que o `og:image` deduz do nome iria
 * para um 404. Com ele o recorte sempre existe, no tamanho do original quando
 * o original for menor.
 */
const IMAGE_SIZES = [
  { name: "thumbnail", width: 400, height: 300 },
  { name: SOCIAL_SIZE, width: 1200, height: 630, withoutEnlargement: true },
].map((size) => ({
  ...size,
  position: "centre" as const,
  generateImageName: sizedImageName,
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
