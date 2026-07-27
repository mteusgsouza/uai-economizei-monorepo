import type { AdminViewServerProps } from 'payload'
import { redirect } from 'next/navigation'

import { ViewShell } from '../../components/view-shell'
import { fetchCustomers } from '../../lib/nest-client'
import { CustomersTable } from './customers-table'

/** Lista de clientes da loja — registrada em /admin/clientes. */
export async function CustomersView({ initPageResult }: AdminViewServerProps) {
  if (!initPageResult?.req?.user) redirect('/admin/login')

  const initial = await fetchCustomers({ page: 1, limit: 50 })

  return (
    <ViewShell
      title="Clientes"
      subtitle={initial.error ? 'Falha ao carregar' : `${initial.totalDocs} clientes`}
    >
      <CustomersTable initial={initial} />
    </ViewShell>
  )
}

export default CustomersView
