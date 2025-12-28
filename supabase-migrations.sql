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
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Note: Adjust these policies based on your authentication requirements

-- Enable RLS on all tables
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust based on your needs)
-- Allow authenticated users to read all blogs
CREATE POLICY "Allow authenticated users to read blogs"
    ON blogs FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert blogs
CREATE POLICY "Allow authenticated users to insert blogs"
    ON blogs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update blogs
CREATE POLICY "Allow authenticated users to update blogs"
    ON blogs FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete blogs
CREATE POLICY "Allow authenticated users to delete blogs"
    ON blogs FOR DELETE
    TO authenticated
    USING (true);

-- Similar policies for emails
CREATE POLICY "Allow authenticated users to read emails"
    ON emails FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to manage emails"
    ON emails FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Similar policies for subscribers
CREATE POLICY "Allow authenticated users to read subscribers"
    ON subscribers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to manage subscribers"
    ON subscribers FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Similar policies for teams
CREATE POLICY "Allow authenticated users to read teams"
    ON teams FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to manage teams"
    ON teams FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Similar policies for users
CREATE POLICY "Allow authenticated users to read users"
    ON users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to manage users"
    ON users FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

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

