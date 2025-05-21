import React from 'react';
import UserApproval from '@/components/settings/UserApproval';

export default function UserApprovalPage() {
  return (
    <div className="container mx-auto py-6 bg-white text-black">
      <h1 className="text-2xl font-bold mb-6 text-black">User Approval Management</h1>
      <UserApproval />
    </div>
  );
} 