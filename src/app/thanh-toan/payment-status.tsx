"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Copy,
  Printer,
  ArrowClockwise,
  WarningCircle,
  Receipt,
  UserCircle,
} from "@phosphor-icons/react";
import { statusLabels } from "@/lib/commerce";
import type { OrderDetails } from "@/lib/order-view";
import OrderDocument from "./order-document";
import { useAccount } from "../account-session";
export default function PaymentStatus() {
  const code = useSearchParams().get("orderCode");
  const { account } = useAccount();
  return (
    <PaymentDetails key={`${code}:${account?.id || "guest"}`} code={code} />
  );
}
function PaymentDetails({ code }: { code: string | null }) {
  const { account } = useAccount();
  const [order, setOrder] = useState<OrderDetails | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(true),
    [syncPending, setSyncPending] = useState(false),
    [copied, setCopied] = useState(false),
    [claiming, setClaiming] = useState(false);
  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (!code || !/^\d{1,16}$/.test(code)) return;
      try {
        const r = await fetch(`/api/orders/${code}`, {
          cache: "no-store",
          signal,
        });
        const data = await r.json();
        if (!r.ok) throw Error(data.error);
        if (signal?.aborted) return;
        setOrder(data.order);
        setError("");
        setSyncPending(data.syncPending);
      } catch (e) {
        if (!signal?.aborted)
          setError(
            e instanceof Error ? e.message : "Chưa thể kiểm tra đơn hàng.",
          );
      } finally {
        if (!signal?.aborted) setBusy(false);
      }
    },
    [code],
  );
  useEffect(() => {
    const controller = new AbortController();
    if (code && /^\d{1,16}$/.test(code))
      fetch(`/api/orders/${code}`, {
        cache: "no-store",
        signal: controller.signal,
      })
        .then(async (r) => {
          const data = await r.json();
          if (!r.ok) throw Error(data.error);
          return data;
        })
        .then((data) => {
          if (!controller.signal.aborted) {
            setOrder(data.order);
            setSyncPending(data.syncPending);
            setError("");
          }
        })
        .catch((e) => {
          if (!controller.signal.aborted) setError(e.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setBusy(false);
        });
    return () => controller.abort();
  }, [code, account]);
  const status = order?.status;
  useEffect(() => {
    if (
      !status ||
      ["PAID", "COD_CONFIRMED", "CANCELLED", "EXPIRED"].includes(status)
    )
      return;
    const controller = new AbortController();
    let count = 0;
    const timer = setInterval(() => {
      if (++count > 24) {
        clearInterval(timer);
        return;
      }
      void refresh(controller.signal);
    }, 10000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [status, refresh]);
  async function claim() {
    setClaiming(true);
    try {
      const r = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim", orderCode: Number(code) }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa thể lưu đơn.");
    } finally {
      setClaiming(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(String(code));
      setCopied(true);
    } catch {
      setError("Bạn có thể chọn và sao chép mã đơn hiển thị trên trang.");
    }
  }
  if (!code || !/^\d{1,16}$/.test(code))
    return (
      <section className="order-access-state">
        <Receipt size={42} />
        <h1>Mở đơn hàng của bạn.</h1>
        <p>Đăng nhập để xem danh sách đơn. Bạn không cần nhớ mã đơn hàng.</p>
        <Link className="button" href="/tai-khoan">
          Đến đơn hàng của tôi
          <ArrowRight size={18} />
        </Link>
      </section>
    );
  if (!order)
    return (
      <section className="order-access-state" aria-live="polite">
        {busy ? (
          <>
            <div className="commerce-skeleton" />
            <h1>Đang mở đơn hàng…</h1>
            <p>Heros đang kiểm tra thông tin thanh toán.</p>
          </>
        ) : (
          <>
            <UserCircle size={48} />
            <h1>Đơn hàng vẫn ở đây.</h1>
            <p>
              {error || "Đăng nhập tài khoản mua hàng để xem lại thông tin."}
            </p>
            <Link className="button" href="/tai-khoan">
              Đăng nhập & xem đơn hàng
              <ArrowRight size={18} />
            </Link>
            <Link className="text-link" href="/lien-he">
              Cần hỗ trợ tìm đơn?
            </Link>
          </>
        )}
      </section>
    );
  const paid = status === "PAID",
    cod = status === "COD_CONFIRMED",
    stopped = status === "CANCELLED" || status === "EXPIRED",
    canPay =
      !!order.checkoutUrl &&
      ["PENDING", "UNDERPAID", "PROCESSING"].includes(order.status);
  return (
    <div className="order-detail-shell">
      <div className="order-topbar no-print">
        <Link href="/tai-khoan">
          <ArrowLeft size={17} />
          Đơn hàng của tôi
        </Link>
        <span>Heros ở đây để hỗ trợ bạn</span>
      </div>
      <header className="order-success-header no-print">
        <div
          className={`order-state-icon ${paid || cod ? "is-confirmed" : ""}`}
        >
          {paid || cod ? (
            <Check size={30} />
          ) : stopped ? (
            <WarningCircle size={30} />
          ) : (
            <Clock size={30} />
          )}
        </div>
        <div>
          <p className="document-label">
            {paid
              ? "Cảm ơn bạn đã chọn Heros"
              : cod
                ? "Heros đã tiếp nhận đơn"
                : "Đơn hàng Heros"}
          </p>
          <h1>
            {paid
              ? "Một sự quan tâm đang đến."
              : cod
                ? "Đã lưu đơn hàng của bạn."
                : statusLabels[order.status]}
          </h1>
          <p>
            {paid
              ? "Thanh toán đã được xác nhận. Bạn có thể xem lại thông tin và lưu phiếu đơn hàng bên dưới."
              : cod
                ? "Bạn sẽ thanh toán khi nhận hàng. Đơn này chưa được ghi nhận đã thanh toán."
                : stopped
                  ? "Link thanh toán này đã kết thúc. Bạn vẫn có thể xem thông tin đơn hoặc nhắn Heros để được hỗ trợ."
                  : "Đơn đã được lưu. Hoàn tất thanh toán để Heros ghi nhận đơn của bạn."}
          </p>
        </div>
      </header>
      <div className="order-detail-grid">
        <div>
          <div className="document-toolbar no-print">
            <h2>Chi tiết đơn hàng</h2>
            <button onClick={() => window.print()}>
              <Printer size={18} />
              In / Lưu PDF
            </button>
          </div>
          <OrderDocument order={order} />
        </div>
        <aside className="order-sidebar no-print">
          <section className="order-next">
            <p className="document-label">Bước tiếp theo</p>
            <h2>
              {paid || cod
                ? "Theo dõi từ tài khoản."
                : canPay
                  ? "Hoàn tất thanh toán."
                  : "Heros luôn sẵn sàng hỗ trợ."}
            </h2>
            <p>
              {order.accountLinked
                ? "Đơn hàng đã được lưu vào tài khoản. Khi quay lại, bạn chỉ cần đăng nhập — không cần nhớ mã đơn."
                : "Lưu đơn vào tài khoản để dễ tìm lại khi đổi thiết bị hoặc xóa lịch sử trình duyệt."}
            </p>
            {canPay && (
              <a className="button" href={order.checkoutUrl!}>
                Thanh toán tại payOS
                <ArrowRight size={18} />
              </a>
            )}
            {order.accountLinked ? (
              <Link
                className={`button ${canPay ? "secondary" : ""}`}
                href="/tai-khoan"
              >
                Xem tất cả đơn hàng
                <ArrowRight size={18} />
              </Link>
            ) : account ? (
              <button className="button" disabled={claiming} onClick={claim}>
                {claiming ? "Đang lưu…" : "Lưu đơn vào tài khoản"}
              </button>
            ) : (
              <Link className="button" href="/tai-khoan">
                Đăng nhập để lưu đơn
                <ArrowRight size={18} />
              </Link>
            )}
          </section>
          <section className="order-reference">
            <span>Mã đơn hàng</span>
            <strong>#{code}</strong>
            <button onClick={copy}>
              <Copy size={16} />
              {copied ? "Đã sao chép" : "Sao chép mã đơn"}
            </button>
            <div>
              <span>Thanh toán</span>
              <strong className={paid ? "payment-verified" : ""}>
                {statusLabels[order.status]}
              </strong>
            </div>
            {!paid && !cod && (
              <button
                disabled={busy}
                onClick={() => {
                  setBusy(true);
                  void refresh();
                }}
              >
                <ArrowClockwise size={16} />
                {busy ? "Đang kiểm tra…" : "Kiểm tra lại thanh toán"}
              </button>
            )}
            {syncPending && (
              <p role="status">
                payOS chưa phản hồi. Heros sẽ tiếp tục kiểm tra; trạng thái
                thanh toán chưa thay đổi.
              </p>
            )}
          </section>
          <div className="order-help">
            <p>Có điều muốn hỏi về đơn hàng?</p>
            <Link href="/lien-he">
              Nhắn Heros nhé <ArrowRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
      {error && (
        <p role="alert" className="form-error no-print">
          {error}
        </p>
      )}
    </div>
  );
}
