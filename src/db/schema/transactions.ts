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

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
]);

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id") // snake case cuz im not a pick me.
    .notNull()
    .references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return [
    index("user_id_idx").on(table.userId),
  ]
});