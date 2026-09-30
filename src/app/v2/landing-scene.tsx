"use client";

import { addAfterEffect, Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrthographicCamera } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import { Component, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Group, MathUtils, NeutralToneMapping, WebGLRenderer } from "three";
import HerosDevice from "../heros-device";
import { LandingSceneError, LandingSceneLoading } from "./landing-scene-status";

type LandingSceneProps = {
  progress: MotionValue<number>;
  reducedMotion?: boolean;
  paused?: boolean;
};

class SceneBoundary extends Component<{ children: ReactNode; onRetry: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <LandingSceneError onRetry={this.props.onRetry} /> : this.props.children;
  }
}

function SceneCamera() {
  const size = useThree((state) => state.size);
  // Preserve room for both the leather loop and the changing rotated outline.
  return <OrthographicCamera makeDefault position={[0, 0.12, 9]} zoom={Math.min(size.height / 4.8, size.width / 4.8)} near={0.1} far={40} />;
}

function ContextSafety({ onLost }: { onLost: () => void }) {
  const renderer = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = renderer.domElement;
    const handleLoss = (event: Event) => {
      event.preventDefault();
      onLost();
    };
    canvas.addEventListener("webglcontextlost", handleLoss);
    return () => canvas.removeEventListener("webglcontextlost", handleLoss);
  }, [renderer, onLost]);
  return null;
}

function FloatingDevice({ progress, reducedMotion, paused, onReady }: LandingSceneProps & { onReady: () => void }) {
  const device = useRef<Group>(null);
  const floatTime = useRef(0);
  const frameSeen = useRef(false);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    // The global after-effect runs after this device's first frame has rendered.
    const unsubscribe = addAfterEffect(() => {
      if (!frameSeen.current) return;
      unsubscribe();
      onReady();
    });
    invalidate();
    return unsubscribe;
  }, [invalidate, onReady]);

  useFrame((_, delta) => {
    if (!device.current) return;
    frameSeen.current = true;
    if (reducedMotion) {
      device.current.position.y = 0;
      device.current.rotation.set(-0.04, -0.3, -0.055);
      return;
    }
    if (paused) return;

    // Accumulate only active frame time, so resuming never jumps the float phase.
    const step = Math.min(delta, 0.05);
    floatTime.current += step;
    const travel = MathUtils.clamp(progress.get(), 0, 1);
    const phase = floatTime.current;
    device.current.rotation.y = MathUtils.damp(device.current.rotation.y, -0.3 + travel * Math.PI * 1.25, 5, step);
    device.current.rotation.x = MathUtils.damp(device.current.rotation.x, -0.04 + Math.sin(phase * 0.38) * 0.016, 4, step);
    device.current.rotation.z = MathUtils.damp(device.current.rotation.z, -0.055 + travel * 0.09 + Math.sin(phase * 0.46) * 0.012, 4, step);
    device.current.position.y = Math.sin(phase * 0.64) * 0.045;
  });

  return <group ref={device} rotation={[-0.04, -0.3, -0.055]}>
    <HerosDevice centerBody />
  </group>;
}

function StudioLights() {
  return <>
    <ambientLight intensity={0.28} />
    <hemisphereLight args={["#fff9fb", "#b98498", 0.48]} />
    <directionalLight position={[-3, 4, 5]} intensity={3.2} color="#fff6f3" />
    <directionalLight position={[-2, 3, -4]} intensity={2.6} color="#fff1f6" />
    <Environment resolution={128} frames={1}>
      <Lightformer intensity={1.7} position={[0, 1, 6]} target={[0, 0, 0]} scale={[6, 5, 1]} />
      <Lightformer intensity={3.2} position={[-4, 3, 4]} target={[0, 0, 0]} scale={[3, 6, 1]} />
      <Lightformer intensity={1.7} position={[4, 1, 3]} target={[0, 0, 0]} scale={[2, 5, 1]} />
      <Lightformer intensity={2.3} position={[0, 5, -2]} target={[0, 0, 0]} scale={[4, 4, 1]} />
      <Lightformer intensity={0.9} position={[0, -1, -5]} target={[0, 0, 0]} scale={[5, 5, 1]} />
    </Environment>
  </>;
}

export default function LandingScene({ progress, reducedMotion = false, paused = false }: LandingSceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [mobile, setMobile] = useState(true);
  const [ready, setReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const markReady = useCallback(() => setReady(true), []);
  const markContextLost = useCallback(() => setContextLost(true), []);
  const retry = useCallback(() => {
    setReady(false);
    setContextLost(false);
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (ready || contextLost || !visible || !pageVisible) return;
    // A stalled texture request or renderer setup must not leave loading forever.
    const timeout = window.setTimeout(markContextLost, 30_000);
    return () => window.clearTimeout(timeout);
  }, [ready, contextLost, visible, pageVisible, attempt, markContextLost]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "80px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div
    ref={host}
    className="v2-landing-scene"
    style={{ position: "relative", width: "100%", height: "100%" }}
  >
    <SceneBoundary key={attempt} onRetry={retry}>
      {contextLost ? <LandingSceneError onRetry={retry} /> : <>
        {!ready && <LandingSceneLoading />}
        <div
          role="img"
          aria-label="Góc nhìn 3D thiết bị Heros màu hồng, chuyển động nhẹ theo trang."
          aria-hidden={!ready}
          style={{ position: "absolute", inset: 0, opacity: ready ? 1 : 0, transition: reducedMotion ? "none" : "opacity 400ms ease", pointerEvents: "none" }}
        >
          <Canvas
            orthographic
            camera={{ position: [0, 0.12, 9], zoom: 110, near: 0.1, far: 40 }}
            dpr={mobile ? 1 : [1, 1.5]}
            frameloop={!visible || !pageVisible ? "never" : paused || reducedMotion ? "demand" : "always"}
            gl={async (defaults) => {
              try {
                return new WebGLRenderer({ ...defaults, antialias: true, alpha: true, powerPreference: "low-power" });
              } catch {
                markContextLost();
                // R3F's async configure sits outside React's error boundary. Keep
                // it pending only until the error state unmounts this Canvas.
                return new Promise<WebGLRenderer>(() => {});
              }
            }}
            onCreated={({ gl }) => {
              gl.toneMapping = NeutralToneMapping;
              gl.toneMappingExposure = 1.12;
            }}
            fallback={<p>Trình duyệt chưa hỗ trợ góc nhìn 3D.</p>}
          >
            <SceneCamera />
            <ContextSafety onLost={markContextLost} />
            <Suspense fallback={null}>
              <StudioLights />
              <FloatingDevice progress={progress} reducedMotion={reducedMotion} paused={paused} onReady={markReady} />
            </Suspense>
          </Canvas>
        </div>
      </>}
    </SceneBoundary>
  </div>;
}
