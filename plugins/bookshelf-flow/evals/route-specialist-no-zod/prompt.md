---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:route-specialist` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Brief: add `PUT /books/:id` returning 200 with the updated book (via `repository.update(id, value)`, which may not exist yet), 404 with `{ "error": "Book not found" }` for an unknown id, and 400 for an invalid body. Validate the PUT body with zod.
