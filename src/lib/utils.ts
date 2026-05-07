import * as React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import axios from 'axios'
import type { PollStatus, UserRole } from '@/types'

interface ApiErrorData {
  detail?: string | Array<{ msg?: string }>
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  try { return format(parseISO(date), 'd MMM yyyy', { locale: ru }) }
  catch { return date }
}

export function formatDateTime(date: string) {
  try { return format(parseISO(date), 'd MMM yyyy, HH:mm', { locale: ru }) }
  catch { return date }
}

export function getStatusLabel(status: PollStatus | string) {
  const labels: Record<PollStatus, string> = {
    active: 'Активный',
    closed: 'Закрытый',
    draft:  'Черновик',
  }
  return labels[status as PollStatus] ?? status
}

export function getStatusColor(status: PollStatus | string) {
  void status
  return ''
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '...' : str
}

export function formatCount(value: number, noun: string) {
  return `${value.toLocaleString()} ${noun}`
}

export function getRoleLabel(role: UserRole | string) {
  const labels: Record<UserRole, string> = {
    superuser: 'Суперадмин',
    admin: 'Админ',
    user: 'Пользователь',
  }
  return labels[role as UserRole] ?? role
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorData>(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail

    const firstDetailMessage = Array.isArray(detail)
      ? detail.find(item => typeof item.msg === 'string')?.msg
      : undefined

    if (firstDetailMessage) return firstDetailMessage
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}

export const CHART_COLORS = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1',
]

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
