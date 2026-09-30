import { DownloadButtons } from "../site-chrome";
import HerosIcon from "../heros-icon";
export const metadata = { title: "Tải ứng dụng | Heros" };
export default function DownloadPage() {
  return (
    <main id="main">
      <section className="section wide-shell download-page">
        <div className="page-intro">
          <p className="chapter-label">Ứng dụng Heros</p>
          <h1>
            Gần người bạn thương,
            <br />
            <span>dù ở bất cứ đâu.</span>
          </h1>
          <p>
            Kết nối thiết bị, quản lý danh sách người thân và theo dõi trạng
            thái an toàn của bạn trong cùng một ứng dụng.
          </p>
          <DownloadButtons />
          <p className="pending-note">
            Ứng dụng đang được chuẩn bị phát hành. Link tải chính thức sẽ được
            cập nhật tại đây.
          </p>
        </div>
        <div
          className="app-preview"
          aria-label="Các chức năng của ứng dụng Heros"
        >
          <span>HEROS</span>
          <h2>
            Những kết nối
            <br />
            luôn bên bạn.
          </h2>
          {(
            [
              ["connection", "Người thân của bạn"],
              ["location", "Vị trí khi cần trợ giúp"],
              ["sos", "Thông báo khẩn cấp"],
            ] as const
          ).map(([icon, text]) => (
            <div key={String(text)}>
              <HerosIcon name={icon} size={32} />
              <p>{String(text)}</p>
            </div>
          ))}
          <small>Giới thiệu tính năng ứng dụng</small>
        </div>
      </section>
    </main>
  );
}
