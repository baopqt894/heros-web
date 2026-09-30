import Image from "next/image";
import Link from "next/link";
import HerosIcon from "../heros-icon";
import { teamMembers } from "@/content/team";
export const metadata = { title: "Về chúng tôi | Heros" };
const values = [
  [
    "safety",
    "Safety",
    "An toàn là trọng tâm",
    "Đặt sự an toàn của người dùng làm trọng tâm trong quá trình thiết kế và phát triển sản phẩm.",
  ],
  [
    "connection",
    "Connection",
    "Kết nối để gần nhau hơn",
    "Kết nối người dùng với người thân, người đáng tin cậy và cộng đồng HEROS nhằm mở rộng khả năng tiếp nhận và phản hồi tín hiệu cầu cứu.",
  ],
  [
    "innovation",
    "Innovation",
    "Công nghệ từ sự thấu hiểu",
    "Kết hợp SOS, GPS, ứng dụng di động và ghi âm trong cùng một hệ thống thay vì cung cấp các chức năng riêng lẻ.",
  ],
  [
    "touch",
    "Accessibility",
    "Dễ dùng, luôn bên bạn",
    "Thiết kế sản phẩm nhỏ gọn, dễ mang theo và đơn giản hóa thao tác để người dùng có thể nhanh chóng kích hoạt tín hiệu cầu cứu khi cần thiết.",
  ],
  [
    "care",
    "Community",
    "Một cộng đồng đồng hành",
    "Xây dựng cộng đồng người dùng có khả năng kết nối và hỗ trợ lẫn nhau, góp phần rút ngắn khoảng cách giữa người cần giúp đỡ và những người có khả năng hỗ trợ.",
  ],
] as const;
export default function AboutPage() {
  return (
    <main id="main" className="about-page">
      <section className="about-intro wide-shell">
        <div className="about-intro-copy">
          <p className="chapter-label">Chào bạn, chúng tớ là Heros</p>
          <h1>
            Sự quan tâm,
            <br />
            <span>có thể mang theo.</span>
          </h1>
          <p>
            Một người bạn nhỏ, được tạo nên từ mong muốn mỗi hành trình của bạn
            đều có sự đồng hành.
          </p>
          <a className="about-team-link" href="#doi-ngu">
            Gặp những người tạo nên Heros <span>↗</span>
          </a>
          <div className="about-signature">
            <HerosIcon name="care" size={34} />
            <span>Vì bạn xứng đáng được quan tâm.</span>
          </div>
        </div>
        <figure className="about-intro-visual">
          <Image
            src="/images/heros-lifestyle-necklace.png"
            alt="Heros được mang bên mình trong những điều thường ngày"
            width={1122}
            height={1402}
            priority
            sizes="(max-width: 700px) 100vw, 45vw"
          />
          <figcaption>
            Gần bên bạn.
            <br />
            <span>Trong những điều bình thường nhất.</span>
          </figcaption>
        </figure>
      </section>
      <nav className="about-index wide-shell" aria-label="Nội dung về Heros">
        <a href="#su-menh">
          <span>01</span>Sứ mệnh
        </a>
        <a href="#gia-tri">
          <span>02</span>Giá trị cốt lõi
        </a>
        <a href="#doi-ngu">
          <span>03</span>Đội ngũ phát triển
        </a>
      </nav>
      <section className="about-mission wide-shell" id="su-menh">
        <div className="about-section-label">
          <span>01</span>
          <p>Sứ mệnh</p>
        </div>
        <div className="about-mission-content">
          <HerosIcon name="care" size={54} />
          <h2>
            Đẹp hơn cả tình yêu,
            <br />
            <span>đó là sự Đồng Hành</span>
          </h2>
          <p className="mission-opening">
            HEROS được tạo ra từ một mong muốn rất giản dị: Mong mọi hành trình
            đều dịu dàng với bạn.
          </p>
          <div className="mission-paragraphs">
            <p>
              Chúng tôi hiểu rằng sẽ có những đoạn đường bạn phải đi một mình,
              những khoảnh khắc bất an chẳng biết gọi tên ai, và những lúc một
              lời cầu cứu cần được nghe thấy ngay khi nó cất lên.
            </p>
            <p>
              Vì thế, HEROS mong muốn tạo nên một điểm tựa luôn ở bên bạn. Bởi
              phụ nữ xứng đáng được tự do đi đến nơi mình muốn, sống cuộc đời
              mình lựa chọn, mà không phải đánh đổi sự tự do ấy bằng nỗi sợ.
            </p>
          </div>
        </div>
      </section>
      <section className="about-values" id="gia-tri">
        <div className="wide-shell">
          <div className="about-values-header">
            <div className="about-section-label">
              <span>02</span>
              <p>Giá trị cốt lõi</p>
            </div>
            <h2>
              Những điều chúng tớ tin.
              <br />
              <span>Và đặt vào từng chi tiết.</span>
            </h2>
          </div>
          <div className="about-values-list">
            {values.map(([icon, label, title, copy], index) => (
              <article key={label}>
                <span className="value-number">0{index + 1}</span>
                <HerosIcon name={icon} size={56} />
                <div>
                  <small>{label}</small>
                  <h3>{title}</h3>
                </div>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="about-team wide-shell" id="doi-ngu">
        <div className="about-team-heading">
          <div>
            <div className="about-section-label">
              <span>03</span>
              <p>Đội ngũ phát triển</p>
            </div>
            <h2>
              Những con người,
              <br />
              <span>cùng một sự quan tâm.</span>
            </h2>
          </div>
          <p>
            Sáu thành viên cùng tạo nên Heros. Chúng tớ tin rằng một sản phẩm
            gần gũi bắt đầu từ việc quan tâm đến những điều rất nhỏ.
          </p>
        </div>
        <div className="heros-team-grid">
          {teamMembers.map((member, index) => (
            <article
              key={member.name}
              className={`team-member team-tone-${index % 3}`}
            >
              <div
                className="team-portrait"
                aria-label={`Chân dung chữ cái của ${member.name}`}
              >
                <svg viewBox="0 0 260 240" aria-hidden="true">
                  <path d="M-20 170C70 170 72 30 160 30s50 100 125 100M-20 190C88 190 95 48 165 48s43 100 120 100M-20 210C100 210 115 66 170 66s35 100 115 100" />
                </svg>
                <span>{member.initials}</span>
                <HerosIcon
                  name={index % 2 === 0 ? "care" : "safety"}
                  size={30}
                />
              </div>
              <div className="team-member-caption">
                <h3>{member.name}</h3>
                <span>HEROS</span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="about-closing wide-shell">
        <HerosIcon name="connection" size={58} />
        <div>
          <h2>Một ý tưởng, hay một lời nhắn?</h2>
          <p>Chúng tớ luôn muốn được lắng nghe bạn.</p>
        </div>
        <Link className="button" href="/lien-he">
          Trò chuyện với Heros <span>↗</span>
        </Link>
      </section>
    </main>
  );
}
