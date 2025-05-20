import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MessageSquare, Users, Hash, Bookmark, Bell } from 'lucide-react';

const ExplorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('messages');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 mt-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Explore</h1>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid grid-cols-5 gap-4 bg-transparent">
          <TabsTrigger
            value="messages"
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              activeTab === 'messages'
                ? 'bg-primary-100 text-primary-600'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare className="h-6 w-6 mb-1" />
            <span className="text-xs">Messages</span>
          </TabsTrigger>

          <TabsTrigger
            value="communities"
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              activeTab === 'communities'
                ? 'bg-primary-100 text-primary-600'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('communities')}
          >
            <Users className="h-6 w-6 mb-1" />
            <span className="text-xs">Communities</span>
          </TabsTrigger>

          <TabsTrigger
            value="tags"
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              activeTab === 'tags'
                ? 'bg-primary-100 text-primary-600'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('tags')}
          >
            <Hash className="h-6 w-6 mb-1" />
            <span className="text-xs">Tags</span>
          </TabsTrigger>

          <TabsTrigger
            value="bookmarks"
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              activeTab === 'bookmarks'
                ? 'bg-primary-100 text-primary-600'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('bookmarks')}
          >
            <Bookmark className="h-6 w-6 mb-1" />
            <span className="text-xs">Bookmarks</span>
          </TabsTrigger>

          <TabsTrigger
            value="notifications"
            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
              activeTab === 'notifications'
                ? 'bg-primary-100 text-primary-600'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="h-6 w-6 mb-1" />
            <span className="text-xs">Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-900">Messages coming soon</h3>
            <p className="mt-1 text-gray-500">Stay tuned for direct messaging features!</p>
          </div>
        </TabsContent>

        <TabsContent value="communities" className="mt-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-900">Communities coming soon</h3>
            <p className="mt-1 text-gray-500">Discover and join communities!</p>
          </div>
        </TabsContent>

        <TabsContent value="tags" className="mt-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-900">Tags coming soon</h3>
            <p className="mt-1 text-gray-500">Browse posts by tags and topics!</p>
          </div>
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-900">Bookmarks coming soon</h3>
            <p className="mt-1 text-gray-500">Save posts for later!</p>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-900">Notifications coming soon</h3>
            <p className="mt-1 text-gray-500">Stay updated with your network!</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExplorePage;