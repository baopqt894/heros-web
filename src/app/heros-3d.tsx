"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { CanvasTexture, DoubleSide, Group, MathUtils, Path, Shape } from "three";

// Dimensions preserve the reference's 38 × 62 × 16 mm proportions.
function bodyOutline() {
  const s = new Shape();
  s.moveTo(0, -1.53);
  s.bezierCurveTo(-0.77, -1.53, -0.89, -1.04, -0.89, -0.38);
  s.lineTo(-0.89, 0.46);
  s.bezierCurveTo(-0.89, 1.15, -0.65, 1.53, 0, 1.53);
  s.bezierCurveTo(0.65, 1.53, 0.89, 1.15, 0.89, 0.46);
  s.lineTo(0.89, -0.38);
  s.bezierCurveTo(0.89, -1.04, 0.77, -1.53, 0, -1.53);
  return s;
}

function BrandMark() {
  const texture = useTexture("/images/heros-logo.png");
  return <mesh position={[0, -0.12, 0.665]}>
    <planeGeometry args={[0.59, 0.67]} />
    <shaderMaterial transparent depthWrite={false} uniforms={{ map: { value: texture } }}
      vertexShader={`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
      fragmentShader={`uniform sampler2D map; varying vec2 vUv; void main(){vec3 c=texture2D(map,vec2(.265+vUv.x*.44,.395+vUv.y*.505)).rgb; float a=1.-smoothstep(.03,.22,c.g-c.r+0.22); gl_FragColor=vec4(c,a);}`} />
  </mesh>;
}

function Wordmark({ strap = false }: { strap?: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.font = "600 90px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = strap ? "#ffd6e2" : "#e9779c";
    ctx.fillText("HEROS", 256, 68);
    return new CanvasTexture(canvas);
  }, [strap]);
  return <mesh position={strap ? [0, -0.05, 0.285] : [0, -1.03, 0.407]} rotation={strap ? [0, 0, -Math.PI / 2] : [0, 0, 0]}>
    <planeGeometry args={strap ? [1.12, 0.28] : [0.78, 0.195]} />
    <meshBasicMaterial map={texture} transparent depthWrite={false} />
  </mesh>;
}

function Ring({ position, rotation = [0, 0, 0], radius = 0.25 }: { position: [number, number, number]; rotation?: [number, number, number]; radius?: number }) {
  return <mesh position={position} rotation={rotation}>
    <torusGeometry args={[radius, 0.044, 16, 80]} />
    <meshStandardMaterial color="#e3e2e0" metalness={1} roughness={0.19} />
  </mesh>;
}

function Device({ centerBody = false }: { centerBody?: boolean }) {
  const outline = useMemo(() => bodyOutline(), []);
  const loop = useMemo(() => {
    const shape = new Shape(); shape.absellipse(0, 0, 0.25, 1.31, 0, Math.PI * 2, false, 0);
    const hole = new Path(); hole.absellipse(0, 0, 0.195, 1.25, 0, Math.PI * 2, true, 0);
    shape.holes.push(hole); return shape;
  }, []);
  // The body geometry is centered at x=0, z=0; the strap must not shift its pivot.
  return <group position={[centerBody ? 0 : -0.38, -0.15, 0]}>
    <mesh position={[0, 0, -0.2]}>
      <extrudeGeometry args={[outline, { depth: 0.4, bevelEnabled: true, bevelSegments: 10, steps: 1, bevelSize: 0.17, bevelThickness: 0.2, curveSegments: 48 }]} />
      <meshPhysicalMaterial color="#f3b2c8" roughness={0.29} clearcoat={0.65} clearcoatRoughness={0.24} />
    </mesh>
    <mesh position={[0, 0, -0.012]}>
      <extrudeGeometry args={[outline, { depth: 0.024, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.172, bevelThickness: 0.008, curveSegments: 48 }]} />
      <meshStandardMaterial color="#d88aa5" roughness={0.5} />
    </mesh>
    <mesh position={[0, -0.12, 0.445]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.585, 0.61, 0.14, 96]} />
      <meshPhysicalMaterial color="#eb6c98" metalness={0.35} roughness={0.24} clearcoat={0.8} />
    </mesh>
    <mesh position={[0, -0.12, 0.54]}>
      <torusGeometry args={[0.526, 0.028, 16, 96]} />
      <meshStandardMaterial color="#e95788" metalness={0.45} roughness={0.2} />
    </mesh>
    <mesh position={[0, -0.12, 0.53]} scale={[0.505, 0.505, 0.13]}>
      <sphereGeometry args={[1, 64, 32]} />
      <meshPhysicalMaterial color="#ffd0df" roughness={0.3} clearcoat={0.7} />
    </mesh>
    <BrandMark /><Wordmark />
    <RoundedBox args={[0.12, 0.28, 0.055]} radius={0.025} position={[0, 1.01, 0.405]}>
      <meshStandardMaterial color="#917b85" metalness={0.6} roughness={0.3} />
    </RoundedBox>
    <RoundedBox args={[0.063, 0.20, 0.02]} radius={0.009} position={[0, 1.01, 0.442]}>
      <meshStandardMaterial color="#c7d3d8" metalness={0.3} roughness={0.3} />
    </RoundedBox>
    <mesh position={[0, 1.73, 0]} scale={[0.67, 1, 1]}>
      <torusGeometry args={[0.19, 0.085, 16, 48]} />
      <meshPhysicalMaterial color="#ed9fba" roughness={0.36} />
    </mesh>
    <Ring position={[0.1, 1.94, 0.08]} rotation={[0.15, 0.5, 0]} />
    <Ring position={[0.47, 1.95, 0]} rotation={[0.3, 1.15, 0.1]} radius={0.27} />
    <Ring position={[0.8, 1.75, 0.05]} rotation={[0, 0.1, 0]} radius={0.25} />
    <group position={[1.39, 0.21, 0.03]} rotation={[0.04, 0, 0.32]}>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-0.23, 0, 0]}>
        <extrudeGeometry args={[loop, { depth: 0.46, bevelEnabled: true, bevelSize: 0.013, bevelThickness: 0.013, bevelSegments: 3, curveSegments: 64 }]} />
        <meshPhysicalMaterial color="#e68cab" roughness={0.53} side={DoubleSide} clearcoat={0.15} />
      </mesh>
      <RoundedBox args={[0.46, 0.42, 0.07]} radius={0.033} position={[0, 1.05, 0.20]}>
        <meshStandardMaterial color="#e990ad" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 1.03, 0.255]} scale={[1, 1, 0.35]}>
        <sphereGeometry args={[0.105, 32, 16]} />
        <meshStandardMaterial color="#ece9e5" metalness={1} roughness={0.19} />
      </mesh>
      <Wordmark strap />
    </group>
  </group>;
}

const views = [
  { label: "Góc nghiêng", position: [4.3, 1.8, 9.2] },
  { label: "Mặt trước", position: [0, 0.35, 10.3] },
  { label: "Mặt bên", position: [10.3, 0.35, 0] },
  { label: "Mặt sau", position: [0, 0.35, -10.3] },
] as const;

function CameraView({ view }: { view: number }) {
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    const [x, y, z] = views[view].position;
    camera.position.set(x, y, z);
    camera.lookAt(0, 0.2, 0);
  }, [camera, view]);
  return null;
}

function ScrollDevice({ hero }: { hero: boolean }) {
  const group = useRef<Group>(null);
  const progress = useRef(0);
  useEffect(() => {
    if (!hero) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const story = document.querySelector(".product-story");
      if (!story || preference.matches) { progress.current = 0; return; }
      const rect = story.getBoundingClientRect();
      progress.current = MathUtils.clamp((100 - rect.top) / Math.max(1, rect.height - window.innerHeight), 0, 1);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    preference.addEventListener("change", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); preference.removeEventListener("change", update); };
  }, [hero]);
  useFrame((_, delta) => {
    if (!group.current || !hero) return;
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, progress.current * Math.PI * 1.8, 5, delta);
  });
  return <group ref={group}>
    {/* Rotate around the device body's centerline, independently of the strap. */}
    <Device centerBody={hero} />
  </group>;
}

export default function Heros3D({ hero = false }: { hero?: boolean }) {
  const [view, setView] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={host} className={`heros-model ${hero ? "hero-model" : ""}`}>
    <div className="three-viewer" aria-label="Mô hình Heros 3D tương tác">
      <Suspense fallback={<div className="model-loading">Đang tải mô hình Heros…</div>}>
        <Canvas frameloop={visible ? "always" : "never"} camera={{ position: hero ? [0, 0, 10.3] : [4.3, 1.8, 9.2], fov: 35 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
          {!hero && <CameraView view={view} />}
          <ambientLight intensity={0.65} />
          <directionalLight position={[3, 5, 5]} intensity={2} />
          <directionalLight position={[-3, 3, -5]} intensity={1.7} />
          <Environment resolution={128}>
            <Lightformer intensity={3} position={[-4, 3, 4]} scale={[3, 7, 1]} />
            <Lightformer intensity={2} position={[4, 1, 3]} scale={[2, 6, 1]} />
            <Lightformer intensity={3} position={[0, 5, -2]} rotation={[Math.PI / 2, 0, 0]} scale={[5, 5, 1]} />
          </Environment>
          <ScrollDevice hero={hero} />
          <ContactShadows position={[0, -1.87, 0]} opacity={0.25} scale={10} blur={2.8} far={5} resolution={256} frames={1} />
          {!hero && <OrbitControls target={[0, 0.2, 0]} enablePan={false} enableZoom={false} minPolarAngle={0.3} maxPolarAngle={Math.PI - 0.3} />}
        </Canvas>
      </Suspense>
      {!hero && <p>Kéo để xoay và ngắm từng chi tiết</p>}
    </div>
    {!hero && <><div className="model-views" role="group" aria-label="Chọn góc nhìn">
      {views.map((item, index) => <button key={item.label} type="button" aria-pressed={view === index} onClick={() => setView(index)}>{item.label}</button>)}
    </div>
    <details className="model-reference">
      <summary>Xem bản tham chiếu 4 góc <span>↗</span></summary>
      {/* This full sheet is intentionally downloadable as a modeling reference. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/heros-four-views.png" alt="Bản dựng tham chiếu Heros: mặt trước, mặt bên, mặt sau và góc nghiêng" width={1254} height={1254} loading="lazy" />
      <p>Mặt sau được phác dựng từ ảnh mẫu; đây chưa phải bản thiết kế kỹ thuật.</p>
    </details></>}
  </div>;
}
