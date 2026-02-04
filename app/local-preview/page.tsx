'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  MonitorSmartphone,
  Rocket,
  BarChart3,
  Users,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Shield,
  MessageCircle,
} from 'lucide-react'

const sections = [
  {
    title: 'Community Hub (Stabilized)',
    description:
      'Updated message loading, realtime inserts, and error visibility so chats stay live and reliable.',
    icon: MessageCircle,
  },
  {
    title: 'Navigation Clean-Up',
    description:
      'Buttons and links now point to the right places (Signals, Community Hub, Courses) for smoother walkthroughs.',
    icon: Rocket,
  },
  {
    title: 'Preview Everything Locally',
    description:
      'Run the full Trading Academy experience on localhost to validate flows, styling, and data wiring before shipping.',
    icon: MonitorSmartphone,
  },
]

const newItems = [
  {
    title: 'Realtime chat + XP tracking',
    detail: 'Messages hydrate profiles/reactions, earn XP (including trade posts), and log errors with context.',
    icon: Sparkles,
  },
  {
    title: 'Channel-safe routing',
    detail: 'Community links, dashboard quick actions, and mobile nav jump directly into the hub without dead routes.',
    icon: Shield,
  },
  {
    title: 'QA quick links',
    detail: 'Jump into Signals, Courses, Funding, and Admin (if permitted) from this page to verify paths fast.',
    icon: BarChart3,
  },
]

const links = [
  { label: 'Main Dashboard', href: '/dashboard' },
  { label: 'Community Hub', href: '/community-hub' },
  { label: 'Signals', href: '/dashboard?section=signals' },
  { label: 'Courses', href: '/courses' },
  { label: 'Funding', href: '/funding-account' },
  { label: 'Auto Trader', href: '/auto-trader' },
  { label: 'Mentoring', href: '/mentoring' },
  { label: 'Admin (role-gated)', href: '/dashboard?section=admin' },
]

export default function LocalPreviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-20">
        {/* Hero */}
        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-1 text-sm font-medium text-amber-200 border border-amber-400/40">
            <ShieldCheck className="h-4 w-4" />
            Localhost Preview Environment
          </div>
          <h1 className="mt-6 text-4xl font-bold sm:text-5xl text-white">
            Preview every new addition on{' '}
            <span className="text-amber-300">localhost:3000/local-preview</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-200">
            Use this page to demo the latest Community Hub fixes, navigation clean-up, and data wiring updates without leaving your local dev environment.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/">
              <Button size="lg" className="bg-amber-400 text-black hover:bg-amber-300">
                Home Experience
              </Button>
            </Link>
            <Link href="/preview">
              <Button
                size="lg"
                variant="outline"
                className="border-amber-200 text-amber-100 hover:bg-amber-500/20"
              >
                Legacy Preview Page
              </Button>
            </Link>
          </div>
        </header>

        {/* Sections */}
        <section className="mb-20 grid gap-8 md:grid-cols-3">
          {sections.map(({ title, description, icon: Icon }) => (
            <Card
              key={title}
              className="h-full border-gray-800 bg-gray-950/70"
            >
              <div className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-200 border border-amber-400/40">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="text-sm leading-relaxed text-gray-300">
                  {description}
                </p>
              </div>
            </Card>
          ))}
        </section>

        {/* What's New */}
        <section className="mb-20 rounded-2xl border border-amber-400/30 bg-amber-500/5 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-6 w-6 text-amber-300" />
            <h3 className="text-2xl font-semibold text-white">What to validate</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {newItems.map(({ title, detail, icon: Icon }) => (
              <Card key={title} className="border border-gray-800 bg-gray-950/80">
                <div className="flex items-start gap-3 p-5">
                  <div className="mt-1 rounded-lg bg-amber-500/15 border border-amber-400/30 p-2 text-amber-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="text-sm text-gray-400">{detail}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-20">
          <div className="mb-6 flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-amber-300" />
            <h3 className="text-2xl font-semibold">
              Jump straight to a feature area
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-xl border border-gray-800 bg-gray-950/70 px-5 py-4 transition hover:border-amber-300/70 hover:bg-amber-500/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-400 group-hover:text-amber-200">
                      {link.label}
                    </p>
                    <p className="text-xs text-gray-500 group-hover:text-gray-300">{`localhost:3000${link.href}`}</p>
                  </div>
                  <Users className="h-5 w-5 text-gray-400 group-hover:text-amber-200" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <footer className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-10 text-center">
          <h3 className="mb-4 text-3xl font-semibold text-amber-100">
            Ready to share your local build?
          </h3>
          <p className="mb-6 text-gray-200">
            Run{' '}
            <code className="rounded border border-gray-800 bg-gray-900 px-2 py-1">
              npm run dev
            </code>{' '}
            and share{' '}
            <code className="rounded border border-gray-800 bg-gray-900 px-2 py-1">
              http://localhost:3000/local-preview
            </code>{' '}
            in your video call or Loom.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/preview">
              <Button
                variant="secondary"
                className="bg-white/10 text-amber-50 hover:bg-white/20"
              >
                Compare with Legacy Preview
              </Button>
            </Link>
            <Link href="/support">
              <Button
                variant="outline"
                className="border-amber-200 text-amber-100 hover:bg-amber-500/30"
              >
                Need setup help?
              </Button>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
