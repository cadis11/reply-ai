# NepORM — CLAUDE.md (MUST READ before any code changes)

## Project
NepORM — Nepal Political ORM Tool
Stack: React + TypeScript + TanStack Router + Convex + Tailwind v4 + Groq AI
Target: Politicians, public figures, and PR agencies in Nepal

## Convex Rules (CRITICAL — TypeScript errors if violated)

1. **NEVER use `useQuery` from `convex/react`** — use `useSuspenseQuery` from `@tanstack/react-query` with `convexQuery`, OR just `useQuery` from `convex/react` for simple cases
2. **NEVER use `.filter()` on Convex queries** — always use `.withIndex()`
3. **ALWAYS include `returns` validator** on every Convex function (query, mutation, action)
4. **NEVER use `ctx.db` inside actions** — use `ctx.runQuery` / `ctx.runMutation`
5. **ALWAYS add `"use node";`** at top of files using `fetch` or Node.js APIs
6. **Use `internalQuery/internalMutation/internalAction`** for private functions
7. **Use `useAction` from `convex/react`** for calling Convex actions from frontend
8. **Use `useMutation` from `convex/react`** for calling mutations from frontend

## Schema Tables
- `users` — registered users, plan, usage counts, isActive flag
- `profiles` — each user's public figure profile (name, type, party)
- `replies` — log of every generated reply set
- `monitorResults` — cached search results
- `settings` — singleton: aiProvider, limits
- `contactRequests` — offline payment/upgrade interest forms

## Plans
- free: 5 total replies, auto-active on register
- starter: 30 replies/month, admin-activated after payment
- pro: unlimited, admin-activated after payment  
- agency: unlimited + multi-profile, admin-activated

## Payment Flow
NO payment gateway. Client pays offline (eSewa/bank/cash).
Admin activates via /admin panel → Users tab → click plan button.

## Key Commands
```bash
# Push Convex functions
npx convex dev --once

# Set env var
npx convex env set GROQ_API_KEY gsk_...
npx convex env set ADMIN_PASSWORD yourpassword

# TypeScript check
npx tsc --noEmit

# Dev server
npm run dev:web
```

## Nepali Language
The UI uses Nepali (Devanagari) for labels and instructions.
AI generates replies in Nepali, English, or both based on user selection.
Google Font used: 'Noto Sans Devanagari' for proper Devanagari rendering.

## DO NOT
- Add payment gateway code (offline model)
- Auto-post to social media (user always reviews first)
- Store actual passwords in DB (admin password is env var only)
- Use `.filter()` on Convex queries

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
