import "server-only";
import { siteUrl } from "./payos.ts";
export function trustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;
  try {
    // Only the configured origin is trusted; proxy/client Host headers cannot
    // expand the allowlist for contact, account, or checkout requests.
    return origin === siteUrl();
  } catch {
    return false;
  }
}
export async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new Error("Dữ liệu gửi lên không hợp lệ.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Thiếu dữ liệu.");
  let length = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 12000) {
      await reader.cancel();
      throw new Error("Nội dung quá dài.");
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}
export const privateHeaders = { "Cache-Control": "no-store" };
