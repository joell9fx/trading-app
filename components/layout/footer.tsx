'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'

const navigation = {
  main: [
    { name: 'About', href: '/about' },
    { name: 'Courses', href: '/courses' },
    { name: 'Mentoring', href: '/mentoring' },
    { name: 'Community', href: '/community' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Support', href: '/support' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
  social: [
    {
      name: 'Facebook',
      href: '#',
      icon: Facebook,
    },
    {
      name: 'Twitter',
      href: '#',
      icon: Twitter,
    },
    {
      name: 'Instagram',
      href: '#',
      icon: Instagram,
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: Linkedin,
    },
    {
      name: 'YouTube',
      href: '#',
      icon: Youtube,
    },
  ],
}

export function Footer() {
  return (
    <footer className="bg-black border-t border-yellow-500/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center luxury-glow">
                  <span className="text-black font-bold text-sm">TA</span>
                </div>
                <span className="text-xl font-bold text-white">
                  Trading Academy
                </span>
              </div>
              <p className="text-gray-400 max-w-md">
                Master the markets with professional trading education, expert mentoring, 
                and a thriving community of successful traders.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-yellow-500 text-sm transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-yellow-500 text-sm transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-8 pt-8 border-t border-yellow-500/20">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-500 text-sm">
                © 2024 Trading Academy. All rights reserved.
              </p>
              <div className="flex space-x-6">
                {navigation.social.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-500 hover:text-yellow-500 transition-colors duration-200"
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-6 w-6" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 pt-8 border-t border-yellow-500/20">
            <p className="text-xs text-gray-500 text-center">
              Past performance does not guarantee future results. Trading involves risk and you may lose money. 
              This is not financial advice. Please consult with a qualified financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
