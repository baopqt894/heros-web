import { cookies } from "next/headers";
import { claimRefresh, getOrder } from "@/lib/store";
import {
  accountFromToken,
  canViewOrder,
  orderDetails,
  SESSION_COOKIE,
} from "@/lib/accounts";
import { refreshPayment } from "@/lib/payos";
import { privateHeaders } from "@/lib/http";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  if (!/^\d{1,16}$/.test(code))
    return Response.json(
      { error: "Mã đơn không hợp lệ." },
      { status: 400, headers: privateHeaders },
    );
  let order = getOrder(Number(code));
  const jar = await cookies();
  const account = accountFromToken(jar.get(SESSION_COOKIE)?.value);
  if (
    !order ||
    !canViewOrder(order, account, jar.get(`heros_order_${code}`)?.value)
  )
    return Response.json(
      { error: "Vui lòng đăng nhập tài khoản đã đặt hàng để xem đơn này." },
      { status: 404, headers: privateHeaders },
    );
  let syncPending = false;
  if (
    order.method === "payos" &&
    !["PAID", "CANCELLED", "EXPIRED"].includes(order.status) &&
    claimRefresh(order.orderCode)
  ) {
    try {
      order = await refreshPayment(order);
    } catch {
      syncPending = true;
    }
  }
  return Response.json(
    { order: orderDetails(order), syncPending },
    { headers: privateHeaders },
  );
}
