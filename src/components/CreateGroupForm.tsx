import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Image, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateGroupFormProps {
  onGroupCreated: () => void;
}

const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onGroupCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a group');
      return;
    }

    if (!title.trim()) {
      toast.error('Group title cannot be empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('groups').insert([
        {
          title: title.trim(),
          description: description.trim() || null,
          cover_image_url: coverImageUrl.trim() || null,
          is_private: isPrivate,
        },
      ]);

      if (error) throw error;

      setTitle('');
      setDescription('');
      setCoverImageUrl('');
      setIsPrivate(false);
      toast.success('Group created successfully!');
      onGroupCreated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create group');
      console.error('Error creating group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Group Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter group title"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Describe your group"
            />
          </div>

          <div>
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
              Cover Image URL
            </label>
            <div className="mt-1 relative">
              <input
                id="coverImage"
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter image URL"
              />
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          {coverImageUrl && (
            <div className="relative mt-2">
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="w-full h-48 object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => setCoverImageUrl('')}
                className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center">
            <input
              id="isPrivate"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
              Make this group private
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateGroupForm;