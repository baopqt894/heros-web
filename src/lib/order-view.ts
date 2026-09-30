import type { Customer, PublicOrder } from "./commerce";
export type OrderDetails = PublicOrder & {
  customer: Customer;
  accountLinked: boolean;
  paidAt: string | null;
};
export const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
export const receiptNumber = (code: number) => `HRS-${code}`;
