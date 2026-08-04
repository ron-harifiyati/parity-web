# Parity Web — Build Prompt: Club Operations Features

## Context

`parity-web` is a React 19 + TypeScript + Vite + Tailwind CSS v4 app for Parity, a
digital platform for managing informal savings groups ("mukando"/"round"). It talks to
`parity-api` (Node/Express + Sequelize/SQLite, sibling repo at `~/Documents/projects/parity/parity-api`).

**Already built and working** (do not rebuild these — extend around them):
- Auth: register/login/logout (`src/context/AuthContext.tsx`, `src/pages/Login.tsx`, `src/pages/Register.tsx`)
- Light/dark theme system (`src/context/ThemeContext.tsx`) — palette defined in `src/index.css` (`primary` = emerald, `navy`, `charcoal`, `gold`)
- Typed API client (`src/api/client.ts`) — already covers every backend endpoint (see below), including the ones this task needs
- Type definitions matching the API's actual Sequelize models (`src/types/index.ts`)
- Routing (`src/App.tsx`), protected routes (`src/components/ProtectedRoute.tsx`)
- App shell (`src/components/AppLayout.tsx`) — desktop header nav + **mobile bottom tab bar** (most users are mobile — build mobile-first, verify at ~390px width before desktop)
- Dashboard (`src/pages/Dashboard.tsx`), club list + create (`src/pages/Clubs.tsx`), club detail (`src/pages/ClubDetail.tsx`) — currently a read-only summary + flat member list
- Settings/profile page (`src/pages/Settings.tsx`) — **logout lives here**, not in the nav. Keep it that way.

**IMPORTANT — verify before building, don't assume:** Before writing any code, re-read
`parity-api`'s actual route handlers (`routes/clubs.js`, `routes/members.js`) and models
(`models/Club.js`, `models/Member.js`, `models/Transaction.js`) yourself. This document
was written from a real read of that code as of the `main` branch, but the API may have
moved on. Also run `git log --oneline --graph --all` and `git branch -a` in `parity-api`
**and** `parity-web` before starting — check whether a feature branch already contains
some of this work before building it again from scratch. As of this writing, every club
mechanic below is already fully implemented and merged on `parity-api`'s `main` — this is
a **frontend-only** task, not a backend one. If you find that's no longer true, stop and
confirm scope before improvising backend changes.

## The gap

The backend (`parity-api`, `main` branch) already fully implements every club mechanic.
The frontend has no UI for most of it yet. Build UI for the following, all of which
already have working, tested API methods in `src/api/client.ts`:

1. **Recording transactions** (contribute, take a loan, repay a loan, pay interest)
   — `api.recordTransaction(clubId, memberId, { investAmount?, interestAmount?, payLoanAmount?, loanAmount?, period })`.
   `period` is required, format `MM-YYYY` (e.g. `"08-2026"`). At least one amount must
   be > 0. This is the core day-to-day action members and treasurers will use most —
   design it accordingly (should be fast, obvious, hard to fat-finger on mobile).

2. **Member management** — add a member by username (`api.addMember`), remove a member
   (`api.removeMember`, owner-only), toggle treasurer role (`api.toggleTreasurer`,
   owner-only), withdraw a member early (`api.withdrawMember`, owner-only — returns the
   penalty/refund breakdown, show it before confirming since it's irreversible).

3. **Treasurer admin actions** — "Check missed payments" (`api.checkMissedPayments`,
   auto-loans members who missed their period if the club has `autoLoanOnMissedPayment`
   on) and "Accrue interest" (`api.accrueInterest`, monthly, only on outstanding
   principal). Both are treasurer/owner-only, both return a summary of what changed —
   surface that summary, don't just silently refresh.

4. **Direct interest-pool payment** — `api.payInterestPool(clubId, memberId, amount)`.
   Lets a member pay directly into the interest pool to help reach the $25 qualification
   threshold for the year-end interest share (see `Member.directInterestPayment` and
   `qualifiesForBonus` in the response).

5. **Ownership transfer** — `api.transferOwnership(clubId, newOwnerUserId)`. Owner-only,
   target must be an active (non-withdrawn) member. This unblocks the current owner being
   able to withdraw themselves (the API rejects owner withdrawal until they transfer
   first) — the UI should make that dependency clear.

6. **End-of-year payout calculator** — `api.getPayout(clubId)` (`GET /clubs/:id/payout`).
   Returns each member's base share, interest share (only for members who qualified —
   see `Member.interestAcrued >= 25 OR directInterestPayment >= 25`), and net total after
   outstanding debt. This is read-only/informational, a good candidate for a dedicated
   page with a clear per-member breakdown table.

7. **Club settings editing** — `api.updateClub` and `api.deleteClub` exist but have no UI
   yet (owner-only). Club detail page currently only displays settings; add editing.

8. **Transaction history** — there's no `GET /transactions` list endpoint; transactions
   are only visible as side effects of the actions above. Decide (and note in your PR)
   whether that's a gap worth flagging back to the API, or whether per-member running
   totals (already on the `Member` object) are sufficient for now.

## Design constraints (carried over from this build, keep consistent)

- **Mobile-first.** Most users are on mobile. Build and screenshot-verify at a ~390px
  viewport before checking desktop. The bottom tab bar in `AppLayout.tsx` is the primary
  nav on mobile — if you add new top-level sections, extend it, don't rely on the
  desktop-only header links.
- **Palette**: `primary` (emerald, growth/positive), `navy` (trust/security), `charcoal`
  (neutral surfaces), `gold` (goals/highlights/premium — e.g. use it for "qualifies for
  interest bonus" states, payout totals). Don't introduce new colors outside this system.
- **Light + dark mode**: every new screen must work in both — use the `dark:` variants
  already established in existing pages as the pattern to copy.
- Role-gating matters: several actions above are owner-only or treasurer-only. The
  current `Member` list doesn't yet expose "is this the current user, and what's their
  role" cleanly to child components — you'll likely want a small helper/hook for "does
  the logged-in user own/treasure this club" rather than re-deriving it per page.
- Irreversible actions (withdraw, remove member, ownership transfer, delete club) need a
  confirmation step that shows the actual consequence (e.g. withdrawal shows the real
  penalty/refund numbers from the API response) before committing.

## Before you build: plan first

Don't start writing components immediately. First:
1. Re-verify the API surface as described above (routes + models + branches).
2. Sketch the page/flow structure for the 8 items above — how many new pages vs.
   extensions to `ClubDetail.tsx`, what's a modal vs. a full page, what the treasurer
   admin actions section looks like on `ClubDetail.tsx` (probably a collapsible
   "Treasurer tools" section, role-gated).
3. Confirm state-management approach for cross-page data (e.g. after recording a
   transaction, the member list and dashboard totals need to reflect it — currently every
   page fetches independently with no shared cache; decide whether that's still fine at
   this scope or whether it's worth introducing something lightweight).
4. Only then start implementing, one flow at a time, verifying each against the real
   running API (`node app.js` in `parity-api`, needs `.env` with a `SECRET_KEY` set) in a
   browser before moving to the next.
