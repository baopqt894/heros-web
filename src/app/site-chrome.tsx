import Link from "next/link";
import {
  AppleLogo,
  GooglePlayLogo,
  ArrowUpRight,
  Heart,
} from "@phosphor-icons/react/dist/ssr";

export function DownloadButtons() {
  const stores = [
    { label: "App Store", url: process.env.HEROS_IOS_URL, Icon: AppleLogo },
    {
      label: "Google Play",
      url: process.env.HEROS_ANDROID_URL,
      Icon: GooglePlayLogo,
    },
  ];
  return (
    <div className="store-buttons">
      {stores.map(({ label, url, Icon }) =>
        url ? (
          <a
            key={label}
            className="store-button"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            <Icon size={24} weight="fill" />
            <span>
              <small>Tải Heros trên</small>
              {label}
            </span>
            <ArrowUpRight size={16} />
          </a>
        ) : (
          <div key={label} className="store-button store-pending">
            <Icon size={24} weight="fill" />
            <span>
              <small>Sắp có trên</small>
              {label}
            </span>
          </div>
        ),
      )}
    </div>
  );
}

export function SiteFooter() {
  return (
    <>
      <section className="download-band">
        <div className="wide-shell download-grid">
          <div>
            <p className="chapter-label">HEROS, ngay bên bạn</p>
            <h2>
              Một kết nối nhỏ.
              <br />
              <span>Thêm an tâm mỗi ngày.</span>
            </h2>
            <p>
              Thiết bị và ứng dụng, cùng bạn giữ những người mình tin tưởng ở
              thật gần.
            </p>
            <Link className="text-link" href="/download">
              Khám phá ứng dụng <ArrowUpRight size={17} />
            </Link>
          </div>
          <div>
            <DownloadButtons />
            <p className="download-note">
              Link tải sẽ được cập nhật khi ứng dụng phát hành chính thức.
            </p>
          </div>
        </div>
      </section>
      <footer className="site-footer">
        <div className="wide-shell">
          <div className="site-footer-grid">
            <Link className="footer-wordmark" href="/">
              HEROS<span>SAFETY WITH YOU</span>
            </Link>
            <p>
              Vì bạn xứng đáng
              <br />
              được quan tâm.
            </p>
            <nav aria-label="Điều hướng cuối trang">
              <Link href="/ve-chung-toi">Về chúng tôi</Link>
              <Link href="/san-pham">Sản phẩm</Link>
              <Link href="/dieu-khoan">Điều khoản & chính sách</Link>
              <Link href="/lien-he">Liên hệ</Link>
              <Link href="/download">Download</Link>
              <Link href="/tai-khoan">Tài khoản</Link>
            </nav>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Heros.</span>
            <span>Cùng bạn, mỗi ngày.</span>
            <Heart size={17} />
          </div>
        </div>
      </footer>
    </>
  );
}
