"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useReducer, useRef, useState } from "react";
import { Group, MathUtils, NeutralToneMapping } from "three";
import HerosDevice from "./heros-device";
const views = [
  { label: "Góc nghiêng", position: [4.4, 1.05, 7.75] },
  { label: "Mặt trước", position: [0, 0.25, 8.9] },
  { label: "Mặt bên", position: [-8.9, 0.25, 0] },
  { label: "Mặt sau", position: [0, 0.25, -8.9] },
  { label: "Từ trên", position: [2.4, 7.6, 4.0] },
] as const;

function CameraView({ view, revision }: { view: number; revision: number }) {
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    const [x, y, z] = views[view].position;
    camera.position.set(x, y, z);
    camera.lookAt(0, 0.12, 0);
  }, [camera, view, revision]);
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
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, progress.current * Math.PI * 2, 5, delta);
    group.current.rotation.z = MathUtils.damp(group.current.rotation.z, -0.08 + progress.current * 0.16, 5, delta);
  });
  return <group ref={group} scale={0.8}>
    {/* Rotate around the device body's centerline, independently of the strap. */}
    <HerosDevice centerBody={hero} />
  </group>;
}

export default function Heros3D({ hero = false }: { hero?: boolean }) {
  const [view, setView] = useState(0);
  const [viewRevision, resetView] = useReducer((value: number) => value + 1, 0);
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
        <Canvas frameloop={visible ? "always" : "never"} camera={{ position: hero ? [2.7, 0.9, 8.45] : [4.4, 1.05, 7.75], fov: 32 }} dpr={[1.5, 2]} gl={{ antialias: true, alpha: true, toneMapping: NeutralToneMapping, toneMappingExposure: 1.15 }}>
          {!hero && <CameraView view={view} revision={viewRevision} />}
          <ambientLight intensity={0.3} />
          <hemisphereLight args={["#fff4f7", "#b87991", 0.4]} />
          <directionalLight position={[-3, 4, 5]} intensity={3.5} color="#fff5f2" />
          <directionalLight position={[-3, 4, -5]} intensity={2.8} color="#fff3f5" />
          <Environment resolution={256}>
            <Lightformer intensity={1.8} position={[0, 1, 6]} target={[0, 0, 0]} scale={[6, 5, 1]} />
            <Lightformer intensity={3.5} position={[-4, 3, 4]} target={[0, 0, 0]} scale={[3, 6, 1]} />
            <Lightformer intensity={1.8} position={[4, 1, 3]} target={[0, 0, 0]} scale={[2, 5, 1]} />
            <Lightformer intensity={2.5} position={[0, 5, -2]} target={[0, 0, 0]} scale={[4, 4, 1]} />
            <Lightformer intensity={1} position={[0, -1, -5]} target={[0, 0, 0]} scale={[5, 5, 1]} />
          </Environment>
          <ScrollDevice hero={hero} />
          <ContactShadows position={[0, -1.47, 0]} opacity={0.22} scale={8} blur={2.8} far={4} resolution={256} frames={hero ? Infinity : 1} />
          <OrbitControls target={[0, 0.12, 0]} enablePan={false} enableZoom={false} enableDamping={false} minPolarAngle={0.3} maxPolarAngle={Math.PI - 0.3} />
        </Canvas>
      </Suspense>
      {!hero && <p>Kéo để xoay và ngắm từng chi tiết</p>}
    </div>
    {!hero && <><div className="model-views" role="group" aria-label="Chọn góc nhìn">
      {views.map((item, index) => <button key={item.label} type="button" aria-pressed={view === index} onClick={() => { setView(index); resetView(); }}>{item.label}</button>)}
    </div>
    </>}
  </div>;
}
