import {
  eq,
  and,
  gte,
  ne,
  or,
  isNotNull,
  desc,
  lte,
  isNull,
} from "drizzle-orm";
import { db } from "..";
import { categories, transactions } from "../schema";
import { z } from "zod";

type CreateTransactionInput = {
  userId: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  description?: string;
};


const transactionSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  type: z.enum(["income", "expense"]),
  categoryId: z.string(),
  description: z.string().optional(),
});

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

export async function getUserTransactions(userId: string, filters?: Filters) {
  const conditions = [eq(transactions.userId, userId)];

  console.log(filters);
  console.log(filters?.fromDate instanceof Date);
  console.log(filters?.toDate instanceof Date);

  if (filters?.fromDate) {
    conditions.push(gte(transactions.createdAt, filters.fromDate));
  }

  if (filters?.toDate) {
    const endOfDay = new Date(filters.toDate);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
    endOfDay.setUTCHours(0, 0, 0, 0);
    conditions.push(lte(transactions.createdAt, endOfDay));
  }

  if (filters?.categoryId) {
    conditions.push(eq(transactions.categoryId, filters.categoryId));
  }

  if (filters?.type) {
    conditions.push(eq(transactions.type, filters.type));
  }

  if (filters?.withDescription === true) {
    conditions.push(
      and(
        ne(transactions.description, ""),
        isNotNull(transactions.description),
      )!,
    );
  }

  if (filters?.withDescription === false) {
    conditions.push(
      or(eq(transactions.description, ""), isNull(transactions.description))!,
    );
  }

  return await baseTransactionQuery()
    .where(and(...conditions))
    .orderBy(desc(transactions.createdAt));
}

export async function createTransaction(input: CreateTransactionInput | CreateTransactionInput[]) {
  const transactionsToInsert = Array.isArray(input) ? input : [input];
  for (const tx of transactionsToInsert) {
    const parsed = transactionSchema.safeParse(tx);
    if (!parsed.success) {
      throw new Error(`Invalid transaction data: ${JSON.stringify(parsed.error.issues)}`);
    }
  }
  return await db
    .insert(transactions)
    .values(
      transactionsToInsert.map((tx) => ({
        userId: tx.userId,
        amount: tx.amount.toFixed(2), // Ensure amount is stored with 2 decimal places
        type: tx.type,
        categoryId: tx.categoryId,
        description: tx.description,
      }))
    )
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
