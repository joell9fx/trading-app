import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Shield, TrendingUp, Clock, Users, Star, DollarSign, Target, Award, Zap, AlertTriangle, BarChart3, Activity } from 'lucide-react';

export default function FundingAccountPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-24 sm:py-32">
            <div className="text-center">
              <div className="mb-8">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Prop Firm Funding
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
                Get Your
                <span className="gradient-text block">Funded Trading Account</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                Skip the evaluation stress! Our expert team will pass your prop firm challenge for you. Get funded with up to $400K in trading capital and start earning real profits.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Get Funded Now
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

      {/* What is Prop Firm Funding */}
      <section className="py-24 sm:py-32 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              What is Prop Firm Funding?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Prop firm funding allows you to trade with a firm's capital while keeping a percentage of the profits. Instead of risking your own money, you trade with their funds and share the profits.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Trading Capital</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Access up to $400K in trading capital without risking your own money. Start with smaller amounts and scale up as you prove your skills.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    $10K - $400K accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    No personal capital risk
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Profit sharing model
                  </li>
                </ul>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Evaluation Process</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Pass a trading challenge to prove your skills. Meet specific profit targets while staying within risk limits to get funded.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Phase 1: 8% profit target
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Phase 2: 5% profit target
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Risk management rules
                  </li>
                </ul>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Profit Sharing</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Keep 50-90% of your trading profits depending on the firm and your performance level. The better you perform, the higher your profit share.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    50-90% profit share
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Weekly payouts
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Performance bonuses
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>


      {/* Why Choose Us */}
      <section className="py-24 sm:py-32 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Why Choose Our Service?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              We've helped hundreds of traders get funded with our proven methodology and expert team.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <CheckCircle className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Proven Track Record
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">95% success rate with over 500 traders funded. Our methodology has been refined through thousands of successful evaluations.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Shield className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Risk Management
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Strict risk controls ensure we never violate prop firm rules. Your evaluation is protected with professional risk management.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Clock className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Fast Turnaround
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Most evaluations completed within 14-21 days. Get funded quickly and start earning profits sooner.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <Users className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Expert Team
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Professional traders with years of experience in prop firm evaluations and funded account management.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Success Stats */}
      <section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Our Success Metrics
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Numbers don't lie. Here's what our clients have achieved with our funding service.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">95%</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">500+</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Traders Funded</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">14-21</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Days Average</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 sm:py-32 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              How Our Process Works
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Simple, transparent, and effective. Here's exactly how we get you funded.
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
                      Choose Your Plan
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Select the funding service plan that fits your needs. We offer different packages for various account sizes and requirements.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-start gap-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Account Setup
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      We'll help you purchase the evaluation account and set up all necessary credentials. Our team handles the technical setup.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-start gap-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 text-white font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Expert Trading
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Our professional traders execute the evaluation strategy, meeting profit targets while maintaining strict risk management.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-start gap-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-white font-bold text-lg">
                    4
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Get Funded
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Once both phases are complete, you receive your funded account credentials and can start trading with real capital.
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
                Ready to get your funded trading account?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-green-100">
                Join hundreds of successful traders who have gotten funded through our service. Skip the evaluation stress and start earning profits.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Get Funded Now
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
