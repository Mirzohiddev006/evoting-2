import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Vote, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth.api'
import { getErrorMessage } from '@/lib/utils'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email("Неверный адрес электронной почты"),
  password: z.string().min(6, 'Пароль должен состоять минимум из 6 символов'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const tokens = await authApi.login(data)
      useAuthStore.getState().setTokens(tokens.access_token, tokens.refresh_token)
      const user = await authApi.getMe()
      setAuth(user, tokens.access_token, tokens.refresh_token)
      toast.success(`Добро пожаловать, ${user.name.split(' ')[0]}!`)
      navigate(user.role === 'admin' || user.role === 'superuser' ? '/admin' : '/dashboard')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Ошибка при входе в систему'))
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
            С возвращением
          </h1>
          <p className="text-sm mt-2 text-center" style={{ color: 'var(--muted-foreground)' }}>
            Войдите в свою учетную запись EVote
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-card p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Электронная почта"
              type="email"
              placeholder="siz@example.com"
              autoComplete="email"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Скрыть пароль' : "Показать пароль"}
                className="absolute right-3 transition-colors"
                style={{
                  top: errors.password ? '32px' : '31px',
                  color: 'var(--muted-foreground)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--foreground)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full gap-2 bg-primary text-primary-foreground h-11 text-[0.9375rem]"
              loading={loading}
            >
              Войти
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--muted-foreground)' }}>
          У вас еще нет аккаунта?{' '}
          <Link
            to="/register"
            className="font-semibold transition-colors hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
