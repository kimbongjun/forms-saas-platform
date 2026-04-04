-- =========================================================
-- 운영 데이터 정리 SQL (안전 버전)
-- 목적:
-- 1) 대시보드/프로젝트 목록 불일치 원인이 되는 과거 데이터 정리
-- 2) 고아(child) 프로젝트/빈 프로젝트 정리
-- 3) 레거시 단독 폼 프로젝트를 운영 목록에서 제외(is_published=false)
--
-- 실행 전 권장:
-- - Supabase SQL Editor에서 실행
-- - 트랜잭션 단위 실행 후 결과 row count 확인
-- =========================================================

begin;

-- ---------------------------------------------------------
-- 0) 백업 테이블 생성 (최초 1회)
-- ---------------------------------------------------------
create table if not exists maintenance_backup_orphan_projects as
select * from projects where false;

create table if not exists maintenance_backup_deleted_projects as
select * from projects where false;

create table if not exists maintenance_backup_legacy_projects as
select * from projects where false;

-- ---------------------------------------------------------
-- 1) 부모 없는 child 프로젝트 정리
-- - 기존: workspace_project_id가 있는데 부모 row가 없음
-- - 처리: 우선 백업 후 workspace_project_id를 null로 복구
-- ---------------------------------------------------------
with orphan_children as (
  select child.*
  from projects child
  left join projects parent on parent.id = child.workspace_project_id
  where child.workspace_project_id is not null
    and parent.id is null
)
insert into maintenance_backup_orphan_projects
select *
from orphan_children
where id not in (select id from maintenance_backup_orphan_projects);

update projects p
set workspace_project_id = null
where p.workspace_project_id is not null
  and not exists (
    select 1
    from projects parent
    where parent.id = p.workspace_project_id
  );

-- ---------------------------------------------------------
-- 2) 오래된 빈 프로젝트 삭제
-- 조건:
-- - 180일 이전 생성
-- - 연결 데이터(폼필드/응답/멤버/이슈/마일스톤/태스크) 없음
-- ---------------------------------------------------------
with empty_candidates as (
  select p.*
  from projects p
  where p.created_at < now() - interval '180 days'
    and not exists (select 1 from form_fields f where f.project_id = p.id)
    and not exists (select 1 from submissions s where s.project_id = p.id)
    and not exists (select 1 from project_members m where m.project_id = p.id)
    and not exists (select 1 from project_issues i where i.project_id = p.id)
    and not exists (select 1 from project_milestones ms where ms.project_id = p.id)
    and not exists (select 1 from project_tasks t where t.project_id = p.id)
)
insert into maintenance_backup_deleted_projects
select *
from empty_candidates
where id not in (select id from maintenance_backup_deleted_projects);

delete from projects p
where p.id in (
  select c.id
  from (
    select p.id
    from projects p
    where p.created_at < now() - interval '180 days'
      and not exists (select 1 from form_fields f where f.project_id = p.id)
      and not exists (select 1 from submissions s where s.project_id = p.id)
      and not exists (select 1 from project_members m where m.project_id = p.id)
      and not exists (select 1 from project_issues i where i.project_id = p.id)
      and not exists (select 1 from project_milestones ms where ms.project_id = p.id)
      and not exists (select 1 from project_tasks t where t.project_id = p.id)
  ) c
);

-- ---------------------------------------------------------
-- 3) 레거시 단독 폼 프로젝트 비공개 처리
-- 조건(운영 워크스페이스 프로젝트가 아닌 레거시 추정):
-- - workspace_project_id is null
-- - 폼필드 존재
-- - 팀/이슈/마일스톤/태스크 없음
-- - 카테고리/기간/국가/예산/행사장 메타가 모두 없음
-- - 120일 이상 된 데이터
-- 처리:
-- - 백업
-- - is_published=false
-- ---------------------------------------------------------
with legacy_candidates as (
  select p.*
  from projects p
  where p.workspace_project_id is null
    and p.created_at < now() - interval '120 days'
    and exists (select 1 from form_fields f where f.project_id = p.id)
    and not exists (select 1 from project_members m where m.project_id = p.id)
    and not exists (select 1 from project_issues i where i.project_id = p.id)
    and not exists (select 1 from project_milestones ms where ms.project_id = p.id)
    and not exists (select 1 from project_tasks t where t.project_id = p.id)
    and coalesce(nullif(trim(p.category), ''), '') = ''
    and p.start_date is null
    and p.end_date is null
    and p.budget is null
    and coalesce(nullif(trim(p.country), ''), '') = ''
    and coalesce(nullif(trim(p.venue_name), ''), '') = ''
    and coalesce(nullif(trim(p.venue_map_url), ''), '') = ''
)
insert into maintenance_backup_legacy_projects
select *
from legacy_candidates
where id not in (select id from maintenance_backup_legacy_projects);

update projects p
set is_published = false
where p.id in (
  select c.id
  from (
    select p.id
    from projects p
    where p.workspace_project_id is null
      and p.created_at < now() - interval '120 days'
      and exists (select 1 from form_fields f where f.project_id = p.id)
      and not exists (select 1 from project_members m where m.project_id = p.id)
      and not exists (select 1 from project_issues i where i.project_id = p.id)
      and not exists (select 1 from project_milestones ms where ms.project_id = p.id)
      and not exists (select 1 from project_tasks t where t.project_id = p.id)
      and coalesce(nullif(trim(p.category), ''), '') = ''
      and p.start_date is null
      and p.end_date is null
      and p.budget is null
      and coalesce(nullif(trim(p.country), ''), '') = ''
      and coalesce(nullif(trim(p.venue_name), ''), '') = ''
      and coalesce(nullif(trim(p.venue_map_url), ''), '') = ''
  ) c
);

-- ---------------------------------------------------------
-- 4) 국가값 정규화 (선택)
-- - 텍스트 국가명을 코드로 보정
-- ---------------------------------------------------------
update projects set country = 'KR' where country in ('대한민국','한국','Korea','South Korea');
update projects set country = 'US' where country in ('미국','USA','United States');
update projects set country = 'JP' where country in ('일본','Japan');
update projects set country = 'CN' where country in ('중국','China');
update projects set country = 'TW' where country in ('대만','Taiwan');
update projects set country = 'SG' where country in ('싱가포르','Singapore');

commit;

-- ---------------------------------------------------------
-- 실행 후 확인용 조회
-- ---------------------------------------------------------
-- select count(*) as roots from projects where workspace_project_id is null;
-- select count(*) as children from projects where workspace_project_id is not null;
-- select count(*) as orphan_children
-- from projects c
-- left join projects p on p.id = c.workspace_project_id
-- where c.workspace_project_id is not null and p.id is null;
