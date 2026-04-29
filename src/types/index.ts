export type UserRole = 'user' | 'admin' | 'superuser'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  avatar: string | null
  created_at: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  name: string
  password: string
  role?: UserRole
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface RefreshPayload {
  refresh_token: string
}

export interface UserUpdatePayload {
  name?: string | null
  email?: string | null
}

export type PollStatus = 'draft' | 'active' | 'closed'

export interface PollOption {
  id: number
  poll_id: number
  text: string
  vote_count: number
}

export interface Poll {
  id: number
  title: string
  description: string | null
  start_date: string
  end_date: string
  status: PollStatus | string
  created_by: number
  created_at: string
  options?: PollOption[]
}

export interface PollWithOptions extends Poll {
  options: PollOption[]
}

export interface CreatePollPayload {
  title: string
  description?: string | null
  start_date: string
  end_date: string
  options: string[]
}

export interface UpdatePollPayload {
  title?: string | null
  description?: string | null
  start_date?: string | null
  end_date?: string | null
}

export interface VoteCreate {
  option_id: number
}

export interface VoteOut {
  id: number
  user_id: number
  poll_id: number
  option_id: number
  voted_at: string
}

export interface OptionResult {
  option_id: number
  text: string
  vote_count: number
  percentage: number
}

export interface PollResults {
  poll_id: number
  total_votes: number
  results: OptionResult[]
}

export interface OptionCreatePayload {
  text: string
}

export interface UserRoleUpdate {
  role: UserRole
}

export interface SystemStats {
  total_users: number
  total_polls: number
  active_polls: number
  total_votes: number
}

export interface PollStats {
  poll_id: number
  total_votes: number
  results: OptionResult[]
}

export interface ApiRoot {
  message: string
}

export interface ValidationError {
  detail: Array<{
    loc: (string | number)[]
    msg: string
    type: string
  }>
}
