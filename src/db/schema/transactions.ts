import { pgTable, uuid, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { users } from "./users";

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id") // snake case cuz im not a pick me.
    .notNull()
    .references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
