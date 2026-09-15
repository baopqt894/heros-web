import Image from "next/image";
import "./product-experience.css";
import {
  ArrowRight,
  ArrowUpRight,
  BellRinging,
  Heart,
  MapPin,
  Microphone,
  Sparkle,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import {
  ContactForm,
  Navigation,
  Order,
  Reveal,
} from "./interactive";
import { HerosHero, SosDemo } from "./product-experience";

const highlights = [
  {
    className: "highlight-card highlight-sos",
    kicker: "SOS",
    title: "Cần là có.",
    copy: "Nhấn giữ 2 giây để gửi lời cần giúp.",
    image: true,
  },
  {
    className: "highlight-card highlight-location",
    kicker: "VỊ TRÍ",
    title: "Gần nhau hơn.",
    copy: "Chia sẻ vị trí để người thân biết bạn đang ở đâu.",
    image: false,
  },
  {
    className: "highlight-card highlight-proof",
    kicker: "GHI ÂM",
    title: "Lưu điều quan trọng.",
    copy: "Ghi lại thông tin trong tình huống khẩn cấp.",
    image: false,
  },
] as const;

const features = [
  {
    icon: BellRinging,
    title: "Cảnh báo SOS",
    copy: "Nhấn giữ 2 giây để gửi cảnh báo đến những người bạn tin tưởng.",
  },
  {
    icon: MapPin,
    title: "Chia sẻ vị trí",
    copy: "Giúp người thân biết bạn đang ở đâu khi cần tìm đến.",
  },
  {
    icon: Microphone,
    title: "Ghi âm bằng chứng",
    copy: "Lưu lại âm thanh và thông tin quan trọng trong tình huống khẩn cấp.",
  },
  {
    icon: UsersThree,
    title: "Kết nối người thân",
    copy: "Quản lý những người luôn sẵn sàng ở bên bạn qua ứng dụng Heros.",
  },
] as const;

const faqs = [
  [
    "Heros hoạt động như thế nào?",
    "Theo thiết kế minh họa, bạn kết nối thiết bị với ứng dụng Heros, thiết lập người thân và nhấn giữ nút SOS 2 giây khi cần trợ giúp. Website này không kích hoạt SOS thật.",
  ],
  [
    "Mình có cần kết nối với điện thoại không?",
    "Có. Heros sử dụng ứng dụng trên điện thoại để quản lý thiết bị, người thân và tình trạng an toàn. Yêu cầu tương thích cụ thể cần được xác nhận trước khi mở bán.",
  ],
  [
    "Mình có thể đặt hàng ngay không?",
    "Bạn có thể trải nghiệm toàn bộ các bước đặt hàng. Giá, giao hàng và thanh toán hiện là minh họa; đơn chưa được gửi đi và không thu tiền thật.",
  ],
  [
    "Mình muốn mua Heros làm quà thì sao?",
    "Bạn có thể nhập thông tin người nhận để thử quy trình. Chính sách gói quà và giao hàng sẽ được cập nhật khi Heros mở bán chính thức.",
  ],
] as const;

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">Đến nội dung chính</a>
      <div className="announcement">
        <span>Phiên bản V2 · Trải nghiệm 3D <a href="/v1">Xem bản V1</a></span>
      </div>
      <Navigation />

      <main id="main">
        <HerosHero />

        <section className="highlights section" aria-labelledby="highlights-title">
          <div className="wide-shell highlights-heading">
            <h2 id="highlights-title">Những điều nổi bật.</h2>
            <a href="#san-pham" className="circle-link" aria-label="Khám phá tính năng"><ArrowRight size={26} /></a>
          </div>
          <div className="highlight-track wide-shell">
            {highlights.map((item) => (
              <article className={item.className} key={item.title}>
                <div className="highlight-copy"><span>{item.kicker}</span><h3>{item.title}</h3><p>{item.copy}</p></div>
                {item.image ? (
                  <SosDemo />
                ) : item.kicker === "VỊ TRÍ" ? (
                  <div className="location-visual" aria-hidden="true"><span className="location-ring ring-one" /><span className="location-ring ring-two" /><span className="location-ring ring-three" /><MapPin size={66} weight="fill" /></div>
                ) : (
                  <div className="sound-visual" aria-hidden="true">{[38, 78, 120, 68, 102, 48, 86].map((height, index) => <span key={index} style={{ height }} />)}<Microphone size={56} weight="fill" /></div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section id="cau-chuyen" className="manifesto section">
          <Reveal className="story-shell">
            <p className="chapter-label">Câu chuyện của chúng tớ</p>
            <h2>“Về đến nhà nhắn tớ nhé.” <span>Từ một câu nói quen thuộc, Heros biến sự quan tâm thành một kết nối luôn ở bên bạn.</span></h2>
            <p className="manifesto-body">Chúng tớ tin rằng cảm giác an tâm không nên giữ bạn ở nhà. Nó nên cùng bạn đi học, đi làm, dạo phố và khám phá những điều mới.</p>
          </Reveal>
        </section>

        <section className="features-chapter section">
          <div className="wide-shell">
            <Reveal><div className="chapter-heading feature-heading"><p>Kết nối</p><h2>Một chạm.<br />Yên tâm trong tầm tay.</h2></div></Reveal>
            <div className="feature-grid-new">
              {features.map(({ icon: Icon, title, copy }, index) => (
                <Reveal className={`feature-card feature-card-${index + 1}`} key={title}><article><Icon size={42} weight="light" /><h3>{title}.</h3><p>{copy}</p></article></Reveal>
              ))}
            </div>
            <p className="feature-disclaimer">Tính năng mô tả theo tài liệu minh họa. Khả năng hoạt động phụ thuộc vào thiết bị, ứng dụng, kết nối và cấu hình thực tế.</p>
          </div>
        </section>

        <section className="lifestyle section" id="theo-cach-cua-ban">
          <div className="wide-shell">
            <Reveal className="lifestyle-heading"><div><p className="chapter-label">Theo cách của bạn</p><h2>Đi đâu cũng được.<br /><span>Có Heros đi cùng.</span></h2></div><p>Một chiếc túi quen. Một buổi học mới. Hay một ngày chỉ dành cho mình.</p></Reveal>
            <div className="lifestyle-grid">
              {[
                {file: "bag", label: "01 / DẠO PHỐ", title: "Cùng chiếc túi bạn yêu.", copy: "Móc nhẹ vào quai túi. Sẵn sàng cho một ngày ngoài phố.", alt: "Người mẫu mang Heros màu hồng gắn trên túi xách màu kem"},
                {file: "backpack", label: "02 / ĐI HỌC", title: "Thêm an tâm vào hành trang.", copy: "Gắn trên quai ba lô, gần bên bạn trong mỗi chặng đường.", alt: "Người mẫu đeo ba lô với thiết bị Heros gắn trên quai"},
                {file: "necklace", label: "03 / MỖI NGÀY", title: "Nhỏ xinh. Ngay bên mình.", copy: "Phối cùng dây đeo cổ để Heros luôn trong tầm tay.", alt: "Người mẫu mặc áo trắng đeo Heros trước ngực bằng dây hồng"},
              ].map(item => <Reveal key={item.file} className="lifestyle-item"><figure><div className="lifestyle-photo"><Image src={`/images/heros-lifestyle-${item.file}.png`} alt={item.alt} width={1122} height={1402} sizes="(max-width: 767px) 100vw, 33vw" /></div><figcaption><span>{item.label}</span><h3>{item.title}</h3><p>{item.copy}</p></figcaption></figure></Reveal>)}
            </div>
            <p className="lifestyle-note">Hình ảnh phối đeo minh họa được tạo bằng AI.</p>
          </div>
        </section>

        <section className="care-statement section"><div className="story-shell"><Heart size={54} weight="fill" /><h2>Một món nhỏ bên mình.<br /><span>Một sự an tâm thật lớn.</span></h2></div></section>

        <Order />

        <section className="faq section wide-shell">
          <div className="chapter-heading faq-heading"><p>Hỏi gì? Đáp nấy.</p><h2>Hiểu Heros thêm một chút.</h2></div>
          <div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span className="faq-plus">+</span></summary><p>{answer}</p></details>)}</div>
        </section>

        <section id="lien-he" className="contact section">
          <div className="wide-shell contact-grid"><div><p className="chapter-label">Chúng tớ luôn lắng nghe</p><h2>Có điều muốn nói?<br /><span>Nhắn Heros nhé.</span></h2><p>Câu hỏi, ý tưởng hay một điều bạn muốn chia sẻ đều được chào đón.</p></div><ContactForm /></div>
        </section>
      </main>

      <footer className="footer wide-shell">
        <div className="footer-top"><a className="footer-wordmark" href="#">HEROS<span>SAFETY WITH YOU</span></a><p>Một người bạn nhỏ.<br />Đồng hành cùng bạn, mỗi ngày.</p><a className="back-top" href="#">Về đầu trang <ArrowUpRight size={20} /></a></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Heros.</span><span>Website trải nghiệm • Chưa mở bán chính thức</span><Sparkle size={16} /></div>
      </footer>
    </>
  );
}
