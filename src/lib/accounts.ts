import "server-only";
import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { db, authorizeOrder, getOrder, type StoredOrder } from "./store.ts";
import { publicOrder, type Customer } from "./commerce.ts";
import type { OrderDetails } from "./order-view.ts";

export type Account = { id: string; email: string; name: string };
type StoredAccount = Account & { passwordHash: string; recoveryHash: string };
export const SESSION_COOKIE = "heros_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 30;
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export function normalizeEmail(value: unknown) {
  if (typeof value !== "string") throw new Error("Vui lòng nhập email hợp lệ.");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Vui lòng nhập email hợp lệ.");
  return email;
}
function passwordValue(value: unknown) {
  if (typeof value !== "string" || value.length < 10 || value.length > 128)
    throw new Error("Mật khẩu cần từ 10 đến 128 ký tự.");
  return value;
}
function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(
      password,
      salt,
      64,
      { N: 131072, r: 8, p: 1, maxmem: 160 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    ),
  );
}
async function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${(await derive(password, salt)).toString("hex")}`;
}
async function verifyPassword(password: string, encoded: string) {
  const [salt, key] = encoded.split(":");
  const actual = await derive(password, salt);
  return timingSafeEqual(actual, Buffer.from(key, "hex"));
}
const publicAccount = (account: Account): Account => ({
  id: account.id,
  email: account.email,
  name: account.name,
});
export async function registerAccount(value: Record<string, unknown>) {
  const email = normalizeEmail(value.email),
    password = passwordValue(value.password);
  if (
    typeof value.name !== "string" ||
    value.name.trim().length < 2 ||
    value.name.trim().length > 100
  )
    throw new Error("Tên cần từ 2 đến 100 ký tự.");
  const encoded = await passwordHash(password);
  const recoveryCode = randomBytes(24).toString("hex");
  const account = { id: randomUUID(), email, name: value.name.trim() };
  try {
    db()
      .prepare(
        "INSERT INTO accounts(id,email,name,passwordHash,recoveryHash,createdAt) VALUES (?,?,?,?,?,?)",
      )
      .run(
        account.id,
        email,
        account.name,
        encoded,
        hash(recoveryCode),
        new Date().toISOString(),
      );
  } catch {
    throw new Error(
      "Chưa thể tạo tài khoản với email này. Nếu đã đăng ký, hãy đăng nhập hoặc khôi phục tài khoản.",
    );
  }
  return { account, recoveryCode };
}
export async function loginAccount(value: Record<string, unknown>) {
  const email = normalizeEmail(value.email),
    password = passwordValue(value.password);
  const account = db()
    .prepare("SELECT * FROM accounts WHERE email=?")
    .get(email) as StoredAccount | undefined;
  // Do the same slow work for unknown emails to limit account enumeration by timing.
  const encoded =
    account?.passwordHash || `${"0".repeat(32)}:${"0".repeat(128)}`;
  const valid = await verifyPassword(password, encoded);
  if (!account || !valid) throw new Error("Email hoặc mật khẩu chưa đúng.");
  return publicAccount(account);
}
export function createSession(accountId: string) {
  const token = randomBytes(32).toString("hex");
  db()
    .prepare("DELETE FROM account_sessions WHERE expiresAt <= ?")
    .run(Date.now());
  db()
    .prepare(
      "INSERT INTO account_sessions(tokenHash,accountId,expiresAt) VALUES (?,?,?)",
    )
    .run(hash(token), accountId, Date.now() + SESSION_SECONDS * 1000);
  return token;
}
export function accountFromToken(token: string | undefined) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const account = db()
    .prepare(
      "SELECT a.id,a.email,a.name FROM accounts a JOIN account_sessions s ON a.id=s.accountId WHERE s.tokenHash=? AND s.expiresAt>?",
    )
    .get(hash(token), Date.now()) as Account | undefined;
  return account || null;
}
export function revokeSession(token: string | undefined) {
  if (token)
    db()
      .prepare("DELETE FROM account_sessions WHERE tokenHash=?")
      .run(hash(token));
}
export async function recoverAccount(value: Record<string, unknown>) {
  const email = normalizeEmail(value.email),
    password = passwordValue(value.password);
  const code =
    typeof value.recoveryCode === "string"
      ? value.recoveryCode.trim().replace(/\s/g, "").toLowerCase()
      : "";
  const account = db()
    .prepare("SELECT * FROM accounts WHERE email=?")
    .get(email) as StoredAccount | undefined;
  const encoded = await passwordHash(password);
  const digest = hash(code);
  if (
    !account ||
    !/^[a-f0-9]{48}$/.test(code) ||
    !timingSafeEqual(Buffer.from(digest), Buffer.from(account.recoveryHash))
  )
    throw new Error("Email hoặc mã khôi phục chưa đúng.");
  const recoveryCode = randomBytes(24).toString("hex");
  const database = db();
  database.exec("BEGIN IMMEDIATE");
  try {
    const updated = database
      .prepare(
        "UPDATE accounts SET passwordHash=?,recoveryHash=? WHERE id=? AND recoveryHash=?",
      )
      .run(encoded, hash(recoveryCode), account.id, digest);
    if (!updated.changes) throw new Error("Mã khôi phục đã được sử dụng.");
    database
      .prepare("DELETE FROM account_sessions WHERE accountId=?")
      .run(account.id);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return { account: publicAccount(account), recoveryCode };
}
export function canViewOrder(
  order: StoredOrder,
  account: Account | null,
  guestToken?: string,
) {
  // Once linked, an old guest cookie cannot bypass login or logout.
  return order.accountId
    ? order.accountId === account?.id
    : authorizeOrder(order, guestToken);
}
export function orderDetails(order: StoredOrder): OrderDetails {
  return {
    ...publicOrder(order),
    customer: JSON.parse(order.customer) as Customer,
    accountLinked: Boolean(order.accountId),
    paidAt: order.paidAt,
  };
}
export function accountOrders(accountId: string, before?: number) {
  const rows = db()
    .prepare(
      "SELECT * FROM orders WHERE accountId=? AND orderCode<? ORDER BY orderCode DESC LIMIT 21",
    )
    .all(accountId, before || Number.MAX_SAFE_INTEGER) as StoredOrder[];
  return {
    orders: rows.slice(0, 20).map(publicOrder),
    nextCursor: rows.length > 20 ? rows[19].orderCode : null,
  };
}
export function claimGuestOrder(
  code: number,
  token: string | undefined,
  account: Account,
) {
  const order = getOrder(code);
  if (!order || order.accountId || !authorizeOrder(order, token)) return false;
  const customer = JSON.parse(order.customer) as Customer;
  if (normalizeEmail(customer.email) !== account.email) return false;
  return (
    db()
      .prepare(
        "UPDATE orders SET accountId=? WHERE orderCode=? AND accountId IS NULL",
      )
      .run(account.id, code).changes === 1
  );
}
