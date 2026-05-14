-- Add new columns to market_articles table
ALTER TABLE market_articles
  ADD COLUMN IF NOT EXISTS source_type       text,
  ADD COLUMN IF NOT EXISTS summary_ko        text,
  ADD COLUMN IF NOT EXISTS key_insight       text,
  ADD COLUMN IF NOT EXISTS source_name       text,
  ADD COLUMN IF NOT EXISTS thumbnail_url    text,
  ADD COLUMN IF NOT EXISTS credibility_score int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS priority_tier    text DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS tags              text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS fetched_at        timestamptz DEFAULT now();

-- Enable RLS
ALTER TABLE market_articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "authenticated_read" ON market_articles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "service_insert" ON market_articles
  FOR INSERT TO authenticated USING (true);
