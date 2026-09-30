import { Suspense } from "react";
import PaymentStatus from "./payment-status";
export const metadata = {
  title: "Trạng thái thanh toán | Heros",
  robots: { index: false, follow: false },
};
export default function PaymentPage() {
  return (
    <main id="main">
      <Suspense
        fallback={
          <p className="order-status-card">Đang tải thông tin đơn hàng…</p>
        }
      >
        <PaymentStatus />
      </Suspense>
    </main>
  );
}
