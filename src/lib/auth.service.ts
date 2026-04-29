import argon2 from "argon2";
import { getUserByEmail } from "@/db/queries/users";

export async function loginWithCredentials(
  credentials: Partial<Record<"email" | "password", string>>,
) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  const user = await getUserByEmail(credentials.email);

  if (!user) return null;

  const valid = await argon2.verify(user.passwordHash, credentials.password);

  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.username,
  };
}
