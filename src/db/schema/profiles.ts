import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { users } from "./users";

// foreign key to users table
export const profiles = pgTable("profiles", {
  id: uuid("user_id")
    .notNull()
    .references(() => users.id)
    .primaryKey(),
  username: text("username").notNull(),
  picture: text("picture"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
});
