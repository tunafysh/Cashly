import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { createUser, getUserByEmail } from "@/db/queries/users";
import argon2 from "argon2";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, authenticators } from "@/db/schema";

export async function hashPassword(password: string) {
  return await argon2.hash(password);
}

async function loginWithCredentials(
  credentials: Partial<Record<"email" | "password", string>>,
) {
  if (!credentials?.email || !credentials?.password) return null;

  let user = await getUserByEmail(credentials.email);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user?.passwordHash) return null;

  const valid = await argon2.verify(user.passwordHash, credentials.password);

  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    authenticatorsTable: authenticators,
  }),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
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
