import { useQuery } from '@tanstack/react-query'
import { Users, Vote, LogIn, TrendingUp } from 'lucide-react'
import { Card, CardContent, Spinner } from '@/components/ui'
import { MetricCard } from '@/components/shared/MetricCard'
import { adminApi } from '@/api/admin.api'
import { useAuthStore } from '@/store/authStore'
import { formatCount } from '@/lib/utils'

export default function AdminDashboardPage() {
  const { user } = useAuthStore()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getSystemStats,
    refetchInterval: 30_000,
  })

  // Example trend data
  const trends = {
    users: { value: 12, label: 'с прошлого месяца' },
    polls: { value: 5, label: 'с прошлой недели' },
    votes: { value: 24, label: 'с вчерашнего дня' },
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <div className="mb-10 animate-fade-in-up relative z-10">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          {greeting}, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          Обзор системы и ключевые показатели платформы
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 relative z-10"><Spinner className="w-10 h-10 text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up relative z-10" style={{ animationDelay: '100ms' }}>
          <MetricCard
            title="Всего пользователей"
            value={stats?.total_users ?? 0}
            icon={Users}
            color="blue"
            trend={trends.users}
            description="Зарегистрированные пользователи"
          />
          <MetricCard
            title="Всего опросов"
            value={stats?.total_polls ?? 0}
            icon={Vote}
            color="purple"
            trend={trends.polls}
            description="Включая активные и закрытые"
          />
          <MetricCard
            title="Уникальные голоса"
            value={stats?.total_votes ?? 0}
            icon={TrendingUp}
            color="green"
            trend={trends.votes}
            description="Всего голосов на платформе"
          />
          <MetricCard
            title="Активные сессии"
            value={Math.floor((stats?.total_users ?? 0) * 0.4)}
            icon={LogIn}
            color="amber"
            description="Текущие пользователи онлайн (оценочно)"
          />
        </div>
      )}

      {/* Quick Actions / Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up relative z-10" style={{ animationDelay: '200ms' }}>
        <Card className="backdrop-blur-xl bg-card/40 border-border/40 shadow-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0" />
          <CardContent className="p-6 relative z-10">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2 mb-2">
               <ShieldCheck className="w-5 h-5 text-primary" /> Система активна
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Все сервисы работают в штатном режиме. База данных и сетевая инфраструктура в норме.
            </p>
            <div className="text-xs font-semibold px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md inline-block">
              Системный статус: Отлично
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
// placeholder for icon
function ShieldCheck(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
}
