---
type: regex
target: { source: file, path: src/books/repository.ts }
pattern: "patch|update"
flags: i
match: not_contains
---
