import type { AdminViewServerProps } from 'payload'
import { redirect } from 'next/navigation'

import { ViewShell } from '../../components/view-shell'
import { fetchCustomers } from '../../lib/nest-client'
import { CustomersTable } from './customers-table'

/** Lista de clientes da loja — registrada em /admin/clientes. */
export async function CustomersView({ initPageResult }: AdminViewServerProps) {
  if (!initPageResult?.req?.user) redirect('/admin/login')

  const customers = await fetchCustomers(100)

  return (
    <ViewShell title="Clientes" subtitle={`${customers.length} clientes mais recentes`}>
      <CustomersTable customers={customers} />
    </ViewShell>
  )
}

export default CustomersView
