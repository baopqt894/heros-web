import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { trustedOrigin } from "../src/lib/http.ts";
import { siteUrl } from "../src/lib/payos.ts";
import { POST } from "../src/app/api/contact/route.ts";
import { GET } from "../src/app/api/contact/export/route.ts";

const production = "https://heros.dolphinxstudio.com";
const request = (origin?: string, extra: Record<string, string> = {}) => new Request(`${production}/api/contact`, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}), ...extra },
  body: "{}",
});

test("production defaults to the canonical site, rejects foreign and spoofed origins", () => {
  Object.assign(process.env, { NODE_ENV: "production" });
  delete process.env.HEROS_SITE_URL;
  assert.equal(siteUrl(), production);
  assert.equal(trustedOrigin(request(production)), true);
  for (const origin of [undefined, "null", "http://127.0.0.1:3000", "https://evil.example", `${production}.evil.example`, `${production}/path`]) {
    assert.equal(trustedOrigin(request(origin, { Host: "heros.dolphinxstudio.com", "X-Forwarded-Host": "heros.dolphinxstudio.com" })), false);
  }
  process.env.HEROS_SITE_URL = " https://preview.example/ ";
  assert.equal(trustedOrigin(request("https://preview.example")), true);
  assert.equal(trustedOrigin(request(production)), false);
  process.env.HEROS_SITE_URL = "not a URL";
  assert.equal(trustedOrigin(request(production)), false);
  delete process.env.HEROS_SITE_URL;
});

const valid = { name: "Contact test", email: "test@example.com", phone: "", message: "Isolated test message" };
const submit = () => POST(new Request(`${production}/api/contact`, {
  method: "POST", headers: { Origin: production, "Content-Type": "application/json", "X-Forwarded-For": randomBytes(16).toString("hex") },
  body: JSON.stringify(valid),
}));

test("contact validates before forwarding and only acknowledges a saved backend record", async () => {
  const original = globalThis.fetch;
  process.env.HEROS_API_URL = "https://heros.nextteam.site/v1/";
  let calls = 0;
  globalThis.fetch = async (url, init) => {
    calls++;
    assert.equal(String(url), "https://heros.nextteam.site/v1/contact");
    assert.equal(init?.method, "POST");
    assert.deepEqual(JSON.parse(String(init?.body)), valid);
    return Response.json({ success: true, data: { id: "0123456789abcdef01234567" } }, { status: 201 });
  };
  try {
    assert.equal((await POST(request("https://evil.example"))).status, 403);
    assert.equal((await POST(request(production))).status, 400);
    assert.equal(calls, 0);
    assert.equal((await submit()).status, 201);
    assert.equal(calls, 1);
    globalThis.fetch = async () => { throw new Error("offline"); };
    assert.equal((await submit()).status, 503);
    globalThis.fetch = async () => Response.json({ success: false }, { status: 200 });
    assert.equal((await submit()).status, 503);
    globalThis.fetch = async () => Response.json({ success: true, data: {} });
    assert.equal((await submit()).status, 503);
    globalThis.fetch = async () => Response.json({ success: false, data: { errorCode: "TOO_MANY_REQUESTS" } }, { status: 429 });
    assert.equal((await submit()).status, 429);
  } finally { globalThis.fetch = original; }
});

test("feedback export authenticates before contacting backend and strips additional private fields", async () => {
  const original = globalThis.fetch;
  const key = randomBytes(32).toString("hex");
  const read = (after = "0", token = key) => GET(new Request(`${production}/api/contact/export?after=${after}`, {
    headers: { Authorization: `Bearer ${token}` },
  }));
  let calls = 0;
  globalThis.fetch = async (url, init) => {
    calls++;
    assert.equal(String(url), "https://heros.nextteam.site/v1/contact/export?after=10");
    assert.equal(new Headers(init?.headers).get("authorization"), `Bearer ${key}`);
    assert.equal(init?.cache, "no-store");
    return Response.json({ success: true, data: {
      messages: [{ ...valid, id: "0123456789abcdef01234567", createdAt: "2026-11-19T00:00:00.000Z", internalNote: "private" }], nextCursor: 11, hasMore: false,
    } });
  };
  try {
    delete process.env.HEROS_FEEDBACK_EXPORT_KEY;
    assert.equal((await read()).status, 503);
    process.env.HEROS_FEEDBACK_EXPORT_KEY = "short";
    assert.equal((await read()).status, 503);
    process.env.HEROS_FEEDBACK_EXPORT_KEY = key;
    assert.equal((await read("0", "wrong")).status, 401);
    assert.equal((await GET(new Request(`${production}/api/contact/export`))).status, 401);
    for (const invalid of ["-1", "1.5", "abc", "9007199254740992"])
      assert.equal((await read(invalid)).status, 400);
    assert.equal(calls, 0);
    const response = await read("10");
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "private, no-store");
    const page = await response.json();
    assert.equal(page.nextCursor, 11);
    assert.equal(page.messages[0].internalNote, undefined);
    assert.equal(calls, 1);
    globalThis.fetch = async () => Response.json({ success: true, data: { messages: [], nextCursor: 11, hasMore: true } });
    assert.equal((await read("10")).status, 503);
    globalThis.fetch = async () => { throw new Error("offline"); };
    assert.equal((await read()).status, 503);
  } finally { globalThis.fetch = original; }
});
