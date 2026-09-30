# Tham chiếu dựng model Heros

Model tương tác dùng chung cho trang chủ và `/san-pham`, với hình học ở `src/app/heros-geometry.ts`, lắp ráp ở `src/app/heros-device.tsx`, vật liệu ở `src/app/heros-materials.ts` và ánh sáng/góc nhìn ở `src/app/heros-3d.tsx`.

## Cơ sở hình ảnh

Lần chỉnh này đối chiếu bộ bốn ảnh được tạo riêng từ ảnh sản phẩm người dùng: mặt trước, mặt sau, cạnh trái và góc phải. Ảnh mặt trước được lưu tại `public/images/heros-product-reference-v2.png`; logo khiên và chữ HEROS lấy trực tiếp từ ảnh này, dùng mặt nạ màu để tách mực khỏi ánh sáng đã có trong ảnh. Cùng một mẫu logo được dùng nhất quán trên thân và dây vì chữ/logo trong các ảnh AI khác nhau có sai khác.

Tỷ lệ rộng/cao của thân là 38/62. Chiều dày được hiệu chỉnh theo cạnh bên trong bộ ảnh, tương đương khoảng 22,4 mm với đơn vị hình học hiện tại. Đây là chiều dày suy ra từ hình ảnh, không phải số đo thiết bị; số 16 mm trong nội dung thông số hiện có chưa được xác nhận lại. Các ảnh không phải bộ ảnh trực giao đã hiệu chuẩn, nên model không phải CAD sản xuất và chưa thể chứng nhận khớp 100%.

## Cấu trúc

- Vỏ kín có mặt trước và sau cong liên tục; pháp tuyến giải tích, khe ráp mảnh ở giữa thân.
- Viền nút kim loại hồng có bề mặt rộng, mặt nút hơi lồi, logo và chữ ôm bề mặt cong. Đèn chỉ báo có hình viên nhộng và nghiêng theo vỏ.
- Khoen chính hình oval, các mắt nối vuông góc đan vào nhau; một bản nối dẹt ở đầu dây. Quai trên rộng có đường may.
- Dây là dải da kín có tiết diện bo cạnh, đầu thu nhỏ, đinh tán xuyên, đường sơn cạnh và mũi chỉ 3D. Đáy dây gần ngang đáy thân.
- Vân da liền mạch, vi nhám nhựa satin, vật liệu phản xạ ánh sáng môi trường. Các texture và geometry được giải phóng khi tháo model.

Không hiển thị bảng ảnh tham chiếu, trình xuất ảnh hoặc đường dẫn tải PNG trong giao diện sản phẩm.

## Kiểm tra

`npm run check`, `npm test`, `npm run build`. Bộ kiểm tra hình học xác nhận chiều cong, pháp tuyến, số liên kết của các khoen, khe hở kim loại/da/thân, hướng bề mặt và vị trí đáy dây. Kiểm tra trình duyệt bao gồm trước, sau, cạnh bên, góc nghiêng và từ trên.
