import { pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    color: text("color").notNull(),
  },
  (table) => [uniqueIndex("unique_user_category").on(table.userId, table.name)],
);
