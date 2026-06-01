-- ============================================================
-- Profiles table with approval gate
-- Run this once in the Supabase SQL editor
-- ============================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_admin    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile (to check approval status)
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Only admins can update profiles (approval)
-- We use a security-definer function for that instead of a direct policy

-- 3. Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_approved, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    false,
    NEW.email = 'oshuki@gmail.com'   -- admin is always approved implicitly
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Security-definer function: admin can toggle approval
CREATE OR REPLACE FUNCTION public.set_user_approved(target_user_id UUID, approved BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Only allow if calling user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.profiles SET is_approved = approved WHERE id = target_user_id;
END;
$$;

-- 5. Bootstrap: insert profiles for all existing users
INSERT INTO public.profiles (id, email, is_approved, is_admin)
SELECT
  u.id,
  u.email,
  CASE WHEN u.email = 'oshuki@gmail.com' THEN true ELSE false END,
  CASE WHEN u.email = 'oshuki@gmail.com' THEN true ELSE false END
FROM auth.users u
ON CONFLICT (id) DO UPDATE
  SET is_approved = EXCLUDED.is_approved,
      is_admin    = EXCLUDED.is_admin;
