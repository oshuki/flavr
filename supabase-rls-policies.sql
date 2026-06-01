-- Enable RLS on recipes table
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON recipes;

-- SELECT: Users can view only their own recipes
CREATE POLICY "Users can view their own recipes"
ON recipes FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can create new recipes with their own user_id
CREATE POLICY "Users can insert their own recipes"
ON recipes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update only their own recipes
CREATE POLICY "Users can update their own recipes"
ON recipes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete only their own recipes
CREATE POLICY "Users can delete their own recipes"
ON recipes FOR DELETE
USING (auth.uid() = user_id);
