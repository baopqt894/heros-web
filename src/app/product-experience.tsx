"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Check } from "@phosphor-icons/react";
import HerosIcon from "./heros-icon";
import Heros3D from "./heros-3d";

export function HerosHero() {
  return (
    <section
      className="product-story"
      aria-labelledby="hero-title"
      id="heros-3d"
    >
      <div className="product-story-grid wide-shell">
        <div className="product-story-copy">
          <div className="product-intro">
            <p className="chapter-label">HEROS · SAFETY WITH YOU</p>
            <h1 id="hero-title">
              Vì bạn xứng đáng
              <br />
              <span>được quan tâm</span>
            </h1>
            <p className="product-intro-lead">
              Một người bạn nhỏ, một kết nối thật gần. Heros cùng bạn tự tin đi
              học, đi làm và khám phá những điều mới.
            </p>
            <div className="hero-actions">
              <a className="button" href="#dat-hang">
                Đặt Heros <ArrowRight size={17} />
              </a>
              <a className="text-link" href="#cau-chuyen">
                Câu chuyện của chúng tớ
              </a>
            </div>
            <a className="scroll-invitation" href="#san-pham">
              <ArrowDown size={18} /> Cuộn để khám phá Heros
            </a>
          </div>
          <div className="product-detail-copy" id="san-pham">
            <p className="chapter-label">NHỎ GỌN. LUÔN ĐỒNG HÀNH.</p>
            <h2>
              Vừa trong tay.
              <br />
              <span>Gần bên bạn.</span>
            </h2>
            <p>
              Thân bo mềm, một nút chạm và sắc hồng của riêng bạn. Nhẹ nhàng
              hiện diện trong những điều thường ngày.
            </p>
            <dl className="product-measures">
              <div>
                <dt>
                  62<span> mm</span>
                </dt>
                <dd>Gọn trong lòng bàn tay</dd>
              </div>
              <div>
                <dt>
                  360<span>°</span>
                </dt>
                <dd>Kéo để khám phá thiết bị</dd>
              </div>
            </dl>
            <a className="text-link" href="#highlights-title">
              Khám phá kết nối <ArrowRight size={17} />
            </a>
          </div>
        </div>
        <div className="product-sticky-stage">
          <Heros3D hero />
          <div className="product-stage-caption">
            <span>HEROS / HỒNG PHẤN</span>
            <span>38 × 62 × 16 mm</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SosDemo() {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function preview() {
    if (timer.current) clearTimeout(timer.current);
    setActive(true);
    timer.current = setTimeout(() => setActive(false), 3500);
  }
  return (
    <div className={`sos-demo ${active ? "is-active" : ""}`}>
      <div className="sos-ripples" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <button
        className="sos-demo-button"
        onClick={preview}
        aria-label="Xem mô phỏng cảnh báo SOS"
      >
        {active ? (
          <Check size={34} weight="bold" />
        ) : (
          <>
            <HerosIcon name="sos" size={64} />
            <strong>SOS</strong>
          </>
        )}
      </button>
      <p aria-live="polite">
        {active
          ? "Mô phỏng: lời cần giúp được gửi tới người thân."
          : "Chạm để xem cách Heros kết nối."}
      </p>
      <span className="sos-demo-note">
        Trải nghiệm minh họa · Không gửi cảnh báo thật
      </span>
    </div>
  );
}
