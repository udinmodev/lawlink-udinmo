import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface InviteGroupMemberProps {
  groupId: string;
  groupTitle: string;
}

const InviteGroupMember: React.FC<InviteGroupMemberProps> = ({ groupId, groupTitle }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      // First get the user by email
      const { data: inviteeData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', email)
        .limit(1);

      if (userError) throw userError;
      
      if (!inviteeData || inviteeData.length === 0) {
        toast.error('User not found');
        return;
      }

      const inviteeId = inviteeData[0].id;

      // Check if user is already a member
      const { data: existingMember, error: memberError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', inviteeId)
        .limit(1);

      if (existingMember && existingMember.length > 0) {
        toast.error('User is already a member of this group');
        return;
      }

      // Check if there's already a pending invite
      const { data: existingInvite, error: inviteError } = await supabase
        .from('group_invites')
        .select('id, status')
        .eq('group_id', groupId)
        .eq('invitee_id', inviteeId)
        .limit(1);

      if (existingInvite && existingInvite.length > 0) {
        if (existingInvite[0].status === 'pending') {
          toast.error('User already has a pending invite');
        } else {
          // Create new invite if previous one was declined
          const { error: newInviteError } = await supabase
            .from('group_invites')
            .insert([
              {
                group_id: groupId,
                inviter_id: user.id,
                invitee_id: inviteeId,
                status: 'pending'
              }
            ]);

          if (newInviteError) throw newInviteError;
          toast.success('Invite sent successfully!');
          setEmail('');
        }
        return;
      }

      // Create new invite
      const { error: createError } = await supabase
        .from('group_invites')
        .insert([
          {
            group_id: groupId,
            inviter_id: user.id,
            invitee_id: inviteeId,
            status: 'pending'
          }
        ]);

      if (createError) throw createError;

      // Create notification for the invitee
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: inviteeId,
            type: 'group_invite',
            data: {
              group_id: groupId,
              group_name: groupTitle,
              inviter_id: user.id
            }
          }
        ]);

      toast.success('Invite sent successfully!');
      setEmail('');
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invite');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Invite Member</h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter username"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 flex items-center gap-2"
        >
          <UserPlus size={18} />
          {isSubmitting ? 'Inviting...' : 'Invite'}
        </button>
      </form>
    </div>
  );
};

export default InviteGroupMember;