'use client'

import { Check, X } from 'lucide-react'

interface PricingComparisonProps {
  billingCycle: 'monthly' | 'yearly'
}

const features = [
  {
    name: 'Course Access',
    starter: '3 Beginner Courses',
    pro: '50+ Advanced Courses',
    enterprise: 'All Courses + Custom',
  },
  {
    name: 'Community Access',
    starter: 'Basic Forum',
    pro: 'Premium Community',
    enterprise: 'Private Channels',
  },
  {
    name: 'Mentoring Sessions',
    starter: 'None',
    pro: '2 Sessions/Month',
    enterprise: 'Unlimited Sessions',
  },
  {
    name: 'Trading Tools',
    starter: 'Basic Tools',
    pro: 'Advanced Tools',
    enterprise: 'Custom Tools',
  },
  {
    name: 'Support',
    starter: 'Email Support',
    pro: 'Priority Support',
    enterprise: 'Dedicated Manager',
  },
  {
    name: 'Certificates',
    starter: 'None',
    pro: 'Course Certificates',
    enterprise: 'Custom Certificates',
  },
  {
    name: 'API Access',
    starter: 'None',
    pro: 'None',
    enterprise: 'Full API Access',
  },
  {
    name: 'White-label',
    starter: 'None',
    pro: 'None',
    enterprise: 'Available',
  },
]

export function PricingComparison({ billingCycle }: PricingComparisonProps) {
  return (
    <section className="py-24 sm:py-32 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Compare Plans
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            See exactly what's included in each plan to choose the right one for your trading journey.
          </p>
        </div>

        <div className="mt-16 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-0">
                      Feature
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Starter
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Pro
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {features.map((feature) => (
                    <tr key={feature.name}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-0">
                        {feature.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {feature.starter === 'None' ? (
                          <X className="h-5 w-5 text-red-500" />
                        ) : (
                          <span>{feature.starter}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {feature.pro === 'None' ? (
                          <X className="h-5 w-5 text-red-500" />
                        ) : (
                          <span>{feature.pro}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {feature.enterprise === 'None' ? (
                          <X className="h-5 w-5 text-red-500" />
                        ) : (
                          <span>{feature.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Need a custom plan? <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact our sales team</a> for enterprise solutions.
          </p>
        </div>
      </div>
    </section>
  )
}
