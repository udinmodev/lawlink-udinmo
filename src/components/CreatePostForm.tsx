import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Image } from 'lucide-react';
import toast from 'react-hot-toast';
import RichTextEditor from './RichTextEditor';

interface CreatePostFormProps {
  onPostCreated: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState<Set<string>>(new Set());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a post');
      return;
    }

    if (!content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert the post
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            content: content.trim(),
            image_url: imageUrl.trim() || null,
          },
        ])
        .select('id')
        .single();

      if (postError) throw postError;

      // Create mentions for all mentioned users
      if (mentionedUsers.size > 0 && postData?.id) {
        const mentions = Array.from(mentionedUsers).map(userId => ({
          post_id: postData.id,
          mentioned_by: user.id,
          mentioned_user: userId,
        }));

        const { error: mentionsError } = await supabase
          .from('mentions')
          .insert(mentions);

        if (mentionsError) throw mentionsError;
      }

      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      setMentionedUsers(new Set());
      toast.success('Post created successfully!');
      onPostCreated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create post');
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMention = (userId: string) => {
    setMentionedUsers(prev => new Set([...prev, userId]));
  };

  return (
    <div className="bg-white">
      <form onSubmit={handleSubmit}>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="What's on your mind?"
          onMention={handleMention}
        />

        {showImageInput && (
          <div className="relative mt-2 mb-3">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Add image URL"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Image size={18} />
          </button>

          <button
            type="submit"
            className="px-4 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;