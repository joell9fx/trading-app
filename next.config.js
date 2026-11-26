/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'supabase.co',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'images.unsplash.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },
  webpack: (config, { isServer }) => {
    // Handle Supabase realtime warnings
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve '\.\/\d+\.js'/,
    ];
    
    // Improve module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
  // Security headers (CSP, X-Frame-Options, etc.) are set only in middleware.ts to avoid duplicates.
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      // Legacy pricing page: /pricing is the live, Stripe-wired plans page
      {
        source: '/prices',
        destination: '/pricing',
        permanent: false,
      },
      { source: '/contact', destination: '/support', permanent: false },
      { source: '/learn', destination: '/courses', permanent: false },
      // Legacy path: ensure any request or cached link to /site.webmanifest gets the manifest
      {
        source: '/site.webmanifest',
        destination: '/manifest.webmanifest',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
