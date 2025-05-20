import React, { useEffect, useState } from 'react';
import { supabase, type Post } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const RecentPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentPosts();
  }, []);

  const fetchRecentPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (*)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      toast.error('Failed to load recent posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/post/${post.id}`}
            className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="text-gray-900 font-medium">
              {post.content.length > 15
                ? post.content.substring(0, 15) + '...'
                : post.content}
            </p>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <span>{post.profiles?.username}</span>
              <span className="mx-1">•</span>
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentPosts;