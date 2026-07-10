-- ============================================
-- ToolDir — Supabase migrations
-- AI tool directory boilerplate
-- Run in the Supabase SQL editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Core directory tables
-- ============================================

CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    author TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    banner_image TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at);

CREATE TABLE IF NOT EXISTS directory_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    website TEXT NOT NULL,
    description TEXT,
    stars INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    listed_date DATE,
    country TEXT DEFAULT 'US',
    pricing TEXT,
    category TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    logo_url TEXT,
    screenshot_url TEXT,
    is_listed BOOLEAN NOT NULL DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_directory_tools_slug ON directory_tools(slug);
CREATE INDEX IF NOT EXISTS idx_directory_tools_is_listed ON directory_tools(is_listed);
CREATE INDEX IF NOT EXISTS idx_directory_tools_listed_date ON directory_tools(listed_date);

CREATE TABLE IF NOT EXISTS tool_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    website TEXT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    logo_url TEXT,
    screenshot_url TEXT,
    badge_verified BOOLEAN DEFAULT FALSE,
    launch_date DATE,
    slot_label TEXT,
    slot_price INTEGER DEFAULT 0,
    slot_is_paid BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'pending',
    directory_tool_id UUID REFERENCES directory_tools(id) ON DELETE SET NULL,
    submitter_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_submissions_status ON tool_submissions(status);
CREATE INDEX IF NOT EXISTS idx_tool_submissions_created_at ON tool_submissions(created_at);

CREATE TABLE IF NOT EXISTS pricing_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_date DATE UNIQUE NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    label TEXT NOT NULL,
    description TEXT,
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    perks TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Auth / admin / billing tables
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    display_name TEXT,
    provider TEXT,
    photo_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    last_sign_in TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT UNIQUE,
    email TEXT NOT NULL,
    name TEXT,
    plan_name TEXT,
    plan_id TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id TEXT UNIQUE,
    customer_id TEXT,
    email TEXT,
    amount INTEGER,
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL DEFAULT 'pending',
    plan_name TEXT,
    plan_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS checkouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checkout_id TEXT UNIQUE NOT NULL,
    plan_id TEXT,
    customer_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date TIMESTAMPTZ NOT NULL,
    due_date TIMESTAMPTZ,
    from_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    to_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    signature TEXT,
    status TEXT NOT NULL DEFAULT 'unpaid',
    client_type TEXT,
    client_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    replied BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fingerprint TEXT UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    country TEXT,
    country_code TEXT,
    city TEXT,
    region_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    timezone TEXT,
    isp TEXT,
    location_source TEXT,
    first_visit TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_visit TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visit_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_analytics_first_visit ON app_analytics(first_visit);
CREATE INDEX IF NOT EXISTS idx_app_analytics_last_visit ON app_analytics(last_visit);

-- ============================================
-- Storage bucket for blog / listing images
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'saas-starter-storage',
    'saas-starter-storage',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read blog storage" ON storage.objects;
CREATE POLICY "Public read blog storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'saas-starter-storage');

DROP POLICY IF EXISTS "Authenticated upload blog storage" ON storage.objects;
CREATE POLICY "Authenticated upload blog storage"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'saas-starter-storage');

DROP POLICY IF EXISTS "Authenticated update blog storage" ON storage.objects;
CREATE POLICY "Authenticated update blog storage"
ON storage.objects FOR UPDATE
USING (bucket_id = 'saas-starter-storage');

DROP POLICY IF EXISTS "Authenticated delete blog storage" ON storage.objects;
CREATE POLICY "Authenticated delete blog storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'saas-starter-storage');
