import Image from "next/image";
import Connections from "./connections/connections";
import HerosIcon from "./heros-icon";
import { checkoutEnabled } from "@/lib/payos";
export const dynamic = "force-dynamic";
import { ContactForm, Order, Reveal } from "./interactive";
import { HerosHero } from "./product-experience";

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
    "Bạn chọn số lượng, điền thông tin nhận hàng và chọn cách thanh toán trước. Khi bấm tiếp tục mua hàng, bạn đăng nhập hoặc tạo tài khoản, xem lại rồi xác nhận đơn. Đơn được lưu trong tài khoản để bạn tìm lại bất cứ lúc nào.",
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

        <Connections />

        <section id="cau-chuyen" className="manifesto section" aria-labelledby="story-title">
          <Reveal className="story-shell">
            <div className="story-copy">
              <p className="chapter-label">Câu chuyện của chúng tớ</p>
              <h2 id="story-title">Về đến nhà<br />nhắn tớ nhé<span>.</span></h2>
              <p className="manifesto-body">
                Từ một câu nói quen thuộc, Heros biến sự quan tâm thành một kết
                nối luôn ở bên bạn. Chúng tớ tin rằng cảm giác an tâm không nên
                giữ bạn ở nhà. Nó nên cùng bạn đi học, đi làm, dạo phố và khám phá
                những điều mới.
              </p>
            </div>
            <div className="story-artwork">
              <Image
                src="/images/heros-homecoming.webp"
                unoptimized
                loading="eager"
                alt="Cô gái vừa về đến cửa nhà, đeo túi và nhắn tin cho người thân."
                width={800}
                height={800}
                sizes="(max-width: 760px) 280px, 400px"
              />
            </div>
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
