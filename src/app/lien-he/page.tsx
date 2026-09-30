import { ContactForm } from "../interactive";
import { DownloadButtons } from "../site-chrome";
export const metadata = { title: "Liên hệ | Heros" };
export default function ContactPage() {
  const email = process.env.HEROS_CONTACT_EMAIL;
  return (
    <main id="main">
      <section className="page-intro wide-shell">
        <p className="chapter-label">Chúng tớ luôn lắng nghe</p>
        <h1>
          Một lời nhắn,
          <br />
          <span>thêm một kết nối.</span>
        </h1>
        <p>
          Câu hỏi, góp ý hay một điều bạn muốn chia sẻ — Heros ở đây để lắng
          nghe.
        </p>
      </section>
      <section className="contact-page wide-shell">
        <aside>
          <h2>Liên hệ với chúng tớ</h2>
          <p>
            Để lại thông tin và lời nhắn trong biểu mẫu. Chúng tớ sẽ ghi nhận
            những điều bạn chia sẻ.
          </p>
          {email && (
            <a className="text-link" href={`mailto:${email}`}>
              {email}
            </a>
          )}
          <h3>Ứng dụng Heros</h3>
          <DownloadButtons />
        </aside>
        <div>
          <h2>Gửi lời nhắn cho Heros</h2>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
