import { readFileSync } from "node:fs";
import { Client } from "pg";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node scripts/run-sql.mjs <file.sql> [file2.sql ...]");
  process.exit(1);
}

const client = new Client({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || "postgres",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("Connected.");

for (const file of files) {
  const sql = readFileSync(file, "utf8");
  console.log(`Running ${file} ...`);
  await client.query(sql);
  console.log(`OK: ${file}`);
}

await client.end();
console.log("Done.");
