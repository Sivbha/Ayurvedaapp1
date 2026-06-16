-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('client', 'practitioner', 'admin')) DEFAULT 'client',
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  country TEXT,
  occupation TEXT,
  dietary_preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'client');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Assessments
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  practitioner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'in_review', 'released', 'archived')),
  current_step INT DEFAULT 1,
  
  -- Basic details
  full_name TEXT,
  email TEXT,
  phone TEXT,
  age INT,
  sex TEXT CHECK (sex IN ('male', 'female', 'other', 'prefer_not_say')),
  country TEXT,
  occupation TEXT,
  dietary_preferences TEXT[] DEFAULT '{}',
  consent_given BOOLEAN DEFAULT false,
  disclaimer_accepted BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  
  -- Safety
  is_pregnant BOOLEAN DEFAULT false,
  is_breastfeeding BOOLEAN DEFAULT false,
  medications TEXT[] DEFAULT '{}',
  health_conditions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  red_flags TEXT[] DEFAULT '{}',
  red_flag_detected BOOLEAN GENERATED ALWAYS AS (
    array_length(red_flags, 1) > 0
  ) STORED,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Prakriti answers
CREATE TABLE prakriti_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('physical', 'metabolic', 'behavioral', 'psychological')),
  question_key TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  answer_label TEXT,
  dosha_scores JSONB DEFAULT '{"vata":0,"pitta":0,"kapha":0}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vikriti answers
CREATE TABLE vikriti_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('digestive', 'energy_mood', 'physical', 'reproductive')),
  question_key TEXT NOT NULL,
  severity INT NOT NULL CHECK (severity BETWEEN 0 AND 3),
  duration_weeks INT,
  dosha_impact JSONB DEFAULT '{"vata":0,"pitta":0,"kapha":0}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Food diary entries
CREATE TABLE food_diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 7),
  date DATE NOT NULL,
  wake_time TIME,
  breakfast JSONB,
  lunch JSONB,
  dinner JSONB,
  snacks JSONB,
  caffeine BOOLEAN DEFAULT false,
  sugar_sweets BOOLEAN DEFAULT false,
  fried_foods BOOLEAN DEFAULT false,
  spicy_foods BOOLEAN DEFAULT false,
  fermented_foods BOOLEAN DEFAULT false,
  dairy BOOLEAN DEFAULT false,
  gluten_wheat BOOLEAN DEFAULT false,
  beans_legumes BOOLEAN DEFAULT false,
  raw_salads BOOLEAN DEFAULT false,
  leftovers BOOLEAN DEFAULT false,
  eating_out BOOLEAN DEFAULT false,
  meal_size TEXT CHECK (meal_size IN ('small', 'medium', 'large')),
  eating_speed TEXT CHECK (eating_speed IN ('slow', 'moderate', 'fast')),
  hunger_before_meals TEXT CHECK (hunger_before_meals IN ('low', 'normal', 'high')),
  symptoms_after_meals TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (assessment_id, day_number)
);

-- Symptoms & lifestyle
CREATE TABLE symptom_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'digestion', 'energy', 'sleep', 'mood', 'skin', 'hair',
    'joints_muscles', 'urination', 'bowel_movements', 'weight_changes',
    'food_cravings', 'stress', 'temperature_sensitivity', 'immunity', 'pain', 'other'
  )),
  symptoms TEXT[] DEFAULT '{}',
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scoring results
CREATE TABLE scoring_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  prakriti_vata INT DEFAULT 0,
  prakriti_pitta INT DEFAULT 0,
  prakriti_kapha INT DEFAULT 0,
  prakriti_dominant TEXT,
  prakriti_confidence DECIMAL(3,2),
  prakriti_raw JSONB,
  vikriti_vata INT DEFAULT 0,
  vikriti_pitta INT DEFAULT 0,
  vikriti_kapha INT DEFAULT 0,
  vikriti_dominant TEXT,
  vikriti_confidence DECIMAL(3,2),
  vikriti_raw JSONB,
  agni_type TEXT CHECK (agni_type IN ('sama', 'vishama', 'tikshna', 'manda')),
  agni_score INT DEFAULT 0,
  agni_notes TEXT,
  ama_score INT DEFAULT 0,
  ama_indicators TEXT[] DEFAULT '{}',
  ama_level TEXT CHECK (ama_level IN ('low', 'moderate', 'high')),
  food_pattern_type TEXT,
  food_pattern_notes TEXT,
  food_pattern_raw JSONB,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (assessment_id)
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('practitioner', 'client')),
  content JSONB NOT NULL,
  pdf_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  released_at TIMESTAMPTZ,
  UNIQUE (assessment_id, type)
);

-- Practitioner notes
CREATE TABLE practitioner_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_assessments_client_id ON assessments(client_id);
CREATE INDEX idx_assessments_practitioner_id ON assessments(practitioner_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_prakriti_answers_assessment ON prakriti_answers(assessment_id);
CREATE INDEX idx_vikriti_answers_assessment ON vikriti_answers(assessment_id);
CREATE INDEX idx_food_diary_assessment ON food_diary_entries(assessment_id);
CREATE INDEX idx_symptom_entries_assessment ON symptom_entries(assessment_id);
CREATE INDEX idx_scoring_results_assessment ON scoring_results(assessment_id);
CREATE INDEX idx_reports_assessment ON reports(assessment_id);
CREATE INDEX idx_practitioner_notes_assessment ON practitioner_notes(assessment_id);
