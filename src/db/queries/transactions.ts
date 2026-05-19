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
import { subscriptions } from "../schema/subscriptions";

export type TransactionInput = {
  userId: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string | null;
  description?: string;
  createdAt?: Date;
  subscriptionId?: string;
};

export const transactionSchema = z.object({
  userId: z.string(),
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().nullable(), // javascript what the FUCK is wrong with you.
  description: z.string().optional(),
  createdAt: z.date().optional(),
  subscriptionId: z.string().optional(),
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
  subscription: {
    id: subscriptions.id,
    name: subscriptions.name,
  },
};

function baseTransactionQuery() {
  return db
    .select(transactionSelect)
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(subscriptions, eq(transactions.subscriptionId, subscriptions.id));
}

export type Filters = {
  fromDate?: Date;
  toDate?: Date;
  withDescription?: boolean;
  categoryId?: string;
  type?: "income" | "expense";
  subscriptionId?: string;
  search?: string;
  offset?: number;
  limit?: number;
};

export async function getUserTransactions(userId: string, filters?: Filters) {
  const conditions = [eq(transactions.userId, userId)];
  const amount = [];

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

  if (filters?.subscriptionId) {
    conditions.push(eq(transactions.subscriptionId, filters.subscriptionId));
  }

  const query = baseTransactionQuery()
    .where(and(...conditions))
    .orderBy(desc(transactions.createdAt));

  if (filters?.limit !== undefined) {
    query.limit(filters.limit);
  }

  if (filters?.offset !== undefined) {
    query.offset(filters.offset);
  }

  return await query;
}

export async function createTransaction(
  input: TransactionInput | TransactionInput[],
) {
  const transactionsToInsert = Array.isArray(input) ? input : [input];
  for (const tx of transactionsToInsert) {
    const parsed = transactionSchema.safeParse(tx);
    if (!parsed.success) {
      throw new Error(
        `Invalid transaction data: ${JSON.stringify(parsed.error.issues)}`,
      );
    }
  }
  return await db
    .insert(transactions)
    .values(
      transactionsToInsert.map((tx) => ({
        userId: tx.userId,
        amount: tx.amount.toFixed(2), // Ensure amount is stored with 2 decimal places
        type: tx.type,
        categoryId: tx.categoryId ?? null,
        description: tx.description,
        createdAt: tx.createdAt || new Date(),
        subscriptionId: tx.subscriptionId,
      })),
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

export async function getSummary(
  userId: string,
  fromDate?: Date,
  toDate?: Date,
) {
  const conditions = [eq(transactions.userId, userId)];

  if (fromDate) {
    conditions.push(gte(transactions.createdAt, fromDate));
  }

  if (toDate) {
    const endOfDay = new Date(toDate);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
    endOfDay.setUTCHours(0, 0, 0, 0);
    conditions.push(lte(transactions.createdAt, endOfDay));
  }

  // get income, expenses and balance
  const transaction = await db
    .select()
    .from(transactions)
    .where(and(...conditions));

  const result = transaction.reduce(
    (acc, tx) => {
      if (tx.type === "income") {
        acc.income += parseFloat(tx.amount);
      } else if (tx.type === "expense") {
        acc.expenses += parseFloat(tx.amount);
      }
      return acc;
    },
    { income: 0, expenses: 0 },
  );

  const income = result.income;
  const expenses = result.expenses;
  const balance = income - expenses;

  return { income, expenses, balance };
}
