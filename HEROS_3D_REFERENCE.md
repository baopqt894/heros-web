# Tham chiếu dựng model Heros

- Ảnh: `public/images/heros-four-views.png`.
- Tạo bằng imagegen tích hợp, chế độ chỉnh sửa dựa trên ảnh `public/images/heros-product.png`, trước khi dựng lại model.
- Bốn góc: trước, bên phải, sau, nghiêng. Mặt sau là phần phác dựng, chưa có ảnh chụp thực tế xác nhận.
- Model WebGL: `src/app/heros-3d.tsx`. Thân lấy tỷ lệ 38 × 62 × 16 mm từ tài liệu người dùng; nút nổi, logo, đèn, khoen bạc và vòng dây đeo dựng bằng geometry. Logo dùng ảnh thương hiệu gốc làm texture. Đây là mô hình minh họa, không phải CAD sản xuất.
- Truy cập `/v2#heros-3d`; chọn góc hoặc kéo để xoay. Mở “Xem bản tham chiếu 4 góc” để đối chiếu.

## Prompt tạo ảnh

Create a precise premium industrial-design four-view reference sheet of the HEROS pink personal safety device in the supplied image. A clean 2x2 grid on warm white, same scale in each quadrant: FRONT, RIGHT SIDE, BACK, THREE-QUARTER. Reproduce this exact product: softly convex capsule/oval pebble body 62mm tall 38mm wide 16mm thick, blush satin pink shell with subtle perimeter seam, short vertical silver gray indicator above a raised circular rose pink rim button, pale pink button face with shield woman emblem, HEROS pink wordmark below. Realistic polished SILVER interlocking keyrings physically attached to pink top eyelet, pink wide flat wrist loop with silver snap and HEROS lettering. No floating rings. Side view shows thickness and button protrusion; infer a plain smooth rear with subtle seam and no invented controls, screen, speaker holes or regulatory text. All four views must be same consistent object, mechanically plausible curved closed wrist strap loop, photorealistic PBR studio rendering with soft shadow. Preserve logo appearance. No dimensions or extra marketing copy; only discreet English view labels. This is a modeling reference, not a website.
