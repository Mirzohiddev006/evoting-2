import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Vote, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth.api'
import { getErrorMessage } from '@/lib/utils'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"),
  email: z.string().email("Email manzil noto'g'ri"),
  password: z.string().min(6, 'Kamida 6 ta belgi kerak'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Parollar mos kelmadi',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

const STRENGTH_COLORS = { weak: '#ef4444', medium: '#f59e0b', strong: '#10b981' }

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const password = watch('password', '')
  const strength: 'weak' | 'medium' | 'strong' | '' =
    password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'strong'
    : password.length >= 6 ? 'medium'
    : password.length > 0 ? 'weak'
    : ''

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const tokens = await authApi.register({
        email: data.email,
        name: data.name,
        password: data.password,
      })
      // getMe so'rovi ishlashi uchun tokenlarni saqlaymiz.
      useAuthStore.getState().setTokens(tokens.access_token, tokens.refresh_token)
      const user = await authApi.getMe()
      setAuth(user, tokens.access_token, tokens.refresh_token)
      toast.success('Hisob muvaffaqiyatli yaratildi!')
      navigate('/dashboard')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Ro'yxatdan o'tish amalga oshmadi"))
      useAuthStore.getState().logout()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--background)' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, var(--primary)/8% 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      <div className="relative w-full max-w-[400px] animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{ background: 'var(--primary)' }}
          >
            <Vote className="w-6 h-6" style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            Hisob yaratish
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            So'rovnomalarda qatnashish uchun EVote'ga qo'shiling
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="To'liq ism"
                placeholder="Ali Valiyev"
                autoComplete="name"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="siz@example.com"
                autoComplete="email"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              {/* Parol kuchi */}
              <div>
                <div className="relative">
                  <Input
                    label="Parol"
                    type={showPw ? 'text' : 'password'}
                    placeholder="********"
                    autoComplete="new-password"
                    leftIcon={<Lock className="w-4 h-4" />}
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Parolni yashirish' : "Parolni ko'rsatish"}
                    className="absolute right-3 transition-colors"
                    style={{
                      top: errors.password ? '32px' : '31px',
                      color: 'var(--muted-foreground)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--foreground)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)' }}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength meter */}
                {strength && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-1 flex-1">
                      {(['weak', 'medium', 'strong'] as const).map((level, i) => (
                        <div
                          key={level}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            background:
                              (strength === 'strong') ||
                              (strength === 'medium' && i < 2) ||
                              (strength === 'weak' && i === 0)
                                ? STRENGTH_COLORS[strength]
                                : 'var(--border)',
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="text-xs font-semibold w-14"
                      style={{ color: STRENGTH_COLORS[strength] }}
                    >
                      {{ weak: 'Zaif', medium: "O'rtacha", strong: 'Kuchli' }[strength]}
                    </span>
                  </div>
                )}
              </div>

              <Input
                label="Parolni tasdiqlang"
                type="password"
                placeholder="********"
                autoComplete="new-password"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button type="submit" className="w-full gap-2" size="lg" loading={loading}>
                Hisob yaratish
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--muted-foreground)' }}>
          Hisobingiz bormi?{' '}
          <Link
            to="/login"
            className="font-semibold transition-colors"
            style={{ color: 'var(--primary)' }}
          >
            Kirish
          </Link>
        </p>
      </div>
    </div>
  )
}
