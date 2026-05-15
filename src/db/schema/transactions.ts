import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./categories";
import { subscriptions } from "./subscriptions";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
]);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id") // snake case cuz im not a pick me.
      .notNull()
      .references(() => users.id),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    type: transactionTypeEnum("type").notNull(),
    categoryId: uuid("category_id").references(() => categories.id),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),
  },
  (table) => {
    return [index("transactions_user_id_idx").on(table.userId)];
  },
);
