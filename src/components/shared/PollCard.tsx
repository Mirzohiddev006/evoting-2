import { Link } from 'react-router-dom'
import { Calendar, Users, ChevronRight, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { formatCount, formatDate, getStatusLabel, truncate } from '@/lib/utils'
import type { Poll } from '@/types'

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  active:  { dot: '#10b981', text: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.30)' },
  closed:  { dot: '',        text: 'var(--muted-foreground)', bg: 'var(--muted)', border: 'var(--border)' },
  draft:   { dot: '#f59e0b', text: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.30)' },
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
      className="block group h-full focus:outline-none"
    >
      <Card
        className="h-full transition-all duration-300 group-hover:-translate-y-1 bg-card/60 backdrop-blur-md"
        style={{
          boxShadow: 'var(--shadow)',
          position: 'relative',
          overflow: 'hidden'
        } as React.CSSProperties}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'var(--primary)'
          el.style.boxShadow = '0 12px 24px -10px var(--primary)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'var(--border)'
          el.style.boxShadow = 'var(--shadow)'
        }}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500 z-0 pointer-events-none" />

        <CardContent className="p-6 flex flex-col h-full relative z-10">
          {/* Status Row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border backdrop-blur-sm"
              style={{ background: s.bg, color: s.text, borderColor: s.border }}
            >
              {poll.status === 'active' && (
                <span
                  className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor]"
                  style={{ background: s.dot }}
                />
              )}
              {label}
            </span>
            <div className="w-8 h-8 rounded-full bg-accent/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <ChevronRight
                className="w-4 h-4"
                style={{ color: 'var(--primary)' }}
              />
            </div>
          </div>

          {/* Title */}
          <h3
            className="font-bold mb-2 leading-relaxed text-base transition-colors duration-200 group-hover:text-primary"
            style={{ color: 'var(--foreground)' }}
          >
            {truncate(poll.title, 65)}
          </h3>

          {/* Description */}
          <p
            className="text-sm leading-relaxed mb-5 flex-1"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {truncate(poll.description ?? '', 110)}
          </p>

          {/* Meta Info */}
          <div
            className="flex flex-col gap-2.5 text-xs pt-4"
            style={{
              borderTop: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
            }}
          >
            <span className="flex items-center gap-2 font-medium">
              <Calendar className="w-4 h-4 shrink-0 text-primary/70" />
              {formatDate(poll.start_date)} - {formatDate(poll.end_date)}
            </span>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5 font-medium px-2 py-1 rounded-md bg-accent/30">
                <Users className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                {totalVotes === 1 ? '1 голос' : `${totalVotes} голосов`}
              </span>
              <span className="flex items-center gap-1.5 font-medium px-2 py-1 rounded-md bg-accent/30">
                <Clock className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                {formatCount((poll.options ?? []).length, 'вариант')}
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
    <Card className="h-full bg-card/40 border-border/50">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between">
          <div className="skeleton h-6 w-24 rounded-full" />
          <div className="skeleton w-8 h-8 rounded-full" />
        </div>
        <div className="skeleton h-5 w-4/5 rounded-md mt-2" />
        <div className="skeleton h-4 w-full rounded-md mt-2" />
        <div className="skeleton h-4 w-3/4 rounded-md" />
        <div className="skeleton h-px w-full mt-4" />
        <div className="skeleton h-4 w-2/3 rounded-md mt-4" />
      </CardContent>
    </Card>
  )
}
