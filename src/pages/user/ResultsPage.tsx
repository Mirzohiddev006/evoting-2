import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, RefreshCw, Users, Trophy, BarChart2 } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'
import { Button, Card, CardContent, CardHeader, CardTitle, Spinner } from '@/components/ui'
import { pollsApi } from '@/api/polls.api'
import { CHART_COLORS } from '@/lib/utils'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'

const TOOLTIP_STYLE = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  fontSize: 12,
  color: 'var(--foreground)',
  boxShadow: 'var(--shadow-md)',
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const pollId = Number(id)
  const navigate = useNavigate()

  const { data: poll } = useQuery({
    queryKey: ['poll', pollId],
    queryFn: () => pollsApi.getPoll(pollId),
    enabled: !!id && !isNaN(pollId),
  })

  const { data: results, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['results', pollId],
    queryFn: () => pollsApi.getResults(pollId),
    enabled: !!id && !isNaN(pollId),
    refetchInterval: 10_000,
  })

  const exportPDF = () => {
    if (!results || !poll) return
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text(poll.title, 20, 20)
    doc.setFontSize(11)
    doc.text(`Всего голосов: ${results.total_votes}`, 20, 35)
    doc.text(`Дата создания: ${new Date().toLocaleString('ru-RU')}`, 20, 45)
    let y = 60
    results.results.forEach(r => {
      doc.text(`${r.text}: ${r.vote_count} голосов (${r.percentage}%)`, 20, y)
      y += 10
    })
    doc.save(`${poll.title.replace(/\s+/g, '_')}_results.pdf`)
    toast.success('PDF экспортирован!')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }
  if (!results) return null

  const sorted   = [...results.results].sort((a, b) => b.vote_count - a.vote_count)
  const winner   = sorted[0]
  const pieData  = sorted.map(r => ({ name: r.text, value: r.vote_count }))
  const barData  = sorted.map(r => ({ name: r.text, votes: r.vote_count, pct: r.percentage }))

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: 'var(--muted-foreground)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--foreground)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap animate-fade-in-up">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            {poll?.title ?? 'Результаты опроса'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#10b981' }}
            />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Живые результаты, обновляются каждые 10 секунд
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          <Button size="sm" onClick={exportPDF} className="gap-2">
            <Download className="w-3.5 h-3.5" />
            Экспорт в PDF
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 animate-fade-in-up animate-delay-100">
        {[
          {
            icon: <Users className="w-4.5 h-4.5" style={{ color: 'var(--primary)' }} />,
            iconBg: 'var(--primary)/10',
            value: results.total_votes.toLocaleString(),
            label: 'Всего голосов',
          },
          {
            icon: <Trophy className="w-4.5 h-4.5" style={{ color: '#10b981' }} />,
            iconBg: 'rgba(16,185,129,0.10)',
            value: winner?.text ?? '-',
            label: 'Лидирующий вариант',
            truncate: true,
          },
          {
            icon: <BarChart2 className="w-4.5 h-4.5" style={{ color: '#a855f7' }} />,
            iconBg: 'rgba(168,85,247,0.10)',
            value: `${winner?.percentage ?? 0}%`,
            label: 'Наибольшая доля',
          },
        ].map((item, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: item.iconBg }}
                >
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p
                    className={`font-bold leading-tight ${item.truncate ? 'text-sm truncate' : 'text-xl'}`}
                    style={{ color: 'var(--foreground)' }}
                  >
                    {item.value}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {item.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress bars */}
      <Card className="mb-5 animate-fade-in-up animate-delay-200">
        <CardHeader>
          <CardTitle>Распределение голосов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {sorted.map((r, i) => (
            <div key={r.option_id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {r.text}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                    {r.percentage}%
                  </span>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    ({r.vote_count.toLocaleString()})
                  </span>
                </div>
              </div>
              {/* Progress track */}
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--secondary)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${r.percentage}%`,
                    background: CHART_COLORS[i % CHART_COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in-up animate-delay-300">
        {/* Круговая диаграмма */}
        <Card>
          <CardHeader>
            <CardTitle>Круговая диаграмма</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {results.total_votes > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, i) => (
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
                className="h-[240px] flex flex-col items-center justify-center gap-2"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <BarChart2 className="w-8 h-8 opacity-30" />
                <p className="text-sm">Голосов пока нет</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Столбчатая диаграмма */}
        <Card>
          <CardHeader>
            <CardTitle>Столбчатая диаграмма</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 5, right: 8, left: -10, bottom: 5 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--accent)' }} />
                <Bar dataKey="votes" name="Голоса" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
