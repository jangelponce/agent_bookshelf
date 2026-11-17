---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:test-writer` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Brief: `GET /books?q=<text>` must return only the books whose title or author contains `<text>`, case-insensitively. An empty `q` (`/books?q=`) returns 400 with `{ "error": "q must not be empty" }`. Without `q`, the endpoint behaves as today. Put the tests in `test/books-search.test.ts`.
