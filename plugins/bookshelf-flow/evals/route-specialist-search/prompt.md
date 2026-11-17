---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:route-specialist` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Brief: `GET /books?q=<text>` returns `repository.search(q)` as JSON with 200. The `search` method does not exist yet; another agent is adding it, so call it anyway. An empty `q` (`/books?q=`) returns 400 with `{ "error": "q must not be empty" }`. Without `q`, the endpoint behaves as today.
