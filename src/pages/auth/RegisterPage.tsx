import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Vote, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth.api'
import { getErrorMessage } from '@/lib/utils'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, "Имя должно состоять минимум из 2 символов"),
  email: z.string().email("Неверный адрес электронной почты"),
  password: z.string().min(6, 'Пароль должен состоять минимум из 6 символов'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Пароли не совпадают',
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
      useAuthStore.getState().setTokens(tokens.access_token, tokens.refresh_token)
      const user = await authApi.getMe()
      setAuth(user, tokens.access_token, tokens.refresh_token)
      toast.success('Аккаунт успешно создан!')
      navigate('/dashboard')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Ошибка при регистрации"))
      useAuthStore.getState().logout()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      {/* Decorative orbs */}
      <div className="auth-orb auth-orb-1" aria-hidden />
      <div className="auth-orb auth-orb-2" aria-hidden />
      <div className="auth-orb auth-orb-3" aria-hidden />

      <div className="relative z-10 w-full max-w-[420px] animate-fade-in-up">
        {/* Logo & heading */}
        <div className="flex flex-col items-center mb-8">
          <div className="auth-logo-orb mb-5">
            <Vote className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Создать аккаунт
          </h1>
          <p className="text-sm mt-2 text-center" style={{ color: 'var(--muted-foreground)' }}>
            Присоединяйтесь к EVote для участия в опросах
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-card p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Полное имя"
              placeholder="Иван Иванов"
              autoComplete="name"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Электронная почта"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Password with strength meter */}
            <div>
              <div className="relative">
                <Input
                  label="Пароль"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Скрыть пароль' : "Показать пароль"}
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

              {strength && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1 flex-1">
                    {(['weak', 'medium', 'strong'] as const).map((level, i) => (
                      <div
                        key={level}
                        className="h-1.5 flex-1 rounded-full transition-all duration-300"
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
                  <span className="text-xs font-semibold w-14" style={{ color: STRENGTH_COLORS[strength] }}>
                    {{ weak: 'Слабый', medium: "Средний", strong: 'Надежный' }[strength]}
                  </span>
                </div>
              )}
            </div>

            <Input
              label="Подтвердите пароль"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              className="w-full gap-2 btn-gradient text-white border-0 h-11 text-[0.9375rem]"
              loading={loading}
            >
              Создать аккаунт
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm mt-8 mb-4" style={{ color: 'var(--muted-foreground)' }}>
          Уже есть аккаунт?{' '}
          <Link
            to="/login"
            className="font-semibold transition-colors hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
