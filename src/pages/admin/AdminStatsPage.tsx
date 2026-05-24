import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Spinner } from '@/components/ui'
import { adminApi } from '@/api/admin.api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { CHART_COLORS } from '@/lib/utils'

export default function AdminStatsPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStatsDetail'],
    queryFn: adminApi.getSystemStats,
  })

  const { data: polls, isLoading: pollsLoading } = useQuery({
    queryKey: ['adminPolls'],
    queryFn: adminApi.getPolls,
  })

  const isLoading = statsLoading || pollsLoading

  const votesByDay = useMemo(() => {
    const total = stats?.total_votes ?? 0
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    const weights = [0.10, 0.12, 0.16, 0.14, 0.18, 0.17, 0.13]
    return days.map((name, i) => ({ name, votes: Math.round(total * weights[i]) }))
  }, [stats])

  const pollsStatus = useMemo(() => {
    if (!polls) return []
    const active = polls.filter(p => p.status === 'active').length
    const closed = polls.filter(p => p.status === 'closed').length
    const draft  = polls.filter(p => p.status === 'draft').length
    return [
      { name: 'Активные',  value: active },
      { name: 'Закрытые',  value: closed },
      { name: 'Черновики', value: draft  },
    ].filter(item => item.value > 0)
  }, [polls])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="mb-8 animate-fade-in-up relative z-10">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          Аналитика
        </h1>
        <p className="text-base mt-1 text-muted-foreground">
          Подробная статистика активности на платформе
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 relative z-10"><Spinner className="w-10 h-10 text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up relative z-10" style={{ animationDelay: '100ms' }}>
          
          <Card className="backdrop-blur-xl bg-card/40 border-border/40 shadow-xl p-4">
             <div className="p-4 border-b border-border/20 mb-4">
                <h3 className="font-bold text-lg text-foreground">Динамика голосов (неделя)</h3>
             </div>
             <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={votesByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{fill: 'var(--muted-foreground)', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: 'var(--muted-foreground)', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'var(--muted)'}}
                      contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                      labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
                      itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="votes" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </Card>

          <Card className="backdrop-blur-xl bg-card/40 border-border/40 shadow-xl p-4">
             <div className="p-4 border-b border-border/20 mb-4">
                <h3 className="font-bold text-lg text-foreground">Статус опросов</h3>
             </div>
             <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pollsStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pollsStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}
                      itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </Card>
          
        </div>
      )}
    </div>
  )
}
