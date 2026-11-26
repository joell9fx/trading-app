'use client'

/**
 * Last-resort boundary for errors in the root layout itself. It replaces the
 * whole document, so it can't rely on the layout's fonts or providers.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#000', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <p style={{ color: '#f59e0b', letterSpacing: '0.2em', fontSize: 12, textTransform: 'uppercase' }}>
              Trading Academy
            </p>
            <h1 style={{ fontSize: 26 }}>Something went wrong</h1>
            <p style={{ color: '#ccc' }}>Please try again in a moment.</p>
            {error.digest && <p style={{ color: '#777', fontSize: 12 }}>Reference: {error.digest}</p>}
            <button
              type="button"
              onClick={reset}
              style={{ marginTop: 12, background: '#f59e0b', color: '#000', border: 0, borderRadius: 8, padding: '10px 18px', fontWeight: 600, cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
