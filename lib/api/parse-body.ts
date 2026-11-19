import { NextResponse } from 'next/server'
import { z, type ZodType, type ZodTypeDef } from 'zod'

export type ParseBodyResult<T> = { data: T; error?: undefined } | { data?: undefined; error: NextResponse }

/**
 * Reads a JSON request body and validates it with a zod schema.
 * Returns `{ data }` on success or `{ error }` holding a 400 response.
 *
 *   const body = await parseBody(req, Schema)
 *   if (body.error) return body.error
 */
export async function parseBody<T>(
  req: Request,
  schema: ZodType<T, ZodTypeDef, unknown>,
): Promise<ParseBodyResult<T>> {
  const raw = await req.json().catch(() => undefined)
  if (raw === undefined) {
    return { error: NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 }) }
  }
  const result = schema.safeParse(raw)
  if (!result.success) {
    const issue = result.error.issues[0]
    const where = issue?.path.length ? `${issue.path.join('.')}: ` : ''
    return {
      error: NextResponse.json(
        { error: `Invalid request. ${where}${issue?.message ?? 'Check the fields and try again.'}` },
        { status: 400 },
      ),
    }
  }
  return { data: result.data }
}

/** Row id from a request body: a uuid or numeric id, sent as string or number. */
export const idSchema = z.coerce.string().trim().min(1).max(64)
