import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
  path: ".env.local",
});

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const url = new URL("postgresql://");

url.username = requireEnv("PGUSER");
url.password = process.env.PGPASSWORD || ""; // password can be optional
url.hostname = requireEnv("PGHOST");
url.pathname = `/${requireEnv("PGDATABASE")}`;

url.searchParams.set("sslmode", process.env.PGSSLMODE ?? "require");
url.searchParams.set("channel_binding", process.env.PGCHANNELBINDING ?? "require");

const connectionString = url.toString();

export default defineConfig({
  schema: "./src/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
