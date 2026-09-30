# Heros

Website tiếng Việt, một phiên bản có mô hình 360°; `/v1` và `/v2` chuyển về `/`. Các trang: trang chủ, về chúng tôi, sản phẩm, tải ứng dụng, tài khoản/tra cứu đơn, điều khoản và liên hệ. Nội dung cập nhật theo các tab tài liệu góp ý của chủ thương hiệu.

## Chạy

Node.js >=22.13, lưu trữ ổ đĩa bền vững.

```bash
npm install
cp .env.example .env.local
# Điền key server và đặt HEROS_CHECKOUT_ENABLED=true khi mở thanh toán
npm run dev -- --hostname 127.0.0.1
```

Mở http://127.0.0.1:3000. `HEROS_SITE_URL` phải khớp origin truy cập để bảo vệ POST. Lint/TypeScript: `npm run check`; kiểm thử thanh toán: `npm test`; production: `npm run build && npm start`.

## Đơn hàng và thanh toán

- Giá đã được chủ thương hiệu xác nhận: **590.000đ/thiết bị**, miễn phí giao hàng, số lượng 1–10. Máy chủ tự tính tiền.
- Kênh payOS riêng **Heros**, tài khoản ngân hàng chính đã liên kết trong payOS. Ba key đặt trong `.env.local`, không commit và không gửi ra client.
- `POST /api/orders`: lưu đơn trước khi tạo link thật qua SDK payOS; hỗ trợ COD. UUID cho mỗi yêu cầu chống tạo trùng. Đơn lưu trong SQLite, không bị mất khi tải lại.
- Đăng nhập email + mật khẩu trước khi đặt hàng. `/tai-khoan` hiển thị lịch sử đơn trên các thiết bị đăng nhập cùng tài khoản, không cần nhớ mã đơn. Session HttpOnly lưu 30 ngày, token chỉ lưu dạng hash trong SQLite. Mật khẩu được băm bằng scrypt.
- `/thanh-toan` kiểm tra trạng thái từ API máy chủ. Tham số URL `status`/`cancel` không thể xác nhận đã trả tiền. Máy chủ đối chiếu mã đơn, số tiền, link và trạng thái payOS.
- `POST /api/payos/webhook`: xác minh chữ ký bằng SDK, đối chiếu đơn và truy vấn trạng thái payOS trước khi cập nhật. Không lùi trạng thái đơn đã thanh toán.
- `/thanh-toan` có phiếu xác nhận mua hàng, thông tin người nhận, chi tiết tiền và nút In / Lưu PDF qua hộp thoại in của trình duyệt. Đây không phải hóa đơn VAT.
- Tạo tài khoản cấp mã khôi phục dùng một lần, cần tải/lưu riêng. Khôi phục xoay mã mới và vô hiệu mọi phiên cũ. Chưa tích hợp email xác minh, email đặt lại mật khẩu hoặc OTP; mất cả mật khẩu và mã cần liên hệ hỗ trợ để xác minh thủ công.
- Đơn cũ chưa gắn tài khoản chỉ được nhận vào tài khoản khi còn cookie quyền truy cập trên trình duyệt đặt hàng và email tài khoản trùng email đơn. Chỉ biết email hoặc mã đơn không đủ để nhận đơn. Mất cookie trước khi gắn tài khoản cần hỗ trợ xác minh thủ công.
- Không có giao dịch chuyển tiền tự động, tích hợp vận chuyển hoặc email xác nhận.

## Đưa lên môi trường công khai

1. Chạy trên **một Node.js server với ổ đĩa bền vững**; không dùng SQLite này trên serverless hoặc nhiều replica. Đặt `HEROS_DB_PATH` ngoài thư mục release, bảo vệ và sao lưu dữ liệu đơn/lời nhắn.
2. Đặt `HEROS_SITE_URL` là tên miền HTTPS thật, cùng ba key kênh Heros. Chỉ server được đọc key. Reverse proxy phải tự đặt `X-Forwarded-For`, không giữ giá trị tùy ý từ client.
3. Trong payOS/kênh Heros đặt Webhook URL thành `https://<domain>/api/payos/webhook` và xác nhận kết nối. Localhost không nhận được webhook công khai.
4. Kiểm tra tạo link, hủy link, trạng thái trả về và webhook bằng môi trường công khai. Việc tạo được link không phải bằng chứng đã nhận tiền.
5. Thiết lập vận hành xử lý đơn COD, giao hàng, lời nhắn và email trước khi quảng bá mở bán.

## Nội dung chờ nguồn chính thức

- Chưa có URL App Store/Google Play: các nút báo đang chuẩn bị, không dẫn đến app khác. Thêm `HEROS_IOS_URL` và `HEROS_ANDROID_URL` khi có.
- Đã có 6 thành viên do chủ thương hiệu cung cấp trong `src/content/team.ts`: Bảo Hân, Thuỳ Linh, Lương Đặng, Ni Na, Tom Trần, Bảo Châu. Hiện dùng hình chữ cái; chưa có ảnh chân dung/vai trò chính thức. Điều khoản chính thức vẫn chờ nội dung từ chủ thương hiệu.
- `HEROS_CONTACT_EMAIL` tùy chọn. Form liên hệ lưu thật vào bảng `contact_messages`, chưa gửi email hay thông báo cho đội ngũ. Đơn hàng nằm trong bảng `orders`. Không công khai file SQLite.
- Mô hình 360° là mô hình minh họa WebGL; không phải bản CAD sản xuất.

## Nguồn

- [Góp ý giao diện web](https://docs.google.com/document/d/1bec0S4GsaUNjNsxfhqynu-bGPhmRHd4ADF-vf8wPFH8/edit)
- [SDK payOS chính thức](https://payos.vn/docs/sdks/back-end/node/) và [API](https://payos.vn/docs/api/)

## Kết quả xác minh ngày 30/09/2026

- Kênh Heros đã tạo, đang hoạt động; ba key thật đã gắn trong môi trường local.
- Đã tạo link payOS thật 590.000đ qua `POST /api/orders`, sau đó hủy thành công; không thực hiện chuyển tiền. Đơn kiểm thử được lưu với tên `KIEM THU TICH HOP - KHONG GIAO HANG` và trạng thái `CANCELLED`.
- Qua kiểm tra HTTP: giá gửi từ client không thay đổi số tiền; yêu cầu lặp dùng lại cùng đơn; đổi nội dung với cùng request ID bị từ chối; tra cứu không cookie trả 404; webhook giả bị chặn; URL `status=PAID` không thay đổi trạng thái.
- Lint, TypeScript, production build và 15 kiểm thử nghiệp vụ/chữ ký/tài khoản đều qua. Dependency audit: 0 lỗ hổng sau bản vá tương thích.
- Luồng tài khoản được kiểm tra trên server production local riêng (port 3010, SQLite riêng, key payOS giả, chỉ COD): đăng nhập từ phiên mới vẫn xem được lịch sử; tài khoản khác bị từ chối; đăng xuất/khôi phục hủy phiên; tạo đơn giữ đúng giá và chống lặp. Không tạo giao dịch payOS mới trong đợt kiểm tra tài khoản.
- Chưa deploy, chưa gắn webhook vào tên miền công khai. Giao dịch trả tiền của người dùng trong dữ liệu cũ được giữ nguyên; kiểm thử không tác động dữ liệu này.
- Bảng đối chiếu đầy đủ 5 tab và các giới hạn nội dung: [UI_REVIEW.md](./UI_REVIEW.md).
