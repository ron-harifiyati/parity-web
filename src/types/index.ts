export interface User {
  id: string
  username: string
  email?: string
}

export interface Club {
  id: string
  userId: string
  title: string
  monthlyContribution: number
  startDate: string | null
  paymentDay: number
  autoLoanOnMissedPayment: boolean
  gracePeriodDays: number
  durationMonths: number
  lendingLimit: number
  interestRate: number
  earlyWithdrawalPenalty: number
  /** Only present on GET /clubs and GET /clubs/:id — server-computed, not stored */
  totalMembers?: number
  totalInvestment?: number
  totalInterest?: number
  owed?: number
  totalOwed?: number
  inHand?: number
}

export interface Member {
  id: string
  userId: string
  username: string
  email: string
  clubId: string
  isTreasurer: boolean
  lastInterestAccrualDate: string | null
  withdrawnAt: string | null
  investment: number
  interestAcrued: number
  /** Interest paid directly into the pool (separate from accrual) to help qualify for the ≥$25 interest-share bonus */
  directInterestPayment: number
  totalInvestment: number
  owing: number
  interestOwing: number
  totalOwing: number
}

export interface PayoutMember {
  memberId: string
  username: string
  baseShare: number
  interestShare: number
  total: number
  outstandingDebt: number
}

export interface Payout {
  clubId: string
  clubTitle: string
  totalContributions: number
  totalInterestPool: number
  baseSharePerMember: number
  interestSharePerQualifier: number
  numberOfQualifiers: number
  payouts: PayoutMember[]
}

export interface Transaction {
  id: string
  memberId: string
  clubId: string
  period: string
  investAmount: number
  interestAmount: number
  payLoanAmount: number
  loanAmount: number
  withdrawalAmount: number
}

export interface AuthResponse {
  message: string
  token: string
}
