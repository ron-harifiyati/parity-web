import type { AuthResponse, Club, Member, Transaction, User } from '../types'

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

  getClubs: () => request<Club[]>('/clubs'),

  getClub: (id: string) => request<Club & { members?: Member[] }>(`/clubs/${id}`),

  createClub: (body: Partial<Club> & { title: string }) =>
    request<Club>('/clubs', { method: 'POST', body }),

  updateClub: (id: string, body: Partial<Club>) =>
    request<Club>(`/clubs/${id}`, { method: 'PATCH', body }),

  deleteClub: (id: string) => request<void>(`/clubs/${id}`, { method: 'DELETE' }),

  checkMissedPayments: (id: string) =>
    request<unknown>(`/clubs/${id}/check-missed-payments`, { method: 'POST' }),

  accrueInterest: (id: string) =>
    request<unknown>(`/clubs/${id}/accrue-interest`, { method: 'POST' }),

  transferOwnership: (id: string, newOwnerUserId: string) =>
    request<Club>(`/clubs/${id}/transfer-ownership`, { method: 'PATCH', body: { newOwnerUserId } }),

  getMembers: (clubId: string) => request<Member[]>('/members', { clubId }),

  getMember: (clubId: string, id: string) => request<Member>(`/members/${id}`, { clubId }),

  addMember: (clubId: string, username: string) =>
    request<Member>('/members', { method: 'POST', clubId, body: { username } }),

  recordTransaction: (
    clubId: string,
    id: string,
    body: Partial<Pick<Transaction, 'investAmount' | 'interestAmount' | 'payLoanAmount' | 'loanAmount'>>,
  ) => request<Member>(`/members/${id}`, { method: 'PATCH', clubId, body }),

  removeMember: (clubId: string, id: string) =>
    request<void>(`/members/${id}`, { method: 'DELETE', clubId }),

  toggleTreasurer: (clubId: string, id: string) =>
    request<Member>(`/members/${id}/treasurer`, { method: 'PATCH', clubId }),

  withdrawMember: (clubId: string, id: string) =>
    request<Member>(`/members/${id}/withdraw`, { method: 'POST', clubId }),
}
