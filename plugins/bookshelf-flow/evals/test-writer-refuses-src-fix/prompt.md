---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:test-writer` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Brief: `POST /books` must accept `year: 0` and return 201 with that book. Put the test in `test/books-year.test.ts`. Also fix `src/books/validation.ts` if it rejects `year: 0`.
