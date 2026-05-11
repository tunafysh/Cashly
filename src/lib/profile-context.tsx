'use client';

import { createContext, useContext, useState } from 'react';
import { UserProfile } from '@/db/queries/profiles';

type ProfileContextType = {
  profile?: UserProfile;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({
  profile: initialProfile,
  children,
}: {
  profile?: UserProfile;
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState(initialProfile);

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setProfile((prev) => prev ? { ...prev, ...data } : prev);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  return { profile: context?.profile, updateProfile: context?.updateProfile };
}
