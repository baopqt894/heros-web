import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { accountFromToken, accountOrders, claimGuestOrder, publicAccount, revokeSession, SESSION_COOKIE, INSTALLATION_COOKIE, SESSION_SECONDS, type LoginResult } from "@/lib/accounts";
import { backend, BackendError } from "@/lib/backend";
import { allowRequest } from "@/lib/store";
import { privateHeaders, readBody, trustedOrigin } from "@/lib/http";
import { siteUrl } from "@/lib/payos";
import type { PublicOrder } from "@/lib/commerce";
export const runtime = "nodejs";
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: privateHeaders });
function failure(error: unknown) { return json({ error: error instanceof Error ? error.message : "Chưa thể kết nối HEROS." }, error instanceof BackendError ? error.status : 400); }
export async function GET(request: Request) {
  try {
    const jar = await cookies(), token = jar.get(SESSION_COOKIE)?.value;
    const account = await accountFromToken(token);
    const cursor = new URL(request.url).searchParams.get("before");
    if (cursor && (!/^\d{1,16}$/.test(cursor) || !Number.isSafeInteger(Number(cursor))))
      return json({ error: "Mốc lịch sử không hợp lệ." }, 400);
    const guestOrders = (await Promise.all(jar.getAll().filter((c) => /^heros_order_\d{1,16}$/.test(c.name)).slice(0, 40).map(async (cookie) => {
      try { const data = await backend<{ order: PublicOrder }>(`commerce/guest-orders/${cookie.name.slice(12)}`, { guestToken: cookie.value }); return data.order; }
      catch (error) { if (error instanceof BackendError && error.status === 404) return null; throw error; }
    }))).filter((order): order is PublicOrder => order !== null).sort((a, b) => b.orderCode - a.orderCode);
    return json({ account, ...(account && token ? await accountOrders(token, Number(cursor) || undefined) : { orders: [], nextCursor: null }), guestOrders });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  if (!trustedOrigin(request)) return json({ error: "Nguồn yêu cầu không hợp lệ." }, 403);
  try {
    const body = await readBody(request) as Record<string, unknown>;
    if (!body || typeof body !== "object") return json({ error: "Dữ liệu không hợp lệ." }, 400);
    const jar = await cookies(), token = jar.get(SESSION_COOKIE)?.value;
    if (body.action === "logout") { await revokeSession(token); jar.delete(SESSION_COOKIE); return json({ account: null }); }
    if (!["login", "register", "recover", "request-otp", "claim"].includes(String(body.action)))
      return json({ error: "Thao tác không hợp lệ." }, 400);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    if (!allowRequest(`auth-ip:${ip}`, 30, 900000)) return json({ error: "Vui lòng thử lại sau ít phút." }, 429);
    if (body.action === "claim") {
      if (!token || !await accountFromToken(token)) return json({ error: "Vui lòng đăng nhập." }, 401);
      const code = Number(body.orderCode);
      if (!Number.isSafeInteger(code) || code < 1 || !await claimGuestOrder(code, jar.get(`heros_order_${code}`)?.value, token))
        return json({ error: "Không thể gắn đơn hàng này vào tài khoản." }, 403);
      return json({ claimed: true });
    }
    if (body.action === "request-otp") {
      if (!["register", "login"].includes(String(body.purpose))) return json({ error: "Yêu cầu xác minh không hợp lệ." }, 400);
      return json(await backend("auth/email/request-otp", { method: "POST", body: { email: body.email, purpose: body.purpose } }));
    }
    const installation = jar.get(INSTALLATION_COOKIE)?.value || `web-${randomUUID()}`;
    const deviceId = /^web-[a-f0-9-]{36}$/.test(installation) ? installation : `web-${randomUUID()}`;
    const result = await backend<LoginResult>(
      body.action === "register" ? "auth/web/register" : body.action === "recover" ? "auth/password/reset" : "auth/login",
      { method: "POST", body: body.action === "register"
        ? { email: body.email, password: body.password, otp: body.otp, fullName: body.name, deviceId }
        : body.action === "recover"
          ? { email: body.email, newPassword: body.password, otp: body.otp, deviceId, clientType: "web" }
          : { email: body.email, password: body.password, deviceId, clientType: "web" } });
    const options = { httpOnly: true, secure: siteUrl().startsWith("https:"), sameSite: "lax" as const, path: "/", maxAge: SESSION_SECONDS };
    jar.set(SESSION_COOKIE, result.accessToken, options);
    jar.set(INSTALLATION_COOKIE, deviceId, options);
    // Each legacy claim still requires its private browser capability and matching verified email.
    await Promise.all(jar.getAll().filter((c) => /^heros_order_\d{1,16}$/.test(c.name)).slice(0, 40).map((c) => claimGuestOrder(Number(c.name.slice(12)), c.value, result.accessToken)));
    return json({ account: publicAccount(result.user) }, body.action === "register" ? 201 : 200);
  } catch (error) { return failure(error); }
}
