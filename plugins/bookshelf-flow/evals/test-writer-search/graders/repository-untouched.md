---
type: regex
target: { source: file, path: src/books/repository.ts }
pattern: "search|filter|toLowerCase"
flags: i
match: not_contains
---
