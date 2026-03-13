import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - Trading Academy',
  description: 'Privacy policy for Trading Academy.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-300 mb-6">
          This page will contain the full privacy policy. For now, we collect only what is needed to provide your account and services.
        </p>
        <Link href="/" className="text-gold-400 hover:underline">Back to home</Link>
      </div>
    </div>
  )
}
