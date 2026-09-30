"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Heart, List, Pause, Play, Plus, Sparkle, X } from "@phosphor-icons/react";
import { useAccount } from "../account-session";
import { LandingSceneLoading } from "./landing-scene-status";
import Connections from "./connections";

const LandingScene = dynamic(() => import("./landing-scene"), {
  ssr: false,
  loading: () => <LandingSceneLoading />,
});
const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, className = "", delay = 0 }: {children: ReactNode; className?: string; delay?: number}) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.8, delay, ease }}>{children}</motion.div>;
}

function Navigation({ paused, systemReduced, onToggle }: {paused: boolean; systemReduced: boolean; onToggle: () => void}) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { account } = useAccount();
  const motionLabel = systemReduced ? "Chuyển động đã giảm theo cài đặt hệ thống" : paused ? "Bật chuyển động nền" : "Tạm dừng chuyển động nền";
  return <header className="v2-nav">
    <Link className="v2-brand" href="/v2" aria-label="Heros — Trang chủ mới"><span className="logo-mark"><Image src="/images/heros-logo.png" width={60} height={60} alt="" /></span>HEROS<span className="v2-brand-dot" /></Link>
    <nav className={`v2-nav-links ${open ? "is-open" : ""}`} aria-label="Điều hướng phiên bản mới" id="v2-menu" onKeyDown={event => { if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); } }}>
      {[["Thiết kế", "#thiet-ke"], ["Kết nối", "#ket-noi"], ["Câu chuyện", "#cau-chuyen"], ["Ứng dụng", "#ung-dung"]].map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
      <Link className="v2-mobile-account" href="/tai-khoan">{account ? "Tài khoản của bạn" : "Tài khoản"}<ArrowUpRight size={16} /></Link>
    </nav>
    <div className="v2-nav-actions">
      <button type="button" className="v2-motion-toggle" onClick={onToggle} disabled={systemReduced} aria-label={motionLabel} title={motionLabel}>{paused || systemReduced ? <Play size={15} weight="fill" /> : <Pause size={15} weight="fill" />}</button>
      <a href="#dat-hang" className="v2-nav-cta">Đặt Heros <ArrowUpRight size={17} /></a>
      <button ref={menuButton} type="button" className="v2-menu-toggle" aria-controls="v2-menu" aria-expanded={open} aria-label={open ? "Đóng menu" : "Mở menu"} onClick={() => setOpen(value => !value)}>{open ? <X size={24} /> : <List size={24} />}</button>
    </div>
  </header>;
}

function Hero({ still, paused, reduced }: {still: boolean; paused: boolean; reduced: boolean}) {
  const chapter = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: chapter, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 85, damping: 28, mass: 0.35 });
  const haloRotate = useTransform(progress, [0, 1], [-22, 35]);
  const detailOpacity = useTransform(progress, [0, 0.27, 0.5, 1], [0, 0, 1, 1]);
  const introOpacity = useTransform(progress, [0, 0.22, 0.47, 1], [1, 1, 0, 0]);
  return <section className="v2-hero" ref={chapter} id="thiet-ke" aria-labelledby="v2-hero-title">
    <div className="v2-hero-copy">
      <div className="v2-intro">
        <motion.p className="v2-eyebrow" initial={still ? false : {opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{duration: 0.7}}><span /> MỘT NGƯỜI BẠN NHỎ. MỘT THẾ GIỚI RỘNG LỚN.</motion.p>
        <h1 id="v2-hero-title">{["Đi thật xa.", "An tâm", "thật gần."].map((line, index) => <span className="v2-title-line" key={line}><motion.span initial={still ? false : {y: "115%", rotate: 4}} animate={{y: 0, rotate: 0}} transition={{duration: 1.05, delay: index * 0.11 + 0.1, ease}}>{line}</motion.span></span>)}</h1>
        <motion.div initial={still ? false : {opacity: 0, y: 18}} animate={{opacity: 1, y: 0}} transition={{duration: 0.8, delay: 0.5}}>
          <p className="v2-hero-lead">Cứ là bạn. Cứ bước ra thế giới.<br />Heros mang những người bạn thương<br className="v2-desktop-break" /> đến gần hơn, chỉ bằng một kết nối nhỏ.</p>
          <div className="v2-hero-actions"><a className="v2-button" href="#dat-hang">Mang Heros bên mình <ArrowUpRight size={21} /></a><span>HỒNG PHẤN<br /><strong>590.000₫</strong></span></div>
        </motion.div>
        <a className="v2-scroll-cue" href="#chi-tiet"><span><ArrowDown size={18} /></span>CUỘN MỘT CHÚT. GẦN NHAU HƠN.</a>
      </div>
      <div className="v2-design-copy" id="chi-tiet">
        <Reveal><p className="v2-eyebrow">01 / NHỎ XINH CÓ CHỦ ĐÍCH</p><h2>Vừa trong tay.<br /><em>Đủ đầy quan tâm.</em></h2><p>Gửi cảnh báo SOS và chia sẻ vị trí với người thân khi bạn cần trợ giúp. Nút bấm dễ tìm, dây đeo tiện mang theo để Heros luôn trong tầm tay.</p><div className="v2-design-facts"><div><strong>62<span>mm</span></strong><p>Gọn trong lòng bàn tay</p></div><div><strong>SOS</strong><p>Kết nối khi bạn cần</p></div></div><Link className="v2-text-link" href="/san-pham">Ngắm kỹ từng chi tiết <ArrowUpRight size={19} /></Link></Reveal>
      </div>
    </div>
    <div className="v2-hero-stage">
      <div className="v2-stage-sticky">
        <span className="v2-stage-word" aria-hidden="true">heros</span>
        <div className="v2-product-glow" />
        <motion.div className="v2-orbit v2-orbit-one" style={still ? undefined : {rotate: haloRotate}} aria-hidden="true"><i /></motion.div>
        <div className="v2-orbit v2-orbit-two" aria-hidden="true" />
        <div className="v2-hero-canvas"><LandingScene progress={progress} reducedMotion={reduced} paused={paused} /></div>
        <motion.div className="v2-floating-tag v2-tag-care" style={still ? undefined : {opacity: introOpacity}}><span><Heart size={17} weight="fill" /></span>“Có tớ ở đây.”</motion.div>
        <motion.div className="v2-floating-tag v2-tag-connect" style={still ? undefined : {opacity: introOpacity}}><i /><span>Nhỏ xinh.<br /><strong>Luôn đồng hành.</strong></span><ArrowUpRight size={19} /></motion.div>
        <motion.div className="v2-detail-tag" style={still ? {opacity: 0} : {opacity: detailOpacity}}><Plus size={18} /><span>GỬI TÍN HIỆU SOS.<br />KẾT NỐI NGƯỜI THÂN.</span></motion.div>
        <div className="v2-stage-caption"><span>HEROS / HỒNG PHẤN</span><span>THIẾT BỊ SOS + DÂY ĐEO <Sparkle size={12} /></span></div>
      </div>
    </div>
  </section>;
}

function Ribbon() {
  const copy = <><span>ĐI HỌC</span><Sparkle /><span>ĐI LÀM</span><Sparkle /><span>ĐI KHÁM PHÁ</span><Sparkle /><span>ĐI THEO CÁCH CỦA BẠN</span><Sparkle /></>;
  return <div className="v2-ribbon" aria-label="Cùng bạn đi học, đi làm, khám phá và đi theo cách của bạn"><div className="v2-ribbon-track" aria-hidden="true"><div>{copy}</div><div>{copy}</div></div></div>;
}

function Story({ still }: {still: boolean}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({target: ref, offset: ["start end", "end start"]});
  const y = useTransform(scrollYProgress, [0, 1], [35, -35]);
  return <section ref={ref} id="cau-chuyen" className="v2-story">
    <div className="v2-story-orbit" aria-hidden="true" />
    <Reveal className="v2-story-label"><p className="v2-eyebrow">03 / BẮT ĐẦU TỪ MỘT LỜI NHẮN</p><Heart size={24} weight="light" /></Reveal>
    <Reveal><h2>“Về đến nhà,<br /><span>nhắn tớ nhé.</span>”</h2></Reveal>
    <motion.div className="v2-message v2-message-one" style={still ? undefined : {y}}><span>người thương</span><p>Hôm nay về muộn à?</p><small>21:08 <Check size={12} /></small></motion.div>
    <motion.div className="v2-message v2-message-two" style={still ? undefined : {y}}><Heart size={18} weight="fill" /><p>Ừ, có Heros đi cùng tớ rồi.</p></motion.div>
    <Reveal className="v2-story-bottom"><p>Có những lời giản dị, nhưng chứa cả sự quan tâm.<br />Heros bắt đầu từ đó. Để an tâm không giữ bạn ở nhà,<br className="v2-desktop-break" /> mà cùng bạn đi học, đi làm và khám phá những điều mới.</p><Link className="v2-text-link" href="/ve-chung-toi">Câu chuyện của chúng tớ <ArrowUpRight size={18} /></Link></Reveal>
  </section>;
}

const ways = [
  {file: "bag", number: "01", tag: "MỘT NGÀY DẠO PHỐ", title: "Chiếc túi quen.", italic: "Một người bạn mới.", copy: "Móc nhẹ vào quai túi. Đi cùng bạn đến quán cà phê, góc phố và những cuộc hẹn.", alt: "Heros hồng phấn gắn trên túi xách màu kem"},
  {file: "backpack", number: "02", tag: "TRÊN ĐƯỜNG ĐẾN LỚP", title: "Mang theo ước mơ.", italic: "Và một chút an tâm.", copy: "Nhỏ gọn trên ba lô. Gần bên bạn từ buổi học đầu tiên đến chặng đường về nhà.", alt: "Người mẫu mang Heros trên quai ba lô"},
  {file: "necklace", number: "03", tag: "THEO CÁCH CỦA BẠN", title: "Một điểm nhấn nhỏ.", italic: "Rất là bạn.", copy: "Đeo gần mình, phối theo ý mình. Để sự quan tâm cũng có phong cách của riêng bạn.", alt: "Người mẫu đeo thiết bị Heros cùng dây hồng trước ngực"},
] as const;

function Lifestyle() {
  const [active, setActive] = useState(0);
  const item = ways[active];
  const reduced = useReducedMotion();
  return <section className="v2-lifestyle" id="moi-ngay">
    <div className="v2-section-heading"><Reveal><p className="v2-eyebrow">04 / KHÔNG CHỈ ĐỂ MANG THEO</p><h2>Để sống theo<br /><em>cách của bạn.</em></h2></Reveal><Reveal className="v2-heading-aside"><p>Một chiếc túi quen. Một buổi học mới.<br />Hay một ngày chỉ dành cho mình.</p><Sparkle size={36} weight="light" /></Reveal></div>
    <div className="v2-lifestyle-layout">
      <div className="v2-lifestyle-photo"><AnimatePresence mode="wait"><motion.div key={item.file} initial={reduced ? false : {opacity: 0, scale: 1.045}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0}} transition={{duration: 0.55, ease}}><Image src={`/images/heros-lifestyle-${item.file}.png`} alt={item.alt} fill sizes="(max-width: 760px) 100vw, 55vw" /></motion.div></AnimatePresence><span className="v2-photo-caption">HEROS IN REAL LIFE <span>0{active + 1} / 03</span></span></div>
      <div className="v2-lifestyle-content"><div className="v2-lifestyle-selector" role="group" aria-label="Cách mang Heros">{["Dạo phố", "Đi học", "Mỗi ngày"].map((label, index) => <button type="button" key={label} aria-pressed={active === index} onClick={() => setActive(index)}>{label}<ArrowUpRight size={16} /></button>)}</div><AnimatePresence mode="wait"><motion.div key={item.file} className="v2-lifestyle-description" initial={reduced ? false : {opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} transition={{duration: 0.35}}><span>{item.tag}</span><h3>{item.title}<br /><em>{item.italic}</em></h3><p>{item.copy}</p></motion.div></AnimatePresence><a href="#dat-hang" className="v2-text-link">Tìm Heros của bạn <ArrowRight size={18} /></a><small>Hình ảnh phối đeo minh họa được tạo bằng AI.</small></div>
    </div>
  </section>;
}

export default function LandingV2({ conversion }: {conversion: ReactNode}) {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const still = paused || Boolean(reduced);
  return <MotionConfig reducedMotion={paused ? "always" : "user"}>
    <div className="landing-v2" data-motion={still ? "off" : "on"}>
      <Navigation paused={paused} systemReduced={Boolean(reduced)} onToggle={() => setPaused(value => !value)} />
      <main id="main"><Hero still={still} paused={paused} reduced={Boolean(reduced)} /><Ribbon /><Connections paused={paused} /><Story still={still} /><Lifestyle />
        <section className="v2-care"><Reveal><span><Heart size={25} weight="fill" /></span><p>MỘT MÓN NHỎ BÊN MÌNH.</p><h2>Một sự an tâm<br /><em>thật lớn.</em></h2><a className="v2-button v2-button-light" href="#dat-hang">Dành cho người bạn thương <ArrowUpRight size={20} /></a></Reveal><span className="v2-care-outline" aria-hidden="true">with you.</span></section>
        {conversion}
      </main>
    </div>
  </MotionConfig>;
}
