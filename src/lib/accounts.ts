import "server-only";
import { backend, BackendError } from "./backend.ts";
import type { PublicOrder } from "./commerce.ts";
export type Account = { id: string; email: string; name: string };
export type LoginResult = { accessToken: string; user: { _id: string; email: string; fullName: string } };
export const SESSION_COOKIE = "heros_session";
export const INSTALLATION_COOKIE = "heros_web_installation";
// Browsers cap persistent cookies; the JWT itself has no expiry.
export const SESSION_SECONDS = 60 * 60 * 24 * 400;
export function publicAccount(user: LoginResult["user"]): Account {
  return { id: user._id, email: user.email, name: user.fullName };
}
export async function accountFromToken(token: string | undefined) {
  if (!token || !token.includes(".")) return null;
  try { return publicAccount(await backend<LoginResult["user"]>("me", { token })); }
  catch (error) { if (error instanceof BackendError && error.status === 401) return null; throw error; }
}
export async function accountOrders(token: string, before?: number) {
  return backend<{ orders: PublicOrder[]; nextCursor: number | null }>(`commerce/orders${before ? `?before=${before}` : ""}`, { token });
}
export async function revokeSession(token: string | undefined) {
  if (!token || !token.includes(".")) return;
  try { await backend("auth/logout-current", { token, method: "POST" }); }
  catch (error) { if (!(error instanceof BackendError && error.status === 401)) throw error; }
}
export async function claimGuestOrder(code: number, guestToken: string | undefined, token: string) {
  if (!guestToken) return false;
  try { await backend("commerce/orders/claim", { token, method: "POST", body: { orderCode: code, guestToken } }); return true; }
  catch (error) { if (error instanceof BackendError && [404, 409].includes(error.status)) return false; throw error; }
}
