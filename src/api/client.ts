import type { AuthResponse, Club, Member, Payout, Transaction, User } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
const TOKEN_KEY = 'parity-token'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/** The API only returns a JWT on auth, not a user object — decode the payload for id/username. */
export function decodeUserFromToken(token: string): User | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return { id: decoded.id, username: decoded.username }
  } catch {
    return null
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  clubId?: string
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.clubId) headers.ClubId = options.clubId

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(data?.message ?? data?.error ?? 'Something went wrong', res.status)
  }

  return data as T
}

export const api = {
  register: (body: { username: string; email?: string; password: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body }),

  login: (body: { username: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body }),

  // Club responses are server-computed summaries (see Club.totalMembers etc. in types),
  // not the raw model — GET routes return the enriched object, mutating routes return
  // only a { message } ack, so callers should re-fetch after create/update/delete.
  getClubs: () => request<Club[]>('/clubs'),

  getClub: (id: string) => request<Club & { members?: Member[] }>(`/clubs/${id}`),

  createClub: (body: Partial<Club> & { title: string }) =>
    request<{ message: string }>('/clubs', { method: 'POST', body }),

  updateClub: (id: string, body: Partial<Club>) =>
    request<{ message: string }>(`/clubs/${id}`, { method: 'PATCH', body }),

  deleteClub: (id: string) => request<{ message: string }>(`/clubs/${id}`, { method: 'DELETE' }),

  // clubAuth requires the ClubId header even though the club id is already in the URL
  checkMissedPayments: (id: string) =>
    request<{
      message: string
      period: string
      totalMembers?: number
      missedCount?: number
      loanedCount?: number
      loanedMembers?: { id: string; username: string; amount: number }[]
    }>(`/clubs/${id}/check-missed-payments`, { method: 'POST', clubId: id }),

  accrueInterest: (id: string) =>
    request<{
      message: string
      period: string
      totalInterestAccrued: number
      members: { memberId: string; username: string; principal: number; interest: number }[]
    }>(`/clubs/${id}/accrue-interest`, { method: 'POST', clubId: id }),

  transferOwnership: (id: string, newOwnerUserId: string) =>
    request<{ message: string; clubId: string; newOwnerUserId: string; newOwnerUsername: string }>(
      `/clubs/${id}/transfer-ownership`,
      { method: 'PATCH', clubId: id, body: { newOwnerUserId } },
    ),

  getPayout: (id: string) => request<Payout>(`/clubs/${id}/payout`, { clubId: id }),

  getMembers: (clubId: string) => request<Member[]>('/members', { clubId }),

  getMember: (clubId: string, id: string) => request<Member>(`/members/${id}`, { clubId }),

  addMember: (clubId: string, username: string) =>
    request<{ message: string }>('/members', { method: 'POST', clubId, body: { username } }),

  /** period is required, format MM-YYYY (e.g. "08-2026") — at least one amount must be > 0 */
  recordTransaction: (
    clubId: string,
    id: string,
    body: Partial<Pick<Transaction, 'investAmount' | 'interestAmount' | 'payLoanAmount' | 'loanAmount'>> & {
      period: string
    },
  ) => request<{ message: string }>(`/members/${id}`, { method: 'PATCH', clubId, body }),

  removeMember: (clubId: string, id: string) =>
    request<{ message: string }>(`/members/${id}`, { method: 'DELETE', clubId }),

  toggleTreasurer: (clubId: string, id: string) =>
    request<{ message: string; isTreasurer: boolean }>(`/members/${id}/treasurer`, { method: 'PATCH', clubId }),

  withdrawMember: (clubId: string, id: string) =>
    request<{
      message: string
      memberId: string
      username: string
      totalInvestment: number
      penalty: number
      refundAmount: number
      withdrawnAt: string
    }>(`/members/${id}/withdraw`, { method: 'POST', clubId }),

  /** Direct payment into the interest pool so a member can qualify for the ≥$25 interest-share bonus */
  payInterestPool: (clubId: string, id: string, amount: number) =>
    request<{
      message: string
      memberId: string
      username: string
      amount: number
      totalDirectPayment: number
      qualifiesForBonus: boolean
    }>(`/members/${id}/pay-interest-pool`, { method: 'POST', clubId, body: { amount } }),
}
