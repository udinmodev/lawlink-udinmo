import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  group_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  likes_count: number;
  comments_count: number;
  user_has_liked?: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type Like = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

export type Group = {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  group?: Group;
  profile?: Profile;
};

export type GroupInvite = {
  id: string;
  group_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  group?: Group;
  inviter?: Profile;
  invitee?: Profile;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  data: Record<string, any>;
  is_read: boolean;
  created_at: string;
};

export type Follower = {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: Profile;
  following?: Profile;
};

// Realtime channel types
export type RealtimeNotification = {
  type: 'group_invite' | 'new_post' | 'mention' | 'new_follower';
  payload: {
    notification: Notification;
    [key: string]: any;
  };
};