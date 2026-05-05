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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background ambient glow - modern look */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] md:top-[-20%] left-[-10%] md:left-[20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-primary/10 blur-[80px] md:blur-[120px] dark:bg-primary/20" />
        <div className="absolute bottom-[-10%] md:bottom-[-20%] right-[-10%] md:right-[20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-ring/10 blur-[80px] md:blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] animate-fade-in-up mt-8">
        {/* Logo and Typography */}
        <div className="flex flex-col items-center mb-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl bg-linear-to-br from-primary to-primary/80 border border-primary/20">
            <Vote className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Создать аккаунт</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              Присоединяйтесь к EVote для участия в опросах
            </p>
          </div>
        </div>

        <Card className="backdrop-blur-xl bg-card/80 shadow-2xl border-border/50">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="space-y-4">
                <Input
                  label="Полное имя"
                  placeholder="Иван Иванов"
                  autoComplete="name"
                  leftIcon={<User className="w-4 h-4 text-muted-foreground" />}
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Электронная почта"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                {/* Password & Strength */}
                <div>
                  <div className="relative">
                    <Input
                      label="Пароль"
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                      error={errors.password?.message}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-[34px] p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {strength && (
                    <div className="flex items-center gap-2 mt-3 pl-1">
                      <div className="flex gap-1.5 flex-1">
                        {(['weak', 'medium', 'strong'] as const).map((level, i) => (
                          <div
                            key={level}
                            className="h-1.5 flex-1 rounded-full transition-all duration-500 ease-out"
                            style={{
                              background:
                                (strength === 'strong') ||
                                (strength === 'medium' && i < 2) ||
                                (strength === 'weak' && i === 0)
                                  ? STRENGTH_COLORS[strength]
                                  : 'var(--border)',
                              opacity: (strength === 'strong') || (strength === 'medium' && i < 2) || (strength === 'weak' && i === 0) ? 1 : 0.4
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="text-[11px] font-semibold w-16 text-right"
                        style={{ color: STRENGTH_COLORS[strength] }}
                      >
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
                  leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <Button type="submit" className="w-full mt-4 h-11 text-base font-medium transition-transform active:scale-[0.98]" loading={loading}>
                {!loading && 'Создать аккаунт'}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm mt-8 mb-4 text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
