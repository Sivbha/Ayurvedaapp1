-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prakriti_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vikriti_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioner_notes ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Assessments
CREATE POLICY "Clients view own assessments" ON assessments
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients create own assessments" ON assessments
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients update own draft assessments" ON assessments
  FOR UPDATE USING (auth.uid() = client_id AND status = 'draft');
CREATE POLICY "Practitioners view assigned assessments" ON assessments
  FOR SELECT USING (auth.uid() = practitioner_id);
CREATE POLICY "Practitioners update assigned assessments" ON assessments
  FOR UPDATE USING (auth.uid() = practitioner_id);
CREATE POLICY "Admins manage all assessments" ON assessments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Prakriti answers
CREATE POLICY "Users view own prakriti answers" ON prakriti_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND client_id = auth.uid())
  );
CREATE POLICY "Clients insert own prakriti answers" ON prakriti_answers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND client_id = auth.uid() AND status = 'draft')
  );
CREATE POLICY "Practitioners view assigned" ON prakriti_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND practitioner_id = auth.uid())
  );

-- Vikriti answers (same pattern)
CREATE POLICY "Users view own vikriti answers" ON vikriti_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND client_id = auth.uid())
  );
CREATE POLICY "Clients insert own vikriti answers" ON vikriti_answers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND client_id = auth.uid() AND status = 'draft')
  );
CREATE POLICY "Practitioners view assigned" ON vikriti_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND practitioner_id = auth.uid())
  );

-- Food diary entries
CREATE POLICY "Users view own food diary" ON food_diary_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND client_id = auth.uid())
  );
CREATE POLICY "Clients manage own food diary" ON food_diary_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND client_id = auth.uid() AND status = 'draft')
  );
CREATE POLICY "Practitioners view assigned" ON food_diary_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND practitioner_id = auth.uid())
  );

-- Symptom entries
CREATE POLICY "Users view own symptoms" ON symptom_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND client_id = auth.uid())
  );
CREATE POLICY "Clients manage own symptoms" ON symptom_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND client_id = auth.uid() AND status = 'draft')
  );
CREATE POLICY "Practitioners view assigned" ON symptom_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND practitioner_id = auth.uid())
  );

-- Scoring results
CREATE POLICY "Clients view own scoring" ON scoring_results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND client_id = auth.uid())
  );
CREATE POLICY "Practitioners view assigned" ON scoring_results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND practitioner_id = auth.uid())
  );

-- Reports
CREATE POLICY "Clients view own released reports" ON reports
  FOR SELECT USING (
    type = 'client' AND released_at IS NOT NULL AND
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND client_id = auth.uid())
  );
CREATE POLICY "Practitioners view assigned reports" ON reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND practitioner_id = auth.uid())
  );

-- Practitioner notes
CREATE POLICY "Practitioners manage own notes" ON practitioner_notes
  FOR ALL USING (auth.uid() = practitioner_id);
CREATE POLICY "Clients view non-private notes" ON practitioner_notes
  FOR SELECT USING (
    NOT is_private AND
    EXISTS (
      SELECT 1 FROM assessments a
      JOIN reports r ON r.assessment_id = a.id
      WHERE a.id = assessment_id
      AND a.client_id = auth.uid()
      AND r.type = 'client'
      AND r.released_at IS NOT NULL
    )
  );
