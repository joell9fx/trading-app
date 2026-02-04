'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    question: "What's included in the free Starter plan?",
    answer: "The Starter plan includes access to 3 beginner courses, basic community forum access, essential trading tools, email support, and mobile app access. It's perfect for beginners who want to learn the basics."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time with no penalties or hidden fees. Your access will continue until the end of your current billing period."
  },
  {
    question: "How does the 14-day money-back guarantee work?",
    answer: "If you're not satisfied with your paid plan within 14 days of purchase, we'll provide a full refund. Simply contact our support team and we'll process your refund with no questions asked."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for Enterprise plans. All payments are processed securely through Stripe."
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the new rate applies at your next billing cycle."
  },
  {
    question: "Do you offer discounts for students or teams?",
    answer: "We offer educational discounts for students and volume discounts for teams. Contact our sales team for Enterprise plans or email support for student verification."
  },
  {
    question: "Is there a setup fee or hidden charges?",
    answer: "No, there are no setup fees or hidden charges. The price you see is the price you pay. We believe in transparent pricing with no surprises."
  },
  {
    question: "What happens if I exceed my plan limits?",
    answer: "You'll receive a notification when approaching your limits. For most features, you can upgrade your plan to access higher limits. Some features may be temporarily restricted until your next billing cycle."
  }
]

export function PricingFAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Can't find the answer you're looking for? Contact our support team.
          </p>
        </div>

        <div className="mt-16">
          <dl className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
              >
                <dt className="text-lg">
                  <button
                    onClick={() => toggleItem(index)}
                    className="flex w-full items-start justify-between px-6 py-4 text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors"
                  >
                    <span className="font-semibold">{faq.question}</span>
                    <span className="ml-6 flex h-7 items-center">
                      {openItems.includes(index) ? (
                        <ChevronUp className="h-6 w-6" />
                      ) : (
                        <ChevronDown className="h-6 w-6" />
                      )}
                    </span>
                  </button>
                </dt>
                {openItems.includes(index) && (
                  <dd className="px-6 pb-4">
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Still have questions?{' '}
            <a href="/support" className="text-blue-600 dark:text-blue-400 hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
