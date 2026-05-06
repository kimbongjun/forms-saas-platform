CREATE TABLE IF NOT EXISTS social_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('meta_instagram')),
  status text NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'error', 'revoked')),
  facebook_user_id text,
  facebook_page_id text,
  facebook_page_name text,
  instagram_business_account_id text,
  instagram_username text,
  access_token text,
  token_expires_at timestamptz,
  scopes text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

ALTER TABLE social_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_own_social_integrations_select"
ON social_integrations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "auth_own_social_integrations_insert"
ON social_integrations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "auth_own_social_integrations_update"
ON social_integrations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "auth_own_social_integrations_delete"
ON social_integrations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_social_integrations_user_provider
  ON social_integrations (user_id, provider);
