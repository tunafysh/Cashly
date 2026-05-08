import { eq, and, gte, ne, or, isNull, desc, lte } from "drizzle-orm";
import { db } from "..";
import { categories, transactions } from "../schema";

type CreateTransactionInput = {
  userId: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  description?: string;
};

const transactionSelect = {
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
};

function baseTransactionQuery() {
  return db
    .select(transactionSelect)
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id));
}

export type Filters = {
  fromDate?: Date;
  toDate?: Date;
  withDescription?: boolean;
  categoryId?: string;
  type?: "income" | "expense";
};

export async function getUserTransactions(
  userId: string,
  filters?: Filters
) {
  const conditions = [
    eq(transactions.userId, userId),
  ];

  if (filters?.fromDate) {
    conditions.push(
      gte(transactions.createdAt, filters.fromDate)
    );
  }

  if (filters?.toDate) {
    conditions.push(
      lte(transactions.createdAt, filters.toDate)
    );
  }

  if (filters?.categoryId) {
    conditions.push(
      eq(transactions.categoryId, filters.categoryId)
    );
  }

  if (filters?.type) {
    conditions.push(
      eq(transactions.type, filters.type)
    );
  }

  if (filters?.withDescription) {
    conditions.push(
      or(ne(transactions.description, ""), isNull(transactions.description))!
    );
  }

  return await baseTransactionQuery().where(and(...conditions)).orderBy(desc(transactions.createdAt));
  
}

export async function createTransaction({
  userId,
  amount,
  type,
  categoryId,
  description,
}: CreateTransactionInput) {
  return await db
    .insert(transactions)
    .values({
      userId,
      amount: amount.toFixed(2), // Ensure amount is stored with 2 decimal places
      type,
      categoryId,
      description,
    })
    .returning();
}

export async function deleteTransaction(userId: string, transactionId: string) {
  return await db
    .delete(transactions)
    .where(
      and(eq(transactions.id, transactionId), eq(transactions.userId, userId)),
    )
    .returning();
}
