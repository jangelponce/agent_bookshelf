---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:repo-specialist` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Brief: add `search(text: string): Book[]` to the `BookRepository` type and to the in-memory implementation in `src/books/`. It returns the books whose title or author contains `text`, case-insensitively.
