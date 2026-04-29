import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ProtectedRoute, AdminRoute, GuestRoute } from '@/components/shared/RouteGuards'
import { SidebarLayout } from '@/components/shared/SidebarLayout'
import { useThemeStore } from '@/store/themeStore'
import { Spinner } from '@/components/ui'

const LoginPage    = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const DashboardPage       = lazy(() => import('@/pages/user/DashboardPage'))
const PollDetailPage      = lazy(() => import('@/pages/user/PollDetailPage'))
const ResultsPage         = lazy(() => import('@/pages/user/ResultsPage'))
const ProfilePage         = lazy(() => import('@/pages/user/ProfilePage'))
const AdminDashboardPage  = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminPollsPage      = lazy(() => import('@/pages/admin/AdminPollsPage'))
const PollFormPage        = lazy(() => import('@/pages/admin/PollFormPage'))
const AdminUsersPage      = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminStatsPage      = lazy(() => import('@/pages/admin/AdminStatsPage'))

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner className="w-8 h-8" />
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
          {/* Auth pages — no sidebar */}
          <Route element={<GuestRoute />}>
            <Route path="/login"    element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
            <Route path="/register" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />
          </Route>

          {/* User pages — with sidebar */}
          <Route element={<ProtectedRoute />}>
            <Route element={<SidebarLayout />}>
              <Route path="/dashboard"    element={<DashboardPage />} />
              <Route path="/polls/:id"    element={<PollDetailPage />} />
              <Route path="/results/:id"  element={<ResultsPage />} />
              <Route path="/profile"      element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Admin pages — with sidebar */}
          <Route element={<AdminRoute />}>
            <Route element={<SidebarLayout />}>
              <Route path="/admin"                    element={<AdminDashboardPage />} />
              <Route path="/admin/polls"              element={<AdminPollsPage />} />
              <Route path="/admin/polls/create"       element={<PollFormPage />} />
              <Route path="/admin/polls/edit/:id"     element={<PollFormPage />} />
              <Route path="/admin/users"              element={<AdminUsersPage />} />
              <Route path="/admin/stats"              element={<AdminStatsPage />} />
            </Route>
          </Route>

          <Route path="/"  element={<Navigate to="/login" replace />} />
          <Route path="*"  element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 8px 24px hsl(252 82% 62% / 0.12)',
          },
        }}
      />
    </QueryClientProvider>
  )
}
