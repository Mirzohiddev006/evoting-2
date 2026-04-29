import { useQuery } from '@tanstack/react-query'
import { BarChart2, TrendingUp, Users, Vote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Spinner } from '@/components/ui'
import { MetricCard } from '@/components/shared/MetricCard'
import { statsApi } from '@/api/stats.api'
import { adminApi } from '@/api/admin.api'
import { CHART_COLORS, getStatusLabel } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend,
} from 'recharts'

const TOOLTIP_STYLE = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  fontSize: 12,
  color: 'var(--foreground)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
}

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  active:  { bg: 'rgba(16,185,129,0.10)', text: '#10b981', border: 'rgba(16,185,129,0.20)' },
  closed:  { bg: 'var(--muted)',           text: 'var(--muted-foreground)', border: 'var(--border)' },
  draft:   { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b', border: 'rgba(245,158,11,0.20)' },
}

export default function AdminStatsPage() {
  const { data: systemStats } = useQuery({
    queryKey: ['systemStats'],
    queryFn: () => statsApi.getSystemStats(),
  })

  const { data: polls, isLoading } = useQuery({
    queryKey: ['adminPolls'],
    queryFn: () => adminApi.getPolls(),
  })

  const { data: users } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminApi.getUsers(),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

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

  const pollsByStatus = [
    { name: 'Faol', value: polls?.filter(p => p.status === 'active').length ?? 0 },
    { name: 'Yopilgan', value: polls?.filter(p => p.status === 'closed').length ?? 0  },
    { name: 'Kutilmoqda', value: polls?.filter(p => p.status === 'draft').length ?? 0  },
  ].filter(d => d.value > 0)

  const topPolls = polls
    ?.map(p => ({
      name: p.title.length > 22 ? p.title.slice(0, 22) + '...' : p.title,
      votes: (p.options ?? []).reduce((s, o) => s + (o.vote_count ?? 0), 0),
    }))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5) ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-7 animate-fade-in-up">
        <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Statistika</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          Batafsil tahlil ko'rinishi
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in-up">
        <MetricCard title="Jami so'rovnomalar" value={displayTotalPolls} icon={Vote} color="blue" />
        <MetricCard title="Hozir faol" value={displayActivePolls} icon={TrendingUp} color="green" />
        <MetricCard title="Jami foydalanuvchilar" value={displayTotalUsers} icon={Users} color="purple" />
        <MetricCard title="Jami ovozlar" value={displayTotalVotes} icon={BarChart2} color="amber" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5 animate-fade-in-up animate-delay-100">
        {/* Top polls bar */}
        <Card>
          <CardHeader>
            <CardTitle>Ovozlar bo'yicha yetakchi so'rovnomalar</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {topPolls.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topPolls} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    width={115}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--accent)' }} />
                  <Bar dataKey="votes" name="Ovozlar" radius={[0, 6, 6, 0]}>
                    {topPolls.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                So'rovnoma ma'lumotlari mavjud emas
              </div>
            )}
          </CardContent>
        </Card>

        {/* Holat bo'yicha doira diagramma */}
        <Card>
          <CardHeader>
            <CardTitle>Holat bo'yicha so'rovnomalar</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {pollsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pollsByStatus}
                    cx="50%"
                    cy="42%"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pollsByStatus.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="h-[240px] flex items-center justify-center text-sm"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Ma'lumot mavjud emas
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All polls table */}
      {polls && polls.length > 0 && (
        <Card className="overflow-hidden animate-fade-in-up animate-delay-200">
          <CardHeader>
            <CardTitle>Barcha so'rovnomalar natijadorligi</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-0">
            <table className="w-full evote-table">
              <thead>
                <tr>
                  {['So\'rovnoma nomi', 'Holat', 'Variantlar', 'Jami ovozlar'].map(h => (
                    <th
                      key={h}
                      className="text-left"
                      style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {polls.map(poll => {
                  const ss = STATUS_STYLE[poll.status] ?? STATUS_STYLE.closed
                  const pollVotes = (poll.options ?? []).reduce((s, o) => s + (o.vote_count ?? 0), 0)
                  return (
                    <tr key={poll.id} style={{ background: 'var(--card)' }}>
                      <td>
                        <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                          {poll.title.length > 40 ? poll.title.slice(0, 40) + '...' : poll.title}
                        </span>
                      </td>
                      <td>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border"
                          style={{ background: ss.bg, color: ss.text, borderColor: ss.border }}
                        >
                          {getStatusLabel(poll.status)}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          {(poll.options ?? []).length}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                          {pollVotes.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
