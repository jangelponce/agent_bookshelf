import { Hono } from 'hono'
import type { BookRepository } from './repository.js'
import { parseNewBook } from './validation.js'

export function createBookRoutes(repository: BookRepository) {
  const routes = new Hono()

  routes.get('/', (c) => c.json(repository.list()))

  routes.get('/:id', (c) => {
    const book = repository.get(c.req.param('id'))
    return book ? c.json(book) : c.json({ error: 'Book not found' }, 404)
  })

  routes.post('/', async (c) => {
    const body = await c.req.json().catch(() => undefined)
    const parsed = parseNewBook(body)
    if (!parsed.ok) return c.json({ error: parsed.error }, 400)
    return c.json(repository.create(parsed.value), 201)
  })

  routes.delete('/:id', (c) => {
    return repository.delete(c.req.param('id'))
      ? c.body(null, 204)
      : c.json({ error: 'Book not found' }, 404)
  })

  return routes
}
