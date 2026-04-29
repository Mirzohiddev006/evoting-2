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
  email: z.string().email("Email manzil noto'g'ri"),
  password: z.string().min(6, 'Kamida 6 ta belgi kerak'),
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
      // getMe so'rovi access token bilan ishlashi uchun tokenlarni vaqtincha saqlaymiz.
      useAuthStore.getState().setTokens(tokens.access_token, tokens.refresh_token)
      const user = await authApi.getMe()
      setAuth(user, tokens.access_token, tokens.refresh_token)
      toast.success(`Xush kelibsiz, ${user.name.split(' ')[0]}!`)
      navigate(user.role === 'admin' || user.role === 'superuser' ? '/admin' : '/dashboard')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Kirish amalga oshmadi'))
      // Qisman saqlangan tokenlarni tozalaymiz.
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
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Qaytganingiz bilan</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            EVote hisobingizga kiring
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Email"
                type="email"
                placeholder="siz@example.com"
                autoComplete="email"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="relative">
                <Input
                  label="Parol"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  autoComplete="current-password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
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

              <Button type="submit" className="w-full gap-2" loading={loading} size="lg">
                Kirish
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--muted-foreground)' }}>
          Hisobingiz yo'qmi?{' '}
          <Link
            to="/register"
            className="font-semibold transition-colors"
            style={{ color: 'var(--primary)' }}
          >
            Ro'yxatdan o'ting
          </Link>
        </p>
      </div>
    </div>
  )
}
