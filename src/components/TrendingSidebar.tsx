import React, { useEffect, useState } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Hash, TrendingUp, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TrendingSidebar: React.FC = () => {
  const { user } = useAuth();
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingTags();
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchTrendingTags = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('content');

      if (error) throw error;

      // Extract hashtags from posts
      const hashtagRegex = /#(\w+)/g;
      const hashtags = data
        .map(post => post.content.match(hashtagRegex) || [])
        .flat()
        .map(tag => tag.toLowerCase());

      // Count occurrences of each hashtag
      const tagCounts = hashtags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Convert to array and sort by count
      const sortedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setTrendingTags(sortedTags);
    } catch (error) {
      console.error('Error fetching trending tags:', error);
      toast.error('Failed to load trending tags');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  return (
    <div className="p-4 space-y-8">
      {/* Trending Tags Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-blue-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Trending Tags</h2>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {trendingTags.map(({ tag, count }) => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Hash className="text-blue-500" size={16} />
                  <span className="text-gray-900">{tag}</span>
                </div>
                <span className="text-sm text-gray-500">{count} posts</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* User Profile Section */}
      {user && profile && (
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-blue-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                {profile.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">{profile.full_name || profile.username}</h3>
              <p className="text-sm text-gray-500">@{profile.username}</p>
            </div>
          </div>
          {profile.bio && (
            <p className="mt-3 text-sm text-gray-600 line-clamp-3">{profile.bio}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TrendingSidebar;