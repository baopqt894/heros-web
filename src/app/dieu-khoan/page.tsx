import Link from "next/link";
import content from "./content.json";
import "./policies.css";

export const metadata = {
  title: "Điều khoản & chính sách | Heros",
  description: "Chính sách giao hàng, bảo hành, đổi trả, bảo mật dữ liệu và điều khoản sử dụng thiết bị, ứng dụng HEROS.",
};

function PolicyText({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part,
  );
}

export default function PoliciesPage() {
  return (
    <main id="main" className="policies-page">
      <section className="policy-hero wide-shell" aria-labelledby="policy-title">
        <p className="chapter-label">Minh bạch để an tâm</p>
        <h1 id="policy-title">Điều khoản <span>& chính sách.</span></h1>
        <p>Những điều bạn cần biết khi lựa chọn và đồng hành cùng Heros.</p>
      </section>
      <div className="policies-layout">
        <details className="policy-contents">
          <summary><span>Mục lục</span><span className="policy-contents-hint">{content.sections.length} mục <span className="policy-contents-toggle" aria-hidden="true">+</span></span></summary>
          <nav aria-label="Mục lục điều khoản">
            <ol>
              {content.sections.map(section => <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>)}
            </ol>
          </nav>
        </details>
        <article className="policy-document" aria-label="Chính sách và Điều khoản sử dụng HEROS">
          <p className="policy-publication-note">Ngày có hiệu lực và phiên bản sẽ được HEROS cập nhật.</p>
          <p className="policy-introduction">{content.intro}</p>
          {content.sections.map(section => <section key={section.id} id={section.id} className="policy-section" aria-labelledby={`${section.id}-title`}>
            <h2 id={`${section.id}-title`}>{section.title}</h2>
            {section.blocks.map((block, index) => {
              if (block.type === "list" && "items" in block) {
                return <ul key={index}>{block.items?.map((item, itemIndex) => <li key={itemIndex}><PolicyText text={item} /></li>)}</ul>;
              }
              const text = "text" in block ? block.text ?? "" : "";
              if (block.type === "heading") return <h3 key={index}><PolicyText text={text} /></h3>;
              if (block.type === "quote") return <blockquote key={index}><PolicyText text={text} /></blockquote>;
              return <p key={index}><PolicyText text={text} /></p>;
            })}
            {section.id === "muc-10" && <Link href="/lien-he" className="button">Liên hệ Heros</Link>}
            {section.id === "xac-nhan" && <p className="policy-context-note">Nội dung xác nhận dành cho ứng dụng HEROS.</p>}
          </section>)}
          <div className="policy-document-footer">
            <Link href="/lien-he">Cần giải đáp? Liên hệ Heros →</Link>
            <a href="#policy-title">Về đầu trang ↑</a>
          </div>
        </article>
      </div>
    </main>
  );
}
