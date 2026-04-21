-- 채널 추가: 에펨코리아, 더쿠, 성예사
-- sc_mentions 채널 CHECK 제약 업데이트
ALTER TABLE sc_mentions DROP CONSTRAINT IF EXISTS sc_mentions_channel_check;
ALTER TABLE sc_mentions ADD CONSTRAINT sc_mentions_channel_check
  CHECK (channel IN (
    'naver_blog', 'naver_cafe', 'naver_news',
    'instagram', 'youtube', 'twitter', 'facebook',
    'dcinside', 'ppomppu', 'gangnam_unnie', 'babitalk',
    'fmkorea', 'theqoo', 'sungyesa'
  ));

-- sc_posts 채널 CHECK 제약 업데이트
ALTER TABLE sc_posts DROP CONSTRAINT IF EXISTS sc_posts_channel_check;
ALTER TABLE sc_posts ADD CONSTRAINT sc_posts_channel_check
  CHECK (channel IN (
    'naver_blog', 'naver_cafe', 'naver_news',
    'instagram', 'youtube', 'twitter', 'facebook',
    'dcinside', 'ppomppu', 'gangnam_unnie', 'babitalk',
    'fmkorea', 'theqoo', 'sungyesa'
  ));
