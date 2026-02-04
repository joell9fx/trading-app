'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Shield, TrendingUp, Clock, Users, Star } from 'lucide-react'
import { FUNDING_SERVICE_CONFIG, getPaymentUrl } from '@/lib/funding-service-config'

const handlePayment = (plan?: string) => {
  const url = getPaymentUrl(plan)
  window.open(url, '_blank')
}

const handleCallBooking = () => {
  window.open(FUNDING_SERVICE_CONFIG.CALL_URL, '_blank')
}

export default function FundingServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Done-For-You Funding Account Passing Service
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
            Transparent process, strict risk controls, and clear deliverables—so you can focus on trading once you're funded.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => handlePayment()}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={handleCallBooking}
            >
              Book a Call
            </Button>
          </div>

          {/* Trust Strip */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Trusted by {FUNDING_SERVICE_CONFIG.TRUST_INDICATORS.tradersCount} traders</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span>{FUNDING_SERVICE_CONFIG.TRUST_INDICATORS.rating}★ average rating</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Structured, rules-compliant evaluation strategy</h3>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Daily risk limits and max drawdown guardrails</h3>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-purple-100 mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Fast onboarding with live progress updates</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Who This Is For
          </h2>
          <p className="text-lg text-center text-gray-600 mb-8">
            Ideal for traders who understand prop firm rules and want a managed, rules-based pathway through the evaluation phases.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-4" />
              <p className="text-gray-700">You're comfortable with basic trading concepts</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-4" />
              <p className="text-gray-700">You agree to the risk rules and terms</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-4" />
              <p className="text-gray-700">You can provide a valid evaluation account from your chosen provider</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Onboard & Verify</h3>
              <p className="text-gray-600">
                Complete a brief intake form, connect your evaluation account, and verify prop firm rules (daily loss, overall drawdown, instruments, max lot size).
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Plan & Risk Setup</h3>
              <p className="text-gray-600">
                We configure a rule-compliant strategy: target %, daily risk, position sizing, trading hours, news filters.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Execution & Updates</h3>
              <p className="text-gray-600">
                We execute per plan and provide progress updates (daily/weekly) with equity curve snapshots.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Evaluation Pass & Handover</h3>
              <p className="text-gray-600">
                Once criteria are complete, we submit completion proof and transfer the account back to you.
              </p>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-8 italic">
            Timeframes vary based on market conditions, prop rules, and risk parameters.
          </p>
        </div>
      </section>

      {/* What's Included */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What's Included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">Rules-compliant evaluation plan aligned to your prop firm</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">Daily risk management with stop trading triggers</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">Weekly progress report (balance, equity, max drawdown, objectives met)</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">End-of-phase summary and pass confirmation (where applicable)</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">Email/portal support during evaluation window</p>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility & Requirements */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Eligibility & Requirements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">Valid evaluation account credentials from a supported provider</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">No prior breaches on the provided account</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">Agreement to our Terms, Risk Disclosure, and Refund Policy</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">KYC with the prop firm (if/when required) remains your responsibility</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{FUNDING_SERVICE_CONFIG.PRICING.starter.name}</CardTitle>
                <CardDescription>{FUNDING_SERVICE_CONFIG.PRICING.starter.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{FUNDING_SERVICE_CONFIG.PRICING.starter.price}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {FUNDING_SERVICE_CONFIG.PRICING.starter.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handlePayment('starter')}
                >
                  Get Starter
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-blue-600">
              {FUNDING_SERVICE_CONFIG.PRICING.pro.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{FUNDING_SERVICE_CONFIG.PRICING.pro.name}</CardTitle>
                <CardDescription>{FUNDING_SERVICE_CONFIG.PRICING.pro.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{FUNDING_SERVICE_CONFIG.PRICING.pro.price}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {FUNDING_SERVICE_CONFIG.PRICING.pro.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  variant="gradient"
                  onClick={() => handlePayment('pro')}
                >
                  Get Pro
                </Button>
              </CardFooter>
            </Card>

            {/* Elite Plan */}
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{FUNDING_SERVICE_CONFIG.PRICING.elite.name}</CardTitle>
                <CardDescription>{FUNDING_SERVICE_CONFIG.PRICING.elite.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{FUNDING_SERVICE_CONFIG.PRICING.elite.price}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {FUNDING_SERVICE_CONFIG.PRICING.elite.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handlePayment('elite')}
                >
                  Get Elite
                </Button>
              </CardFooter>
            </Card>
          </div>
          <p className="text-center text-sm text-gray-600 mt-8">
            Prices exclude prop firm evaluation fees. You purchase the evaluation from your provider.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you guarantee a pass?
              </h3>
              <p className="text-gray-700">
                No. We follow strict risk controls and a rule-compliant plan, but market risk remains. See Risk Disclosure.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Which prop firms are supported?
              </h3>
              <p className="text-gray-700">
                Most major providers; confirm during onboarding.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How are updates delivered?
              </h3>
              <p className="text-gray-700">
                Dashboard/email summaries; optional check-in calls on Elite.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What if the account breaches?
              </h3>
              <p className="text-gray-700">
                Execution stops immediately. Review is provided; any resets are at client's discretion/cost.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Refund policy?
              </h3>
              <p className="text-gray-700">
                Outlined in Terms; typically limited to scenarios where no execution occurred.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Risk Disclosure */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Compliance & Risk Disclosure
          </h2>
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <p className="text-gray-700 text-lg leading-relaxed">
              Trading involves risk. Past performance does not guarantee future results. We do not provide investment advice or guaranteed outcomes. You are responsible for your relationship with the prop firm and compliance with their terms. Our service is limited to executing a rules-based evaluation plan per your agreement.
            </p>
          </div>
        </div>
      </section>

      {/* Contact & Support */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Questions Before Getting Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Email us at{' '}
            <a href={`mailto:${FUNDING_SERVICE_CONFIG.SUPPORT_EMAIL}`} className="text-blue-600 hover:underline">
              {FUNDING_SERVICE_CONFIG.SUPPORT_EMAIL}
            </a>{' '}
            or book a call to discuss your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleCallBooking}
            >
              Book a Call
            </Button>
            <Button 
              size="lg"
              onClick={() => handlePayment()}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
