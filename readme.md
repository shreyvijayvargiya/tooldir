# ToolDir — Full-Stack AI Tool Directory Boilerplate

**$89 USD** — A production-ready Next.js boilerplate to launch your own AI tool directory, accept paid listings, publish SEO-friendly blog content, and manage everything from a built-in admin panel.

Ship a polished directory site in days, not months.

## What's Included

### Public website
- **Home** — searchable tool directory with categories, stats, and featured listings
- **Tool detail pages** — `/tool/[slug]` with rich metadata
- **Submit flow** — multi-step tool submission form at `/submit`
- **Pricing** — launch calendar and paid placement slots at `/pricing`
- **Blog** — published posts from Supabase with React Query, markdown rendering, and per-post SEO (Open Graph, Twitter, canonical URLs)
- **Legal pages** — privacy, terms, contact
- **Sitemap & robots** — `/sitemap.xml` includes static routes plus the latest 5 published blog posts

### Admin panel (`/admin`)
- Analytics, users, submissions, payments, invoices
- **Blog CMS** — TipTap editor with slash commands, image upload to Supabase Storage, draft/publish workflow
- Nested routes: `/admin/blogs/new`, `/admin/blogs/[id]`
- Launch pricing slot management

### Backend & integrations
- **Supabase** — auth, Postgres, storage, RLS policies
- **Stripe** — checkout and webhooks for paid listings
- **Resend** — transactional email (optional)
- **React Query** — server-state for blogs and admin data
- **Redux** — client UI state

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (Pages Router) |
| UI | Tailwind CSS, shadcn/ui, Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| Payments | Stripe |
| Editor | TipTap + markdown export |
| Data fetching | TanStack React Query |

## Prerequisites

- Node.js 18+
- npm or yarn
- [Supabase](https://supabase.com) project
- [Stripe](https://stripe.com) account (for paid listings)
- Domain + `NEXT_PUBLIC_SITE_URL` for production SEO

## Quick Start

### 1. Install dependencies

```bash
git clone <your-repo-url>
cd buildsaas
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
# Site (required for canonical URLs, sitemap, OG tags)
NEXT_PUBLIC_SITE_URL=http://localhost:3002

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key

# Stripe (paid listings)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (optional)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@yourdomain.com
```

### 3. Database setup

Run the SQL in `supabase-migrations.sql` in your Supabase SQL editor. This creates:

- `directory_tools` — published tool listings
- `tool_submissions` — pending submissions from `/submit`
- `pricing_slots` — launch calendar slots
- `blogs` — blog posts (title, slug, markdown content, banner, status)
- Storage bucket `saas-starter-storage` with upload policies

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

### 5. Admin access

1. Sign in via Google on the marketing site or admin panel
2. Go to `/admin` to manage tools, submissions, blogs, and pricing

## Project Structure

```
app/
  admin/              # Admin shell, blog editor, dashboard tabs
  frontend/           # Navbar, Footer, directory UI
components/ui/        # shadcn components
lib/
  api/                # Supabase API helpers (blog, tools, submissions)
  hooks/useBlogs.js   # React Query hooks for blog pages
  utils/blogSeo.js    # Per-post SEO metadata helpers
pages/
  blog/               # Blog list + [slug] + id fallback
  tool/[slug].js      # Tool detail page
  submit.js           # Tool submission flow
  pricing.js          # Launch pricing calendar
  sitemap.xml.js      # Dynamic sitemap
  api/                # Stripe webhooks, uploads, submissions
supabase-migrations.sql
```

## Blog System

- **Admin**: create/edit posts in `/admin` → Blogs tab or `/admin/blogs/new`
- **Storage**: banner and inline images upload to Supabase Storage
- **Public**: `/blog` lists published posts; `/blog/[slug]` renders markdown with syntax highlighting
- **SEO**: each post gets title, description, canonical URL, `og:*`, `twitter:*`, and `article:*` tags via `lib/utils/blogSeo.js`
- **Sitemap**: latest 5 published posts are added automatically at `/sitemap.xml`

### React Query hooks

```js
import { usePublishedBlogs, useBlogBySlug } from "@/lib/hooks/useBlogs";

const { data: blogs } = usePublishedBlogs();
const { data: post } = useBlogBySlug("my-post-slug");
```

## Customization

1. **Branding** — update copy in `pages/index.js`, `app/frontend/Navbar.jsx`, and `lib/config/seo.js`
2. **Mock data** — seed tools in `lib/data/tools.js` or publish via admin/API
3. **Pricing** — edit slot tiers in `lib/data/pricing-slots.js` and Supabase `pricing_slots`
4. **Theme** — shadcn tokens in `tailwind.config.js` and `styles/globals.css`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 3002 |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |

For agent / codebase orientation, see `LLM.txt`.

## Deployment

Works on Vercel, Netlify, or any Node host.

1. Set all environment variables in your hosting dashboard
2. Point `NEXT_PUBLIC_SITE_URL` to your production domain
3. Configure Stripe webhook to `https://yourdomain.com/api/stripe/webhook`
4. Run Supabase migrations on your production project

## License

MIT — use commercially in unlimited projects after purchase.

---

Built for founders who want to launch an AI tool directory without building from scratch. Questions? Open an issue or contact support.
