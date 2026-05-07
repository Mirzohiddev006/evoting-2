import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2, Edit2, Play, Square, Vote } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Select, Card, Modal, Spinner, EmptyState } from '@/components/ui'
import { pollsApi } from '@/api/polls.api'
import { adminApi } from '@/api/admin.api'
import { formatCount, formatDate, getErrorMessage, getStatusLabel } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { PollStatus } from '@/types'

const STATUS_FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'closed', label: 'Закрытые' },
  { value: 'draft', label: 'Черновики' },
]

export default function AdminPollsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const { data: polls, isLoading } = useQuery({
    queryKey: ['adminPolls'],
    queryFn: adminApi.getPolls,
  })

  // To prevent multiple states showing incorrectly, we invalidate nicely
  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: PollStatus }) =>
      adminApi.updatePoll(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPolls'] })
      queryClient.invalidateQueries({ queryKey: ['polls'] })
      toast.success('Статус опроса обновлен')
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Не удалось обновить статус'))
    },
  })

  const { mutate: deletePoll, isPending: deleting } = useMutation({
    mutationFn: (id: number) => adminApi.deletePoll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPolls'] })
      queryClient.invalidateQueries({ queryKey: ['polls'] })
      toast.success('Опрос удален')
      setDeleteTarget(null)
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Не удалось удалить опрос'))
    },
  })

  const filtered = useMemo(() => {
    if (!polls) return []
    let result = [...polls]
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.title.toLowerCase().includes(q))
    }
    return result
  }, [polls, search, statusFilter])

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { background: 'rgba(16,185,129,0.15)', color: '#10b981', borderColor: 'rgba(16,185,129,0.30)' }
      case 'closed':
        return { background: 'var(--muted)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
      case 'draft':
        return { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.30)' }
      default:
        return {}
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8 animate-fade-in-up relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Управление опросами
          </h1>
          <p className="text-base mt-1 text-muted-foreground">
            Создавайте, редактируйте и удаляйте опросы
          </p>
        </div>
        <Button onClick={() => navigate('/admin/polls/new')} className="gap-2 shadow-md">
          <Plus className="w-4 h-4" />
          Новый опрос
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in-up relative z-10" style={{ animationDelay: '50ms' }}>
        <div className="flex-1">
          <Input
            placeholder="Поиск по названию..."
            leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-card/60 backdrop-blur-sm border-border/50 h-11"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-20 relative z-10"><Spinner className="w-10 h-10 text-primary" /></div>
      ) : !filtered.length ? (
        <EmptyState
          icon={<Vote className="w-16 h-16 text-muted-foreground/50" />}
          title="Опросы не найдены"
          description={search || statusFilter !== 'all' ? "Измените параметры поиска" : "Пока нет созданных опросов"}
          action={
            <Button variant="outline" onClick={() => navigate('/admin/polls/new')} className="mt-2">
              Создать первый опрос
            </Button>
          }
          className="relative z-10"
        />
      ) : (
        <Card className="overflow-hidden animate-fade-in-up border-border/40 backdrop-blur-xl bg-card/40 shadow-xl relative z-10" style={{ animationDelay: '100ms' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  {['Опрос', 'Статус', 'Период', 'Голоса', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[11px] ${h === '' ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map(p => {
                  const totalVotes = p.options?.reduce((s, o) => s + (o.vote_count ?? 0), 0) ?? 0

                  return (
                    <tr key={p.id} className="group bg-transparent hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/polls/${p.id}`}
                          className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 max-w-sm"
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-sm"
                          style={getStatusBadgeStyle(p.status)}
                        >
                          {p.status === 'active' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                          {getStatusLabel(p.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-muted-foreground font-medium text-xs whitespace-nowrap">
                        {formatDate(p.start_date)} - {formatDate(p.end_date)}
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="inline-flex items-center font-bold px-2 py-1 rounded-md bg-accent/30 text-xs">
                          {formatCount(totalVotes, 'голос')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right align-middle">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {p.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 backdrop-blur-md border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                              onClick={() => updateStatus({ id: p.id, status: 'active' })}
                            >
                              <Play className="w-3.5 h-3.5 mr-1" /> Активировать
                            </Button>
                          )}
                          {p.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 backdrop-blur-md border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                              onClick={() => updateStatus({ id: p.id, status: 'closed' })}
                            >
                              <Square className="w-3.5 h-3.5 mr-1" /> Закрыть
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => navigate(`/admin/polls/${p.id}/edit`)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(p.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delete Modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Удалить опрос"
        description="Вы уверены, что хотите удалить этот опрос? Все связанные с ним данные и результаты голосований будут удалены безвозвратно."
      >
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteTarget && deletePoll(deleteTarget)}
            loading={deleting}
            className="shadow-md"
          >
            Удалить
          </Button>
        </div>
      </Modal>
    </div>
  )
}
