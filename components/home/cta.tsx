'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, Shield, Users } from 'lucide-react'
import Link from 'next/link'

export function CTA() {
  return (
    <section className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-24 sm:py-32">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Ready to start your trading journey?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-900">
              Join thousands of successful traders who have transformed their financial future. 
              Start with our free tier and see the difference professional education makes.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-black hover:bg-gray-900 text-white">
                <Link href="/signup">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 border-black text-black hover:bg-black hover:text-white">
                <Link href="/courses">
                  Browse Courses
                </Link>
              </Button>
            </div>
            
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/20">
                  <Clock className="h-6 w-6 text-black" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-black">
                  Start in Minutes
                </h3>
                <p className="mt-2 text-sm text-gray-800">
                  No setup required, start learning immediately
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/20">
                  <Shield className="h-6 w-6 text-black" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-black">
                  14-Day Guarantee
                </h3>
                <p className="mt-2 text-sm text-gray-800">
                  Try risk-free with our money-back guarantee
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/20">
                  <Users className="h-6 w-6 text-black" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-black">
                  Expert Support
                </h3>
                <p className="mt-2 text-sm text-gray-800">
                  Get help from our team of trading experts
                </p>
              </div>
            </div>
            
            <div className="mt-16 border-t border-black/20 pt-8">
              <p className="text-sm text-gray-800">
                * Past performance does not guarantee future results. Trading involves risk and you may lose money.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
