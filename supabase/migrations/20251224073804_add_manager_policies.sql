/*
  # Add Manager Permissions for Leads
  
  This migration adds RLS policies to allow managers to view and manage all leads.
  
  ## Changes
  
  1. New Policies
    - `managers_can_view_all_leads` - Allows managers to view all leads
    - `managers_can_update_all_leads` - Allows managers to update all leads
    - `managers_can_insert_leads` - Allows managers to create new leads
  
  ## Security
  - Managers get full read/write access to leads (but not delete)
  - Only admins retain delete permissions
*/

-- Allow managers to view all leads
CREATE POLICY "Managers can view all leads"
ON public.tvs_leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'manager'));

-- Allow managers to update all leads
CREATE POLICY "Managers can update all leads"
ON public.tvs_leads
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'manager'))
WITH CHECK (public.has_role(auth.uid(), 'manager'));

-- Allow managers to insert leads
CREATE POLICY "Managers can insert leads"
ON public.tvs_leads
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'manager'));

-- Allow admins to insert leads (was missing)
CREATE POLICY "Admins can insert leads"
ON public.tvs_leads
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));