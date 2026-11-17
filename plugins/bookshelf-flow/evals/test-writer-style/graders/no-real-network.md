---
type: regex
target: { source: file, path: test/books-author.test.ts }
pattern: "fetch\\(|listen\\(|serve\\("
match: not_contains
---
