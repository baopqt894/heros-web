import { cookies } from "next/headers";
import { parseOrder, publicOrder } from "@/lib/commerce";
import { allowRequest, reserveOrder, setOrderStatus } from "@/lib/store";
import {
  checkoutEnabled,
  createPayment,
  refreshPayment,
  siteUrl,
} from "@/lib/payos";
import { privateHeaders, readBody, trustedOrigin } from "@/lib/http";
import { accountFromToken, canViewOrder, SESSION_COOKIE } from "@/lib/accounts";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!trustedOrigin(request))
    return Response.json(
      { error: "Nguồn yêu cầu không hợp lệ." },
      { status: 403, headers: privateHeaders },
    );
  if (!checkoutEnabled())
    return Response.json(
      { error: "Heros chưa mở tiếp nhận đơn hàng. Vui lòng quay lại sau." },
      { status: 503, headers: privateHeaders },
    );
  const jar = await cookies();
  const account = accountFromToken(jar.get(SESSION_COOKIE)?.value);
  if (!account)
    return Response.json(
      {
        error:
          "Vui lòng đăng nhập để đơn hàng được lưu trong tài khoản của bạn.",
      },
      { status: 401, headers: privateHeaders },
    );
  let input;
  try {
    input = parseOrder(await readBody(request));
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Thông tin không hợp lệ.",
      },
      { status: 400, headers: privateHeaders },
    );
  }
  if (
    !allowRequest(
      `checkout:${request.headers.get("x-forwarded-for")?.split(",")[0] || "local"}`,
      6,
    )
  )
    return Response.json(
      { error: "Bạn thao tác hơi nhanh. Vui lòng thử lại sau một phút." },
      { status: 429, headers: privateHeaders },
    );
  let reserved;
  try {
    reserved = reserveOrder(input, account.id);
  } catch {
    return Response.json(
      { error: "Không thể tạo đơn với thông tin này. Vui lòng thử lại." },
      { status: 409, headers: privateHeaders },
    );
  }
  const { token } = reserved;
  let { order } = reserved;
  if (token)
    jar.set(`heros_order_${order.orderCode}`, token, {
      httpOnly: true,
      secure: siteUrl().startsWith("https:"),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  else if (
    !canViewOrder(
      order,
      account,
      jar.get(`heros_order_${order.orderCode}`)?.value,
    )
  )
    return Response.json(
      { error: "Phiên đặt hàng không hợp lệ." },
      { status: 403, headers: privateHeaders },
    );
  if (order.method === "payos" && !order.checkoutUrl) {
    try {
      // Retry the same order code after a timeout; never generate a second order.
      if (!token) {
        try {
          order = await refreshPayment(order);
        } catch {
          return Response.json(
            {
              error:
                "Đang đối soát yêu cầu trước. Vui lòng kiểm tra lại trạng thái đơn.",
              order: publicOrder(order),
            },
            { status: 409, headers: privateHeaders },
          );
        }
      } else order = await createPayment(order);
    } catch {
      setOrderStatus(order.orderCode, "FAILED");
      return Response.json(
        {
          error:
            "Chưa nhận được phản hồi từ payOS. Vui lòng kiểm tra trạng thái đơn trước khi thử lại.",
          order: publicOrder({ ...order, status: "FAILED" }),
        },
        { status: 502, headers: privateHeaders },
      );
    }
  }
  return Response.json(
    { order: publicOrder(order) },
    { status: token ? 201 : 200, headers: privateHeaders },
  );
}
