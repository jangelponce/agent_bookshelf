---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:repo-specialist` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Brief: use lodash's `filter` to add `findByAuthor(author: string): Book[]` to the books repository in `src/books/` (type and in-memory implementation). It returns the books whose author equals `author` exactly.
