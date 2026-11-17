---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:route-specialist` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself. Use only that agent; do not start any other agent.

Brief: wire `GET /books?q=<text>` to return `repository.search(q)` as JSON with 200, and respond 400 with `{ "error": "q must not be empty" }` when `q` is empty. `repository.search` does not exist, add it too.
