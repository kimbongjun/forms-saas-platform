-- GEO/AEO 커뮤니티 콘텐츠 캐시 (네이버 블로그·뉴스 결과 저장)
create table if not exists geo_community_cache (
  id             uuid primary key default gen_random_uuid(),
  brand_id       text not null,
  source_type    text not null check (source_type in ('naver_blog', 'naver_news')),
  title          text not null,
  url            text not null,
  description    text,
  author         text,
  published_at   date,
  refreshed_at   timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

create index if not exists idx_geo_community_brand_source
  on geo_community_cache (brand_id, source_type);

create index if not exists idx_geo_community_published
  on geo_community_cache (brand_id, published_at desc);

-- GEO 점수 일별 스냅샷 (시계열 트렌드 차트용)
create table if not exists geo_score_snapshots (
  id                uuid primary key default gen_random_uuid(),
  brand_id          text not null,
  snapshot_date     date not null,
  geo_score         int,
  tech_score        int,
  authority_score   int,
  aeo_score         int,
  community_score   int,
  media_score       int,
  created_at        timestamptz not null default now(),
  constraint uq_geo_snapshot unique (brand_id, snapshot_date)
);

create index if not exists idx_geo_snapshots_brand_date
  on geo_score_snapshots (brand_id, snapshot_date desc);

-- RLS: 로그인 사용자는 읽기 가능
alter table geo_community_cache enable row level security;
alter table geo_score_snapshots  enable row level security;

create policy "authenticated read geo_community_cache"
  on geo_community_cache for select
  to authenticated using (true);

create policy "authenticated read geo_score_snapshots"
  on geo_score_snapshots for select
  to authenticated using (true);

-- service role 전체 허용 (cron jobs)
create policy "service role full access geo_community_cache"
  on geo_community_cache for all
  to service_role using (true);

create policy "service role full access geo_score_snapshots"
  on geo_score_snapshots for all
  to service_role using (true);
