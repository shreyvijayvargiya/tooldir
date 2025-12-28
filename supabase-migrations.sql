-- ============================================
-- Supabase Database Migration Script
-- SAAS starter CMS - Tables for blogs, emails, subscribers, and teams
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
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    banner_image TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);

-- ============================================
-- EMAILS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    recipients INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at DESC);

-- ============================================
-- SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed_at ON subscribers(subscribed_at DESC);

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'author', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_teams_email ON teams(email);
CREATE INDEX IF NOT EXISTS idx_teams_role ON teams(role);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at DESC);

-- ============================================
-- USERS TABLE (Optional - for user management)
-- Note: This table name conflicts with Supabase's auth.users, so RLS is disabled on it
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMP
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
DROP TRIGGER IF EXISTS update_blogs_updated_at ON blogs;
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_emails_updated_at ON emails;
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscribers_updated_at ON subscribers;
CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

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
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    plan_name TEXT,
    plan_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(email);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_email ON messages(email);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
CREATE INDEX IF NOT EXISTS idx_messages_replied ON messages(replied);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Apply triggers for new tables
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- NOTE: RLS is commented out by default to avoid "column email does not exist" errors
-- This error can occur due to conflicts with Supabase's auth.users table
-- 
-- To enable RLS, uncomment the section below AFTER running this migration successfully
-- You can also add RLS policies manually through the Supabase dashboard

/*
-- Drop existing policies first (for idempotency)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated users to read blogs" ON blogs;
    DROP POLICY IF EXISTS "Allow authenticated users to insert blogs" ON blogs;
    DROP POLICY IF EXISTS "Allow authenticated users to update blogs" ON blogs;
    DROP POLICY IF EXISTS "Allow authenticated users to delete blogs" ON blogs;
    
    DROP POLICY IF EXISTS "Allow authenticated users to read emails" ON emails;
    DROP POLICY IF EXISTS "Allow authenticated users to manage emails" ON emails;
    
    DROP POLICY IF EXISTS "Allow authenticated users to read subscribers" ON subscribers;
    DROP POLICY IF EXISTS "Allow authenticated users to manage subscribers" ON subscribers;
    
    DROP POLICY IF EXISTS "Allow authenticated users to read teams" ON teams;
    DROP POLICY IF EXISTS "Allow authenticated users to manage teams" ON teams;
    
    DROP POLICY IF EXISTS "Allow authenticated users to read customers" ON customers;
    DROP POLICY IF EXISTS "Allow authenticated users to manage customers" ON customers;
    
    DROP POLICY IF EXISTS "Allow authenticated users to read payments" ON payments;
    DROP POLICY IF EXISTS "Allow authenticated users to manage payments" ON payments;
    
    DROP POLICY IF EXISTS "Allow authenticated users to read messages" ON messages;
    DROP POLICY IF EXISTS "Allow authenticated users to manage messages" ON messages;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Enable RLS on all tables (skip users table to avoid conflicts with auth.users)
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read blogs"
    ON blogs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert blogs"
    ON blogs FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update blogs"
    ON blogs FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete blogs"
    ON blogs FOR DELETE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to read emails"
    ON emails FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to manage emails"
    ON emails FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read subscribers"
    ON subscribers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to manage subscribers"
    ON subscribers FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read teams"
    ON teams FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to manage teams"
    ON teams FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read customers"
    ON customers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to manage customers"
    ON customers FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read payments"
    ON payments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to manage payments"
    ON payments FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read messages"
    ON messages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to manage messages"
    ON messages FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
*/

-- ============================================
-- STORAGE BUCKET SETUP (for file uploads)
-- ============================================
-- Note: Run this in Supabase Dashboard > Storage or via Supabase CLI
-- 
-- Create storage bucket for saas-starter-storage
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('saas-starter-storage', 'saas-starter-storage', true);
--
-- Storage policies (adjust based on your needs)
-- CREATE POLICY "Allow authenticated users to upload files"
--     ON storage.objects FOR INSERT
--     TO authenticated
--     WITH CHECK (bucket_id = 'contento-storage');
--
-- CREATE POLICY "Allow public to read files"
--     ON storage.objects FOR SELECT
--     TO public
--     USING (bucket_id = 'contento-storage');
--
-- CREATE POLICY "Allow authenticated users to update files"
--     ON storage.objects FOR UPDATE
--     TO authenticated
--     USING (bucket_id = 'contento-storage');
--
-- CREATE POLICY "Allow authenticated users to delete files"
--     ON storage.objects FOR DELETE
--     TO authenticated
--     USING (bucket_id = 'contento-storage');

