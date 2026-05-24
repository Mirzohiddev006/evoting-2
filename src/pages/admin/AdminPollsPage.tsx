import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2, Edit2, Play, Square, Vote } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Select, Card, Badge, Modal, Spinner, EmptyState } from '@/components/ui'
import { pollsApi } from '@/api/polls.api'
import { adminApi } from '@/api/admin.api'
import { formatCount, formatDate, getErrorMessage, getStatusLabel } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { PollStatus } from '@/types'

const STATUS_FILTERS = [
  { value: 'all',    label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'closed', label: 'Закрытые' },
  { value: 'draft',  label: 'Черновики' },
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
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.title.toLowerCase().includes(q))
    }
    return result
  }, [polls, search, statusFilter])

  const statusVariant = (status: string) =>
    status === 'active' ? 'success' : status === 'draft' ? 'warning' : 'muted'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--foreground)">
            Управление опросами
          </h1>
          <p className="text-sm mt-1 text-(--muted-foreground)">
            Создавайте, редактируйте и удаляйте опросы
          </p>
        </div>
        <Button onClick={() => navigate('/admin/polls/create')}>
          <Plus className="w-4 h-4" />
          Новый опрос
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <div className="flex-1">
          <Input
            placeholder="Поиск по названию..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>
      ) : !filtered.length ? (
        <EmptyState
          icon={<Vote className="w-12 h-12" />}
          title="Опросы не найдены"
          description={search || statusFilter !== 'all' ? 'Измените параметры поиска' : 'Пока нет созданных опросов'}
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/polls/create')}>
              Создать первый опрос
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-(--border) bg-(--muted)/50">
                  {['Опрос', 'Статус', 'Период', 'Голоса', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider ${h === '' ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {filtered.map(p => {
                  const totalVotes = p.options?.reduce((s, o) => s + (o.vote_count ?? 0), 0) ?? 0
                  return (
                    <tr key={p.id} className="group hover:bg-(--muted)/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <Link
                          to={`/polls/${p.id}`}
                          className="font-medium text-(--foreground) hover:underline line-clamp-2 max-w-xs"
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={statusVariant(p.status) as any}>
                          {p.status === 'active' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                          {getStatusLabel(p.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-(--muted-foreground) text-xs whitespace-nowrap">
                        {formatDate(p.start_date)} — {formatDate(p.end_date)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-medium text-(--muted-foreground)">
                          {formatCount(totalVotes, 'голос')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {p.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                              onClick={() => updateStatus({ id: p.id, status: 'active' })}
                            >
                              <Play className="w-3 h-3" /> Активировать
                            </Button>
                          )}
                          {p.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900 hover:bg-amber-50 dark:hover:bg-amber-950"
                              onClick={() => updateStatus({ id: p.id, status: 'closed' })}
                            >
                              <Square className="w-3 h-3" /> Закрыть
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-(--muted-foreground) hover:text-(--foreground)"
                            onClick={() => navigate(`/admin/polls/edit/${p.id}`)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => setDeleteTarget(p.id)}
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
          </div>
        </Card>
      )}

      {/* Delete Modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Удалить опрос"
        description="Вы уверены, что хотите удалить этот опрос? Все связанные данные и результаты голосований будут удалены безвозвратно."
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteTarget && deletePoll(deleteTarget)}
            loading={deleting}
          >
            Удалить
          </Button>
        </div>
      </Modal>
    </div>
  )
}
