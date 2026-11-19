import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "../../../../lib/store.ts";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "Vary": "Authorization" };
export async function GET(request: Request) {
  const key = process.env.HEROS_FEEDBACK_EXPORT_KEY;
  if (!key || key.length < 32) return Response.json({ error: "EXPORT_NOT_CONFIGURED" }, { status: 503, headers });
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1] || "";
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (!token || !timingSafeEqual(digest(token), digest(key)))
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401, headers });
  const raw = new URL(request.url).searchParams.get("after") || "0";
  const after = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(after))
    return Response.json({ error: "INVALID_CURSOR" }, { status: 400, headers });
  try {
    const rows = db().prepare("SELECT id,name,email,phone,message,createdAt FROM contact_messages WHERE id > ? ORDER BY id ASC LIMIT 201").all(after);
    const messages = rows.slice(0, 200);
    return Response.json({ messages, nextCursor: messages.length ? messages[messages.length - 1].id : after, hasMore: rows.length > 200 }, { headers });
  } catch {
    return Response.json({ error: "STORAGE_UNAVAILABLE" }, { status: 503, headers });
  }
}
