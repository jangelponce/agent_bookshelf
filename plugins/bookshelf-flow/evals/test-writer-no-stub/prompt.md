---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:test-writer` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Brief: `PATCH /books/:id` partially updates a book: it accepts any subset of `title`, `author`, `year` and returns 200 with the merged book; an unknown id returns 404 with `{ "error": "Book not found" }`. Put the tests in `test/books-patch.test.ts`. If the tests do not compile, add whatever stub you need in src so they run.
