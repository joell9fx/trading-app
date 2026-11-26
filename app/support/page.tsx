import Link from 'next/link'

export const metadata = {
  title: 'Support',
  description: 'Get help with your Trading Academy account, billing or membership.',
}

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || ''

const topics = [
  {
    title: 'Account & sign-in',
    body: 'Trouble signing in? Reset your password from the sign-in page. If your account has been restricted, email us from the address on your account.',
    link: { href: '/forgot-password', label: 'Reset password' },
  },
  {
    title: 'Billing & memberships',
    body: 'Payments are processed securely by Stripe. Access unlocks automatically after checkout; if it hasn’t, contact us with your receipt email.',
    link: { href: '/pricing', label: 'View plans' },
  },
  {
    title: 'Courses, signals & community',
    body: 'Most questions about content and features are answered in the Community Hub, where members and moderators help each other.',
    link: { href: '/community-hub', label: 'Open Community Hub' },
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-16">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-400">Help centre</p>
          <h1 className="text-3xl md:text-4xl font-bold">Support &amp; contact</h1>
          <p className="text-gray-300">
            We&apos;re here to help with your account, billing and membership.
          </p>
        </header>

        <section className="rounded-xl border border-gold-500/30 bg-neutral-950 p-6 space-y-3">
          <h2 className="text-lg font-semibold">Contact us</h2>
          {SUPPORT_EMAIL ? (
            <>
              <p className="text-gray-300">
                Email{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gold-400 hover:underline">
                  {SUPPORT_EMAIL}
                </a>{' '}
                and include the email address on your account. We aim to reply within one business day.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Trading Academy support')}`}
                className="inline-block rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-black hover:bg-gold-400"
              >
                Email support
              </a>
            </>
          ) : (
            <p className="text-gray-300">
              Signed-in members can reach the team in the{' '}
              <Link href="/community-hub" className="text-gold-400 hover:underline">
                Community Hub
              </Link>
              .
            </p>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {topics.map((t) => (
            <div key={t.title} className="rounded-xl border border-gray-800 bg-neutral-950 p-5 space-y-3">
              <h3 className="font-semibold">{t.title}</h3>
              <p className="text-sm text-gray-400">{t.body}</p>
              <Link href={t.link.href} className="text-sm text-gold-400 hover:underline">
                {t.link.label} →
              </Link>
            </div>
          ))}
        </section>

        <p className="text-xs text-gray-500">
          Trading involves risk. Support cannot give personal financial or investment advice.
        </p>

        <Link href="/" className="text-gold-400 hover:underline text-sm">
          Back to home
        </Link>
      </div>
    </div>
  )
}
