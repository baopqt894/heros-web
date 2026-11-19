# Feedback Heros và Google Sheets

## Nút lấy dữ liệu

Sheet đích: https://docs.google.com/spreadsheets/d/1VIyPDgdyM4zj6-dKRDMri68Y5SnKe3sWi0ny99i8h3o/edit

1. Trong Apps Script gắn với Sheet, thêm **tệp mới `Fetch.gs`** bằng nội dung cùng tên tại thư mục này. Giữ nguyên tệp receiver cũ.
2. Lưu và tải lại Sheet. Menu **Heros → Lấy feedback từ website** mở sidebar có nút **Lấy feedback**. Google có thể yêu cầu chủ tài khoản cấp quyền lần đầu.
3. Tạo một khóa ngẫu nhiên ít nhất 32 ký tự. Đặt cùng giá trị `HEROS_FEEDBACK_EXPORT_KEY` ở biến môi trường server website và **Project Settings → Script Properties**. Không ghi khóa vào ô tính, mã nguồn hoặc URL.
4. Deploy website có API export và cấu hình lưu trữ bền vững trước khi dùng nút.

API: `GET https://heros.dolphinxstudio.com/api/contact/export?after=0`
Header: `Authorization: Bearer <HEROS_FEEDBACK_EXPORT_KEY>`.
Không cần và không được đặt key trong frontend. Thiếu cấu hình trả 503; sai key trả 401; phản hồi không được cache.

```json
{"messages":[{"id":1,"name":"Người gửi","email":"test@example.com","phone":"","message":"Lời nhắn","createdAt":"2026-11-19T00:00:00.000Z"}],"nextCursor":1,"hasMore":false}
```

Mỗi trang tối đa 200 dòng. Nút nối thêm những ID chưa có, giữ trạng thái xử lý cũ, bảo vệ số điện thoại và công thức. Chỉ lưu cursor sau khi ghi xong. Nếu gặp lỗi, bấm lại để tiếp tục; không xóa dòng đã ghi. Giữ cấu trúc 7 cột: ID, Thời gian (VN), Họ tên, Email, Số điện thoại, Lời nhắn, Trạng thái.

**Giới hạn triển khai hiện tại:** API POST và export vẫn đọc/ghi SQLite theo `HEROS_DB_PATH`; cần filesystem bền vững. Vercel không cung cấp ổ đĩa SQLite bền vững cho cấu hình này. Việc thêm menu hoặc sửa Origin chưa xác nhận được đồng bộ production. Cần chuyển lưu trữ sang backend/DB hoặc hoàn tất receiver bên dưới; không dùng `/tmp` để giả lập việc lưu lâu dài.

## Receiver tùy chọn (chưa nối vào website)

`Code.gs` là receiver độc lập để nhận feedback trực tiếp vào Sheet nếu chọn cách này:

1. Dán vào Apps Script, chạy `setup()` để tạo tab và Script Properties (không xóa dữ liệu cũ).
2. Lấy `HEROS_FEEDBACK_SECRET` từ Script Properties, lưu ở cấu hình server.
3. Deploy Web app, chạy dưới tài khoản chủ sở hữu; URL `/exec` là đích nhận dữ liệu từ server. Receiver kiểm tra secret trong body trước mọi lần ghi. Giữ cách chia sẻ Sheet theo lựa chọn của chủ dự án.
4. Server gửi JSON gồm `secret`, `name`, `email`, `phone`, `message` đến `/exec`. Phải kiểm tra JSON `ok === true`, không chỉ HTTP 200. Không gửi secret từ trình duyệt người dùng.

Receiver không tự thay đổi luồng SQLite; cần nối vào `POST /api/contact` trước khi sử dụng thật.

## Lỗi Origin

`POST https://heros.dolphinxstudio.com/api/contact` yêu cầu `Origin: https://heros.dolphinxstudio.com` và `Content-Type: application/json`. Vercel Production cần `HEROS_SITE_URL=https://heros.dolphinxstudio.com`, sau đó redeploy. Body rỗng đúng origin phải trả 400 (validation), không phải 403. Kiểm thử lưu dữ liệu hợp lệ là bước riêng.
