/** Add this as a NEW Apps Script file named Fetch. Keep existing Code.gs. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Heros')
    .addItem('Lấy feedback từ website', 'showFeedbackButton').addToUi();
}
function showFeedbackButton() {
  const html = HtmlService.createHtmlOutput(`<!doctype html><html><head><base target="_top"></head>
  <body style="font:14px Arial,sans-serif;padding:20px;color:#4d2935">
  <h2 style="font-size:20px">Feedback Heros</h2><p style="line-height:1.7">Lấy lời nhắn mới từ website. Các dòng đã có và trạng thái xử lý được giữ nguyên.</p>
  <button id="fetch" style="background:#c63c70;color:white;border:0;border-radius:10px;padding:14px 20px;cursor:pointer;width:100%" onclick="loadFeedback()">Lấy feedback</button>
  <p id="result" role="status" style="line-height:1.7"></p>
  <script>function loadFeedback(){var b=document.getElementById('fetch'),r=document.getElementById('result');b.disabled=true;r.textContent='Đang lấy dữ liệu…';google.script.run.withSuccessHandler(function(x){b.disabled=false;r.textContent=x;}).withFailureHandler(function(e){b.disabled=false;r.textContent=e.message||'Chưa thể lấy dữ liệu.';}).fetchFeedback();}</script>
  </body></html>`).setTitle('Feedback Heros');
  SpreadsheetApp.getUi().showSidebar(html);
}
function fetchFeedback() {
  const properties = PropertiesService.getScriptProperties();
  const key = properties.getProperty('HEROS_FEEDBACK_EXPORT_KEY');
  if (!key || key.length < 32) throw new Error('Cần cấu hình HEROS_FEEDBACK_EXPORT_KEY giống trên server web trong Project Settings → Script Properties.');
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (spreadsheet.getId() !== '1VIyPDgdyM4zj6-dKRDMri68Y5SnKe3sWi0ny99i8h3o') throw new Error('Hãy chạy từ sheet Feedback Heros.');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) throw new Error('Đang có lần đồng bộ khác. Vui lòng thử lại sau.');
  try {
    const sheet = spreadsheet.getSheetByName('Feedback');
    if (!sheet) throw new Error('Không tìm thấy tab Feedback.');
    const expected = ['ID','Thời gian (VN)','Họ tên','Email','Số điện thoại','Lời nhắn','Trạng thái'];
    if (JSON.stringify(sheet.getRange(1,1,1,7).getDisplayValues()[0]) !== JSON.stringify(expected)) throw new Error('Các cột Feedback đã thay đổi. Vui lòng giữ đúng 7 cột ban đầu.');
    const rows = sheet.getLastRow();
    const ids = new Set(rows > 1 ? sheet.getRange(2,1,rows-1,1).getDisplayValues().map(r=>r[0]) : []);
    const cursorKey = 'HEROS_FEEDBACK_CURSOR_' + spreadsheet.getId() + '_' + sheet.getSheetId();
    let cursor = Number(properties.getProperty(cursorKey) || '0');
    if (!Number.isSafeInteger(cursor) || cursor < 0) throw new Error('Cursor không hợp lệ.');
    let added = 0;
    for (let page=0;page<10;page++) {
      const response = UrlFetchApp.fetch('https://heros.dolphinxstudio.com/api/contact/export?after='+cursor, {
        method:'get',headers:{Authorization:'Bearer '+key},muteHttpExceptions:true,followRedirects:false
      });
      const status = response.getResponseCode();
      if (status !== 200) throw new Error(status === 401 ? 'Khóa đồng bộ chưa khớp với server.' : 'API chưa sẵn sàng (HTTP '+status+'). Cần deploy API export và cấu hình server trước.');
      let data;
      try { data=JSON.parse(response.getContentText()); } catch(e) { throw new Error('API không trả JSON hợp lệ.'); }
      if (!Array.isArray(data.messages) || typeof data.hasMore !== 'boolean' || !Number.isSafeInteger(data.nextCursor) || data.nextCursor < cursor || (data.hasMore && data.nextCursor <= cursor)) throw new Error('Dữ liệu phân trang không hợp lệ.');
      let last = cursor;
      const pending = [];
      data.messages.forEach(item=>{
        if (!Number.isSafeInteger(item.id) || item.id <= last || ['name','email','phone','message','createdAt'].some(k=>typeof item[k]!=='string')) throw new Error('Feedback trả về không hợp lệ.');
        last=item.id;
        const id='web:'+item.id;
        if (ids.has(id)) return;
        const time = new Date(item.createdAt);
        if (isNaN(time.getTime())) throw new Error('Ngày feedback không hợp lệ.');
        const safe = value => /^[\s]*[=+@-]/.test(String(value)) ? "'"+value : String(value);
        pending.push([id,Utilities.formatDate(time,'Asia/Ho_Chi_Minh','yyyy-MM-dd HH:mm:ss'),item.name,item.email,item.phone,item.message,'Chưa xử lý'].map(safe));
        ids.add(id);
      });
      if (last !== data.nextCursor) throw new Error('Cursor không khớp dữ liệu.');
      if (pending.length) {
        const end=sheet.getLastRow()+pending.length;
        if (end>sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(),end-sheet.getMaxRows());
        sheet.getRange(sheet.getLastRow()+1,1,pending.length,7).setNumberFormat('@').setValues(pending);
        SpreadsheetApp.flush();
        added+=pending.length;
      }
      cursor=data.nextCursor;
      properties.setProperty(cursorKey,String(cursor));
      if (!data.hasMore) return added ? 'Đã lấy thêm '+added+' feedback.' : 'Đã cập nhật. Không có feedback mới.';
    }
    return 'Đã lấy thêm '+added+' feedback. Bấm lại để tiếp tục lấy các trang còn lại.';
  } finally { lock.releaseLock(); }
}
