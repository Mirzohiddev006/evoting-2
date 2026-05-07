import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Vote, TrendingUp } from 'lucide-react'
import { Input, Select, EmptyState, Button } from '@/components/ui'
import { PollCard, PollCardSkeleton } from '@/components/shared/PollCard'
import { pollsApi } from '@/api/polls.api'
import { useAuthStore } from '@/store/authStore'

const STATUS_OPTIONS = [
  { value: 'all',    label: 'Все опросы' },
  { value: 'active', label: 'Активные' },
  { value: 'closed', label: 'Закрытые' },
  { value: 'draft',  label: 'Черновики' },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: polls, isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: () => pollsApi.getPolls(),
    refetchInterval: 30_000,
  })

  const filteredPolls = useMemo(() => {
    if (!polls) return []
    let result = [...polls]
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        p => p.title.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)
      )
    }
    return result
  }, [polls, statusFilter, search])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'
  const activePollCount = polls?.filter(p => p.status === 'active').length ?? 0

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(--foreground)">
              {greeting}, {user?.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-(--muted-foreground) mt-1">
              Просматривайте активные опросы и принимайте в них участие
            </p>
          </div>

          {activePollCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {activePollCount} {activePollCount === 1 ? 'активный' : 'активных'} опрос{activePollCount > 1 ? 'а' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <div className="flex-1">
          <Input
            placeholder="Поиск опросов..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Poll grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <PollCardSkeleton key={i} />)}
        </div>
      ) : filteredPolls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPolls.map((poll, i) => (
            <div
              key={poll.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 50 + 100}ms`, animationFillMode: 'both' }}
            >
              <PollCard poll={poll} showResults={poll.status === 'closed'} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Vote className="w-12 h-12" />}
          title="Опросы не найдены"
          description={
            search
              ? `По запросу "${search}" ничего не найдено.`
              : 'По выбранному фильтру пока нет опросов.'
          }
          action={
            search ? (
              <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                Очистить поиск
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Results banner */}
      {filteredPolls.some(p => p.status === 'closed') && statusFilter !== 'closed' && (
        <div className="mt-10 p-5 rounded-lg border border-(--border) flex flex-col sm:flex-row items-center gap-4 bg-(--card) animate-fade-in">
          <div className="w-9 h-9 rounded-md border border-(--border) bg-(--muted) flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-(--foreground)" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-semibold text-(--foreground)">
              Доступны результаты завершенных опросов
            </p>
            <p className="text-sm text-(--muted-foreground) mt-0.5">
              Ознакомьтесь с аналитикой по закрытым опросам
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusFilter('closed')}
            className="shrink-0"
          >
            Посмотреть результаты
          </Button>
        </div>
      )}
    </div>
  )
}
