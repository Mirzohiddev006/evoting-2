import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/shared/AppSidebar'
import { ProtectedRoute, AdminRoute, GuestRoute } from '@/components/shared/RouteGuards'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { Spinner, Button } from '@/components/ui'
import { Sun, Moon } from 'lucide-react'

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

function Header() {
  const { theme, toggleTheme } = useThemeStore()
  const { user } = useAuthStore()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="h-4 w-px bg-border hidden md:block" />
        <h1 className="text-sm font-semibold text-foreground hidden md:block">
          Система электронного голосования
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {user && (
          <div className="flex items-center gap-3 pl-2 border-l border-border">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-semibold text-foreground leading-none">{user.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{user.role}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Suspense fallback={<PageLoader />}>{children}</Suspense>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
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
