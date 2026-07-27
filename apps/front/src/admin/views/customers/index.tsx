import type { AdminViewServerProps } from 'payload'
import { redirect } from 'next/navigation'

import { AdminTemplate } from '../../components/admin-template'
import { ViewShell } from '../../components/view-shell'
import { fetchCustomers } from '../../lib/nest-client'
import { CustomersTable } from './customers-table'

/** Lista de clientes da loja — registrada em /admin/clientes. */
export async function CustomersView(props: AdminViewServerProps) {
  if (!props.initPageResult?.req?.user) redirect('/admin/login')

  const initial = await fetchCustomers({ page: 1, limit: 50 })

  return (
    <AdminTemplate {...props}>
      <ViewShell
        title="Clientes"
        subtitle={initial.error ? 'Falha ao carregar' : `${initial.totalDocs} clientes`}
      >
        <CustomersTable initial={initial} />
      </ViewShell>
    </AdminTemplate>
  )
}

export default CustomersView
