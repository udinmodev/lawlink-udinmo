import React from 'react';
import { Bell } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 mt-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

      <div className="text-center py-10">
        <Bell className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications yet</h3>
        <p className="mt-1 text-gray-500">We'll notify you when something happens!</p>
      </div>
    </div>
  );
};

export default NotificationsPage;