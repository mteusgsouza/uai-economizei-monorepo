'use client'

import { formatDate } from '../../lib/format'
import type { Customer } from '../../lib/nest-client'

function fullName(customer: Customer): string {
  return [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim() || '—'
}

export function CustomersTable({ customers }: { customers: Customer[] }) {
  if (customers.length === 0) {
    return (
      <div className="uai-panel">
        <p className="uai-empty">
          Nenhum cliente encontrado. Verifique se a API está no ar.
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
                <span className="uai-badge" data-tone={customer.verifiedUser ? 'success' : 'neutral'}>
                  {customer.verifiedUser ? 'Sim' : 'Não'}
                </span>
              </td>
              <td>{customer._count?.orders ?? 0}</td>
              <td>{customer.createdAt ? formatDate(customer.createdAt) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
