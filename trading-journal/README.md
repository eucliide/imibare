# Trading Journal — For Funded Traders

A Next.js 15 trading journal built for ICT-style traders scaling through prop firms. Tracks trades, playbook setups, analytics, benchmarks, expenses, payouts, and weekly reviews.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router |
| Language | TypeScript (strict mode) |
| Database | Neon PostgreSQL |
| ORM | Drizzle |
| Auth | Lucia v3 + Argon2id |
| Styling | Tailwind CSS v4 |
| Hosting | Cloudflare Pages |
| Storage | Cloudflare R2 |
| Animation | Motion (Framer Motion) |
| Charts | Recharts |

## Features

- **Trading Journal** — Full CRUD with soft delete, undo, audit log
- **Playbook** — Setup library with equity curves and stats
- **Analytics** — Edge score, Sharpe ratio, consistency, profit factor
- **Breakdown** — Group by symbol, strategy, direction, session, day
- **Heatmap** — Calendar-based P&L visualization
- **Weekly Review** — Narrative notes + mindset sliders
- **Performance** — Benchmarks, risk metrics, monthly returns
- **Accounts** — Multi-tenant with account switching
- **Certificates** — Prop firm milestones
- **Payouts & Expenses** — Real net profit tracking
- **Command Palette** — Cmd+K navigation with keyboard shortcuts
- **Accessibility** — Reduced motion support, keyboard navigation

## Prerequisites

- **Node.js** 22+
- **npm** or **pnpm**
- **Neon PostgreSQL** account ([neon.tech](https://neon.tech))
- **Cloudflare** account (Pages + R2)

## Local Development

1. **Clone the repo**:
   ```bash
   git clone <repo-url>
   cd trading-journal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:  
   Copy `.env.example` to `.env.local` and fill in:
   ```bash
   DATABASE_URL=              # Neon connection string
   R2_ACCOUNT_ID=
   R2_ACCESS_KEY_ID=
   R2_SECRET_ACCESS_KEY=
   R2_BUCKET_NAME=
   R2_PUBLIC_URL=
   ```

4. **Push schema to database**:
   ```bash
   npx drizzle-kit push
   ```

5. **Start dev server**:
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npx drizzle-kit push` | Push schema to database |
| `npx drizzle-kit studio` | Open Drizzle Studio |
| `npm run pages:build` | Build for Cloudflare Pages |
| `npm run pages:preview` | Preview Cloudflare build locally |

## Project Structure

```
src/
├── app/              # Next.js routes and pages
├── components/       # Shared UI primitives
├── db/               # Drizzle schema and client
├── lib/              # Pure utility functions
└── types/            # Shared TypeScript types
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step Cloudflare Pages deployment instructions.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for conventions, design system, and commit guidelines.

## License

Private — all rights reserved.
