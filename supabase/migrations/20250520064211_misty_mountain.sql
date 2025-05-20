/*
  # Fix Groups Schema and Relationships

  1. Changes
    - Drop and recreate groups-related tables with proper constraints
    - Add necessary indexes
    - Update RLS policies
    - Fix triggers
*/

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS group_invites CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

-- Create groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create group_members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(group_id, user_id)
);

-- Create group_invites table
CREATE TABLE group_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  inviter_id UUID NOT NULL,
  invitee_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT group_invites_group_id_fkey FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  CONSTRAINT group_invites_inviter_id_fkey FOREIGN KEY (inviter_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT group_invites_invitee_id_fkey FOREIGN KEY (invitee_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(group_id, invitee_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_invites_group_id ON group_invites(group_id);
CREATE INDEX idx_group_invites_inviter_id ON group_invites(inviter_id);
CREATE INDEX idx_group_invites_invitee_id ON group_invites(invitee_id);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invites ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Public groups are viewable by everyone"
  ON groups FOR SELECT USING (true);

CREATE POLICY "Any user can create a group"
  ON groups FOR INSERT WITH CHECK (true);

CREATE POLICY "Group members can update group info if they are admin or owner"
  ON groups FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = id
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('admin', 'owner')
    )
  );

-- Group members policies
CREATE POLICY "Group members are viewable by everyone"
  ON group_members FOR SELECT USING (true);

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Group invites policies
CREATE POLICY "Group invites are viewable by involved users"
  ON group_invites FOR SELECT USING (
    auth.uid() IN (inviter_id, invitee_id) OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_invites.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Users can create invites for their groups"
  ON group_invites FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_invites.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Users can update their received invites"
  ON group_invites FOR UPDATE USING (auth.uid() = invitee_id);

-- Create trigger for new group creation
CREATE OR REPLACE FUNCTION handle_new_group()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_group_created
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_group();

-- Create trigger for handling accepted invites
CREATE OR REPLACE FUNCTION handle_group_invite()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    INSERT INTO group_members (group_id, user_id, role)
    VALUES (NEW.group_id, NEW.invitee_id, 'member');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_group_invite_status_change
  AFTER UPDATE OF status ON group_invites
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status = 'accepted')
  EXECUTE FUNCTION handle_group_invite();