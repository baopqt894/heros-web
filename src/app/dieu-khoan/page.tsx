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
      <section className="page-intro wide-shell" aria-labelledby="policy-title">
        <p className="chapter-label">Minh bạch để an tâm</p>
        <h1 id="policy-title">Điều khoản<br /><span>& chính sách.</span></h1>
        <p>Chính sách và Điều khoản sử dụng HEROS</p>
        <p className="policy-publication-note">Ngày có hiệu lực và phiên bản sẽ được HEROS cập nhật.</p>
      </section>
      <div className="wide-shell policies-layout">
        <aside className="policy-sidebar">
          <nav aria-label="Mục lục điều khoản">
            <p className="policy-toc-label">Trong trang này</p>
            <ol>
              {content.sections.map(section => <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>)}
            </ol>
          </nav>
          <Link className="policy-help-link" href="/lien-he">Cần giải đáp? Liên hệ Heros →</Link>
        </aside>
        <article className="policy-document" aria-label="Chính sách và Điều khoản sử dụng HEROS">
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
          <a className="policy-back-top" href="#policy-title">Về đầu trang ↑</a>
        </article>
      </div>
    </main>
  );
}
