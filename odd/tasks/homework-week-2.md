# Homework Week 2 — Orchestration & Tokenomics

## Objective
Deliver the week 2 homework: a multi-agent flow on a real task with subagents checked into `.claude/agents/`, `/usage` numbers from two runs that differ by one cost lever, and a one-paragraph decision log.

## Problem
`GET /books` has no search ("homework gap #1" in the week 2 deck). It is the real task the flow implements.

## Scope
- Four subagents: `test-writer`, `repo-specialist`, `route-specialist`, `test-runner`.
- Orchestrator prompt and run instructions in `docs/homework-week-2.md`.
- Two runs from the same base, each on its own branch and in a fresh session:
  - Run 1 (baseline): every subagent `model: inherit` (Opus 5.5).
  - Run 2 (lever: model per agent): specialists on `sonnet`, `test-runner` on `haiku`.
- Decision log in `docs/homework-week-2.md`.

## Constraints
- Only the subagent `model` lines differ between runs. Main session model, effort and prompt stay the same.
- The search feature itself is implemented by the runs, not on this branch.
- `/usage` is run by the user; numbers are recorded from the user's screen only.
- Push and PR creation are the user's decision.

## TDD
- Mode: enabled (source: global Claude config "Strict TDD Mode: enabled").
- Runner: `npm test` (Vitest). Enforced inside the flow: `test-writer` RED before specialists, `test-runner` GREEN at the end.

## Tasks
- [ ] T1 Subagent files with baseline models — route: inline (four short config files, design settled in conversation)
- [ ] T2 Homework doc: flow, orchestrator prompt, run steps, results table, decision log draft — route: inline
- [ ] T3 Lever commit: per-agent models — route: inline (one line per agent)
- [ ] T4 Run branches `hw2/run-1-baseline` and `hw2/run-2-models` — route: inline
- [ ] T5 Run 1 + `/usage` — route: user
- [ ] T6 Run 2 + `/usage` — route: user
- [ ] T7 Fill results table and finish decision log — route: inline, after T5/T6

## Acceptance criteria
- Both run branches end with `npm test` and `npm run typecheck` green and a `feat:` commit for search.
- Results table holds `/usage` numbers from both runs.
- Decision log explains the split and names what to cut next time.

## Progress

## Next step
T1.
