import type { AdminViewServerProps } from 'payload'
import { redirect } from 'next/navigation'

import { AdminTemplate } from '../../components/admin-template'
import { FilterBar, FilterSearch, FilterSelect, SortSelect } from '../../components/filter-bar'
import { ViewShell } from '../../components/view-shell'
import {
  CUSTOMER_SORT_OPTIONS,
  VERIFIED_OPTIONS,
  filtersKey,
  readCustomerFilters,
} from '../../lib/filters'
import { fetchCustomers } from '../../lib/nest-client'
import { CustomersTable } from './customers-table'

/** Lista de clientes com filtros — registrada em /admin/clientes. */
export async function CustomersView(props: AdminViewServerProps) {
  if (!props.initPageResult?.req?.user) redirect('/admin/login')

  const filters = readCustomerFilters(props.searchParams)
  const initial = await fetchCustomers({ page: 1, limit: 50 }, filters)

  const sortValue = `${filters.sortBy ?? 'createdAt'}:${filters.sortOrder ?? 'desc'}`

  return (
    <AdminTemplate {...props}>
      <ViewShell
        title="Clientes"
        subtitle={initial.error ? 'Falha ao carregar' : `${initial.totalDocs} clientes`}
      >
        <FilterBar>
          <FilterSearch
            label="Buscar"
            placeholder="Nome, e-mail ou telefone"
            value={filters.search}
          />
          <FilterSelect
            label="Verificado"
            paramKey="verified"
            value={filters.verified}
            options={VERIFIED_OPTIONS}
          />
          <SortSelect value={sortValue} options={CUSTOMER_SORT_OPTIONS} />
        </FilterBar>

        {/* A key reinicia a lista acumulada quando o recorte muda */}
        <CustomersTable key={filtersKey(filters)} initial={initial} filters={filters} />
      </ViewShell>
    </AdminTemplate>
  )
}

export default CustomersView
