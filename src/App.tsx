import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Navbar } from '@/components/shared/Navbar'
import { ProtectedRoute, AdminRoute, GuestRoute } from '@/components/shared/RouteGuards'
import { useThemeStore } from '@/store/themeStore'
import { Spinner } from '@/components/ui'

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const DashboardPage = lazy(() => import('@/pages/user/DashboardPage'))
const PollDetailPage = lazy(() => import('@/pages/user/PollDetailPage'))
const ResultsPage = lazy(() => import('@/pages/user/ResultsPage'))
const ProfilePage = lazy(() => import('@/pages/user/ProfilePage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminPollsPage = lazy(() => import('@/pages/admin/AdminPollsPage'))
const PollFormPage = lazy(() => import('@/pages/admin/PollFormPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminStatsPage = lazy(() => import('@/pages/admin/AdminStatsPage'))

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner className="w-8 h-8" />
    </div>
  )
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </main>
    </div>
  )
}

export default function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Guest only */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
            <Route path="/register" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />
          </Route>

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
            <Route path="/polls/:id" element={<AppLayout><PollDetailPage /></AppLayout>} />
            <Route path="/results/:id" element={<AppLayout><ResultsPage /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AppLayout><AdminDashboardPage /></AppLayout>} />
            <Route path="/admin/polls" element={<AppLayout><AdminPollsPage /></AppLayout>} />
            <Route path="/admin/polls/create" element={<AppLayout><PollFormPage /></AppLayout>} />
            <Route path="/admin/polls/edit/:id" element={<AppLayout><PollFormPage /></AppLayout>} />
            <Route path="/admin/users" element={<AppLayout><AdminUsersPage /></AppLayout>} />
            <Route path="/admin/stats" element={<AppLayout><AdminStatsPage /></AppLayout>} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
    </QueryClientProvider>
  )
}
