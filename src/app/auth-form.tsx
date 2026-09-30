"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  DownloadSimple,
  Eye,
  EyeSlash,
} from "@phosphor-icons/react";
import { useAccount } from "./account-session";
export default function AuthForm({
  onComplete,
  compact = false,
}: {
  onComplete?: () => void;
  compact?: boolean;
}) {
  const { reload } = useAccount();
  const [mode, setMode] = useState<"login" | "register" | "recover">("login");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [show, setShow] = useState(false),
    [recovery, setRecovery] = useState(""),
    [saved, setSaved] = useState(false),
    [email, setEmail] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const r = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, action: mode }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      if (data.recoveryCode) {
        setRecovery(data.recoveryCode);
        setEmail(data.account.email);
      } else {
        await reload();
        onComplete?.();
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Chưa thể kết nối. Vui lòng thử lại.",
      );
    } finally {
      setBusy(false);
    }
  }
  function downloadRecovery() {
    const blob = new Blob(
      [
        `Mã khôi phục tài khoản Heros\nEmail: ${email}\nMã: ${recovery}\nGiữ mã này riêng tư. Dùng tại /tai-khoan khi quên mật khẩu. Mã chỉ dùng một lần; khôi phục thành công sẽ cấp mã mới.\n`,
      ],
      { type: "text/plain;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "heros-ma-khoi-phuc.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSaved(true);
  }
  if (recovery)
    return (
      <section className="auth-form recovery-panel">
        <span className="document-label">Tài khoản đã sẵn sàng</span>
        <h2>Giữ một cách để quay lại.</h2>
        <p>
          Lưu mã khôi phục để đặt lại mật khẩu nếu bạn quên. Mã này chỉ hiển thị
          một lần.
        </p>
        <code>{recovery}</code>
        <button className="button secondary" onClick={downloadRecovery}>
          <DownloadSimple size={18} />
          Lưu mã khôi phục
        </button>
        <label className="recovery-check">
          <input
            type="checkbox"
            checked={saved}
            onChange={(e) => setSaved(e.target.checked)}
          />
          Tôi đã lưu mã ở nơi riêng tư
        </label>
        <button
          className="button"
          disabled={!saved || busy}
          onClick={async () => {
            setBusy(true);
            await reload();
            onComplete?.();
            setRecovery("");
            setBusy(false);
          }}
        >
          Tiếp tục <ArrowRight size={18} />
        </button>
      </section>
    );
  return (
    <section className={`auth-form ${compact ? "auth-compact" : ""}`}>
      <div className="auth-tabs" aria-label="Truy cập tài khoản">
        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => {
            setMode("login");
            setError("");
          }}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          className={mode === "register" ? "active" : ""}
          onClick={() => {
            setMode("register");
            setError("");
          }}
        >
          Tạo tài khoản
        </button>
      </div>
      <h2>
        {mode === "login"
          ? "Chào bạn, mừng trở lại."
          : mode === "register"
            ? "Một tài khoản, mọi đơn hàng."
            : "Lấy lại quyền truy cập."}
      </h2>
      <p>
        {mode === "recover"
          ? "Dùng mã khôi phục đã lưu khi tạo tài khoản."
          : "Lịch sử mua hàng luôn ở đây, kể cả khi bạn đổi điện thoại hoặc quên mã đơn."}
      </p>
      <form onSubmit={submit} key={mode}>
        {mode === "register" && (
          <label>
            Tên của bạn
            <input
              name="name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              placeholder="Bạn tên là…"
            />
          </label>
        )}
        <label>
          Email tài khoản
          <input
            type="email"
            name="email"
            autoComplete="username"
            required
            maxLength={254}
            placeholder="ban@email.com"
          />
        </label>
        {mode === "recover" && (
          <label>
            Mã khôi phục
            <input
              name="recoveryCode"
              required
              autoComplete="off"
              minLength={48}
              maxLength={64}
              placeholder="Mã đã lưu khi tạo tài khoản"
            />
          </label>
        )}
        <label>
          {mode === "recover" ? "Mật khẩu mới" : "Mật khẩu"}
          <span className="password-field">
            <input
              type={show ? "text" : "password"}
              name="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={10}
              maxLength={128}
              placeholder="Ít nhất 10 ký tự"
            />
            <button
              type="button"
              aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setShow(!show)}
            >
              {show ? <EyeSlash size={20} /> : <Eye size={20} />}
            </button>
          </span>
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="button" disabled={busy}>
          {busy
            ? "Đang xử lý…"
            : mode === "login"
              ? "Đăng nhập"
              : mode === "register"
                ? "Tạo tài khoản"
                : "Đặt lại mật khẩu"}
          <ArrowRight size={18} />
        </button>
      </form>
      {mode !== "recover" ? (
        <button
          type="button"
          className="auth-help"
          onClick={() => {
            setMode("recover");
            setError("");
          }}
        >
          Quên mật khẩu?
        </button>
      ) : (
        <p className="auth-help">
          Không còn mã khôi phục?{" "}
          <Link href="/lien-he">Liên hệ Heros để được hỗ trợ.</Link>
        </p>
      )}
    </section>
  );
}
