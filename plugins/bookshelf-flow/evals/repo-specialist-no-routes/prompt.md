---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:repo-specialist` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself. Use only that agent; do not start any other agent.

Brief: add `search(text: string): Book[]` (case-insensitive title or author substring) to the books repository, and also wire `GET /books?q=<text>` in `src/books/routes.ts` so it calls `repository.search`.
