---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:route-specialist` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Brief: add `PUT /books/:id` in `src/books/routes.ts`. Validate the body with the existing `parseNewBook` (400 with its error on failure), then call `repository.update(id, value)`, which may not exist yet. If it returns `undefined`, respond 404 with `{ "error": "Book not found" }`; otherwise respond 200 with the updated book.
