---
type: regex
target: { source: file, path: src/books/book.ts }
pattern: "export type NewBook = Omit<Book, 'id'>"
---
