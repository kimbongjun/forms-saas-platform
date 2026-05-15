-- geo_tech_snapshots: Tech·AEO 지표 수집 결과 저장
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS geo_tech_snapshots (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id     text        NOT NULL,
  schema_types text[]      NOT NULL DEFAULT '{}',
  faq_schema   boolean     NOT NULL DEFAULT false,
  eeeat_score  int         NOT NULL DEFAULT 0,
  lcp_ms       int         NOT NULL DEFAULT 0,
  cls          numeric(5,3) NOT NULL DEFAULT 0,
  mobile_score int         NOT NULL DEFAULT 0,
  https        boolean     NOT NULL DEFAULT false,
  sitemap      boolean     NOT NULL DEFAULT false,
  collected_at timestamptz NOT NULL DEFAULT now(),
  error        text
);

-- brand_id + 최신순 조회 인덱스
CREATE INDEX IF NOT EXISTS geo_tech_snapshots_brand_collected
  ON geo_tech_snapshots(brand_id, collected_at DESC);

-- RLS 활성화
ALTER TABLE geo_tech_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth users can read geo_tech_snapshots"
  ON geo_tech_snapshots FOR SELECT
  TO authenticated
  USING (true);
