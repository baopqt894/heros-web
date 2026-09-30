import Image from "next/image";
import Link from "next/link";
import HerosIcon from "./heros-icon";
import { checkoutEnabled } from "@/lib/payos";
export const dynamic = "force-dynamic";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ContactForm, Order, Reveal } from "./interactive";
import { HerosHero, SosDemo } from "./product-experience";

const faqs = [
  [
    "Heros hoạt động như thế nào?",
    "Bạn kết nối thiết bị với ứng dụng Heros, thiết lập danh sách người thân và kích hoạt SOS khi cần trợ giúp. Phần trải nghiệm trên website không gửi cảnh báo thật.",
  ],
  [
    "Mình có cần kết nối với điện thoại không?",
    "Có. Heros sử dụng ứng dụng trên điện thoại để quản lý thiết bị, người thân và tình trạng an toàn. Yêu cầu tương thích cụ thể cần được xác nhận trước khi mở bán.",
  ],
  [
    "Mình có thể đặt hàng ngay không?",
    "Bạn đăng nhập hoặc tạo tài khoản, điền thông tin nhận hàng và xem lại đơn. Chọn chuyển khoản qua payOS hoặc thanh toán khi nhận hàng. Đơn được lưu trong tài khoản để bạn tìm lại bất cứ lúc nào.",
  ],
  [
    "Mình muốn mua Heros làm quà thì sao?",
    "Bạn có thể nhập thông tin người nhận khi đặt hàng. Liên hệ Heros nếu bạn cần thêm thông tin về việc chuẩn bị quà tặng.",
  ],
] as const;

export default function Home() {
  return (
    <>
      <main id="main">
        <HerosHero />

        <section
          className="heros-features section"
          aria-labelledby="highlights-title"
        >
          <div className="wide-shell">
            <header className="feature-section-heading">
              <div>
                <p className="chapter-label">Một kết nối thật gần</p>
                <h2 id="highlights-title">
                  Khi bạn cần,
                  <br />
                  <span>Heros ở ngay đây.</span>
                </h2>
              </div>
              <p>
                Từ một lời cần giúp đến một vị trí được sẻ chia. Những điều nhỏ
                để bạn và người thân gần nhau hơn.
              </p>
            </header>
            <div className="brand-feature-grid">
              <article className="brand-feature brand-feature-sos">
                <div>
                  <span className="feature-number">01 / SOS</span>
                  <h3>Cần là có.</h3>
                  <p>
                    Gửi tín hiệu đến những người bạn tin tưởng khi cần trợ giúp.
                  </p>
                </div>
                <SosDemo />
              </article>
              <article className="brand-feature">
                <div className="brand-feature-symbol">
                  <HerosIcon name="location" size={82} />
                </div>
                <span className="feature-number">02 / Vị trí</span>
                <h3>Biết bạn ở đâu.</h3>
                <p>
                  Chia sẻ vị trí trong tình huống khẩn cấp để người thân có thể
                  tìm đến.
                </p>
              </article>
              <article className="brand-feature">
                <div className="brand-feature-symbol">
                  <HerosIcon name="audio" size={82} />
                </div>
                <span className="feature-number">03 / Ghi âm trực tiếp</span>
                <h3>Lưu điều quan trọng.</h3>
                <p>
                  Ghi lại âm thanh khi bạn cần chia sẻ thêm thông tin với người
                  hỗ trợ.
                </p>
              </article>
              <article className="brand-feature">
                <div className="brand-feature-symbol">
                  <HerosIcon name="connection" size={82} />
                </div>
                <span className="feature-number">04 / Kết nối</span>
                <h3>Có người ở bên.</h3>
                <p>
                  Giữ những người thân quen trong danh sách liên hệ khẩn cấp của
                  bạn.
                </p>
              </article>
            </div>
            <div className="features-bottom">
              <p>
                Khả năng hoạt động phụ thuộc vào kết nối, ứng dụng và cấu hình
                thiết bị.
              </p>
              <Link href="/san-pham">
                Tìm hiểu cách sử dụng <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        <section id="cau-chuyen" className="manifesto section">
          <Reveal className="story-shell">
            <p className="chapter-label">Câu chuyện của chúng tớ</p>
            <h2>Về đến nhà nhắn tớ nhé</h2>
            <p className="manifesto-body">
              Từ một câu nói quen thuộc, Heros biến sự quan tâm thành một kết
              nối luôn ở bên bạn. Chúng tớ tin rằng cảm giác an tâm không nên
              giữ bạn ở nhà. Nó nên cùng bạn đi học, đi làm, dạo phố và khám phá
              những điều mới.
            </p>
          </Reveal>
        </section>

        <section className="lifestyle section" id="theo-cach-cua-ban">
          <div className="wide-shell">
            <Reveal className="lifestyle-heading">
              <div>
                <p className="chapter-label">Theo cách của bạn</p>
                <h2>Bên bạn, trong những điều bình thường nhất</h2>
              </div>
              <p>
                Một chiếc túi quen. Một buổi học mới. Hay một ngày chỉ dành cho
                mình.
              </p>
            </Reveal>
            <div className="lifestyle-grid">
              {[
                {
                  file: "bag",
                  label: "01 / DẠO PHỐ",
                  title: "Cùng chiếc túi bạn yêu.",
                  copy: "Móc nhẹ vào quai túi. Sẵn sàng cho một ngày ngoài phố.",
                  alt: "Người mẫu mang Heros màu hồng gắn trên túi xách màu kem",
                },
                {
                  file: "backpack",
                  label: "02 / ĐI HỌC",
                  title: "Thêm an tâm vào hành trang.",
                  copy: "Gắn trên quai ba lô, gần bên bạn trong mỗi chặng đường.",
                  alt: "Người mẫu đeo ba lô với thiết bị Heros gắn trên quai",
                },
                {
                  file: "necklace",
                  label: "03 / MỖI NGÀY",
                  title: "Nhỏ xinh. Ngay bên mình.",
                  copy: "Phối cùng dây đeo cổ để Heros luôn trong tầm tay.",
                  alt: "Người mẫu mặc áo trắng đeo Heros trước ngực bằng dây hồng",
                },
              ].map((item) => (
                <Reveal key={item.file} className="lifestyle-item">
                  <figure>
                    <div className="lifestyle-photo">
                      <Image
                        src={`/images/heros-lifestyle-${item.file}.png`}
                        alt={item.alt}
                        width={1122}
                        height={1402}
                        sizes="(max-width: 767px) 100vw, 33vw"
                      />
                    </div>
                    <figcaption>
                      <span>{item.label}</span>
                      <h3>{item.title}</h3>
                      <p>{item.copy}</p>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
            <p className="lifestyle-note">
              Hình ảnh phối đeo minh họa được tạo bằng AI.
            </p>
          </div>
        </section>

        <section className="care-statement section">
          <div className="story-shell">
            <HerosIcon name="care" size={50} />
            <h2>
              Một món nhỏ bên mình.
              <br />
              <span>Một sự an tâm thật lớn.</span>
            </h2>
          </div>
        </section>

        <Order enabled={checkoutEnabled()} />

        <section className="faq section wide-shell">
          <div className="chapter-heading faq-heading">
            <p>Hỏi gì? Đáp nấy.</p>
            <h2>Hiểu Heros thêm một chút.</h2>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span className="faq-plus">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="lien-he" className="contact section">
          <div className="wide-shell contact-grid">
            <div>
              <p className="chapter-label">Chúng tớ luôn lắng nghe</p>
              <h2>
                Có điều muốn nói?
                <br />
                <span>Nhắn Heros nhé.</span>
              </h2>
              <p>
                Câu hỏi, ý tưởng hay một điều bạn muốn chia sẻ đều được chào
                đón.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
    </>
  );
}
