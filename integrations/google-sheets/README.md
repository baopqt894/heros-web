# Feedback Heros và Google Sheets

## Nút lấy dữ liệu

Sheet đích: https://docs.google.com/spreadsheets/d/1VIyPDgdyM4zj6-dKRDMri68Y5SnKe3sWi0ny99i8h3o/edit

1. Trong Apps Script gắn với Sheet, thêm **tệp mới `Fetch.gs`** bằng nội dung cùng tên tại thư mục này. Giữ nguyên tệp receiver cũ.
2. Lưu và tải lại Sheet. Menu **Heros → Lấy feedback từ website** mở sidebar có nút **Lấy feedback**. Google có thể yêu cầu chủ tài khoản cấp quyền lần đầu.
3. Tạo một khóa ngẫu nhiên ít nhất 32 ký tự. Đặt cùng giá trị `HEROS_FEEDBACK_EXPORT_KEY` ở biến môi trường server website, backend HEROS và **Project Settings → Script Properties**. Không ghi khóa vào ô tính, mã nguồn hoặc URL.
4. Deploy website có API export và cấu hình lưu trữ bền vững trước khi dùng nút.

API: `GET https://heros.dolphinxstudio.com/api/contact/export?after=0`
Header: `Authorization: Bearer <HEROS_FEEDBACK_EXPORT_KEY>`.
Không cần và không được đặt key trong frontend. Thiếu cấu hình trả 503; sai key trả 401; phản hồi không được cache.

```json
{"messages":[{"id":"0123456789abcdef01234567","name":"Người gửi","email":"test@example.com","phone":"","message":"Lời nhắn","createdAt":"2026-11-19T00:00:00.000Z"}],"nextCursor":1,"hasMore":false}
```

Mỗi trang tối đa 200 dòng; cursor là offset, ID là ObjectId của MongoDB. Script quét lại từ đầu sau một chu kỳ hoàn tất để lấy cả bản ghi chèn trễ, vẫn chống trùng theo ID. Nút nối thêm những ID chưa có, giữ trạng thái xử lý cũ, bảo vệ số điện thoại và công thức. Chỉ lưu cursor sau khi ghi xong. Nếu gặp lỗi, bấm lại để tiếp tục; không xóa dòng đã ghi. Giữ cấu trúc 7 cột: ID, Thời gian (VN), Họ tên, Email, Số điện thoại, Lời nhắn, Trạng thái.

**Backend cần triển khai:** FE chuyển tiếp POST đến `HEROS_API_URL/contact`, export đến `HEROS_API_URL/contact/export`. Backend ContactModule ghi MongoDB collection `contact_messages`; không còn SQLite trong luồng web. Cần deploy backend mới trước khi form gửi thành công. Khóa export phải khớp cả backend, Vercel và Apps Script; thiếu khóa không ảnh hưởng gửi feedback nhưng sẽ chặn lấy danh sách. File SQLite cũ vẫn được giữ nguyên, không tự migrate.

Hướng dẫn backend: `heros-be/docs/CONTACT_FEEDBACK_VI.md`. Phản hồi backend theo envelope `{success:true,code:201,data:{id,createdAt}}` cho POST; export dùng `{success:true,code:200,data:{messages,nextCursor,hasMore}}`.

## Receiver tùy chọn (chưa nối vào website)

`Code.gs` là receiver độc lập để nhận feedback trực tiếp vào Sheet nếu chọn cách này:

1. Dán vào Apps Script, chạy `setup()` để tạo tab và Script Properties (không xóa dữ liệu cũ).
2. Lấy `HEROS_FEEDBACK_SECRET` từ Script Properties, lưu ở cấu hình server.
3. Deploy Web app, chạy dưới tài khoản chủ sở hữu; URL `/exec` là đích nhận dữ liệu từ server. Receiver kiểm tra secret trong body trước mọi lần ghi. Giữ cách chia sẻ Sheet theo lựa chọn của chủ dự án.
4. Server gửi JSON gồm `secret`, `name`, `email`, `phone`, `message` đến `/exec`. Phải kiểm tra JSON `ok === true`, không chỉ HTTP 200. Không gửi secret từ trình duyệt người dùng.

Receiver này không được dùng trong luồng MongoDB hiện tại; giữ lại để tham khảo, không cần deploy nó để dùng nút lấy dữ liệu.

## Lỗi Origin

`POST https://heros.dolphinxstudio.com/api/contact` yêu cầu `Origin: https://heros.dolphinxstudio.com` và `Content-Type: application/json`. Vercel Production cần `HEROS_SITE_URL=https://heros.dolphinxstudio.com`, sau đó redeploy. Body rỗng đúng origin phải trả 400 (validation), không phải 403. Kiểm thử lưu dữ liệu hợp lệ là bước riêng.
