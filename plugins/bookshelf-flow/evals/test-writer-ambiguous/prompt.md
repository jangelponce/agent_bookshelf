---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:test-writer` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Brief: write tests for pagination on `GET /books`. No parameter names, defaults or limits are specified. Put the tests in `test/books-pagination.test.ts`.
