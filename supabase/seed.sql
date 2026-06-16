-- Seed data for development
-- Run after setting up auth users via Supabase dashboard

-- Insert test practitioner profile (assumes auth user exists)
-- UPDATE profiles SET role = 'practitioner' WHERE email = 'practitioner@ayurveda.test';

-- Sample dietary preference options
INSERT INTO assessments (client_id, full_name, email, status)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Sample Client', 'client@ayurveda.test', 'draft')
ON CONFLICT DO NOTHING;
