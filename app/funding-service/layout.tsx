import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Funding Service',
  description: 'A managed, rules-based pathway through prop firm evaluations.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
