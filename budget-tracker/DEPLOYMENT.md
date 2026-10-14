# Budget Tracker — Deployment Guide

## Overview

Budget Tracker is deployed to **Cloudflare Pages** using the **OpenNext adapter** for full Next.js 15 App Router support, including React Server Components, Server Actions, and middleware.

- **Domain**: `budget.yourdomain.com`
- **Platform**: Cloudflare Pages
- **Database**: Neon PostgreSQL (serverless)
- **Auth**: Lucia v3 with Argon2id
- **Runtime**: Edge (Cloudflare Workers)

---

## Prerequisites

1. **Cloudflare Account** with Pages enabled
2. **Neon Database** (free tier works for development)
3. **GitHub Repository** connected to Cloudflare Pages
4. **Node.js 22+** (specified in `.nvmrc`)

---

## Environment Variables

### Required Variables

Add these to your Cloudflare Pages project settings:

```bash
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/budget_tracker?sslmode=require

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-secure-random-string-min-32-chars
```

### Local Development

Copy `.env.local.example` to `.env.local` and fill in values:

```bash
cp .env.local.example .env.local
```

---

## Database Setup

### 1. Create Neon Database

```bash
# Visit https://console.neon.tech
# Create new project: "budget-tracker"
# Copy connection string
```

### 2. Push Schema

```bash
npm install
npx drizzle-kit push
```

This creates all tables with proper indexes and constraints.

### 3. Verify Schema

```bash
npx drizzle-kit studio
```

Open `https://local.drizzle.studio` to inspect tables.

---

## Build Configuration

### Cloudflare Pages Settings

1. **Build command**: `npm run pages:build`
2. **Build output directory**: `.open-next/worker`
3. **Root directory**: `budget-tracker` (if monorepo)
4. **Node version**: `22` (via `.nvmrc`)
5. **Compatibility flags**: `nodejs_compat`

### Build Scripts

Defined in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "pages:build": "npx @opennextjs/cloudflare",
    "pages:preview": "npx wrangler pages dev .open-next/worker --compatibility-flag=nodejs_compat",
    "pages:deploy": "npx wrangler pages deploy .open-next/worker --project-name=budget-tracker"
  }
}
```

---

## Deployment Steps

### Initial Setup

1. **Connect GitHub Repository**

   ```bash
   # In Cloudflare Dashboard:
   # Pages → Create application → Connect to Git
   # Select repository and branch
   ```

2. **Configure Build Settings**

   - Framework preset: `None` (we use custom OpenNext)
   - Build command: `npm run pages:build`
   - Build output: `.open-next/worker`
   - Environment variables: Add `DATABASE_URL`, `SESSION_SECRET`

3. **Add Compatibility Flag**
   ```bash
   # In Pages settings → Functions:
   # Compatibility flags: nodejs_compat
   ```

### Manual Deployment

```bash
# Build for production
npm run pages:build

# Deploy with Wrangler
npm run pages:deploy
```

### Automatic Deployments

- **Production**: Triggered on push to `main`
- **Preview**: Triggered on pull requests
- **Branch Deployments**: Triggered on push to any branch

---

## DNS Configuration

### Cloudflare DNS Records

```
Type: CNAME
Name: budget
Content: budget-tracker.pages.dev
Proxy: Enabled (orange cloud)
```

### SSL/TLS Settings

- **Mode**: Full (strict)
- **Edge Certificates**: Universal SSL enabled
- **Always Use HTTPS**: Enabled

---

## Post-Deployment Checklist

### Health Check

```bash
curl https://budget.yourdomain.com/api/health
# Expected: {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z","database":"connected"}
```

### Functionality Tests

- [ ] Signup creates user in database
- [ ] Login validates credentials
- [ ] Dashboard shows $0.00 metrics (clean state)
- [ ] Navigation works (desktop + mobile)
- [ ] Auth middleware blocks protected routes
- [ ] Logout clears session
- [ ] /api/health returns 200

### Security Verification

- [ ] HTTPS redirect working
- [ ] Security headers present (CSP, X-Frame-Options, etc.)
- [ ] Session cookies have Secure, HttpOnly, SameSite=Lax
- [ ] Database credentials not exposed
- [ ] Auth routes redirect correctly

### Performance

- [ ] First load < 2s
- [ ] RSC payload size < 50KB
- [ ] No hydration mismatches
- [ ] Lighthouse score > 90

---

## Monitoring

### Health Endpoint

```typescript
GET /api/health
// Returns 200 if database is reachable
// Returns 503 if database is down
```

### Database Connection Pool

Neon serverless HTTP uses automatic connection management — no manual pooling needed.

### Error Tracking

Console logs are available in Cloudflare dashboard:

```
Pages → [project] → Deployment → Functions
```

For production monitoring, consider:

- **Axiom**: Structured logging with edge support
- **Better Stack**: Error tracking for serverless
- **Highlight.io**: Session replay + error monitoring

---

## Rollback Procedure

### Via Cloudflare Dashboard

```
Pages → [project] → Deployments → [previous deployment] → Rollback
```

### Via Git

```bash
git revert HEAD
git push origin main
# Cloudflare auto-deploys the reverted commit
```

---

## Database Backups

### Neon Automatic Backups

- **Point-in-time recovery**: 7 days (Free tier)
- **Daily snapshots**: Automatic
- **Manual snapshots**: Via Neon console

### Export User Data

```typescript
// Future: Add data export endpoint
GET /api/export
```

---

## Troubleshooting

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next .open-next node_modules
npm install
npm run pages:build
```

### Database Connection Errors

```bash
# Verify DATABASE_URL format
postgresql://user:password@host/database?sslmode=require

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Session Issues

```bash
# Regenerate SESSION_SECRET
openssl rand -base64 32

# Update in Cloudflare Pages settings
# Redeploy to apply
```

### Edge Runtime Errors

```bash
# Check compatibility:
# - No Node.js fs, path, crypto modules
# - Use Web APIs (fetch, Response, etc.)
# - Argon2 via @node-rs/argon2 (WASM-compatible)
```

---

## Cost Estimates

### Cloudflare Pages

- **Free tier**: 500 builds/month, unlimited requests
- **Paid**: $20/month (20,000 builds, no request limit)

### Neon PostgreSQL

- **Free tier**: 0.5 GB storage, 1 compute unit
- **Paid**: $19/month (10 GB storage, always-on compute)

### Total Monthly Cost (Free Tier)

- Cloudflare Pages: $0
- Neon: $0
- **Total: $0** (suitable for personal use + moderate traffic)

---

## Support

- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **OpenNext Docs**: https://opennext.js.org
- **Neon Docs**: https://neon.tech/docs
- **Lucia Docs**: https://lucia-auth.com

---

## Changelog

- **2024-01-01**: Initial deployment configuration
