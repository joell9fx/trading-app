import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prop Firm Funding',
  description: 'Get support with prop firm evaluations and funded accounts.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
