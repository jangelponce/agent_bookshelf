import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'

type App = ReturnType<typeof createApp>

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

describe('books', () => {
  let app: App

  beforeEach(() => {
    app = createApp()
  })

  async function createBook(body: unknown = { title: 'Dune', author: 'Frank Herbert', year: 1965 }) {
    return app.request('/books', json(body))
  }

  describe('GET /books', () => {
    it('returns an empty list initially', async () => {
      const res = await app.request('/books')
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual([])
    })

    it('returns created books', async () => {
      await createBook()
      const res = await app.request('/books')
      const books = await res.json()
      expect(books).toHaveLength(1)
      expect(books[0]).toMatchObject({ title: 'Dune', author: 'Frank Herbert', year: 1965 })
    })
  })

  describe('GET /books/:id', () => {
    it('returns the book', async () => {
      const created = await (await createBook()).json()
      const res = await app.request(`/books/${created.id}`)
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual(created)
    })

    it('returns 404 for an unknown id', async () => {
      const res = await app.request('/books/missing')
      expect(res.status).toBe(404)
      expect(await res.json()).toEqual({ error: 'Book not found' })
    })
  })

  describe('POST /books', () => {
    it('creates a book with a generated id', async () => {
      const res = await createBook()
      expect(res.status).toBe(201)
      const book = await res.json()
      expect(book).toEqual({ id: expect.any(String), title: 'Dune', author: 'Frank Herbert', year: 1965 })
    })

    it('accepts a book without year', async () => {
      const res = await createBook({ title: 'Dune', author: 'Frank Herbert' })
      expect(res.status).toBe(201)
      expect(await res.json()).not.toHaveProperty('year')
    })

    it.each([
      ['missing title', { author: 'A' }],
      ['empty title', { title: '', author: 'A' }],
      ['blank title', { title: '   ', author: 'A' }],
      ['missing author', { title: 'T' }],
      ['empty author', { title: 'T', author: '' }],
      ['non-string title', { title: 1, author: 'A' }],
      ['non-integer year', { title: 'T', author: 'A', year: 1.5 }],
      ['string year', { title: 'T', author: 'A', year: '1965' }],
    ])('rejects %s with 400', async (_name, body) => {
      const res = await createBook(body)
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: expect.any(String) })
    })

    it('rejects a malformed JSON body with 400', async () => {
      const res = await app.request('/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{not json',
      })
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ error: expect.any(String) })
    })

    it('rejects a non-object body with 400', async () => {
      const res = await createBook([])
      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /books/:id', () => {
    it('deletes the book', async () => {
      const created = await (await createBook()).json()
      const res = await app.request(`/books/${created.id}`, { method: 'DELETE' })
      expect(res.status).toBe(204)
      expect((await app.request(`/books/${created.id}`)).status).toBe(404)
    })

    it('returns 404 for an unknown id', async () => {
      const res = await app.request('/books/missing', { method: 'DELETE' })
      expect(res.status).toBe(404)
      expect(await res.json()).toEqual({ error: 'Book not found' })
    })
  })

  it('isolates state between app instances', async () => {
    await createBook()
    const other = createApp()
    expect(await (await other.request('/books')).json()).toEqual([])
  })
})
