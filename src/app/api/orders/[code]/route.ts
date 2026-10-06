import { cookies } from "next/headers";
import { backend, BackendError } from "@/lib/backend";
import { SESSION_COOKIE } from "@/lib/accounts";
import { privateHeaders } from "@/lib/http";
export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  if (!/^\d{1,16}$/.test(code)) return Response.json({ error: "Mã đơn không hợp lệ." }, { status: 400 });
  try {
    const jar = await cookies(), rawToken = jar.get(SESSION_COOKIE)?.value;
    const token = rawToken?.includes(".") ? rawToken : undefined;
    const guestToken = jar.get(`heros_order_${code}`)?.value;
    let data;
    try { data = await backend(token ? `commerce/orders/${code}` : `commerce/guest-orders/${code}`, { token, guestToken }); }
    catch (error) {
      if (!token || !guestToken || !(error instanceof BackendError) || ![401, 404].includes(error.status)) throw error;
      data = await backend(`commerce/guest-orders/${code}`, { guestToken });
    }
    return Response.json(data, { headers: privateHeaders });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Không thể đọc đơn." }, { status: error instanceof BackendError ? error.status : 503, headers: privateHeaders });
  }
}
