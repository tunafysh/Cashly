import { pgTable, uuid, text, numeric, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const budgetPeriodEnum = pgEnum("budget_period", [
  "monthly",
  "yearly",
]);

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .notNull()
    .references(() => users.id),
  currency: text("currency").notNull().default("EUR"),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  budgetPeriod: budgetPeriodEnum("budget_period").notNull().default("monthly"),
});
