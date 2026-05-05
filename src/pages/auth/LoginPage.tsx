import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Vote, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button, Input, Card, CardContent } from '@/components/ui'
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background ambient glow - modern look */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] md:top-[-20%] left-[-10%] md:left-[20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-primary/10 blur-[80px] md:blur-[120px] dark:bg-primary/20" />
        <div className="absolute bottom-[-10%] md:bottom-[-20%] right-[-10%] md:right-[20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-ring/10 blur-[80px] md:blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] animate-fade-in-up">
        {/* Logo and Typography */}
        <div className="flex flex-col items-center mb-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl bg-linear-to-br from-primary to-primary/80 border border-primary/20">
            <Vote className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">С возвращением</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              Войдите в свою учетную запись EVote
            </p>
          </div>
        </div>

        <Card className="backdrop-blur-xl bg-card/80 shadow-2xl border-border/50">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="space-y-4">
                <Input
                  label="Электронная почта"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  leftIcon={<Mail className="w-4 h-4 text-muted-foreground" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <div className="relative">
                  <Input
                    label="Пароль"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    leftIcon={<Lock className="w-4 h-4 text-muted-foreground" />}
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center space-x-2 text-sm cursor-not-allowed opacity-70">
                  <input type="checkbox" className="rounded border-border text-primary cursor-not-allowed" disabled />
                  <span className="text-muted-foreground">Запомнить меня</span>
                </label>
                <a href="#" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                  Забыли пароль?
                </a>
              </div>

              <Button type="submit" className="w-full mt-4 h-11 text-base font-medium transition-transform active:scale-[0.98]" loading={loading}>
                {!loading && 'Войти'}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm mt-8 text-muted-foreground">
          У вас еще нет аккаунта?{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
