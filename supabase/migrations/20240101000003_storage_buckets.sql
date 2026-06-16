INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('food-photos', 'food-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('tongue-photos', 'tongue-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('report-pdfs', 'report-pdfs', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;
