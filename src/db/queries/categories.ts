import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { categories } from "@/db/schema";

type CreateCategoryInput = {
  userId: string;
  name: string;
  color: string;
};

export async function getUserCategories(userId: string) {
  // Check if the user has any categories
  if (
    !(
      await db
        .select()
        .from(categories)
        .where(eq(categories.userId, userId))
        .limit(1)
    ).length
  ) {
    // If not, return an empty array instead of null to avoid issues in the frontend
    return [];
  }

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

function generateRandomColor() {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
}

export async function createCategoryWithoutColor(
  tx: Omit<CreateCategoryInput, "color"> | (Omit<CreateCategoryInput, "color">)[],
) {
  const items = Array.isArray(tx) ? tx : [tx];

  for (const item of items) {
    if (!item.userId || !item.name) {
      throw new Error("userId and name are required to create a category");
    }
  }

  return await db
    .insert(categories)
    .values(
      items.map((item) => ({
        userId: item.userId,
        name: item.name,
        color: generateRandomColor(),
      })),
    )
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
