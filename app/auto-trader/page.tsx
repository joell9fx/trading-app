'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Bot, TrendingUp, Clock, Shield, Zap, Settings, BarChart3, Activity, AlertTriangle, Play, Pause, DollarSign } from 'lucide-react'
import Link from 'next/link'

const handleGetStarted = () => {
  window.location.href = '/signup'
}

const handleLearnMore = () => {
  window.location.href = '/signin'
}

export default function AutoTraderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-8">
            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-sm font-medium text-blue-800 dark:text-blue-200">
              <Bot className="mr-1 h-4 w-4" />
              Automated Trading
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Auto Bot Trader
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Trade 24/7 with our automated trading bot. Set it and forget it—let advanced algorithms handle your trading while you sleep. Backtested strategies with built-in risk management.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={handleLearnMore}
            >
              Learn More
            </Button>
          </div>

          {/* Trust Strip */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span>24/7 Automated Trading</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span>Risk Management Built-in</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span>Backtested Strategies</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trade Around the Clock</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Never miss an opportunity. Our bot trades 24/7, even when you're sleeping.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Built-in Risk Management</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Automatic stop-loss, position sizing, and drawdown protection keep your account safe.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Proven Algorithms</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Strategies tested on years of historical data for consistent performance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What is Auto Bot Trader */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            What is Auto Bot Trader?
          </h2>
          <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-8">
            Our Auto Bot Trader is an advanced automated trading system that executes trades on your behalf using sophisticated algorithms. It monitors the markets continuously, identifies trading opportunities, and executes trades based on predefined strategies—all without your constant supervision.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-x-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Fully Automated</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Once configured, the bot runs independently. No manual intervention needed—just monitor your profits.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-x-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Real-time Execution</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Instant trade execution when market conditions meet your strategy parameters. No delays, no missed opportunities.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-x-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Customizable</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Adjust risk parameters, trading pairs, timeframes, and strategy settings to match your preferences.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Connect Your Account</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Link your trading account via secure API connection. Your credentials are encrypted and never stored.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Configure Settings</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Set your risk parameters, choose trading pairs, select strategies, and define position sizing rules.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Activate Bot</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Start the bot and let it begin trading. Monitor performance through our dashboard in real-time.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Monitor & Profit</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track your trades, view performance metrics, and adjust settings as needed. The bot handles the rest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">24/7 Market Monitoring</h3>
                <p className="text-gray-600 dark:text-gray-300">Never miss a trading opportunity with continuous market analysis</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Multiple Strategy Support</h3>
                <p className="text-gray-600 dark:text-gray-300">Choose from trend following, mean reversion, scalping, and more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Automatic Risk Management</h3>
                <p className="text-gray-600 dark:text-gray-300">Built-in stop-loss, take-profit, and position sizing controls</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Real-time Performance Dashboard</h3>
                <p className="text-gray-600 dark:text-gray-300">Track profits, drawdowns, win rate, and all key metrics</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Backtested Algorithms</h3>
                <p className="text-gray-600 dark:text-gray-300">Strategies tested on years of historical data for reliability</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Multi-Asset Support</h3>
                <p className="text-gray-600 dark:text-gray-300">Trade Forex, Crypto, Stocks, Futures, and Commodities</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Emergency Stop Function</h3>
                <p className="text-gray-600 dark:text-gray-300">Instantly pause trading with one click if market conditions change</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Mobile App Access</h3>
                <p className="text-gray-600 dark:text-gray-300">Monitor and control your bot from anywhere with our mobile app</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Strategies */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Available Trading Strategies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Trend Following</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Identifies and follows market trends, entering positions when momentum is strong and exiting at trend reversals.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Mean Reversion</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Capitalizes on price deviations from average, buying low and selling high when prices return to mean.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Scalping</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                High-frequency trading strategy that captures small price movements for quick profits throughout the day.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Breakout Trading</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Enters positions when price breaks through key support or resistance levels with high volume confirmation.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Arbitrage</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Exploits price differences across exchanges or markets for risk-free profit opportunities.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="h-8 w-8 text-red-600 dark:text-red-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Custom Strategy</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Build your own trading strategy using our strategy builder with custom indicators and logic.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Risk Management */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Advanced Risk Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Position Sizing</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Automatically calculates optimal position sizes based on account balance, risk percentage, and stop-loss distance.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Fixed percentage risk per trade
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Kelly Criterion optimization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Maximum position size limits
                </li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Drawdown Protection</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Automatic trading halt when drawdown limits are reached to protect your capital.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Daily drawdown limits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Overall account drawdown protection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Automatic position closure on breach
                </li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Time-based Controls</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Schedule trading hours and avoid high-risk periods like news events or low liquidity times.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Custom trading hours
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  News event filters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Weekend trading controls
                </li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Emergency Controls</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Instant stop and pause functions to immediately halt all trading activity when needed.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  One-click emergency stop
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Pause trading temporarily
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Close all positions instantly
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <CardDescription>Perfect for beginners</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$49</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">1 Trading Strategy</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Basic Risk Management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Email Support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Performance Dashboard</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-blue-600">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>For serious traders</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$99</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">All Trading Strategies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Advanced Risk Management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Priority Support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Custom Strategy Builder</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Multi-Account Support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleGetStarted}
                >
                  Get Pro
                </Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>For institutions</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">Custom</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Everything in Pro</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Dedicated Account Manager</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Custom API Integration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">White-label Options</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">SLA Guarantee</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  variant="outline"
                  onClick={handleGetStarted}
                >
                  Contact Sales
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Is automated trading safe?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Yes, when properly configured with risk management. Our bots include built-in stop-loss, position sizing, and drawdown protection. However, trading always involves risk, and past performance doesn't guarantee future results.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Do I need trading experience to use the bot?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                While some basic understanding helps, our bots are designed to be user-friendly. We provide guides and support to help you configure and monitor your bot effectively.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Can I pause or stop the bot anytime?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Absolutely. You can pause, stop, or modify the bot's settings at any time through our dashboard or mobile app. Emergency stop functions are available for immediate action.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Which brokers/exchanges are supported?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                We support major brokers and exchanges including MetaTrader 4/5, cTrader, Binance, Interactive Brokers, and many more. Check our documentation for the full list.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                What if the bot makes losing trades?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Losses are part of trading. Our risk management features limit losses per trade and overall drawdown. You can set maximum loss limits, and the bot will automatically stop trading if limits are reached.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Is there a mobile app?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Yes, our mobile app (iOS and Android) allows you to monitor your bot's performance, view trades, adjust settings, and control the bot from anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Disclosure */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Risk Disclosure
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-sm">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4">
              Trading involves substantial risk of loss and is not suitable for all investors. Automated trading systems, while designed to follow predefined rules, cannot guarantee profits or prevent losses.
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4">
              Past performance of trading strategies does not guarantee future results. Market conditions can change rapidly, and automated systems may not always adapt quickly enough to volatile markets.
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              You should carefully consider whether trading is suitable for you in light of your circumstances, knowledge, and financial resources. Never trade with money you cannot afford to lose.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Ready to Start Automated Trading?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of traders who are already using our Auto Bot Trader to grow their accounts 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg"
              className="text-lg px-8 py-6"
              onClick={handleGetStarted}
            >
              Get Started Now
            </Button>
            <Link href="/signin">
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600"
              >
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

