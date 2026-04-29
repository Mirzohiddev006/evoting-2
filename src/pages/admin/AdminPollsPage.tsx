import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Play, Square, BarChart2, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Input, Card, Modal, Spinner, EmptyState } from '@/components/ui'
import { adminApi } from '@/api/admin.api'
import { formatCount, formatDate, getErrorMessage, getStatusLabel } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string; dot?: string }> = {
  active:  { bg: 'rgba(16,185,129,0.10)', text: '#10b981', border: 'rgba(16,185,129,0.20)', dot: '#10b981' },
  closed:  { bg: 'var(--muted)',           text: 'var(--muted-foreground)', border: 'var(--border)' },
  draft:   { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b', border: 'rgba(245,158,11,0.20)' },
}

export default function AdminPollsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const { data: polls, isLoading } = useQuery({
    queryKey: ['adminPolls'],
    queryFn: () => adminApi.getPolls(),
  })

  const filteredPolls = useMemo(() => {
    if (!polls) return []
    if (!search) return polls
    const q = search.toLowerCase()
    return polls.filter(p =>
      p.title.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)
    )
  }, [polls, search])

  const { mutate: deletePoll, isPending: deleting } = useMutation({
    mutationFn: (id: number) => adminApi.deletePoll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPolls'] })
      queryClient.invalidateQueries({ queryKey: ['polls'] })
      toast.success("So'rovnoma o'chirildi")
      setDeleteTarget(null)
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "So'rovnomani o'chirib bo'lmadi"))
    },
  })

  const { mutate: startPoll } = useMutation({
    mutationFn: (id: number) => adminApi.startPoll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPolls'] })
      queryClient.invalidateQueries({ queryKey: ['polls'] })
      toast.success("So'rovnoma boshlandi")
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "So'rovnomani boshlab bo'lmadi"))
    },
  })

  const { mutate: stopPoll } = useMutation({
    mutationFn: (id: number) => adminApi.stopPoll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPolls'] })
      queryClient.invalidateQueries({ queryKey: ['polls'] })
      toast.success("So'rovnoma to'xtatildi")
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "So'rovnomani to'xtatib bo'lmadi"))
    },
  })

  const handleToggle = (poll: { id: number; status: string }) => {
    if (poll.status === 'active') {
      stopPoll(poll.id)
    } else {
      startPoll(poll.id)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            So'rovnomalarni boshqarish
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {formatCount(polls?.length ?? 0, "so'rovnoma")} jami
          </p>
        </div>
        <Link to="/admin/polls/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Yangi so'rovnoma
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4 animate-fade-in-up animate-delay-100">
        <Input
          placeholder="So'rovnomalarni qidirish..."
          leftIcon={<Search className="w-4 h-4" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="w-8 h-8" />
        </div>
      ) : !filteredPolls?.length ? (
        <EmptyState
          icon={<BarChart2 className="w-14 h-14" />}
          title="Hozircha so'rovnoma yo'q"
          description="Boshlash uchun birinchi so'rovnomani yarating"
          action={
            <Link to="/admin/polls/create">
              <Button className="gap-2"><Plus className="w-4 h-4" />So'rovnoma yaratish</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden animate-fade-in-up animate-delay-200">
          <table className="w-full evote-table">
            <thead>
              <tr>
                <th className="text-left" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  So'rovnoma
                </th>
                <th className="text-left hidden sm:table-cell" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  Sanalar
                </th>
                <th className="text-left" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  Holat
                </th>
                <th className="text-right" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPolls.map(poll => {
                const ss = STATUS_STYLE[poll.status] ?? STATUS_STYLE.closed
                return (
                  <tr key={poll.id} style={{ background: 'var(--card)' }}>
                    <td>
                      <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                        {poll.title.length > 42 ? poll.title.slice(0, 42) + '...' : poll.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        {formatCount((poll.options ?? []).length, 'variant')}
                      </p>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {formatDate(poll.start_date)} {'->'} {formatDate(poll.end_date)}
                      </span>
                    </td>
                    <td>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border"
                        style={{ background: ss.bg, color: ss.text, borderColor: ss.border }}
                      >
                        {poll.status === 'active' && (
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ss.dot }} />
                        )}
                        {getStatusLabel(poll.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/results/${poll.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Natijalarni ko'rish">
                            <BarChart2 className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggle(poll)}
                          disabled={poll.status === 'closed'}
                          title={poll.status === 'active' ? "So'rovnomani to'xtatish" : "So'rovnomani boshlash"}
                        >
                          {poll.status === 'active'
                            ? <Square className="w-3.5 h-3.5" />
                            : <Play className="w-3.5 h-3.5" />
                          }
                        </Button>
                        <Link to={`/admin/polls/edit/${poll.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="So'rovnomani tahrirlash">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="So'rovnomani o'chirish"
                          style={{ color: 'var(--destructive)' }}
                          onClick={() => setDeleteTarget(poll.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Delete confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="So'rovnomani o'chirish"
        description="Bu amalni qaytarib bo'lmaydi."
        size="sm"
      >
        <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
          Bu so'rovnoma bilan bog'liq barcha ovozlar butunlay o'chiriladi.
          Davom etishga ishonchingiz komilmi?
        </p>
        <div className="flex gap-2.5">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>
            Bekor qilish
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            loading={deleting}
            onClick={() => deleteTarget && deletePoll(deleteTarget)}
          >
            So'rovnomani o'chirish
          </Button>
        </div>
      </Modal>
    </div>
  )
}
