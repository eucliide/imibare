# Finance Hub — Multi-Zone Monorepo

A unified finance platform with three Next.js 15 applications orchestrated through multi-zone routing.

## Architecture

```
yourdomain.com (Portal - Entry Point)
├── /trading → Trading Journal (localhost:3001)
└── /budget → Budget Tracker (localhost:3002)
```

## Projects

### 1. Portal (Port 3000)
- **Path**: `/` (root domain)
- **Purpose**: Landing page with 3D cube navigation
- **Role**: Proxy/router to trading-journal and budget-tracker

### 2. Trading Journal (Port 3001)
- **Path**: `/trading`
- **BasePath**: `/trading`
- **Database**: `neondb` (existing)
- **Features**: Trade logging, playbook, analytics, performance tracking

### 3. Budget Tracker (Port 3002)
- **Path**: `/budget`
- **BasePath**: `/budget`
- **Database**: `budget_tracker` (separate)
- **Features**: Accounts, transactions, bills, goals, budgets

## Quick Start

### 1. Install All Dependencies

```bash
# Install concurrently + workspace dependencies
npm install

# Install all workspace packages
npm run install:all
```

### 2. Setup Databases

```bash
# Trading Journal (uses existing database)
cd trading-journal
# (DATABASE_URL already configured)
npx drizzle-kit push

# Budget Tracker (needs new database)
cd ../budget-tracker
# Create database 'budget_tracker' in Neon Console
# Update .env.local with: postgresql://...@.../budget_tracker?...
npx drizzle-kit push
```

### 3. Run All Apps

```bash
# From root directory
npm run dev
```

This starts:
- **Portal**: http://localhost:3000
- **Trading Journal**: http://localhost:3001 (proxied via /trading)
- **Budget Tracker**: http://localhost:3002 (proxied via /budget)

Visit **http://localhost:3000** and click cubes to navigate!

## Individual Dev Commands

```bash
# Run individual apps
npm run dev:portal
npm run dev:trading
npm run dev:budget

# Or from within each directory
cd portal && npm run dev
cd trading-journal && npm run dev
cd budget-tracker && npm run dev
```

## How Multi-Zone Routing Works

### Development (Local)

Portal's `next.config.ts` rewrites routes:

```typescript
async rewrites() {
  return [
    { source: "/trading", destination: "http://localhost:3001" },
    { source: "/trading/:path*", destination: "http://localhost:3001/:path*" },
    { source: "/budget", destination: "http://localhost:3002" },
    { source: "/budget/:path*", destination: "http://localhost:3002/:path*" },
  ];
}
```

### Production (Cloudflare)

Each app deployed separately with `basePath`:

```typescript
// trading-journal/next.config.ts
basePath: "/trading"
assetPrefix: "/trading"

// budget-tracker/next.config.ts
basePath: "/budget"
assetPrefix: "/budget"
```

Then use Cloudflare Workers to route:

```javascript
// _worker.js at root
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/trading')) {
      return fetch('https://trading-journal.pages.dev' + url.pathname);
    }
    if (url.pathname.startsWith('/budget')) {
      return fetch('https://budget-tracker.pages.dev' + url.pathname);
    }
    
    // Default to portal
    return fetch('https://portal.pages.dev' + url.pathname);
  }
};
```

## Project Structure

```
finance-hub/
├── package.json              # Root workspace config
├── README.md                 # This file
├── portal/                   # Entry point (port 3000)
│   ├── src/
│   │   ├── app/page.tsx      # Links to /trading and /budget
│   │   └── components/
│   ├── next.config.ts        # Rewrites to localhost:3001 & 3002
│   └── package.json
├── trading-journal/          # Trading app (port 3001)
│   ├── src/
│   ├── next.config.ts        # basePath: "/trading"
│   ├── drizzle.config.ts     # DB: neondb
│   └── package.json
└── budget-tracker/           # Budget app (port 3002)
    ├── src/
    ├── next.config.ts        # basePath: "/budget"
    ├── drizzle.config.ts     # DB: budget_tracker
    └── package.json
```

## Environment Variables

### Portal
```env
# No environment variables needed
```

### Trading Journal
```env
DATABASE_URL=postgresql://...@.../neondb?sslmode=require
SESSION_SECRET=your-secret-32-chars
AWS_ACCESS_KEY_ID=your-r2-access-key
AWS_SECRET_ACCESS_KEY=your-r2-secret-key
AWS_ENDPOINT_URL_S3=https://your-account-id.r2.cloudflarestorage.com
AWS_REGION=auto
CLOUDFLARE_R2_BUCKET=trading-charts
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### Budget Tracker
```env
DATABASE_URL=postgresql://...@.../budget_tracker?sslmode=require
SESSION_SECRET=your-secret-32-chars
```

## Databases

Both apps use **Neon PostgreSQL** but **separate databases**:

| App              | Database Name    | Tables                                      |
|------------------|------------------|---------------------------------------------|
| Trading Journal  | `neondb`         | users, sessions, accounts, trades, etc.     |
| Budget Tracker   | `budget_tracker` | users, sessions, accounts, transactions, etc. |

**Why separate databases?**
- Different schemas (trading-journal has `broker` column, budget-tracker doesn't)
- Independent scaling and backups
- Clear data separation

## Testing the Setup

1. **Start all apps**: `npm run dev`
2. **Visit portal**: http://localhost:3000
3. **Click "Trading Journal"** → Should show http://localhost:3000/trading
4. **Click "Budget Tracker"** → Should show http://localhost:3000/budget
5. **Verify auth works** in both apps independently

## Deployment

See individual DEPLOYMENT.md files:
- [Portal Deployment](./portal/DEPLOYMENT.md)
- [Trading Journal Deployment](./trading-journal/DEPLOYMENT.md)
- [Budget Tracker Deployment](./budget-tracker/DEPLOYMENT.md)

### Production Routing Strategy

Deploy to Cloudflare Pages + Workers:

```
1. Deploy each app to Cloudflare Pages:
   - portal → portal.pages.dev
   - trading-journal → trading.pages.dev
   - budget-tracker → budget.pages.dev

2. Create Cloudflare Worker at yourdomain.com:
   - Routes /trading/* → trading.pages.dev
   - Routes /budget/* → budget.pages.dev
   - Routes /* → portal.pages.dev

3. DNS: yourdomain.com → Worker route
```

## Common Issues

### Port Already in Use

```bash
# Kill processes on ports 3000, 3001, 3002
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process
Get-Process -Id (Get-NetTCPConnection -LocalPort 3002).OwningProcess | Stop-Process
```

### Database Connection Error (Budget Tracker)

- Create `budget_tracker` database in Neon Console
- Update `.env.local` with correct database name
- Run `npx drizzle-kit push`

### 404 on /trading or /budget

- Ensure trading-journal runs on port 3001
- Ensure budget-tracker runs on port 3002
- Check portal's `next.config.ts` rewrites

### Styles Not Loading

- Verify `basePath` and `assetPrefix` in next.config.ts
- Clear `.next` cache: `rm -rf */\.next`
- Rebuild: `npm run build --workspaces`

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4
- **Animation**: Motion (spring physics)
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM
- **Auth**: Lucia v3 (Argon2id)
- **Deployment**: Cloudflare Pages + Workers
- **Build**: OpenNext adapter

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Work in specific app directory
3. Test locally: `npm run dev`
4. Commit with conventional commits
5. Push and create PR

## License

Private — all rights reserved.
