import "server-only";
import { createHash } from "node:crypto";
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
