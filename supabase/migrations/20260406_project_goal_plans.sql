CREATE TABLE IF NOT EXISTS project_goal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_goal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS auth_select_project_goal_plans ON project_goal_plans;
CREATE POLICY auth_select_project_goal_plans ON project_goal_plans
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS auth_insert_project_goal_plans ON project_goal_plans;
CREATE POLICY auth_insert_project_goal_plans ON project_goal_plans
  FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS auth_update_project_goal_plans ON project_goal_plans;
CREATE POLICY auth_update_project_goal_plans ON project_goal_plans
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

DROP POLICY IF EXISTS auth_delete_project_goal_plans ON project_goal_plans;
CREATE POLICY auth_delete_project_goal_plans ON project_goal_plans
  FOR DELETE TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
