
import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
  path: ".env.local",
});

const hasDatabaseCredentials =
  !!process.env.PGUSER &&
  !!process.env.PGHOST &&
  !!process.env.PGDATABASE;

const config = {
  schema: "./src/db/schema",
  out: "./drizzle",
  dialect: "postgresql" as const,
};

export default defineConfig(
  hasDatabaseCredentials
    ? {
        ...config,
        dbCredentials: {
          url: (() => {
            const url = new URL("postgresql://");

            url.username = process.env.PGUSER!;
            url.password = process.env.PGPASSWORD || "";
            url.hostname = process.env.PGHOST!;
            url.pathname = `/${process.env.PGDATABASE!}`;

            url.searchParams.set(
              "sslmode",
              process.env.PGSSLMODE ?? "require",
            );
            url.searchParams.set(
              "channel_binding",
              process.env.PGCHANNELBINDING ?? "require",
            );

            return url.toString();
          })(),
        },
      }
    : config,
);