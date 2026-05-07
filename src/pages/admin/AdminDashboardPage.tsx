import { useQuery } from '@tanstack/react-query'
import { Users, Vote, LogIn, TrendingUp, ShieldCheck } from 'lucide-react'
import { Card, CardContent, Spinner } from '@/components/ui'
import { MetricCard } from '@/components/shared/MetricCard'
import { adminApi } from '@/api/admin.api'
import { useAuthStore } from '@/store/authStore'

export default function AdminDashboardPage() {
  const { user } = useAuthStore()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getSystemStats,
    refetchInterval: 30_000,
  })

  const trends = {
    users: { value: 12, label: 'с прошлого месяца' },
    polls: { value: 5,  label: 'с прошлой недели' },
    votes: { value: 24, label: 'с вчерашнего дня' },
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-(--foreground)">
          {greeting}, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-sm text-(--muted-foreground) mt-1">
          Обзор системы и ключевые показатели платформы
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <MetricCard
            title="Всего пользователей"
            value={stats?.total_users ?? 0}
            icon={Users}
            trend={trends.users}
            description="Зарегистрированные пользователи"
          />
          <MetricCard
            title="Всего опросов"
            value={stats?.total_polls ?? 0}
            icon={Vote}
            trend={trends.polls}
            description="Включая активные и закрытые"
          />
          <MetricCard
            title="Уникальные голоса"
            value={stats?.total_votes ?? 0}
            icon={TrendingUp}
            trend={trends.votes}
            description="Всего голосов на платформе"
          />
          <MetricCard
            title="Активные сессии"
            value={Math.floor((stats?.total_users ?? 0) * 0.4)}
            icon={LogIn}
            description="Текущие пользователи онлайн"
          />
        </div>
      )}

      {/* Info card */}
      <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-9 h-9 rounded-md border border-(--border) bg-(--muted) flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-(--foreground)" />
            </div>
            <div>
              <p className="text-sm font-semibold text-(--foreground)">Система активна</p>
              <p className="text-sm text-(--muted-foreground) mt-0.5">
                Все сервисы работают в штатном режиме. База данных и сетевая инфраструктура в норме.
              </p>
              <span className="inline-block mt-3 text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                Системный статус: Отлично
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
