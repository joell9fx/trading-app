import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Star, Users, Clock, Shield, Target, TrendingUp, Award, Zap, Globe, Headphones, BookOpen, X } from 'lucide-react';

export default function PricingPage() {
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
                  <Star className="mr-1 h-4 w-4" />
                  Choose Your Plan
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
                Simple,
                <span className="gradient-text block">Transparent Pricing</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                Start your trading journey with our free tier, or unlock premium features with our affordable plans. No hidden fees, no surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-24 sm:py-32 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Choose the Perfect Plan
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Whether you're just starting out or ready to go pro, we have a plan that fits your needs.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Free Plan */}
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Free</h3>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">$0</p>
                  <p className="text-gray-600 dark:text-gray-400">Forever</p>
                </div>
                <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-300 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Access to basic courses
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Community forum access
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Weekly Q&A sessions
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Basic trading signals
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Email support
                  </li>
                </ul>
                <Link href="/signup" className="w-full">
                  <Button className="w-full" variant="outline">
                    Get Started Free
                  </Button>
                </Link>
              </Card>
              
              {/* Pro Plan */}
              <Card className="p-8 hover:shadow-lg transition-shadow border-2 border-blue-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pro</h3>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">$29</p>
                  <p className="text-gray-600 dark:text-gray-400">per month</p>
                </div>
                <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-300 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Everything in Free
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    All premium courses
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Priority trading signals
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Monthly mentorship session
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Priority support
                  </li>
                </ul>
                <Link href="/signup" className="w-full">
                  <Button className="w-full">
                    Start Pro Trial
                  </Button>
                </Link>
              </Card>
              
              {/* Enterprise Plan */}
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Enterprise</h3>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">$99</p>
                  <p className="text-gray-600 dark:text-gray-400">per month</p>
                </div>
                <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-300 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Everything in Pro
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Weekly 1-on-1 mentorship
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Custom trading strategies
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Portfolio analysis
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    Dedicated account manager
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    24/7 phone support
                  </li>
                </ul>
                <Link href="/signup" className="w-full">
                  <Button className="w-full" variant="outline">
                    Contact Sales
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-24 sm:py-32 bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Feature Comparison
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              See exactly what each plan includes to make the best choice for your trading journey.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="overflow-hidden rounded-xl border-2 border-gray-700 shadow-lg bg-gray-800">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-300">
                      Free
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30">
                      Pro
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-purple-700 dark:text-purple-400">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {/* Basic Courses Row */}
                  <tr className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            Basic Courses
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Essential trading courses
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Check className="h-6 w-6 text-green-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Included</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center bg-blue-50/50 dark:bg-blue-900/10">
                      <div className="flex flex-col items-center gap-1">
                        <Check className="h-6 w-6 text-green-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Included</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Check className="h-6 w-6 text-green-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Included</span>
                      </div>
                    </td>
                  </tr>

                  {/* Premium Courses Row */}
                  <tr className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            Premium Courses
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Advanced & expert-level content
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1">
                        <X className="h-6 w-6 text-red-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Not included</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center bg-blue-50/50 dark:bg-blue-900/10">
                      <div className="flex flex-col items-center gap-1">
                        <Check className="h-6 w-6 text-green-500" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Full access</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Check className="h-6 w-6 text-green-500" />
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Full access</span>
                      </div>
                    </td>
                  </tr>

                  {/* Trading Signals Row */}
                  <tr className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            Trading Signals
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Real-time market signals
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-semibold">
                          Basic
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Limited access</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center bg-blue-50/50 dark:bg-blue-900/10">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                          Priority
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Early access</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                          Premium
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">All signals</span>
                      </div>
                    </td>
                  </tr>

                  {/* Mentorship Row */}
                  <tr className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            Mentorship
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            1-on-1 sessions with experts
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1">
                        <X className="h-6 w-6 text-red-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Not available</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center bg-blue-50/50 dark:bg-blue-900/10">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                          Monthly
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">1 session/month</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                          Weekly
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">4 sessions/month</span>
                      </div>
                    </td>
                  </tr>

                  {/* Support Row */}
                  <tr className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Headphones className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            Support
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Customer support channels
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-semibold">
                          Email
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Standard response</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center bg-blue-50/50 dark:bg-blue-900/10">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                          Priority
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Faster response</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                          24/7 Phone
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Always available</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 sm:py-32 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Get answers to common questions about our pricing and plans.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="space-y-8">
              <div className="border-b border-gray-700 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Can I cancel my subscription at any time?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. You'll continue to have access to your plan until the end of your current billing period.
                </p>
              </div>
              
              <div className="border-b border-gray-700 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Is there a free trial for paid plans?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! We offer a 7-day free trial for our Pro and Enterprise plans. You can try all the premium features before committing to a paid subscription.
                </p>
              </div>
              
              <div className="border-b border-gray-700 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. All payments are processed securely through Stripe.
                </p>
              </div>
              
              <div className="border-b border-gray-700 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Do you offer discounts for students or groups?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! We offer special pricing for students with valid student IDs and group discounts for teams of 5 or more. Contact our sales team for more information.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Can I upgrade or downgrade my plan?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Absolutely! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the new rate will apply at your next billing cycle.
                </p>
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
                Ready to start your trading journey?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
                Join thousands of traders who have transformed their financial future with our comprehensive platform.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600">
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
