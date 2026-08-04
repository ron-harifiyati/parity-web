// Mirrors parity-api's routes/clubs.js sanity bounds
export const CLUB_LIMITS = {
  monthlyContribution: { min: 20, max: 10000 },
  durationMonths: { min: 1, max: 60 },
  interestRate: { min: 0, max: 50 },
  gracePeriodDays: { min: 0, max: 30 },
  earlyWithdrawalPenalty: { min: 0, max: 1000 },
} as const
