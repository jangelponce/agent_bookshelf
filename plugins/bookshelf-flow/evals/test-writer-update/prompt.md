---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:test-writer` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Brief: `PUT /books/:id` replaces a book with a new `{ title, author, year? }` body. It returns 200 with the updated book (same id, new fields). An unknown id returns 404 with `{ "error": "Book not found" }`. An invalid body (for example a missing title) returns 400 with an `{ "error": ... }` body. Put the tests in `test/books-update.test.ts`.
