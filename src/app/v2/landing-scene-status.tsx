"use client";

import "./landing-scene-status.css";

export function LandingSceneLoading() {
  return <div className="v2-scene-status" role="status" aria-live="polite" aria-atomic="true">
    <span className="v2-scene-status-spinner" aria-hidden="true" />
    <p>Đang tải mô hình 3D…</p>
  </div>;
}

export function LandingSceneError({ onRetry }: { onRetry: () => void }) {
  return <div className="v2-scene-status v2-scene-status-error" role="alert">
    <p>Chưa thể hiển thị mô hình 3D.</p>
    <button type="button" onClick={onRetry}>Thử lại</button>
  </div>;
}
