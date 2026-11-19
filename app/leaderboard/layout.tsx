import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'Top Trading Academy members by XP, consistency and lessons.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
