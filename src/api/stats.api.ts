import { apiClient } from './client'
import type { ApiRoot, PollStats, SystemStats } from '@/types'

export const statsApi = {
  async getSystemStats(): Promise<SystemStats> {
    const { data } = await apiClient.get<SystemStats>('/stats')
    return data
  },

  async getPollStats(pollId: number): Promise<PollStats> {
    const { data } = await apiClient.get<PollStats>(`/stats/${pollId}`)
    return data
  },

  async getApiRoot(): Promise<ApiRoot> {
    const { data } = await apiClient.get<ApiRoot>('/')
    return data
  },
}
