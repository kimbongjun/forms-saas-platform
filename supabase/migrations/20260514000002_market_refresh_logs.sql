-- Create market_refresh_logs table
CREATE TABLE IF NOT EXISTS market_refresh_logs (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by       text NOT NULL CHECK (triggered_by IN ('cron', 'admin')),
  articles_fetched   int  DEFAULT 0,
  articles_saved     int  DEFAULT 0,
  claude_tokens_used int  DEFAULT 0,
  status             text NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  error_detail       text,
  created_at         timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE market_refresh_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "authenticated_read" ON market_refresh_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "service_insert" ON market_refresh_logs
  FOR INSERT TO authenticated WITH CHECK (true);
