# ToolDir — AI Tool Directory Boilerplate

**$89 USD** — Production-ready Next.js template to launch an AI tool directory: searchable listings, paid launch slots, SEO blog, submissions, and a full admin panel.

Ship a polished directory site in days, not months.

---

## Quick start (5 steps)

### Requirements

| Tool | Version |
|------|---------|
| **Node.js** | **18.18+** (recommended: **20 LTS**) |
| npm | 9+ (comes with Node) |
| Accounts | [Supabase](https://supabase.com) · [Stripe](https://stripe.com) (paid listings) |

> Next.js 15 does **not** support Node 16 or earlier. Node 20 LTS is the safest choice for local and CI.

### 1. Install

```bash
git clone <your-repo-url>
cd buildsaas
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3002

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@yourdomain.com
```

### 3. Database

In the Supabase SQL editor, run **`supabase-migrations.sql`**. This creates:

- `directory_tools` — published listings  
- `tool_submissions` — pending `/submit` entries  
- `pricing_slots` — launch calendar  
- `blogs` — CMS posts  
- Storage bucket `saas-starter-storage` + upload policies  
- Billing helpers (`users`, `customers`, `payments`, `invoices`, …)

### 4. Run

```bash
npm run dev
```

Open **[http://localhost:3002](http://localhost:3002)**.

Without Supabase data, the home directory can fall back to mock tools in `lib/data/tools.js`.

### 5. Admin

1. Sign in with Google (Supabase Auth)  
2. Open `/admin` — analytics, users, submissions, payments, pricing slots, blogs  

---

## What’s included

### Public site

| Route | Purpose |
|-------|---------|
| `/` | Searchable directory, categories, stats, featured tools |
| `/tool/[slug]` | Tool detail + metadata |
| `/categories/[slug]` | Category filter |
| `/submit` | Multi-step tool submission |
| `/pricing` | Launch calendar / paid placement slots |
| `/dashboard` | User’s own submissions |
| `/blog`, `/blog/[slug]` | Published blog + per-post SEO |
| `/contact`, `/privacy`, `/terms-and-conditions` | Legal / contact |
| `/sitemap.xml`, `/robots.txt` | SEO |

### Admin (`/admin`)

- Analytics, users, submissions, payments, invoices  
- **Blog CMS** — TipTap editor, image upload to Supabase Storage, draft/publish  
- Nested editors: `/admin/blogs/new`, `/admin/blogs/[id]`  
- Pricing slot management  

### Integrations

- **Supabase** — Auth (Google OAuth), Postgres, Storage, RLS  
- **Stripe** — Checkout + webhooks for paid listings / billing  
- **Resend** — optional transactional email  
- **React Query** — server state (blogs, tools, slots)  
- **Redux** — light client UI / subscription state  

---

## Architecture

ToolDir uses the **Next.js Pages Router**. Important: the `app/` folder is **not** the App Router.

```
pages/                  ← Real routes + API handlers (add pages here)
  index.js              Home directory
  tool/[slug].js
  submit.js, pricing.js, blog/, …
  admin/                Admin page entrypoints
  api/                  Stripe, submissions, uploads, directory tools

app/
  frontend/             Marketing UI (Navbar, Footer, directory components)
  admin/                Admin shell, tabs, TipTap blog editor

components/ui/          shadcn/ui primitives
lib/
  api/                  Supabase helpers (blog, tools, submissions, auth, …)
  hooks/                React Query hooks
  data/                 Mock seeds (tools, pricing-slots, testimonials)
  config/               SEO, Supabase client
  store/                Redux
  utils/                SEO helpers, dates, cookies

supabase-migrations.sql
```

### Data flow

1. **Public reads** — React Query hooks (`lib/hooks/*`) call `lib/api/*` → Supabase.  
2. **Mutations** — browser or admin hits `pages/api/*` (publish submission, upload image, Stripe checkout).  
3. **Auth** — Supabase Google OAuth; session available site-wide and in `/admin`.  
4. **Payments** — Stripe Checkout → webhook updates customers/payments; optional Resend email.  

### Core modules (keep these)

```
lib/api/directoryTools.js
lib/api/toolSubmissions.js
lib/api/pricingSlots.js
lib/api/blog.js
lib/api/storage.js
lib/hooks/useDirectoryTools.js
lib/hooks/useBlogs.js
lib/hooks/usePricingSlots.js
app/frontend/marketing/*
app/admin/components/{SubmissionsTab,PricingSlotsTab,BlogTab}.jsx
```

---

## Tech stack

| Layer | Choice | Notes |
|-------|--------|--------|
| Runtime | **Node.js 18.18+** (prefer **20 LTS**) | Required by Next.js 15 |
| Framework | **Next.js 15** | Pages Router only (`pages/`) |
| UI | React 18, Tailwind CSS 3, shadcn/ui, Framer Motion | Theme tokens in `styles/globals.css` |
| Auth + DB + files | Supabase (Auth, Postgres, Storage) | Anon key in env; RLS in migrations |
| Server state | TanStack React Query v5 | Blogs, directory tools, pricing slots |
| Client state | Redux Toolkit + persist | Subscription / customer UI |
| CMS editor | TipTap + markdown | Blog admin |
| Payments | Stripe | Checkout + webhook APIs |
| Email | Resend (optional) | Receipts / transactional |
| Search (UI) | Fuse.js | Client-side command search |
| Analytics | PostHog (optional) | Env keys in `.env.example` |

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on **port 3002** |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run lint` | Next.js ESLint |
| `npm run pack` | Buyer zip → `dist/tooldir.zip` (no `.env`, `node_modules`, `.next`, `.git`) |

---

## Customize

1. **Branding** — `pages/index.js`, `app/frontend/Navbar.jsx`, `lib/config/seo.js`  
2. **Seed tools** — `lib/data/tools.js`, or `/api/directory-tools/seed`, or publish via admin  
3. **Pricing tiers** — `lib/data/pricing-slots.js` + Supabase `pricing_slots`  
4. **Theme** — `tailwind.config.js`, `styles/globals.css`  

Agent-oriented codebase map: see **`LLM.txt`**.

---

## Deploy

Works on Vercel, Netlify, or any Node host (use Node **20** in the project settings).

1. Set the same env vars in the host dashboard  
2. Set `NEXT_PUBLIC_SITE_URL` to your production domain  
3. Stripe webhook → `https://yourdomain.com/api/stripe/webhook`  
4. Run `supabase-migrations.sql` on the production Supabase project  

---

## License

MIT — use commercially in unlimited projects after purchase.

---

Built for founders who want an AI tool directory without starting from scratch. Questions? Open an issue or contact support.
