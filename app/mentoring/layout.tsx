import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentorship',
  description: '1-on-1 and group mentorship with experienced traders.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
