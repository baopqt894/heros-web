import { cookies } from "next/headers";
import {
  accountFromToken,
  accountOrders,
  createSession,
  loginAccount,
  registerAccount,
  recoverAccount,
  revokeSession,
  claimGuestOrder,
  SESSION_COOKIE,
  SESSION_SECONDS,
} from "@/lib/accounts";
import { allowRequest, authorizeOrder, getOrder } from "@/lib/store";
import { privateHeaders, readBody, trustedOrigin } from "@/lib/http";
import { publicOrder } from "@/lib/commerce";
import { siteUrl } from "@/lib/payos";
export const runtime = "nodejs";
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: privateHeaders });
export async function GET(request: Request) {
  const jar = await cookies(),
    account = accountFromToken(jar.get(SESSION_COOKIE)?.value);
  const cursor = new URL(request.url).searchParams.get("before");
  if (cursor && !/^\d{1,16}$/.test(cursor))
    return json({ error: "Mốc lịch sử không hợp lệ." }, 400);
  const guestOrders = jar
    .getAll()
    .filter((c) => /^heros_order_\d{1,16}$/.test(c.name))
    .slice(0, 40)
    .flatMap((c) => {
      const order = getOrder(Number(c.name.slice("heros_order_".length)));
      return order && !order.accountId && authorizeOrder(order, c.value)
        ? [publicOrder(order)]
        : [];
    })
    .sort((a, b) => b.orderCode - a.orderCode);
  return json({
    account,
    ...(account
      ? accountOrders(account.id, Number(cursor) || undefined)
      : { orders: [], nextCursor: null }),
    guestOrders,
  });
}
export async function POST(request: Request) {
  if (!trustedOrigin(request))
    return json({ error: "Nguồn yêu cầu không hợp lệ." }, 403);
  let body: Record<string, unknown>;
  try {
    const parsed = await readBody(request);
    if (!parsed || typeof parsed !== "object") throw Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "Dữ liệu không hợp lệ." }, 400);
  }
  const jar = await cookies();
  if (body.action === "logout") {
    revokeSession(jar.get(SESSION_COOKIE)?.value);
    jar.delete(SESSION_COOKIE);
    return json({ account: null });
  }
  if (!["register", "login", "recover", "claim"].includes(String(body.action)))
    return json({ error: "Thao tác không hợp lệ." }, 400);
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allowRequest(`auth-ip:${ip}`, 30, 900000))
    return json(
      { error: "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau 15 phút." },
      429,
    );
  if (body.action === "claim") {
    const account = accountFromToken(jar.get(SESSION_COOKIE)?.value);
    if (!account) return json({ error: "Vui lòng đăng nhập." }, 401);
    const code = Number(body.orderCode);
    if (
      !Number.isSafeInteger(code) ||
      code < 1 ||
      !claimGuestOrder(code, jar.get(`heros_order_${code}`)?.value, account)
    )
      return json(
        {
          error:
            "Không thể gắn đơn này. Hãy dùng tài khoản có cùng email đặt hàng trên trình duyệt đã mua.",
        },
        403,
      );
    return json({ claimed: true });
  }
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (
    !allowRequest(`auth-email:${email}`, 10, 900000) ||
    !allowRequest("auth-global", 60, 60000)
  )
    return json({ error: "Vui lòng chờ ít phút trước khi thử lại." }, 429);
  try {
    const result =
      body.action === "register"
        ? await registerAccount(body)
        : body.action === "recover"
          ? await recoverAccount(body)
          : { account: await loginAccount(body), recoveryCode: undefined };
    revokeSession(jar.get(SESSION_COOKIE)?.value);
    jar.set(SESSION_COOKIE, createSession(result.account.id), {
      httpOnly: true,
      secure: siteUrl().startsWith("https:"),
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_SECONDS,
    });
    // Email alone never claims an order. A valid old browser capability is also required.
    for (const cookie of jar
      .getAll()
      .filter((c) => /^heros_order_\d{1,16}$/.test(c.name))
      .slice(0, 40))
      claimGuestOrder(
        Number(cookie.name.slice(12)),
        cookie.value,
        result.account,
      );
    return json(result, body.action === "register" ? 201 : 200);
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Chưa thể đăng nhập. Vui lòng thử lại.",
      },
      400,
    );
  }
}
