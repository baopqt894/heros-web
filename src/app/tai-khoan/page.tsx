import OrderLookup from "./order-lookup";
export const metadata = {
  title: "Đơn hàng & tài khoản | Heros",
  robots: { index: false, follow: false },
};
export default function AccountPage() {
  return (
    <main id="main" className="commerce-main">
      <OrderLookup />
    </main>
  );
}
