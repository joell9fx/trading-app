import type { MetadataRoute } from 'next'

/** Served at /manifest.webmanifest so the manifest link never 404s (public/site.webmanifest may be untracked). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Trading Academy',
    short_name: 'TradingAcademy',
    description: 'Master the markets with professional trading education',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
