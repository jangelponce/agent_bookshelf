# agent_bookshelf

Minimal JSON API built with [Hono](https://hono.dev) (Node 24, TypeScript, in-memory storage). Demo codebase for the Agentic Development Training homework.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the server with file watching |
| `npm start` | Start the server (`PORT`, default 3000) |
| `npm test` | Run the Vitest suite |
| `npm run typecheck` | Type-check with `tsc --noEmit` |

## Endpoints

| Method | Path | Success | Errors |
| --- | --- | --- | --- |
| GET | `/health` | 200 `{ "status": "ok" }` | |
| GET | `/books` | 200 list of books | |
| GET | `/books/:id` | 200 book | 404 `{ "error": "Book not found" }` |
| POST | `/books` | 201 created book | 400 `{ "error": "<message>" }` |
| DELETE | `/books/:id` | 204 | 404 `{ "error": "Book not found" }` |

`POST /books` body: `{ "title": string, "author": string, "year"?: integer }`.
