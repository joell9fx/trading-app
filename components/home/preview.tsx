'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Monitor, Smartphone, Tablet } from 'lucide-react'

export function Preview() {
  return (
    <section className="py-24 sm:py-32 bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Access everything in one clean, simple dashboard
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Your complete trading ecosystem at your fingertips
          </p>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="relative mx-auto max-w-5xl">
          <div className="relative rounded-2xl bg-gray-900 p-4 shadow-2xl border border-gray-800">
            {/* Browser Bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 bg-gray-800 rounded px-4 py-1.5 text-xs text-gray-400">
                trading-academy.com/dashboard
              </div>
            </div>

            {/* Dashboard Content Preview */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-black text-xl font-bold">Welcome back, Trader!</h3>
                    <p className="text-gray-900 text-sm mt-1">Here's your trading overview</p>
                  </div>
                  <div className="w-12 h-12 bg-black/20 rounded-full"></div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Active Signals', value: '12', color: 'bg-gold-500/20 border border-gold-500/30 text-gold-400' },
                  { label: 'Courses Completed', value: '8/15', color: 'bg-gold-500/20 border border-gold-500/30 text-gold-400' },
                  { label: 'Community Posts', value: '24', color: 'bg-gold-500/20 border border-gold-500/30 text-gold-400' },
                  { label: 'Mentorship Hours', value: '4.5h', color: 'bg-gold-500/20 border border-gold-500/30 text-gold-400' },
                ].map((stat, idx) => (
                  <div key={idx} className={`${stat.color} rounded-lg p-4`}>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs mt-1 opacity-80">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Signals', 'Courses', 'Community', 'AI Bot'].map((item, idx) => (
                    <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                      <div className="w-8 h-8 bg-gold-500/20 border border-gold-500/30 rounded-full mx-auto mb-2"></div>
                      <div className="text-sm font-medium text-gray-300">{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Device Icons */}
          <div className="mt-8 flex items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              <span className="text-sm">Desktop</span>
            </div>
            <div className="flex items-center gap-2">
              <Tablet className="h-5 w-5" />
              <span className="text-sm">Tablet</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <span className="text-sm">Mobile</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

