import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - Trading Academy',
  description: 'Terms of service for Trading Academy.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-gray-300 mb-6">
          This page will contain the full terms of service. By using the platform you agree to these terms.
        </p>
        <Link href="/" className="text-gold-400 hover:underline">Back to home</Link>
      </div>
    </div>
  )
}
