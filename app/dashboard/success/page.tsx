import Link from 'next/link'
import { SERVICE_DISPLAY_NAMES } from '@/lib/service-products'

export default function SuccessPage({ searchParams }: { searchParams: { service?: string } }) {
  const serviceKey = searchParams?.service
  const serviceName = SERVICE_DISPLAY_NAMES[serviceKey || ''] || 'Your service'

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-xl border border-green-500/30 bg-green-500/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 border border-green-500/40">
          <span className="text-2xl">✅</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful</h1>
        <p className="text-gray-300">
          {serviceName} has been unlocked. Enjoy your new access!
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/dashboard"
            className="rounded-md bg-gold-500 px-5 py-3 text-black font-semibold hover:bg-gold-600"
          >
            Go back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

