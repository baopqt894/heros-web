import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";

test("Sheets synchronization preserves existing status, escapes formulas, and retries safely after a partial write", () => {
  const rows = [
    ["ID", "Thời gian (VN)", "Họ tên", "Email", "Số điện thoại", "Lời nhắn", "Trạng thái"],
    ["web:1", "2026-11-19", "Existing", "existing@example.com", "0900000000", "Existing feedback", "Đã xử lý"],
  ];
  const props = new Map([["HEROS_FEEDBACK_EXPORT_KEY", "test-key".repeat(8)]]);
  let releases = 0;
  let flushFails = true;
  const sheet = {
    getLastRow: () => rows.length,
    getSheetId: () => 754378744,
    getMaxRows: () => 1000,
    getRange: (row: number, col: number, count: number, width: number) => {
      const range = {
        getDisplayValues: () => rows.slice(row - 1, row - 1 + count).map(r => r.slice(col - 1, col - 1 + width)),
        setNumberFormat: () => range,
        setValues: (values: string[][]) => { rows.splice(row - 1, count, ...values); },
      };
      return range;
    },
  };
  const context = createContext({
    PropertiesService: { getScriptProperties: () => ({ getProperty: (key: string) => props.get(key), setProperty: (key: string, value: string) => props.set(key, value) }) },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({ getId: () => "1VIyPDgdyM4zj6-dKRDMri68Y5SnKe3sWi0ny99i8h3o", getSheetByName: () => sheet }),
      flush: () => { if (flushFails) { flushFails = false; throw new Error("Temporary Sheets failure"); } },
    },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => { releases++; } }) },
    Utilities: { formatDate: () => "2026-11-19 10:00:00" },
    UrlFetchApp: { fetch: (url: string, options: { headers: { Authorization: string }; followRedirects: boolean }) => {
      assert.equal(options.headers.Authorization, "Bearer " + props.get("HEROS_FEEDBACK_EXPORT_KEY"));
      assert.equal(options.followRedirects, false);
      const after = Number(new URL(url).searchParams.get("after"));
      const messages = [1, 2].filter(id => id > after).map(id => ({ id, name: "=HYPERLINK()", email: "test@example.com", phone: "+84900000000", message: "=1+1", createdAt: "2026-11-19T03:00:00.000Z" }));
      return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ messages, nextCursor: 2, hasMore: false }) };
    } },
  });
  runInContext(readFileSync(new URL("../integrations/google-sheets/Fetch.gs", import.meta.url), "utf8"), context);
  assert.throws(() => runInContext("fetchFeedback()", context), /Temporary Sheets failure/);
  assert.equal(releases, 1);
  assert.equal(rows.length, 3);
  runInContext("fetchFeedback()", context);
  runInContext("fetchFeedback()", context);
  assert.equal(rows.length, 3);
  assert.equal(rows[1][6], "Đã xử lý");
  assert.equal(rows[2][2], "'=HYPERLINK()");
  assert.equal(rows[2][4], "'+84900000000");
  assert.equal(rows[2][5], "'=1+1");
  assert.equal(releases, 3);
});
