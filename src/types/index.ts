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
  totalInvestment: number
  owing: number
  interestOwing: number
  totalOwing: number
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
