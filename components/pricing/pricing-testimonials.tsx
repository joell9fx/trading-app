'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'

const testimonials = [
  {
    body: "The Pro plan was worth every penny. I went from losing money to having a profitable strategy within 3 months. The mentoring sessions were game-changing.",
    author: {
      name: "Sarah Chen",
      handle: "Professional Trader",
      imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    rating: 5,
    plan: "Pro",
  },
  {
    body: "Started with the free tier and upgraded to Pro after seeing the quality. The yearly plan saved me money and the advanced courses are incredible.",
    author: {
      name: "Michael Rodriguez",
      handle: "Day Trader",
      imageUrl: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    rating: 5,
    plan: "Pro",
  },
  {
    body: "The Enterprise plan transformed our trading desk. Custom courses, white-label solution, and dedicated support. ROI was immediate.",
    author: {
      name: "David Kim",
      handle: "Hedge Fund Manager",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    rating: 5,
    plan: "Enterprise",
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function PricingTestimonials() {
  return (
    <section className="py-24 sm:py-32 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Loved by traders worldwide
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            See what our members say about the value they've received from our platform.
          </p>
        </div>
        
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, testimonialIdx) => (
              <div key={testimonialIdx} className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="flex items-center gap-x-4">
                  <Image
                    className="h-10 w-10 rounded-full bg-gray-50"
                    src={testimonial.author.imageUrl}
                    alt={testimonial.author.name}
                    width={40}
                    height={40}
                    unoptimized
                  />
                  <div className="text-sm leading-6">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.author.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">{testimonial.author.handle}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-x-1">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <Star
                      key={rating}
                      className={classNames(
                        testimonial.rating > rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700',
                        'h-5 w-5 flex-none'
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">"{testimonial.body}"</p>
                <div className="mt-4">
                  <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-1 text-xs font-medium text-blue-800 dark:text-blue-200">
                    {testimonial.plan} Plan
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
