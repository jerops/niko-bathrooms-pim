-- Supabase Configuration for Email Uniqueness and User Management
-- This file should be run in your Supabase SQL editor to ensure proper constraints

-- Enable email confirmation requirement
-- This should be set in Supabase Dashboard -> Settings -> Auth -> Email confirmation required

-- Create a function to check for duplicate emails before registration
-- This provides an additional layer of protection beyond the client-side checks

CREATE OR REPLACE FUNCTION auth.check_email_uniqueness()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email already exists in auth.users
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = NEW.email 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'An account with this email address already exists'
      USING ERRCODE = 'unique_violation';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce email uniqueness
DROP TRIGGER IF EXISTS trigger_check_email_uniqueness ON auth.users;
CREATE TRIGGER trigger_check_email_uniqueness
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.check_email_uniqueness();

-- Create a custom user profiles table to store additional data
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT CHECK (role IN ('customer', 'retailer')) NOT NULL DEFAULT 'customer',
  webflow_cms_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', NEW.raw_user_meta_data->>'user_type', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_webflow_cms_id ON public.user_profiles(webflow_cms_id);

-- Create function to safely get user profile by email (for admin use)
CREATE OR REPLACE FUNCTION public.get_user_profile_by_email(user_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  role TEXT,
  webflow_cms_id TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Only allow this function to be called by authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  
  RETURN QUERY
  SELECT 
    up.id,
    up.email,
    up.display_name,
    up.role,
    up.webflow_cms_id,
    up.created_at
  FROM public.user_profiles up
  WHERE up.email = user_email;
END;
$$;

COMMENT ON TABLE public.user_profiles IS 'Extended user profiles with role information and Webflow CMS integration';
COMMENT ON FUNCTION auth.check_email_uniqueness() IS 'Ensures email uniqueness in auth.users table';
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile when new user signs up';
COMMENT ON FUNCTION public.get_user_profile_by_email(TEXT) IS 'Safely retrieves user profile by email for authenticated users';
