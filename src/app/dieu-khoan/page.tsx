import Link from "next/link";
export const metadata = { title: "Điều khoản & chính sách | Heros" };
export default function PoliciesPage() {
  return (
    <main id="main">
      <section className="page-intro wide-shell">
        <p className="chapter-label">Minh bạch để an tâm</p>
        <h1>
          Điều khoản
          <br />
          <span>& chính sách.</span>
        </h1>
        <p>Nội dung chính thức đang được Heros hoàn thiện.</p>
      </section>
      <section className="wide-shell policy-pending">
        <h2>Chúng tớ sẽ cập nhật tại đây.</h2>
        <p>
          Điều khoản sử dụng, chính sách bảo mật, giao hàng, đổi trả và bảo hành
          sẽ được công bố khi hoàn tất. Trang này chưa phải bộ điều khoản hoặc
          cam kết chính sách chính thức.
        </p>
        <Link href="/lien-he" className="button">
          Liên hệ Heros
        </Link>
      </section>
    </main>
  );
}
