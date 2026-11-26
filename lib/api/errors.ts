import { NextResponse } from 'next/server'

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.'

/**
 * Logs a database/internal error server-side and returns a generic JSON error.
 * Never send raw database messages to the browser: they can reveal table,
 * column and constraint names.
 *
 *   if (error) return serverError(error, 'leaderboard')
 */
export function serverError(
  error: unknown,
  context: string,
  status = 500,
  message: string = DEFAULT_MESSAGE,
): NextResponse {
  console.error(`[${context}]`, error)
  return NextResponse.json({ error: message }, { status })
}
