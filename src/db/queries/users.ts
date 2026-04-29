import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export async function getAllUsers() {
  return await db.select().from(users);
}

export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] ?? null;
}

export async function getUserByEmailQuery(email: string) {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });
}

export async function createUser(
  username: string,
  email: string,
  passwordHash: string,
) {
  const result = await db
    .insert(users)
    .values({
      username,
      email,
      passwordHash,
    })
    .returning();

  return result[0];
}

export async function updateUserEmail(id: string, email: string) {
  const result = await db
    .update(users)
    .set({ email })
    .where(eq(users.id, id))
    .returning();

  return result[0];
}

export async function updateUserPassword(id: string, passwordHash: string) {
  const result = await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, id))
    .returning();

  return result[0];
}

export async function updateUsername(id: string, username: string) {
  const result = await db
    .update(users)
    .set({ username })
    .where(eq(users.id, id))
    .returning();

  return result[0];
}

export async function deleteUser(id: string) {
  await db.delete(users).where(eq(users.id, id));
}
