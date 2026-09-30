import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import { resolve, dirname } from "node:path";
import {
  createHash,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import {
  UNIT_PRICE,
  SHIPPING_FEE,
  type OrderInput,
  type PublicOrder,
  type OrderStatus,
} from "./commerce.ts";
export type StoredOrder = PublicOrder & {
  requestId: string;
  fingerprint: string;
  accessHash: string;
  paymentLinkId: string | null;
  customer: string;
  lastChecked: number;
  accountId: string | null;
  paidAt: string | null;
};
let database: DatabaseSync | undefined;
export function db() {
  if (database) return database;
  const file = resolve(
    /* turbopackIgnore: true */ process.env.HEROS_DB_PATH ||
      ".data/heros.sqlite",
  );
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  database = new DatabaseSync(file);
  chmodSync(file, 0o600);
  database.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS orders (orderCode INTEGER PRIMARY KEY, requestId TEXT NOT NULL UNIQUE, fingerprint TEXT NOT NULL, accessHash TEXT NOT NULL, quantity INTEGER NOT NULL, amount INTEGER NOT NULL, method TEXT NOT NULL, status TEXT NOT NULL, customer TEXT NOT NULL, paymentLinkId TEXT, checkoutUrl TEXT, createdAt TEXT NOT NULL, lastChecked INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS contact_messages (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, message TEXT NOT NULL, createdAt TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS request_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);`);
  const columns = database.prepare("PRAGMA table_info(orders)").all() as {
    name: string;
  }[];
  if (!columns.some((c) => c.name === "accountId"))
    database.exec("ALTER TABLE orders ADD COLUMN accountId TEXT");
  if (!columns.some((c) => c.name === "paidAt"))
    database.exec("ALTER TABLE orders ADD COLUMN paidAt TEXT");
  database.exec(`CREATE INDEX IF NOT EXISTS orders_account ON orders(accountId, createdAt);
    CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, passwordHash TEXT NOT NULL, recoveryHash TEXT NOT NULL, createdAt TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS account_sessions (tokenHash TEXT PRIMARY KEY, accountId TEXT NOT NULL, expiresAt INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS sessions_account ON account_sessions(accountId);`);
  return database;
}
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export function getOrder(code: number) {
  return db().prepare("SELECT * FROM orders WHERE orderCode = ?").get(code) as
    StoredOrder | undefined;
}
export function authorizeOrder(order: StoredOrder, token: string | undefined) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  return timingSafeEqual(
    Buffer.from(hash(token)),
    Buffer.from(order.accessHash),
  );
}
export function reserveOrder(
  input: OrderInput,
  accountId: string | null = null,
) {
  const database = db();
  database.exec("BEGIN IMMEDIATE");
  try {
    const reserved = reserveOrderInTransaction(input, accountId);
    database.exec("COMMIT");
    return reserved;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
function reserveOrderInTransaction(
  input: OrderInput,
  accountId: string | null,
) {
  const fingerprint = hash(JSON.stringify(input));
  const existing = db()
    .prepare("SELECT * FROM orders WHERE requestId = ?")
    .get(input.requestId) as StoredOrder | undefined;
  if (existing) {
    if (
      existing.fingerprint !== fingerprint ||
      existing.accountId !== accountId
    )
      throw new Error("Thông tin đã thay đổi. Vui lòng tạo một đơn hàng mới.");
    return { order: existing, token: null };
  }
  const token = randomBytes(32).toString("hex");
  const latest = db()
    .prepare("SELECT MAX(orderCode) AS code FROM orders")
    .get() as { code: number | null };
  const orderCode = Math.max(
    Date.now() * 1000 + randomInt(0, 1000),
    (latest.code || 0) + 1,
  );
  const order: StoredOrder = {
    orderCode,
    requestId: input.requestId,
    fingerprint,
    accessHash: hash(token),
    quantity: input.quantity,
    amount: input.quantity * UNIT_PRICE + SHIPPING_FEE,
    method: input.method,
    status: input.method === "cod" ? "COD_CONFIRMED" : "CREATING",
    customer: JSON.stringify({
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
    }),
    paymentLinkId: null,
    checkoutUrl: null,
    createdAt: new Date().toISOString(),
    lastChecked: 0,
    accountId,
    paidAt: null,
  };
  db()
    .prepare(
      "INSERT INTO orders (orderCode,requestId,fingerprint,accessHash,quantity,amount,method,status,customer,createdAt,accountId) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    )
    .run(
      orderCode,
      input.requestId,
      fingerprint,
      order.accessHash,
      input.quantity,
      order.amount,
      input.method,
      order.status,
      order.customer,
      order.createdAt,
      accountId,
    );
  return { order, token };
}
export function setPaymentLink(code: number, id: string, url: string) {
  db()
    .prepare(
      "UPDATE orders SET paymentLinkId=?,checkoutUrl=?,status=CASE WHEN status IN ('CREATING','FAILED') THEN 'PENDING' ELSE status END WHERE orderCode=? AND method='payos'",
    )
    .run(id, url, code);
}
export function setOrderStatus(code: number, status: OrderStatus) {
  db()
    .prepare(
      "UPDATE orders SET status=?,lastChecked=?,paidAt=CASE WHEN ?='PAID' THEN COALESCE(paidAt,?) ELSE paidAt END WHERE orderCode=? AND method='payos' AND status != 'PAID'",
    )
    .run(status, Date.now(), status, new Date().toISOString(), code);
}
export function claimRefresh(code: number) {
  return (
    Number(
      db()
        .prepare(
          "UPDATE orders SET lastChecked=? WHERE orderCode=? AND lastChecked < ?",
        )
        .run(Date.now(), code, Date.now() - 5000).changes,
    ) > 0
  );
}
export function allowRequest(key: string, limit: number, windowMs = 60000) {
  const now = Date.now();
  db().prepare("DELETE FROM request_limits WHERE expires < ?").run(now);
  db()
    .prepare(
      "INSERT INTO request_limits(key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1",
    )
    .run(hash(key), now + windowMs);
  const row = db()
    .prepare("SELECT count FROM request_limits WHERE key=?")
    .get(hash(key)) as { count: number };
  return row.count <= limit;
}
