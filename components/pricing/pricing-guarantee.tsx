'use client'

import { Shield, Clock, CreditCard } from 'lucide-react'

export function PricingGuarantee() {
  return (
    <section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Risk-Free Trial
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            We're confident you'll love our platform. That's why we offer a 14-day money-back guarantee on all paid plans.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              14-Day Guarantee
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Try any paid plan risk-free for 14 days. If you're not satisfied, get a full refund.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Cancel Anytime
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              No long-term contracts. Cancel your subscription at any time with no penalties.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No Hidden Fees
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Transparent pricing with no setup fees, hidden charges, or surprise bills.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              How the guarantee works
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• Start your 14-day trial immediately after signup</li>
              <li>• Access all features of your chosen plan</li>
              <li>• Cancel anytime within 14 days for a full refund</li>
              <li>• No questions asked - we want you to be happy</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
