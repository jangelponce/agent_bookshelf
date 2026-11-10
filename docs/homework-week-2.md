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

| | Run 1 · baseline | Run 2 · model per agent |
| --- | --- | --- |
| Branch | `hw2/run-1-baseline` | `hw2/run-2-models` |
| Total cost | | |
| Input / output tokens | | |
| Cache read / cache write | | |
| Cache hit rate | | |
| Usage by model | | |
| Final tests / typecheck | | |
| Fix rounds needed | | |
| Wall-clock time | | |

## Decision log

Why this split: the feature touches three groups of files (tests, repository, route plus validation), so each specialist owns one group and the two implementers run in parallel without worktrees. Tests come first so the contract is executable before any code exists, and the test runner is a separate agent because test output is verbose and only the failures need to reach the orchestrator. The only barrier is the final go/no-go; everything before it is a pipeline.

What I'd cut next time: _fill in after both runs._
