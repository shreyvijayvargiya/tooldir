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
