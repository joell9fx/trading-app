'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'

const testimonials = [
  {
    body: "The courses here completely transformed my trading approach. I went from losing money consistently to having a profitable strategy within 6 months.",
    author: {
      name: "Sarah Chen",
      handle: "Professional Trader",
      imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    rating: 5,
  },
  {
    body: "The mentoring program is incredible. My mentor helped me identify my weaknesses and develop a personalized trading plan that works for my lifestyle.",
    author: {
      name: "Michael Rodriguez",
      handle: "Day Trader",
      imageUrl: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    rating: 5,
  },
  {
    body: "The community here is amazing. I've learned so much from other traders and the real-time discussions help me stay on top of market opportunities.",
    author: {
      name: "Emily Watson",
      handle: "Swing Trader",
      imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    rating: 5,
  },
  {
    body: "The risk management course alone was worth the entire membership. I now have a solid foundation that protects my capital while maximizing returns.",
    author: {
      name: "David Kim",
      handle: "Options Trader",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    rating: 5,
  },
  {
    body: "I was skeptical at first, but the quality of education here is top-notch. The instructors are real traders with proven track records, not just academics.",
    author: {
      name: "Lisa Thompson",
      handle: "Futures Trader",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    rating: 5,
  },
  {
    body: "The certification program helped me land a job at a hedge fund. The knowledge and credentials I gained here opened doors I never thought possible.",
    author: {
      name: "James Wilson",
      handle: "Institutional Trader",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    rating: 5,
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32 bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-semibold leading-8 tracking-tight text-gold-400">
            Testimonials
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Hear from our successful students
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, testimonialIdx) => (
              <div key={testimonialIdx} className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-sm hover:border-gold-500/50 transition-colors">
                <div className="flex items-center gap-x-4">
                  <Image
                    className="h-10 w-10 rounded-full bg-gray-800 border border-gray-700"
                    src={testimonial.author.imageUrl}
                    alt={testimonial.author.name}
                    width={40}
                    height={40}
                    unoptimized
                  />
                  <div className="text-sm leading-6">
                    <p className="font-semibold text-white">
                      <span className="absolute inset-0" />
                      {testimonial.author.name}
                    </p>
                    <p className="text-gray-400">{testimonial.author.handle}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-x-1">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <Star
                      key={rating}
                      className={classNames(
                        testimonial.rating > rating ? 'text-gold-400 fill-gold-400' : 'text-gray-700',
                        'h-5 w-5 flex-none'
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-300">"{testimonial.body}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
