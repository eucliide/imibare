# Deployment Guide

## First Production Deploy

### 1. Create Neon Production Database

1. Go to [Neon Console](https://console.neon.tech)
2. Click **New Project**
3. Name: `trading-journal-prod`
4. Region: Choose closest to your users
5. Copy the connection string

### 2. Push Database Schema

```bash
DATABASE_URL="<your-prod-connection-string>" npx drizzle-kit push
```

Verify in Neon Console that tables were created.

### 3. Create Cloudflare R2 Bucket

1. Go to **Cloudflare Dashboard** → **R2**
2. Click **Create bucket**
3. Name: `trading-journal-charts-prod`
4. Click **Create bucket**
5. Go to **Settings** → **R2 API Tokens**
6. Click **Create API Token**
7. Name: `trading-journal-prod`
8. Permissions: **Object Read & Write**
9. Click **Create API Token**
10. Copy:
    - Account ID
    - Access Key ID
    - Secret Access Key
11. Get Public URL: `https://pub-<id>.r2.dev` (or custom domain)

### 4. Create Cloudflare Pages Project

1. Go to **Cloudflare Dashboard** → **Pages**
2. Click **Create a project**
3. Connect to your **GitHub** repo
4. **Build settings**:
   - Framework preset: **Next.js**
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`
   - Root directory: `trading-journal` (if monorepo)
5. Click **Save and Deploy**

### 5. Set Environment Variables

In **Cloudflare Pages** → **Settings** → **Environment Variables**:

**Production**:
```
DATABASE_URL=<neon-prod-connection-string>
R2_ACCOUNT_ID=<r2-account-id>
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret>
R2_BUCKET_NAME=trading-journal-charts-prod
R2_PUBLIC_URL=https://pub-<id>.r2.dev
NODE_VERSION=22
```

Click **Save**.

### 6. Enable nodejs_compat Flag

1. Go to **Pages** → **Settings** → **Functions**
2. **Compatibility flags**: Add `nodejs_compat`
3. **Compatibility date**: Leave default or set to `2024-01-01`
4. Click **Save**

### 7. Trigger Redeploy

1. Go to **Pages** → **Deployments**
2. Click **Retry deployment** (or push a new commit)
3. Wait for build to complete

### 8. Verify Deployment

1. Visit your live URL (e.g., `https://trading-journal.pages.dev`)
2. Sign up with a new account
3. Create an account
4. Log a trade
5. Verify trade appears on `/journal` and `/dashboard`
6. Upload a chart screenshot
7. Verify chart renders

---

## Subsequent Deploys

### For Code Changes

1. Commit and push to `main` branch
2. Cloudflare automatically redeploys

### For Schema Changes

1. Update `src/db/schema.ts`
2. Test locally:
   ```bash
   npx drizzle-kit push
   ```
3. Push to production:
   ```bash
   DATABASE_URL="<prod-url>" npx drizzle-kit push
   ```
4. Commit schema change
5. Push to `main` → Cloudflare redeploys

---

## Rollback Procedure

### If the Latest Deploy Breaks

1. Go to **Cloudflare Pages** → **Deployments**
2. Find the last **working deployment**
3. Click **"..."** → **Rollback to this deployment**
4. Confirm

### If Schema Changed

1. Manually revert the schema migration in Neon:
   ```bash
   DATABASE_URL="<prod-url>" npx drizzle-kit drop
   ```
2. Push the previous schema:
   ```bash
   DATABASE_URL="<prod-url>" npx drizzle-kit push
   ```

---

## Backup Procedure

### Neon Automatic Backups

Neon provides **automatic point-in-time restore** for all projects:

1. Go to **Neon Console** → **Your Project** → **Backups**
2. Backups are **automatic** (kept for 7 days on Free, 30 days on Pro)
3. To restore:
   - Click **Restore**
   - Choose a timestamp
   - Creates a new branch with the restored state

### Manual Database Backup

For extra safety, run a weekly manual backup:

```bash
pg_dump "<neon-prod-connection-string>" > backup-$(date +%Y%m%d).sql
```

Store backups in a secure location (S3, Google Drive, etc.).

### Restore from Manual Backup

```bash
psql "<neon-prod-connection-string>" < backup-20261201.sql
```

---

## Monitoring and Logs

### View Build Logs

1. Go to **Cloudflare Pages** → **Deployments**
2. Click on a deployment
3. View **Build log**

### View Runtime Logs

1. Go to **Cloudflare Pages** → **Functions**
2. Click **Logs**
3. Real-time logs appear here

### Error Tracking

For production error tracking, consider adding:
- **Sentry** ([sentry.io](https://sentry.io))
- **LogRocket** ([logrocket.com](https://logrocket.com))

---

## Performance Optimization

### Enable Caching

In `next.config.ts`:

```typescript
export default {
  headers: async () => [
    {
      source: "/api/:path*",
      headers: [
        { key: "Cache-Control", value: "s-maxage=60, stale-while-revalidate" },
      ],
    },
  ],
};
```

### Image Optimization

Cloudflare Pages automatically optimizes images via **Cloudflare Images**.

---

## Custom Domain (Optional)

1. Go to **Cloudflare Pages** → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Follow DNS instructions
5. Wait for SSL certificate provisioning (automatic)

---

## Troubleshooting

### Build Fails with "Module not found"

- Check that all imports use `@/` alias
- Run `npm install` locally to ensure `package.json` is correct
- Verify `tsconfig.json` paths are correct

### "Invalid DATABASE_URL"

- Ensure the connection string is correct
- Neon URLs use `?sslmode=require` — ensure it's present
- Check that the variable is set in **Production** environment (not Preview)

### "R2 Bucket not found"

- Verify `R2_BUCKET_NAME` matches the actual bucket name
- Check that API token has **Object Read & Write** permissions
- Ensure `R2_ACCOUNT_ID` is correct

### Functions Timeout

- Default timeout is 10 seconds
- Complex queries may need optimization (add indexes, limit results)
- Check Neon query performance in **Neon Console** → **Monitoring**

---

## Security Checklist

- [ ] All environment variables set in Cloudflare Pages
- [ ] No `.env` files committed to repo
- [ ] Database connection uses SSL (`?sslmode=require`)
- [ ] R2 API token has minimum required permissions
- [ ] Strong passwords enforced (8+ chars)
- [ ] Auth session cookies are `httpOnly` and `secure`
- [ ] CORS configured correctly (if using API routes)
- [ ] Rate limiting on auth endpoints (future enhancement)

---

## Support

For deployment issues:
- Check [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- Check [Neon Docs](https://neon.tech/docs)
- Check [Next.js Deployment Docs](https://nextjs.org/docs/deployment)


---

## Security

### Implemented Security Measures

**Authentication & Session Management:**
- Lucia v3 with secure session cookies (`httpOnly`, `secure`, `sameSite: lax`)
- Password hashing with Argon2id via `@oslojs/crypto`
- Rate limiting on login/signup (10 requests/minute per IP)
- User enumeration prevention (same error message for invalid credentials)

**Data Ownership & Authorization:**
- All database queries filtered by `userId`
- Ownership verification for updates/deletes
- Account and setup ownership validation before operations

**Input Validation:**
- Zod schemas for all form inputs
- SQL injection protection via Drizzle ORM parameterized queries
- XSS protection (no `dangerouslySetInnerHTML` usage)

**Security Headers:**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

**Future Enhancements:**
- Content Security Policy (CSP) in report-only mode (future migration to enforce)
- Global rate limiting via Cloudflare KV/Durable Objects (currently per-isolate)
- R2 signed URLs for chart uploads (currently public bucket)

### Environment Variables for Production

Add these variables in Cloudflare Pages:

```
DATABASE_URL=<neon-prod-url>
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://trading.yourdomain.com
R2_ACCOUNT_ID=<cloudflare-account-id>
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret>
R2_BUCKET_NAME=trade-charts
R2_PUBLIC_URL=https://pub-xxx.r2.dev
SENTRY_DSN=<sentry-dsn>
NEXT_PUBLIC_SENTRY_DSN=<sentry-public-dsn>
NODE_VERSION=22
```

---

## Monitoring & Logging

### Sentry Error Tracking

**Setup:**
1. Create account at [sentry.io](https://sentry.io)
2. Create new Next.js project
3. Copy DSN and public DSN
4. Add to Cloudflare Pages environment variables
5. Sentry will automatically capture:
   - Server-side errors
   - Client-side errors
   - Performance metrics (tracesSampleRate: 0.1)
   - Session replays on errors (replaysOnErrorSampleRate: 1.0)

**Monitoring:**
- Dashboard: [sentry.io](https://sentry.io/organizations/<org>/issues/)
- Email alerts for new errors
- Slack/Discord integration available

### Structured Logging

All server actions log to stdout in JSON format (production) or pretty-print (dev):

```typescript
logger.info("User logged in", { userId: "123" });
logger.warn("Rate limit exceeded", { ip: "1.2.3.4", email: "user@example.com" });
logger.error("Failed to create trade", { userId: "123" }, error);
```

**Viewing logs:**
- Cloudflare Pages: **Functions** → **Logs** (real-time)
- For long-term storage, integrate with log aggregators:
  - [Axiom](https://axiom.co)
  - [Datadog](https://datadoghq.com)
  - [Better Stack](https://betterstack.com)

### Health Check Endpoint

**GET /api/health**

Returns:
```json
{
  "ok": true,
  "timestamp": "2026-10-14T12:00:00.000Z"
}
```

Use for uptime monitoring:
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://pingdom.com)
- Cloudflare Health Checks

---

## Backups & Recovery

### Neon Automated Backups

**Retention:**
- Free tier: 7 days point-in-time restore
- Pro tier: 30 days point-in-time restore

**Restoring from backup:**
1. Go to Neon Console → **Backups**
2. Select timestamp
3. Click **Restore** → creates new branch
4. Update `DATABASE_URL` to restored branch
5. Redeploy app

### Manual Backups via pg_dump

**Weekly backup script:**

```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/path/to/backups"
NEON_URL="<production-database-url>"

pg_dump "$NEON_URL" > "$BACKUP_DIR/trading-journal-$DATE.sql"
gzip "$BACKUP_DIR/trading-journal-$DATE.sql"

# Upload to S3 or R2 for off-site storage
aws s3 cp "$BACKUP_DIR/trading-journal-$DATE.sql.gz" s3://your-backup-bucket/
```

**Restore from manual backup:**

```bash
gunzip trading-journal-20261014.sql.gz
psql "<production-database-url>" < trading-journal-20261014.sql
```

### R2 Chart Backups

R2 data is durable (99.999999999% durability) but consider:

**Lifecycle policy (optional):**
1. Cloudflare R2 → **Bucket settings** → **Lifecycle**
2. Archive old charts to cheaper storage after 1 year
3. Or sync to S3 Glacier for compliance

**Manual R2 sync:**

```bash
rclone sync r2:trade-charts /local/backup/charts
```

---

## Production Launch Checklist

### Pre-Launch

- [ ] Neon production database created
- [ ] Schema pushed to production (`npx drizzle-kit push`)
- [ ] R2 bucket created and configured
- [ ] Cloudflare Pages project created and connected to GitHub
- [ ] All environment variables set in Cloudflare Pages
- [ ] `nodejs_compat` flag enabled in Cloudflare Pages Functions
- [ ] Sentry project created and DSN configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate provisioned (automatic)
- [ ] Health check endpoint verified (`/api/health`)
- [ ] Test account created and basic flows verified:
  - [ ] Signup/login
  - [ ] Create account
  - [ ] Log trade
  - [ ] Upload chart
  - [ ] View dashboard/journal/heatmap

### Launch Day

- [ ] Monitor Cloudflare Pages build logs
- [ ] Monitor Sentry for errors
- [ ] Monitor Cloudflare Analytics for traffic
- [ ] Check health endpoint every 5 minutes
- [ ] Test user flows from different devices/browsers
- [ ] Monitor database query performance in Neon Console

### Post-Launch (Week 1)

- [ ] Review Sentry errors and fix critical issues
- [ ] Monitor database connection pool usage
- [ ] Check R2 bandwidth and storage costs
- [ ] Review Cloudflare Pages function invocations
- [ ] Collect user feedback
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Document any production-specific issues

---

## Rollback Procedures

### Application Rollback (Code Issues)

**Immediate rollback:**
1. Cloudflare Pages → **Deployments**
2. Find last working deployment
3. Click **"..."** → **Rollback to this deployment**
4. Confirm (takes effect immediately)

**Rollback via Git:**
1. `git revert <commit-hash>` or `git reset --hard <commit-hash>`
2. `git push --force origin main` (if using reset)
3. Cloudflare automatically redeploys

### Database Rollback (Schema Issues)

**If migration breaks the app:**

**Option 1: Point-in-time restore (Neon)**
1. Neon Console → **Backups** → **Restore**
2. Select timestamp before migration
3. Creates new branch
4. Update `DATABASE_URL` in Cloudflare Pages
5. Redeploy app

**Option 2: Manual schema revert**
1. `DATABASE_URL="<prod-url>" npx drizzle-kit drop` (drops last migration)
2. Manually revert `src/db/schema.ts` to previous state
3. `DATABASE_URL="<prod-url>" npx drizzle-kit push`
4. Git revert the schema change
5. Push to trigger redeploy

**Option 3: Restore from manual backup**
1. Download latest manual backup
2. `gunzip trading-journal-<date>.sql.gz`
3. `psql "<prod-url>" < trading-journal-<date>.sql`
4. Redeploy app

### R2 Rollback (Chart Issues)

R2 does not have built-in versioning. To recover deleted charts:
- Use manual backups (rclone sync)
- Or enable R2 Object Lock (future enhancement)

---

## Maintenance

### Regular Tasks

**Weekly:**
- [ ] Review Sentry error reports
- [ ] Check Cloudflare Analytics (traffic, errors)
- [ ] Monitor Neon query performance
- [ ] Run manual database backup

**Monthly:**
- [ ] Review R2 storage costs
- [ ] Check for dependency updates (`npm outdated`)
- [ ] Review user feedback and bug reports
- [ ] Database cleanup (old deleted_at rows if needed)

**Quarterly:**
- [ ] Security audit (update dependencies, review access logs)
- [ ] Performance review (optimize slow queries)
- [ ] Cost review (Neon, R2, Cloudflare)

### Dependency Updates

**Check for updates:**
```bash
npm outdated
```

**Update dependencies:**
```bash
npm update
npm audit fix
```

**Test locally:**
```bash
npm run build
npm run test
npm run pages:build
```

**Deploy:**
```bash
git commit -am "chore: update dependencies"
git push origin main
```

### Database Maintenance

**Check connection pool usage (Neon Console):**
- High connection count may indicate leaks
- Add connection limits in `@neondatabase/serverless` config

**Optimize slow queries:**
- Neon Console → **Monitoring** → **Query Insights**
- Add indexes for frequently queried columns
- Use `EXPLAIN ANALYZE` for slow queries

**Clean up old data (if needed):**
```sql
-- Delete soft-deleted trades older than 90 days
DELETE FROM trades WHERE deleted_at < NOW() - INTERVAL '90 days';
```

---

## Support & Resources

**Cloudflare Pages:**
- [Docs](https://developers.cloudflare.com/pages/)
- [Community](https://community.cloudflare.com/)
- [Status](https://www.cloudflarestatus.com/)

**Neon:**
- [Docs](https://neon.tech/docs)
- [Discord](https://discord.gg/neon)
- [Status](https://neonstatus.com/)

**Sentry:**
- [Docs](https://docs.sentry.io/)
- [Support](https://sentry.io/support/)

**Next.js:**
- [Docs](https://nextjs.org/docs)
- [GitHub Discussions](https://github.com/vercel/next.js/discussions)
