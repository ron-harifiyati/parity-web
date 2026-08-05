import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import heroClubDetail from '../assets/hero-clubdetail.png'
import { PublicNav } from '../components/PublicNav'

// Only the hero above uses a real product screenshot — these two are editorial photography.
const growthPhoto = 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=900&q=80&auto=format&fit=crop'
const agreementPhoto = 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&q=80&auto=format&fit=crop'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function Landing() {
  return (
    <div className="overflow-x-clip bg-white dark:bg-charcoal-950">
      <PublicNav />

      {/* Hero */}
      <section className="relative isolate px-6 pt-16 pb-8 sm:pt-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary-400/20 blur-[120px] dark:bg-primary-500/15" />
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-charcoal-200 bg-charcoal-50 px-3 py-1 text-xs font-semibold tracking-wide text-charcoal-600 uppercase dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-300">
            For rotating savings circles
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-charcoal-900 sm:text-6xl dark:text-white">
            The ledger for your savings circle.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-charcoal-600 dark:text-charcoal-300">
            Parity tracks every contribution, loan, and payout automatically — transparent to every member of your
            mukando or round, all the time.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="w-full rounded-full bg-primary-600 px-7 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-700 sm:w-auto sm:py-3"
            >
              Create your circle
            </Link>
            <Link
              to="/login"
              className="w-full rounded-full border border-charcoal-300 px-7 py-3.5 text-center text-sm font-semibold text-charcoal-700 transition hover:border-charcoal-400 hover:bg-charcoal-50 sm:w-auto sm:py-3 dark:border-charcoal-700 dark:text-charcoal-200 dark:hover:bg-charcoal-900"
            >
              Log in
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-14 max-w-5xl"
        >
          <BrowserFrame>
            <img src={heroClubDetail} alt="Parity club dashboard showing members, contributions, and loans" className="w-full" />
          </BrowserFrame>
        </motion.div>
      </section>

      {/* Feature 1 */}
      <FeaturePanel
        eyebrow="Year-end payout"
        title="Payouts calculate themselves."
        body="Base share, interest share for qualifying members, outstanding debt deducted — Parity works out each member's final number automatically, before anyone has to ask."
        image={growthPhoto}
        imageAlt="A small plant sprouting from a pile of coins, representing savings that grow"
      />

      {/* Feature 2 */}
      <FeaturePanel
        eyebrow="Loans & repayments"
        title="Every loan, tracked to the cent."
        body="Treasurers record contributions, loans, and repayments in seconds. Interest accrues on schedule, and every member can see exactly what they owe and what they've paid."
        image={agreementPhoto}
        imageAlt="A hand signing a loan agreement with a pen"
        reverse
      />

      {/* Trust / photography section */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="grid items-center gap-10 overflow-hidden rounded-3xl border border-charcoal-200 bg-white lg:grid-cols-2 dark:border-charcoal-800 dark:bg-charcoal-900"
        >
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&auto=format&fit=crop"
            alt="Two people shaking hands, representing trust between club members"
            className="h-72 w-full object-cover lg:h-full"
            loading="lazy"
          />
          <div className="p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-charcoal-900 sm:text-3xl dark:text-white">
              Built on the same trust as your club
            </h2>
            <p className="mt-4 text-charcoal-600 dark:text-charcoal-300">
              No hidden fees, no black-box math. Every contribution, loan, and interest calculation is visible to
              every member — the app just keeps the ledger honest.
            </p>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Start your first circle
              <span aria-hidden>→</span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-navy-700 via-navy-800 to-charcoal-900 px-8 py-14 text-center shadow-xl"
        >
          <h2 className="text-3xl font-bold text-white">Ready to bring your circle online?</h2>
          <p className="mx-auto mt-3 max-w-md text-navy-100">
            Set up your club in minutes and invite your members today.
          </p>
          <Link
            to="/register"
            className="mt-7 inline-block rounded-full bg-gold-400 px-7 py-3 text-sm font-semibold text-navy-900 shadow-lg transition hover:bg-gold-300"
          >
            Create your circle — it's free
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-charcoal-200 px-6 py-8 dark:border-charcoal-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-charcoal-500 sm:flex-row dark:text-charcoal-400">
          <span>&copy; {new Date().getFullYear()} Parity. Built for savings circles everywhere.</span>
          <div className="flex gap-5">
            <Link to="/login" className="hover:text-charcoal-700 dark:hover:text-charcoal-200">
              Log in
            </Link>
            <Link to="/register" className="hover:text-charcoal-700 dark:hover:text-charcoal-200">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function BrowserFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-charcoal-200 bg-charcoal-100 shadow-2xl shadow-charcoal-900/10 dark:border-charcoal-800 dark:bg-charcoal-900">
      <div className="flex items-center gap-1.5 border-b border-charcoal-200 bg-charcoal-50 px-4 py-2.5 dark:border-charcoal-800 dark:bg-charcoal-900">
        <span className="size-2.5 rounded-full bg-charcoal-300 dark:bg-charcoal-700" />
        <span className="size-2.5 rounded-full bg-charcoal-300 dark:bg-charcoal-700" />
        <span className="size-2.5 rounded-full bg-charcoal-300 dark:bg-charcoal-700" />
      </div>
      {children}
    </div>
  )
}

function FeaturePanel({
  eyebrow,
  title,
  body,
  image,
  imageAlt,
  reverse,
}: {
  eyebrow: string
  title: string
  body: string
  image: string
  imageAlt: string
  reverse?: boolean
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className={`grid items-center gap-10 lg:grid-cols-2 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm font-semibold tracking-wide text-primary-600 uppercase dark:text-primary-400">
            {eyebrow}
          </span>
          <h2 className="mt-2 text-3xl font-bold text-charcoal-900 sm:text-4xl dark:text-white">{title}</h2>
          <p className="mt-4 text-charcoal-600 dark:text-charcoal-300">{body}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="overflow-hidden rounded-2xl border border-charcoal-200 shadow-2xl shadow-charcoal-900/10 dark:border-charcoal-800">
            <img src={image} alt={imageAlt} className="h-80 w-full object-cover" loading="lazy" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
