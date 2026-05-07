import { Link } from 'react-router-dom'
import { Calendar, Users, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent, Badge } from '@/components/ui'
import { formatCount, formatDate, getStatusLabel, truncate } from '@/lib/utils'
import type { Poll } from '@/types'

interface PollCardProps {
  poll: Poll
  showResults?: boolean
}

export function PollCard({ poll, showResults }: PollCardProps) {
  const label = getStatusLabel(poll.status)
  const totalVotes = (poll.options ?? []).reduce((sum, o) => sum + (o.vote_count ?? 0), 0)

  const statusVariant =
    poll.status === 'active' ? 'success' :
    poll.status === 'draft'  ? 'warning' :
    'muted'

  return (
    <Link
      to={showResults ? `/results/${poll.id}` : `/polls/${poll.id}`}
      className="block group h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="h-full transition-colors group-hover:border-(--foreground)/20 group-hover:bg-(--muted)/20">
        <CardContent className="p-5 flex flex-col h-full">
          {/* Status + Arrow */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant}>
                {poll.status === 'active' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                {label}
              </Badge>
            </div>
            <ChevronRight className="w-4 h-4 text-(--muted-foreground) opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm leading-snug text-(--foreground) group-hover:text-(--foreground) mb-2">
            {truncate(poll.title, 65)}
          </h3>

          {/* Description */}
          <p className="text-sm text-(--muted-foreground) leading-relaxed flex-1">
            {truncate(poll.description ?? '', 110)}
          </p>

          {/* Meta */}
          <div className="mt-4 pt-4 border-t border-(--border) flex flex-wrap gap-3 text-xs text-(--muted-foreground)">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {formatDate(poll.start_date)} — {formatDate(poll.end_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 shrink-0" />
              {totalVotes === 1 ? '1 голос' : `${totalVotes} голосов`}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              {formatCount((poll.options ?? []).length, 'вариант')}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function PollCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-5 space-y-4">
        <div className="flex justify-between">
          <div className="skeleton h-5 w-20 rounded-md" />
        </div>
        <div className="skeleton h-4 w-4/5 rounded-md mt-2" />
        <div className="skeleton h-4 w-full rounded-md" />
        <div className="skeleton h-4 w-3/4 rounded-md" />
        <div className="skeleton h-px w-full mt-4" />
        <div className="skeleton h-4 w-2/3 rounded-md mt-4" />
      </CardContent>
    </Card>
  )
}
