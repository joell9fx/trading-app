'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Target, 
  Users, 
  Award, 
  TrendingUp, 
  Shield, 
  Heart, 
  Lightbulb, 
  Globe, 
  CheckCircle,
  BarChart3,
  BookOpen,
  Zap,
  Star,
  Clock
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-24 sm:py-32">
            <div className="text-center">
              <div className="mb-8">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Users className="mr-1 h-4 w-4" />
                  About Us
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
                Empowering Traders
                <span className="gradient-text block">Worldwide</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                We're on a mission to democratize trading education and provide everyone with the tools, knowledge, and support needed to succeed in the financial markets.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Join Our Community
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                    Explore Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 sm:py-32 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Our Story
                </h2>
                <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                  Trading Academy was founded by a group of professional traders who recognized a critical gap in the market: accessible, high-quality trading education that doesn't break the bank.
                </p>
                <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
                  After years of seeing traders struggle with expensive courses, misleading signals, and lack of proper mentorship, we decided to create a platform that truly serves the trading community. Our goal is simple: make professional-grade trading education available to everyone, regardless of their background or budget.
                </p>
                <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
                  Today, we've helped thousands of traders improve their skills, pass prop firm evaluations, and build sustainable trading careers. But we're just getting started.
                </p>
              </div>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-6 bg-blue-50 dark:bg-blue-900/20">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">10K+</div>
                    <div className="text-gray-600 dark:text-gray-300 mt-2">Active Students</div>
                  </Card>
                  <Card className="p-6 bg-green-50 dark:bg-green-900/20">
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400">500+</div>
                    <div className="text-gray-600 dark:text-gray-300 mt-2">Funded Accounts</div>
                  </Card>
                  <Card className="p-6 bg-purple-50 dark:bg-purple-900/20">
                    <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">50+</div>
                    <div className="text-gray-600 dark:text-gray-300 mt-2">Expert Courses</div>
                  </Card>
                  <Card className="p-6 bg-orange-50 dark:bg-orange-900/20">
                    <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">25+</div>
                    <div className="text-gray-600 dark:text-gray-300 mt-2">Professional Mentors</div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Our Mission
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              To empower traders of all levels with the knowledge, tools, and community support needed to achieve consistent profitability and long-term success in the financial markets.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Target className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Education First
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">We believe education is the foundation of successful trading. Our comprehensive courses cover everything from basics to advanced strategies.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Users className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Community Support
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Trading can be isolating. We've built a vibrant community where traders share insights, support each other, and grow together.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Award className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Proven Results
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Our methods are tested and proven. We measure success by the number of traders we help achieve their financial goals.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 sm:py-32 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Our Values
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Transparency</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  No hidden fees, no false promises. We're honest about what we can deliver and what trading success requires.
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Integrity</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  We do the right thing, even when it's not the easy thing. Your success is our success, and we're committed to your growth.
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Lightbulb className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Innovation</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  We continuously improve our platform, courses, and tools to stay ahead of market trends and provide cutting-edge education.
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                    <Globe className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Accessibility</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Trading education shouldn't be exclusive. We make professional-grade content accessible to traders worldwide, regardless of their location or budget.
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
                    <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Excellence</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  We maintain the highest standards in everything we do—from course content to customer support. Good enough isn't good enough.
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                    <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Community</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  We believe in the power of community. Together, we're stronger, smarter, and more successful than we could ever be alone.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              What We Offer
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              A comprehensive platform designed to support your entire trading journey
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <BookOpen className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Comprehensive Courses
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">From beginner basics to advanced strategies, our courses cover technical analysis, fundamental analysis, risk management, and trading psychology.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Users className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Expert Mentoring
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Get personalized guidance from professional traders with proven track records. Book 1-on-1 sessions to accelerate your learning.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <BarChart3 className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Trading Signals
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Receive daily trading signals with clear entry, stop loss, and take profit levels across Forex, Crypto, Futures, and Commodities.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <CheckCircle className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Funded Account Passing
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Skip the evaluation stress! Our expert team will pass your prop firm challenge for you at a fixed price.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Zap className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Auto Bot Trader
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Automated trading bot that executes trades 24/7 based on proven strategies. Set it and forget it.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Globe className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Active Community
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Connect with experienced traders, share market insights, discuss strategies, and discover new opportunities together.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 sm:py-32 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Why Choose Trading Academy?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Here's what sets us apart from other trading education platforms
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Proven Track Record</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">95% success rate with over 500 traders funded through our services.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Expert Instructors</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Learn from professional traders with years of real-world experience and proven results.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Lifetime Access</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Once you enroll, you have lifetime access to course materials and updates.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                  <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Risk Management Focus</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">We teach you to protect your capital first—the foundation of successful trading.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                  <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Continuous Updates</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Our content is regularly updated to reflect current market conditions and new strategies.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Supportive Community</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Join thousands of traders who support and learn from each other every day.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-24 sm:py-32">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Start Your Trading Journey?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
                Join thousands of successful traders who have transformed their trading with our platform. Start learning today.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

