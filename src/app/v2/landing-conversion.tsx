import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BellSimple,
  Heart,
  MapPin,
  Plus,
  ShieldCheck,
  Users,
} from "@phosphor-icons/react/dist/ssr";
import { ContactForm, Order, Reveal } from "../interactive";
import "./landing-conversion.css";

function AppIllustration() {
  return (
    <figure className="v2-app-illustration">
      <div className="v2-phone-halo" aria-hidden="true" />
      <div className="v2-phone" aria-hidden="true">
        <div className="v2-phone-island" />
        <div className="v2-phone-topline">
          <span>HEROS</span>
          <BellSimple size={19} />
        </div>
        <p className="v2-phone-greeting">Chào bạn.</p>
        <p className="v2-phone-subtitle">Những kết nối thân quen.</p>
        <div className="v2-phone-map">
          <span className="v2-map-street v2-map-street-one" />
          <span className="v2-map-street v2-map-street-two" />
          <span className="v2-map-street v2-map-street-three" />
          <span className="v2-map-orbit v2-map-orbit-one" />
          <span className="v2-map-orbit v2-map-orbit-two" />
          <span className="v2-map-heart"><Heart weight="fill" size={25} /></span>
          <span className="v2-map-label"><MapPin size={12} weight="fill" /> Vị trí khi cần</span>
        </div>
        <div className="v2-phone-connection">
          <span className="v2-phone-connection-icon"><ShieldCheck size={22} /></span>
          <div><strong>Heros của bạn</strong><span>Kết nối thiết bị</span></div>
          <Plus size={16} />
        </div>
        <div className="v2-phone-circle">
          <div><strong>Người thân</strong><span>Vòng tròn quan tâm của bạn</span></div>
          <span className="v2-phone-people"><Users size={25} /></span>
        </div>
        <div className="v2-phone-tabs">
          <span><ShieldCheck size={18} />Thiết bị</span>
          <span><Users size={18} />Người thân</span>
          <span><Heart size={18} />Của bạn</span>
        </div>
        <span className="v2-phone-home" />
      </div>
      <figcaption>Giao diện minh họa · Ứng dụng đang được chuẩn bị phát hành</figcaption>
    </figure>
  );
}

export function LandingConversion({ checkoutEnabled }: { checkoutEnabled: boolean }) {
  const faqs = [
    {
      question: "Heros hoạt động như thế nào?",
      answer: "Bạn kết nối thiết bị với ứng dụng Heros, thiết lập danh sách người thân và kích hoạt SOS khi cần trợ giúp. Khả năng hoạt động phụ thuộc vào kết nối, ứng dụng và cấu hình thiết bị. Phần trải nghiệm trên website không gửi cảnh báo thật.",
    },
    {
      question: "Mình có cần kết nối với điện thoại không?",
      answer: "Có. Heros sử dụng ứng dụng trên điện thoại để quản lý thiết bị, người thân và tình trạng an toàn. Ứng dụng đang được chuẩn bị phát hành; yêu cầu tương thích cụ thể cần được xác nhận trước khi mở bán. Link tải chính thức sẽ được cập nhật tại trang ứng dụng.",
    },
    {
      question: "Mình có thể đặt hàng ngay không?",
      answer: checkoutEnabled
        ? "Có. Bạn chọn số lượng, điền thông tin nhận hàng và chọn cách thanh toán. Sau đó, đăng nhập hoặc tạo tài khoản, xem lại rồi xác nhận đơn. Heros có giá 590.000đ/thiết bị, miễn phí giao hàng; hỗ trợ chuyển khoản qua payOS hoặc thanh toán khi nhận hàng. Đơn được lưu trong tài khoản để bạn tìm lại."
        : "Heros đang chuẩn bị mở tiếp nhận đơn hàng, với giá 590.000đ/thiết bị. Khi mở bán, bạn sẽ chọn số lượng, điền thông tin nhận hàng và cách thanh toán, đăng nhập hoặc tạo tài khoản, rồi xem lại trước khi xác nhận. Bạn có thể gửi lời nhắn cho Heros nếu cần tìm hiểu thêm.",
    },
    {
      question: "Mình muốn mua Heros làm quà thì sao?",
      answer: "Bạn có thể nhập thông tin người nhận khi đặt hàng. Một chiếc Heros dành cho bản thân hay người bạn thương đều bắt đầu từ sự quan tâm. Liên hệ Heros nếu bạn cần thêm thông tin về việc chuẩn bị quà tặng.",
    },
  ];

  return (
    <div className="v2-conversion">
      <div className="v2-order-wrap v2-conversion-shell">
        <div className="v2-conversion-sectionline">
          <span>CHỌN MỘT CHIẾC HEROS</span>
          <span className="v2-order-availability"><i aria-hidden="true" />{checkoutEnabled ? "Đang tiếp nhận đơn hàng" : "Đang chuẩn bị mở bán"}</span>
        </div>
        <Order enabled={checkoutEnabled} />
      </div>

      <section className="v2-faq v2-conversion-shell" aria-labelledby="v2-faq-title">
        <Reveal className="v2-faq-heading">
          <p className="v2-conversion-eyebrow">HIỂU HEROS THÊM MỘT CHÚT</p>
          <h2 id="v2-faq-title">Bạn hỏi.<br /><span>Heros lắng nghe.</span></h2>
          <p>Những điều bạn muốn biết trước khi chọn một người bạn đồng hành nhỏ.</p>
          <a className="v2-conversion-textlink" href="#lien-he">Còn điều muốn hỏi? <ArrowUpRight size={18} /></a>
        </Reveal>
        <div className="v2-faq-items">
          {faqs.map(({ question, answer }, index) => (
            <details className="v2-faq-item" key={question} open={index === 0}>
              <summary>
                <span className="v2-faq-index">0{index + 1}</span>
                <span>{question}</span>
                <span className="v2-faq-toggle"><Plus size={18} /></span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="v2-contact" id="lien-he" aria-labelledby="v2-contact-title">
        <div className="v2-conversion-shell v2-contact-grid">
          <Reveal className="v2-contact-copy">
            <p className="v2-conversion-eyebrow">CHÚNG TỚ LUÔN LẮNG NGHE</p>
            <h2 id="v2-contact-title">Có điều muốn nói?<br /><span>Nhắn Heros nhé.</span></h2>
            <p>Câu hỏi, ý tưởng hay một điều bạn muốn chia sẻ đều được chào đón. Bắt đầu bằng một lời nhắn nhỏ.</p>
            <div className="v2-contact-topics" aria-label="Những điều bạn có thể chia sẻ">
              <span>Về sản phẩm</span><span>Một ý tưởng</span><span>Một lời chào</span>
            </div>
            <span className="v2-contact-signature" aria-hidden="true">with you.<Heart size={31} weight="light" /></span>
          </Reveal>
          <div className="v2-contact-form-panel"><ContactForm /></div>
        </div>
      </section>

      <section className="v2-app-teaser" id="ung-dung" aria-labelledby="v2-app-title">
        <div className="v2-conversion-shell v2-app-grid">
          <Reveal className="v2-app-copy">
            <p className="v2-conversion-eyebrow">ỨNG DỤNG HEROS</p>
            <h2 id="v2-app-title">Một kết nối nhỏ.<br /><span>Gần nhau hơn.</span></h2>
            <p>Kết nối thiết bị, quản lý danh sách người thân và theo dõi trạng thái an toàn. Những người bạn tin tưởng, trong một ứng dụng.</p>
            <Link className="v2-app-link" href="/download">Khám phá ứng dụng <ArrowUpRight size={22} /></Link>
            <p className="v2-app-release"><span aria-hidden="true" />Đang chuẩn bị phát hành.<br />Link tải chính thức sẽ được cập nhật tại trang ứng dụng.</p>
          </Reveal>
          <AppIllustration />
        </div>
      </section>

      <footer className="v2-footer">
        <div className="v2-conversion-shell">
          <div className="v2-footer-grid">
            <div className="v2-footer-brand">
              <Link href="/v2" aria-label="Heros — Trang chủ">HEROS<span>SAFETY WITH YOU</span></Link>
              <p>Vì bạn xứng đáng<br />được quan tâm.</p>
            </div>
            <nav className="v2-footer-nav" aria-label="Khám phá Heros">
              <p>Khám phá</p>
              <Link href="/ve-chung-toi">Câu chuyện Heros <ArrowUpRight size={15} /></Link>
              <Link href="/san-pham">Thiết bị Heros <ArrowUpRight size={15} /></Link>
              <Link href="/download">Ứng dụng <ArrowUpRight size={15} /></Link>
              <a href="#dat-hang">Đặt Heros <ArrowRight size={15} /></a>
            </nav>
            <nav className="v2-footer-nav" aria-label="Kết nối và thông tin">
              <p>Kết nối</p>
              <a href="#lien-he">Nhắn Heros <ArrowUpRight size={15} /></a>
              <Link href="/tai-khoan">Tài khoản của bạn <ArrowUpRight size={15} /></Link>
              <Link href="/dieu-khoan">Điều khoản & chính sách <ArrowUpRight size={15} /></Link>
            </nav>
          </div>
          <div className="v2-footer-bottom">
            <span>© {new Date().getFullYear()} Heros.</span>
            <span>Cùng bạn, mỗi ngày.</span>
            <a href="#main">Lên đầu trang <ArrowUp size={15} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingConversion;
