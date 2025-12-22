-- Add assigned_to column to tvs_leads for salesman assignment
ALTER TABLE public.tvs_leads 
ADD COLUMN assigned_to uuid REFERENCES auth.users(id);

-- Add status column to track lead progress
ALTER TABLE public.tvs_leads 
ADD COLUMN status text DEFAULT 'new';

-- Add notes column for lead notes
ALTER TABLE public.tvs_leads 
ADD COLUMN notes text;

-- Update RLS policy for salesmen to view only their assigned leads
CREATE POLICY "Salesmen can view assigned leads"
ON public.tvs_leads
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'salesman'::app_role) AND assigned_to = auth.uid()
);

-- Salesmen can update their assigned leads
CREATE POLICY "Salesmen can update assigned leads"
ON public.tvs_leads
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'salesman'::app_role) AND assigned_to = auth.uid()
);

-- Admins can do everything on leads
CREATE POLICY "Admins can manage all leads"
ON public.tvs_leads
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_tvs_leads_assigned_to ON public.tvs_leads(assigned_to);
CREATE INDEX idx_tvs_leads_status ON public.tvs_leads(status);