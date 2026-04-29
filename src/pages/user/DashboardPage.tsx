import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Vote, TrendingUp } from 'lucide-react'
import { Input, Select, EmptyState, Button } from '@/components/ui'
import { PollCard, PollCardSkeleton } from '@/components/shared/PollCard'
import { pollsApi } from '@/api/polls.api'
import { useAuthStore } from '@/store/authStore'
import { formatCount } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'all',    label: 'Barcha so\'rovnomalar' },
  { value: 'active', label: 'Faol' },
  { value: 'closed', label: 'Yopilgan' },
  { value: 'draft',  label: 'Kutilmoqda' },
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

  // API barcha so'rovnomalarni qaytargani uchun filtr frontendda bajariladi.
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
  const greeting = hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xayrli kun' : 'Xayrli kech'
  const activePollCount = polls?.filter(p => p.status === 'active').length ?? 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Sahifa sarlavhasi */}
      <div className="mb-7 animate-fade-in-up">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              {greeting}, {user?.name.split(' ')[0]}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Faol so'rovnomalarni ko'ring va ularda qatnashing
            </p>
          </div>

          {activePollCount > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{
                background: 'rgba(16,185,129,0.10)',
                border: '1px solid rgba(16,185,129,0.20)',
                color: '#10b981',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {formatCount(activePollCount, "faol so'rovnoma")}
            </div>
          )}
        </div>
      </div>

      {/* Filtrlar */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-6 animate-fade-in-up animate-delay-100">
        <div className="flex-1">
          <Input
            placeholder="So'rovnomalarni qidirish..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Ro'yxat */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <PollCardSkeleton key={i} />)}
        </div>
      ) : filteredPolls.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPolls.map((poll, i) => (
            <div
              key={poll.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 55}ms`, opacity: 0 }}
            >
              <PollCard poll={poll} showResults={poll.status === 'closed'} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Vote className="w-14 h-14" />}
          title="So'rovnoma topilmadi"
          description={
            search
              ? `"${search}" bo'yicha natija yo'q. Boshqa so'z bilan qidiring.`
              : "Bu filtrga mos so'rovnoma hozircha yo'q."
          }
          action={
            search ? (
              <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                Qidiruvni tozalash
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Natijalar banneri */}
      {filteredPolls.some(p => p.status === 'closed') && statusFilter !== 'closed' && (
        <div
          className="mt-8 p-4 rounded-2xl flex items-center gap-3 animate-fade-in"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--primary)/10' }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Yakunlangan so'rovnoma natijalari mavjud
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Yopilgan so'rovnomalar bo'yicha batafsil tahlilni ko'ring
            </p>
          </div>
          <button
            onClick={() => setStatusFilter('closed')}
            className="text-xs font-semibold shrink-0 transition-colors"
            style={{ color: 'var(--primary)' }}
          >
            Natijalarni ko'rish
          </button>
        </div>
      )}
    </div>
  )
}
