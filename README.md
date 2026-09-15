# Heros — Website giới thiệu & đặt hàng demo

Website tiếng Việt theo bộ nhận diện hồng Heros: câu chuyện, tính năng sản phẩm, đặt hàng, FAQ và liên hệ. Có hai hướng giao diện để so sánh:

- `/v1`: bản đầu với hero chia đôi, chất mềm mại và gần gũi.
- `/v2`: bản kể chuyện sản phẩm cao cấp lấy cảm hứng từ nhịp trình bày của Apple, có gallery ngang, chương sản phẩm lớn và mô hình 3D tương tác.

Trang `/` hiển thị cùng nội dung với `/v2`. Cả hai bản responsive, có animation theo cuộn, hiệu ứng hover và hỗ trợ reduced motion.

## Chạy

```bash
npm install
npm run dev
```

Mở http://localhost:3000. Kiểm tra: `npm run check`; build: `npm run build`; chạy production: `npm start`.

## Phạm vi demo

- Giá minh họa **590.000đ/thiết bị**, số lượng từ 1–10, phí giao hàng demo bằng 0.
- Form gồm tên, điện thoại Việt Nam, email, địa chỉ. Có validation native.
- Xem lại đơn, quay lại sửa, mô phỏng payOS thành công hoặc xác nhận COD.
- Không kết nối payOS, không sinh QR chuyển khoản, không thu tiền, không giao hàng hay gửi email thật.
- Dữ liệu form chỉ ở bộ nhớ của trang; tải lại sẽ mất, không ghi localStorage/database/server.
- Liên hệ có trạng thái gửi thử, chưa có địa chỉ liên hệ chính thức.
- Nội dung câu chuyện là bản copy đề xuất; thông số tính năng lấy từ ảnh minh họa, cần chủ thương hiệu duyệt trước khi công bố chính thức.

## File chính

- `src/app/page.tsx`: các phần nội dung, FAQ, thông tin thiết bị.
- `src/app/interactive.tsx`: menu mobile, chuyển động, đặt hàng và form liên hệ.
- `src/app/heros-3d.tsx`: mô hình 3D minh họa dựng bằng hình học WebGL.
- `src/app/v1/page.tsx` và `src/app/v2/page.tsx`: hai phiên bản giao diện.
- `src/app/globals.css`: palette, typography, responsive và animation.
- `src/app/layout.tsx`: metadata và font Be Vietnam Pro tự host qua @fontsource.
- `public/images/`: logo gốc, ảnh thông tin gốc và ảnh hero được tạo dựa trên mẫu sản phẩm.

## Để mở bán thật

Cần giá/chính sách chính thức, kênh liên hệ, lưu đơn phía server, tích hợp payOS phía server cùng webhook xác minh chữ ký và trạng thái thanh toán, email xác nhận. Nút mô phỏng hiện tại không được dùng làm căn cứ xác nhận thanh toán thật. Khóa bí mật phải giữ phía server.

## Ảnh

`heros-logo.png` và `heros-details.png`: file gốc người dùng cung cấp.
`heros-product.png`: tạo bằng imagegen built-in dựa trên hai ảnh tham chiếu, dùng làm ảnh hero minh họa. Prompt lưu trong `ASSET_PROMPT.md`.

## Kiểm tra thực tế

- Lint, TypeScript và production build đã qua.
- Browser desktop và mobile 390px: trang hiển thị, không tràn ngang, menu mobile hoạt động.
- Form trống bị chặn; số lượng 2 cho tổng 1.180.000đ.
- PayOS demo và COD đều đi tới trạng thái hoàn tất; form liên hệ có xác nhận gửi thử.
