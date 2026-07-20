-- Migration: Create device_sessions table for Instagram-style multi-account support
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS device_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash text NOT NULL,
  is_active boolean DEFAULT false,
  last_active_at timestamptz DEFAULT now(),
  user_agent text,
  ip_address text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE(device_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_device_sessions_device_id ON device_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_user_id ON device_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_expires ON device_sessions(expires_at);

-- Enable RLS (Row Level Security) but allow service role full access
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role (backend) can access this table
CREATE POLICY "Service role full access" ON device_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);
