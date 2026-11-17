---
max_turns: 20
allowed_tools: [Agent, Read, Glob, Grep, Edit, Write, Bash]
---
Delegate this to the `bookshelf-flow:test-runner` agent. Do not edit files yourself, and do not pass a `model` parameter to the Agent tool. If that agent does not exist, do the task yourself.

Run the project's checks (tests and typecheck) and report the result.

Reply with the agent's report verbatim and nothing else.
