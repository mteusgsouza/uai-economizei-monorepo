'use client'

import { useState, useTransition } from 'react'

import useInfiniteScroll from '../../../../hooks/useInfiniteScroll'
import { loadCustomersPage } from '../../actions/load-page'
import { LoadMoreSentinel } from '../../components/load-more-sentinel'
import { formatDate } from '../../lib/format'
import type { Customer, Page } from '../../lib/nest-client'

function fullName(customer: Customer): string {
  return [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim() || '—'
}

export function CustomersTable({ initial }: { initial: Page<Customer> }) {
  const [customers, setCustomers] = useState<Customer[]>(initial.docs)
  const [page, setPage] = useState(initial.page)
  const [hasNextPage, setHasNextPage] = useState(initial.hasNextPage)
  const [error, setError] = useState(initial.error)
  const [isPending, startTransition] = useTransition()

  const fetchNextPage = () => {
    startTransition(async () => {
      const next = await loadCustomersPage(page + 1)
      if (next.error) {
        setError(next.error)
        setHasNextPage(false)
        return
      }
      setCustomers((current) => [...current, ...next.docs])
      setPage(next.page)
      setHasNextPage(next.hasNextPage)
    })
  }

  const { observerElem } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage: isPending,
    fetchNextPage,
  })

  if (customers.length === 0) {
    return (
      <div className="uai-panel">
        <p className="uai-empty">
          {error
            ? `Não foi possível carregar os clientes. ${error}`
            : 'Nenhum cliente encontrado.'}
        </p>
      </div>
    )
  }

  return (
    <div className="uai-panel">
      <table className="uai-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Telefone</th>
            <th>Verificado</th>
            <th>Pedidos</th>
            <th>Cadastro</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{fullName(customer)}</td>
              <td>{customer.email}</td>
              <td>{customer.phone ?? '—'}</td>
              <td>
                <span
                  className="uai-badge"
                  data-tone={customer.verifiedUser ? 'success' : 'neutral'}
                >
                  {customer.verifiedUser ? 'Sim' : 'Não'}
                </span>
              </td>
              <td>{customer._count?.orders ?? 0}</td>
              <td>{customer.createdAt ? formatDate(customer.createdAt) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <LoadMoreSentinel
        ref={observerElem}
        loading={isPending}
        hasNextPage={hasNextPage}
        error={error}
        loaded={customers.length}
        total={initial.totalDocs}
      />
    </div>
  )
}
