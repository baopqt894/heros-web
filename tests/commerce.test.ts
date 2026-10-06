import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { parseOrder, publicOrder } from "../src/lib/commerce.ts";
import { allowRequest } from "../src/lib/store.ts";
const input = () => parseOrder({ name: "Buyer", email: "buyer@example.com", phone: "0900000000", address: "Test delivery address", quantity: 2, method: "payos", requestId: randomUUID(), amount: 1 });
test("checkout validation excludes client-controlled prices", () => {
  const valid = input();
  assert.equal("amount" in valid, false);
  for (const patch of [{ quantity: 0 }, { quantity: 11 }, { quantity: 1.5 }, { quantity: "2" }, { phone: "abc" }, { email: "x" }, { requestId: "../x" }, { method: "free" }])
    assert.throws(() => parseOrder({ ...valid, ...patch }));
});
test("public order view excludes private information", () => {
  const order = { orderCode: 123, quantity: 1, amount: 590000, method: "cod" as const, status: "COD_CONFIRMED" as const, checkoutUrl: null, createdAt: new Date().toISOString(), accessHash: "secret", customer: "private", email: "private" };
  assert.deepEqual(Object.keys(publicOrder(order)), ["orderCode", "quantity", "amount", "method", "status", "checkoutUrl", "createdAt"]);
});
test("local request throttles are bounded and expire", () => {
  const key = randomUUID();
  assert.equal(allowRequest(key, 2), true);
  assert.equal(allowRequest(key, 2), true);
  assert.equal(allowRequest(key, 2), false);
});
