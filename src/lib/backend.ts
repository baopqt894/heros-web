import "server-only";

export class BackendError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
}
const messages: Record<string, string> = {
  INVALID_CREDENTIALS: "Email hoặc mật khẩu chưa đúng.",
  EMAIL_ALREADY_REGISTERED: "Email đã được đăng ký. Hãy đăng nhập.",
  USER_NOT_FOUND: "Không tìm thấy tài khoản với email này.",
  OTP_INVALID_OR_EXPIRED: "Mã xác minh chưa đúng hoặc đã hết hạn.",
  OTP_RESEND_TOO_SOON: "Vui lòng chờ một phút trước khi gửi lại mã.",
  SESSION_REVOKED: "Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại.",
  CHECKOUT_DISABLED: "Heros chưa mở tiếp nhận đơn hàng.",
  ORDER_REQUEST_CONFLICT: "Thông tin đơn đã thay đổi. Vui lòng tạo đơn mới.",
  ORDER_NOT_FOUND: "Không tìm thấy đơn hàng trong tài khoản này.",
};
export async function backend<T>(path: string, options: { token?: string; method?: string; body?: unknown; guestToken?: string } = {}): Promise<T> {
  const base = new URL(process.env.HEROS_API_URL || "http://127.0.0.1:2155/v1/");
  if (!base.pathname.endsWith("/")) base.pathname += "/";
  try {
    const response = await fetch(new URL(path.replace(/^\//, ""), base), {
      method: options.method || "GET",
      headers: { "Content-Type": "application/json", ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}), ...(options.guestToken ? { "X-Heros-Order-Token": options.guestToken } : {}) },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store", signal: AbortSignal.timeout(20000),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      const code = result.data?.errorCode || "BACKEND_ERROR";
      throw new BackendError(response.status, code, messages[code] || (response.status === 429 ? "Bạn thao tác quá nhanh. Vui lòng thử lại sau." : "Chưa thể thực hiện. Vui lòng thử lại."));
    }
    return result.data as T;
  } catch (error) {
    if (error instanceof BackendError) throw error;
    throw new BackendError(503, "BACKEND_UNAVAILABLE", "Chưa thể kết nối HEROS. Vui lòng thử lại sau.");
  }
}
