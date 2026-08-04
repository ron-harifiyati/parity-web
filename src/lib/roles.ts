import type { Club, Member, User } from '../types'

export function useClubRole(club: Club | null, members: Member[], user: User | null) {
  const currentMember = members.find((m) => m.userId === user?.id) ?? null
  const isOwner = !!user && club?.userId === user.id
  const isTreasurer = isOwner || !!currentMember?.isTreasurer
  return { currentMember, isOwner, isTreasurer }
}
