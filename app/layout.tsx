import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { Navigation } from '@/components/layout/navigation'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Trading Academy - Master the Markets',
    template: '%s | Trading Academy'
  },
  description: 'Learn professional trading strategies, join our community, and get personalized mentoring from expert traders.',
  keywords: ['trading', 'education', 'courses', 'mentoring', 'community', 'finance', 'investing'],
  authors: [{ name: 'Trading Academy' }],
  creator: 'Trading Academy',
  publisher: 'Trading Academy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Trading Academy - Master the Markets',
    description: 'Learn professional trading strategies, join our community, and get personalized mentoring from expert traders.',
    siteName: 'Trading Academy',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Trading Academy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trading Academy - Master the Markets',
    description: 'Learn professional trading strategies, join our community, and get personalized mentoring from expert traders.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${inter.className} dark bg-black text-white`}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-black">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <MobileNav />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
