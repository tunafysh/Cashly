import {
  pgEnum,
  pgTable,
  text,
  uuid,
  timestamp,
  index,
  numeric,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const subscriptionType = pgEnum("subscription_type", [
  "monthly",
  "yearly",
]);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    type: subscriptionType("type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    nextBillingAt: timestamp("next_billing_at", {
      withTimezone: true,
    }).notNull(),
  },
  (table) => {
    return [index("subscriptions_user_id_idx").on(table.userId)];
  },
);
