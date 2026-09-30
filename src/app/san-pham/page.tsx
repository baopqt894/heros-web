import Link from "next/link";
import HerosIcon from "../heros-icon";
import Heros3D from "../heros-3d";
import { Reveal } from "../interactive";
export const metadata = { title: "Sản phẩm & hướng dẫn sử dụng | Heros" };
const features = [
  [
    "sos",
    "Gửi cảnh báo khẩn cấp",
    "Kích hoạt SOS để gửi lời cần giúp đến những người bạn tin tưởng.",
  ],
  [
    "location",
    "Chia sẻ vị trí",
    "Cung cấp vị trí trong tình huống khẩn cấp để người hỗ trợ có thể tìm đến.",
  ],
  [
    "audio",
    "Ghi âm trực tiếp",
    "Ghi lại âm thanh và chia sẻ thông tin khi cần thiết.",
  ],
  [
    "connection",
    "Kết nối người thân",
    "Quản lý danh sách người thân, bạn bè và những người bạn tin tưởng qua ứng dụng.",
  ],
] as const;
export default function ProductPage() {
  return (
    <main id="main">
      <section className="section wide-shell product-page">
        <div className="section-heading">
          <p className="chapter-label">Thiết bị Heros</p>
          <h1>Một chạm nhỏ. Một kết nối lớn.</h1>
          <p>Nhỏ gọn để mang theo. Gần gũi để luôn ở bên bạn.</p>
        </div>
        <div className="product-page-grid">
          <Heros3D />
          <div className="product-feature-list">
            {features.map(([icon, title, copy]) => (
              <article key={title}>
                <HerosIcon name={icon} size={42} />
                <div>
                  <h2>{title}</h2>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
            <Link href="/#dat-hang" className="button">
              Đặt Heros
            </Link>
          </div>
        </div>
      </section>
      <section className="usage-section section">
        <div className="wide-shell">
          <div className="section-heading">
            <p className="chapter-label">Bắt đầu cùng Heros</p>
            <h2>
              Thiết bị và ứng dụng.
              <br />
              <span>Kết nối trong từng bước.</span>
            </h2>
          </div>
          <div className="usage-steps">
            {[
              [
                "01",
                "Chuẩn bị ứng dụng",
                "Tải ứng dụng Heros, tạo tài khoản và hoàn thiện hồ sơ của bạn. Liên kết thiết bị bằng mã QR hoặc số seri theo hướng dẫn trong ứng dụng.",
              ],
              [
                "02",
                "Chọn những người bạn tin tưởng",
                "Thêm người thân vào danh sách liên hệ khẩn cấp và kiểm tra các quyền kết nối, thông báo, vị trí trong ứng dụng.",
              ],
              [
                "03",
                "Làm quen với thiết bị",
                "Mở khóa nút SOS bằng công tắc. Theo hướng dẫn thiết bị hiện tại: nhấn hai lần để gửi SOS, nhấn giữ để ghi âm rồi thả để kết thúc, nhấn ba lần để xác nhận an toàn.",
              ],
              [
                "04",
                "Theo dõi và giữ kết nối",
                "Xem trạng thái thiết bị, pin và phản hồi hỗ trợ trong ứng dụng. Kiểm tra kết nối trước khi mang Heros theo bên mình.",
              ],
            ].map(([n, title, copy]) => (
              <Reveal key={n}>
                <article>
                  <span>{n}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <p className="usage-note">
            Hướng dẫn theo cấu hình thiết bị trong tài liệu Heros. Hãy đối chiếu
            hướng dẫn đi kèm phiên bản thiết bị của bạn trước khi sử dụng.
          </p>
          <Link href="/download" className="text-link">
            Xem ứng dụng Heros →
          </Link>
        </div>
      </section>
    </main>
  );
}
