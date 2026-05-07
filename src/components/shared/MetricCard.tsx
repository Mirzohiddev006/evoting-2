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

export function MetricCard({
  title, value, icon: Icon, description, trend, className,
}: MetricCardProps) {
  return (
    <Card className={cn('transition-colors hover:bg-(--muted)/30', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-(--muted-foreground)">{title}</p>
          <div className="w-8 h-8 rounded-md border border-(--border) bg-(--muted) flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-(--foreground)" />
          </div>
        </div>

        <p className="text-2xl font-bold tracking-tight mt-3 text-(--foreground)">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>

        {description && (
          <p className="text-xs text-(--muted-foreground) mt-1">{description}</p>
        )}

        {trend && (
          <div className="flex items-center gap-1.5 mt-3 text-xs">
            <span className={cn(
              'font-medium',
              trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
            )}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-(--muted-foreground)">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
