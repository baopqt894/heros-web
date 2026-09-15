import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  BellRinging,
  Heart,
  MapPin,
  Microphone,
  ShieldCheck,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { ContactForm, Order, Reveal } from "../interactive";

const features = [
  [BellRinging, "Gửi cảnh báo khẩn cấp", "Nhấn giữ 2 giây để gửi tín hiệu SOS."],
  [MapPin, "Chia sẻ vị trí", "Giúp người thân biết bạn đang ở đâu."],
  [Microphone, "Ghi âm bằng chứng", "Lưu lại thông tin trong tình huống cần thiết."],
  [UsersThree, "Kết nối cộng đồng", "Thêm những người luôn sẵn sàng ở bên."],
] as const;

export default function VersionOne() {
  return (
    <div className="v1-page">
      <div className="announcement">
        <span>Phiên bản V1 · Giao diện nguyên bản <a href="/v2">Xem bản V2</a></span>
      </div>
      <header className="v1-header">
        <div className="shell v1-nav">
          <a className="v1-brand" href="#" aria-label="Heros phiên bản 1">
            <Image src="/images/heros-logo.png" alt="" width={58} height={58} />
            <span>HEROS<small>SAFETY WITH YOU</small></span>
          </a>
          <nav aria-label="Điều hướng phiên bản 1">
            <a href="#cau-chuyen-v1">Câu chuyện</a>
            <a href="#san-pham-v1">Sản phẩm</a>
            <a href="#lien-he-v1">Liên hệ</a>
          </nav>
          <a href="#dat-hang" className="button small">Đặt Heros</a>
        </div>
      </header>

      <main>
        <section className="v1-hero shell">
          <div className="v1-hero-copy">
            <p className="v1-eyebrow">HEROS • SAFETY WITH YOU</p>
            <h1>An tâm bên bạn.<br /><em>Tự do là mình.</em></h1>
            <p>Một người bạn nhỏ, để mỗi hành trình của bạn thêm vững tâm.</p>
            <div className="v1-actions">
              <a className="button" href="#dat-hang">Đặt Heros <ArrowUpRight size={18} /></a>
              <a href="#cau-chuyen-v1">Câu chuyện của chúng tớ <ArrowDown size={17} /></a>
            </div>
          </div>
          <div className="v1-hero-image">
            <Image src="/images/heros-product.png" alt="Thiết bị Heros màu hồng" width={700} height={700} preload />
          </div>
        </section>

        <div className="v1-values"><div className="shell"><span><ShieldCheck /> An tâm chỉ với một chạm</span><span><Heart /> Thiết kế bằng sự thấu hiểu</span><span><UsersThree /> Kết nối người bạn thương</span></div></div>

        <section id="cau-chuyen-v1" className="v1-story section shell">
          <Reveal><div className="v1-story-grid"><div><p className="v1-script">Chào bạn, chúng tớ là Heros.</p><h2>Vì bạn xứng đáng<br />được <em>an tâm.</em></h2></div><div><h3>“Về đến nhà nhắn tớ nhé.”</h3><p>Một câu nói quen thuộc, nhưng chứa cả sự quan tâm. Heros được xây dựng để cảm giác có ai đó ở bên không chỉ nằm trong một tin nhắn.</p><p>Một thiết bị nhỏ gọn, giúp bạn kết nối với người thân khi cần và thêm tự tin trên những hành trình của riêng mình.</p><strong>Bạn cứ là bạn. Heros ở đây, cùng bạn.</strong></div></div></Reveal>
        </section>

        <section id="san-pham-v1" className="v1-product section">
          <div className="shell">
            <Reveal><div className="v1-section-title"><p className="v1-eyebrow">NHỎ GỌN TRONG TAY, AN TÂM MỖI NGÀY</p><h2>Một chạm nhỏ.<br /><em>Một kết nối lớn.</em></h2></div></Reveal>
            <div className="v1-product-grid">
              <div className="v1-product-image"><Image src="/images/heros-product.png" alt="Cận cảnh thiết bị Heros" width={640} height={640} /></div>
              <div className="v1-feature-list">{features.map(([Icon, title, copy]) => <article key={title}><span><Icon size={25} weight="light" /></span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div>
            </div>
          </div>
        </section>

        <section className="v1-everyday section shell"><div><Heart size={42} weight="light" /><h2>Bên bạn, trong những<br /><em>điều bình thường nhất.</em></h2><p>Móc vào túi xách. Gắn lên ba lô. Mang theo bên mình.</p><div><span>Đi học</span><span>Đi làm</span><span>Dạo phố</span><span>Khám phá</span></div></div></section>

        <Order />

        <section id="lien-he-v1" className="v1-contact section"><div className="shell contact-grid"><div><p className="v1-eyebrow">CHÚNG TỚ LUÔN LẮNG NGHE</p><h2>Một lời nhắn,<br /><em>thêm một kết nối.</em></h2><p>Có câu hỏi, ý tưởng hay điều gì muốn chia sẻ? Để lại lời nhắn cho Heros nhé.</p></div><ContactForm /></div></section>
      </main>

      <footer className="footer shell"><div className="footer-top"><a className="footer-wordmark" href="#">HEROS<span>SAFETY WITH YOU</span></a><p>Phiên bản giao diện đầu tiên.</p><a className="back-top" href="/v2">Xem phiên bản 2 <ArrowUpRight size={18} /></a></div></footer>
    </div>
  );
}
