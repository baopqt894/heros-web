"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="system-page">
      <div className="system-card">
        <p className="eyebrow">500 / ERROR</p>
        <h1>Đã có lỗi xảy ra.</h1>
        <p>Vui lòng thử lại. Nếu lỗi vẫn còn, hãy kiểm tra log phía máy chủ.</p>
        <button type="button" onClick={reset}>
          Thử lại
        </button>
      </div>
    </main>
  );
}
