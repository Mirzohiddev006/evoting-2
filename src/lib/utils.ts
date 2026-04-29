import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { uz } from 'date-fns/locale/uz'
import axios from 'axios'
import type { PollStatus, UserRole } from '@/types'

interface ApiErrorData {
  detail?: string | Array<{ msg?: string }>
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  try { return format(parseISO(date), 'd MMM yyyy', { locale: uz }) }
  catch { return date }
}

export function formatDateTime(date: string) {
  try { return format(parseISO(date), 'd MMM yyyy, HH:mm', { locale: uz }) }
  catch { return date }
}

export function getStatusLabel(status: PollStatus | string) {
  const labels: Record<PollStatus, string> = {
    active: 'Faol',
    closed: 'Yopilgan',
    draft:  'Kutilmoqda',
  }
  return labels[status as PollStatus] ?? status
}

// Eski moslik uchun qoldirilgan; yangi joylarda STATUS_STYLE xaritalari ishlatiladi.
export function getStatusColor(status: PollStatus | string) {
  void status
  return ''
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '...' : str
}

export function formatCount(value: number, noun: string) {
  return `${value.toLocaleString()} ta ${noun}`
}

export function getRoleLabel(role: UserRole | string) {
  const labels: Record<UserRole, string> = {
    superuser: 'Superadmin',
    admin: 'Admin',
    user: 'Foydalanuvchi',
  }
  return labels[role as UserRole] ?? role
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorData>(error)) {
    const detail = error.response?.data?.detail

    if (typeof detail === 'string') {
      return detail
    }

    const firstDetailMessage = Array.isArray(detail)
      ? detail.find(item => typeof item.msg === 'string')?.msg
      : undefined

    if (firstDetailMessage) {
      return firstDetailMessage
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export const CHART_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#6366f1', // indigo
]
