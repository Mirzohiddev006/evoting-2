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
        background: 'color-mix(in srgb, var(--background) 70%, transparent)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105 group-hover:rotate-3"
            style={{ background: 'var(--primary)' }}
          >
            <Vote className="w-4 h-4" style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <span className="font-extrabold text-base tracking-tight text-[var(--foreground)]">
            E<span style={{ color: 'var(--primary)' }}>Vote</span>
          </span>
        </Link>

        {/* Desktop Navbar */}
        <nav className="hidden md:flex items-center gap-1 flex-1 ml-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
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
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Переключить тему"
            className="h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
              background: 'var(--card)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--primary)'
              e.currentTarget.style.borderColor = 'var(--primary)/30'
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
              {/* User Badge */}
              <div
                className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl cursor-default shadow-sm transition-all"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ring-2 ring-primary/20"
                  style={{ background: 'var(--primary)/10', color: 'var(--primary)' }}
                >
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-[var(--foreground)] max-w-[100px] truncate">
                  {user?.name.split(' ')[0]}
                </span>
                {(user?.role === 'admin' || user?.role === 'superuser') && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                    style={{ background: 'var(--primary)/15', color: 'var(--primary)' }}
                  >
                    {user?.role === 'superuser' ? 'Супер' : 'Админ'}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 rounded-xl text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 hover:shadow-sm transition-all"
                aria-label="Выйти"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3 ml-2">
              <Button variant="ghost" size="sm" className="font-semibold" onClick={() => navigate('/login')}>Войти</Button>
              <Button size="sm" className="font-semibold shadow-md hover:shadow-lg" onClick={() => navigate('/register')}>Начать</Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden h-9 w-9 rounded-xl flex items-center justify-center shadow-sm"
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

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-1.5 animate-slide-down shadow-xl"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--card)', backdropFilter: 'blur(16px)' }}
        >
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                isActive(link.to)
                  ? 'text-[var(--primary)] bg-[var(--primary)]/10 shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] hover:shadow-sm'
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-[var(--border)] my-1.5 opacity-50" />
          {!isAuthenticated ? (
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="flex-1 font-semibold"
                onClick={() => { navigate('/login'); setMobileOpen(false) }}>
                Войти
              </Button>
              <Button size="sm" className="flex-1 font-semibold"
                onClick={() => { navigate('/register'); setMobileOpen(false) }}>
                Начать
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/10 hover:text-red-500 font-semibold border-red-500/20"
              onClick={() => { handleLogout(); setMobileOpen(false) }}
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </Button>
          )}
        </div>
      )}
    </header>
  )
}
