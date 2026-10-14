# Finance Hub Portal

The single entry point for Trading Journal and Budget Tracker applications.

## Stack

- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v4
- Motion (Framer Motion)
- Cloudflare Pages

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run pages:build
```

Output: `.vercel/output/static`

## Preview

```bash
npm run pages:preview
```

## Deployment (Cloudflare Pages)

### Build Settings

- Framework preset: **Next.js**
- Build command: `npm run pages:build`
- Build output directory: `.vercel/output/static`
- Root directory: `portal` (if monorepo)

### Environment Variables

```
NODE_VERSION=22
```

### Compatibility Flags

- `nodejs_compat`

### DNS Configuration

1. Add CNAME record: `yourdomain.com` → `portal-project.pages.dev`
2. SSL mode: **Full (strict)**
3. Always use HTTPS: **On**

## Project Structure

```
portal/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       └── project-cube.tsx
├── public/
│   ├── trading-preview.svg
│   ├── budget-preview.svg
│   └── favicon.svg
└── package.json
```

## Design System

Inherited from Trading Journal:

- Background: `#09090b` (deep zinc)
- Foreground: `#fafafa`
- Muted: `#71717a`
- Card: `#121214`
- Emerald accent: `#10b981`
- Blue accent: `#3b82f6`

## Accessibility

- Proper ARIA labels on interactive elements
- Focus rings on all clickable items
- Respects `prefers-reduced-motion`
- Keyboard navigable
- Semantic HTML structure

## Before Launch

1. Replace `/trading-preview.svg` and `/budget-preview.svg` with real screenshots
2. Update domain references from `yourdomain.com` to your actual domain
3. Test on mobile devices (aspect ratio remains square)
4. Verify focus states with keyboard navigation
5. Test with screen reader
