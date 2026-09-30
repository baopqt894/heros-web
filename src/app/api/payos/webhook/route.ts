import { payosClient, payosConfigured, refreshPayment } from "@/lib/payos";
import { getOrder } from "@/lib/store";
import { readBody } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!payosConfigured())
    return Response.json({ error: "Not configured" }, { status: 503 });
  let event;
  try {
    event = await payosClient().webhooks.verify(
      (await readBody(request)) as Parameters<
        ReturnType<typeof payosClient>["webhooks"]["verify"]
      >[0],
    );
  } catch {
    return Response.json(
      { error: "Invalid signature or payload" },
      { status: 400 },
    );
  }
  const order = getOrder(event.orderCode);
  // payOS sends a signed sample while confirming an endpoint. Unknown orders never mutate data.
  if (!order) return Response.json({ received: true });
  if (
    order.method !== "payos" ||
    (order.paymentLinkId && order.paymentLinkId !== event.paymentLinkId)
  )
    return Response.json({ error: "Order mismatch" }, { status: 400 });
  if (event.code !== "00" || event.currency !== "VND")
    return Response.json({ received: true });
  try {
    await refreshPayment(order);
  } catch {
    return Response.json(
      { error: "Unable to reconcile payment" },
      { status: 503 },
    );
  }
  return Response.json({ received: true });
}
