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
        { to: '/dashboard', label: 'Главная', icon: <LayoutDashboard className="w-4 h-4" /> },
        ...(user?.role === 'admin' || user?.role === 'superuser'
          ? [{ to: '/admin', label: 'Админ Панель', icon: <ShieldCheck className="w-4 h-4" /> }]
          : []),
        { to: '/profile', label: 'Профиль', icon: <User className="w-4 h-4" /> },
      ]
    : []

  const isActive = (to: string) =>
    to === '/admin'
      ? location.pathname.startsWith('/admin')
      : location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <header
      className="sticky top-0 z-40 w-full transition-all duration-200"
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--background) 82%, transparent)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[58px] flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div className="nav-logo-bg w-8 h-8 rounded-[10px] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <Vote className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-[15px] tracking-tight">
            <span style={{ color: 'var(--foreground)' }}>E</span>
            <span className="text-gradient">Vote</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 ml-4">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive(link.to)
                  ? 'text-[var(--primary)] bg-[var(--primary)]/10 shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] hover:shadow-sm'
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Переключить тему"
            className="h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-150"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
              background: 'var(--card)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--accent)'
              e.currentTarget.style.color = 'var(--foreground)'
              e.currentTarget.style.borderColor = 'var(--border-strong)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--muted-foreground)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            {theme === 'dark'
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* User badge */}
              <div
                className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-default"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(252 82% 62%), hsl(220 80% 58%))' }}
                >
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-[var(--foreground)] max-w-[80px] truncate">
                  {user?.name.split(' ')[0]}
                </span>
                {(user?.role === 'admin' || user?.role === 'superuser') && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: 'hsl(252 82% 62% / 0.12)',
                      color: 'var(--primary)',
                      border: '1px solid hsl(252 82% 62% / 0.20)',
                    }}
                  >
                    {user?.role === 'superuser' ? 'Супер' : 'Админ'}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                aria-label="Выйти"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Войти</Button>
              <Button
                size="sm"
                onClick={() => navigate('/register')}
                className="btn-gradient text-white border-0"
              >
                Начать
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden h-8 w-8 rounded-xl flex items-center justify-center"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
              background: 'var(--card)'
            }}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Меню"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-1 animate-slide-down"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--background)' }}
        >
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive(link.to)
                  ? 'text-[var(--primary)] bg-[var(--primary)]/10 shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] hover:shadow-sm'
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-[var(--border)] my-1.5" />
          {!isAuthenticated ? (
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="flex-1 font-semibold"
                onClick={() => { navigate('/login'); setMobileOpen(false) }}>
                Войти
              </Button>
              <Button
                size="sm"
                className="flex-1 btn-gradient text-white border-0"
                onClick={() => { navigate('/register'); setMobileOpen(false) }}
              >
                Начать
              </Button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          )}
        </div>
      )}
    </header>
  )
}
