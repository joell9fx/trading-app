import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Membership plans: Signals, Gold to Glory, Elite and VIP.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
