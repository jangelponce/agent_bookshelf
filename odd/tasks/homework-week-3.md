# Homework Week 3 — Memory & Evals

## Objective
Deliver the week 3 homework: an eval set of 20+ cases in both directions for the week 2 subagents, and a re-run of the week 2 change (per-agent models) on that same suite, reporting pass rate and cost per run.

## Problem
Week 2 cut cost by 39% by moving subagents from Opus to Sonnet/Haiku, but quality was judged only by "tests went green once". There is no evidence that quality held.

## Scope
- Local plugin `plugins/bookshelf-flow/` holding the four week 2 subagents (copied from `claude/orchestration-tokenomics-homework-ae2f4d`), with an eval suite under its `evals/`.
- Cases per agent, both directions: where the agent should act and where it must not (scope boundaries, no fixing, no production code, ambiguous briefs).
- Fixture: each run gets a copy of this repo's `src/`, `test/`, config and `node_modules` via a scaffold script.
- Two configs on the same suite, same main model, same judge, same Claude Code version:
  - Baseline: every agent `model: opus` (week 2 run 1 had `inherit` under an Opus session; explicit `opus` keeps that while the main session is pinned to Sonnet).
  - Lever: `test-writer`, `repo-specialist`, `route-specialist` on `sonnet`, `test-runner` on `haiku` (week 2 commit 18544ba).
- Results and decision in `docs/homework-week-3.md`.

## Constraints
- Only agent `model:` lines differ between configs.
- `--model` and `--judge-model` pinned; `--no-publish` unless the user asks to publish.
- Full-suite runs cost real money: calibrate on one case, then confirm the estimate with the user before running everything.
- Optional promotion (item 3) only if time allows.

## TDD
- Mode: enabled (source: global Claude config "Strict TDD Mode: enabled"). Runner: `npm test`.
- This feature adds no production code; the eval cases are the tests. RED/GREEN applies to graders: a grader is checked against a known-bad outcome (without arm or a deliberately wrong run) before it is trusted.

## Tasks
- [ ] T1 Plugin skeleton, baseline agents, scaffold script, one calibration case — route: inline (few mechanical files)
- [ ] T2 Calibration run: verify scaffold, subagent dispatch, agent `model:` honored, Bash grant, trace contents, cost per run — route: inline
- [ ] T3 Remaining cases to reach 20+, both directions — route: TBD after T2
- [ ] T4 Baseline full run (with + without arms) — route: inline, after user confirms cost
- [ ] T5 Lever commit (per-agent models) and lever run (with arm) — route: inline
- [ ] T6 Results table, Δ reading and decision in `docs/homework-week-3.md` — route: inline
- [ ] T7 (optional) Promote a repeated correction to a rule, skill or hook, with diff

## Acceptance criteria
- `claude plugin eval` loads the suite with 20+ cases, each with at least one deterministic grader where possible.
- Both configs ran on the same suite with pinned models; pass rate and cost per run recorded from `aggregate-result.json`.
- Decision states ship or keep, and notes interval width at this sample size.

## Progress

## Next step
T1.
