# Homework Week 1 — Foundations of Agentic Development

## Objective
Deliver the week 1 homework: a project with a CLAUDE.md (<200 lines, 3+ concrete rules), one skill, and one blocking hook, plus a before/after context measurement.

## Why
Agentic Development Training Wave 3 requires it for the Tuesday office hours showcase.

## Scope
- Minimal Hono JSON API (books CRUD, in-memory) as the demo codebase.
- `review-pr` skill: GitHub PR review with verified findings, inline comments, draft (pending) review first.
- PreToolUse hook that blocks publishing commands (`gh pr review` submit/approve, `gh pr comment`, `gh pr merge`, review submit via `gh api`).
- CLAUDE.md with concrete, repo-specific rules.

## Constraints
- Node 24, TypeScript, Hono + @hono/node-server, Vitest. No database.
- CLAUDE.md under 200 lines.
- Push and PR creation are the user's decision.

## TDD
- Mode: enabled (source: global Claude config "Strict TDD Mode: enabled").
- Runner: `npm test` (Vitest).

## Tasks
- [ ] T1 Scaffold Hono books API with Vitest tests — route: delegated (writer trigger: 2+ non-trivial files)
- [ ] T2 `review-pr` skill — route: inline (single file)
- [ ] T3 Publish-blocking hook + settings + hook test — route: delegated (writer trigger: 2+ files)
- [ ] T4 CLAUDE.md — route: inline (single file)
- [ ] T5 Context measurement before/after (user runs `/context`) — route: user
- [ ] T6 Demo PR with planted issues to review — route: pending user decision on push

## Acceptance criteria
- `npm test` passes.
- Hook blocks a publish command with exit code 2 and allows read-only `gh` commands.
- CLAUDE.md shows in `/context` memory files.

## Progress
- Feature document created.

## Next step
T1.
