"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowClockwise, ArrowRight, ArrowUpRight, BellRinging, Check, CursorClick, MapPin, Microphone, Pause, Play, UsersThree } from "@phosphor-icons/react";
import ConnectionVisual from "./connection-visual";
import "./connections.css";

const features = [
  { icon: BellRinging, label: "SOS", title: "Một chạm. Có nhau.", copy: "Gửi tín hiệu SOS đến những người bạn tin tưởng khi cần trợ giúp.", headline: "Lời cần giúp được gửi đi.", caption: "Từ thiết bị bên bạn đến những người có thể hỗ trợ." },
  { icon: MapPin, label: "Định vị", title: "Biết bạn ở đâu.", copy: "Chia sẻ vị trí trong tình huống khẩn cấp để người thân có thể tìm đến.", headline: "Một vị trí. Gần nhau hơn.", caption: "Người thân biết nơi bạn cần hỗ trợ, để có thể tìm đến bạn." },
  { icon: Microphone, label: "Ghi âm", title: "Lưu điều quan trọng.", copy: "Ghi lại âm thanh để chia sẻ thêm thông tin với người đang hỗ trợ bạn.", headline: "Thêm thông tin để giúp bạn.", caption: "Âm thanh được lưu lại giúp người thân hiểu tình huống bạn đang gặp." },
  { icon: UsersThree, label: "Người thân", title: "Vòng tròn tin cậy.", copy: "Kết nối với người thân, bạn bè và những người bạn tin tưởng.", headline: "Những người bạn chọn ở bên.", caption: "Thiết lập danh sách liên hệ trong ứng dụng Heros để sẵn sàng kết nối." },
] as const;

const cycleDuration = 6500;

export default function Connections({ paused = false }: { paused?: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(stage, { amount: 0.35 });
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<0 | 1 | 2 | 3>(0);
  const [automatic, setAutomatic] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const elapsed = useRef(0);
  const progress = useMotionValue(0);
  const still = paused || Boolean(reduced);
  const running = automatic && inView && pageVisible && !still && !hovered && !focused;
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
    setAutomatic(false);
    setSelected(index as 0 | 1 | 2 | 3);
    setReplayKey(value => value + 1);
    resetProgress();
  }

  return <section className="v2-connections" id="ket-noi" aria-labelledby="v2-connect-title">
    <div className="v2-section-heading">
      <div><p className="v2-eyebrow">02 / KẾT NỐI LÀ MỘT CÁCH QUAN TÂM</p><h2 id="v2-connect-title">Khi bạn cần,<br /><em>Heros kết nối.</em></h2></div>
      <div className="v2-heading-aside"><p>Từ một tín hiệu SOS đến vị trí được sẻ chia.<br />Khám phá cách Heros kết nối bạn với người thân.</p></div>
    </div>
    <div ref={stage} className="v2-connect-experience">
      <div className="v2-connect-toolbar">
        <p><CursorClick size={19} weight="duotone" /><span>Chọn một tính năng để khám phá</span></p>
        <button type="button" className="v2-connect-auto" disabled={still} aria-pressed={automatic && !still} aria-label={still ? "Tự chuyển đã tắt theo cài đặt chuyển động" : automatic ? "Tạm dừng chuyển tính năng tự động" : "Bật chuyển tính năng tự động"} onClick={() => { resetProgress(); setAutomatic(value => !value); }}>
          {automatic && !still ? <Pause size={13} weight="fill" /> : <Play size={13} weight="fill" />}
          <span>{still ? "Chuyển động đã tắt" : automatic ? "Đang tự chuyển" : "Xem tự động"}</span>
        </button>
      </div>
      <div className="v2-connect-grid" onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)}>
        <div className="v2-connect-tabs" role="tablist" aria-label="Khám phá tính năng Heros" aria-orientation="vertical"
          onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
          {features.map((feature, index) => <button ref={element => { tabs.current[index] = element; }} type="button" role="tab" id={`v2-feature-${index}`} aria-controls="v2-feature-panel" aria-selected={selected === index} aria-label={`Khám phá ${feature.label}`} tabIndex={selected === index ? 0 : -1} key={feature.label}
            onClick={() => select(index)} onKeyDown={event => {
              const next = event.key === "ArrowDown" || event.key === "ArrowRight" ? (index + 1) % features.length : event.key === "ArrowUp" || event.key === "ArrowLeft" ? (index + features.length - 1) % features.length : event.key === "Home" ? 0 : event.key === "End" ? features.length - 1 : -1;
              if (next >= 0) { event.preventDefault(); select(next); tabs.current[next]?.focus(); }
            }} className={`v2-connect-tab ${selected === index ? "is-selected" : ""}`}>
            <span className="v2-connect-icon"><feature.icon size={26} weight="light" /></span>
            <span className="v2-connect-tab-copy"><span className="v2-connect-label">0{index + 1} <i /> {feature.label}</span><strong>{feature.title}</strong><span className="v2-connect-description">{feature.copy}</span><span className="v2-connect-invitation">{selected === index ? <>Đang xem <Check size={13} /></> : <><span className="v2-connect-invite-desktop">Xem cách hoạt động</span><span className="v2-connect-invite-mobile">Xem ngay</span><ArrowRight size={14} /></>}</span></span>
          </button>)}
        </div>
        <div className="v2-connect-panel" role="tabpanel" id="v2-feature-panel" aria-labelledby={`v2-feature-${selected}`} tabIndex={0} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
          <div className="v2-connect-panel-top"><span><i /> HEROS CONNECT</span><span className="v2-connect-scene-label">{active.label}<b>0{selected + 1} / 04</b></span></div>
          <div className="v2-connect-visual-stage">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div className="v2-connect-visual" key={selected} initial={still ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: still ? 0 : -10 }} transition={{ duration: still ? 0 : 0.3 }}>
                <ConnectionVisual feature={selected} playing={inView && pageVisible && !still} replayKey={replayKey} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="v2-connect-caption"><span className="v2-connect-caption-kicker">{active.label} / CÙNG HEROS</span><h3>{active.headline}</h3><p>{active.caption}</p></div>
          <div className="v2-connect-panel-bottom">
            <div className="v2-connect-progress" aria-hidden="true">{features.map((feature, index) => <span key={feature.label} className={index === selected ? "is-current" : ""}><motion.i style={{ scaleX: index === selected ? (automatic && !still ? progress : 1) : 0 }} /></span>)}</div>
            <button type="button" onClick={() => { setAutomatic(false); setReplayKey(value => value + 1); resetProgress(); }} disabled={still} aria-label={`Xem lại minh họa ${active.label}`}><ArrowClockwise size={15} /><span>Xem lại</span></button>
          </div>
        </div>
      </div>
    </div>
    <div className="v2-features-foot"><span>Thiết bị Heros + ứng dụng + những người bạn tin tưởng.</span><Link href="/san-pham">Cách sử dụng Heros <ArrowUpRight size={16} /></Link></div>
  </section>;
}
