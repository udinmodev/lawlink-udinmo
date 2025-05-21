/*
  # Add Mentions System

  1. New Tables
    - `mentions`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts.id)
      - `comment_id` (uuid, references comments.id)
      - `mentioned_by` (uuid, references profiles.id)
      - `mentioned_user` (uuid, references profiles.id)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS
    - Add policies for mentions
*/

CREATE TABLE mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  mentioned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentioned_user UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Add indexes
CREATE INDEX idx_mentions_post_id ON mentions(post_id);
CREATE INDEX idx_mentions_comment_id ON mentions(comment_id);
CREATE INDEX idx_mentions_mentioned_by ON mentions(mentioned_by);
CREATE INDEX idx_mentions_mentioned_user ON mentions(mentioned_user);

-- Enable RLS
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;

-- Mentions policies
CREATE POLICY "Mentions are viewable by everyone"
  ON mentions FOR SELECT
  USING (true);

CREATE POLICY "Users can create mentions"
  ON mentions FOR INSERT
  WITH CHECK (auth.uid() = mentioned_by);

-- Function to handle mention notifications
CREATE OR REPLACE FUNCTION handle_new_mention()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    data
  )
  VALUES (
    NEW.mentioned_user,
    'mention',
    jsonb_build_object(
      'mentioned_by', NEW.mentioned_by,
      'post_id', NEW.post_id,
      'comment_id', NEW.comment_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_mention_created
  AFTER INSERT ON mentions
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_mention();