import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Play, Users, Clock, Star, Award, TrendingUp, Target, Shield } from 'lucide-react';

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-24 sm:py-32">
            <div className="text-center">
              <div className="mb-8">
                <span className="inline-flex items-center rounded-full bg-accent-muted px-3 py-1 text-sm font-medium text-primary">
                  <BookOpen className="mr-1 h-4 w-4" />
                  Master Trading
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Learn Trading from
                <span className="gradient-text block">Industry Experts</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Comprehensive trading courses designed to take you from beginner to advanced trader. Learn proven strategies, risk management, and market analysis.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Start Learning Free
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

      {/* Course Categories */}
      <section className="py-24 sm:py-32 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Course Categories
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Choose from our comprehensive range of trading courses designed for all skill levels.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Beginner</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Perfect for those new to trading. Learn the fundamentals, terminology, and basic strategies.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Market basics and terminology
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Risk management fundamentals
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Basic chart analysis
                  </li>
                </ul>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Intermediate</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  For traders with some experience. Master advanced strategies and technical analysis.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Advanced technical analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Options and derivatives
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Portfolio management
                  </li>
                </ul>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Advanced</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Expert-level courses for professional traders. Master complex strategies and market psychology.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Algorithmic trading
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Market psychology
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Institutional strategies
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 sm:py-32 bg-panel">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Featured Courses
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Our most popular and highly-rated courses to accelerate your trading journey.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Play className="h-16 w-16 text-white" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Beginner
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">4.9 (2.1k)</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Trading Fundamentals Masterclass
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Master the basics of trading with this comprehensive course covering market mechanics, risk management, and basic strategies.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        12 hours
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        15.2k students
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">Free</span>
                  </div>
                </div>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                  <TrendingUp className="h-16 w-16 text-white" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                      Intermediate
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">4.8 (1.8k)</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Technical Analysis Pro
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn advanced chart patterns, indicators, and technical analysis techniques used by professional traders.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        18 hours
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        12.7k students
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">Free</span>
                  </div>
                </div>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Shield className="h-16 w-16 text-white" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Advanced
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">4.9 (956)</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Risk Management Excellence
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Master the art of risk management and position sizing to protect your capital and maximize returns.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        8 hours
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        8.9k students
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

      {/* Learning Path */}
      <section className="py-24 sm:py-32 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your Learning Path
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Follow our structured learning path to become a confident and successful trader.
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
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Foundation Building
                    </h3>
                    <p className="text-muted-foreground">
                      Start with market basics, terminology, and fundamental concepts. Complete our beginner courses to build a solid foundation.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-start gap-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Skill Development
                    </h3>
                    <p className="text-muted-foreground">
                      Master technical analysis, chart patterns, and trading strategies. Practice with paper trading and small positions.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-start gap-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 text-white font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Advanced Mastery
                    </h3>
                    <p className="text-muted-foreground">
                      Learn advanced strategies, risk management, and market psychology. Develop your own trading system and style.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-start gap-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-white font-bold text-lg">
                    4
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Continuous Growth
                    </h3>
                    <p className="text-muted-foreground">
                      Stay updated with market trends, new strategies, and continuous learning. Join our community for ongoing support.
                    </p>
                  </div>
                </div>
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
                Join thousands of traders who have transformed their financial future with our comprehensive courses.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Start Learning Free
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
