# Budget Tracker

A calendar-first budgeting application built with Next.js 15, featuring real-time financial tracking, recurring bills, and savings goals.

## Tech Stack

- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (dark theme)
- **Animation**: Motion (spring physics)
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM
- **Auth**: Lucia v3 with Argon2id
- **Deployment**: Vercel
- **Testing**: Vitest

## Features

### Phase 1 (Complete)

- ✅ Database schema (users, accounts, categories, transactions, bills, goals, budgets)
- ✅ Authentication (signup, login, logout with secure sessions)
- ✅ Dashboard with metrics (balance, income, expenses, cash flow)
- ✅ UI component library (11 primitives + responsive nav)
- ✅ Currency formatting utilities
- ✅ Health check endpoint
- ✅ Deployment documentation

### Phase 2 (Planned)

- Account management (add, edit, delete)
- Transaction logging (income/expenses with categories)
- Category customization
- Recurring bills with reminders
- Savings goals with progress tracking
- Monthly budgets by category
- Reports and analytics
- Data export

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- Neon PostgreSQL account (free tier works)
- npm or pnpm

## Getting Started

### 1. Clone and Install

```bash
cd budget-tracker
npm install
```

### 2. Environment Setup

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/budget_tracker?sslmode=require
SESSION_SECRET=your-secure-random-string-min-32-chars
```

Generate session secret:

```bash
openssl rand -base64 32
```

### 3. Database Setup

```bash
# Push schema to Neon
npx drizzle-kit push

# Verify schema
npx drizzle-kit studio
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 5. Run Tests

```bash
npm test
```

## Project Structure

```
budget-tracker/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── (auth)/            # Auth routes (signup, login)
│   │   ├── dashboard/         # Main dashboard
│   │   ├── accounts/          # Account management (planned)
│   │   ├── transactions/      # Transaction list (planned)
│   │   ├── bills/             # Recurring bills (planned)
│   │   ├── goals/             # Savings goals (planned)
│   │   ├── budgets/           # Budget planning (planned)
│   │   ├── categories/        # Category management (planned)
│   │   ├── settings/          # User settings (planned)
│   │   ├── actions/           # Server actions (logout, export)
│   │   └── api/               # API routes (health check)
│   ├── components/            # UI primitives
│   ├── db/                    # Database (schema, connection)
│   └── lib/                   # Utilities (auth, password, format)
├── public/                    # Static assets
├── drizzle.config.ts          # Drizzle ORM config
├── vitest.config.ts           # Test config
└── next.config.ts             # Next.js + OpenNext
```

## Design System

### Colors

- **Background**: `zinc-950` (page), `zinc-900` (cards)
- **Borders**: `zinc-800`
- **Text**: `white` (primary), `zinc-400` (secondary)
- **Accent**: `emerald-500` (primary), `blue-500` (secondary)
- **Error**: `red-500`

### Typography

- **Font**: Inter (variable)
- **Scale**: text-sm → text-3xl
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing

- **Cards**: `p-4` (mobile), `p-6` (desktop)
- **Sections**: `space-y-8`
- **Forms**: `space-y-6`

### Motion

- **Duration**: 200ms (interactions), 500ms (page transitions)
- **Easing**: `spring(1, 80, 10)` (Motion default)
- **Reduced motion**: Respects `prefers-reduced-motion`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

### Quick Deploy

```bash
# Build for Cloudflare Pages
npm run pages:build

# Preview locally
npm run pages:preview

# Deploy
npm run pages:deploy
```

## Security

- **Password Hashing**: Argon2id (memoryCost: 19456, timeCost: 2)
- **Session Cookies**: HttpOnly, Secure, SameSite=Lax
- **CSRF Protection**: Built into Next.js Server Actions
- **SQL Injection**: Parameterized queries via Drizzle
- **XSS Protection**: React auto-escaping + CSP headers

## Database Schema

### Users

- `id` (text, pk)
- `email` (text, unique)
- `password_hash` (text)
- `name` (text)
- `created_at` (timestamp)

### Accounts

- Financial accounts (checking, savings, credit, investment)
- Balance tracking with `numeric(14,2)`

### Categories

- User-customizable (income/expense)
- System defaults available

### Transactions

- Income/expense records
- Linked to accounts and categories
- Notes and receipt support

### Recurring Bills

- Scheduled payments
- Frequency patterns (weekly, monthly, yearly)
- Due date tracking

### Savings Goals

- Target amounts with deadlines
- Progress tracking
- Archive support

### Budgets

- Monthly category limits
- Rollover support
- Overspending alerts (planned)

## Scripts

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run pages:build      # Build for Cloudflare Pages
npm run pages:preview    # Preview Cloudflare build
npm run pages:deploy     # Deploy to Cloudflare
npm test                 # Run Vitest tests
npm run test:ui          # Vitest UI
npx drizzle-kit push     # Push schema to database
npx drizzle-kit studio   # Open Drizzle Studio
npx tsc --noEmit         # Type check
```

## Contributing

See [CONTRIBUTING.md](../trading-journal/CONTRIBUTING.md) for development guidelines (shared across projects).

## License

Private — all rights reserved.
