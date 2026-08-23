/**
 * O upload da Media só tem para onde ir em produção se o Vercel Blob estiver
 * configurado: o filesystem da Vercel é somente leitura, e `public/media` (o
 * `staticDir` do fallback local) nem sequer é versionado.
 *
 * A checagem mora aqui, e não solta em cada arquivo, porque quem liga o plugin
 * (payload.config) e quem depende dele (a collection Media) precisam concordar
 * — se as duas condições saírem de sincronia, o upload volta a falhar mudo.
 */
export const blobStorageEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

/** A Vercel marca todo ambiente dela com `VERCEL=1`. */
export const runningOnVercel = Boolean(process.env.VERCEL)
