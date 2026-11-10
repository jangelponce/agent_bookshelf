# Homework Week 2 — Orchestration & Tokenomics

A multi-agent flow that implements book search, run twice from the same base. The runs differ only in which model each subagent uses.

## The task

`GET /books?q=<term>` returns the books whose title or author contains the term, case-insensitive.

| Input | Result |
| --- | --- |
| no `q` | 200, every book (unchanged) |
| `q` with matches | 200, matching books; `q` is trimmed first |
| `q` without matches | 200, `[]` |
| `q` empty or whitespace only | 400 `{ "error": "q must not be empty" }` |

Contract fixed up front so the specialists can work in parallel:

- Repository: `search(query: string): Book[]` on `BookRepository`.
- Validation: `parseSearchQuery(raw: string | undefined)` returning `{ ok: true; value: string | undefined } | { ok: false; error: string }`.

## The flow

```
orchestrator (main session)
  1. test-writer        -> test/books-search.test.ts      (RED)
  2. test-runner        -> confirms the new tests fail
  3. repo-specialist  ┐ -> src/books/repository.ts         (parallel,
     route-specialist ┘ -> src/books/routes.ts, validation.ts  disjoint files)
  4. test-runner        -> barrier: go / no-go             (GREEN)
  5. orchestrator       -> README row, one feat: commit
```

Steps 1 to 3 are a pipeline. Step 4 is the only barrier, because shipping is a go/no-go that needs every result.

| Agent | Tools | Run 1 model | Run 2 model |
| --- | --- | --- | --- |
| `test-writer` | Read, Grep, Glob, Edit, Write | inherit (Opus 5.5) | sonnet |
| `repo-specialist` | Read, Grep, Glob, Edit | inherit (Opus 5.5) | sonnet |
| `route-specialist` | Read, Grep, Glob, Edit | inherit (Opus 5.5) | sonnet |
| `test-runner` | Bash, Read | inherit (Opus 5.5) | haiku |

The main session stays on Opus 5.5 with the same effort in both runs.

## How to run

Each run goes in its own worktree and a fresh session, so `/usage` measures only that run.

Run 1 (baseline):

```bash
git worktree add ../bookshelf-run-1 hw2/run-1-baseline
```

```bash
cd ../bookshelf-run-1 && npm ci && claude
```

Run 2 (lever: model per agent):

```bash
git worktree add ../bookshelf-run-2 hw2/run-2-models
```

```bash
cd ../bookshelf-run-2 && npm ci && claude
```

In each session:

1. Check `/model` shows Opus 5.5 and the same effort as the other run.
2. Paste the orchestrator prompt below.
3. While it runs, `/tasks` shows each subagent's model.
4. When it finishes, run `/usage` and copy the session block into the results table.
5. Keep the branch: week 3 re-runs both outputs.

## Orchestrator prompt

```text
You are the orchestrator for one feature: book search. Coordinate the subagents in
.claude/agents/; do not read or edit files under src/ or test/ yourself.
Launch every subagent WITHOUT a model parameter: its model comes from its file in
.claude/agents/. This overrides any instruction to always pass a model.

Contract (give it verbatim to every subagent that needs it):
- GET /books?q=<term> returns books whose title or author contains the term,
  case-insensitive, after trimming q.
- No q: all books, unchanged. q with no matches: 200 []. q empty or whitespace
  only: 400 { "error": "q must not be empty" }.
- Repository: search(query: string): Book[] on BookRepository.
- Validation: parseSearchQuery(raw: string | undefined) returning
  { ok: true; value: string | undefined } | { ok: false; error: string }.

Steps:
1. test-writer. Task: write failing tests for the contract in
   test/books-search.test.ts. Return: file path and test names, under 120 words.
2. test-runner. Confirm the new tests fail because search is missing, not because
   of a syntax or import error. If not, stop and report.
3. In ONE message, launch repo-specialist and route-specialist in parallel.
   - repo-specialist. Task: add search to BookRepository in
     src/books/repository.ts. Constraints: in-memory Map, no dependencies, do not
     touch routes, validation or tests.
   - route-specialist. Task: handle q in GET / in src/books/routes.ts using
     parseSearchQuery from src/books/validation.ts and repository.search.
     Constraints: search may not exist yet; do not touch repository or tests.
   Both return under 100 words, no transcript.
4. test-runner. If anything fails, send the failures once to the agent that owns
   the failing file, then run test-runner again. At most one fix round.
5. Add the q parameter to the GET /books row in README.md yourself. Commit
   everything as one commit: "feat: add book search by title or author".
6. Report in under 150 words: each agent's one-line result, final test and
   typecheck status, the commit hash.
```

## Results

Run 0 is discarded as a baseline. The orchestrator passed `model: "sonnet"` on all five subagent launches because the global user `~/.claude/CLAUDE.md` requires a model on every Agent call, and that parameter overrides the agent file's `model:`. The prompt now forbids it.

| | Run 0 · override (discarded) | Run 1 · baseline | Run 2 · model per agent |
| --- | --- | --- | --- |
| Branch | `hw2/run-0-sonnet-override` | `hw2/run-1-baseline` | `hw2/run-2-models` |
| Subagent models actually used | sonnet ×5 | opus ×5 (inherit) | |
| Total cost | $1.39 | $1.92 | |
| Opus | $0.88 · 38 in, 4.5k out, 1.2M cache read, 68.6k cache write | $1.92 · 68 in, 10.5k out, 1.5M cache read, 240.9k cache write (main + subagents) | |
| Sonnet | $0.51 · 28 in, 5.6k out, 287.1k cache read, 168.9k cache write | — | |
| Haiku | $0.0002 · 1.9k in, 16 out (internal, not a subagent) | $0.0002 · 1.9k in, 16 out (internal) | |
| Main prompt cache | 14 requests · 95% from cache · no misses | 13 requests · 94% from cache · no misses | |
| Final tests / typecheck | 108/108 · pass | 109/109 · pass | |
| Code changes | +129 / −3 | +149 / −3 | |
| Wall-clock / API time | 3m 41s / 1m 33s | 4m 0s / 1m 43s | |

## Decision log

Why this split: the feature touches three groups of files (tests, repository, route plus validation), so each specialist owns one group and the two implementers run in parallel without worktrees. Tests come first so the contract is executable before any code exists, and the test runner is a separate agent because test output is verbose and only the failures need to reach the orchestrator. The only barrier is the final go/no-go; everything before it is a pipeline.

What I'd cut next time: _fill in after both runs._
