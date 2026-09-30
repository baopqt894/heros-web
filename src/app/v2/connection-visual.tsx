"use client";

import { useId, type CSSProperties } from "react";
import "./connection-visual.css";

type ConnectionVisualProps = {
  feature: 0 | 1 | 2 | 3;
  playing: boolean;
  replayKey: number;
};

function PersonIcon({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="11" r="5" fill="currentColor" opacity=".78" />
    <path d="M6 27c0-6 4-10 10-10s10 4 10 10" fill="currentColor" opacity=".54" />
  </svg>;
}

function ShieldIcon() {
  return <svg viewBox="0 0 24 24" fill="none">
    <path d="m12 3 8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="m8.5 11.5 2.4 2.4 4.6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

function SosVisual({ id }: { id: string }) {
  return <div className="v2-cv-stage v2-cv-sos">
    <svg className="v2-cv-art" viewBox="0 0 480 340" fill="none">
      <defs>
        <linearGradient id={`${id}-device`} x1="104" y1="100" x2="230" y2="287" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffeff4" /><stop offset=".47" stopColor="#f2bdd1" /><stop offset="1" stopColor="#d788a6" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="118" y1="166" x2="177" y2="225" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f3a6c1" /><stop offset=".4" stopColor="#d4618d" /><stop offset="1" stopColor="#a73e68" />
        </linearGradient>
        <filter id={`${id}-device-shadow`} x="-60%" y="-30%" width="220%" height="200%">
          <feDropShadow dx="4" dy="16" stdDeviation="13" floodColor="#9c5172" floodOpacity=".18" />
        </filter>
        <linearGradient id={`${id}-signal`} x1="191" y1="165" x2="313" y2="98" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d8739b" stopOpacity=".35" /><stop offset="1" stopColor="#a74670" />
        </linearGradient>
      </defs>
      <ellipse cx="155" cy="285" rx="78" ry="12" fill="#9f637b" opacity=".045" />
      <path className="v2-cv-signal-trace" d="M178 164C229 164 208 104 263 104h37" stroke={`url(#${id}-signal)`} strokeWidth="2" strokeLinecap="round" strokeDasharray="5 7" />
      <g className="v2-cv-device-float">
        <g transform="rotate(-13 155 188)" filter={`url(#${id}-device-shadow)`}>
          <path d="M164 85c38 5 66 55 75 108 3 18-8 26-14 15l-48-99" stroke="#e8a8be" strokeWidth="16" strokeLinecap="round" />
          <path d="M164 85c38 5 66 55 75 108 3 18-8 26-14 15l-48-99" stroke="#f4c4d5" strokeWidth="12" strokeLinecap="round" />
          <ellipse cx="155" cy="83" rx="13" ry="16" stroke="#b5a5a7" strokeWidth="5" />
          <ellipse cx="155" cy="83" rx="13" ry="16" stroke="#eee8e6" strokeWidth="2" />
          <path d="M119 105c16-10 50-9 63 4 16 17 23 51 23 83 0 52-20 82-52 82-34 0-51-29-51-78 0-41 3-77 17-91Z" fill="#db96b1" />
          <path d="M115 103c16-10 50-9 63 4 16 17 23 51 23 83 0 52-20 82-52 82-34 0-51-29-51-78 0-41 3-77 17-91Z" fill={`url(#${id}-device)`} stroke="#ffe8f0" strokeWidth="1.3" />
          <path d="M108 175c0-40 8-64 26-69" stroke="white" strokeWidth="3" strokeLinecap="round" opacity=".43" />
          <rect x="146" y="121" width="6" height="13" rx="3" fill="#958a91" />
          <rect x="147" y="122" width="3" height="10" rx="1.5" fill="#c6d2d6" />
          <circle cx="149" cy="190" r="31" fill={`url(#${id}-rim)`} />
          <circle cx="149" cy="190" r="26.5" fill="#f5c9d9" stroke="#fff0f5" strokeWidth="1.5" />
          <path d="m149 172 14 5v9c0 10-6 15-14 19-8-4-14-9-14-19v-9l14-5Z" stroke="#c55c86" strokeWidth="2" />
          <path d="m143 187 4 4 8-9" stroke="#c55c86" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="149" y="242" textAnchor="middle" fill="#c57695" fontSize="11" letterSpacing="1.5">HEROS</text>
        </g>
      </g>
      <g className="v2-cv-sos-waves" stroke="#ce7699" strokeWidth="1.5" strokeLinecap="round">
        <path d="M195 130c6 2 9 6 11 11" />
        <path d="M200 119c10 3 17 11 20 19" opacity=".6" />
        <path d="M205 108c14 5 24 15 28 28" opacity=".3" />
      </g>
      <circle className="v2-cv-signal-dot" cx="252" cy="106" r="4" fill="#b44f7a" />
    </svg>
    <div className="v2-cv-message v2-cv-glass">
      <div className="v2-cv-message-head"><span className="v2-cv-mini-icon"><ShieldIcon /></span><span>HEROS</span><span>Vừa xong</span></div>
      <strong>Tín hiệu SOS</strong>
      <p>Gửi đến người thân</p>
      <div className="v2-cv-delivered"><span>✓</span> Đến liên hệ tin cậy</div>
    </div>
    <div className="v2-cv-tag v2-cv-sos-tag"><span className="v2-cv-status-dot" />Gửi cảnh báo SOS.</div>
  </div>;
}

function LocationVisual({ id }: { id: string }) {
  return <div className="v2-cv-stage v2-cv-location">
    <svg className="v2-cv-art v2-cv-map" viewBox="0 0 480 340" fill="none">
      <defs>
        <linearGradient id={`${id}-map-paper`} x1="58" y1="53" x2="417" y2="306" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fffdfa" /><stop offset="1" stopColor="#f3e9e4" />
        </linearGradient>
        <linearGradient id={`${id}-river`} x1="340" y1="36" x2="296" y2="302" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d9e8e8" /><stop offset="1" stopColor="#c5d9dd" />
        </linearGradient>
        <linearGradient id={`${id}-pin`} x1="204" y1="144" x2="238" y2="199" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d57a9d" /><stop offset="1" stopColor="#953d64" />
        </linearGradient>
        <filter id={`${id}-map-shadow`} x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dy="15" stdDeviation="15" floodColor="#7a5363" floodOpacity=".12" />
        </filter>
        <clipPath id={`${id}-map-clip`}><rect x="44" y="46" width="392" height="258" rx="25" /></clipPath>
      </defs>
      <g transform="rotate(-5 240 175)">
        <rect x="45" y="52" width="392" height="258" rx="25" fill="#ddc9cd" opacity=".38" />
        <rect x="44" y="46" width="392" height="258" rx="25" fill={`url(#${id}-map-paper)`} stroke="#fff" strokeWidth="2" filter={`url(#${id}-map-shadow)`} />
        <g clipPath={`url(#${id}-map-clip)`}>
          <path d="M42 41h99v81H42zM160 42h97v80h-97zM42 148h94v69H42zM158 148h73v70h-73zM43 242h96v64H43zM160 243h108v64H160zM369 47h75v87h-75zM350 155h94v50h-94zM337 232h108v75H337z" fill="#e9dfda" />
          <path d="M52 61h29v24H52zM93 58h34v27H93zM54 94h45v18H54zM111 94h19v19h-19zM171 57h25v28h-25zM208 57h36v28h-36zM170 96h63v17h-63zM51 255h35v26H51zM98 254h31v40H98zM177 257h29v37h-29zM219 256h39v20h-39zM365 244h31v20h-31zM407 246h24v47h-24zM351 276h43v21h-43z" fill="#ddd0cd" />
          <path d="M62 161h59v43H62z" fill="#d8ddc9" />
          <path d="M64 184c9-15 18 12 29-1s17-8 23-6" stroke="#f5f4e8" strokeWidth="3" />
          <circle cx="75" cy="169" r="6" fill="#bfcaaa" /><circle cx="109" cy="195" r="5" fill="#bfcaaa" /><circle cx="77" cy="197" r="4" fill="#c6d0b2" />
          <path d="M260 36c37 23 45 50 32 80-13 29-39 45-25 69 14 24 57 12 59 48 2 28-16 50-16 83" stroke="#f7faf8" strokeWidth="45" />
          <path d="M260 36c37 23 45 50 32 80-13 29-39 45-25 69 14 24 57 12 59 48 2 28-16 50-16 83" stroke={`url(#${id}-river)`} strokeWidth="31" />
          <path d="M260 36c37 23 45 50 32 80-13 29-39 45-25 69 14 24 57 12 59 48 2 28-16 50-16 83" stroke="#eef5f4" strokeWidth="1" strokeDasharray="3 9" opacity=".6" />
          <path d="M40 136h230M40 230h398M149 46v268M239 45v83M239 147v165M309 141h133M354 38v159" stroke="#fffdfa" strokeWidth="14" />
          <path d="M40 136h223M40 230h399M149 46v268M239 45v83M239 147v165M314 141h128M354 38v160" stroke="#dfd4d0" strokeWidth="1" />
          <path d="m268 137 46 4M289 230h54" stroke="#d1bbb8" strokeWidth="18" />
          <path d="m268 137 46 4M289 230h54" stroke="#fff9f5" strokeWidth="12" />
          <path d="M323 66h22v52h-22zM373 66h52v50h-52zM361 163h27v29h-27zM400 161h29v31h-29z" fill="#e4d6d7" />
          <path d="M208 198h31v32h115v-88h24" stroke="#fff" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
          <path className="v2-cv-map-route" pathLength="1" d="M208 198h31v32h115v-88h24" stroke="#b45881" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          <path className="v2-cv-map-dashes" d="M208 198h31v32h115v-88h24" stroke="#fff" strokeWidth="3.5" strokeDasharray="1 11" strokeLinejoin="round" />
          <circle cx="208" cy="198" r="23" fill="#d397b0" opacity=".12" />
          <circle className="v2-cv-map-pulse" cx="208" cy="198" r="15" stroke="#c47598" strokeWidth="1.4" opacity=".36" />
          <circle cx="208" cy="198" r="5" fill="#a94c77" stroke="white" strokeWidth="2" />
          <circle cx="378" cy="142" r="18" fill="#fff" stroke="#e5cdd7" strokeWidth="2" />
          <circle cx="378" cy="137" r="5" fill="#bc90a3" />
          <path d="M368 153c1-8 19-8 20 0" fill="#d4b4c2" />
        </g>
      </g>
      <g className="v2-cv-location-pin">
        <ellipse cx="209" cy="194" rx="12" ry="4" fill="#7b4360" opacity=".16" />
        <path d="M209 144c-12 0-20 8-20 19 0 14 20 32 20 32s20-18 20-32c0-11-8-19-20-19Z" fill={`url(#${id}-pin)`} stroke="#fff2f7" strokeWidth="1.5" />
        <circle cx="209" cy="162" r="7" fill="#fff8fa" />
        <circle cx="209" cy="162" r="3" fill="#d491ad" />
      </g>
      <g transform="translate(71 269)"><circle r="13" fill="#fffaf7" /><path d="m0-8 4 14-4-3-4 3 4-14Z" fill="#b28699" /><path d="M0-8v11l-4 3 4-14Z" fill="#dabcc9" /></g>
    </svg>
    <div className="v2-cv-map-label v2-cv-glass"><span className="v2-cv-status-dot" /><strong>Bạn ở đây</strong></div>
    <div className="v2-cv-location-contact v2-cv-glass"><span className="v2-cv-avatar"><PersonIcon /></span><div><span>Chia sẻ với</span><strong>Người thân</strong></div><span className="v2-cv-check">✓</span></div>
    <div className="v2-cv-tag v2-cv-map-tag"><span className="v2-cv-status-dot" />Chia sẻ vị trí khi cần trợ giúp.</div>
  </div>;
}

const waveform = [10, 18, 13, 27, 42, 31, 20, 45, 67, 48, 30, 22, 38, 55, 74, 55, 36, 51, 81, 62, 39, 28, 52, 73, 48, 32, 20, 37, 58, 42, 24, 16, 30, 44, 26, 18, 10];

function AudioVisual() {
  return <div className="v2-cv-stage v2-cv-audio">
    <div className="v2-cv-audio-back v2-cv-glass" />
    <div className="v2-cv-recording v2-cv-glass">
      <div className="v2-cv-recording-top"><span className="v2-cv-audio-icon"><svg viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" /><path d="M6 11v1a6 6 0 0 0 12 0v-1M12 18v3m-3 0h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></span><div><span>HEROS AUDIO</span><strong>Âm thanh quanh bạn</strong></div><span className="v2-cv-rec-pill"><i />REC</span></div>
      <div className="v2-cv-waveform">
        <div className="v2-cv-wave-baseline" />
        {waveform.map((height, index) => <i key={index} style={{ "--bar-height": `${height}%`, "--bar-delay": `${index * -0.073}s`, "--bar-time": `${1.15 + index % 5 * 0.13}s` } as CSSProperties} />)}
      </div>
      <div className="v2-cv-audio-times"><span>00:00</span><strong>00:12</strong><span>00:24</span></div>
      <div className="v2-cv-audio-rule"><span /></div>
      <div className="v2-cv-audio-footer"><span><i />Lưu âm thanh tình huống</span><span className="v2-cv-audio-file">Âm thanh</span></div>
    </div>
    <div className="v2-cv-audio-note v2-cv-glass"><span className="v2-cv-mini-icon"><ShieldIcon /></span><span>Chia sẻ với người hỗ trợ.</span><span className="v2-cv-check">✓</span></div>
  </div>;
}

function ContactsVisual() {
  return <div className="v2-cv-stage v2-cv-contacts">
    <svg className="v2-cv-art" viewBox="0 0 480 340" fill="none">
      <ellipse cx="235" cy="171" rx="136" ry="98" stroke="#dbc3cf" strokeWidth="1" strokeDasharray="3 8" />
      <ellipse cx="235" cy="171" rx="172" ry="124" stroke="#e8d8df" strokeWidth="1" opacity=".7" />
      <path className="v2-cv-contact-path" pathLength="1" d="M238 173 133 88M238 173l-98 94M238 173l115 8" stroke="#bb7897" strokeWidth="1.5" strokeDasharray="1" />
      <circle cx="70" cy="159" r="4" fill="#d2a0b6" /><circle cx="318" cy="75" r="3" fill="#dfb8ca" /><circle cx="288" cy="283" r="4" fill="#dbc3c9" />
      <path d="m377 249 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" fill="#d7b3c3" />
      <circle cx="238" cy="173" r="44" fill="#ecd3de" opacity=".42" /><circle cx="238" cy="173" r="35" fill="#fffafc" stroke="#e1bfd0" />
      <path d="m238 152 15 6v10c0 10-6 17-15 22-9-5-15-12-15-22v-10l15-6Z" fill="#d59cb6" stroke="#ad547e" strokeWidth="1" /><path d="m231 169 5 5 10-11" stroke="#fff5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div className="v2-cv-contact-card v2-cv-contact-one v2-cv-glass"><span className="v2-cv-avatar"><PersonIcon /></span><div><strong>Người thân 01</strong><span>Liên hệ tin cậy</span></div><span className="v2-cv-check">✓</span></div>
    <div className="v2-cv-contact-card v2-cv-contact-two v2-cv-glass"><span className="v2-cv-avatar"><PersonIcon /></span><div><strong>Người thân 02</strong><span>Luôn trong kết nối</span></div></div>
    <div className="v2-cv-contact-card v2-cv-contact-three v2-cv-glass"><span className="v2-cv-avatar"><PersonIcon /></span><div><strong>Người thân 03</strong><span>Vòng tròn của bạn</span></div></div>
    <div className="v2-cv-tag v2-cv-contacts-tag">Những người bạn tin tưởng.</div>
  </div>;
}

export default function ConnectionVisual({ feature, playing, replayKey }: ConnectionVisualProps) {
  const id = `v2-cv-${useId().replace(/:/g, "")}`;
  return <div key={`${feature}-${replayKey}`} className={`v2-cv ${playing ? "" : "v2-cv-paused"}`} aria-hidden="true">
    {feature === 0 && <SosVisual id={id} />}
    {feature === 1 && <LocationVisual id={id} />}
    {feature === 2 && <AudioVisual />}
    {feature === 3 && <ContactsVisual />}
  </div>;
}
