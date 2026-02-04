'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

const tiers = [
  {
    name: 'Free',
    id: 'free',
    href: '/signup?plan=free',
    price: { monthly: '$0', yearly: '$0' },
    description: 'Perfect for beginners who want to learn the basics.',
    features: [
      'Community access',
      'Basic trading tools',
      'Email support',
      'Mobile app access',
    ],
    featured: false,
  },
  {
    name: 'Pro',
    id: 'pro',
    href: '/signup?plan=pro',
    price: { monthly: '$49', yearly: '$490' },
    description: 'Everything you need to become a successful trader.',
    features: [
      'All Free features',
      'Real-time trade signals',
      'AI Trading Assistant',
      'Access to all courses & education',
      'Premium community access',
      'Priority support',
    ],
    featured: true,
  },
  {
    name: 'Elite',
    id: 'elite',
    href: '/signup?plan=elite',
    price: { monthly: '$99', yearly: '$990' },
    description: 'Full access with mentorship and funding tools.',
    features: [
      'All Pro features',
      'Mentorship programs (1-on-1 + group calls)',
      'Funding account support & tracking',
      'Unlimited AI assistant queries',
      'Advanced trading tools',
      'Certificate program',
      'Dedicated support',
    ],
    featured: false,
  },
]

export function Pricing() {
  return (
    <section className="py-24 sm:py-32 bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-gold-400">
            Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Choose the perfect plan for your trading journey
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-300">
          Start with our free tier and upgrade as you grow. All plans include a 14-day money-back guarantee.
        </p>
        
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`flex flex-col justify-between rounded-3xl bg-gray-900 border border-gray-800 p-8 xl:p-10 ${
                tier.featured
                  ? 'ring-2 ring-gold-500 border-gold-500/50 shadow-lg shadow-gold-500/20 scale-105'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-white">
                    {tier.name}
                  </h3>
                  {tier.featured && (
                    <p className="rounded-full bg-gold-500/20 border border-gold-500/30 px-2.5 py-1 text-xs font-semibold leading-5 text-gold-400">
                      Most popular
                    </p>
                  )}
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-300">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-white">
                    {tier.price.monthly}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-gray-400">
                    /month
                  </span>
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  {tier.price.yearly !== tier.price.monthly && (
                    <span>or {tier.price.yearly}/year (save 17%)</span>
                  )}
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-gold-400" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                asChild
                variant={tier.featured ? 'default' : 'outline'}
                className={`mt-8 ${tier.featured ? 'bg-gold-500 hover:bg-gold-600 text-black' : 'border-gray-700 text-white hover:border-gold-500/50'}`}
              >
                <Link href={tier.href}>
                  {tier.id === 'elite' ? 'Contact Sales' : 'Get started'}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
