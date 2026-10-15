# eCunga

Two apps. One hub.

- **portal/** — Landing page. Deployed to `ecunga.vercel.app`
- **trading-journal/** — Deployed to `journal.ecunga.vercel.app`
- **budget-tracker/** — Deployed to `tracker.ecunga.vercel.app`

Each app is a standalone Next.js 15 project. They share a design system (dark theme, emerald accent, motion easings) but have independent databases on Neon and independent Vercel deployments.

## Local development

Run each app in its own terminal:

```bash
# Terminal 1 — Portal
cd portal && npm run dev

# Terminal 2 — Trading Journal
cd trading-journal && npm run dev

# Terminal 3 — Budget Tracker
cd budget-tracker && npm run dev
```

The portal's links default to `localhost:3001` and `localhost:3002` when `NEXT_PUBLIC_*` env vars are not set.

## Deployment

Each app is deployed independently to Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete guide.
