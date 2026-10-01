"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowUpRight, BellRinging, MapPin, Microphone, UsersThree } from "@phosphor-icons/react";
import ConnectionVisual from "./connection-visual";
import "./connections.css";

const features = [
  { icon: BellRinging, label: "SOS", title: "Một chạm. Có nhau.", copy: "Gửi tín hiệu SOS đến những người bạn tin tưởng khi cần trợ giúp.", headline: "Lời cần giúp được gửi đi.", caption: "Từ thiết bị bên bạn đến những người có thể hỗ trợ." },
  { icon: MapPin, label: "Định vị", title: "Biết bạn ở đâu.", copy: "Chia sẻ vị trí trong tình huống khẩn cấp để người thân có thể tìm đến.", headline: "Một vị trí. Gần nhau hơn.", caption: "Người thân biết nơi bạn cần hỗ trợ, để có thể tìm đến bạn." },
  { icon: Microphone, label: "Ghi âm", title: "Lưu điều quan trọng.", copy: "Ghi lại âm thanh để chia sẻ thêm thông tin với người đang hỗ trợ bạn.", headline: "Thêm thông tin để giúp bạn.", caption: "Âm thanh được lưu lại giúp người thân hiểu tình huống bạn đang gặp." },
  { icon: UsersThree, label: "Người thân", title: "Vòng tròn tin cậy.", copy: "Kết nối với người thân, bạn bè và những người bạn tin tưởng.", headline: "Những người bạn chọn ở bên.", caption: "Thiết lập danh sách liên hệ trong ứng dụng Heros để sẵn sàng kết nối." },
] as const;

const cycleDuration = 3500;

export default function Connections({ paused = false }: { paused?: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(stage, { amount: 0.35 });
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<0 | 1 | 2 | 3>(0);
  const [pageVisible, setPageVisible] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const elapsed = useRef(0);
  const progress = useMotionValue(0);
  const still = paused || Boolean(reduced);
  const running = inView && pageVisible && !still;
  const active = features[selected];

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!running) return;
    let frame: number;
    let previous: number | null = null;
    function tick(now: number) {
      if (previous !== null) elapsed.current += Math.min(now - previous, 100);
      previous = now;
      if (elapsed.current >= cycleDuration) {
        elapsed.current = 0;
        setSelected(value => ((value + 1) % features.length) as 0 | 1 | 2 | 3);
      }
      progress.set(elapsed.current / cycleDuration);
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, progress]);

  function resetProgress() {
    elapsed.current = 0;
    progress.set(0);
  }

  function select(index: number) {
    setSelected(index as 0 | 1 | 2 | 3);
    setReplayKey(value => value + 1);
    resetProgress();
  }

  return <section className="heros-connections" id="ket-noi" aria-labelledby="highlights-title">
    <div className="heros-section-heading">
      <div><p className="heros-eyebrow">02 / KẾT NỐI LÀ MỘT CÁCH QUAN TÂM</p><h2 id="highlights-title">Khi bạn cần,<br /><em>Heros kết nối.</em></h2></div>
      <div className="heros-heading-aside"><p>Từ một tín hiệu SOS đến vị trí được sẻ chia.<br />Khám phá cách Heros kết nối bạn với người thân.</p></div>
    </div>
    <div ref={stage} className="heros-connect-experience">
      <div className="heros-connect-grid">
        <div className="heros-connect-tabs" role="tablist" aria-label="Khám phá tính năng Heros" aria-orientation="horizontal">
          {features.map((feature, index) => <button ref={element => { tabs.current[index] = element; }} type="button" role="tab" id={`heros-feature-${index}`} aria-controls="heros-feature-panel" aria-selected={selected === index} aria-label={`Khám phá ${feature.label}`} tabIndex={selected === index ? 0 : -1} key={feature.label}
            onClick={() => select(index)} onKeyDown={event => {
              const next = event.key === "ArrowDown" || event.key === "ArrowRight" ? (index + 1) % features.length : event.key === "ArrowUp" || event.key === "ArrowLeft" ? (index + features.length - 1) % features.length : event.key === "Home" ? 0 : event.key === "End" ? features.length - 1 : -1;
              if (next >= 0) { event.preventDefault(); select(next); tabs.current[next]?.focus(); }
            }} className={`heros-connect-tab ${selected === index ? "is-selected" : ""}`}>
            <span className="heros-connect-icon"><feature.icon size={26} weight="light" /></span>
            <span className="heros-connect-tab-copy"><span className="heros-connect-label">0{index + 1} / {feature.label}</span><strong>{feature.title}</strong></span>
            <span className="heros-connect-tab-progress" aria-hidden="true"><motion.i style={{ scaleX: index === selected ? (still ? 1 : progress) : 0 }} /></span>
          </button>)}
        </div>
        <div className="heros-connect-panel" role="tabpanel" id="heros-feature-panel" aria-labelledby={`heros-feature-${selected}`} tabIndex={0}>
          <div className="heros-connect-panel-top"><span><i /> HEROS CONNECT</span><span className="heros-connect-scene-label">{active.label}<b>0{selected + 1} / 04</b></span></div>
          <div className="heros-connect-visual-stage">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div className="heros-connect-visual" key={selected} initial={still ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: still ? 0 : -10 }} transition={{ duration: still ? 0 : 0.3 }}>
                <ConnectionVisual feature={selected} playing={inView && pageVisible && !still} replayKey={replayKey} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="heros-connect-caption"><span className="heros-connect-caption-kicker">{active.label} / CÙNG HEROS</span><h3>{active.headline}</h3><p>{active.copy}</p><Link href="/san-pham">Tìm hiểu thêm <ArrowUpRight size={16} /></Link></div>
        </div>
      </div>
    </div>
    <div className="heros-features-foot"><span>Minh họa cách hoạt động · Không gửi cảnh báo thật.</span><Link href="/san-pham">Cách sử dụng Heros <ArrowUpRight size={16} /></Link></div>
  </section>;
}
