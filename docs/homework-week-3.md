# Homework Week 3 — Memory & Evals

Week 2 cut the cost of the book-search flow by 39% by moving its subagents from Opus to Sonnet/Haiku, and judged quality by "the tests went green once". This week puts an eval suite under those subagents and re-runs the change on it.

## The suite

`plugins/bookshelf-flow/` packages the four week 2 subagents (`test-writer`, `repo-specialist`, `route-specialist`, `test-runner`) as a local plugin, with 24 cases under `evals/` for `claude plugin eval`.

- **Both directions:** 14 cases where an agent should act, 10 where it must not (stay out of another agent's files, refuse a dependency, report without fixing, no edits for a read-only question).
- **Grade the outcome:** most graders are regex checks on the final files (the right file changed, the files outside the agent's scope untouched). An LLM judge (Haiku, majority of 3) grades only the short final reply. `tool_used: Agent` graders are `with-only` indicators, not part of the score.
- **Fixture:** each case's `fixture.sh` calls `_shared/fixture.sh`, which copies `src/`, `test/`, config and `node_modules` into the empty workspace and commits it. Two cases apply a patch (a failing test, a type error).

Run it from the plugin directory:

```bash
claude plugin eval . --trust-plugin --scaffold --runs 3 -j 4 \
  --model claude-sonnet-5-5 --judge-model claude-haiku-5-5 --no-publish \
  --allow-tools Write Edit "Bash(npm test*)" "Bash(npm run typecheck*)"
```

## Re-running the week 2 change

| | Opus agents (baseline) | Sonnet/Haiku agents (week 2 lever) | No plugin |
|---|---|---|---|
| Mean score | 0.995 | 0.990 | 0.769 |
| Runs passing every grader | 71/72 (98.6% ± 2.7) | 69/72 (95.8% ± 4.6) | 39/72 |
| Cases at threshold 1.0 | 23/24 | 22/24 | — |
| Cost per run | $0.109 | $0.075 (−32%) | $0.077 |
| Subagent cost, 72 runs | $3.60 (Opus) | ≈ $1.11 (−69%, estimate) | — |

Pinned in both configs: main session `claude-sonnet-5-5`, judge `claude-haiku-5-5`, Claude Code 2.1.325, same 24 cases, 3 runs each. Only the four `model:` lines differ (commit `aa22b10`). Intervals are the normal approximation at n = 72. The subagent estimate assumes the main session cost the same in both runs, since `modelUsage` reports Sonnet main and Sonnet subagents together.

The traces confirm the lever: subagents ran on `claude-opus-5-5` in the baseline and on `claude-sonnet-5-5` / `claude-haiku-5-5` after the change, and the orchestrator never passed a `model` parameter.

## Per case

| Case | Direction | Opus agents | No plugin | Δ | Sonnet/Haiku agents | Cost/run Opus | Cost/run Sonnet/Haiku |
|---|---|---|---|---|---|---|---|
| auto-picks-test-writer | should-act | 1.00 | 0.50 | +0.50 | 1.00 | $0.110 | $0.086 |
| no-agent-explain | should-not | 1.00 | 1.00 | +0.00 | 1.00 | $0.064 | $0.060 |
| repo-specialist-exact-signature | should-act | 1.00 | 1.00 | +0.00 | 1.00 | $0.089 | $0.072 |
| repo-specialist-no-deps | should-not | 0.89 | 0.67 | +0.22 | 0.92 | $0.100 | $0.080 |
| repo-specialist-no-routes | should-not | 1.00 | 0.33 | +0.67 | 1.00 | $0.101 | $0.075 |
| repo-specialist-search | should-act | 1.00 | 1.00 | +0.00 | 1.00 | $0.088 | $0.069 |
| repo-specialist-update | should-act | 1.00 | 1.00 | +0.00 | 1.00 | $0.092 | $0.072 |
| route-specialist-no-new-file | should-not | 1.00 | 0.40 | +0.60 | 0.83 | $0.135 | $0.087 |
| route-specialist-no-repo | should-not | 1.00 | 0.50 | +0.50 | 1.00 | $0.123 | $0.087 |
| route-specialist-no-zod | should-not | 1.00 | 0.60 | +0.40 | 1.00 | $0.127 | $0.087 |
| route-specialist-search | should-act | 1.00 | 1.00 | +0.00 | 1.00 | $0.107 | $0.080 |
| route-specialist-update | should-act | 1.00 | 0.80 | +0.20 | 1.00 | $0.097 | $0.077 |
| route-specialist-year-range | should-act | 1.00 | 1.00 | +0.00 | 1.00 | $0.090 | $0.071 |
| test-runner-asked-to-fix | should-not | 1.00 | 0.33 | +0.67 | 1.00 | $0.098 | $0.050 |
| test-runner-concise | should-act | 1.00 | 0.33 | +0.67 | 1.00 | $0.086 | $0.050 |
| test-runner-green | should-act | 1.00 | 0.33 | +0.67 | 1.00 | $0.090 | $0.049 |
| test-runner-red-no-fix | should-not | 1.00 | 1.00 | +0.00 | 1.00 | $0.091 | $0.049 |
| test-runner-typecheck-fail | should-act | 1.00 | 0.67 | +0.33 | 1.00 | $0.093 | $0.050 |
| test-writer-ambiguous | should-act | 1.00 | 1.00 | +0.00 | 1.00 | $0.189 | $0.116 |
| test-writer-no-stub | should-not | 1.00 | 1.00 | +0.00 | 1.00 | $0.126 | $0.087 |
| test-writer-refuses-src-fix | should-not | 1.00 | 1.00 | +0.00 | 1.00 | $0.110 | $0.081 |
| test-writer-search | should-act | 1.00 | 1.00 | +0.00 | 1.00 | $0.135 | $0.087 |
| test-writer-style | should-act | 1.00 | 1.00 | +0.00 | 1.00 | $0.139 | $0.083 |
| test-writer-update | should-act | 1.00 | 1.00 | +0.00 | 1.00 | $0.139 | $0.082 |

## Reading Δ

- **The plugin earns its keep on boundaries.** Most of the positive Δ is on should-not cases and on `test-runner`'s report format: without the agents, Sonnet edits routes when asked for a repository change, fixes failing tests it was asked only to run, and adds files outside the requested scope.
- **1.0 with and without:** all six `test-writer` cases and the simple repository/route additions. Sonnet writes these tests just as well without the agent, so these cases guard against regressions but do not show the agent's value. Harder `test-writer` cases are the next thing to add.

## What the transcripts changed

The first baseline run scored 0.889 with three negative-Δ cases. Reading the transcripts showed five case bugs, not agent bugs (commit `2d311d8`):

- **Orchestrator, not agent:** in `route-specialist-no-repo` and `repo-specialist-no-routes` the specialist stayed in scope, then the main session started the other specialist itself. The prompts now say to use only the named agent.
- **Brief contradicted the contract:** `route-specialist-new-file-imports` asked for a new `query.ts`, which the agent's file scope forbids. It became `route-specialist-no-new-file`, a should-not case.
- **Rigid grader:** `route-specialist-search` required the 400 message in `routes.ts`; the agent correctly put validation in `validation.ts`, as CLAUDE.md says. The brief now names the file.
- **Ambiguous task:** "start the flow with the right step" made the orchestrator run the whole flow in `auto-picks-test-writer`. It now says to stop after the first step.

Earlier, two setup bugs had failed every run: the sandbox cannot follow a `node_modules` symlink out of the workspace, and the orchestrator paraphrased `tests: 20/20` so a `last_message` regex missed it. Those five cases were re-run on the baseline. The other 19 kept their first-run results.

## Decision

**Ship the week 2 change.** It cuts the cost per run by 32% (subagents by about 69%), and overall quality is within noise: 98.6% ± 2.7 against 95.8% ± 4.6 overlap, so 72 runs show no evidence of a difference.

One case shows a pattern worth acting on before calling it done. In `route-specialist-no-new-file`, Opus resolved the brief/scope conflict by putting the parser in `validation.ts` (3/3). Sonnet twice imported from a `./query.js` it did not create, leaving the code broken. Three runs are too few to prove it, but the failure is concrete. It is the candidate for a promoted rule in `route-specialist` (item 3).

The other failure, `repo-specialist-no-deps`, failed once in each config (1/3 in both): the agent stopped and asked instead of using native `filter`. That is not a regression.

## Cost of the homework

About $23 in total: calibration ≈ $0.60, baseline $14.15 plus $2.91 for the five fixed cases, and the lever run $5.36.
