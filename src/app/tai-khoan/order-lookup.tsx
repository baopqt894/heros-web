"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, SignOut, Receipt, Package } from "@phosphor-icons/react";
import { useAccount } from "../account-session";
import AuthForm from "../auth-form";
import { statusLabels, type PublicOrder } from "@/lib/commerce";
import { formatDate, formatMoney } from "@/lib/order-view";
type History = {
  orders: PublicOrder[];
  guestOrders: PublicOrder[];
  nextCursor: number | null;
};
export default function OrderLookup() {
  const { account, loading, reload, error: sessionError } = useAccount();
  const [history, setHistory] = useState<History | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState("all");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/account", { cache: "no-store", signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw Error("Chưa thể tải lịch sử đơn hàng.");
        return r.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setHistory(data);
          setError("");
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [account]);
  async function loadMore() {
    if (!history?.nextCursor) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/account?before=${history.nextCursor}`, {
        cache: "no-store",
      });
      if (!r.ok) throw Error("Chưa thể tải thêm đơn hàng.");
      const data = await r.json();
      setHistory((previous) =>
        previous
          ? { ...data, orders: [...previous.orders, ...data.orders] }
          : data,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa thể tải thêm.");
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      const r = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      if (!r.ok) throw Error("Chưa thể đăng xuất.");
      setHistory(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa thể đăng xuất.");
    } finally {
      setBusy(false);
    }
  }
  if (loading)
    return (
      <div className="commerce-loading" role="status">
        Đang mở không gian của bạn…
      </div>
    );
  const orders =
    history?.orders.filter(
      (o) =>
        filter === "all" ||
        (filter === "paid"
          ? o.status === "PAID"
          : [
              "PENDING",
              "PROCESSING",
              "UNDERPAID",
              "CREATING",
              "FAILED",
            ].includes(o.status)),
    ) || [];
  return (
    <div className="account-workspace">
      {account ? (
        <>
          <header className="account-heading">
            <div>
              <p className="document-label">Không gian của bạn</p>
              <h1>Chào {account.name}.</h1>
              <p>Mọi đơn hàng, luôn ở đây.</p>
            </div>
            <button className="quiet-button" onClick={logout} disabled={busy}>
              <SignOut size={18} />
              Đăng xuất
            </button>
          </header>
          <div className="account-profile">
            <span>{account.name.slice(0, 1).toLocaleUpperCase("vi")}</span>
            <div>
              <strong>{account.name}</strong>
              <p>{account.email}</p>
            </div>
            <small>Tài khoản mua hàng Heros</small>
          </div>
          <section className="order-history">
            <div className="history-heading">
              <h2>Đơn hàng của tôi</h2>
              <Link href="/#dat-hang">
                Đặt thêm Heros <ArrowRight size={16} />
              </Link>
            </div>
            <div className="history-filters" aria-label="Lọc đơn hàng">
              {[
                ["all", "Tất cả"],
                ["paid", "Đã thanh toán"],
                ["pending", "Chờ thanh toán"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={filter === value ? "active" : ""}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            {!history ? (
              <p role="status">Đang tải đơn hàng…</p>
            ) : orders.length === 0 ? (
              <div className="history-empty">
                <Package size={42} />
                <h3>
                  {filter === "all"
                    ? "Hành trình của bạn bắt đầu từ đây."
                    : "Chưa có đơn ở mục này."}
                </h3>
                <p>
                  {filter === "all"
                    ? "Khi đặt Heros, đơn hàng sẽ tự xuất hiện tại đây. Bạn không cần lưu mã đơn."
                    : "Chọn “Tất cả” để xem các đơn hàng khác."}
                </p>
                {filter === "all" && (
                  <Link className="button" href="/#dat-hang">
                    Khám phá Heros <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            ) : (
              <div className="history-list">
                {orders.map((order) => (
                  <article className="history-order" key={order.orderCode}>
                    <div className="history-order-top">
                      <span>
                        #{order.orderCode}
                        <small>{formatDate(order.createdAt)}</small>
                      </span>
                      <span
                        className={`order-badge ${order.status === "PAID" ? "is-paid" : ""}`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <div className="history-order-body">
                      <Image
                        src="/images/heros-product.png"
                        width={74}
                        height={86}
                        alt=""
                      />
                      <div>
                        <h3>Heros · Hồng phấn</h3>
                        <p>
                          Số lượng {order.quantity} ·{" "}
                          {order.method === "payos" ? "payOS" : "COD"}
                        </p>
                      </div>
                      <strong>{formatMoney(order.amount)}</strong>
                    </div>
                    <Link
                      className="history-detail-link"
                      href={`/thanh-toan?orderCode=${order.orderCode}`}
                    >
                      <Receipt size={18} />
                      Chi tiết & phiếu đơn hàng
                      <ArrowRight size={18} />
                    </Link>
                  </article>
                ))}
              </div>
            )}
            {history?.nextCursor && (
              <button
                className="quiet-button"
                onClick={loadMore}
                disabled={busy}
              >
                {busy ? "Đang tải…" : "Xem thêm đơn hàng"}
              </button>
            )}
          </section>
        </>
      ) : (
        <div className="account-entry">
          <div className="account-entry-copy">
            <p className="document-label">Tài khoản Heros</p>
            <h1>
              Không cần nhớ mã.
              <br />
              <span>Chỉ cần nhớ bạn.</span>
            </h1>
            <p>
              Đăng nhập để xem lại đơn hàng, kiểm tra thanh toán và lưu phiếu
              mua hàng — trên bất kỳ thiết bị nào.
            </p>
            <div className="account-entry-note">
              <Receipt size={26} />
              <span>
                Mua một lần.
                <br />
                Dễ dàng tìm lại bất cứ lúc nào.
              </span>
            </div>
          </div>
          <AuthForm />
        </div>
      )}
      {(error || sessionError) && (
        <p className="form-error" role="alert">
          {error || sessionError}
        </p>
      )}
      {history && history.guestOrders.length > 0 && (
        <aside className="legacy-orders">
          <h2>Đơn trước đây trên trình duyệt này</h2>
          <p>
            Đăng nhập bằng email đã dùng để đặt hàng. Heros sẽ lưu những đơn này
            vào tài khoản của bạn.
          </p>
          {history.guestOrders.map((order) => (
            <Link
              key={order.orderCode}
              href={`/thanh-toan?orderCode=${order.orderCode}`}
            >
              Đơn #{order.orderCode}
              <ArrowRight size={16} />
            </Link>
          ))}
        </aside>
      )}
      <p className="account-support">
        Cần một người hỗ trợ? <Link href="/lien-he">Nhắn Heros nhé.</Link>
      </p>
    </div>
  );
}
