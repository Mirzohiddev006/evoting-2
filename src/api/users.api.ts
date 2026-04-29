import { apiClient } from './client'
import type { User, UserUpdatePayload } from '@/types'

export const usersApi = {
  async getUsers(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/users')
    return data
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/users/me')
    return data
  },

  async updateMe(payload: UserUpdatePayload): Promise<User> {
    const { data } = await apiClient.patch<User>('/users/me', payload)
    return data
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post<User>('/users/me/avatar', formData)
    return data
  },
}
