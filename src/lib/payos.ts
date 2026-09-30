import "server-only";
import { PayOS } from "@payos/node";
import {
  getOrder,
  setOrderStatus,
  setPaymentLink,
  type StoredOrder,
} from "./store.ts";
export function payosConfigured() {
  return Boolean(
    process.env.PAYOS_CLIENT_ID &&
    process.env.PAYOS_API_KEY &&
    process.env.PAYOS_CHECKSUM_KEY,
  );
}
export function checkoutEnabled() {
  return process.env.HEROS_CHECKOUT_ENABLED === "true" && payosConfigured();
}
export function payosClient() {
  if (!payosConfigured()) throw new Error("payOS chưa được cấu hình.");
  return new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
    baseURL: "https://api-merchant.payos.vn",
    timeout: 15000,
    maxRetries: 0,
    logLevel: "off",
  });
}
export function siteUrl() {
  const url = new URL(process.env.HEROS_SITE_URL || "http://127.0.0.1:3000");
  if (
    url.protocol !== "https:" &&
    !["localhost", "127.0.0.1"].includes(url.hostname)
  )
    throw new Error("Cần cấu hình URL HTTPS cho website.");
  return url.origin;
}
export function validatePayment(
  order: StoredOrder,
  payment: {
    orderCode: number;
    amount: number;
    id: string;
    status: string;
    amountPaid: number;
  },
) {
  if (
    payment.orderCode !== order.orderCode ||
    payment.amount !== order.amount ||
    (order.paymentLinkId && payment.id !== order.paymentLinkId)
  )
    throw new Error("Thông tin thanh toán không khớp đơn hàng.");
  if (payment.status === "PAID" && payment.amountPaid < order.amount)
    throw new Error("Chưa nhận đủ thanh toán.");
}
export async function refreshPayment(order: StoredOrder) {
  const payment = await payosClient().paymentRequests.get(order.orderCode);
  validatePayment(order, payment);
  setPaymentLink(
    order.orderCode,
    payment.id,
    order.checkoutUrl ||
      `https://pay.payos.vn/web/${encodeURIComponent(payment.id)}`,
  );
  setOrderStatus(order.orderCode, payment.status);
  return getOrder(order.orderCode)!;
}
export async function createPayment(order: StoredOrder) {
  const callback = `${siteUrl()}/thanh-toan?orderCode=${order.orderCode}`;
  // Keep shipping details local. payOS only needs the order and payable amount.
  const payment = await payosClient().paymentRequests.create({
    orderCode: order.orderCode,
    amount: order.amount,
    description: `HEROS ${order.orderCode}`,
    items: [
      {
        name: "Heros hồng phấn",
        quantity: order.quantity,
        price: order.amount / order.quantity,
      },
    ],
    returnUrl: callback,
    cancelUrl: callback,
    expiredAt: Math.floor(Date.now() / 1000) + 1800,
  });
  if (
    payment.orderCode !== order.orderCode ||
    payment.amount !== order.amount ||
    payment.currency !== "VND"
  )
    throw new Error("Thông tin thanh toán không khớp.");
  const url = new URL(payment.checkoutUrl);
  if (url.protocol !== "https:" || !["pay.payos.vn"].includes(url.hostname))
    throw new Error("Đường dẫn thanh toán không hợp lệ.");
  setPaymentLink(order.orderCode, payment.paymentLinkId, payment.checkoutUrl);
  return getOrder(order.orderCode)!;
}
