---
type: regex
target: { source: file, path: src/books/routes.ts }
pattern: "query\\(|search"
match: not_contains
---
