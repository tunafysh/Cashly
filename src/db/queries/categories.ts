import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { categories } from "@/db/schema";

type CreateCategoryInput = {
  userId: string;
  name: string;
  color: string;
};

export async function getUserCategories(userId: string) {
  return await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId));
}

export async function createCategory({
  userId,
  name,
  color,
}: CreateCategoryInput) {
  return await db
    .insert(categories)
    .values({
      userId,
      name,
      color,
    })
    .returning();
}

export async function deleteCategory(userId: string, categoryId: string) {
  return await db
    .delete(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .returning();
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  name: string,
  color: string,
) {
  return await db
    .update(categories)
    .set({
      name,
      color,
    })
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .returning();
}
