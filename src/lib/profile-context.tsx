'use client';

import { createContext, useContext } from 'react';
import { UserProfile } from '@/db/queries/profiles';

const ProfileContext = createContext<UserProfile | undefined>(undefined);

export function ProfileProvider({
  profile,
  children,
}: {
  profile?: UserProfile;
  children: React.ReactNode;
}) {
  return (
    <ProfileContext.Provider value={profile}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
