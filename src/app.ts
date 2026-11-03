import { Hono } from 'hono'
import { createBookRoutes } from './books/routes.js'
import { createInMemoryBookRepository, type BookRepository } from './books/repository.js'

export function createApp(books: BookRepository = createInMemoryBookRepository()) {
  const app = new Hono()

  app.get('/health', (c) => c.json({ status: 'ok' }))
  app.route('/books', createBookRoutes(books))

  return app
}
