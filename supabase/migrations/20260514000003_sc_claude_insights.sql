-- Create sc_claude_insights table
CREATE TABLE IF NOT EXISTS sc_claude_insights (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id   uuid REFERENCES sc_keywords(id) ON DELETE CASCADE,
  keyword      text NOT NULL,
  insight_type text NOT NULL,
  payload      jsonb NOT NULL,
  token_used   int  DEFAULT 0,
  model        text DEFAULT 'claude-sonnet-4-6',
  generated_at timestamptz DEFAULT now(),
  expires_at   timestamptz NOT NULL
);

-- Enable RLS
ALTER TABLE sc_claude_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "authenticated_read" ON sc_claude_insights
  FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "authenticated_write" ON sc_claude_insights
  FOR ALL TO authenticated USING (true);
