-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK(role IN ('traveller', 'business')),
    traveller_type TEXT DEFAULT 'normal' CHECK(traveller_type IN ('normal', 'vlogger')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create business profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    business_type TEXT NOT NULL CHECK(business_type IN ('agency', 'hotel')),
    business_name TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    website_url TEXT,
    booking_model TEXT NOT NULL CHECK(booking_model IN ('direct', 'redirect')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create password resets table
CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
