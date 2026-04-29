import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { createUser, getUserByEmail } from "@/db/queries/users";
import argon2 from "argon2";

async function loginWithCredentials(
  credentials: Partial<Record<"email" | "password", string>>,
) {
  if (!credentials?.email || !credentials?.password) return null;

  let user = await getUserByEmail(credentials.email);

  if (!user) {
    const hashed = await argon2.hash(credentials.password);

    user = await createUser(
      credentials.email.split("@")[0],
      credentials.email,
      hashed
    );
  }

  if (!user?.passwordHash) return null;

  const valid = await argon2.verify(
    user.passwordHash,
    credentials.password
  );

  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.username,
  };
}


export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Cashly",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      authorize: async (credentials) => {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          return null;
        }

        return await loginWithCredentials({
          email: credentials.email as string,
          password: credentials.password as string,
        });
      },
    }),
    Google,
    GitHub,
  ],
});
