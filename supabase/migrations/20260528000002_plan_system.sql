-- Plan management: add plan tier and Stripe fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Track AI-generated documents separately from manual ones
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_generated boolean NOT NULL DEFAULT false;

-- Perf index for monthly AI quota checks (filters on project_id via app, or via join)
CREATE INDEX IF NOT EXISTS idx_documents_ai_generated
  ON documents (project_id, ai_generated, created_at)
  WHERE ai_generated = true;

-- RLS: users can only see/update their own plan info (stripe_customer_id is internal)
-- profiles already has RLS enabled — existing policies cover these new columns
