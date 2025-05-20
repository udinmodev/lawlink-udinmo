/*
  # Add Count Columns to Posts Table

  1. Changes
    - Add `likes_count` column to `posts` table (integer, default 0)
    - Add `comments_count` column to `posts` table (integer, default 0)
    
  2. Notes
    - These columns will store denormalized counts for better query performance
    - Default value of 0 ensures no null values
*/

-- Add count columns to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;