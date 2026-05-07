import { apiClient } from './client'
import type {
  Poll,
  PollWithOptions,
  CreatePollPayload,
  UpdatePollPayload,
  PollOption,
  OptionCreatePayload,
  User,
  UserRoleUpdate,
  SystemStats,
} from '@/types'

export const adminApi = {
  async getSystemStats(): Promise<SystemStats> {
    const { data } = await apiClient.get<SystemStats>('/stats')
    return data
  },

  async getPolls(): Promise<PollWithOptions[]> {
    const { data } = await apiClient.get<PollWithOptions[]>('/admin/polls')
    return data
  },

  // ─── Polls ──────────────────────────────────────────
  async createPoll(payload: CreatePollPayload): Promise<PollWithOptions> {
    const { data } = await apiClient.post<PollWithOptions>('/admin/polls', payload)
    return data
  },

  async updatePoll(pollId: number, payload: UpdatePollPayload): Promise<Poll> {
    const { data } = await apiClient.put<Poll>(`/admin/polls/${pollId}`, payload)
    return data
  },

  async deletePoll(pollId: number): Promise<void> {
    await apiClient.delete(`/admin/polls/${pollId}`)
  },

  async startPoll(pollId: number): Promise<Poll> {
    const { data } = await apiClient.post<Poll>(`/admin/polls/${pollId}/start`)
    return data
  },

  async stopPoll(pollId: number): Promise<Poll> {
    const { data } = await apiClient.post<Poll>(`/admin/polls/${pollId}/stop`)
    return data
  },

  async addOption(pollId: number, payload: OptionCreatePayload): Promise<PollOption> {
    const { data } = await apiClient.post<PollOption>(`/admin/polls/${pollId}/options`, payload)
    return data
  },

  async deleteOption(pollId: number, optionId: number): Promise<void> {
    await apiClient.delete(`/admin/polls/${pollId}/options/${optionId}`)
  },

  // ─── Users ──────────────────────────────────────────
  async getUsers(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/admin/users')
    return data
  },

  async changeUserRole(userId: number, payload: UserRoleUpdate): Promise<User> {
    const { data } = await apiClient.patch<User>(`/admin/users/${userId}/role`, payload)
    return data
  },

  async deleteUser(userId: number): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`)
  },
}
