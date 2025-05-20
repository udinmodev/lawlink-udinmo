/*
  # Fix Database Relationships and Add Missing Columns

  1. Changes
    - Add foreign key constraints for group relationships
    - Add missing columns for posts and comments
    - Fix table relationships
*/

-- Add foreign key constraints to group_members
ALTER TABLE group_members
DROP CONSTRAINT IF EXISTS group_members_group_id_fkey,
ADD CONSTRAINT group_members_group_id_fkey 
  FOREIGN KEY (group_id) 
  REFERENCES groups(id) 
  ON DELETE CASCADE;

-- Add foreign key constraints to group_invites
ALTER TABLE group_invites
DROP CONSTRAINT IF EXISTS group_invites_group_id_fkey,
ADD CONSTRAINT group_invites_group_id_fkey 
  FOREIGN KEY (group_id) 
  REFERENCES groups(id) 
  ON DELETE CASCADE;

-- Add group_id to posts table if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'group_id'
  ) THEN
    ALTER TABLE posts ADD COLUMN group_id UUID REFERENCES groups(id) ON DELETE SET NULL;
  END IF;
END $$;