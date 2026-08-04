import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PublicNav } from '../components/PublicNav'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

const steps = [
  {
    title: 'Create your circle',
    body: 'Set your contribution amount, payment day, interest rate, and duration. Invite members with a shared club.',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: 'Contribute together',
    body: 'Every payment, loan, and repayment is logged automatically. No more chasing screenshots in a group chat.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&auto=format&fit=crop',
  },
  {
    title: 'Borrow, repay, grow',
    body: 'Members can borrow from the pool with clear interest terms, and everyone sees the group balance in real time.',
    image: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=600&q=80&auto=format&fit=crop',
  },
]

const features = [
  {
    title: 'Automated ledger',
    body: 'Contributions, loans, interest, and payouts are calculated for you — no spreadsheets, no disputes.',
  },
  {
    title: 'Role-based access',
    body: 'Owners, treasurers, and members each see exactly what they need — nothing more, nothing less.',
  },
  {
    title: 'Missed-payment handling',
    body: 'Grace periods and optional auto-loans keep the group moving without awkward reminders.',
  },
  {
    title: 'Interest, done fairly',
    body: 'Interest accrues monthly and qualifying members share the pool at year end — the math is transparent.',
  },
  {
    title: 'Early withdrawal support',
    body: 'Members can leave before the club ends, with penalties applied consistently and clearly.',
  },
  {
    title: 'Built for trust',
    body: 'Every transaction is recorded against a member and a period — a full, auditable history for the group.',
  },
]

export default function Landing() {
  return (
    <div className="overflow-x-clip bg-white dark:bg-charcoal-950">
      <PublicNav />

      {/* Hero */}
      <section className="relative isolate px-6 pt-16 pb-24 sm:pt-20 sm:pb-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary-300/30 blur-3xl dark:bg-primary-500/10" />
          <div className="absolute top-32 -right-16 h-80 w-80 rounded-full bg-gold-300/30 blur-3xl dark:bg-gold-500/10" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-navy-300/20 blur-3xl dark:bg-navy-500/10" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
          <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold tracking-wide text-primary-700 uppercase dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-400">
              Savings circles, digitized
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-charcoal-900 sm:text-5xl dark:text-white">
              Save together.
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-navy-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-navy-300">
                Grow with total trust.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-charcoal-600 dark:text-charcoal-300">
              Parity brings your mukando or round online — contributions, loans, interest, and payouts tracked
              automatically, transparent to every member, every time.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="rounded-full bg-primary-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-700 sm:py-3"
              >
                Create your circle
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-charcoal-300 px-6 py-3.5 text-center text-sm font-semibold text-charcoal-700 transition hover:border-charcoal-400 hover:bg-charcoal-50 sm:py-3 dark:border-charcoal-700 dark:text-charcoal-200 dark:hover:bg-charcoal-900"
              >
                Log in
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative mx-auto max-w-sm px-4 pt-4 pb-10 sm:max-w-none sm:px-0 sm:pt-6 sm:pb-12"
          >
            <div className="overflow-hidden rounded-3xl border border-charcoal-200 shadow-2xl shadow-charcoal-900/10 dark:border-charcoal-800">
              <img
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=900&q=80&auto=format&fit=crop"
                alt="A group of friends meeting around a table, discussing their savings circle"
                className="h-64 w-full object-cover sm:h-96 lg:h-[420px]"
                loading="eager"
              />
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-2 left-0 w-44 rounded-2xl border border-charcoal-200 bg-white/95 p-3.5 shadow-xl backdrop-blur sm:-bottom-6 sm:left-auto sm:-left-6 sm:w-56 sm:p-4 dark:border-charcoal-700 dark:bg-charcoal-900/95"
            >
              <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">Group balance</p>
              <p className="mt-1 text-xl font-bold text-primary-600 sm:text-2xl dark:text-primary-400">$4,820.00</p>
              <p className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">12 members · on track</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-0 right-0 flex items-center gap-2 rounded-2xl border border-charcoal-200 bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur sm:-top-6 sm:-right-6 sm:px-4 sm:py-3 dark:border-charcoal-700 dark:bg-charcoal-900/95"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-600 sm:size-8 dark:bg-gold-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                  <path
                    fillRule="evenodd"
                    d="M12 2.25a.75.75 0 0 1 .692.462l1.83 4.39 4.735.41a.75.75 0 0 1 .428 1.317l-3.6 3.126 1.09 4.63a.75.75 0 0 1-1.12.814L12 15.347l-4.055 2.552a.75.75 0 0 1-1.12-.814l1.09-4.63-3.6-3.126A.75.75 0 0 1 4.743 7.5l4.735-.41 1.83-4.39A.75.75 0 0 1 12 2.25Z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <div>
                <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">Interest qualified</p>
                <p className="text-xs font-semibold text-charcoal-900 sm:text-sm dark:text-white">8 of 12 members</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold text-charcoal-900 sm:text-4xl dark:text-white">How Parity works</h2>
          <p className="mt-3 text-charcoal-600 dark:text-charcoal-300">
            From first contribution to year-end payout, every step is tracked and visible to the whole group.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="overflow-hidden rounded-2xl border border-charcoal-200 bg-white shadow-sm dark:border-charcoal-800 dark:bg-charcoal-900"
            >
              <img src={step.image} alt="" className="h-40 w-full object-cover" loading="lazy" />
              <div className="p-6">
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">Step {i + 1}</span>
                <h3 className="mt-1 text-lg font-semibold text-charcoal-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-charcoal-600 dark:text-charcoal-300">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-charcoal-50 py-20 dark:bg-charcoal-900/40">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold text-charcoal-900 sm:text-4xl dark:text-white">
              Everything your club's constitution needs
            </h2>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                className="rounded-2xl border border-charcoal-200 bg-white p-6 dark:border-charcoal-800 dark:bg-charcoal-900"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3.03 6.97a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l1.72 1.72 3.97-3.97a.75.75 0 0 1 1.06 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <h3 className="mt-4 font-semibold text-charcoal-900 dark:text-white">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-charcoal-600 dark:text-charcoal-300">{feature.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust band */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          transition={{ duration: 0.55 }}
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path
                  fillRule="evenodd"
                  d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
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
