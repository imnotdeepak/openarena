# OpenArena

Send one prompt, watch up to three AI models answer at once, and vote for the best one. Real votes and real per-call numbers — time to first token, tokens per second, total tokens — build an honest leaderboard of which model is actually worth using.

## What it does

- Pick up to three models from OpenRouter's live free-tier catalog and send them the same prompt at once.
- Each model streams its own answer independently — one being slow or down never blocks the others.
- Once two or more models have answered, vote for the best one. That's one real vote, feeding a global and personal leaderboard.
- Follow-ups continue each model's own separate conversation — no model ever sees another model's answers.
- Every thread is shareable by link and viewable without an account; only sending a prompt and voting require sign-in, and only the thread's owner can do either.

## Stack

Next.js (App Router) · TypeScript · Tailwind · Prisma + Postgres · Clerk (auth) · Arcjet (rate limiting, bot detection, prompt-injection protection) · PostHog (analytics) · the Vercel AI SDK + OpenRouter.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in real values:

   ```bash
   cp .env.example .env.local
   ```

   You'll need keys for Clerk, OpenRouter, Arcjet, PostHog, and a Postgres connection string (`DATABASE_URL`).

3. Apply the database schema:

   ```bash
   npx prisma migrate dev
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command             | What it does              |
| ------------------- | ------------------------- |
| `npm run dev`       | Start the dev server      |
| `npm run build`     | Production build          |
| `npm run start`     | Run the production build  |
| `npm run lint`      | ESLint                    |
| `npm run format`    | Prettier, writes in place |
| `npm run typecheck` | `tsc --noEmit`            |

A pre-commit hook (Husky + lint-staged) runs formatting, linting, and a full typecheck automatically on every commit.
