-- Remove overly permissive RLS policies on tvs_leads
-- These allow ANY authenticated user full access, bypassing role-based security

DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.tvs_leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.tvs_leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.tvs_leads;

-- The remaining policies are properly role-based:
-- - "Admins can manage all leads" (ALL for admin role)
-- - "Admins can delete leads" (DELETE for admin role)  
-- - "Salesmen can view assigned leads" (SELECT for salesman, only their assigned leads)
-- - "Salesmen can update assigned leads" (UPDATE for salesman, only their assigned leads)