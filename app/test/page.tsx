'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function TestPage() {
  const [status, setStatus] = useState('Loading...')
  const [posts, setPosts] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    testCommunityPosts()
  }, [])

  const testCommunityPosts = async () => {
    try {
      setStatus('Testing community posts API...')

      const response = await fetch('/api/community/posts')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setPosts(result.posts || [])
      setStatus('✅ Community posts API working!')
    } catch (error) {
      console.error('Error testing community posts:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      setStatus('❌ Community posts API failed')
    }
  }

  const testDatabaseConnection = async () => {
    try {
      setStatus('Testing database connection...')

      const { data, error } = await supabase
        .from('community_posts')
        .select('count')
        .limit(1)

      if (error) {
        throw error
      }

      setStatus('✅ Database connection working!')
    } catch (error) {
      console.error('Error testing database:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      setStatus('❌ Database connection failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            🧪 Trading App Test Page
          </h1>
          <p className="text-lg text-gray-600">
            Testing the application functionality after fixing routing conflicts
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">API Status</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm text-gray-600">
                  Community Posts API:
                </p>
                <p
                  className={`font-mono text-sm ${
                    status.includes('✅')
                      ? 'text-green-600'
                      : status.includes('❌')
                        ? 'text-red-600'
                        : 'text-blue-600'
                  }`}
                >
                  {status}
                </p>
              </div>

              <button
                onClick={testCommunityPosts}
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Test Community Posts API
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Database Status</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm text-gray-600">
                  Database Connection:
                </p>
                <p className="font-mono text-sm text-blue-600">Ready to test</p>
              </div>

              <button
                onClick={testDatabaseConnection}
                className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
              >
                Test Database Connection
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="mb-2 font-semibold text-red-800">Error Details:</h3>
            <p className="font-mono text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Community Posts Test</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Testing the community posts functionality that was previously
              failing.
            </p>

            {posts.length > 0 ? (
              <div>
                <p className="mb-2 font-semibold text-green-600">
                  ✅ Found {posts.length} posts:
                </p>
                <div className="space-y-2">
                  {posts.map((post, index) => (
                    <div key={index} className="rounded border bg-gray-50 p-3">
                      <h4 className="font-semibold">{post.title}</h4>
                      <p className="text-sm text-gray-600">{post.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="mb-2 text-gray-500">No posts found</p>
                <p className="text-sm text-gray-400">
                  This is normal if no posts have been created yet
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-2 font-semibold text-blue-800">
            What This Test Page Verifies:
          </h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>✅ Next.js routing conflicts are resolved</li>
            <li>✅ Development server starts without errors</li>
            <li>✅ Community posts API is accessible</li>
            <li>✅ Database connection is working</li>
            <li>✅ The "Failed to load posts" error is fixed</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
