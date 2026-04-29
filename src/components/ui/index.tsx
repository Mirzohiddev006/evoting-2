import React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

// ─── Button ──────────────────────────────────────────────────────
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl',
    'text-sm font-semibold transition-all duration-200 cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
    'disabled:pointer-events-none disabled:opacity-40',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-[var(--primary)] text-[var(--primary-foreground)]',
          'hover:opacity-90 hover:shadow-md',
          'shadow-sm',
        ].join(' '),
        destructive: [
          'bg-[var(--destructive)] text-[var(--destructive-foreground)]',
          'hover:opacity-90',
        ].join(' '),
        outline: [
          'border border-[var(--border-strong)] bg-transparent text-[var(--foreground)]',
          'hover:bg-[var(--accent)] hover:border-[var(--border-strong)]',
        ].join(' '),
        secondary: [
          'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
          'hover:bg-[var(--accent)]',
        ].join(' '),
        ghost: [
          'bg-transparent text-[var(--foreground)]',
          'hover:bg-[var(--accent)]',
        ].join(' '),
        link: 'text-[var(--primary)] underline-offset-4 hover:underline bg-transparent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm:      'h-8 rounded-lg px-3 text-xs',
        lg:      'h-11 rounded-xl px-6 text-[0.9375rem]',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

// ─── Input ───────────────────────────────────────────────────────
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex h-10 w-full rounded-xl px-3 py-2 text-sm',
              'bg-[var(--background)] text-[var(--foreground)]',
              'border border-[var(--border-strong)]',
              'placeholder:text-[var(--muted-foreground)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[var(--muted)]',
              'transition-all duration-150',
              'autofill:bg-[var(--background)]',
              leftIcon && 'pl-10',
              error && 'border-[var(--destructive)] focus-visible:ring-[var(--destructive)]/40',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[var(--destructive)] flex items-center gap-1">⚠ {error}</p>}
        {hint && !error && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ─── Textarea ────────────────────────────────────────────────────
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'flex min-h-[90px] w-full rounded-xl px-3 py-2.5 text-sm',
            'bg-[var(--background)] text-[var(--foreground)]',
            'border border-[var(--border-strong)]',
            'placeholder:text-[var(--muted-foreground)]',
            'resize-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-40',
            'transition-all duration-150',
            error && 'border-[var(--destructive)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--destructive)]">⚠ {error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// ─── Badge ───────────────────────────────────────────────────────
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors select-none',
  {
    variants: {
      variant: {
        default:     'bg-[var(--primary)]/12 text-[var(--primary)] border-[var(--primary)]/20',
        secondary:   'bg-[var(--secondary)] text-[var(--secondary-foreground)] border-[var(--border)]',
        destructive: 'bg-[var(--destructive)]/12 text-[var(--destructive)] border-[var(--destructive)]/25',
        outline:     'border-[var(--border-strong)] text-[var(--foreground)] bg-transparent',
        success:     'bg-emerald-500/12 text-emerald-500 border-emerald-500/25 dark:text-emerald-400',
        warning:     'bg-amber-500/12 text-amber-600 border-amber-500/25 dark:text-amber-400',
        muted:       'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
)

// ─── Card ────────────────────────────────────────────────────────
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)]',
        'shadow-[var(--shadow-sm)]',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1 p-5 pb-0', className)} {...props} />
)
export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-base font-semibold leading-none tracking-tight text-[var(--foreground)]', className)} {...props} />
)
export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-[var(--muted-foreground)] mt-1', className)} {...props} />
)
export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5 pt-4', className)} {...props} />
)
export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center p-5 pt-0', className)} {...props} />
)

// ─── Skeleton ────────────────────────────────────────────────────
export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('skeleton', className)} {...props} />
)

// ─── Spinner ─────────────────────────────────────────────────────
export const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={cn('animate-spin h-5 w-5 text-[var(--primary)]', className)}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

// ─── Empty State ─────────────────────────────────────────────────
export const EmptyState = ({
  icon, title, description, action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
    {icon && (
      <div className="text-[var(--muted-foreground)] opacity-30">{icon}</div>
    )}
    <div>
      <p className="font-semibold text-[var(--foreground)] text-base">{title}</p>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)] mt-1.5 max-w-xs">{description}</p>
      )}
    </div>
    {action}
  </div>
)

// ─── Progress Bar ────────────────────────────────────────────────
export const ProgressBar = ({
  value,
  className,
  color,
}: {
  value: number
  className?: string
  color?: string
}) => (
  <div className={cn('h-2 w-full rounded-full bg-[var(--secondary)] overflow-hidden', className)}>
    <div
      className="h-full rounded-full transition-all duration-700 ease-out"
      style={{
        width: `${Math.min(100, Math.max(0, value))}%`,
        background: color ?? 'var(--primary)',
      }}
    />
  </div>
)

// ─── Modal ───────────────────────────────────────────────────────
export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl',
          'shadow-[0_24px_60px_-8px_rgb(0,0,0,0.5)]',
          'animate-fade-in-up',
          sizes[size]
        )}
      >
        {title && (
          <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-[var(--border)]">
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
              {description && (
                <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-all"
              aria-label="Yopish"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Select ──────────────────────────────────────────────────────
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'flex h-10 w-full rounded-xl px-3 py-2 text-sm appearance-none',
            'bg-[var(--background)] text-[var(--foreground)]',
            'border border-[var(--border-strong)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-40',
            'transition-all duration-150 cursor-pointer',
            error && 'border-[var(--destructive)]',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23888' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            paddingRight: '36px',
          }}
          {...props}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-[var(--destructive)]">⚠ {error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

// ─── Divider ─────────────────────────────────────────────────────
export const Divider = ({ className }: { className?: string }) => (
  <hr className={cn('border-none h-px bg-[var(--border)] my-1', className)} />
)
