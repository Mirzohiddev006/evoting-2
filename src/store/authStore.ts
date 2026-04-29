import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  hasHydrated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
  finishHydration: () => void
  // Legacy compat - alias for accessToken
  token: string | null
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: true,

      get token() {
        return get().accessToken
      },

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      setTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken,
          isAuthenticated: Boolean(state.user && accessToken && refreshToken),
        })),

      setUser: (user) =>
        set((state) => ({
          user,
          isAuthenticated: Boolean(user && state.accessToken && state.refreshToken),
        })),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      finishHydration: () =>
        set((state) => ({
          hasHydrated: true,
          isAuthenticated: Boolean(state.user && state.accessToken && state.refreshToken),
        })),
    }),
    {
      name: 'evoting-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: (state) => (rehydratedState) => {
        const nextState = rehydratedState ?? state
        nextState.finishHydration()
      },
    },
  ),
)
