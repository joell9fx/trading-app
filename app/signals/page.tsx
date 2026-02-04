import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, Target, Zap, Shield, Clock, BarChart3, Activity, AlertTriangle, CheckCircle, DollarSign, Users, Award } from 'lucide-react';

export default function SignalsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-24 sm:py-32">
            <div className="text-center">
              <div className="mb-8">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  Professional Trading Signals
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
                Get Professional
                <span className="gradient-text block">Trading Signals</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                Receive high-quality trading signals from our expert analysts. Get precise entry and exit points, risk management guidance, and market insights to maximize your trading success.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Start Getting Signals Free
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Are Trading Signals */}
      <section className="py-24 sm:py-32 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              What Are Trading Signals?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Trading signals are actionable recommendations that tell you when to buy or sell a financial instrument based on technical analysis, fundamental analysis, or market sentiment.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Entry Points</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Precise entry points with specific price levels, stop-loss orders, and position sizing recommendations.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Exact buy/sell prices
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Risk-reward ratios
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Position sizing guidance
                  </li>
                </ul>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Risk Management</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Built-in risk management with stop-loss levels, take-profit targets, and position sizing recommendations.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Stop-loss levels
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Take-profit targets
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Risk percentage per trade
                  </li>
                </ul>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                    <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Market Analysis</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Detailed analysis explaining the reasoning behind each signal, including technical indicators and market conditions.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Technical analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Market sentiment
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Fundamental factors
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Signal Types */}
      <section className="py-24 sm:py-32 bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Types of Trading Signals
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              We provide various types of signals to match different trading styles and risk preferences.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Activity className="h-16 w-16 text-white" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Scalping
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">1-5 min</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Scalping Signals
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Quick entry and exit signals for short-term price movements. Perfect for active traders who can monitor markets closely.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        5-15 pips
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        High frequency
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">Free</span>
                  </div>
                </div>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <TrendingUp className="h-16 w-16 text-white" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                      Swing Trading
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">1-7 days</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Swing Trading Signals
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Medium-term signals capturing price swings over several days. Ideal for traders who prefer less frequent but higher-probability trades.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        50-200 pips
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Medium frequency
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">Free</span>
                  </div>
                </div>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <BarChart3 className="h-16 w-16 text-white" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Position Trading
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Weeks-Months</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Position Trading Signals
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Long-term signals based on fundamental analysis and major trend changes. Perfect for investors and patient traders.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        200+ pips
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Low frequency
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">Free</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Signal Features */}
      <section className="py-24 sm:py-32 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Signal Features & Benefits
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Our signals come with comprehensive features designed to maximize your trading success and minimize risk.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Zap className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Real-time Notifications
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Get instant notifications via email, SMS, or push notifications when new signals are generated. Never miss a trading opportunity.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Shield className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Risk Management
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Every signal includes detailed risk management parameters including stop-loss, take-profit, and position sizing recommendations.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <BarChart3 className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Detailed Analysis
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Each signal comes with comprehensive analysis explaining the reasoning, technical indicators used, and market conditions.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Award className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Performance Tracking
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Track the performance of all signals with detailed statistics, win rates, and profit/loss analysis.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Signal Performance */}
      <section className="py-24 sm:py-32 bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Signal Performance
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Our signals have consistently delivered strong results across different market conditions.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">78%</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">+24.5%</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Average Monthly Return</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <AlertTriangle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">2.1%</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Maximum Drawdown</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 sm:py-32 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              How Our Signals Work
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Our systematic approach ensures consistent, high-quality signals that you can rely on.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="relative">
              {/* Connection line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
              
              <div className="space-y-12">
                <div className="relative flex items-start gap-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-lg">
                    1
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Market Analysis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Our expert analysts continuously monitor global markets using advanced technical analysis, fundamental research, and sentiment indicators.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-start gap-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Signal Generation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      When our criteria are met, we generate precise signals with entry points, stop-loss levels, take-profit targets, and position sizing recommendations.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-start gap-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 text-white font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Instant Delivery
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Signals are immediately sent to you via your preferred notification method with detailed analysis and risk management parameters.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-start gap-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-white font-bold text-lg">
                    4
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Execution & Tracking
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Execute trades based on our signals and track performance through our comprehensive analytics dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-24 sm:py-32">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to start receiving professional trading signals?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-green-100">
                Join thousands of traders who rely on our signals to make informed trading decisions and maximize their profits.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Start Getting Signals Free
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-green-600">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
