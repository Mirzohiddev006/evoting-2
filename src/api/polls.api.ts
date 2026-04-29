import { apiClient } from './client'
import type {
  Poll,
  PollWithOptions,
  VoteCreate,
  VoteOut,
  PollResults,
  PollStatus,
} from '@/types'

export const pollsApi = {
  async getPolls(status?: PollStatus): Promise<Poll[]> {
    const { data } = await apiClient.get<Poll[]>('/polls', {
      params: status ? { status } : undefined,
    })
    return data
  },

  async getPoll(id: number): Promise<PollWithOptions> {
    const { data } = await apiClient.get<PollWithOptions>(`/polls/${id}`)
    return data
  },

  async castVote(pollId: number, payload: VoteCreate): Promise<VoteOut> {
    const { data } = await apiClient.post<VoteOut>(`/polls/${pollId}/vote`, payload)
    return data
  },

  async getResults(pollId: number): Promise<PollResults> {
    const { data } = await apiClient.get<PollResults>(`/polls/${pollId}/results`)
    return data
  },
}
