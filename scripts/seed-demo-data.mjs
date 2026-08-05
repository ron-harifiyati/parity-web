#!/usr/bin/env node
/**
 * Seeds parity-api (expected running at http://localhost:3000) with a set of
 * realistic accounts and clubs that cover the interesting states of the app:
 * a brand new club, an actively-running club with loans/interest/payout
 * contrast, a club with a withdrawn member, a club that has run its full
 * duration, a club demonstrating treasurer delegation, and a club set up so
 * a real "check missed payments" run finds a genuinely missed period and
 * auto-loans it.
 *
 * Safe to re-run: users are looked up/logged-in instead of re-registered,
 * and a club is skipped (not re-seeded) if the owner already has a club
 * with the same title.
 *
 * Usage:  node scripts/seed-demo-data.mjs
 * Env:    API_BASE_URL (default http://localhost:3000)
 */

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000'
const PASSWORD = 'Password123!'

// This account owns Club B (the richest scenario — loans, interest accrual, a real
// payout bonus contrast) and is also added as a plain member of every other seeded
// club below, so a single login can browse nearly all the demo data without switching
// accounts.
const HUB_USERNAME = 'nyasha_chikafu'

/** Periods are generated relative to "now" so the script stays meaningful whenever it's run. */
function periodMonthsAgo(n) {
  const d = new Date()
  d.setDate(1) // pin to the 1st so month arithmetic can't roll over unexpectedly
  d.setMonth(d.getMonth() - n)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${mm}-${d.getFullYear()}`
}

async function req(path, { method = 'GET', token, clubId, body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (clubId) headers.ClubId = clubId

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? res.statusText
    throw new Error(`${method} ${path} -> ${res.status}: ${msg}`)
  }
  return data
}

async function registerOrLogin(username, email) {
  try {
    const { token } = await req('/auth/register', {
      method: 'POST',
      body: { username, email, password: PASSWORD },
    })
    console.log(`  + registered ${username}`)
    return token
  } catch (err) {
    if (!String(err.message).includes('409')) throw err
    const { token } = await req('/auth/login', { method: 'POST', body: { username, password: PASSWORD } })
    console.log(`  · ${username} already exists, logged in`)
    return token
  }
}

/** Returns the club id, creating the club only if this owner doesn't already have one with this title. */
async function ensureClub(ownerToken, spec) {
  const existing = await req('/clubs', { token: ownerToken })
  const found = existing.find((c) => c.title === spec.title)
  if (found) {
    console.log(`  · club "${spec.title}" already exists, skipping seed`)
    return { id: found.id, alreadyExisted: true }
  }
  await req('/clubs', { method: 'POST', token: ownerToken, body: spec })
  const clubs = await req('/clubs', { token: ownerToken })
  const created = clubs.find((c) => c.title === spec.title)
  console.log(`  + created club "${spec.title}"`)
  return { id: created.id, alreadyExisted: false }
}

async function addMember(ownerToken, clubId, username) {
  await req('/members', { method: 'POST', token: ownerToken, clubId, body: { username } })
}

async function membersByUsername(token, clubId) {
  const list = await req('/members', { token, clubId })
  return Object.fromEntries(list.map((m) => [m.username, m]))
}

async function tx(token, clubId, memberId, body) {
  await req(`/members/${memberId}`, { method: 'PATCH', token, clubId, body })
}

/** Adds `username` to a club (as a plain member) unless already a member. Idempotent. */
async function ensureMember(ownerToken, clubId, username) {
  const members = await req('/members', { token: ownerToken, clubId })
  if (members.some((m) => m.username === username)) return false
  await addMember(ownerToken, clubId, username)
  return true
}

async function main() {
  console.log(`Seeding demo data against ${API_BASE_URL}\n`)

  // ---------------------------------------------------------------------
  // Club A — brand new club, just created, only the owner as a member
  // ---------------------------------------------------------------------
  {
    console.log('Club A: brand new club')
    const tendaiToken = await registerOrLogin('tendai_mukamuri', 'tendai.mukamuri@example.com')
    await ensureClub(tendaiToken, {
      title: 'Sunrise Trading Circle',
      monthlyContribution: 40,
      durationMonths: 12,
      interestRate: 10,
      paymentDay: 5,
      gracePeriodDays: 3,
      earlyWithdrawalPenalty: 15,
      autoLoanOnMissedPayment: true,
    })
    console.log()
  }

  // ---------------------------------------------------------------------
  // Club B — actively running: 6 members, 6 months of history, a loan +
  // partial repayment, interest accrual, and a payout qualifier contrast
  // ---------------------------------------------------------------------
  {
    console.log('Club B: actively running club')
    const nyashaToken = await registerOrLogin('nyasha_chikafu', 'nyasha.chikafu@example.com')
    await registerOrLogin('chipo_matsika', 'chipo.matsika@example.com')
    await registerOrLogin('farai_gumbo', 'farai.gumbo@example.com')
    await registerOrLogin('rudo_nyathi', 'rudo.nyathi@example.com')
    await registerOrLogin('blessing_dube', 'blessing.dube@example.com')
    await registerOrLogin('tatenda_marufu', 'tatenda.marufu@example.com')

    const { id: clubId, alreadyExisted } = await ensureClub(nyashaToken, {
      title: 'Mbare Vendors Fund',
      monthlyContribution: 50,
      durationMonths: 12,
      interestRate: 10,
      paymentDay: 20,
      gracePeriodDays: 5,
      earlyWithdrawalPenalty: 20,
      autoLoanOnMissedPayment: true,
    })

    if (!alreadyExisted) {
      for (const u of ['chipo_matsika', 'farai_gumbo', 'rudo_nyathi', 'blessing_dube', 'tatenda_marufu']) {
        await addMember(nyashaToken, clubId, u)
      }
      const m = await membersByUsername(nyashaToken, clubId)

      // 6 months of contributions for everyone
      for (let monthsAgo = 6; monthsAgo >= 1; monthsAgo--) {
        const period = periodMonthsAgo(monthsAgo)
        for (const username of ['nyasha_chikafu', 'chipo_matsika', 'farai_gumbo', 'rudo_nyathi', 'blessing_dube', 'tatenda_marufu']) {
          const body = { period, investAmount: 50 }
          // farai takes a loan 3 months ago, repays part of it 1 month ago
          if (username === 'farai_gumbo' && monthsAgo === 3) body.loanAmount = 150
          if (username === 'farai_gumbo' && monthsAgo === 1) body.payLoanAmount = 60
          // tatenda records an actual interest payment -> feeds the real interest pool
          // (the payout calculator only pools interestAcrued, not direct pool payments)
          if (username === 'tatenda_marufu' && monthsAgo === 2) body.interestAmount = 28
          await tx(nyashaToken, clubId, m[username].id, body)
        }
      }

      // rudo also pays $30 directly into the interest pool -> qualifies via the other path
      // (directInterestPayment >= 25), splitting tatenda's real interest pool with her
      await req(`/members/${m.rudo_nyathi.id}/pay-interest-pool`, {
        method: 'POST',
        token: nyashaToken,
        clubId,
        body: { amount: 30 },
      })
      // blessing never pays interest -> does not qualify, giving Payout a real contrast

      // accrue interest once (hits farai, who still has an outstanding loan balance)
      await req(`/clubs/${clubId}/accrue-interest`, { method: 'POST', token: nyashaToken, clubId })

      console.log('  + 6 members, 6 months history, farai has a loan + partial repayment, tatenda + rudo qualify for a real payout bonus (two different ways), blessing does not, interest accrued once')
    }
    console.log()
  }

  // ---------------------------------------------------------------------
  // Club C — a member has left: a few months of history, then withdrawn
  // ---------------------------------------------------------------------
  {
    console.log('Club C: a member has left')
    const kudzaiToken = await registerOrLogin('kudzai_mutasa', 'kudzai.mutasa@example.com')
    await registerOrLogin('panashe_zhou', 'panashe.zhou@example.com')
    await registerOrLogin('memory_chirwa', 'memory.chirwa@example.com')
    await registerOrLogin('shamiso_gono', 'shamiso.gono@example.com')

    const { id: clubId, alreadyExisted } = await ensureClub(kudzaiToken, {
      title: 'Chitungwiza Housing Club',
      monthlyContribution: 30,
      durationMonths: 12,
      interestRate: 8,
      paymentDay: 10,
      gracePeriodDays: 3,
      earlyWithdrawalPenalty: 25,
      autoLoanOnMissedPayment: true,
    })

    if (!alreadyExisted) {
      for (const u of ['panashe_zhou', 'memory_chirwa', 'shamiso_gono']) {
        await addMember(kudzaiToken, clubId, u)
      }
      const m = await membersByUsername(kudzaiToken, clubId)

      for (let monthsAgo = 4; monthsAgo >= 1; monthsAgo--) {
        const period = periodMonthsAgo(monthsAgo)
        for (const username of ['kudzai_mutasa', 'panashe_zhou', 'memory_chirwa', 'shamiso_gono']) {
          await tx(kudzaiToken, clubId, m[username].id, { period, investAmount: 30 })
        }
      }

      await req(`/members/${m.panashe_zhou.id}/withdraw`, { method: 'POST', token: kudzaiToken, clubId })
      console.log('  + 4 months history, panashe_zhou withdrawn (penalty deducted, refund recorded)')
    }
    console.log()
  }

  // ---------------------------------------------------------------------
  // Club D — wrapped up: short duration, contributions covering the full
  // duration, so the payout calculator has a complete picture
  // ---------------------------------------------------------------------
  {
    console.log('Club D: wrapped up / near the end of its duration')
    const takudzwaToken = await registerOrLogin('takudzwa_moyo', 'takudzwa.moyo@example.com')
    await registerOrLogin('vimbai_sibanda', 'vimbai.sibanda@example.com')
    await registerOrLogin('tinashe_chidzonga', 'tinashe.chidzonga@example.com')
    await registerOrLogin('tapiwa_makoni', 'tapiwa.makoni@example.com')

    const { id: clubId, alreadyExisted } = await ensureClub(takudzwaToken, {
      title: 'Founders Stokvel',
      monthlyContribution: 60,
      durationMonths: 4,
      interestRate: 12,
      paymentDay: 25,
      gracePeriodDays: 2,
      earlyWithdrawalPenalty: 20,
      autoLoanOnMissedPayment: true,
    })

    if (!alreadyExisted) {
      for (const u of ['vimbai_sibanda', 'tinashe_chidzonga', 'tapiwa_makoni']) {
        await addMember(takudzwaToken, clubId, u)
      }
      const m = await membersByUsername(takudzwaToken, clubId)

      for (let monthsAgo = 4; monthsAgo >= 1; monthsAgo--) {
        const period = periodMonthsAgo(monthsAgo)
        for (const username of ['takudzwa_moyo', 'vimbai_sibanda', 'tinashe_chidzonga', 'tapiwa_makoni']) {
          const body = { period, investAmount: 60 }
          if (username === 'tinashe_chidzonga' && monthsAgo === 3) body.loanAmount = 60
          if (username === 'tinashe_chidzonga' && monthsAgo === 1) body.payLoanAmount = 30
          // tapiwa records an actual interest payment -> feeds the real interest pool
          if (username === 'tapiwa_makoni' && monthsAgo === 2) body.interestAmount = 26
          await tx(takudzwaToken, clubId, m[username].id, body)
        }
      }

      // vimbai also qualifies via a direct interest-pool payment, splitting tapiwa's real pool
      await req(`/members/${m.vimbai_sibanda.id}/pay-interest-pool`, {
        method: 'POST',
        token: takudzwaToken,
        clubId,
        body: { amount: 25 },
      })
      await req(`/clubs/${clubId}/accrue-interest`, { method: 'POST', token: takudzwaToken, clubId })

      console.log('  + full 4-month duration contributed by all 4 members, tinashe has a partially-repaid loan, tapiwa + vimbai qualify for a real payout bonus')
    }
    console.log()
  }

  // ---------------------------------------------------------------------
  // Club E — role delegation: owner promotes a member to treasurer, and
  // that treasurer (not the owner) records some of the transactions
  // ---------------------------------------------------------------------
  {
    console.log('Club E: role delegation (non-owner treasurer)')
    const fadzaiToken = await registerOrLogin('fadzai_mangwana', 'fadzai.mangwana@example.com')
    const praiseToken = await registerOrLogin('praise_madziva', 'praise.madziva@example.com')
    await registerOrLogin('rutendo_masuku', 'rutendo.masuku@example.com')
    await registerOrLogin('tafadzwa_ncube', 'tafadzwa.ncube@example.com')

    const { id: clubId, alreadyExisted } = await ensureClub(fadzaiToken, {
      title: 'Borrowdale Business Circle',
      monthlyContribution: 45,
      durationMonths: 12,
      interestRate: 9,
      paymentDay: 12,
      gracePeriodDays: 4,
      earlyWithdrawalPenalty: 15,
      autoLoanOnMissedPayment: true,
    })

    if (!alreadyExisted) {
      for (const u of ['praise_madziva', 'rutendo_masuku', 'tafadzwa_ncube']) {
        await addMember(fadzaiToken, clubId, u)
      }
      let m = await membersByUsername(fadzaiToken, clubId)

      // owner promotes praise_madziva to treasurer
      await req(`/members/${m.praise_madziva.id}/treasurer`, { method: 'PATCH', token: fadzaiToken, clubId })
      m = await membersByUsername(fadzaiToken, clubId)

      // owner records the first two months
      for (const monthsAgo of [4, 3]) {
        const period = periodMonthsAgo(monthsAgo)
        for (const username of ['fadzai_mangwana', 'praise_madziva', 'rutendo_masuku', 'tafadzwa_ncube']) {
          await tx(fadzaiToken, clubId, m[username].id, { period, investAmount: 45 })
        }
      }
      // the non-owner treasurer (praise) records the rest, including a loan for rutendo
      for (const monthsAgo of [2, 1]) {
        const period = periodMonthsAgo(monthsAgo)
        for (const username of ['fadzai_mangwana', 'praise_madziva', 'rutendo_masuku', 'tafadzwa_ncube']) {
          const body = { period, investAmount: 45 }
          if (username === 'rutendo_masuku' && monthsAgo === 2) body.loanAmount = 50
          await tx(praiseToken, clubId, m[username].id, body)
        }
      }

      console.log('  + praise_madziva promoted to treasurer and recorded the last 2 months of transactions (incl. a loan) instead of the owner')
    }
    console.log()
  }

  // ---------------------------------------------------------------------
  // Club F — a real missed payment: paymentDay/gracePeriodDays set so the
  // grace period for last month has already lapsed, two members have no
  // transaction for that period, then we trigger check-missed-payments
  // for real so the auto-loan state is visible immediately.
  // ---------------------------------------------------------------------
  {
    console.log('Club F: real missed payment (triggered)')
    const godfreyToken = await registerOrLogin('godfrey_nyamande', 'godfrey.nyamande@example.com')
    await registerOrLogin('tanaka_mupfumira', 'tanaka.mupfumira@example.com')
    await registerOrLogin('rufaro_chitiyo', 'rufaro.chitiyo@example.com')

    const { id: clubId, alreadyExisted } = await ensureClub(godfreyToken, {
      title: 'Highfield Traders Group',
      monthlyContribution: 35,
      durationMonths: 12,
      interestRate: 10,
      paymentDay: 1,
      gracePeriodDays: 1,
      earlyWithdrawalPenalty: 15,
      autoLoanOnMissedPayment: true,
    })

    if (!alreadyExisted) {
      for (const u of ['tanaka_mupfumira', 'rufaro_chitiyo']) {
        await addMember(godfreyToken, clubId, u)
      }
      const m = await membersByUsername(godfreyToken, clubId)

      // everyone pays for months 5..2 ago
      for (let monthsAgo = 5; monthsAgo >= 2; monthsAgo--) {
        const period = periodMonthsAgo(monthsAgo)
        for (const username of ['godfrey_nyamande', 'tanaka_mupfumira', 'rufaro_chitiyo']) {
          await tx(godfreyToken, clubId, m[username].id, { period, investAmount: 35 })
        }
      }
      // last month (the period check-missed-payments will actually examine): only the
      // owner pays — tanaka and rufaro deliberately miss it
      await tx(godfreyToken, clubId, m.godfrey_nyamande.id, { period: periodMonthsAgo(1), investAmount: 35 })

      // trigger it for real: with paymentDay=1, gracePeriodDays=1, last month's grace
      // period has lapsed by the time this script runs (any day from the 3rd onward),
      // so this actually finds tanaka + rufaro missing and auto-loans them $35 each
      const result = await req(`/clubs/${clubId}/check-missed-payments`, {
        method: 'POST',
        token: godfreyToken,
        clubId,
      })
      console.log(`  + missed-payments check ran for real: ${JSON.stringify(result)}`)
    }
    console.log()
  }

  // ---------------------------------------------------------------------
  // Club G — edge case: only 2 members total
  // ---------------------------------------------------------------------
  {
    console.log('Club G: two-member club')
    const itaiToken = await registerOrLogin('itai_masiyiwa', 'itai.masiyiwa@example.com')
    await registerOrLogin('rumbidzai_zvobgo', 'rumbidzai.zvobgo@example.com')

    const { id: clubId, alreadyExisted } = await ensureClub(itaiToken, {
      title: 'Glen View Pair Fund',
      monthlyContribution: 25,
      durationMonths: 6,
      interestRate: 5,
      paymentDay: 15,
      gracePeriodDays: 5,
      earlyWithdrawalPenalty: 10,
      autoLoanOnMissedPayment: true,
    })

    if (!alreadyExisted) {
      await addMember(itaiToken, clubId, 'rumbidzai_zvobgo')
      const m = await membersByUsername(itaiToken, clubId)

      for (let monthsAgo = 3; monthsAgo >= 1; monthsAgo--) {
        const period = periodMonthsAgo(monthsAgo)
        for (const username of ['itai_masiyiwa', 'rumbidzai_zvobgo']) {
          await tx(itaiToken, clubId, m[username].id, { period, investAmount: 25 })
        }
      }
      console.log('  + just 2 members, 3 months of clean history')
    }
    console.log()
  }

  // ---------------------------------------------------------------------
  // Club H — edge case: the owner themself has an outstanding loan
  // ---------------------------------------------------------------------
  {
    console.log('Club H: owner has an outstanding loan')
    const simbaToken = await registerOrLogin('simbarashe_jenya', 'simbarashe.jenya@example.com')
    await registerOrLogin('chiedza_mhaka', 'chiedza.mhaka@example.com')
    await registerOrLogin('nomsa_dziva', 'nomsa.dziva@example.com')

    const { id: clubId, alreadyExisted } = await ensureClub(simbaToken, {
      title: 'Avondale Growth Club',
      monthlyContribution: 50,
      durationMonths: 12,
      interestRate: 10,
      paymentDay: 18,
      gracePeriodDays: 4,
      earlyWithdrawalPenalty: 20,
      autoLoanOnMissedPayment: true,
    })

    if (!alreadyExisted) {
      for (const u of ['chiedza_mhaka', 'nomsa_dziva']) {
        await addMember(simbaToken, clubId, u)
      }
      const m = await membersByUsername(simbaToken, clubId)

      for (let monthsAgo = 4; monthsAgo >= 1; monthsAgo--) {
        const period = periodMonthsAgo(monthsAgo)
        for (const username of ['simbarashe_jenya', 'chiedza_mhaka', 'nomsa_dziva']) {
          const body = { period, investAmount: 50 }
          if (username === 'simbarashe_jenya' && monthsAgo === 3) body.loanAmount = 100
          if (username === 'simbarashe_jenya' && monthsAgo === 1) body.payLoanAmount = 40
          await tx(simbaToken, clubId, m[username].id, body)
        }
      }
      await req(`/clubs/${clubId}/accrue-interest`, { method: 'POST', token: simbaToken, clubId })
      console.log('  + owner simbarashe_jenya took a $100 loan against their own club, repaid $40, interest accrued on the remainder')
    }
    console.log()
  }

  // ---------------------------------------------------------------------
  // Hub account: add nyasha_chikafu (owner of Mbare Vendors Fund) as a
  // plain member of every other seeded club, so one login can browse
  // nearly everything without switching accounts.
  // ---------------------------------------------------------------------
  {
    console.log(`Hub account: adding ${HUB_USERNAME} to the other clubs`)
    const otherClubs = [
      { owner: 'tendai_mukamuri', email: 'tendai.mukamuri@example.com', title: 'Sunrise Trading Circle' },
      { owner: 'kudzai_mutasa', email: 'kudzai.mutasa@example.com', title: 'Chitungwiza Housing Club' },
      { owner: 'takudzwa_moyo', email: 'takudzwa.moyo@example.com', title: 'Founders Stokvel' },
      { owner: 'fadzai_mangwana', email: 'fadzai.mangwana@example.com', title: 'Borrowdale Business Circle' },
      { owner: 'godfrey_nyamande', email: 'godfrey.nyamande@example.com', title: 'Highfield Traders Group' },
      { owner: 'itai_masiyiwa', email: 'itai.masiyiwa@example.com', title: 'Glen View Pair Fund' },
      { owner: 'simbarashe_jenya', email: 'simbarashe.jenya@example.com', title: 'Avondale Growth Club' },
    ]
    for (const { owner, email, title } of otherClubs) {
      const ownerToken = await registerOrLogin(owner, email)
      const clubs = await req('/clubs', { token: ownerToken })
      const club = clubs.find((c) => c.title === title)
      if (!club) {
        console.log(`  ! could not find club "${title}", skipping`)
        continue
      }
      const added = await ensureMember(ownerToken, club.id, HUB_USERNAME)
      console.log(added ? `  + added ${HUB_USERNAME} to "${title}"` : `  · ${HUB_USERNAME} already a member of "${title}"`)
    }
    console.log()
  }

  console.log('Done. All accounts use the password: ' + PASSWORD)
  console.log(
    `\nHub account for quick browsing: ${HUB_USERNAME} / ${PASSWORD} — owner+treasurer of Mbare Vendors Fund, ` +
      `plain member of every other seeded club.`,
  )
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message)
  process.exit(1)
})
