import { cookies } from "next/headers";
import { parseOrder } from "@/lib/commerce";
import { backend, BackendError } from "@/lib/backend";
import { SESSION_COOKIE } from "@/lib/accounts";
import { checkoutEnabled, siteUrl } from "@/lib/payos";
import { privateHeaders, readBody, trustedOrigin } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!trustedOrigin(request)) return Response.json({ error: "Nguồn yêu cầu không hợp lệ." }, { status: 403 });
  if (!checkoutEnabled()) return Response.json({ error: "Heros chưa mở tiếp nhận đơn hàng." }, { status: 503 });
  try {
    const jar = await cookies(), token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return Response.json({ error: "Vui lòng đăng nhập để đặt hàng." }, { status: 401 });
    const data = await backend<{ order: unknown; created: boolean; syncPending: boolean; guestToken: string | null }>("commerce/orders", { token, method: "POST", body: parseOrder(await readBody(request)) });
    if (data.guestToken) {
      const order = data.order as { orderCode: number };
      jar.set(`heros_order_${order.orderCode}`, data.guestToken, { httpOnly: true, secure: siteUrl().startsWith("https:"), sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    }
    return Response.json({ order: data.order, ...(data.syncPending ? { error: "Đang đối soát thanh toán. Vui lòng kiểm tra trạng thái đơn." } : {}) }, { status: data.syncPending ? 502 : data.created ? 201 : 200, headers: privateHeaders });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Không thể tạo đơn." }, { status: error instanceof BackendError ? error.status : 400, headers: privateHeaders });
  }
}
