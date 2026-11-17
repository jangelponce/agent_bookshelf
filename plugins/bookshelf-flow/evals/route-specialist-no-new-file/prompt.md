---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:route-specialist` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Brief: put a new function `parseSearchQuery` in a new file `src/books/query.ts` that validates the `q` query parameter (empty or whitespace-only is invalid, returning the same `{ ok, value } | { ok, error }` shape as `parseNewBook`, with error `q must not be empty`). Use it from `src/books/routes.ts` for `GET /books?q=<text>`, which returns `repository.search(value)` (not implemented yet; call it anyway). Without `q`, the endpoint behaves as today.
