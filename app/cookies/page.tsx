import Link from 'next/link'

export const metadata = {
  title: 'Cookie Policy - Trading Academy',
  description: 'Cookie policy for Trading Academy.',
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
        <p className="text-gray-300 mb-6">
          This page will contain the cookie policy. We use cookies for authentication and essential functionality.
        </p>
        <Link href="/" className="text-gold-400 hover:underline">Back to home</Link>
      </div>
    </div>
  )
}
