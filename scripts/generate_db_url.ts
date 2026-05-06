import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

const connectionString =
  "postgresql://" +
  `${process.env.PGUSER ?? ""}:` +
  `${process.env.PGPASSWORD ?? ""}@` +
  `${process.env.PGHOST ?? ""}/` +
  `${process.env.PGDATABASE ?? ""}?sslmode=` +
  `${process.env.PGSSLMODE ?? "require"}` +
  `&channel_binding=${process.env.PGCHANNELBINDING ?? "require"}`;
console.log("Generated DB URL:", connectionString);
