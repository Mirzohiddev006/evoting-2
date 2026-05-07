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
    <header className="sticky top-0 z-40 w-full border-b border-(--border) bg-(--background)/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          className="flex items-center gap-2 group shrink-0"
        >
          <div className="nav-logo-bg w-7 h-7 rounded-md flex items-center justify-center">
            <Vote className="w-3.5 h-3.5 text-(--primary-foreground)" />
          </div>
          <span className="font-bold text-sm tracking-tight text-(--foreground)">
            EVote
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 ml-4">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150',
                isActive(link.to)
                  ? 'bg-(--secondary) text-(--foreground)'
                  : 'text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--accent)'
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
            className="h-8 w-8 rounded-md border border-(--border) bg-(--background) flex items-center justify-center text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--accent) transition-colors duration-150"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* User badge */}
              <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-(--border) bg-(--secondary)">
                <div className="w-5 h-5 rounded-full bg-(--foreground) flex items-center justify-center shrink-0 text-[10px] font-bold text-(--background)">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-(--foreground) max-w-20 truncate">
                  {user?.name.split(' ')[0]}
                </span>
                {(user?.role === 'admin' || user?.role === 'superuser') && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm font-semibold bg-(--foreground) text-(--background)">
                    {user?.role === 'superuser' ? 'Super' : 'Admin'}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-(--muted-foreground) hover:text-red-500 hover:bg-red-500/10"
                aria-label="Выйти"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Войти</Button>
              <Button size="sm" onClick={() => navigate('/register')}>Начать</Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden h-8 w-8 rounded-md border border-(--border) bg-(--background) flex items-center justify-center text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--accent) transition-colors"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Меню"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-1 animate-slide-down border-t border-(--border) bg-(--background)">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive(link.to)
                  ? 'bg-(--secondary) text-(--foreground)'
                  : 'text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--accent)'
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-(--border) my-1.5" />
          {!isAuthenticated ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1"
                onClick={() => { navigate('/login'); setMobileOpen(false) }}>
                Войти
              </Button>
              <Button size="sm" className="flex-1"
                onClick={() => { navigate('/register'); setMobileOpen(false) }}>
                Начать
              </Button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
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
