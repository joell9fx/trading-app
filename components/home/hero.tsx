'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Users, Award, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-grid-gray-900 [mask-image:linear-gradient(0deg,black,rgba(0,0,0,0.6))]" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-24 sm:py-32">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center rounded-full bg-gold-500/20 border border-gold-500/30 px-3 py-1 text-sm font-medium text-gold-400">
                <TrendingUp className="mr-1 h-4 w-4" />
                Join 10,000+ successful traders
              </span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Trade Smarter. Learn Faster. Grow Together.
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300">
              Join a global community of traders gaining mentorship, signals, and AI-powered tools — all in one ecosystem.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-gold-500 hover:bg-gold-600 text-black">
                <Link href="/signup">
                  Join Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-gray-700 text-white hover:bg-gray-900 hover:border-gold-500/50" asChild>
                <Link href="/signin">
                  Login
                </Link>
              </Button>
            </div>
            
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/20 border border-gold-500/30">
                  <Users className="h-6 w-6 text-gold-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  10,000+ Students
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Join our growing community
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/20 border border-gold-500/30">
                  <Award className="h-6 w-6 text-gold-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  50+ Expert Mentors
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Learn from the best
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/20 border border-gold-500/30">
                  <TrendingUp className="h-6 w-6 text-gold-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  95% Success Rate
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Proven strategies that work
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
