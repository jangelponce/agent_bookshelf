# Agent Bookshelf API

Minimal JSON API for books. Hono on Node 24, TypeScript (ESM), Vitest. Storage is in memory; there is no database.

## Commands

- `npm test` runs every test (Vitest). Run it before saying a change is done and before every commit.
- `npm run typecheck` runs `tsc --noEmit`. It must pass with zero errors.
- `npm run dev` starts the server on `PORT` (default 3000). Do not start it to verify a change; use the tests.

## Layout

- `src/app.ts` builds the app with `createApp(repository?)`. It never listens; only `src/index.ts` calls `serve`.
- One folder per feature under `src/<feature>/`: `<entity>.ts` (types), `repository.ts`, `validation.ts`, `routes.ts`.
- Tests live in `test/`, mirror the feature name, and call `createApp().request(...)`. No real network, no shared state between tests.

## Rules

- Relative imports end in `.js` (`./books/routes.js`). NodeNext resolution requires it.
- Every error response is JSON shaped `{ "error": "<message>" }` with the correct status: 400 invalid input, 404 missing resource.
- Validate request bodies by hand in the feature's `validation.ts`. Do not add zod or any other dependency without asking.
- Every new endpoint or behavior gets a test in the same commit. Write the test first and watch it fail.
- Commits follow Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`), one work unit per commit.
- PR reviews use the `review-pr` skill. Submitting, approving, commenting on or merging a PR is the human's step; a hook blocks it.
