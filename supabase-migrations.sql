-- ============================================
-- Supabase Database Migration Script
-- SAAS starter CMS - Simple table structures
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BLOGS TABLE
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

-- ============================================
-- EMAILS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    recipients INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- USERS TABLE
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

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
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

-- ============================================
-- PAYMENTS TABLE
-- ============================================
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

-- ============================================
-- MESSAGES TABLE
-- ============================================
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

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    polar_product_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    banner_images JSONB DEFAULT '[]'::jsonb,
    media_file_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    prices JSONB DEFAULT '[]'::jsonb,
    checkout_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on polar_product_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_polar_product_id ON products(polar_product_id);

-- ============================================
-- REPORT ISSUES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS report_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    username TEXT,
    issue TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- WAITLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INVOICES TABLE
-- ============================================
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

-- Create index on invoice_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'task',
    status TEXT NOT NULL DEFAULT 'backlog',
    priority TEXT NOT NULL DEFAULT 'Medium',
    progress INTEGER DEFAULT 0,
    assignees TEXT[] DEFAULT ARRAY[]::TEXT[],
    attachments INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- ============================================
-- IDEA DATABASE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS idea_database (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    mark_as_task BOOLEAN NOT NULL DEFAULT FALSE,
    task_id UUID,
    task_status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_idea_database_created_at ON idea_database(created_at);
CREATE INDEX IF NOT EXISTS idx_idea_database_mark_as_task ON idea_database(mark_as_task);
CREATE INDEX IF NOT EXISTS idx_idea_database_task_id ON idea_database(task_id);

-- ============================================
-- FORMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    form_slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms(created_at);
CREATE INDEX IF NOT EXISTS idx_forms_form_slug ON forms(form_slug);
CREATE INDEX IF NOT EXISTS idx_forms_is_published ON forms(is_published);

-- ============================================
-- FORM SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at);

-- ============================================
-- APP ANALYTICS TABLE
-- ============================================
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
-- CHANGELOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS changelog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    categories TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_changelog_date ON changelog(date);

-- ============================================
-- CRON JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cron_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL, -- 'blog' | 'email'
    item_id UUID NOT NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled' | 'completed' | 'failed' | 'cancelled'
    item_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    error TEXT,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent duplicate CRON jobs per item
CREATE UNIQUE INDEX IF NOT EXISTS uniq_cron_jobs_type_item_id ON cron_jobs(type, item_id);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cron_jobs_scheduled_date ON cron_jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_type_scheduled_date ON cron_jobs(type, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_status ON cron_jobs(status);

-- ============================================
-- ASSETS TABLE (Supabase Storage metadata)
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_id UUID UNIQUE NOT NULL,
    type TEXT,
    size BIGINT,
    original_size BIGINT,
    url TEXT,
    bucket TEXT NOT NULL DEFAULT 'saas-starter-storage',
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at);
CREATE INDEX IF NOT EXISTS idx_assets_file_id ON assets(file_id);
