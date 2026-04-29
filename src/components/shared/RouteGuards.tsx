import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Spinner } from '@/components/ui'

function HydrationLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Spinner className="w-8 h-8" />
    </div>
  )
}

export function ProtectedRoute() {
  const { hasHydrated, isAuthenticated } = useAuthStore()
  if (!hasHydrated) return <HydrationLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

export function AdminRoute() {
  const { hasHydrated, isAuthenticated, user } = useAuthStore()
  if (!hasHydrated) return <HydrationLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin' && user?.role !== 'superuser') {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

export function GuestRoute() {
  const { hasHydrated, isAuthenticated } = useAuthStore()
  if (!hasHydrated) return <HydrationLoader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
