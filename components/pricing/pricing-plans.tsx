'use client'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Check, Star } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface PricingPlansProps {
  billingCycle: 'monthly' | 'yearly'
  onBillingCycleChange: (cycle: 'monthly' | 'yearly') => void
}

const plans = [
  {
    name: 'Starter',
    id: 'starter',
    description: 'Perfect for beginners who want to learn the basics.',
    price: { monthly: 0, yearly: 0 },
    features: [
      'Access to 3 beginner courses',
      'Community forum access',
      'Basic trading tools',
      'Email support',
      'Mobile app access',
    ],
    featured: false,
    cta: 'Start Free',
    href: '/signup?plan=starter',
  },
  {
    name: 'Pro',
    id: 'pro',
    description: 'Everything you need to become a successful trader.',
    price: { monthly: 49, yearly: 490 },
    features: [
      'All Starter features',
      'Access to 50+ advanced courses',
      '1-on-1 mentoring sessions (2/month)',
      'Premium community access',
      'Real-time market alerts',
      'Advanced trading tools',
      'Priority support',
      'Certificate program',
      'Trading journal tools',
    ],
    featured: true,
    cta: 'Start Pro Trial',
    href: '/signup?plan=pro',
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    description: 'For teams and institutions requiring custom solutions.',
    price: { monthly: 199, yearly: 1990 },
    features: [
      'All Pro features',
      'Unlimited mentoring sessions',
      'Custom course creation',
      'White-label solutions',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'Team management tools',
      'Advanced analytics',
    ],
    featured: false,
    cta: 'Contact Sales',
    href: '/contact?plan=enterprise',
  },
]

export function PricingPlans({ billingCycle, onBillingCycleChange }: PricingPlansProps) {
  return (
    <section id="plans" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Billing Toggle */}
        <div className="mx-auto max-w-md text-center mb-16">
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly
            </span>
            <Switch
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked) => onBillingCycleChange(checked ? 'yearly' : 'monthly')}
            />
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Yearly
              <span className="ml-1 text-xs text-green-600 dark:text-green-400">
                (Save 17%)
              </span>
            </span>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl bg-white dark:bg-gray-800 p-8 ring-1 ring-gray-200 dark:ring-gray-700 xl:p-10 ${
                plan.featured
                  ? 'ring-2 ring-blue-600 dark:ring-blue-400 shadow-lg scale-105'
                  : ''
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                    <Star className="mr-1 h-4 w-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                  {plan.description}
                </p>
                
                <div className="mt-8">
                  <div className="flex items-baseline justify-center gap-x-1">
                    <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {plan.price[billingCycle] === 0 ? 'Free' : formatCurrency(plan.price[billingCycle] / 100)}
                    </span>
                    {plan.price[billingCycle] > 0 && (
                      <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-300">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                  {plan.price[billingCycle] > 0 && billingCycle === 'yearly' && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      Save {formatCurrency((plan.price.monthly * 12 - plan.price.yearly) / 100)} per year
                    </p>
                  )}
                </div>

                <ul role="list" className="mt-10 space-y-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-green-600 dark:text-green-400" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={plan.featured ? 'default' : 'outline'}
                  size="lg"
                  className="mt-10 w-full"
                >
                  <Link href={plan.href}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            All plans include a 14-day money-back guarantee. No setup fees or hidden charges.
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            * Past performance does not guarantee future results. Trading involves risk and you may lose money.
          </p>
        </div>
      </div>
    </section>
  )
}
