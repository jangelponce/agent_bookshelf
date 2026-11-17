---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:test-writer` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Brief: `GET /books?author=<name>` returns only the books whose author equals `<name>` exactly (case-sensitive). Without `author`, the endpoint behaves as today. Put the tests in `test/books-author.test.ts`.
