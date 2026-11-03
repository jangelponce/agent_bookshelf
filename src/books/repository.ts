import type { Book, NewBook } from './book.js'

export type BookRepository = {
  list(): Book[]
  get(id: string): Book | undefined
  create(input: NewBook): Book
  delete(id: string): boolean
}

export function createInMemoryBookRepository(): BookRepository {
  const books = new Map<string, Book>()

  return {
    list: () => [...books.values()],
    get: (id) => books.get(id),
    create: (input) => {
      const book: Book = { id: crypto.randomUUID(), ...input }
      books.set(book.id, book)
      return book
    },
    delete: (id) => books.delete(id),
  }
}
