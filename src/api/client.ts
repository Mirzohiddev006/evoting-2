import axios from 'axios'
import type { TokenResponse } from '@/types'

const DEFAULT_API_BASE = 'https://e-voting-system2.onrender.com/api'

function normalizeApiBaseUrl(url: string) {
  const cleanUrl = url.replace(/\/+$/, '')
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`
}

const API_BASE = normalizeApiBaseUrl(import.meta.env.VITE_API_URL || DEFAULT_API_BASE)

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

// Dynamically import authStore to avoid circular dependencies
let getAuthState: () => {
  accessToken: string | null
  refreshToken: string | null
  setTokens: (access: string, refresh: string) => void
  logout: () => void
}

async function ensureAuthStore() {
  if (!getAuthState) {
    const { useAuthStore } = await import('@/store/authStore')
    getAuthState = () => useAuthStore.getState()
  }
}

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

// Request interceptor: inject access token
apiClient.interceptors.request.use(
  async (config) => {
    await ensureAuthStore()
    const { accessToken } = getAuthState()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor: handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    await ensureAuthStore()

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { refreshToken } = getAuthState()
        if (!refreshToken) {
          throw new Error("Yangilash tokeni yo'q")
        }

        const { data } = await axios.post<TokenResponse>(
          `${API_BASE}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )

        getAuthState().setTokens(data.access_token, data.refresh_token)
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`
        processQueue(null, data.access_token)
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        getAuthState().logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
