---
type: regex
target: { source: file, path: src/books/routes.ts }
pattern: "from ['\"]\\.{1,2}/[^'\"]*(?<!\\.js)['\"]"
match: not_contains
---
