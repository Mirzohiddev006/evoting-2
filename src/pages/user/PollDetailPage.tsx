import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Users, AlertCircle, BarChart2, Lock } from 'lucide-react'
import { Button, Spinner } from '@/components/ui'
import { pollsApi } from '@/api/polls.api'
import { formatCount, formatDateTime, getErrorMessage, getStatusLabel } from '@/lib/utils'
import { CHART_COLORS } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_DOT: Record<string, string> = {
  active: '#10b981', draft: '#f59e0b', closed: '',
}
const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  active:  { bg: 'rgba(16,185,129,0.10)', text: '#10b981',                  border: 'rgba(16,185,129,0.20)' },
  closed:  { bg: 'var(--muted)',           text: 'var(--muted-foreground)',   border: 'var(--border)' },
  draft:   { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b',                  border: 'rgba(245,158,11,0.20)' },
}

export default function PollDetailPage() {
  const { id } = useParams<{ id: string }>()
  const pollId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<number | null>(null)

  const { data: poll, isLoading: pollLoading } = useQuery({
    queryKey: ['poll', pollId],
    queryFn: () => pollsApi.getPoll(pollId),
    enabled: !!id && !isNaN(pollId),
  })

  const { data: results } = useQuery({
    queryKey: ['results', pollId],
    queryFn: () => pollsApi.getResults(pollId),
    enabled: !!id && !isNaN(pollId),
    refetchInterval: 15_000,
  })

  const { mutate: castVote, isPending } = useMutation({
    mutationFn: () => pollsApi.castVote(pollId, { option_id: selected! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results', pollId] })
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] })
      toast.success('Ovozingiz qabul qilindi!')
      setSelected(null)
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Ovoz berish amalga oshmadi'))
    },
  })

  if (pollLoading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>So'rovnoma topilmadi</h2>
        <Button onClick={() => navigate('/dashboard')}>Bosh sahifaga qaytish</Button>
      </div>
    )
  }

  const totalVotes = results?.total_votes ?? 0
  const isActive   = poll.status === 'active'
  const isClosed   = poll.status === 'closed'
  // Natijalar mavjud bo'lsa ko'rsatiladi; ovoz berish faqat faol holatda mumkin.
  const canVote    = isActive
  const ss         = STATUS_STYLE[poll.status] ?? STATUS_STYLE.closed

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: 'var(--muted-foreground)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--foreground)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Ortga
      </button>

      {/* Header */}
      <div className="mb-6 animate-fade-in-up">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border"
            style={{ background: ss.bg, color: ss.text, borderColor: ss.border }}
          >
            {poll.status === 'active' && (
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: STATUS_DOT.active }} />
            )}
            {getStatusLabel(poll.status)}
          </span>
        </div>

        <h1 className="text-xl font-bold mb-2 leading-snug" style={{ color: 'var(--foreground)' }}>
          {poll.title}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          {poll.description}
        </p>

        <div
          className="flex flex-wrap items-center gap-4 mt-4 text-xs"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDateTime(poll.start_date)} {'->'} {formatDateTime(poll.end_date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {formatCount(totalVotes, 'ovoz')}
          </span>
        </div>
      </div>

      {/* Notice banner for closed polls */}
      {isClosed && (
        <div
          className="mb-5 p-3.5 rounded-xl flex items-center gap-3 animate-fade-in"
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.20)',
          }}
        >
          <BarChart2 className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Bu so'rovnoma yopilgan
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Yakuniy natijalar quyida ko'rsatilgan
            </p>
          </div>
          <Link
            to={`/results/${poll.id}`}
            className="text-xs font-semibold shrink-0"
            style={{ color: 'var(--primary)' }}
          >
            To'liq natijalar
          </Link>
        </div>
      )}

      {!isActive && !isClosed && (
        <div
          className="mb-5 p-3.5 rounded-xl flex items-center gap-3 animate-fade-in"
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.20)',
          }}
        >
          <Lock className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Ovoz berish mavjud emas
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Bu so'rovnoma hozir ovoz qabul qilmayapti
            </p>
          </div>
        </div>
      )}

      {/* Options */}
      <div className="space-y-2.5 animate-fade-in-up animate-delay-100">
        {(poll.options ?? []).map((option, i) => {
          const isChosen   = selected === option.id && canVote
          const resultItem = results?.results.find(r => r.option_id === option.id)
          const pct        = resultItem?.percentage ?? 0
          const showResult = results && totalVotes > 0

          return (
            <button
              key={option.id}
              onClick={() => canVote && setSelected(option.id)}
              disabled={!canVote}
              className="w-full text-left rounded-xl relative overflow-hidden transition-all duration-200"
              style={{
                border: `1.5px solid ${isChosen ? 'var(--primary)' : 'var(--border)'}`,
                background: isChosen
                  ? 'rgba(var(--primary-rgb, 59,130,246),0.06)'
                  : 'var(--card)',
                cursor: canVote ? 'pointer' : 'default',
                padding: '14px 16px',
              }}
              onMouseEnter={e => {
                if (!canVote) return
                if (!isChosen) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--accent)'
                }
              }}
              onMouseLeave={e => {
                if (!canVote) return
                if (!isChosen) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--card)'
                }
              }}
            >
              {/* Progress fill background */}
              {showResult && pct > 0 && (
                <div
                  className="absolute inset-0 rounded-xl transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: `${CHART_COLORS[i % CHART_COLORS.length]}14`,
                  }}
                />
              )}

              <div className="relative flex items-center gap-3">
                {/* Radio circle */}
                <div
                  className="w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150"
                  style={{
                    borderColor: isChosen ? 'var(--primary)' : 'var(--muted-foreground)',
                    background:  isChosen ? 'var(--primary)' : 'transparent',
                  }}
                >
                  {isChosen && (
                    <div className="w-[7px] h-[7px] rounded-full bg-white" />
                  )}
                </div>

                {/* Label */}
                <span className="flex-1 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  {option.text}
                </span>

                {/* % + count */}
                {showResult && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="text-sm font-bold"
                      style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}
                    >
                      {pct}%
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      ({resultItem?.vote_count ?? option.vote_count})
                    </span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Submit */}
      {canVote && (
        <div className="mt-5 animate-fade-in-up animate-delay-200">
          <Button
            className="w-full"
            size="lg"
            disabled={!selected}
            loading={isPending}
            onClick={() => castVote()}
          >
            {selected ? 'Ovozimni yuborish' : 'Yuqoridan variant tanlang'}
          </Button>
          <p className="text-center text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
            Ovozingiz yakuniy, uni keyin o'zgartirib bo'lmaydi
          </p>
        </div>
      )}

      {(isClosed || totalVotes > 0) && (
        <div className="mt-4">
          <Link to={`/results/${poll.id}`}>
            <Button variant="outline" className="w-full gap-2">
              <BarChart2 className="w-4 h-4" />
              To'liq natijalar va diagrammalar
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
