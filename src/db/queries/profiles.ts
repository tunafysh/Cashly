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
  budgetPeriod: "monthly" | "yearly";
};

export async function getUserProfile(
  userId: string,
): Promise<RawUserProfile | null> {
  const profile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return profile[0] ?? null;
}

export async function updateUserProfile(
  userId: string,
  data: Partial<{
    currency: string;
    budget: number;
    budgetPeriod: "monthly" | "yearly";
  }>,
) {
  await db
    .update(profiles)
    .set({
      ...data,
      budget:
        data.budget !== undefined
          ? String(data.budget)
          : undefined,
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
  budgetPeriod: "monthly" | "yearly";
};

export async function getBudget(
  userId: string,
): Promise<UserProfile["budget"] extends infer T ? {
  budget: number | null;
  budgetPeriod: "monthly" | "yearly";
} | null : never> {
  const profile = await getUserProfile(userId);

  if (!profile) {
    return null;
  }

  return {
    budget: profile.budget !== null
      ? parseFloat(profile.budget)
      : null,
    budgetPeriod: profile.budgetPeriod as "monthly" | "yearly",
  };
}

export async function setBudget(
  userId: string,
  budget: number | undefined,
  budgetPeriod: "monthly" | "yearly",
) {
  await updateUserProfile(userId, {
    budget,
    budgetPeriod,
  });
}

/**
 * Returns the start and end of the current budget period.
 */
export function getCurrentBudgetPeriod(
  budgetPeriod: "monthly" | "yearly",
  currentDate = new Date(),
) {
  const start = new Date(currentDate);

  if (budgetPeriod === "monthly") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  }

  const end = new Date(start);

  if (budgetPeriod === "monthly") {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }

  return {
    start,
    end,
  };
}

/**
 * Returns the next budget period.
 */
export function renewBudget(
  budgetPeriod: "monthly" | "yearly",
  currentDate = new Date(),
) {
  const { end } = getCurrentBudgetPeriod(
    budgetPeriod,
    currentDate,
  );

  return {
    start: end,
    end:
      budgetPeriod === "monthly"
        ? new Date(end.getFullYear(), end.getMonth() + 1, 1)
        : new Date(end.getFullYear() + 1, 0, 1),
  };
}