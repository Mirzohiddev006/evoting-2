import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: { value: number; label: string }
  color?: 'blue' | 'purple' | 'green' | 'amber' | 'red'
  className?: string
}

const colorStyles = {
  blue:   { icon: 'var(--primary)',   bg: 'var(--primary)/12'    },
  purple: { icon: '#a855f7',          bg: 'rgba(168,85,247,0.12)' },
  green:  { icon: '#10b981',          bg: 'rgba(16,185,129,0.12)' },
  amber:  { icon: '#f59e0b',          bg: 'rgba(245,158,11,0.12)' },
  red:    { icon: '#ef4444',          bg: 'rgba(239,68,68,0.12)'  },
}

export function MetricCard({
  title, value, icon: Icon, description, trend, color = 'blue', className,
}: MetricCardProps) {
  const c = colorStyles[color]

  return (
    <Card
      className={cn('transition-all duration-200 hover:-translate-y-0.5 group', className)}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
      }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
            {title}
          </p>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: c.bg }}
          >
            <Icon className="w-4 h-4" style={{ color: c.icon }} />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className="text-xs font-semibold"
              style={{ color: trend.value >= 0 ? '#10b981' : '#ef4444' }}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
