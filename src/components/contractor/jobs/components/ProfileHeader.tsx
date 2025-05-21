import React from 'react';

interface ProfileHeaderProps {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  // Display a placeholder UI if profile data is missing
  if (!profile) {
    return (
      <div className="mb-6">
        <div className="text-sm text-gray-600">
          <p className="font-medium text-pretance-purple">Welcome, Contractor</p>
          <p>Complete your profile to get started</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <div className="text-sm text-gray-600">
        <p className="font-medium text-pretance-purple">{profile.firstName} {profile.lastName}</p>
        <p>{profile.email}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
