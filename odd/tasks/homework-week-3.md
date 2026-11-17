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
- [x] T1 Plugin skeleton, baseline agents, scaffold script, one calibration case — route: inline (few mechanical files) — commit f67d691
- [x] T2 Calibration run: verify scaffold, subagent dispatch, agent `model:` honored, Bash grant, trace contents, cost per run — route: inline
- [x] T3 Remaining cases to reach 20+, both directions — route: delegated writer (23 case dirs, writer trigger) — commit 82cceb1. 24 cases: 15 should-act, 9 should-not. Route-based graders (tool_used on Bash/Edit/Write inside the subagent) replaced with trace regex or dropped in favor of file-content checks. Fixture verified: clean 20/20 + typecheck pass; failing-test.patch 1 failed; type-error.patch typecheck fail.
- [x] T4 Baseline full run (with + without arms) — route: inline — $14.15 + $2.91 re-run of 5 fixed cases; with 0.995 (71/72), without 0.769
- [x] T5 Lever commit (per-agent models) and lever run (with arm) — route: inline — commit aa22b10; $5.36; 0.990 (69/72), cost/run $0.109 → $0.075
- [x] T6 Results table, Δ reading and decision in `docs/homework-week-3.md` — route: inline — decision: ship; route-specialist scope-conflict regression (no-new-file 3/3 → 1/3) is the promotion candidate
- [ ] T7 (optional) Promote a repeated correction to a rule, skill or hook, with diff

## Acceptance criteria
- `claude plugin eval` loads the suite with 20+ cases, each with at least one deterministic grader where possible.
- Both configs ran on the same suite with pinned models; pass rate and cost per run recorded from `aggregate-result.json`.
- Decision states ship or keep, and notes interval width at this sample size.

## Progress
- Calibration (test-writer-search, 1 run per arm, main `claude-sonnet-5-5`, judge `claude-haiku-5-5`): both arms 1.0, Δ 0; with $0.133 (24 s), without $0.088 (23 s).
- Verified in the trace: the subagent ran on `claude-opus-5-5` (frontmatter `model:` is honored), the main session on Sonnet, no `model` parameter on the Agent call. The trace's result line has `modelUsage` with cost per model.
- `scaffold_script` must live inside the case dir (no `..`), so each case has a 2-line `fixture.sh` wrapper calling `_shared/fixture.sh`.
- Blocker: granting `Bash` fails because `~/.ssh` contains a symlink the eval sandbox cannot exclude. Affects only test-runner cases. Needs the user's decision.
- Receipt-driven review: off (global), no review ceremony.
- `~/.ssh` blocker resolved by the user (removed the alias symlink). Bash-granted runs then failed on `vitest: command not found`: the eval sandbox cannot follow a `node_modules` symlink out of the workspace, so the fixture now clones `node_modules` (`cp -Rc`, ~2 s) — commit baa2eb5.
- Rigid grader found on the first test-runner run: the orchestrator paraphrased the agent's `tests: 20/20` line, so test-runner prompts now ask to relay the report verbatim.
- Baseline full run (agents on Opus, 24 cases × 3 runs × 2 arms, -j 4): $14.15, 0 errors. With 0.889 mean score / without 0.794, Δ +0.094.
- Transcript review of the negative-Δ and low cases found 5 case bugs, not agent bugs (commit 2d311d8): orchestrator started other specialists (`route-specialist-no-repo`, `repo-specialist-no-routes`); brief contradicted the agent contract (`route-specialist-new-file-imports` → renamed `route-specialist-no-new-file`, now should-not); grader pinned the 400 message to routes.ts while CLAUDE.md puts validation in validation.ts (`route-specialist-search`); ambiguous "start the flow" ran the whole flow (`auto-picks-test-writer`). These 5 are re-run on the baseline; the other 19 keep their baseline results.

## Next step
T1.
