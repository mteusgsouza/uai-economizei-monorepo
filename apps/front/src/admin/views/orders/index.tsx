import type { AdminViewServerProps } from 'payload'
import { redirect } from 'next/navigation'

import { AdminTemplate } from '../../components/admin-template'
import { FilterBar, FilterSearch, FilterSelect, SortSelect } from '../../components/filter-bar'
import { ViewShell } from '../../components/view-shell'
import {
  DELIVERY_OPTIONS,
  ORDER_SORT_OPTIONS,
  ORDER_STATUS_OPTIONS,
  filtersKey,
  readOrderFilters,
} from '../../lib/filters'
import { fetchOrders } from '../../lib/nest-client'
import { OrdersTable } from './orders-table'

/** Lista de pedidos com filtros e detalhe — registrada em /admin/pedidos. */
export async function OrdersView(props: AdminViewServerProps) {
  if (!props.initPageResult?.req?.user) redirect('/admin/login')

  const filters = readOrderFilters(props.searchParams)
  const initial = await fetchOrders({ page: 1, limit: 50 }, filters)

  const sortValue = `${filters.sortBy ?? 'createdAt'}:${filters.sortOrder ?? 'desc'}`

  return (
    <AdminTemplate {...props}>
      <ViewShell
        title="Pedidos"
        subtitle={initial.error ? 'Falha ao carregar' : `${initial.totalDocs} pedidos`}
      >
        <FilterBar>
          <FilterSearch
            label="Buscar"
            placeholder="Nº do pedido ou cliente"
            value={filters.search}
          />
          <FilterSelect
            label="Status"
            paramKey="status"
            value={filters.status}
            options={ORDER_STATUS_OPTIONS}
          />
          <FilterSelect
            label="Entrega"
            paramKey="delivery"
            value={filters.delivery}
            options={DELIVERY_OPTIONS}
          />
          <SortSelect value={sortValue} options={ORDER_SORT_OPTIONS} />
        </FilterBar>

        {/* A key reinicia a lista acumulada quando o recorte muda */}
        <OrdersTable key={filtersKey(filters)} initial={initial} filters={filters} />
      </ViewShell>
    </AdminTemplate>
  )
}

export default OrdersView
