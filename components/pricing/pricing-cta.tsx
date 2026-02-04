'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Clock, Users } from 'lucide-react'
import Link from 'next/link'

interface PricingCTAProps {
  billingCycle: 'monthly' | 'yearly'
}

export function PricingCTA({ billingCycle }: PricingCTAProps) {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-24 sm:py-32">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to start your trading journey?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
              Join thousands of successful traders who have transformed their financial future. 
              Start with our free tier or jump straight into Pro with a 14-day trial.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link href="/signup?plan=pro">
                  Start Pro Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/signup?plan=starter">
                  Start Free
                </Link>
              </Button>
            </div>
            
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  14-Day Trial
                </h3>
                <p className="mt-2 text-sm text-blue-100">
                  Try Pro risk-free with our money-back guarantee
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  Start Immediately
                </h3>
                <p className="mt-2 text-sm text-blue-100">
                  Get instant access to all courses and features
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  Join Community
                </h3>
                <p className="mt-2 text-sm text-blue-100">
                  Connect with 10,000+ traders worldwide
                </p>
              </div>
            </div>
            
            <div className="mt-16 border-t border-white/20 pt-8">
              <p className="text-sm text-blue-100">
                * Past performance does not guarantee future results. Trading involves risk and you may lose money.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
