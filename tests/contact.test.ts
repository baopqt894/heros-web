import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { trustedOrigin } from "../src/lib/http.ts";
import { siteUrl } from "../src/lib/payos.ts";
import { db } from "../src/lib/store.ts";
import { POST } from "../src/app/api/contact/route.ts";
import { GET } from "../src/app/api/contact/export/route.ts";

const directory = mkdtempSync(join(tmpdir(), "heros-contact-test-"));
process.env.HEROS_DB_PATH = join(directory, "test.sqlite");
const production = "https://heros.dolphinxstudio.com";
const request = (origin?: string, extra: Record<string, string> = {}) => new Request(`${production}/api/contact`, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}), ...extra },
  body: "{}",
});

after(() => { db().close(); rmSync(directory, { recursive: true, force: true }); });

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

test("contact accepts a production request, validates input, and persists only valid messages", async () => {
  Object.assign(process.env, { NODE_ENV: "production" });
  delete process.env.HEROS_SITE_URL;
  assert.equal((await POST(request("https://evil.example"))).status, 403);
  assert.equal((await POST(request(production))).status, 400);
  const response = await POST(new Request(`${production}/api/contact`, {
    method: "POST", headers: { Origin: production, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Contact test", email: "test@example.com", phone: "", message: "Isolated test message" }),
  }));
  assert.equal(response.status, 201);
  assert.equal(db().prepare("SELECT count(*) AS count FROM contact_messages").get()?.count, 1);
});

test("feedback export requires a strong configured key and paginates without exposing data anonymously", async () => {
  const key = randomBytes(32).toString("hex");
  const read = (after = "0", token = key) => GET(new Request(`${production}/api/contact/export?after=${after}`, {
    headers: { Authorization: `Bearer ${token}` },
  }));
  delete process.env.HEROS_FEEDBACK_EXPORT_KEY;
  assert.equal((await read()).status, 503);
  process.env.HEROS_FEEDBACK_EXPORT_KEY = "short";
  assert.equal((await read()).status, 503);
  process.env.HEROS_FEEDBACK_EXPORT_KEY = key;
  assert.equal((await read("0", "wrong")).status, 401);
  assert.equal((await GET(new Request(`${production}/api/contact/export`))).status, 401);
  for (const invalid of ["-1", "1.5", "abc", "9007199254740992"])
    assert.equal((await read(invalid)).status, 400);
  const insert = db().prepare("INSERT INTO contact_messages(name,email,phone,message,createdAt) VALUES (?,?,?,?,?)");
  for (let index = 0; index < 200; index++) insert.run("Test", "test@example.com", "0900000000", "Test", new Date().toISOString());
  const firstResponse = await read();
  assert.equal(firstResponse.headers.get("Cache-Control"), "private, no-store");
  const first = await firstResponse.json();
  assert.equal(first.messages.length, 200);
  assert.equal(first.nextCursor, 200);
  assert.equal(first.hasMore, true);
  const second = await (await read(String(first.nextCursor))).json();
  assert.equal(second.messages.length, 1);
  assert.equal(second.nextCursor, 201);
  assert.equal(second.hasMore, false);
  assert.deepEqual((await (await read("201")).json()).messages, []);
});
