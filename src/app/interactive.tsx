"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  Bag,
  Check,
  CheckCircle,
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
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="shell nav-inner">
        <a className="brand" href="#" aria-label="Heros - Trang chủ">
          <span className="logo-mark">
            <Image src="/images/heros-logo.png" alt="" width={60} height={60} />
          </span>
          <span>
            HEROS<small>SAFETY WITH YOU</small>
          </span>
        </a>
        <nav
          className={open ? "nav-links open" : "nav-links"}
          aria-label="Điều hướng chính"
        >
          {[
            ["Tổng quan", "cau-chuyen"],
            ["Tính năng", "san-pham"],
            ["Liên hệ", "lien-he"],
          ].map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <a className="button small" href="#dat-hang">
          Đặt Heros <Bag size={17} />
        </a>
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

export function ProductShowcase() {
  const target = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });
  const rawScale = useTransform(
    scrollYProgress,
    [0.08, 0.42, 0.78],
    [0.78, 1, 0.9],
  );
  const rawY = useTransform(scrollYProgress, [0, 1], [70, -50]);
  const scale = useSpring(rawScale, { stiffness: 90, damping: 24 });
  const y = useSpring(rawY, { stiffness: 80, damping: 26 });

  return (
    <div className="product-stage" ref={target}>
      <motion.div
        className="product-stage-image"
        style={reduced ? undefined : { scale, y }}
      >
        <Image
          src="/images/heros-product.png"
          alt="Thiết bị Heros nhìn cận cảnh trên bục hồng"
          width={1100}
          height={1100}
          sizes="(max-width: 768px) 100vw, 70vw"
        />
      </motion.div>
      <div className="spec spec-size">
        <strong>62 mm</strong>
        <span>gọn trong lòng bàn tay</span>
      </div>
      <div className="spec spec-action">
        <strong>2 giây</strong>
        <span>nhấn giữ để gửi SOS</span>
      </div>
      <div className="spec spec-touch">
        <strong>1 chạm</strong>
        <span>kết nối người thân</span>
      </div>
    </div>
  );
}

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );
export function Order() {
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState("payos");
  const [stage, setStage] = useState<"review" | "success">("review");
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [orderId, setOrderId] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const total = quantity * 590000;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setCustomer({
      name: String(data.get("name")).trim(),
      phone: String(data.get("phone")).trim(),
      email: String(data.get("email")).trim(),
      address: String(data.get("address")).trim(),
    });
    setOrderId(`DEMO-${Date.now().toString().slice(-8)}`);
    setStage("review");
    dialog.current?.showModal();
  }
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const observer = new MutationObserver(() => {
      document.body.style.overflow = element.open ? "hidden" : "";
    });
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
            Bản trải nghiệm • Giá 590.000đ là giá minh họa. Chưa tiếp nhận đơn
            hàng hoặc thu tiền thật.
          </p>
        </div>
        <form className="order-form" onSubmit={submit}>
          <div className="form-heading">
            <h3>Heros của bạn</h3>
            <Heart size={23} />
          </div>
          <div className="product-line">
            <div>
              <strong>Thiết bị Heros</strong>
              <span>
                <i className="color-swatch" /> Hồng phấn
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
                title="Nhập số điện thoại Việt Nam: 10 số bắt đầu bằng 0 hoặc +84 và 9 số."
                placeholder="09xxxxxxxx"
              />
            </label>
            <label className="full">
              Email
              <input
                name="email"
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
                onInput={(event) =>
                  event.currentTarget.setCustomValidity(
                    event.currentTarget.value.trim().length < 10
                      ? "Vui lòng nhập địa chỉ đầy đủ (ít nhất 10 ký tự)."
                      : "",
                  )
                }
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
                Chuyển khoản qua payOS<small>Mô phỏng thanh toán</small>
              </span>
              <span className="tag">DEMO</span>
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
                <small>Đặt thử, không giao hàng thật</small>
              </span>
            </label>
          </fieldset>
          <div className="total-row">
            <span>Sản phẩm × {quantity}</span>
            <span>{money(total)}</span>
          </div>
          <div className="total-row">
            <span>Phí giao hàng (demo)</span>
            <span>Miễn phí</span>
          </div>
          <div className="grand-total">
            <strong>Tổng cộng</strong>
            <strong>{money(total)}</strong>
          </div>
          <button className="button submit" type="submit">
            {method === "payos" ? "Tiếp tục thanh toán" : "Xem lại đơn hàng"}
            <ArrowRight size={20} />
          </button>
          <p className="form-note">
            <ShieldCheck size={16} /> Thông tin chỉ dùng trong phiên trải nghiệm
            này.
          </p>
        </form>
      </div>
      <dialog
        ref={dialog}
        className="checkout-dialog"
        aria-labelledby="checkout-title"
      >
        <button
          className="close-dialog"
          aria-label="Đóng thanh toán"
          onClick={() => dialog.current?.close()}
        >
          <X size={23} />
        </button>
        {stage === "review" ? (
          <>
            <span className="tag">TRẢI NGHIỆM DEMO</span>
            <h2 id="checkout-title">Một chút nữa thôi.</h2>
            <p>Kiểm tra thông tin trước khi hoàn tất đơn hàng thử.</p>
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
            <p className="demo-note">
              {method === "payos"
                ? "Đây là bước mô phỏng payOS, chưa kết nối cổng thanh toán. Không có mã QR thật và không cần chuyển tiền."
                : "Đơn COD chỉ được mô phỏng, không được gửi cho cửa hàng."}
            </p>
            <button
              className="button submit"
              onClick={() => setStage("success")}
            >
              {method === "payos"
                ? "Mô phỏng thanh toán thành công"
                : "Xác nhận đơn demo"}
              <Check size={20} />
            </button>
            <button
              className="text-button"
              onClick={() => dialog.current?.close()}
            >
              Quay lại chỉnh sửa
            </button>
          </>
        ) : (
          <div className="success-state">
            <CheckCircle size={64} weight="light" />
            <h2 id="checkout-title">
              Cảm ơn bạn
              <br />
              đã chọn Heros!
            </h2>
            <p>
              Đơn demo <strong>{orderId}</strong> đã hoàn tất.
            </p>
            <p>
              {method === "payos"
                ? "Thanh toán mô phỏng thành công."
                : "Đã mô phỏng đặt hàng COD."}{" "}
              Không phát sinh giao dịch, email hay giao hàng thật.
            </p>
            <button className="button" onClick={() => dialog.current?.close()}>
              Tiếp tục khám phá <ArrowUpRight size={18} />
            </button>
          </div>
        )}
      </dialog>
    </section>
  );
}

export function ContactForm() {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="contact-form"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <label>
        Email của bạn
        <input
          aria-label="Email liên hệ"
          type="email"
          required
          placeholder="ban@email.com"
          maxLength={254}
          onChange={() => setSent(false)}
        />
      </label>
      <label>
        Lời nhắn cho chúng tớ
        <textarea
          required
          minLength={5}
          maxLength={2000}
          rows={3}
          placeholder="Bạn muốn chia sẻ điều gì với Heros?"
          onChange={() => setSent(false)}
        />
      </label>
      <button className="button" type="submit">
        Gửi lời nhắn <ArrowUpRight size={18} />
      </button>
      <p className="form-note" role="status">
        {sent
          ? "Đã hoàn tất gửi thử. Lời nhắn chưa được gửi đến Heros vì đây là bản demo."
          : "Form liên hệ demo, chưa gửi email thật."}
      </p>
    </form>
  );
}
