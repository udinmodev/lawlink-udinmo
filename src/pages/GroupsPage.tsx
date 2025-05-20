import React from 'react';
import CreateGroupForm from '../components/CreateGroupForm';
import GroupList from '../components/GroupList';
import GroupInvites from '../components/GroupInvites';

const GroupsPage: React.FC = () => {
  const handleGroupCreated = () => {
    // Refresh the group list
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 mt-16">
      <CreateGroupForm onGroupCreated={handleGroupCreated} />
      <GroupInvites />
      <GroupList />
    </div>
  );
};

export default GroupsPage;