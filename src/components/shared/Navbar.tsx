import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { Button } from '@/components/ui'
import { Vote, Sun, Moon, LogOut, User, LayoutDashboard, ShieldCheck, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Bosh sahifa', icon: <LayoutDashboard className="w-4 h-4" /> },
        ...(user?.role === 'admin' || user?.role === 'superuser'
          ? [{ to: '/admin', label: 'Admin panel', icon: <ShieldCheck className="w-4 h-4" /> }]
          : []),
        { to: '/profile', label: 'Profil', icon: <User className="w-4 h-4" /> },
      ]
    : []

  const isActive = (to: string) =>
    to === '/admin'
      ? location.pathname.startsWith('/admin')
      : location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--background) 85%, transparent)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          className="flex items-center gap-2 group shrink-0"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"
            style={{ background: 'var(--primary)' }}
          >
            <Vote className="w-3.5 h-3.5" style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <span className="font-bold text-sm tracking-tight text-[var(--foreground)]">
            E<span style={{ color: 'var(--primary)' }}>Vote</span>
          </span>
        </Link>

        {/* Desktop navigatsiya */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 ml-4">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive(link.to)
                  ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* O'ng tomon */}
        <div className="flex items-center gap-1.5">
          {/* Mavzuni almashtirish */}
          <button
            onClick={toggleTheme}
            aria-label="Mavzuni almashtirish"
            className="h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--accent)'
              e.currentTarget.style.color = 'var(--foreground)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--muted-foreground)'
            }}
          >
            {theme === 'dark'
              ? <Sun className="w-3.5 h-3.5" />
              : <Moon className="w-3.5 h-3.5" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Foydalanuvchi belgisi */}
              <div
                className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg cursor-default"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                  style={{ background: 'var(--primary)/20', color: 'var(--primary)' }}
                >
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-[var(--foreground)] max-w-[80px] truncate">
                  {user?.name.split(' ')[0]}
                </span>
                {(user?.role === 'admin' || user?.role === 'superuser') && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ background: 'var(--primary)/15', color: 'var(--primary)' }}
                  >
                    {user?.role === 'superuser' ? 'Superadmin' : 'Admin'}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10"
                aria-label="Chiqish"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Kirish</Button>
              <Button size="sm" onClick={() => navigate('/register')}>Boshlash</Button>
            </div>
          )}

          {/* Mobil menyu */}
          <button
            className="md:hidden h-8 w-8 rounded-lg flex items-center justify-center"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
              background: 'transparent',
            }}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menyuni almashtirish"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobil menyu */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 pb-3 pt-2 flex flex-col gap-1 animate-slide-down"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--background)' }}
        >
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive(link.to)
                  ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-[var(--border)] my-1" />
          {!isAuthenticated ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1"
                onClick={() => { navigate('/login'); setMobileOpen(false) }}>
                Kirish
              </Button>
              <Button size="sm" className="flex-1"
                onClick={() => { navigate('/register'); setMobileOpen(false) }}>
                Boshlash
              </Button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Chiqish
            </button>
          )}
        </div>
      )}
    </header>
  )
}
