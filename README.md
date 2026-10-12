# Mini Ticket Tracker

A small support-ticket tracker: an Express REST API backed by PostgreSQL, and a Next.js UI for creating tickets, filtering them by status, and moving them through `open → in_progress → closed`.

| Layer    | Stack                                                                |
| -------- | -------------------------------------------------------------------- |
| API      | Node.js, Express 5, TypeScript, Zod                                  |
| Database | PostgreSQL ([Neon](https://neon.tech)), Prisma 7 with the `pg` adapter |
| UI       | Next.js 16 (App Router), React 19, Tailwind CSS 4                    |
| Tests    | Vitest + Supertest, against a real Postgres database                 |

```
client/                 Next.js app
  src/app/              page, error boundary
  src/components/       ticket list, filters, pagination, form, status select
  src/lib/              typed API client and shared types
server/                 Express API
  prisma/               schema and migrations
  src/routes/           ticket endpoints
  src/schemas/          request validation (Zod)
  src/middleware/       404 and error handling
  tests/                API integration tests
```

## Setup

**Prerequisites:** Node.js 20.19+, 22.12+ or 24+, and a PostgreSQL database. A free Neon project works, and so does a local Postgres.

### 1. API

```bash
cd server
npm install                 # also generates the Prisma client
cp .env.example .env        # then fill in the values below
npm run db:deploy           # applies migrations
npm run dev                 # http://localhost:4000
```

| Variable            | Purpose                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`      | Connection the API uses at runtime (Neon: the **pooled** string)         |
| `DIRECT_URL`        | Connection Prisma migrations use (Neon: the **direct**, unpooled string) |
| `CLIENT_ORIGIN`     | Origin allowed by CORS, default `http://localhost:3000`                  |
| `TEST_DATABASE_URL` | Separate database for the test suite (see [Tests](#tests))               |
| `PORT`              | API port, default `4000`                                                 |

With a local Postgres, `DATABASE_URL` and `DIRECT_URL` can be the same URL, without the `sslmode` parameter.

### 2. UI

In a second terminal:

```bash
cd client
npm install
cp .env.example .env.local  # NEXT_PUBLIC_API_URL, default http://localhost:4000
npm run dev                 # http://localhost:3000
```

### Running a production build

`npm start` serves compiled output, so build first:

```bash
cd server
npm run build               # compiles TypeScript to dist/
npm start                   # http://localhost:4000

cd client
npm run build
npm start                   # http://localhost:3000
```

Rebuild the API after any server code change, or `npm start` keeps serving the old `dist/`. `NEXT_PUBLIC_API_URL` is baked into the client at build time, so set it in `client/.env.local` before running `npm run build`.

### Tests

The integration tests call the real API against a real database, and they **empty the `tickets` table before each test**. They therefore run against `TEST_DATABASE_URL` and refuse to start if it's missing or equal to `DATABASE_URL`.

1. Create a test database. On Neon, create a branch from `main` after running the migrations; the branch starts with the schema already applied. For any other database, apply the migrations using its direct URL:

   ```bash
   DIRECT_URL="<test database url>" npm run db:deploy          # bash
   $env:DIRECT_URL="<test database url>"; npm run db:deploy    # PowerShell
   ```

2. Set `TEST_DATABASE_URL` in `server/.env`, then run:

   ```bash
   cd server
   npm test
   ```

21 tests cover all four endpoints: creation and defaults, validation errors, filtering, pagination and ordering, updates and 404s, and stats including zero counts.

## API

All endpoints accept and return JSON. Validation errors return `400` in one shape:

```json
{ "error": "Validation failed", "details": [{ "field": "title", "message": "Title is required" }] }
```

| Method  | Path             | Description                                                              |
| ------- | ---------------- | ------------------------------------------------------------------------ |
| `POST`  | `/tickets`       | Create a ticket. Body: `title` (required), `description`, `priority`. Returns `201`. |
| `GET`   | `/tickets`       | List tickets, newest first. Query: `status`, `page` (default 1), `limit` (default 10, max 100). |
| `PATCH` | `/tickets/:id`   | Update `status` and/or `priority`. Returns `404` if the ticket doesn't exist. |
| `GET`   | `/tickets/stats` | Ticket counts grouped by status.                                         |

```bash
curl -X POST localhost:4000/tickets -H "Content-Type: application/json" \
  -d '{"title": "Cannot log in", "priority": "high"}'

curl "localhost:4000/tickets?status=open&page=1&limit=10"
# { "data": [ ...tickets ], "meta": { "page": 1, "limit": 10, "total": 12, "totalPages": 2 } }

curl -X PATCH localhost:4000/tickets/1 -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'

curl localhost:4000/tickets/stats
# { "byStatus": { "open": 9, "in_progress": 2, "closed": 1 }, "total": 12 }
```

## Decisions & Tradeoffs

I split the app into an Express API and a separate Next.js client so the REST contract stands on its own and can be tested without the UI, but I kept both in one repository with no monorepo tooling, Docker or deployment setup, since the brief values judgement over infrastructure. Validation happens at the API edge with Zod, and the status and priority values come from the Prisma schema so the API can't drift from the database; the client mirrors those types by hand, which is a shortcut I'd replace with an OpenAPI spec and generated client types. The list uses offset pagination with a total count because it's simple and fine at this size; with more time I'd switch to cursor pagination on `(created_at, id)`, which stays fast on large tables and doesn't skip or repeat rows when tickets are added between page loads. The page and the count run as two parallel queries rather than in a transaction, because a suspended Neon database takes longer to wake than Prisma's two-second transaction start limit; the cost is that `total` can be off by one if a ticket is created between the two queries. In the UI, the filter and page live in the URL so views can be bookmarked, a Server Component fetches the list, and the form and status dropdowns call the API directly and then refresh the page instead of using a client-side cache library. There's no Next.js `proxy.ts`, because without authentication there's nothing to intercept. The API tests run against a real Postgres branch rather than mocks, so they exercise the actual queries; the UI has no automated tests, and Playwright tests for creating a ticket and changing its status would be my next addition. I deliberately left out authentication, rate limiting, CI, and editing or deleting tickets. I also didn't add a cache such as Redis: every query here is a single indexed lookup, and a cache would need invalidating on every write for no measurable gain, but if read traffic grew, the stats endpoint would be the first candidate, cached in Redis and cleared whenever a ticket is created or its status changes. With more time I'd add authentication with per-team access, run the tests in CI against a short-lived Neon branch, and add structured request logging.

### Assumptions

- New tickets always start as `open`; `POST /tickets` rejects a `status` field, and status changes go through `PATCH`.
- `PATCH /tickets/:id` accepts only `status` and `priority`, as the brief specifies; other fields such as `title` are rejected with `400`.
- `priority` defaults to `medium`. Titles are trimmed and limited to 200 characters, and descriptions to 5,000 characters; an empty description is stored as `null`.
- Ids are auto-incrementing integers, which are easier to read in the UI (`#12`) than UUIDs.
- `GET /tickets` returns an empty `data` array, not an error, for a page past the end. Unknown query values (e.g. `status=urgent`) return `400`; the UI ignores invalid values in its own URL and falls back to defaults.
- `GET /tickets/stats` always includes every status, with `0` for statuses that have no tickets, plus a `total`.
- The app is an internal tool for one support team, so there are no users or permissions.
