import { apiClient } from './client'
import type {
  LoginPayload,
  RegisterPayload,
  TokenResponse,
  User,
  RefreshPayload,
} from '@/types'

export const authApi = {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>('/auth/login', payload)
    return data
  },

  async register(payload: RegisterPayload, role = payload.role ?? 'user'): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>(
      '/auth/register',
      payload,
      { params: { role } },
    )
    return data
  },

  async refresh(payload: RefreshPayload): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>('/auth/refresh', payload)
    return data
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/users/me')
    return data
  },
}
