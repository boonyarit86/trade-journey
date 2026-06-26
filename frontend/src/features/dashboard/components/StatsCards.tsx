import type { MetricCard } from '../types.ts'
import { Card } from '../../../shared/ui/Card.tsx'

interface StatsCardsProps {
  metrics: MetricCard[]
}

export function StatsCards({ metrics }: StatsCardsProps) {
  return (
    <div className="stats-grid">
      {metrics.map((metric) => (
        <Card key={metric.id} title={metric.label}>
          <p className="metric-value">{metric.value}</p>
          <p className={metric.trend === 'up' ? 'trend-up' : 'trend-down'}>
            Trend: {metric.trend}
          </p>
        </Card>
      ))}
    </div>
  )
}
