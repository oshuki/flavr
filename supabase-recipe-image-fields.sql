-- ============================================================
-- Recipe image metadata columns (KI-Bildvorschläge)
-- Run this once in the Supabase SQL editor
-- Idempotent: safe to run multiple times
-- ============================================================

ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS image_source     text,
  ADD COLUMN IF NOT EXISTS image_credit     text,
  ADD COLUMN IF NOT EXISTS image_credit_url text;

-- Hinweis: RLS-Policies für die `recipes`-Tabelle bestehen bereits
-- in supabase-rls-policies.sql (Users can view/insert/update/delete
-- their own recipes). Diese decken auch die neuen Spalten ab, da sie
-- auf Zeilenebene (user_id = auth.uid()) greifen.
