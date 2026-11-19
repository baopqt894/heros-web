import { createHash, timingSafeEqual } from "node:crypto";
import { backend } from "../../../../lib/backend.ts";
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
    const page = await backend<{ messages: { id: string; name: string; email: string; phone: string; message: string; createdAt: string }[]; nextCursor: number; hasMore: boolean }>(
      `contact/export?after=${after}`, { token: key },
    );
    if (!page || !Array.isArray(page.messages) || page.messages.length > 200 ||
      typeof page.hasMore !== "boolean" || page.nextCursor !== after + page.messages.length ||
      (page.hasMore && page.messages.length === 0) ||
      page.messages.some(row => !row || !/^[a-f0-9]{24}$/.test(row.id) ||
        [row.name, row.email, row.phone, row.message, row.createdAt].some(value => typeof value !== "string")))
      throw new Error("Invalid backend export response");
    // Explicit fields prevent any additional backend/private properties leaking.
    return Response.json({
      messages: page.messages.map(({ id, name, email, phone, message, createdAt }) => ({ id, name, email, phone, message, createdAt })),
      nextCursor: page.nextCursor, hasMore: page.hasMore,
    }, { headers });
  } catch {
    return Response.json({ error: "STORAGE_UNAVAILABLE" }, { status: 503, headers });
  }
}
