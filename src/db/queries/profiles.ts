import { eq } from "drizzle-orm";
import { db } from "..";
import { profiles } from "../schema/profiles";

export async function ensureProfileExists(userId: string) {
  const existingProfile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  if (existingProfile.length === 0) {
    await db.insert(profiles).values({ id: userId });
  }
}

export type RawUserProfile = {
  id: string;
  currency: string;
  budget: string | null;
  budgetPeriod: string;
};

export async function getUserProfile(
  userId: string,
): Promise<RawUserProfile | null> {
  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  return profile[0] || null;
}

export async function updateUserProfile(
  userId: string,
  data: Partial<{ currency: string; budget?: number; budgetPeriod: string }>,
) {
  await db
    .update(profiles)
    .set({
      ...data,
      budget: data.budget !== undefined ? String(data.budget) : undefined,
    })
    .where(eq(profiles.id, userId));
}

export function deleteUserProfile(userId: string) {
  return db.delete(profiles).where(eq(profiles.id, userId));
}

export type UserProfile = {
  id: string;
  currency: string;
  budget: number | null;
  budgetPeriod: string;
};

export async function getBudget(userId: string): Promise<{ budget: number | null; budgetPeriod: string } | null> {
  const profile = await getUserProfile(userId);
  if (!profile) {
    return null;
  }
  return {
    budget: profile.budget ? parseFloat(profile.budget) : null,
    budgetPeriod: profile.budgetPeriod,
  };
}

export async function setBudget(userId: string, budget: number | undefined, budgetPeriod: string) {
  await updateUserProfile(userId, {
    budget,
    budgetPeriod,
  });
}