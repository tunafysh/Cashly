import { eq, and } from "drizzle-orm";
import { db } from "..";
import { categories, transactions } from "../schema";

type CreateTransactionInput = {
  userId: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  description?: string;
};


export async function getUserTransactions(userId: string) {
   return db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      description: transactions.description,
      createdAt: transactions.createdAt,

      category: {
        id: categories.id,
        name: categories.name,
        color: categories.color,
      },
    })
    .from(transactions)
    .leftJoin(
      categories,
      eq(transactions.categoryId, categories.id)
    )
    .where(eq(transactions.userId, userId));
    
}

export async function createTransaction({ userId, amount, type, categoryId, description }: CreateTransactionInput) {
  return await db.insert(transactions).values({
    userId,
    amount: amount.toFixed(2), // Ensure amount is stored with 2 decimal places
    type,
    categoryId,
    description,
  }).returning();
}

export async function deleteTransaction(userId: string, transactionId: string) {
  return await db.delete(transactions).where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId))).returning();
}