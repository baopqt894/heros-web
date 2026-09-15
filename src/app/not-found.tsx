import Link from "next/link";

export default function NotFound() {
  return (
    <main className="system-page">
      <div className="system-card">
        <p className="eyebrow">404 / NOT FOUND</p>
        <h1>Không tìm thấy trang.</h1>
        <p>Đường dẫn có thể đã thay đổi hoặc chưa từng tồn tại.</p>
        <Link href="/">Về trang chủ</Link>
      </div>
    </main>
  );
}
