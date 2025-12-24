/*
  # Initial Database Schema Setup

  This migration creates the complete initial database schema for the TVS CRM system.

  ## Tables Created

  ### 1. tvs_leads
    - Core lead management table
    - Fields: id, full_name, phone_number, bike_model, lead_time, post_code, purchase_timeline, source, created_at, assigned_to, status, notes
    - Includes follow-up tracking: next_followup_date, followup_note
    
  ### 2. profiles
    - User profile information
    - Linked to auth.users
    
  ### 3. user_roles
    - Role-based access control
    - Supports: admin, manager, user, salesman roles

  ### 4. lead_activities
    - Activity logging for leads
    - Tracks all changes and interactions

  ## Security
    - RLS enabled on all tables
    - Role-based policies for data access
    - Automatic activity logging via triggers
*/

-- Create ENUM types
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user', 'salesman');
CREATE TYPE public.lead_status AS ENUM ('cold', 'warm', 'hot', 'converted');
CREATE TYPE public.activity_type AS ENUM (
  'status_change',
  'followup_scheduled',
  'note_added',
  'converted',
  'lost'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create tvs_leads table with follow-up tracking
CREATE TABLE public.tvs_leads (
  id SERIAL PRIMARY KEY,
  full_name TEXT,
  phone_number TEXT,
  bike_model TEXT,
  lead_time TEXT,
  post_code TEXT,
  purchase_timeline TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status lead_status DEFAULT 'cold' NOT NULL,
  notes TEXT,
  next_followup_date DATE,
  followup_note TEXT
);

-- Create lead_activities table
CREATE TABLE public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id INTEGER NOT NULL REFERENCES public.tvs_leads(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  activity_text TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tvs_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- Create role checking function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- TVS Leads policies
CREATE POLICY "Salesmen can view assigned leads"
ON public.tvs_leads
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'salesman') AND assigned_to = auth.uid()
);

CREATE POLICY "Salesmen can update assigned leads"
ON public.tvs_leads
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'salesman') AND assigned_to = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'salesman') AND assigned_to = auth.uid()
);

CREATE POLICY "Admins can manage all leads"
ON public.tvs_leads
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads" ON public.tvs_leads
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Lead activities policies
CREATE POLICY "Users can view activities for accessible leads"
ON public.lead_activities
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tvs_leads
    WHERE tvs_leads.id = lead_activities.lead_id
  )
);

CREATE POLICY "Authenticated users can insert activities"
ON public.lead_activities
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX idx_tvs_leads_assigned_to ON public.tvs_leads(assigned_to);
CREATE INDEX idx_tvs_leads_status ON public.tvs_leads(status);
CREATE INDEX idx_tvs_leads_next_followup_date ON public.tvs_leads(next_followup_date) WHERE next_followup_date IS NOT NULL;
CREATE INDEX idx_lead_activities_lead_id_created_at ON public.lead_activities(lead_id, created_at DESC);

-- Handle new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Activity logging function
CREATE OR REPLACE FUNCTION public.log_lead_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log status changes
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.lead_activities (lead_id, activity_type, activity_text, created_by)
    VALUES (
      NEW.id,
      CASE 
        WHEN NEW.status = 'converted' THEN 'converted'::activity_type
        ELSE 'status_change'::activity_type
      END,
      'Status changed from ' || OLD.status::text || ' to ' || NEW.status::text,
      auth.uid()
    );
  END IF;

  -- Log follow-up scheduling
  IF TG_OP = 'UPDATE' AND OLD.next_followup_date IS DISTINCT FROM NEW.next_followup_date THEN
    IF NEW.next_followup_date IS NOT NULL THEN
      INSERT INTO public.lead_activities (lead_id, activity_type, activity_text, created_by)
      VALUES (
        NEW.id,
        'followup_scheduled'::activity_type,
        'Follow-up scheduled for ' || NEW.next_followup_date::text,
        auth.uid()
      );
    END IF;
  END IF;

  -- Log when notes are added/updated
  IF TG_OP = 'UPDATE' AND OLD.notes IS DISTINCT FROM NEW.notes AND NEW.notes IS NOT NULL THEN
    INSERT INTO public.lead_activities (lead_id, activity_type, activity_text, created_by)
    VALUES (
      NEW.id,
      'note_added'::activity_type,
      'Note updated',
      auth.uid()
    );
  END IF;

  -- Log initial lead creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_activities (lead_id, activity_type, activity_text, created_by)
    VALUES (
      NEW.id,
      'note_added'::activity_type,
      'Lead created',
      auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for automatic activity logging
CREATE TRIGGER log_lead_activity_trigger
  AFTER INSERT OR UPDATE ON public.tvs_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.log_lead_activity();
