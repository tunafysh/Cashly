import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAllProfiles() {
  return await db.select().from(profiles);
}

export async function getProfileByUserId(userId: string) {
  const result = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return result[0] ?? null;
}

export async function createProfile(
  userId: string,
  username: string,
  picture: string | null,
  firstName: string,
  lastName: string,
) {
  const result = await db
    .insert(profiles)
    .values({
      id: userId,
      username,
      picture,
      firstName,
      lastName,
    })
    .returning();

  return result[0];
}

export async function updateProfilePicture(userId: string, picture: string) {
  const result = await db
    .update(profiles)
    .set({ picture })
    .where(eq(profiles.id, userId))
    .returning();

  return result[0];
}

export async function updateProfileName(
  userId: string,
  firstName: string,
  lastName: string,
) {
  const result = await db
    .update(profiles)
    .set({ firstName, lastName })
    .where(eq(profiles.id, userId))
    .returning();

  return result[0];
}
