import React, { useEffect, useState } from 'react';
import { supabase, type Post, type Profile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ProfileForm from '../components/ProfileForm';
import PostCard from '../components/PostCard';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, MapPin, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const fetchUserPosts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles(*),
          likes_count: likes(count),
          comments_count: comments(count),
          user_has_liked: likes!inner(user_id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedPosts = data?.map((post: any) => ({
        ...post,
        likes_count: post.likes_count?.[0]?.count || 0,
        comments_count: post.comments_count?.[0]?.count || 0,
        user_has_liked: post.user_has_liked?.some((like: any) => like.user_id === user.id) || false
      }));

      setPosts(processedPosts);
    } catch (error: any) {
      console.error('Error fetching user posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Please sign in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="h-32 md:h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        <div className="p-4 md:p-6 relative">
          <div className="absolute -top-16 left-4 md:left-6">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white bg-white overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || profile.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                  {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>

          <div className="ml-28 md:ml-40 pt-2">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{profile?.full_name || 'User'}</h1>
            <p className="text-gray-500">@{profile?.username || user.email?.split('@')[0]}</p>

            {profile?.bio && <p className="mt-2 text-gray-700">{profile.bio}</p>}

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>
                  Joined{' '}
                  {profile?.created_at
                    ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })
                    : 'recently'}
                </span>
              </div>
              {profile?.location && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center">
                  <LinkIcon size={16} className="mr-1" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="flex">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'posts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'edit'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('edit')}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'posts' ? (
        loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onPostUpdate={fetchUserPosts} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
            <p className="mt-1 text-gray-500">Share your first post with the world!</p>
          </div>
        )
      ) : (
        <ProfileForm />
      )}
    </div>
  );
};

export default ProfilePage;