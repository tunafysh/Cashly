import { eq, and, desc, lte } from "drizzle-orm";
import { db } from "..";
import { subscriptions } from "../schema/subscriptions";
import { z } from "zod";

type SubscriptionInput = {
  userId: string;
  name: string;
  amount: number;
  type: "monthly" | "yearly";
  nextBillingAt: Date;
};

const SubscriptionSchema = z.object({
  userId: z.string(),
  name: z.string(),
  amount: z.number().positive(),
  type: z.enum(["monthly", "yearly"]),
  createdAt: z.date(),
  nextBillingAt: z.date(),
});

export async function getSubscriptionById(id: string, userId: string) {
  return await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
    .limit(1)
    .then((res) => res[0]);
}

export async function getSubscriptionsByType(
  userId: string,
  type: "monthly" | "yearly",
) {
  return await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.type, type)));
}

export async function createSubscription(input: SubscriptionInput) {
  return await db
    .insert(subscriptions)
    .values({
      userId: input.userId,
      name: input.name,
      amount: String(input.amount),
      type: input.type,
      nextBillingAt: input.nextBillingAt,
    })
    .returning();
}

export async function getUserSubscriptions(userId: string) {
  return await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt));
}

export async function updateSubscription(
  userId: string,
  id: string,
  input: Partial<SubscriptionInput>,
) {
  const data: any = {};

  if (input.userId !== undefined) data.userId = input.userId;
  if (input.name !== undefined) data.name = input.name;
  if (input.amount !== undefined) data.amount = String(input.amount);
  if (input.type !== undefined) data.type = input.type;
  if (input.nextBillingAt !== undefined)
    data.nextBillingAt = input.nextBillingAt;

  return await db
    .update(subscriptions)
    .set(data)
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
    .returning();
}

export async function renewSubscriptions(
  id: string,
  type: "monthly" | "yearly",
  userId: string,
) {
  const sub = await getSubscriptionById(id, userId);
  if (!sub) return null;

  const current = new Date(sub.nextBillingAt);
  const next = new Date(current);
  if (type === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setFullYear(next.getFullYear() + 1);
  }

  const [updated] = await db
    .update(subscriptions)
    .set({ nextBillingAt: next })
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
    .returning();

  return updated;
}

export async function renewDueSubscriptionsNow(type: "monthly" | "yearly") {
  const now = new Date();

  const due = await db
    .select()
    .from(subscriptions)
    .where(
      and(eq(subscriptions.type, type), lte(subscriptions.nextBillingAt, now)),
    );

  const updatedRows: typeof due = [];

  for (const s of due) {
    const current = new Date(s.nextBillingAt);
    const next = new Date(current);

    if (type === "monthly") {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setFullYear(next.getFullYear() + 1);
    }

    const [updated] = await db
      .update(subscriptions)
      .set({ nextBillingAt: next })
      .where(
        and(eq(subscriptions.id, s.id), eq(subscriptions.userId, s.userId)),
      )
      .returning();

    if (updated) updatedRows.push(updated);
  }

  return updatedRows;
}

export async function deleteSubscription(id: string, userId: string) {
  return await db
    .delete(subscriptions)
    .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
    .returning();
}
