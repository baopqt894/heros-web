import "server-only";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import { resolve, dirname } from "node:path";
// Contact messages stay local pending approval to move their personal data.
let contactDatabase: DatabaseSync | undefined;
export function db() {
  if (contactDatabase) return contactDatabase;
  const file = resolve(/* turbopackIgnore: true */ process.env.HEROS_DB_PATH || ".data/heros.sqlite");
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  contactDatabase = new DatabaseSync(file);
  chmodSync(file, 0o600);
  contactDatabase.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS contact_messages (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, message TEXT NOT NULL, createdAt TEXT NOT NULL)");
  return contactDatabase;
}
// Business request throttles are bounded in memory; auth/checkout also enforce backend limits.
const limits = new Map<string, { count: number; expires: number }>();
export function allowRequest(key: string, limit: number, windowMs = 60000) {
  const now = Date.now();
  for (const [key, row] of limits) if (row.expires <= now) limits.delete(key);
  const digest = createHash("sha256").update(key).digest("hex");
  const row = limits.get(digest) || { count: 0, expires: now + windowMs };
  row.count += 1;
  limits.set(digest, row);
  return row.count <= limit;
}
