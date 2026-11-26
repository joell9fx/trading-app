import Link from 'next/link'
import { StatusPage } from '@/components/ui/status-page'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <StatusPage
      eyebrow="404"
      title="We couldn't find that page"
      message="The link may be out of date, or the page may be private."
      actions={
        <Link
          href="/support"
          className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-black hover:bg-gold-400"
        >
          Get help
        </Link>
      }
    />
  )
}
