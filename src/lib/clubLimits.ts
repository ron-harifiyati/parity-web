// NOTE: these bounds are enforced here in the UI, but parity-api's routes/clubs.js does
// NOT currently enforce the same minimums server-side (interestRate/durationMonths still
// accept anything >= 1, monthlyContribution >= 1) — this is a known gap, tracked
// separately, since fixing it requires a parity-api change this session couldn't make.
export const CLUB_LIMITS = {
  monthlyContribution: { min: 20, max: 10000 },
  durationMonths: { min: 3, max: 12 },
  interestRate: { min: 10, max: 50 },
  gracePeriodDays: { min: 0, max: 30 },
  earlyWithdrawalPenalty: { min: 0, max: 1000 },
} as const
