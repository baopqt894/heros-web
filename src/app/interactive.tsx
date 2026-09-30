"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "./account-session";
import AuthForm from "./auth-form";
import {
  UNIT_PRICE,
  SHIPPING_FEE,
  type Customer,
  type PublicOrder,
} from "@/lib/commerce";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  Bag,
  Check,
  CreditCard,
  Heart,
  List,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  X,
} from "@phosphor-icons/react";

export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduced ? 0 : 0.65 }}
    >
      {children}
    </motion.div>
  );
}

export function Navigation() {
  const { account } = useAccount();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="header">
      <div className="wide-shell nav-inner">
        <Link className="brand" href="/" aria-label="Heros - Trang chủ">
          <span className="logo-mark">
            <Image src="/images/heros-logo.png" alt="" width={60} height={60} />
          </span>
          <span>
            HEROS<small>SAFETY WITH YOU</small>
          </span>
        </Link>
        <nav
          className={open ? "nav-links open" : "nav-links"}
          aria-label="Điều hướng chính"
        >
          {[
            ["Trang chủ", "/"],
            ["Về chúng tôi", "/ve-chung-toi"],
            ["Sản phẩm", "/san-pham"],
            ["Download", "/download"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            className="account-link"
            href="/tai-khoan"
            aria-current={pathname === "/tai-khoan" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {account ? "Đơn hàng của tôi" : "Tài khoản"}
          </Link>
        </nav>
        <Link className="button small" href="/#dat-hang">
          Đặt Heros <Bag size={17} />
        </Link>
        <button
          className="menu-button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <List size={24} />}
        </button>
      </div>
    </header>
  );
}

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );
export function Order({ enabled }: { enabled: boolean }) {
  const { account, loading: accountLoading } = useAccount();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState<"payos" | "cod">("payos");
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pendingOrder, setPendingOrder] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const requestId = useRef("");
  const fingerprint = useRef("");
  const submitting = useRef(false);
  const total = quantity * UNIT_PRICE + SHIPPING_FEE;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = {
      name: String(data.get("name")).trim(),
      phone: String(data.get("phone")).trim(),
      email: String(data.get("email")).trim(),
      address: String(data.get("address")).trim(),
    };
    const key = JSON.stringify({ ...next, quantity, method });
    if (fingerprint.current !== key) {
      requestId.current = crypto.randomUUID();
      fingerprint.current = key;
      setPendingOrder(null);
    }
    setCustomer(next);
    setError("");
    dialog.current?.showModal();
  }
  async function confirm() {
    if (submitting.current || !enabled || !account) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          quantity,
          method,
          requestId: requestId.current,
        }),
      });
      const result = (await response.json()) as {
        order?: PublicOrder;
        error?: string;
      };
      if (result.order) {
        setPendingOrder(result.order.orderCode);
        try {
          localStorage.setItem(
            "heros_last_order",
            String(result.order.orderCode),
          );
        } catch {
          /* Cookies still authorize the order if browser storage is unavailable. */
        }
      }
      if (!response.ok || !result.order)
        throw new Error(
          result.error || "Chưa thể tiếp nhận đơn hàng. Vui lòng thử lại.",
        );
      if (
        result.order.checkoutUrl &&
        ["PENDING", "UNDERPAID", "PROCESSING"].includes(result.order.status)
      )
        window.location.assign(result.order.checkoutUrl);
      else router.push(`/thanh-toan?orderCode=${result.order.orderCode}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể kết nối. Vui lòng thử lại.",
      );
      setBusy(false);
      submitting.current = false;
    }
  }
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const update = () => {
      document.body.style.overflow = element.open ? "hidden" : "";
    };
    const observer = new MutationObserver(update);
    observer.observe(element, { attributes: true, attributeFilter: ["open"] });
    return () => {
      observer.disconnect();
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <section id="dat-hang" className="order-section section">
      <div className="shell order-grid">
        <div className="order-intro">
          <span className="eyebrow">MỘT MÓN QUÀ CỦA SỰ QUAN TÂM</span>
          <h2>
            Mang an tâm
            <br />
            về bên bạn.
          </h2>
          <p>
            Dành cho bản thân, hay một người bạn thương.
            <br />
            Heros luôn là một lời nhắn: “Có tớ ở đây.”
          </p>
          <div className="order-product">
            <Image
              src="/images/heros-product.png"
              alt="Heros hồng phấn cùng dây đeo"
              width={460}
              height={460}
              sizes="(max-width: 768px) 90vw, 400px"
            />
            <div>
              <h3>Heros • Hồng phấn</h3>
              <span>Thiết bị SOS & dây đeo</span>
            </div>
          </div>
          <p className="demo-note">
            {enabled
              ? "590.000đ/thiết bị · Miễn phí giao hàng. Thanh toán chuyển khoản qua payOS hoặc khi nhận hàng."
              : "590.000đ/thiết bị · Heros đang chuẩn bị mở tiếp nhận đơn hàng."}
          </p>
        </div>
        <div className="checkout-column">
          <div className="checkout-account">
            <p className="document-label">01 / Tài khoản mua hàng</p>
            {accountLoading ? (
              <p>Đang kiểm tra tài khoản…</p>
            ) : account ? (
              <div className="checkout-signed-in">
                <Check size={20} />
                <span>
                  Đặt hàng với <strong>{account.email}</strong>
                  <small>Đơn hàng sẽ tự lưu vào tài khoản này.</small>
                </span>
                <Link href="/tai-khoan">Xem tài khoản</Link>
              </div>
            ) : (
              <AuthForm compact />
            )}
          </div>
          <form className="order-form" onSubmit={submit}>
            <p className="document-label">02 / Sản phẩm & nhận hàng</p>
            <div className="form-heading">
              <h3>Heros của bạn</h3>
              <Heart size={23} />
            </div>
            <div className="product-line">
              <div>
                <strong>Thiết bị Heros</strong>
                <span>
                  <i className="color-swatch" />
                  Hồng phấn
                </span>
              </div>
              <div className="quantity">
                <button
                  type="button"
                  aria-label="Giảm số lượng"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity === 1}
                >
                  <Minus />
                </button>
                <output aria-live="polite">{quantity}</output>
                <button
                  type="button"
                  aria-label="Tăng số lượng"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  disabled={quantity === 10}
                >
                  <Plus />
                </button>
              </div>
            </div>
            <h4>Thông tin nhận hàng</h4>
            <div className="fields">
              <label>
                Họ và tên
                <input
                  name="name"
                  key={`name-${account?.id || "guest"}`}
                  defaultValue={account?.name || ""}
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  pattern=".*\S.*"
                  placeholder="Tên của bạn"
                />
              </label>
              <label>
                Số điện thoại
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  pattern="(0|\+84)[0-9]{9}"
                  title="Số điện thoại Việt Nam bắt đầu bằng 0 hoặc +84."
                  placeholder="09xxxxxxxx"
                />
              </label>
              <label className="full">
                Email
                <input
                  name="email"
                  key={`email-${account?.id || "guest"}`}
                  defaultValue={account?.email || ""}
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="ban@email.com"
                />
              </label>
              <label className="full">
                Địa chỉ nhận hàng
                <textarea
                  name="address"
                  autoComplete="street-address"
                  required
                  minLength={10}
                  maxLength={500}
                  placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố"
                  rows={2}
                />
              </label>
            </div>
            <fieldset>
              <legend>Phương thức thanh toán</legend>
              <label
                className={`payment-option ${method === "payos" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="payos"
                  checked={method === "payos"}
                  onChange={() => setMethod("payos")}
                />
                <CreditCard size={22} />
                <span>
                  Chuyển khoản qua payOS
                  <small>Quét QR trên trang thanh toán bảo mật</small>
                </span>
              </label>
              <label
                className={`payment-option ${method === "cod" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={method === "cod"}
                  onChange={() => setMethod("cod")}
                />
                <Truck size={22} />
                <span>
                  Thanh toán khi nhận hàng
                  <small>Thanh toán cho đơn vị giao hàng</small>
                </span>
              </label>
            </fieldset>
            <div className="total-row">
              <span>Sản phẩm × {quantity}</span>
              <span>{money(quantity * UNIT_PRICE)}</span>
            </div>
            <div className="total-row">
              <span>Phí giao hàng</span>
              <span>Miễn phí</span>
            </div>
            <div className="grand-total">
              <strong>Tổng cộng</strong>
              <strong>{money(total)}</strong>
            </div>
            <button
              className="button submit"
              type="submit"
              disabled={!account || accountLoading}
            >
              {account ? "Xem lại đơn hàng" : "Đăng nhập ở trên để tiếp tục"}
              <ArrowRight size={20} />
            </button>
            <p className="form-note">
              <ShieldCheck size={16} />
              Kiểm tra thông tin trước khi xác nhận.
            </p>
          </form>
        </div>
      </div>
      <dialog
        ref={dialog}
        className="checkout-dialog"
        aria-labelledby="checkout-title"
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <button
          className="close-dialog"
          aria-label="Đóng thanh toán"
          disabled={busy}
          onClick={() => dialog.current?.close()}
        >
          <X size={23} />
        </button>
        <h2 id="checkout-title">Một chút nữa thôi.</h2>
        <p>Kiểm tra thông tin trước khi đặt hàng.</p>
        <div className="review-box">
          <strong>{customer.name}</strong>
          <span>
            {customer.phone} · {customer.email}
          </span>
          <span>{customer.address}</span>
        </div>
        <div className="total-row">
          <span>Heros hồng phấn × {quantity}</span>
          <strong>{money(total)}</strong>
        </div>
        <p>
          {method === "payos"
            ? "Bạn sẽ được chuyển đến payOS để quét QR. Đơn chỉ được xác nhận đã thanh toán sau khi payOS ghi nhận tiền."
            : "Heros sẽ tiếp nhận đơn COD. Bạn thanh toán khi nhận hàng."}
        </p>
        {!enabled && (
          <p className="pending-note">
            Heros chưa mở tiếp nhận đơn hàng. Vui lòng quay lại sau.
          </p>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button
          className="button submit"
          disabled={busy || !enabled || !account || Boolean(pendingOrder)}
          onClick={confirm}
        >
          {busy
            ? "Đang tạo đơn…"
            : method === "payos"
              ? "Đến payOS thanh toán"
              : "Xác nhận đơn COD"}
          <Check size={20} />
        </button>
        {pendingOrder && (
          <Link
            className="order-saved"
            href={`/thanh-toan?orderCode=${pendingOrder}`}
          >
            Kiểm tra đơn #{pendingOrder}
          </Link>
        )}
        <button
          className="text-button"
          disabled={busy}
          onClick={() => dialog.current?.close()}
        >
          Quay lại chỉnh sửa
        </button>
      </dialog>
    </section>
  );
}

export function ContactForm() {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const sending = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    const form = event.currentTarget,
      data = new FormData(form);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage(result.message);
      form.reset();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Chưa thể gửi lời nhắn. Vui lòng thử lại.",
      );
    } finally {
      setBusy(false);
      sending.current = false;
    }
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-name-fields">
        <label>
          Tên của bạn
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            placeholder="Bạn tên là…"
          />
        </label>
        <label>
          Số điện thoại (không bắt buộc)
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            pattern="(0|\+84)[0-9]{9}"
            placeholder="09xxxxxxxx"
          />
        </label>
      </div>
      <label>
        Email của bạn
        <input
          name="email"
          aria-label="Email liên hệ"
          type="email"
          autoComplete="email"
          required
          placeholder="ban@email.com"
          maxLength={254}
        />
      </label>
      <label>
        Lời nhắn cho chúng tớ
        <textarea
          name="message"
          required
          minLength={5}
          maxLength={2000}
          rows={5}
          placeholder="Bạn muốn chia sẻ điều gì với Heros?"
        />
      </label>
      <button className="button" type="submit" disabled={busy}>
        {busy ? "Đang gửi…" : "Gửi lời nhắn"}
        <ArrowUpRight size={18} />
      </button>
      {message && (
        <p className="form-note" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <p className="form-note">
        Thông tin được lưu để Heros tiếp nhận và hỗ trợ yêu cầu của bạn.
      </p>
    </form>
  );
}
