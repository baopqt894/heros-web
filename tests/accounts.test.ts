import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { db, reserveOrder, getOrder } from "../src/lib/store.ts";
import {
  registerAccount,
  loginAccount,
  recoverAccount,
  createSession,
  accountFromToken,
  revokeSession,
  canViewOrder,
  claimGuestOrder,
  accountOrders,
  orderDetails,
} from "../src/lib/accounts.ts";
process.env.HEROS_DB_PATH = join(
  mkdtempSync(join(tmpdir(), "heros-accounts-")),
  "test.sqlite",
);
const user = (email = `${randomUUID()}@example.invalid`) => ({
  email,
  name: "Khách kiểm thử",
  password: "integration-test-password",
});
const orderInput = (email: string) => ({
  name: "Người nhận kiểm thử",
  email,
  phone: "0900000000",
  address: "Địa chỉ kiểm thử không giao hàng",
  quantity: 1,
  method: "cod" as const,
  requestId: randomUUID(),
});
test("password login is normalized, hashed, rejects wrong credentials and duplicate registration", async () => {
  const input = user();
  const { account } = await registerAccount({
    ...input,
    email: input.email.toUpperCase(),
  });
  const stored = db()
    .prepare("SELECT passwordHash FROM accounts WHERE id=?")
    .get(account.id)!;
  assert.notEqual(stored.passwordHash, input.password);
  assert.ok(String(stored.passwordHash).length > 128);
  assert.equal((await loginAccount(input)).id, account.id);
  await assert.rejects(() =>
    loginAccount({ ...input, password: "incorrect-password" }),
  );
  await assert.rejects(() => registerAccount(input));
});
test("sessions expire and can be revoked; tokens are not stored in cleartext", async () => {
  const { account } = await registerAccount(user());
  const token = createSession(account.id);
  assert.equal(accountFromToken(token)?.id, account.id);
  assert.equal(accountFromToken("guess"), null);
  assert.equal(
    db()
      .prepare("SELECT tokenHash FROM account_sessions WHERE tokenHash=?")
      .get(token),
    undefined,
  );
  revokeSession(token);
  assert.equal(accountFromToken(token), null);
  const expired = createSession(account.id);
  db()
    .prepare("UPDATE account_sessions SET expiresAt=0 WHERE accountId=?")
    .run(account.id);
  assert.equal(accountFromToken(expired), null);
});
test("account order history works with a new session, forbids another account and guest cookie after linking", async () => {
  const a = await registerAccount(user()),
    b = await registerAccount(user());
  const { order, token } = reserveOrder(
    orderInput(a.account.email),
    a.account.id,
  );
  assert.equal(canViewOrder(order, a.account), true);
  assert.equal(canViewOrder(order, b.account, token!), false);
  assert.equal(canViewOrder(order, null, token!), false);
  assert.equal(accountOrders(a.account.id).orders.length, 1);
  assert.equal(accountOrders(b.account.id).orders.length, 0);
  const secondSession = createSession(a.account.id);
  assert.equal(canViewOrder(order, accountFromToken(secondSession)), true);
  assert.equal(
    orderDetails(order).customer.address,
    "Địa chỉ kiểm thử không giao hàng",
  );
  assert.throws(() =>
    reserveOrder(
      { ...orderInput(a.account.email), requestId: order.requestId },
      b.account.id,
    ),
  );
});
test("email alone cannot steal legacy orders; valid old cookie plus matching account can claim once", async () => {
  const input = user(),
    { account } = await registerAccount(input);
  const { order, token } = reserveOrder(orderInput(input.email));
  assert.equal(claimGuestOrder(order.orderCode, undefined, account), false);
  assert.equal(
    claimGuestOrder(order.orderCode, "a".repeat(64), account),
    false,
  );
  assert.equal(
    claimGuestOrder(order.orderCode, token!, {
      ...account,
      email: "another@example.invalid",
    }),
    false,
  );
  assert.equal(claimGuestOrder(order.orderCode, token!, account), true);
  assert.equal(claimGuestOrder(order.orderCode, token!, account), false);
  assert.equal(getOrder(order.orderCode)?.accountId, account.id);
  assert.equal(canViewOrder(getOrder(order.orderCode)!, null, token!), false);
});
test("single-use recovery changes password and invalidates every session", async () => {
  const input = user(),
    { account, recoveryCode } = await registerAccount(input);
  const first = createSession(account.id),
    second = createSession(account.id);
  await assert.rejects(() =>
    recoverAccount({
      ...input,
      recoveryCode: "b".repeat(48),
      password: "new-test-password",
    }),
  );
  const updated = await recoverAccount({
    ...input,
    recoveryCode,
    password: "new-test-password",
  });
  assert.notEqual(updated.recoveryCode, recoveryCode);
  assert.equal(accountFromToken(first), null);
  assert.equal(accountFromToken(second), null);
  await assert.rejects(() => loginAccount(input));
  assert.equal(
    (await loginAccount({ ...input, password: "new-test-password" })).id,
    account.id,
  );
  await assert.rejects(() =>
    recoverAccount({ ...input, recoveryCode, password: "newest-password" }),
  );
});
test("account history paginates without leaking other account records", async () => {
  const { account } = await registerAccount(user());
  for (let i = 0; i < 23; i++)
    reserveOrder(orderInput(account.email), account.id);
  const first = accountOrders(account.id);
  assert.equal(first.orders.length, 20);
  assert.ok(first.nextCursor);
  const next = accountOrders(account.id, first.nextCursor!);
  assert.equal(next.orders.length, 3);
  assert.equal(next.nextCursor, null);
  assert.equal(
    new Set([...first.orders, ...next.orders].map((o) => o.orderCode)).size,
    23,
  );
});
