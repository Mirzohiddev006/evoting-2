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
  blue:   { icon: 'var(--primary)',   bg: 'var(--primary)/15'    },
  purple: { icon: '#a855f7',          bg: 'rgba(168,85,247,0.15)' },
  green:  { icon: '#10b981',          bg: 'rgba(16,185,129,0.15)' },
  amber:  { icon: '#f59e0b',          bg: 'rgba(245,158,11,0.15)' },
  red:    { icon: '#ef4444',          bg: 'rgba(239,68,68,0.15)'  },
}

export function MetricCard({
  title, value, icon: Icon, description, trend, color = 'blue', className,
}: MetricCardProps) {
  const c = colorStyles[color]

  return (
    <Card
      className={cn('transition-all duration-300 hover:-translate-y-1 group bg-card/60 backdrop-blur-md relative overflow-hidden', className)}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Background soft glow */}
      <div 
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: c.icon }}
      />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
            {title}
          </p>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300"
            style={{ background: c.bg }}
          >
            <Icon className="w-5 h-5" style={{ color: c.icon }} />
          </div>
        </div>
        <p className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {description && (
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1.5 mt-3">
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-md"
              style={{ 
                color: trend.value >= 0 ? '#10b981' : '#ef4444',
                background: trend.value >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'
              }}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
