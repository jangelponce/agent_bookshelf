---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write]
---
Delegate this to the `bookshelf-flow:route-specialist` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Brief: `POST /books` must reject a `year` greater than the current year with 400 and `{ "error": "year must not be in the future" }`. Implement the check in the feature's hand-written validation, computing the current year at validation time.
