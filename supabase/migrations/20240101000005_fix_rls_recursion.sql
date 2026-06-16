-- Fix infinite RLS recursion in admin policies
-- The admin policies used subqueries on profiles table, which triggered
-- the same policies again. Solution: use a SECURITY DEFINER function
-- that bypasses RLS for the role check.

-- Create SECURITY DEFINER function to check admin role (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- Drop and recreate affected policies

-- Profiles: admin view all
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
CREATE POLICY "Admins view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

-- Assessments: admin manage all
DROP POLICY IF EXISTS "Admins manage all assessments" ON assessments;
CREATE POLICY "Admins manage all assessments" ON assessments
  FOR ALL USING (public.is_admin());
