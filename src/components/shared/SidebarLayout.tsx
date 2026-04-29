import { useState } from 'react'
import { Link, useNavigate, useLocation, Outlet, useResolvedPath } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import {
  Vote, Sun, Moon, LogOut, User, LayoutDashboard, ShieldCheck,
  Menu, X, ChevronLeft, ChevronRight, BarChart2, Users as Users2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui'
import { Suspense } from 'react'

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner className="w-8 h-8" />
    </div>
  )
}

interface NavLink {
  to: string
  label: string
  icon: React.ElementType
  exact?: boolean
  section?: 'user' | 'admin'
}

export function SidebarLayout() {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = user?.role === 'admin' || user?.role === 'superuser'

  const userLinks: NavLink[] = [
    { to: '/dashboard', label: 'Bosh sahifa', icon: LayoutDashboard, exact: true, section: 'user' },
    { to: '/profile', label: 'Profil', icon: User, exact: true, section: 'user' },
  ]

  const adminLinks: NavLink[] = [
    { to: '/admin', label: 'Admin panel', icon: ShieldCheck, exact: true, section: 'admin' },
    { to: '/admin/polls', label: "So'rovnomalar", icon: Vote, section: 'admin' },
    { to: '/admin/users', label: 'Foydalanuvchilar', icon: Users2, section: 'admin' },
    { to: '/admin/stats', label: 'Statistika', icon: BarChart2, section: 'admin' },
  ]

  const navLinks = isAdmin ? [...userLinks, ...adminLinks] : userLinks

  const isActive = (link: NavLink) => {
    if (link.exact) {
      return location.pathname === link.to
    }
    return location.pathname === link.to || location.pathname.startsWith(link.to + '/')
  }

  const handleLogout = () => {
    setMobileOpen(false)
    logout()
    navigate('/login')
  }

  const logoEl = (
    <div className={cn('flex items-center gap-3', collapsed ? 'justify-center' : '')}>
      <div className="sidebar-logo-orb flex-shrink-0">
        <Vote className="w-[18px] h-[18px] text-white" />
      </div>
      {!collapsed && (
        <span className="font-extrabold text-[15px] tracking-tight select-none">
          <span style={{ color: 'var(--foreground)' }}>E</span>
          <span className="logo-text-gradient">Vote</span>
        </span>
      )}
    </div>
  )

  const navContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Logo header */}
      <div
        className={cn(
          'flex items-center h-[60px] border-b border-[var(--border)]',
          collapsed && !isMobile ? 'justify-center px-2' : 'px-5',
        )}
      >
        <Link
          to={isAdmin ? '/admin' : '/dashboard'}
          onClick={() => isMobile && setMobileOpen(false)}
          className="transition-opacity hover:opacity-80"
        >
          {logoEl}
        </Link>
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {isAdmin && (
          <p
            className={cn(
              'text-[10px] font-semibold uppercase tracking-widest px-3 pt-2 pb-1.5',
              collapsed && !isMobile ? 'hidden' : '',
            )}
            style={{ color: 'var(--muted-foreground)' }}
          >
            Asosiy
          </p>
        )}
        {userLinks.map(link => {
          const Icon = link.icon
          const active = isActive(link)
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => isMobile && setMobileOpen(false)}
              title={collapsed && !isMobile ? link.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150',
                collapsed && !isMobile ? 'justify-center p-3' : 'px-3 py-2.5',
                active
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]',
              )}
            >
              <Icon className={cn('flex-shrink-0 transition-none', collapsed && !isMobile ? 'w-5 h-5' : 'w-4 h-4')} />
              {(!collapsed || isMobile) && link.label}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className="h-px bg-[var(--border)] my-3 mx-2" />
            {!collapsed || isMobile ? (
              <p
                className="text-[10px] font-semibold uppercase tracking-widest px-3 pb-1.5"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Admin
              </p>
            ) : null}
            {adminLinks.map(link => {
              const Icon = link.icon
              const active = isActive(link)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => isMobile && setMobileOpen(false)}
                  title={collapsed && !isMobile ? link.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150',
                    collapsed && !isMobile ? 'justify-center p-3' : 'px-3 py-2.5',
                    active
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]',
                  )}
                >
                  <Icon className={cn('flex-shrink-0', collapsed && !isMobile ? 'w-5 h-5' : 'w-4 h-4')} />
                  {(!collapsed || isMobile) && link.label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Bottom: theme + user + logout */}
      <div className="p-3 border-t border-[var(--border)] space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={collapsed && !isMobile ? (theme === 'dark' ? "Yorug' rejim" : "Qorong'u rejim") : undefined}
          className={cn(
            'w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all',
            'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]',
            collapsed && !isMobile ? 'justify-center p-3' : 'px-3 py-2.5',
          )}
        >
          {theme === 'dark'
            ? <Sun className={cn('flex-shrink-0', collapsed && !isMobile ? 'w-5 h-5' : 'w-4 h-4')} />
            : <Moon className={cn('flex-shrink-0', collapsed && !isMobile ? 'w-5 h-5' : 'w-4 h-4')} />}
          {(!collapsed || isMobile) && (theme === 'dark' ? "Yorug' rejim" : "Qorong'u rejim")}
        </button>

        {/* User chip */}
        {(!collapsed || isMobile) && (
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}
            >
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                {user?.name.split(' ')[0]}
              </p>
              <p className="text-[10px] truncate" style={{ color: 'var(--muted-foreground)' }}>
                {user?.role === 'superuser' ? 'Superadmin' : user?.role === 'admin' ? 'Admin' : "A'zo"}
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed && !isMobile ? 'Chiqish' : undefined}
          className={cn(
            'w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all',
            'text-red-500 hover:bg-red-500/10',
            collapsed && !isMobile ? 'justify-center p-3' : 'px-3 py-2.5',
          )}
        >
          <LogOut className={cn('flex-shrink-0', collapsed && !isMobile ? 'w-5 h-5' : 'w-4 h-4')} />
          {(!collapsed || isMobile) && 'Chiqish'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 h-screen z-20 transition-all duration-300',
          'border-r border-[var(--border)]',
          collapsed ? 'w-[68px]' : 'w-[232px]',
        )}
        style={{ background: 'var(--card)' }}
      >
        {navContent(false)}

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="absolute -right-3.5 top-[72px] w-7 h-7 rounded-full flex items-center justify-center transition-all z-10"
          style={{
            background: 'var(--card)',
            border: '1.5px solid var(--border)',
            color: 'var(--muted-foreground)',
            boxShadow: 'var(--shadow)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--foreground)'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
          }}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Mobile drawer */}
      <aside
        className={cn(
          'lg:hidden flex flex-col fixed left-0 top-0 h-screen z-40 w-[248px] transition-transform duration-300',
          'border-r border-[var(--border)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ background: 'var(--card)' }}
      >
        {navContent(true)}
      </aside>

      {/* Main content area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          collapsed ? 'lg:ml-[68px]' : 'lg:ml-[232px]',
        )}
      >
        {/* Mobile top bar */}
        <header
          className="lg:hidden sticky top-0 z-10 h-[56px] flex items-center px-4 gap-3 border-b border-[var(--border)]"
          style={{
            background: 'color-mix(in srgb, var(--background) 88%, transparent)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-all"
          >
            <Menu className="w-4 h-4" />
          </button>
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2.5">
            <div className="sidebar-logo-orb w-7 h-7 rounded-[9px]">
              <Vote className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight">
              <span style={{ color: 'var(--foreground)' }}>E</span>
              <span className="logo-text-gradient">Vote</span>
            </span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
