/**
 * HEROS feedback receiver — paste into Extensions > Apps Script in your Sheet.
 * Run setup() once, then deploy as a Web app (execute as Me; access Anyone).
 * Script Properties contains HEROS_FEEDBACK_SECRET: copy it to SERVER env only.
 */
function setup() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Mở Apps Script từ Google Sheet cần nhận feedback.');
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('HEROS_FEEDBACK_SHEET_ID', spreadsheet.getId());
  if (!properties.getProperty('HEROS_FEEDBACK_SECRET')) {
    properties.setProperty('HEROS_FEEDBACK_SECRET', Utilities.getUuid() + Utilities.getUuid());
  }
  feedbackSheet_(spreadsheet);
}

function doGet() {
  return json_({ ok: true, service: 'HEROS feedback', method: 'POST' });
}

function doPost(e) {
  let lock;
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > 12000) return json_({ ok: false, error: 'INVALID_BODY' });
    const data = JSON.parse(raw);
    const properties = PropertiesService.getScriptProperties();
    const secret = properties.getProperty('HEROS_FEEDBACK_SECRET');
    const sheetId = properties.getProperty('HEROS_FEEDBACK_SHEET_ID');
    if (!secret || !sheetId) return json_({ ok: false, error: 'NOT_CONFIGURED' });
    if (!data || data.secret !== secret) return json_({ ok: false, error: 'UNAUTHORIZED' });

    const name = field_(data.name, 2, 100);
    const email = field_(data.email, 3, 254);
    const phone = field_(data.phone === undefined ? '' : data.phone, 0, 20);
    const message = field_(data.message, 5, 2000);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('INVALID_INPUT');
    if (phone && !/^(0|\+84)[0-9]{9}$/.test(phone)) throw new Error('INVALID_INPUT');

    lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) return json_({ ok: false, error: 'BUSY' });
    const sheet = feedbackSheet_(SpreadsheetApp.openById(sheetId));
    const id = Utilities.getUuid();
    const createdAt = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
    const row = [id, createdAt, name, email, phone, message, 'Chưa xử lý'];
    const range = sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length);
    // Preserve phone numbers and prevent user content becoming spreadsheet formulas.
    range.setNumberFormat('@');
    range.setValues([row.map(text_)]);
    SpreadsheetApp.flush();
    return json_({ ok: true, id: id });
  } catch (error) {
    return json_({ ok: false, error: error.message === 'INVALID_INPUT' ? 'INVALID_INPUT' : 'SAVE_FAILED' });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function feedbackSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName('Feedback');
  if (!sheet) sheet = spreadsheet.insertSheet('Feedback');
  if (sheet.getLastRow() === 0) {
    const headers = [['ID', 'Thời gian (VN)', 'Họ tên', 'Email', 'Số điện thoại', 'Lời nhắn', 'Trạng thái']];
    sheet.getRange(1, 1, 1, 7).setValues(headers).setFontWeight('bold').setBackground('#f9e9ef');
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, 5, 180);
    sheet.setColumnWidth(6, 420);
    sheet.setColumnWidth(7, 150);
  }
  return sheet;
}

function field_(value, min, max) {
  if (typeof value !== 'string') throw new Error('INVALID_INPUT');
  const result = value.trim();
  if (result.length < min || result.length > max) throw new Error('INVALID_INPUT');
  return result;
}

function text_(value) {
  const text = String(value);
  return /^[\s]*[=+@-]/.test(text) ? "'" + text : text;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
