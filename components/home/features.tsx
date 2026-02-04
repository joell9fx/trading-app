'use client'

import { BookOpen, Users, Bot, Award, Shield, Zap, TrendingUp, DollarSign, Coins, BarChart3, Wheat, CheckCircle } from 'lucide-react'

const features = [
  {
    name: '🎯 Real-Time Trade Signals',
    description: 'Get instant trading signals with entry, stop loss, and take profit levels. Copy-ready signals across Forex, Crypto, Indices, and Commodities markets.',
    icon: TrendingUp,
  },
  {
    name: '🧠 Mentorship Programs',
    description: 'Book 1-on-1 sessions with expert traders and join group mentorship calls. Get personalized guidance to accelerate your trading success.',
    icon: Users,
  },
  {
    name: '📚 Courses & Education Portal',
    description: 'Structured courses with modules and lessons covering technical analysis, fundamental analysis, risk management, and trading psychology.',
    icon: BookOpen,
  },
  {
    name: '🤖 AI Trading Assistant',
    description: 'On-demand GPT-powered assistant for market analysis summaries, trade idea validation, and answers to ICT, Smart Money, and trading FAQs.',
    icon: Bot,
  },
  {
    name: '💬 Live Community Chat',
    description: 'Real-time global chat with topic filters (Forex, Crypto, Indices), emoji support, and admin announcements. Connect with traders worldwide.',
    icon: Zap,
  },
  {
    name: '💸 Funding Account Support',
    description: 'Apply for prop firm challenges, track evaluation progress manually or via API (MyFXBook), and request evaluation reviews with admin support.',
    icon: CheckCircle,
  },
]

export function Features() {
  return (
    <section className="py-24 sm:py-32 bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to become a successful trader
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Our comprehensive platform combines education, community, and mentoring 
            to give you the tools and support you need to succeed in the markets.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <feature.icon className="h-5 w-5 flex-none text-gold-400" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
