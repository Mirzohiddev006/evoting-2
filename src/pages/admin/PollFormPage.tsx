import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { pollsApi } from '@/api/polls.api'
import { adminApi } from '@/api/admin.api'
import { getErrorMessage } from '@/lib/utils'
import toast from 'react-hot-toast'

const schema = z.object({
  title:       z.string().min(5, 'Kamida 5 ta belgi kerak'),
  description: z.string().min(10, 'Kamida 10 ta belgi kerak'),
  startDate:   z.string().min(1, 'Majburiy maydon'),
  endDate:     z.string().min(1, 'Majburiy maydon'),
}).refine(d => new Date(d.endDate) > new Date(d.startDate), {
  message: 'Tugash sanasi boshlanish sanasidan keyin bo\'lishi kerak',
  path: ['endDate'],
})
type FormData = z.infer<typeof schema>

export default function PollFormPage() {
  const navigate    = useNavigate()
  const qc          = useQueryClient()
  const { id }      = useParams<{ id?: string }>()
  const pollId      = id ? Number(id) : undefined
  const isEdit      = !!pollId
  const [options, setOptions] = useState(['', ''])

  const { data: existing } = useQuery({
    queryKey: ['poll', pollId],
    queryFn:  () => pollsApi.getPoll(pollId!),
    enabled:  isEdit && !!pollId,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (existing) {
      reset({
        title:       existing.title,
        description: existing.description ?? '',
        startDate:   existing.start_date.slice(0, 16),
        endDate:     existing.end_date.slice(0, 16),
      })
    }
  }, [existing, reset])

  const { mutate: createPoll, isPending: creating } = useMutation({
    mutationFn: (data: FormData) => {
      const opts = options.filter(o => o.trim())
      return adminApi.createPoll({
        title: data.title,
        description: data.description,
        start_date: new Date(data.startDate).toISOString(),
        end_date: new Date(data.endDate).toISOString(),
        options: opts,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminPolls'] })
      qc.invalidateQueries({ queryKey: ['polls'] })
      toast.success("So'rovnoma yaratildi!")
      navigate('/admin/polls')
    },
    onError: (e: unknown) => {
      toast.error(getErrorMessage(e, "So'rovnomani yaratib bo'lmadi"))
    },
  })

  const { mutate: updatePoll, isPending: updating } = useMutation({
    mutationFn: (data: FormData) => {
      return adminApi.updatePoll(pollId!, {
        title: data.title,
        description: data.description,
        start_date: new Date(data.startDate).toISOString(),
        end_date: new Date(data.endDate).toISOString(),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminPolls'] })
      qc.invalidateQueries({ queryKey: ['polls'] })
      qc.invalidateQueries({ queryKey: ['poll', pollId] })
      toast.success("So'rovnoma yangilandi!")
      navigate('/admin/polls')
    },
    onError: (e: unknown) => {
      toast.error(getErrorMessage(e, "So'rovnomani yangilab bo'lmadi"))
    },
  })

  const isPending = creating || updating

  const addOption    = () => setOptions(p => [...p, ''])
  const removeOption = (i: number) => setOptions(p => p.filter((_, idx) => idx !== i))
  const updateOption = (i: number, v: string) => setOptions(p => p.map((o, idx) => idx === i ? v : o))

  const validOptions = options.filter(o => o.trim())

  const onSubmit = (data: FormData) => {
    if (isEdit) {
      updatePoll(data)
    } else {
      createPoll(data)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: 'var(--muted-foreground)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--foreground)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        So'rovnomalarga qaytish
      </button>

      <h1
        className="text-xl font-bold mb-6 animate-fade-in-up"
        style={{ color: 'var(--foreground)' }}
      >
        {isEdit ? "So'rovnomani tahrirlash" : "Yangi so'rovnoma yaratish"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Poll details */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>So'rovnoma tafsilotlari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="So'rovnoma nomi"
              placeholder="Masalan: 2025-yilning eng yaxshi frameworki"
              error={errors.title?.message}
              {...register('title')}
            />
            <Textarea
              label="Tavsif"
              placeholder="Bu so'rovnoma nima haqida ekanini yozing..."
              rows={3}
              error={errors.description?.message}
              {...register('description')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Boshlanish sanasi va vaqti"
                type="datetime-local"
                error={errors.startDate?.message}
                {...register('startDate')}
              />
              <Input
                label="Tugash sanasi va vaqti"
                type="datetime-local"
                error={errors.endDate?.message}
                {...register('endDate')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Variantlar faqat yaratishda kiritiladi */}
        {!isEdit && (
          <Card className="animate-fade-in-up animate-delay-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ovoz variantlari</CardTitle>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: validOptions.length >= 2 ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
                    color: validOptions.length >= 2 ? '#10b981' : '#ef4444',
                  }}
                >
                  {validOptions.length} / {options.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div
                    className="flex items-center justify-center shrink-0 cursor-grab"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder={`Variant ${i + 1}`}
                      value={opt}
                      onChange={e => updateOption(i, e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => removeOption(i)}
                    disabled={options.length <= 2}
                    style={{ color: options.length <= 2 ? 'var(--muted-foreground)' : '#ef4444' }}
                    title="Variantni olib tashlash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {validOptions.length < 2 && (
                <p className="text-xs" style={{ color: '#ef4444' }}>
                  Kamida 2 ta to'g'ri variant kerak
                </p>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={options.length >= 8}
                className="w-full gap-2 mt-1"
              >
                <Plus className="w-4 h-4" />
                Variant qo'shish
                {options.length >= 8 && (
                  <span style={{ color: 'var(--muted-foreground)' }}>(maks. 8)</span>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 animate-fade-in-up animate-delay-200">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            className="flex-1"
            loading={isPending}
            disabled={!isEdit && validOptions.length < 2}
          >
            {isEdit ? "O'zgarishlarni saqlash" : "So'rovnoma yaratish"}
          </Button>
        </div>
      </form>
    </div>
  )
}
