-- 프로젝트 워크스페이스 확장 컬럼
ALTER TABLE projects ADD COLUMN IF NOT EXISTS workspace_project_id uuid REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget bigint;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS venue_name text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS venue_map_url text;

-- 프로젝트 예산 계획
CREATE TABLE IF NOT EXISTS project_budget_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  total_budget bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'KRW',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_budget_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS auth_select_project_budget_plans ON project_budget_plans;
CREATE POLICY auth_select_project_budget_plans ON project_budget_plans
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS auth_insert_project_budget_plans ON project_budget_plans;
CREATE POLICY auth_insert_project_budget_plans ON project_budget_plans
  FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS auth_update_project_budget_plans ON project_budget_plans;
CREATE POLICY auth_update_project_budget_plans ON project_budget_plans
  FOR UPDATE TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS auth_delete_project_budget_plans ON project_budget_plans;
CREATE POLICY auth_delete_project_budget_plans ON project_budget_plans
  FOR DELETE TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
