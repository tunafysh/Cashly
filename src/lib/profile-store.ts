import { create } from "zustand";
import type { UserProfile } from "@/db/queries/profiles";
import {
  getUserProfile,
  updateUserProfile,
  ensureProfileExists,
  deleteUserProfile,
} from "@/db/queries/profiles";

export type UserProfileBase = {
  id: string;
  currency: string;
};

type ProfileState = {
  profile: UserProfileBase | null;
  loading: boolean;
  error: string | null;

  loadProfile: (userId: string) => Promise<void>;
  ensureProfile: (userId: string) => Promise<void>;
  updateProfile: (
    userId: string,
    data: Partial<{ currency: string; budget: number; budgetPeriod: string }>
  ) => Promise<void>;
  deleteProfile: (userId: string) => Promise<void>;

  setProfile: (profile: UserProfileBase | null) => void;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  setProfile: (profile) => set({ profile }),

  loadProfile: async (userId) => {
    set({ loading: true, error: null });
    try {
      const profile = await getUserProfile(userId);
      set({ profile, loading: false });
    } catch (e) {
      set({ error: "Failed to load profile", loading: false });
    }
  },

  ensureProfile: async (userId) => {
    try {
      await ensureProfileExists(userId);
      await get().loadProfile(userId);
    } catch {
      set({ error: "Failed to ensure profile" });
    }
  },

  updateProfile: async (userId, data) => {
    set({ loading: true, error: null });
    try {
      await updateUserProfile(userId, data);
      await get().loadProfile(userId); // refresh cache
    } catch {
      set({ error: "Failed to update profile" });
    } finally {
      set({ loading: false });
    }
  },

  deleteProfile: async (userId) => {
    try {
      await deleteUserProfile(userId);
      set({ profile: null });
    } catch {
      set({ error: "Failed to delete profile" });
    }
  },
}));