import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Vote, TrendingUp, Sparkles } from 'lucide-react'
import { Input, Select, EmptyState, Button } from '@/components/ui'
import { PollCard, PollCardSkeleton } from '@/components/shared/PollCard'
import { pollsApi } from '@/api/polls.api'
import { useAuthStore } from '@/store/authStore'
import { formatCount } from '@/lib/utils'

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
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter)
    }
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
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 relative">
      {/* Soft background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                {greeting}, {user?.name.split(' ')[0]}
              </h1>
            </div>
            <p className="text-base text-muted-foreground mt-1">
              Просматривайте активные опросы и принимайте в них участие
            </p>
          </div>

          {activePollCount > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              {activePollCount} {activePollCount === 1 ? 'активный опрос' : 'активных опроса'}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <div className="flex-1 relative group">
           <Input
            placeholder="Поиск опросов..."
            leftIcon={<Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-12 shadow-sm border-border/60 focus:ring-primary/20 transition-all font-medium bg-card/60 backdrop-blur-sm"
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <PollCardSkeleton key={i} />)}
        </div>
      ) : filteredPolls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolls.map((poll, i) => (
            <div
              key={poll.id}
              className="animate-fade-in-up hover:z-10"
              style={{ animationDelay: `${i * 60 + 100}ms`, animationFillMode: 'both' }}
            >
              <PollCard poll={poll} showResults={poll.status === 'closed'} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Vote className="w-16 h-16 text-muted-foreground/50" />}
          title="Опросы не найдены"
          description={
            search
              ? `По запросу "${search}" ничего не найдено. Попробуйте изменить параметры поиска.`
              : "По выбранному фильтру пока нет опросов."
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

      {/* Results Banner */}
      {filteredPolls.some(p => p.status === 'closed') && statusFilter !== 'closed' && (
        <div
          className="mt-12 p-5 rounded-3xl flex flex-col sm:flex-row items-center gap-4 animate-fade-in shadow-lg border border-border/40 backdrop-blur-xl bg-card/40"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-primary/10 shadow-inner">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-base font-semibold text-foreground">
              Доступны результаты завершенных опросов
            </p>
            <p className="text-sm mt-1 text-muted-foreground">
              Ознакомьтесь с подробной аналитикой по закрытым опросам
            </p>
          </div>
          <Button
            onClick={() => setStatusFilter('closed')}
            variant="outline"
            className="shrink-0 font-semibold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
          >
            Посмотреть результаты
          </Button>
        </div>
      )}
    </div>
  )
}
