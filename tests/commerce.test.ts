import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { parseOrder, publicOrder } from "../src/lib/commerce.ts";
import {
  reserveOrder,
  getOrder,
  setOrderStatus,
  authorizeOrder,
  allowRequest,
} from "../src/lib/store.ts";
import { validatePayment } from "../src/lib/payos.ts";
import { PayOS } from "@payos/node";
process.env.HEROS_DB_PATH = join(
  mkdtempSync(join(tmpdir(), "heros-test-")),
  "test.sqlite",
);
const input = () =>
  parseOrder({
    name: "Khách kiểm thử",
    email: "test@example.com",
    phone: "0900000000",
    address: "Địa chỉ kiểm thử nội bộ",
    quantity: 2,
    method: "payos",
    requestId: randomUUID(),
    amount: 1,
  });
test("server fixes price at 590000 per device and discards client amount", () => {
  const { order } = reserveOrder(input());
  assert.equal(order.amount, 1180000);
});
test("rejects quantity, phone, email and request ID manipulation", () => {
  const valid = input();
  for (const patch of [
    { quantity: 0 },
    { quantity: 11 },
    { quantity: 1.5 },
    { quantity: "2" },
    { phone: "abc" },
    { email: "x" },
    { requestId: "../x" },
    { method: "free" },
  ])
    assert.throws(() => parseOrder({ ...valid, ...patch }));
});
test("idempotency reuses the order and rejects changed checkout contents", () => {
  const valid = input();
  const first = reserveOrder(valid);
  const second = reserveOrder(valid);
  assert.equal(first.order.orderCode, second.order.orderCode);
  assert.equal(second.token, null);
  assert.throws(() => reserveOrder({ ...valid, quantity: 3 }));
});
test("unguessable browser token authorizes orders, public data excludes identity", () => {
  const { order, token } = reserveOrder(input());
  assert.ok(authorizeOrder(order, token!));
  assert.equal(authorizeOrder(order, undefined), false);
  assert.equal(authorizeOrder(order, "a".repeat(64)), false);
  const view = publicOrder(order);
  for (const field of ["accessHash", "customer", "email", "phone", "requestId"])
    assert.equal(field in view, false);
});
test("payment must match order code, link and amount, PAID requires full funds", () => {
  const { order } = reserveOrder(input());
  order.paymentLinkId = "expected";
  const valid = {
    orderCode: order.orderCode,
    amount: order.amount,
    id: "expected",
    status: "PAID",
    amountPaid: order.amount,
  };
  assert.doesNotThrow(() => validatePayment(order, valid));
  for (const patch of [
    { amount: 1 },
    { orderCode: 99 },
    { id: "other" },
    { amountPaid: order.amount - 1 },
  ])
    assert.throws(() => validatePayment(order, { ...valid, ...patch }));
});
test("paid status cannot regress on replay or delayed cancellation", () => {
  const { order } = reserveOrder(input());
  setOrderStatus(order.orderCode, "PAID");
  setOrderStatus(order.orderCode, "CANCELLED");
  assert.equal(getOrder(order.orderCode)?.status, "PAID");
});
test("COD is saved without ever being marked as paid", () => {
  const { order } = reserveOrder({ ...input(), method: "cod" });
  setOrderStatus(order.orderCode, "PAID");
  assert.equal(getOrder(order.orderCode)?.status, "COD_CONFIRMED");
});
test("throttling bounds repeated writes", () => {
  const key = randomUUID();
  assert.equal(allowRequest(key, 2), true);
  assert.equal(allowRequest(key, 2), true);
  assert.equal(allowRequest(key, 2), false);
});
test("official SDK accepts signed webhook and rejects tampered amount", async () => {
  const client = new PayOS({
    clientId: "test",
    apiKey: "test",
    checksumKey: "test-only-checksum",
    logLevel: "off",
  });
  const data = {
    orderCode: 123,
    amount: 590000,
    description: "test",
    accountNumber: "test",
    reference: "test",
    transactionDateTime: "2026-09-30 16:00:00",
    currency: "VND",
    paymentLinkId: "test",
    code: "00",
    desc: "success",
    counterAccountBankId: "",
    counterAccountBankName: "",
    counterAccountName: "",
    counterAccountNumber: "",
    virtualAccountName: "",
    virtualAccountNumber: "",
  };
  const signature = await client.crypto.createSignatureFromObj(
    data,
    client.checksumKey,
  );
  const signed = {
    code: "00",
    desc: "success",
    success: true,
    data,
    signature: signature!,
  };
  assert.equal((await client.webhooks.verify(signed)).amount, 590000);
  await assert.rejects(() =>
    client.webhooks.verify({ ...signed, data: { ...data, amount: 1 } }),
  );
  await assert.rejects(() =>
    client.webhooks.verify({ ...signed, signature: "invalid" }),
  );
});
