import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Who we are and why we built Trading Academy.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
