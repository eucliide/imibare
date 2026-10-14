# Contributing Guide

## Naming Conventions

### Files
- **React components**: `kebab-case.tsx` (e.g., `trade-card.tsx`, `metric-card.tsx`)
- **Server actions**: `actions.ts` inside a route folder
- **Client components**: `*-client.tsx` when paired with a page
- **Utilities**: `kebab-case.ts` (e.g., `risk-metrics.ts`, `analytics.ts`)

### Functions and Variables
- **React components**: `PascalCase`
- **Functions and hooks**: `camelCase` (hooks start with `use`)
- **Server actions**: `camelCase` verbs (e.g., `createExpense`, `updateTrade`, `bulkDeleteTrades`)
- **Pure utils**: `camelCase` verbs (e.g., `computeMetrics`, `buildHeatmap`, `formatPnl`)
- **Zod schemas**: `camelCase` ending in `Schema` (e.g., `tradeSchema`, `expenseSchema`)
- **Constants**: `SCREAMING_SNAKE_CASE` only for true constants (e.g., `EXPENSE_CATEGORIES`)

### Types
- **TypeScript types**: `PascalCase` (e.g., `Trade`, `ActionResult<T>`)
- **Export with**: `export type`
- **Domain types**: Inferred from Drizzle schema via `InferSelectModel`

## Folder Structure

- **`src/app`** — Next.js routes only. No shared logic here.
- **`src/components`** — Shared UI primitives and page-agnostic components.
- **`src/lib`** — Pure functions and utilities. No React. No `"use server"`. No `"use client"`.
- **`src/db`** — Drizzle schema and client only.
- **`src/types`** — Shared TypeScript types not owned by a single module.

## Design System

### Colors
- **Primary (emerald)**: `#10b981`
- **Loss (rose)**: `#f43f5e`
- **Card border**: `rgba(255, 255, 255, 0.06)`
- **Card background**: `var(--card)`
- **Muted text**: `var(--muted)`

### Shadows
- **Card**: `shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]`
- **Subtle**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`

### Border Radius
- **Standard**: `rounded-xl` (0.75rem / 12px)
- **Card**: `rounded-2xl` (1rem / 16px)
- **Button**: `rounded-xl`

### Motion
- **Ease**: `[0.22, 1, 0.36, 1]` (cubic bezier)
- **Duration**: `0.5s` for page entrance, `0.2s` for micro-interactions
- **Delay**: `0.1s` increments for staggered animations

### Typography
- **Headings**: `font-bold tracking-tighter`
- **Labels**: `text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500`
- **Body**: `text-sm` or `text-base`

## Before You Commit

Run this checklist:

```bash
npx tsc --noEmit   # Type check
npm test           # Run tests
npm run lint       # Lint check
```

All must pass with **zero errors**.

## Commit Messages

Use **Conventional Commits**:

```
feat(scope): add new feature
fix(scope): fix a bug
refactor(scope): refactor code
test(scope): add tests
docs: update documentation
chore: update tooling
```

**Examples**:
- `feat(journal): add bulk delete with undo`
- `fix(analytics): correct profit factor calculation`
- `refactor(ui): extract form primitives`
- `test(utils): add formatPnl tests`
- `docs: update README with deployment steps`

## Pull Request Template

```markdown
## Summary
Brief description of what this PR does.

## Changes
- Added X
- Fixed Y
- Refactored Z

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] Type check passes
- [ ] Lint passes

## Screenshots (if UI changes)
[Attach screenshots or GIFs]
```

## Never Do This

1. ❌ **No mock data** in the codebase (use real database)
2. ❌ **No hard deletes on trades** (soft delete only with `deletedAt`)
3. ❌ **No inline Zod schemas** (use `@/lib/schemas`)
4. ❌ **No unowned queries** (always filter by `userId`)
5. ❌ **No unhandled server action errors** (always return `ActionResult`)
6. ❌ **No `console.log` in production** (use structured logging)
7. ❌ **No sensitive data in logs** (mask PII, secrets)
8. ❌ **No breaking the design system** (use primitives from `src/components`)

## Code Review Checklist

When reviewing PRs:

- [ ] Follows naming conventions
- [ ] Uses domain types from `@/types/domain`
- [ ] Uses Zod schemas from `@/lib/schemas`
- [ ] Server actions return `ActionResult`
- [ ] No inline styles (uses Tailwind or primitives)
- [ ] Tests added for new logic
- [ ] No regressions in existing tests
- [ ] Type check passes
- [ ] Lint passes
- [ ] No `any` types (use proper types)
- [ ] Error handling present
- [ ] Follows design system

## Getting Help

- Check existing code for patterns
- Read the README for setup instructions
- Check DEPLOYMENT.md for deployment help
- Ask questions in PR comments
