import { useQuery } from '@tanstack/react-query'
import { BarChart2, Users, Vote, TrendingUp, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, Button, Skeleton } from '@/components/ui'
import { MetricCard } from '@/components/shared/MetricCard'
import { statsApi } from '@/api/stats.api'
import { adminApi } from '@/api/admin.api'

const quickActions = [
  { to: '/admin/polls',  label: "So'rovnomalar", desc: "Yaratish, tahrirlash, o'chirish", icon: Vote,     iconColor: 'var(--primary)',  iconBg: 'var(--primary)/10' },
  { to: '/admin/users',  label: 'Foydalanuvchilar', desc: "Foydalanuvchilar va rollarni boshqarish", icon: Users,    iconColor: '#a855f7',          iconBg: 'rgba(168,85,247,0.10)' },
  { to: '/admin/stats',  label: 'Statistika', desc: 'Batafsil tahlil va hisobotlar', icon: BarChart2, iconColor: '#10b981',          iconBg: 'rgba(16,185,129,0.10)' },
]

export default function AdminDashboardPage() {
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['systemStats'],
    queryFn: () => statsApi.getSystemStats(),
    refetchInterval: 30_000,
  })

  const { data: polls } = useQuery({
    queryKey: ['adminPolls'],
    queryFn: () => adminApi.getPolls(),
    refetchInterval: 30_000,
  })

  const { data: users } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminApi.getUsers(),
    refetchInterval: 30_000,
  })

  // Statistikani real ma'lumotlardan hisoblaymiz.
  const totalPolls = polls?.length ?? 0
  const activePolls = polls?.filter(p => p.status === 'active').length ?? 0
  const totalUsers = users?.length ?? 0
  const totalVotes = polls?.reduce((sum, p) => {
    const optVotes = (p.options ?? []).reduce((s, o) => s + (o.vote_count ?? 0), 0)
    return sum + optVotes
  }, 0) ?? 0

  const displayTotalPolls = systemStats?.total_polls ?? totalPolls
  const displayActivePolls = systemStats?.active_polls ?? activePolls
  const displayTotalUsers = systemStats?.total_users ?? totalUsers
  const displayTotalVotes = systemStats?.total_votes ?? totalVotes

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7 animate-fade-in-up">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            Admin panel
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Ovoz berish tizimini kuzating va boshqaring
          </p>
        </div>
        <Link to="/admin/polls/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Yangi so'rovnoma
          </Button>
        </Link>
      </div>

      {/* Metric cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="animate-fade-in-up animate-delay-50">
            <MetricCard
              title="Jami so'rovnomalar" value={displayTotalPolls} icon={Vote} color="blue"
              description="Barcha vaqt"
            />
          </div>
          <div className="animate-fade-in-up animate-delay-100">
            <MetricCard
              title="Faol so'rovnomalar" value={displayActivePolls} icon={TrendingUp} color="green"
              description="Hozir ishlayapti"
            />
          </div>
          <div className="animate-fade-in-up animate-delay-150">
            <MetricCard
              title="Jami foydalanuvchilar" value={displayTotalUsers} icon={Users} color="purple"
              description="Ro'yxatdan o'tgan"
            />
          </div>
          <div className="animate-fade-in-up animate-delay-200">
            <MetricCard
              title="Jami ovozlar" value={displayTotalVotes} icon={BarChart2} color="amber"
              description="Barcha so'rovnomalarda"
            />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up animate-delay-300">
        {quickActions.map(item => (
          <Link key={item.to} to={item.to}>
            <Card
              className="transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              <CardContent className="p-4 flex items-center gap-3.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: item.iconBg }}
                >
                  <item.icon className="w-5 h-5" style={{ color: item.iconColor }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                    {item.label}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {item.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
