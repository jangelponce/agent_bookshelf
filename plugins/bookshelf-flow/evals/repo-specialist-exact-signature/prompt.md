---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:repo-specialist` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Brief: add exactly `countByAuthor(author: string): number` to the `BookRepository` type and the in-memory implementation in `src/books/`. It returns how many books have that author (exact match).
