import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trading Courses',
  description: 'Structured trading courses from beginner to advanced.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
