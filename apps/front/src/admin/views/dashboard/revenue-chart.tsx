'use client'

import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { RevenuePoint } from '../../lib/stats'

const RANGES = [
  { key: '6m', label: '6 meses', months: 6 },
  { key: '12m', label: '12 meses', months: 12 },
] as const

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatMonth = (period: string) =>
  new Date(`${period}-01T00:00:00`).toLocaleDateString('pt-BR', {
    month: 'short',
    year: '2-digit',
  })

interface TooltipPayload {
  payload?: RevenuePoint
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  return (
    <div className="uai-chart-tooltip">
      <p className="uai-chart-tooltip-date">{formatMonth(point.period)}</p>
      <p className="uai-chart-tooltip-value">{formatBRL(point.revenue)}</p>
      <p className="uai-chart-tooltip-meta">
        {point.orders} {point.orders === 1 ? 'pedido' : 'pedidos'}
      </p>
    </div>
  )
}

/** Área de receita por mês, com seletor de período. */
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const [range, setRange] = useState<(typeof RANGES)[number]['key']>('12m')

  const months = RANGES.find((r) => r.key === range)?.months ?? 12
  const visible = data.slice(-months)
  const total = visible.reduce((sum, p) => sum + p.revenue, 0)

  return (
    <div className="uai-panel">
      <div className="uai-panel-header">
        <div>
          <h2 className="uai-panel-title">Receita</h2>
          <p className="uai-panel-subtitle">{formatBRL(total)} no período</p>
        </div>
        <div className="uai-toggle-group">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className="uai-toggle"
              data-active={range === r.key}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="uai-chart">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={visible} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="uaiRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--theme-success-500)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--theme-success-500)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--theme-elevation-150)" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
              tickFormatter={formatMonth}
              stroke="var(--theme-elevation-500)"
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={70}
              tickFormatter={(v: number) => formatBRL(v)}
              stroke="var(--theme-elevation-500)"
              fontSize={12}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--theme-elevation-300)' }} />
            <Area
              dataKey="revenue"
              type="monotone"
              fill="url(#uaiRevenueFill)"
              stroke="var(--theme-success-500)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
