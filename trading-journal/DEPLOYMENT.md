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
