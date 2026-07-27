import type { ReactNode } from 'react'
import { DefaultTemplate } from '@payloadcms/next/templates'
import type { AdminViewServerProps } from 'payload'

type AdminTemplateProps = AdminViewServerProps & { children: ReactNode }

/**
 * Envolve views customizadas com o template padrão do admin (nav + cabeçalho).
 *
 * O Payload só aplica o template automaticamente quando a view custom
 * substitui uma nativa — é o caso do dashboard, que ocupa a raiz de /admin.
 * Views com rota própria (/pedidos, /clientes) chegam sem template, e sem isto
 * ficariam sem barra lateral e sem como navegar.
 */
export function AdminTemplate({
  children,
  initPageResult,
  params,
  searchParams,
}: AdminTemplateProps) {
  const { req, permissions, locale, visibleEntities } = initPageResult

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      req={req}
      searchParams={searchParams}
      user={req.user ?? undefined}
      // Desestruturado de propósito: passar o objeto direto quebra no React 19
      // ("Cannot assign to read only property"), como o próprio Payload observa.
      visibleEntities={{
        collections: visibleEntities?.collections,
        globals: visibleEntities?.globals,
      }}
    >
      {children}
    </DefaultTemplate>
  )
}
