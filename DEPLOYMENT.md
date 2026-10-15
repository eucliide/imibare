# eCunga — Vercel Deployment Guide

Complete guide to deploying all three apps to Vercel with subdomain routing.

## Architecture Overview

```
ecunga.vercel.app                    → Portal (landing page)
journal.ecunga.vercel.app            → Trading Journal
tracker.ecunga.vercel.app            → Budget Tracker
```

Each app is deployed as an independent Vercel project. The portal uses environment variables to link to the other two subdomains.

---

## Prerequisites

- **Vercel account** (free tier works)
- **Neon PostgreSQL account** with two databases:
  - `neondb` for trading-journal
  - `budget_tracker` for budget-tracker
- **GitHub repository** with all three apps pushed
- **Git repo structure**:
  ```
  repo-root/
  ├── portal/
  ├── trading-journal/
  └── budget-tracker/
  ```

---

## A. Deploy Trading Journal

### 1. Create Vercel Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New... → Project**
3. Import your Git repository
4. Configure:
   - **Project Name**: `ecunga-journal`
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `trading-journal`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### 2. Environment Variables (Production)

Add these in **Settings → Environment Variables → Production**:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=your-secure-random-32-char-string
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://journal.ecunga.vercel.app

# R2 / Cloudflare Storage (if used)
AWS_ACCESS_KEY_ID=your-r2-access-key
AWS_SECRET_ACCESS_KEY=your-r2-secret-key
AWS_ENDPOINT_URL_S3=https://your-account-id.r2.cloudflarestorage.com
AWS_REGION=auto
CLOUDFLARE_R2_BUCKET=trading-charts
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

**Generate SESSION_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Deploy

1. Click **Deploy**
2. Wait ~2-3 minutes for build
3. Verify deployment at auto-generated URL (e.g., `ecunga-journal.vercel.app`)

### 4. Add Custom Subdomain

1. Go to **Settings → Domains**
2. Add domain: `journal.ecunga.vercel.app`
3. Vercel will configure DNS automatically if you own `ecunga.vercel.app`
4. Wait for DNS propagation (~1-5 minutes)
5. SSL certificate is provisioned automatically (Let's Encrypt)

### 5. Verify

```bash
curl https://journal.ecunga.vercel.app/api/health
# Expected: {"ok":true,"database":"connected","timestamp":"..."}
```

---

## B. Deploy Budget Tracker

### 1. Create Vercel Project

Same process as trading journal:

1. **Add New... → Project** → Import Git repo
2. Configure:
   - **Project Name**: `ecunga-tracker`
   - **Root Directory**: `budget-tracker`
   - **Framework**: Next.js (auto-detected)

### 2. Environment Variables

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/budget_tracker?sslmode=require
SESSION_SECRET=your-secure-random-32-char-string-different-from-journal
NODE_ENV=production
```

**Important:** Use a **different** `SESSION_SECRET` than trading-journal for security isolation.

### 3. Deploy

1. Click **Deploy**
2. Wait for build completion
3. Verify at auto-generated URL

### 4. Add Subdomain

1. **Settings → Domains**
2. Add: `tracker.ecunga.vercel.app`
3. Wait for DNS + SSL provisioning

### 5. Verify

```bash
curl https://tracker.ecunga.vercel.app/api/health
# Expected: {"ok":true,"database":"connected","timestamp":"..."}
```

---

## C. Deploy Portal

### 1. Create Vercel Project

1. **Add New... → Project** → Import Git repo
2. Configure:
   - **Project Name**: `ecunga-portal`
   - **Root Directory**: `portal`
   - **Framework**: Next.js

### 2. Environment Variables

```env
NEXT_PUBLIC_JOURNAL_URL=https://journal.ecunga.vercel.app
NEXT_PUBLIC_TRACKER_URL=https://tracker.ecunga.vercel.app
```

**Note:** These are `NEXT_PUBLIC_` vars — they're embedded in the client bundle at build time.

### 3. Deploy

1. Click **Deploy**
2. Wait for build
3. Verify at `ecunga-portal.vercel.app`

### 4. Assign Main Domain

1. **Settings → Domains**
2. The auto-generated domain is `ecunga-portal.vercel.app`
3. If you want the shorter URL:
   - Remove the `-portal` suffix in Vercel project settings
   - Or add `ecunga.vercel.app` as a custom domain alias

### 5. Verify Portal Wiring

1. Visit `https://ecunga.vercel.app` (or your portal URL)
2. Both cubes should render with preview images
3. Click **"Open Trading Journal"** → should navigate to `journal.ecunga.vercel.app`
4. Click **"Open Budget Tracker"** → should navigate to `tracker.ecunga.vercel.app`
5. Check browser console — no CORS errors, no 404s
6. Visit `https://ecunga.vercel.app/api/health`
   ```json
   {"ok":true,"app":"ecunga-portal","ts":"2024-01-15T12:00:00.000Z"}
   ```

---

## D. Custom Domain (Optional)

If you own `ecunga.com` (or another custom domain):

### 1. Add to Portal

1. In `ecunga-portal` project → **Settings → Domains**
2. Add `ecunga.com`
3. Vercel provides DNS instructions:
   - **A Record**: `76.76.21.21` (Vercel's IP, example)
   - Or **CNAME**: `cname.vercel-dns.com`
4. Add records at your DNS provider (Cloudflare, Namecheap, etc.)
5. Wait for DNS propagation (1-60 minutes)
6. SSL auto-provisions

### 2. Add Subdomains to Apps

**Journal:**
1. In `ecunga-journal` project → **Domains**
2. Add `journal.ecunga.com`
3. Add **CNAME** record at DNS:
   ```
   CNAME journal cname.vercel-dns.com
   ```

**Tracker:**
1. In `ecunga-tracker` project → **Domains**
2. Add `tracker.ecunga.com`
3. Add **CNAME** record:
   ```
   CNAME tracker cname.vercel-dns.com
   ```

### 3. Update Portal Environment Variables

In `ecunga-portal` project → **Settings → Environment Variables**:

```env
NEXT_PUBLIC_JOURNAL_URL=https://journal.ecunga.com
NEXT_PUBLIC_TRACKER_URL=https://tracker.ecunga.com
```

Redeploy the portal for changes to take effect.

---

## E. Verification Checklist

After all deployments:

- [ ] **Portal loads** at main domain
- [ ] **Cube images render** (SVG placeholders visible)
- [ ] **Hover interactions work** (3D tilt, glow, arrow nudge)
- [ ] **Click Trading Journal cube** → lands on `journal.ecunga.vercel.app`
- [ ] **Click Budget Tracker cube** → lands on `tracker.ecunga.vercel.app`
- [ ] **Under-cube links work** (both navigate correctly)
- [ ] **Health endpoints respond**:
  - `ecunga.vercel.app/api/health` → `{"ok":true,"app":"ecunga-portal"}`
  - `journal.ecunga.vercel.app/api/health` → DB connection confirmed
  - `tracker.ecunga.vercel.app/api/health` → DB connection confirmed
- [ ] **No console errors** on portal page
- [ ] **Focus rings visible** when tabbing through cubes
- [ ] **Mobile responsive** (test at 375px width — cubes stack, no horizontal scroll)
- [ ] **Reduced motion respected** (enable in OS settings — tilt disabled, scale still works)
- [ ] **Favicon displays** (emerald 'e' logo)

---

## F. Local Development Parity

Ensure the same wiring works locally:

### 1. Set Local Environment Variables

In `portal/.env.local`:
```env
NEXT_PUBLIC_JOURNAL_URL=http://localhost:3001
NEXT_PUBLIC_TRACKER_URL=http://localhost:3002
```

### 2. Run All Three Apps

```bash
# Terminal 1
cd portal && npm run dev

# Terminal 2
cd trading-journal && npm run dev

# Terminal 3
cd budget-tracker && npm run dev
```

### 3. Test Click-Through Flow

1. Visit `http://localhost:3000`
2. Click Trading Journal → opens `localhost:3001`
3. Click Budget Tracker → opens `localhost:3002`
4. Browser back button returns to portal

---

## G. Rollback Procedure

If a deployment breaks production:

### Via Vercel Dashboard

1. Go to project → **Deployments**
2. Find last known good deployment (green checkmark)
3. Click **︙ → Promote to Production**
4. Confirm promotion
5. Verify `/api/health` returns `ok: true`

### Via Git

```bash
git revert HEAD
git push origin main
```

Vercel auto-deploys the reverted commit.

---

## H. Continuous Deployment

Vercel auto-deploys on:

- **Push to `main`** → Production deployment
- **Pull request** → Preview deployment (unique URL)
- **Push to feature branch** → Preview deployment

### Preview URLs

Format: `ecunga-portal-{branch}-{team}.vercel.app`

Useful for testing changes before merging to `main`.

---

## I. Environment-Specific Builds

If you need different behavior in staging vs. production:

### 1. Add Staging Environment Variables

In Vercel → **Settings → Environment Variables**:

- Assign variables to **Preview** or **Development** environments
- Production uses **Production** environment

### 2. Check Environment in Code

```typescript
const isProduction = process.env.NODE_ENV === "production";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

---

## J. Database Migrations

Both trading-journal and budget-tracker use Drizzle ORM with Neon PostgreSQL.

### Apply Schema Changes

```bash
# In trading-journal or budget-tracker directory
npx drizzle-kit push
```

**Important:** Run migrations **before** deploying code that depends on new schema.

### Backup Before Migration

In Neon Console:
1. Go to your project → **Backups**
2. Click **Create Snapshot** (manual backup)
3. Apply migration
4. Verify with `npx drizzle-kit studio`

---

## K. Monitoring & Logs

### Vercel Logs

1. Go to project → **Deployments** → click deployment
2. **Functions** tab shows serverless function logs
3. Real-time streaming during active requests

### Error Tracking (Future)

Consider adding:
- **Sentry** for error tracking (when Next.js 16 support is ready)
- **Axiom** for structured logging
- **Better Stack** for uptime monitoring

---

## L. Performance Optimization

### Portal (Static Landing Page)

- **Output**: Static HTML + client-side JS
- **CDN**: Vercel Edge Network (automatic)
- **Cache**: Aggressive caching for assets (1 year)

### Trading Journal & Budget Tracker (Dynamic Apps)

- **Rendering**: React Server Components + Edge Runtime
- **Database**: Neon serverless (auto-scales, 0ms cold start via HTTP)
- **Images**: Use plain `<img>` with lazy loading (no next/image complexity)

---

## M. Security Checklist

- [ ] **Environment variables** never committed to Git
- [ ] **SESSION_SECRET** is unique per app and ≥32 chars
- [ ] **DATABASE_URL** uses `sslmode=require`
- [ ] **CORS** not needed (same-origin or subdomain navigation)
- [ ] **CSP headers** configured in `next.config.ts` (both apps have security headers)
- [ ] **Vercel domains** have auto-provisioned SSL
- [ ] **Custom domains** use HTTPS (Let's Encrypt)

---

## N. Cost Estimates

### Vercel

- **Free Tier**: 100 GB bandwidth/month, unlimited deployments
- **Pro Tier** ($20/month): 1 TB bandwidth, team features

### Neon PostgreSQL

- **Free Tier**: 0.5 GB storage, 1 compute unit
- **Launch Plan** ($19/month): 10 GB storage, always-on compute

### Total (Free Tier)

- **Monthly**: $0
- **Suitable for**: Personal use, moderate traffic (<10k monthly visitors)

---

## O. Troubleshooting

### Issue: "Environment variable not defined"

**Cause:** `NEXT_PUBLIC_*` vars not set in Vercel

**Fix:**
1. Go to Vercel project → **Settings → Environment Variables**
2. Add missing variables
3. **Redeploy** (env vars require rebuild)

---

### Issue: Portal links to localhost in production

**Cause:** Env vars not set or deployment used cached build

**Fix:**
1. Verify env vars in Vercel dashboard
2. Trigger fresh deployment:
   ```bash
   git commit --allow-empty -m "chore: trigger redeploy"
   git push origin main
   ```

---

### Issue: Database connection error

**Cause:** `DATABASE_URL` incorrect or Neon database paused

**Fix:**
1. Verify connection string in Neon Console → **Connection Details**
2. Check database status (Neon free tier auto-pauses after inactivity)
3. Test connection:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

---

### Issue: CORS error when clicking cubes

**Cause:** Browser blocking cross-origin navigation (should NOT happen with proper setup)

**Fix:**
- Verify portal env vars point to correct subdomains
- Check browser console for actual error
- Ensure subdomain CNAME records are correct

---

### Issue: Build fails with TypeScript errors

**Cause:** Type errors in code

**Fix:**
1. Run locally:
   ```bash
   npx tsc --noEmit
   ```
2. Fix errors
3. Commit and push

---

### Issue: 404 on cube preview images

**Cause:** Images not in `public/` folder or wrong path

**Fix:**
1. Verify files exist:
   ```
   portal/public/previews/trading-journal.svg
   portal/public/previews/budget-tracker.svg
   ```
2. Public files are served from `/previews/*` (no `/public` in URL)

---

## P. Next Steps

1. **Replace placeholder images**: Generate 1024×1024 screenshots of each app
2. **Add OG image**: Create `portal/public/og-image.png` (1200×630) for social sharing
3. **Enable analytics**: Add Vercel Analytics or Plausible
4. **Set up monitoring**: Configure uptime checks for all three `/api/health` endpoints
5. **Custom domain**: If not using `.vercel.app`, complete section D above
6. **Staging environment**: Create a separate Vercel project pointing to a `develop` branch

---

## Q. Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Neon Docs**: https://neon.tech/docs
- **Lucia Auth**: https://lucia-auth.com

For issues specific to this setup, check:
- `portal/README.md`
- `trading-journal/DEPLOYMENT.md`
- `budget-tracker/DEPLOYMENT.md`

---

**Last Updated**: 2024-01-15
