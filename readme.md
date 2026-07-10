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
| Accounts | [Supabase](https://supabase.com) · [Stripe](https://stripe.com) · [Google Cloud](https://console.cloud.google.com) (OAuth) |

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

# Stripe — one-time launch-slot Checkout (price built in API via price_data)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Local testing: charge $0 and skip Stripe UI (still writes payments + marks submission paid)
STRIPE_TEST_ZERO=true
NEXT_PUBLIC_STRIPE_TEST_ZERO=true

# Optional — payment receipt email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@yourdomain.com
```

### 3. Database

In the Supabase SQL editor, paste and run **`supabase-migrations.sql`** once.  
That single file creates tables, payment columns, and the Storage bucket.

See [Database (Supabase) & migrations](#database-supabase--migrations) below.

### 4. Auth + run

1. Enable **Google** in Supabase Auth (see [Google authentication setup](#google-authentication-setup)).  
2. Start the app:

```bash
npm run dev
```

Open **[http://localhost:3002](http://localhost:3002)**.

Without Supabase data, the home directory can fall back to mock tools in `lib/data/tools.js`.

### 5. Admin

1. Sign in with Google  
2. Open `/admin` — analytics, users, submissions, payments, pricing slots, blogs  

---

## What’s included

### Public site

| Route | Purpose |
|-------|---------|
| `/` | Searchable directory, categories, stats, featured tools |
| `/tool/[slug]` | Tool detail + metadata |
| `/categories/[slug]` | Category filter |
| `/submit` | Multi-step tool submission + Stripe slot payment |
| `/pricing` | Launch calendar / paid placement slots |
| `/dashboard` | User’s own submissions |
| `/blog`, `/blog/[slug]` | Published blog + per-post SEO |
| `/contact`, `/privacy`, `/terms-and-conditions` | Legal / contact |
| `/sitemap.xml`, `/robots.txt` | SEO |

### Admin (`/admin`)

- Analytics, users, submissions (click tool name → details modal), payments, invoices  
- **Blog CMS** — TipTap editor, image upload to Supabase Storage, draft/publish  
- Nested editors: `/admin/blogs/new`, `/admin/blogs/[id]`  
- Pricing slot management  

### Integrations

- **Supabase** — Auth (Google OAuth), Postgres, Storage, RLS  
- **Stripe** — one-time Checkout; amount comes from the slot and is set in the API with `price_data` (no Stripe Price catalog required)  
- **Resend** — optional payment receipt after webhook  
- **React Query** — server state (blogs, tools, slots)  
- **Redux** — light client UI state  

---

## Stripe payments (how our code works)

ToolDir sells **one-time launch slots**, not SaaS subscriptions. There is no `/api/stripe/cancel-subscription`. Checkout builds the price on the server from the booked slot.

### Flow

```
/submit (paid slot)
  → POST /api/tool-submissions/create   (save pending submission)
  → POST /api/stripe/checkout           (create Checkout with price_data)
  → Stripe Checkout (or $0 test path)
  → POST /api/stripe/webhook            (checkout.session.completed)
       → tool_submissions.payment_status = paid
       → payments row (admin Payments tab)
       → customers + users upsert
       → Resend receipt (optional)
```

### Price in the API (`price_data`)

You do **not** need to create Products/Prices in the Stripe Dashboard for slots.  
`pages/api/stripe/checkout.js` accepts the slot amount and builds a one-time line item:

| Body field | Meaning |
|------------|---------|
| `submissionId` | Required — links payment to `tool_submissions.id` |
| `slotPrice` | Dollars (integer), e.g. `49` → Stripe `unit_amount: 4900` |
| `slotLabel` | Shown on the Checkout product name |
| `launchDate` | Optional date string in the product name |
| `userEmail` | Prefills Checkout email |

Example request (what `/submit` sends after creating a submission):

```js
await fetch("/api/stripe/checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    submissionId: "...",
    slotLabel: "Premium",
    slotPrice: 99,          // dollars → API converts to cents
    launchDate: "2026-07-15",
    userEmail: "founder@example.com",
  }),
});
```

Server-side (conceptually):

```js
mode: "payment",
line_items: [{
  price_data: {
    currency: "usd",
    unit_amount: slotPrice * 100,   // cents
    product_data: {
      name: `ToolDir ${slotLabel} — ${launchDate}`,
      description: "One-time launch slot on ToolDir",
    },
  },
  quantity: 1,
}],
metadata: { submissionId, slotLabel, slotPrice, type: "launch_slot" }
```

Slot dollar amounts themselves come from:

- Admin calendar → Supabase `pricing_slots`, or  
- Heuristics in `lib/data/pricing-slots.js` when a date has no DB row  

### Files

| File | Role |
|------|------|
| `pages/api/stripe/checkout.js` | Creates Checkout session with `price_data`; `$0` test path marks paid without Stripe |
| `pages/api/stripe/webhook.js` | Handles `checkout.session.completed` → DB + Resend |
| `lib/utils/getStripe.js` | Stripe SDK singleton (`STRIPE_SECRET_KEY`) |
| `lib/api/subscriptionEmails.js` | `sendSlotPaymentEmail` (Resend sample receipt) |
| `public/html/send-slot-payment-email.html` | Sample HTML template for the receipt |

### Test with $0 (no card)

```env
STRIPE_TEST_ZERO=true
NEXT_PUBLIC_STRIPE_TEST_ZERO=true
```

When enabled, checkout **skips Stripe**, writes a `$0` `payments` row, sets `payment_status: paid`, and redirects to the success URL. Turn both off for real charges.

### Local webhook (real Stripe amounts)

```bash
stripe listen --forward-to localhost:3002/api/stripe/webhook
```

Copy the `whsec_...` into `STRIPE_WEBHOOK_SECRET`. Production: Dashboard → Webhooks → `https://yourdomain.com/api/stripe/webhook` (event: `checkout.session.completed`).

### Admin

- **Submissions** — Payment column + details modal (click tool name)  
- **Payments** — rows from webhook / `$0` test path (`amount` stored in **cents**)  

---

## Database (Supabase) & migrations

### What to run

1. Open your project → **SQL Editor** → New query.  
2. Paste and run **`supabase-migrations.sql`** (one file — tables + payment columns + Storage).  
3. Wait a few seconds so PostgREST refreshes its schema cache (avoids `PGRST204` / missing column errors).

The file is idempotent (`IF NOT EXISTS` / `DROP POLICY IF EXISTS`) — safe to re-run.

### Tables created

| Table | Purpose |
|-------|---------|
| `directory_tools` | Published public listings |
| `tool_submissions` | `/submit` entries + `payment_status`, `payment_id`, Stripe session ids |
| `pricing_slots` | Per-date launch prices (admin calendar) |
| `blogs` | Blog CMS |
| `users` | App user profiles (also upserted after payment) |
| `customers` | Stripe/customer linkage for admin |
| `payments` | Payment history (admin Payments tab; **amount in cents**) |
| `checkouts` | Checkout session tracking |
| `invoices` | Manual invoices (admin) |
| `messages` | Contact form |
| `app_analytics` | Visit analytics |

Storage bucket **`saas-starter-storage`** is created in the same migration — see [Supabase Storage](#supabase-storage-blog--tiptap-images).

### Env for Supabase

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_KEY` | Project Settings → API → `anon` `public` key |

Client: `lib/config/supabase.js`.

---

## Supabase Storage (blog & TipTap images)

All blog banners and TipTap inline images upload to one public bucket.

| | |
|--|--|
| **Bucket name** | `saas-starter-storage` |
| **Created by** | `supabase-migrations.sql` (section 4) |
| **Code** | `lib/api/storage.js` (`STORAGE_BUCKET`) |
| **API fallback** | `POST /api/storage/upload-image` |

### Folder layout inside the bucket

```
saas-starter-storage/
  blogs/
    banners/                 # banner before post has an id
    content/                 # TipTap inline images (new post)
    {blogId}/
      banner-….png           # post banner
      content/….png          # TipTap images for that post
```

### How TipTap uploads work

1. In `/admin/blogs/new` or `/admin/blogs/[id]`, use the image command / toolbar in TipTap.  
2. `uploadBlogEditorImage()` (`lib/api/storage.js`) uploads the file to **`saas-starter-storage`**.  
3. On success, TipTap inserts an `<img src="https://….supabase.co/storage/v1/object/public/saas-starter-storage/...">`.  
4. If the direct client upload fails (RLS), it retries via `/api/storage/upload-image`.  
5. On **Save**, `uploadBlogImages()` also rewrites any leftover base64 images in content and uploads the banner.

Editors wired to Storage:

- `app/admin/components/BlogTiptapEditor.jsx` (nested blog routes)  
- `app/admin/components/TiptapEditor.jsx` (Blog tab modal)  

### Setup checklist

1. Run **`supabase-migrations.sql`** once (includes bucket + policies).  
2. In Supabase → **Storage**, confirm bucket **`saas-starter-storage`** exists and is **Public**.  
3. Set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_KEY` in `.env.local`.  
4. Insert an image in TipTap — toast should say “Image uploaded to Supabase Storage”.

Public URL shape:

```
https://<project-ref>.supabase.co/storage/v1/object/public/saas-starter-storage/blogs/...
```

---

## Resend email (payment receipts)

Resend is **optional**. Without it, Stripe checkout and webhooks still work — buyers just won’t get an email receipt.

### How it works in this codebase

1. Stripe webhook (`pages/api/stripe/webhook.js`) finishes updating the DB.  
2. It calls `sendSlotPaymentEmail()` in `lib/api/subscriptionEmails.js`.  
3. That function builds HTML inline (same layout as the sample file) and sends via the Resend SDK.  
4. If `RESEND_API_KEY` is missing, the send is skipped (logged as a warning) — payments are not blocked.

| File | Role |
|------|------|
| `lib/api/subscriptionEmails.js` | Live sender — `sendSlotPaymentEmail` |
| `public/html/send-slot-payment-email.html` | **Sample HTML template** (placeholders like `{{customerName}}`, `{{amount}}`) for design reference / copy-paste into Resend’s dashboard if you prefer |

> Older `public/html/send-subscription-*.html` files are leftovers from subscription SaaS — ToolDir uses the **slot payment** template only.

### Get a Resend API key

1. Create an account at [resend.com](https://resend.com).  
2. Open **API Keys** → **Create API Key** → copy `re_...`.  
3. (Recommended for production) **Domains** → add your domain → add the DNS records Resend shows → wait until verified.  
4. Until a domain is verified, you can usually send only to your own signup email (Resend test mode).

### Env vars

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@yourdomain.com
```

- `RESEND_FROM_EMAIL` must use a **verified** domain in production (e.g. `ToolDir <hello@yourdomain.com>` or `hello@yourdomain.com`).  
- Default fallback in code: `hello@tooldir.app` — replace this with your domain before launch.

### Customize the email

- Edit the HTML string inside `sendSlotPaymentEmail` in `lib/api/subscriptionEmails.js`, **or**  
- Use `public/html/send-slot-payment-email.html` as a visual reference and mirror changes into the JS template.  
- Placeholders in the sample HTML: `{{customerName}}`, `{{toolName}}`, `{{slotLabel}}`, `{{launchDate}}`, `{{amount}}`, `{{paymentId}}`.

---

## Google authentication setup

ToolDir uses **Supabase Auth + Google OAuth**. Sign-in is implemented in `lib/api/auth.js` (`signInWithGoogle` → `/auth/callback`).

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create or select a project.  
2. **APIs & Services → OAuth consent screen** — configure app name, support email, and add your domain (for local, testing users are enough).  
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**.  
4. Application type: **Web application**.  
5. **Authorized JavaScript origins**  
   - `http://localhost:3002`  
   - `https://yourdomain.com` (production)  
6. **Authorized redirect URIs** — use the Supabase callback (not your Next.js URL):

```
https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
```

Find the exact URI under Supabase → **Authentication → Providers → Google** (shown as “Callback URL”).

7. Copy the **Client ID** and **Client Secret**.

### 2. Supabase Dashboard

1. Open your project → **Authentication → Providers → Google**.  
2. Enable Google.  
3. Paste **Client ID** and **Client Secret** from Google Cloud.  
4. Save.  
5. **Authentication → URL Configuration**  
   - **Site URL**: `http://localhost:3002` (prod: your domain)  
   - **Redirect URLs**: add  
     - `http://localhost:3002/auth/callback`  
     - `https://yourdomain.com/auth/callback`  

### 3. App

No extra Google env vars in Next.js — the browser talks to Supabase, and Supabase talks to Google.

1. Restart `npm run dev`.  
2. Use **Continue with Google** on the site or `/admin`.  
3. After consent, Google → Supabase → `/auth/callback` → session cookie for admin and dashboard.

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

supabase-migrations.sql   ← single SQL setup file
```

### Data flow

1. **Public reads** — React Query hooks (`lib/hooks/*`) call `lib/api/*` → Supabase.  
2. **Mutations** — browser or admin hits `pages/api/*` (publish submission, upload image, Stripe checkout).  
3. **Auth** — Supabase Google OAuth; session available site-wide and in `/admin`.  
4. **Payments** — slot price → Checkout `price_data` → webhook updates submission / payments / users.  

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
app/admin/components/{SubmissionsTab,PricingSlotsTab,BlogTab,BlogTiptapEditor}.jsx
```

Storage: bucket **`saas-starter-storage`** via `lib/api/storage.js` (`uploadBlogEditorImage` for TipTap).

---

## Tech stack

| Layer | Choice | Notes |
|-------|--------|--------|
| Runtime | **Node.js 18.18+** (prefer **20 LTS**) | Required by Next.js 15 |
| Framework | **Next.js 15** | Pages Router only (`pages/`) |
| UI | React 18, Tailwind CSS 3, shadcn/ui, Framer Motion | Theme tokens in `styles/globals.css` |
| Auth + DB + files | Supabase (Auth, Postgres, Storage) | Google OAuth; anon key in env |
| Server state | TanStack React Query v5 | Blogs, directory tools, pricing slots |
| Client state | Redux Toolkit + persist | Light client UI |
| CMS editor | TipTap + markdown | Blog admin |
| Payments | Stripe Checkout `mode: "payment"` | Price via `price_data` in API |
| Email | Resend (optional) | Slot payment receipt |
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
3. **Pricing tiers** — `lib/data/pricing-slots.js` + Supabase `pricing_slots` (fed into Checkout `slotPrice`)  
4. **Theme** — `tailwind.config.js`, `styles/globals.css`  

Agent-oriented codebase map: see **`LLM.txt`**.

---

## Deploy on Vercel

ToolDir is a **Next.js 15 Pages Router** app. Vercel is the simplest host. Use **Node.js 20** (Project Settings → General → Node.js Version).

### 1. Push the repo

```bash
git init   # if needed
git add .
git commit -m "Launch ToolDir"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

Or import the unzipped template folder into a new GitHub repo, then connect it in Vercel.

### 2. Create the Vercel project

1. Go to [vercel.com](https://vercel.com) → **Add New…** → **Project**.  
2. Import your GitHub/GitLab/Bitbucket repo.  
3. Framework Preset: **Next.js** (auto-detected).  
4. Root Directory: `.` (repo root).  
5. Build Command: `next build` (default).  
6. Output: leave default (Vercel handles Next.js).  
7. **Do not** deploy yet — add env vars first (or add them and redeploy).

### 3. Environment variables (Vercel → Settings → Environment Variables)

Add these for **Production** (and Preview if you want staging):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` (no trailing slash) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_KEY` | Supabase `anon` `public` key |
| `STRIPE_SECRET_KEY` | `sk_live_...` (or `sk_test_...` for a staging project) |
| `STRIPE_WEBHOOK_SECRET` | From the **production** Stripe webhook endpoint |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Matching `pk_live_...` / `pk_test_...` |
| `STRIPE_TEST_ZERO` | **`false`** in production (omit or set false) |
| `NEXT_PUBLIC_STRIPE_TEST_ZERO` | **`false`** in production |
| `RESEND_API_KEY` | Optional — `re_...` |
| `RESEND_FROM_EMAIL` | Optional — verified sender |

After saving env vars, trigger a **Redeploy**.

### 4. Supabase (production)

1. Run **`supabase-migrations.sql`** on your production Supabase project (SQL Editor).  
2. **Authentication → URL Configuration**  
   - Site URL: `https://yourdomain.com`  
   - Redirect URLs: `https://yourdomain.com/auth/callback`  
3. Google OAuth: add `https://yourdomain.com` to Authorized JavaScript origins and keep the Supabase callback URI in Google Cloud.

### 5. Stripe webhook (production)

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.  
2. URL: `https://yourdomain.com/api/stripe/webhook`  
3. Event: at least `checkout.session.completed` (also async payment events if you use them).  
4. Copy the signing secret → `STRIPE_WEBHOOK_SECRET` on Vercel → redeploy.

Local tip: `stripe listen --forward-to localhost:3002/api/stripe/webhook` only for local; production must use the Dashboard endpoint.

### 6. Domain

1. Vercel → Project → **Settings → Domains** → add `yourdomain.com` / `www`.  
2. Point DNS as Vercel instructs (A/CNAME).  
3. Keep `NEXT_PUBLIC_SITE_URL` in sync with the canonical domain (affects SEO, sitemap, OG, Stripe redirects).

### 7. Post-deploy checklist

- [ ] `/` loads and tools list (or mock fallback)  
- [ ] Google sign-in → `/auth/callback` → session works on `/admin`  
- [ ] TipTap image upload lands in Storage bucket `saas-starter-storage`  
- [ ] Paid `/submit` opens Stripe Checkout (not `$0` test mode)  
- [ ] After payment, admin **Submissions** shows Paid and **Payments** has a row  
- [ ] (Optional) Resend receipt arrives when `RESEND_API_KEY` is set  

### Other hosts

Netlify or any Node host also work: set the same env vars, Node **20**, run `npm run build` + `npm start`, and point the Stripe webhook at `/api/stripe/webhook`.

---

## License

MIT — use commercially in unlimited projects after purchase.

---

Built for founders who want an AI tool directory without starting from scratch. Questions? Open an issue or contact support.
