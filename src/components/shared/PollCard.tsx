import { Link } from 'react-router-dom'
import { Calendar, Users, ChevronRight, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { formatCount, formatDate, getStatusLabel, truncate } from '@/lib/utils'
import type { Poll } from '@/types'

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  active:  { dot: '#10b981', text: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.20)' },
  closed:  { dot: '',        text: 'var(--muted-foreground)', bg: 'var(--muted)', border: 'var(--border)' },
  draft:   { dot: '#f59e0b', text: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.20)' },
}

interface PollCardProps {
  poll: Poll
  showResults?: boolean
}

export function PollCard({ poll, showResults }: PollCardProps) {
  const s = STATUS_STYLES[poll.status] ?? STATUS_STYLES.closed
  const label = getStatusLabel(poll.status)
  const totalVotes = (poll.options ?? []).reduce((sum, o) => sum + (o.vote_count ?? 0), 0)

  return (
    <Link
      to={showResults ? `/results/${poll.id}` : `/polls/${poll.id}`}
      className="block group h-full"
    >
      <Card
        className="h-full transition-all duration-200 group-hover:-translate-y-0.5"
        style={{ '--hover-border': 'var(--primary)' } as React.CSSProperties}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'var(--primary)'
          el.style.boxShadow = 'var(--shadow-md)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'var(--border)'
          el.style.boxShadow = 'var(--shadow-sm)'
        }}
      >
        <CardContent className="p-5 flex flex-col h-full">
          {/* Holat qatori */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border"
              style={{ background: s.bg, color: s.text, borderColor: s.border }}
            >
              {poll.status === 'active' && (
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: s.dot }}
                />
              )}
              {label}
            </span>
            <ChevronRight
              className="w-4 h-4 shrink-0 mt-0.5 transition-all duration-200 group-hover:translate-x-0.5"
              style={{ color: 'var(--muted-foreground)' }}
            />
          </div>

          {/* Sarlavha */}
          <h3
            className="font-semibold mb-1.5 leading-snug text-sm transition-colors duration-150"
            style={{ color: 'var(--foreground)' }}
          >
            {truncate(poll.title, 65)}
          </h3>

          {/* Tavsif */}
          <p
            className="text-xs leading-relaxed mb-4 flex-1"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {truncate(poll.description ?? '', 110)}
          </p>

          {/* Meta */}
          <div
            className="flex flex-col gap-1.5 text-xs pt-3"
            style={{
              borderTop: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
            }}
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 shrink-0" />
              {formatDate(poll.start_date)} - {formatDate(poll.end_date)}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <Users className="w-3 h-3 shrink-0" />
                {formatCount(totalVotes, 'ovoz')}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 shrink-0" />
                {formatCount((poll.options ?? []).length, 'variant')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function PollCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-5 space-y-3">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-3/4" />
        <div className="skeleton h-3.5 w-1/2" />
        <div className="skeleton h-px w-full mt-2" />
        <div className="skeleton h-3 w-2/3" />
      </CardContent>
    </Card>
  )
}
