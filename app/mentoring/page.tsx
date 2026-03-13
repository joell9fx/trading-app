import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, MessageCircle, Clock, Star, Award, TrendingUp, Target, Shield, UserCheck, Calendar, Video, BookOpen } from 'lucide-react';

export default function MentoringPage() {
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
                  <UserCheck className="mr-1 h-4 w-4" />
                  Personal Guidance
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Get Personal
                <span className="gradient-text block">Trading Mentorship</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Connect with experienced traders who will guide you through your trading journey, provide personalized feedback, and help you avoid common pitfalls.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Find Your Mentor
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

      {/* Why Mentorship Section */}
      <section className="py-24 sm:py-32 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose Personal Mentorship?
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Accelerate your trading success with personalized guidance from experienced professionals.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <Target className="h-5 w-5 flex-none text-blue-600 dark:text-blue-400" />
                  Personalized Learning
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">Get customized guidance based on your experience level, trading style, and specific goals. No one-size-fits-all approach.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <Shield className="h-5 w-5 flex-none text-green-600 dark:text-green-400" />
                  Risk Management
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">Learn proven risk management strategies from mentors who have protected their capital through various market conditions.</p>
                </dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <TrendingUp className="h-5 w-5 flex-none text-purple-600 dark:text-purple-400" />
                  Accelerated Growth
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">Skip years of trial and error by learning from mentors who have already made the mistakes and found the solutions.</p>
                </dd>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mentorship Programs */}
      <section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Mentorship Programs
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Choose the mentorship program that best fits your needs and schedule.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                    <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Weekly Check-ins</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">Free</p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Weekly group Q&A sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Access to mentor resources
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Community support
                  </li>
                </ul>
                <Link href="/signup" className="w-full">
                  <Button className="w-full" variant="outline">
                    Get Started
                  </Button>
                </Link>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow border-2 border-blue-500">
                <div className="text-center mb-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
                    <Video className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Monthly Sessions</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">$99/month</p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Monthly 1-on-1 video calls
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Personalized feedback
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Priority support
                  </li>
                </ul>
                <Link href="/signup" className="w-full">
                  <Button className="w-full">
                    Choose Plan
                  </Button>
                </Link>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                    <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Intensive Program</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">$299/month</p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Weekly 1-on-1 sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Daily check-ins
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Custom trading plan
                  </li>
                </ul>
                <Link href="/signup" className="w-full">
                  <Button className="w-full" variant="outline">
                    Choose Plan
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section className="py-24 sm:py-32 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Meet Our Expert Mentors
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Learn from successful traders with proven track records and years of experience.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-white">JD</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">John Davis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Day Trading Specialist</p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">(4.9)</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  15+ years experience in day trading. Specializes in momentum strategies and risk management.
                </p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">500+</span> students mentored
                </div>
              </Card>
              
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-white">SM</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Sarah Mitchell</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Swing Trading Expert</p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">(4.8)</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Former hedge fund analyst with expertise in technical analysis and market psychology.
                </p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">300+</span> students mentored
                </div>
              </Card>
              
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-white">MR</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Mike Rodriguez</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Options & Derivatives</p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">(4.9)</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Options trader with 20+ years experience. Expert in complex strategies and risk management.
                </p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">200+</span> students mentored
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How Mentorship Works
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Simple steps to connect with your perfect mentor and start your personalized learning journey.
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
                      Choose Your Mentor
                    </h3>
                    <p className="text-muted-foreground">
                      Browse our expert mentors, read their profiles, and select the one that best matches your trading goals and style.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-start gap-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Schedule Sessions
                    </h3>
                    <p className="text-muted-foreground">
                      Book your mentorship sessions at times that work for you. Flexible scheduling to fit your busy lifestyle.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-start gap-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 text-white font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Learn & Practice
                    </h3>
                    <p className="text-muted-foreground">
                      Receive personalized guidance, practice new strategies, and get feedback on your trading decisions.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-start gap-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-white font-bold text-lg">
                    4
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Track Progress
                    </h3>
                    <p className="text-muted-foreground">
                      Monitor your improvement with regular assessments and celebrate milestones in your trading journey.
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
                Ready to accelerate your trading success?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
                Connect with an expert mentor today and start your personalized trading journey.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Find Your Mentor
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
