import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trading Signals',
  description: 'Daily structured trade setups with entry, stop and invalidation levels.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
