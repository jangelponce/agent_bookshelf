import type { NewBook } from './book.js'

export type ParseResult = { ok: true; value: NewBook } | { ok: false; error: string }

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

export function parseNewBook(body: unknown): ParseResult {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, error: 'Body must be a JSON object' }
  }

  const { title, author, year } = body as Record<string, unknown>

  if (!isNonEmptyString(title)) return { ok: false, error: 'title is required' }
  if (!isNonEmptyString(author)) return { ok: false, error: 'author is required' }
  if (year !== undefined && !Number.isInteger(year)) {
    return { ok: false, error: 'year must be an integer' }
  }

  return { ok: true, value: { title, author, ...(year !== undefined && { year: year as number }) } }
}
