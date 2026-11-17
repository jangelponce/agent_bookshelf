---
type: regex
target: { source: file, path: src/books/validation.ts }
pattern: "year < 0|year >= 0|negative"
match: not_contains
---
