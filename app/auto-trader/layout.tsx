import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Auto Trader',
  description: 'Automated trading — coming soon.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
