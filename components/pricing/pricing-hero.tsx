'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

export function PricingHero() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Choose Your Trading Journey
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Start with our free tier and upgrade as you grow. All plans include a 14-day money-back guarantee 
            and access to our proven trading education system.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="#plans">
                View Plans
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/learn">
                Browse Courses
              </Link>
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                14-Day Guarantee
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Try risk-free with our money-back guarantee
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Check className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Cancel Anytime
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                No long-term contracts or hidden fees
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Check className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Expert Support
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Get help from our team of trading experts
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
