"use client";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";
import { useAccount } from "./account-session";

export default function AuthForm({ onComplete, compact = false, checkout = false, initialEmail = "", initialName = "", onBusyChange }: {
  onComplete?: () => void; compact?: boolean; checkout?: boolean; initialEmail?: string; initialName?: string; onBusyChange?: (busy: boolean) => void;
}) {
  const { reload } = useAccount();
  const [mode, setMode] = useState<"login" | "register" | "recover">("login");
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [show, setShow] = useState(false);
  const [loginEmail, setLoginEmail] = useState(initialEmail), [name, setName] = useState(initialName);
  const [otp, setOtp] = useState(""), [sent, setSent] = useState(false), [resendAt, setResendAt] = useState(0), [now, setNow] = useState(0);
  useEffect(() => { onBusyChange?.(busy); return () => onBusyChange?.(false); }, [busy, onBusyChange]);
  useEffect(() => { if (!resendAt) return; const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, [resendAt]);
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));
  function changeMode(value: typeof mode) { setMode(value); setError(""); setOtp(""); setSent(false); setResendAt(0); }
  async function requestOtp() {
    if (busy || remaining) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "request-otp", email: loginEmail, purpose: mode === "register" ? "register" : "login" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSent(true); setNow(Date.now()); setResendAt(Date.now() + (data.resendAfterSeconds ?? 60) * 1000);
    } catch (error) { setError(error instanceof Error ? error.message : "Chưa thể gửi mã xác minh."); }
    finally { setBusy(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, action: mode }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await reload(); onComplete?.();
    } catch (error) { setError(error instanceof Error ? error.message : "Chưa thể kết nối. Vui lòng thử lại."); }
    finally { setBusy(false); }
  }
  return (
    <section className={`auth-form ${compact ? "auth-compact" : ""}`}>
      <div className="auth-tabs" aria-label="Truy cập tài khoản">
        <button type="button" className={mode === "login" ? "active" : ""} disabled={busy} onClick={() => changeMode("login")}>Đăng nhập</button>
        <button type="button" className={mode === "register" ? "active" : ""} disabled={busy} onClick={() => changeMode("register")}>Tạo tài khoản</button>
      </div>
      <h2>{mode === "login" ? "Chào bạn, mừng trở lại." : mode === "register" ? "Một tài khoản, mọi đơn hàng." : "Lấy lại quyền truy cập."}</h2>
      <p>{mode === "recover" ? "Xác minh email để đặt lại mật khẩu." : checkout ? "Đăng nhập để lưu và tra cứu đơn sau này. Thông tin nhận hàng của bạn vẫn được giữ nguyên." : "Lịch sử mua hàng luôn ở đây, kể cả khi bạn đổi điện thoại hoặc quên mã đơn."}</p>
      <form onSubmit={submit} key={mode}>
        {mode === "register" && <label>Tên của bạn<input name="name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={100} autoComplete="name" placeholder="Bạn tên là…" /></label>}
        <label>Email tài khoản<input type="email" name="email" value={loginEmail} onChange={(event) => { setLoginEmail(event.target.value); setSent(false); setOtp(""); }} autoComplete="username" required maxLength={254} placeholder="ban@email.com" /></label>
        {mode !== "login" && <>
          <button type="button" className="button secondary" disabled={busy || remaining > 0 || !loginEmail} onClick={requestOtp}>{remaining > 0 ? `Gửi lại sau ${remaining}s` : sent ? "Gửi lại mã" : "Gửi mã xác minh"}</button>
          {sent && <p role="status">Mã xác minh đã được gửi đến email của bạn.</p>}
          <label>Mã xác minh email<input name="otp" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} required pattern="[0-9]{6}" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6 chữ số" /></label>
        </>}
        <label>{mode === "recover" ? "Mật khẩu mới" : "Mật khẩu"}<span className="password-field">
          <input type={show ? "text" : "password"} name="password" aria-label={mode === "recover" ? "Mật khẩu mới" : "Mật khẩu"} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "login" ? 6 : 8} maxLength={128} placeholder={mode === "login" ? "Mật khẩu của bạn" : "Ít nhất 8 ký tự"} />
          <button type="button" aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"} onClick={() => setShow(!show)}>{show ? <EyeSlash size={20} /> : <Eye size={20} />}</button>
        </span></label>
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="button" disabled={busy}>{busy ? "Đang xử lý…" : mode === "login" ? checkout ? "Đăng nhập & tiếp tục" : "Đăng nhập" : mode === "register" ? checkout ? "Tạo tài khoản & tiếp tục" : "Tạo tài khoản" : "Đặt lại mật khẩu"}<ArrowRight size={18} /></button>
      </form>
      <button type="button" className="auth-help" disabled={busy} onClick={() => changeMode(mode === "recover" ? "login" : "recover")}>{mode === "recover" ? "Quay lại đăng nhập" : "Quên mật khẩu?"}</button>
    </section>
  );
}
