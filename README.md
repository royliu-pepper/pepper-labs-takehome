# Catalog Manager — Full-Stack Engineer Take-Home

A food service supply catalog management app. The backend is a Node/Express API backed by SQLite; the frontend is React + Tailwind served by Vite.

Some features are already working so you can explore the app. Your job is to finish the parts that are incomplete and fix a couple of bugs along the way.

---

## Quick Start

**Prerequisites:** Node.js 18+ and npm.

```bash
# 1. Clone the repo
git clone <REPO_URL> && cd catalog-manager-takehome

# 2. Install everything (root + backend + frontend)
npm install

# 3. Start both servers
npm run dev
```

| Service  | URL                        |
| -------- | -------------------------- |
| Frontend | http://localhost:5173      |
| Backend  | http://localhost:3001      |
| Health   | http://localhost:3001/health |

> If you ever need a fresh database, run `npm run db:reset`.
> To inspect the database directly, run `npm run db:console` (opens the SQLite CLI).

---

## Project Structure

```
├── frontend/          React + Tailwind (Vite)
│   └── src/
│       ├── pages/     Page-level components
│       ├── components/Shared UI components
│       ├── lib/       API helpers & utilities
│       └── types.ts   TypeScript interfaces
├── backend/           Express + TypeScript API
│   └── src/
│       ├── routes/    Route handlers
│       ├── app.ts     Express app setup
│       ├── db.ts      SQLite connection
│       └── seed.ts    Seed script
├── backend/dev.db     SQLite database (committed with seed data)
└── package.json       Root scripts (dev, test, db:reset, db:console)
```

---

## Available Scripts

| Command             | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start backend + frontend concurrently          |
| `npm test`          | Run backend tests (task tests will fail until you implement them) |
| `npm run db:reset`  | Drop & re-seed the database                    |
| `npm run db:console`| Open SQLite CLI on `dev.db`                    |

---

## Database

The app uses a **SQLite** database (`backend/dev.db`) committed to the repo with realistic seed data.

No schema diagram is provided — you can inspect the database yourself:

```bash
npm run db:console

# then inside SQLite:
.tables
.schema products
SELECT * FROM products LIMIT 5;
```

---

## Tasks

Complete the following tasks. Each one touches both frontend and backend.

### Task 1 — Create Product (end-to-end)

Build the "Create Product" form at `/products/new` and implement the `POST /api/products` backend route. A new product must include at least one variant (SKU).

### Task 2 — Update Variant (end-to-end)

Wire up the "Edit" button on the product detail page to allow updating a variant's **price** and **inventory count**. Implement the `PUT /api/variants/:id` backend route.

### Task 3 — Fix the soft-delete bug

Soft-deleted products (those with a non-null `deleted_at` column) currently appear in the product list. Fix this so they are excluded.

### Task 4 — Loading & error states

The products page has no loading spinner or error message. Add appropriate UX states so users know when data is loading or when something went wrong.

### Task 5 — Input validation

Add validation for product/variant creation and updates:
- Product **name** is required.
- Variant **SKU** is required and must be unique.
- **Price** must be ≥ 0.
- **Inventory count** must be ≥ 0.

Validate on both the client and server side.

---

## Bonus Tasks

These are smaller issues we've noticed in the codebase. Fix them if you have time!

### Bonus A — Double-submit on Delete

The "Delete" button on the product detail page doesn't disable while the delete request is in flight. If a user clicks rapidly, multiple DELETE requests are sent. Add protection against this.

### Bonus B — Inconsistent error responses

The backend error responses are inconsistent — some routes return JSON (`{ "error": "..." }`) while others return plain text. Standardize all error responses to use a consistent format.

---

## Tests

A test suite is included in `backend/__tests__/tasks.test.ts`. It covers Tasks 1, 2, 3, and 5.

Out-of-the-box, only the health check passes — the task tests **fail until you implement them**. Use `npm test` to check your progress:

```bash
npm test
```

> Task 4 (loading/error states) is frontend-only and verified visually, not by automated tests.

---

## Submission

1. Create a **private** fork or copy of this repo.
2. Commit your work with clear, incremental commits (one per task is fine).
3. Fill out **SUBMISSION.md** with a short write-up of your approach.
4. Share the repo link with us (add the reviewer(s) as collaborators).

---

## Time Guidance

We recommend spending **3–4 hours** total. Focus on quality over quantity — it's fine to leave a task partially done if you run out of time, as long as you explain your thinking in SUBMISSION.md.

Good luck!
