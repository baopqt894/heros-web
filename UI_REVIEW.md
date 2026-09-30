# Đối chiếu góp ý website Heros — 30/09/2026

Đã đọc lại nội dung và bình luận của cả 5 tab trong tài liệu [Góp ý giao diện web](https://docs.google.com/document/d/1bec0S4GsaUNjNsxfhqynu-bGPhmRHd4ADF-vf8wPFH8/edit), bao gồm ảnh bố cục tham khảo. Ảnh SafeHer/Lutech chỉ là tham khảo thiết kế; không dùng tên người, chức danh hoặc thông tin doanh nghiệp trong ảnh làm dữ liệu Heros.

| Nguồn | Đối chiếu và kết quả |
| --- | --- |
| Trang chủ — `t.5xu4g0tuypfo` | Đổi thành “Vì bạn xứng đáng được quan tâm”; “Về đến nhà nhắn tớ nhé” là tiêu đề riêng, phần còn lại là đoạn nhỏ; tiêu đề lifestyle “Bên bạn, trong những điều bình thường nhất” một dòng trên laptop, xuống dòng phù hợp trên điện thoại; FAQ nền hồng nhạt bo góc, chữ nhỏ hơn; phần lắng nghe nền hồng; giữ phiên bản mô hình 360°, `/v1` và `/v2` chuyển về `/`. |
| Về chúng tôi — `t.pyc581tlwvum` | Thiết kế lại phần mở đầu, sứ mệnh, 5 giá trị và đội ngũ. Giữ nội dung sứ mệnh/giá trị của tài liệu. Đủ 6 tên do chủ thương hiệu xác nhận: Bảo Hân, Thuỳ Linh, Lương Đặng, Ni Na, Tom Trần, Bảo Châu. Chưa có ảnh/vai trò nên dùng hình chữ cái và không gán chức danh. |
| Sản phẩm — `t.5h7m7t8mr351` | Có trang riêng, thông tin thiết bị và ứng dụng, “Ghi âm trực tiếp”, hướng dẫn thao tác và liên kết tải ứng dụng. Chỗ tiêu đề thay thế còn trống trong Docs được giữ nội dung hiện tại. Nội dung thao tác ưu tiên ghi chú thiết bị mới hơn: khóa bật/tắt, nhấn hai lần SOS, giữ để ghi âm, ba lần báo an toàn. |
| Điều khoản & chính sách — `t.wrz0y07c1np7` | Có trang và liên kết ở footer theo bình luận. Docs ghi “SẼ SOẠN SAU”; trang thông báo chờ chính sách chính thức. Không sao chép điều khoản của thương hiệu tham chiếu. |
| Liên hệ — `t.dresk8vxdmkj` | Có trang riêng với phần giới thiệu và form, bố cục hai cột trên laptop, xếp dọc trên điện thoại, liên kết ở footer. Form lưu vào SQLite; chưa gửi email hoặc thông báo cho nhân sự. |

## Rà soát thiết kế chung

- Giảm cỡ chữ, khoảng trống và kích thước khu vực tính năng; bỏ phần tính năng lặp ở trang chủ.
- Bộ 8 icon SVG riêng cùng nét bo tròn, tông hồng hai sắc và hình chuông/khiên/trái tim liên hệ logo Heros. Icon chức năng như mũi tên, in, ẩn/hiện mật khẩu vẫn dùng thư viện để dễ hiểu.
- SOS trình diễn gọn hơn; ghi rõ minh họa, không gửi cảnh báo thật.
- Màu nền, kiểu nút, bo góc và phân cấp chữ thống nhất trên trang chủ, về chúng tôi, sản phẩm, tải ứng dụng, tài khoản và đơn hàng.
- Giữ mô hình 360°; không tạo thêm phiên bản giao diện.

## Luồng mua hàng và quay lại

1. Chọn số lượng, đăng nhập hoặc tạo tài khoản email/mật khẩu.
2. Tài khoản mới lưu mã khôi phục dùng một lần.
3. Điền người nhận, chọn payOS hoặc COD. Server tính 590.000đ × số lượng, miễn phí giao hàng, lưu đơn gắn tài khoản trước khi chuyển thanh toán.
4. Trang kết quả đối chiếu trạng thái server, hiển thị phiếu xác nhận đơn và nút In / Lưu PDF. COD không được ghi là đã trả tiền.
5. Quay lại “Tài khoản” trên thiết bị bất kỳ, đăng nhập và xem lịch sử không cần mã đơn.
6. Đơn khách cũ chỉ được gắn khi còn cookie hợp lệ và email tài khoản trùng đơn; mất cookie cần hỗ trợ xác minh thủ công. Không mở tra cứu thông tin cá nhân chỉ bằng email/số điện thoại/mã đơn.

Phiếu mua hàng không phải hóa đơn VAT. Chưa có email xác minh, email xác nhận đơn, dịch vụ vận chuyển, hóa đơn thuế hay đồng bộ tài khoản ứng dụng di động. Các mục này cần dịch vụ và thông tin chính thức trước khi triển khai.

## Xác minh

- `npm run check`, `npm test` (15/15), `npm run build`: qua.
- Kiểm thử HTTP trên SQLite riêng: bắt buộc đăng nhập, giá do server tính, chống lặp, lịch sử qua phiên đăng nhập mới, chặn tài khoản khác, đăng xuất và khôi phục thu hồi phiên.
- Kiểm tra trình duyệt desktop và mobile: trang về chúng tôi/6 thành viên, bộ tính năng/SOS, đăng nhập, lịch sử, chi tiết đơn. Không dùng đơn thật để thực hiện kiểm thử có ghi dữ liệu.
- Chưa triển khai lên tên miền công khai. Các link App Store/Google Play và điều khoản vẫn cần chủ thương hiệu cung cấp.
