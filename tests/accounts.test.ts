import { test } from "node:test";
import assert from "node:assert/strict";
import { accountFromToken, accountOrders, claimGuestOrder, revokeSession } from "../src/lib/accounts.ts";
import { backend, BackendError } from "../src/lib/backend.ts";

test("account uses backend identity and forwards authorization without storing credentials in SQLite", async () => {
  const original = globalThis.fetch;
  const calls: { url: string; headers: Headers }[] = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), headers: new Headers(init?.headers) });
    return Response.json({ success: true, data: { _id: "mongo-user", email: "buyer@example.com", fullName: "Buyer" } });
  };
  try {
    assert.deepEqual(await accountFromToken("signed.jwt.token"), { id: "mongo-user", email: "buyer@example.com", name: "Buyer" });
    assert.match(calls[0].url, /\/v1\/me$/);
    assert.equal(calls[0].headers.get("authorization"), "Bearer signed.jwt.token");
    assert.equal(await accountFromToken("old-sqlite-session"), null);
    assert.equal(calls.length, 1);
  } finally { globalThis.fetch = original; }
});
test("revoked sessions become logged out; backend outages remain errors", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => Response.json({ success: false, data: { errorCode: "SESSION_REVOKED" } }, { status: 401 });
    assert.equal(await accountFromToken("signed.jwt.token"), null);
    await revokeSession("signed.jwt.token");
    globalThis.fetch = async () => { throw new Error("offline"); };
    await assert.rejects(() => accountFromToken("signed.jwt.token"), (error: unknown) => error instanceof BackendError && error.status === 503);
    await assert.rejects(() => revokeSession("signed.jwt.token"));
  } finally { globalThis.fetch = original; }
});
test("history cursor and private guest capability are sent to backend; missing capability cannot claim", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (url, init) => {
    calls++;
    if (String(url).includes("claim")) {
      assert.deepEqual(JSON.parse(String(init?.body)), { orderCode: 123, guestToken: "a".repeat(64) });
      return Response.json({ success: true, data: { claimed: true } });
    }
    assert.match(String(url), /orders\?before=123$/);
    return Response.json({ success: true, data: { orders: [], nextCursor: null } });
  };
  try {
    assert.equal(await claimGuestOrder(123, undefined, "token"), false);
    assert.equal(calls, 0);
    assert.equal(await claimGuestOrder(123, "a".repeat(64), "token"), true);
    assert.deepEqual(await accountOrders("token", 123), { orders: [], nextCursor: null });
  } finally { globalThis.fetch = original; }
});
test("backend URLs preserve /v1 and never include tokens in the URL", async () => {
  const original = globalThis.fetch, previous = process.env.HEROS_API_URL;
  process.env.HEROS_API_URL = "https://heros.nextteam.site/v1";
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), "https://heros.nextteam.site/v1/me");
    assert.equal(new Headers(init?.headers).get("authorization"), "Bearer private-token");
    assert.equal(init?.cache, "no-store");
    return Response.json({ success: true, data: {} });
  };
  try { await backend("me", { token: "private-token" }); }
  finally { globalThis.fetch = original; if (previous === undefined) delete process.env.HEROS_API_URL; else process.env.HEROS_API_URL = previous; }
});
