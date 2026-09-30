export const UNIT_PRICE = 590000;
export const SHIPPING_FEE = 0;
export type Customer = {
  name: string;
  email: string;
  phone: string;
  address: string;
};
export type OrderInput = Customer & {
  quantity: number;
  method: "payos" | "cod";
  requestId: string;
};
export type OrderStatus =
  | "CREATING"
  | "PENDING"
  | "UNDERPAID"
  | "PROCESSING"
  | "PAID"
  | "CANCELLED"
  | "EXPIRED"
  | "FAILED"
  | "COD_CONFIRMED";
export type PublicOrder = {
  orderCode: number;
  quantity: number;
  amount: number;
  method: "payos" | "cod";
  status: OrderStatus;
  checkoutUrl: string | null;
  createdAt: string;
};
export const statusLabels: Record<OrderStatus, string> = {
  CREATING: "Đang tạo thanh toán",
  PENDING: "Chờ thanh toán",
  UNDERPAID: "Chưa nhận đủ thanh toán",
  PROCESSING: "Đang xác nhận thanh toán",
  PAID: "Đã thanh toán",
  CANCELLED: "Đã hủy thanh toán",
  EXPIRED: "Link thanh toán đã hết hạn",
  FAILED: "Chưa thể tạo thanh toán",
  COD_CONFIRMED: "Đã tiếp nhận đơn COD",
};
export function parseOrder(value: unknown): OrderInput {
  if (!value || typeof value !== "object")
    throw new Error("Thông tin đơn hàng không hợp lệ.");
  const v = value as Record<string, unknown>;
  const text = (key: string, min: number, max: number) => {
    if (typeof v[key] !== "string")
      throw new Error("Vui lòng kiểm tra thông tin nhận hàng.");
    const s = v[key].trim();
    if (s.length < min || s.length > max || /[\u0000-\u001f]/.test(s))
      throw new Error("Vui lòng kiểm tra thông tin nhận hàng.");
    return s;
  };
  const name = text("name", 2, 100),
    email = text("email", 3, 254),
    phone = text("phone", 10, 12),
    address = text("address", 10, 500);
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !/^(0|\+84)[0-9]{9}$/.test(phone)
  )
    throw new Error("Email hoặc số điện thoại không hợp lệ.");
  if (
    !Number.isInteger(v.quantity) ||
    Number(v.quantity) < 1 ||
    Number(v.quantity) > 10
  )
    throw new Error("Số lượng phải từ 1 đến 10.");
  if (v.method !== "payos" && v.method !== "cod")
    throw new Error("Phương thức thanh toán không hợp lệ.");
  const requestId = text("requestId", 36, 36);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      requestId,
    )
  )
    throw new Error("Phiên đặt hàng không hợp lệ. Vui lòng tải lại trang.");
  return {
    name,
    email,
    phone,
    address,
    quantity: Number(v.quantity),
    method: v.method,
    requestId,
  };
}
export function publicOrder(order: PublicOrder): PublicOrder {
  return {
    orderCode: order.orderCode,
    quantity: order.quantity,
    amount: order.amount,
    method: order.method,
    status: order.status,
    checkoutUrl: order.checkoutUrl,
    createdAt: order.createdAt,
  };
}
