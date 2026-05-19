import { db } from "@/db";
import { mcpTokens } from "@/db/schema/mcp-tokens";
import { eq, and, gt, or, isNull } from "drizzle-orm";

export async function validateMCPToken(token: string) {
  const result = await db
    .select()
    .from(mcpTokens)
    .where(
      and(
        eq(mcpTokens.token, token),
        eq(mcpTokens.isActive, true),
        // Token is valid if expiresAt is null OR expiresAt is in the future
        or(isNull(mcpTokens.expiresAt), gt(mcpTokens.expiresAt, new Date())),
      ),
    )
    .limit(1);

  return result[0] || null;
}

export async function getMCPTokensByUser(userId: string) {
  return await db
    .select()
    .from(mcpTokens)
    .where(eq(mcpTokens.userId, userId))
    .orderBy(mcpTokens.createdAt);
}

export async function createMCPToken(
  userId: string,
  name: string,
  token: string,
  expiresAt?: Date,
) {
  return await db
    .insert(mcpTokens)
    .values({
      userId,
      token,
      name,
      expiresAt,
    })
    .returning();
}

export async function revokeMCPToken(tokenId: string) {
  return await db
    .update(mcpTokens)
    .set({ isActive: false })
    .where(eq(mcpTokens.id, tokenId))
    .returning();
}

export async function deleteMCPToken(tokenId: string) {
  return await db
    .delete(mcpTokens)
    .where(eq(mcpTokens.id, tokenId))
    .returning();
}
