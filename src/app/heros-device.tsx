"use client";

import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import {
  CatmullRomCurve3,
  LatheGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import HerosBrandDecal, { HEROS_BRAND_ASPECT } from "./heros-brand-decal";
import { createLeatherGrain, createShellGrain, createThreadGeometry } from "./heros-materials";
import {
  BODY, BUTTON_Y, BUTTON_FACE_RADIUS, BUTTON_BASE_Z, CHAIN, LINK_BAND, STRAP, TAB,
  LinkCurve, OutlineCurve, RibbonEdgeCurve,
  bodyFront, buttonFront, createBodyGeometry, createButtonFace,
  createLinkBandGeometry, createRibbonGeometry, createSurfacePatch, strapCurve, strapWidthAt, topTabCurve,
} from "./heros-geometry";

// Interpolate the actual front run, so printed marks hug the leather as it bends.
const strapSamples = strapCurve.getPoints(800);
function strapFront(_x: number, y: number) {
  let z = -Infinity;
  for (let i = 0; i < strapSamples.length - 1; i++) {
    const a = strapSamples[i], b = strapSamples[i + 1];
    if ((y - a.y) * (y - b.y) <= 0 && Math.abs(b.y - a.y) > 1e-6) {
      z = Math.max(z, a.z + (b.z - a.z) * (y - a.y) / (b.y - a.y));
    }
  }
  return z + STRAP.thickness / 2 + 0.002;
}

export default function HerosDevice({ centerBody = false }: { centerBody?: boolean }) {
  const model = useMemo(() => {
    const strapWord = createSurfacePatch(1.04 / HEROS_BRAND_ASPECT.wordmark, 1.04, 0, -1.19, strapFront);
    const uv = strapWord.getAttribute("uv");
    for (let i = 0; i < uv.count; i++) uv.setXY(i, 1 - uv.getY(i), uv.getX(i));
    const edges = [-1, 1].map((side) => new RibbonEdgeCurve(strapCurve, side * (STRAP.width / 2 - 0.012), STRAP.thickness / 2, true));
    const stitches = [-1, 1].map((side) => new RibbonEdgeCurve(strapCurve, side * (STRAP.width / 2 - 0.04), STRAP.thickness / 2 + 0.002, true));
    const tabEdges = [-1, 1].map((side) => new RibbonEdgeCurve(topTabCurve, side * (TAB.width / 2 - 0.02), TAB.thickness / 2));
    const tabStitches = [-1, 1].map((side) => new RibbonEdgeCurve(topTabCurve, side * (TAB.width / 2 - 0.04), TAB.thickness / 2 + 0.001));
    return {
      body: createBodyGeometry(),
      // The housing joint is a hairline on the equator, not another thick bevel.
      seam: new TubeGeometry(new OutlineCurve(1.0007, 0), 256, 0.004, 5, true),
      faceReveal: new TubeGeometry(new OutlineCurve(0.976, bodyFront(BODY.x * 0.976, 0) + 0.001), 384, 0.002, 5, true),
      button: createButtonFace(),
      bezel: new LatheGeometry(new CatmullRomCurve3([
        [0, 0.41], [0.555, 0.41], [0.582, 0.448], [0.591, 0.52],
        [0.59, 0.573], [0.582, 0.606], [0.563, 0.618],
        [0.517, 0.618], [0.493, 0.610], [0.487, 0.600], [0.483, 0.577], [0, 0.577],
      ].map(([x, y]) => new Vector3(x, y, 0)), false, "centripetal").getPoints(96).map(({ x, y }) => new Vector2(Math.max(0, x), y)), 128),
      shield: createSurfacePatch(0.55, 0.55 / HEROS_BRAND_ASPECT.shield, 0, BUTTON_Y, (x, y) => buttonFront(x, y) + 0.001),
      word: createSurfacePatch(0.735, 0.735 / HEROS_BRAND_ASPECT.wordmark, 0, -0.93, (x, y) => bodyFront(x, y) + 0.001),
      links: CHAIN.map((link, index) => index === LINK_BAND.index ? createLinkBandGeometry(index) : new TubeGeometry(new LinkCurve(index), 128, link.tube, 16, true)),
      strap: createRibbonGeometry(strapCurve, STRAP.width, STRAP.thickness, 200, strapWidthAt),
      strapEdges: edges.map((curve) => new TubeGeometry(curve, 200, 0.005, 5, true)),
      strapStitches: stitches.map((curve) => createThreadGeometry(curve)),
      strapWord,
      strapShield: createSurfacePatch(0.255, 0.255 / HEROS_BRAND_ASPECT.shield, 0, -2.34, strapFront),
      tab: createRibbonGeometry(topTabCurve, TAB.width, TAB.thickness, 128),
      tabEdges: tabEdges.map((curve) => new TubeGeometry(curve, 96, 0.004, 5, true)),
      tabStitches: tabStitches.map((curve) => createThreadGeometry(curve, 0.054)),
      grain: createLeatherGrain(),
      shellGrain: createShellGrain(),
    };
  }, []);

  useEffect(() => () => {
    Object.values(model).flat().forEach((resource) => resource.dispose());
  }, [model]);

  return <group position={[centerBody ? 0 : -0.40, -0.24, 0]}>
    <mesh geometry={model.body}>
      <meshPhysicalMaterial color="#f8bed2" roughness={0.34} metalness={0} clearcoat={0.24} clearcoatRoughness={0.32} bumpMap={model.shellGrain} bumpScale={0.00045} />
    </mesh>
    <mesh geometry={model.seam}>
      <meshStandardMaterial color="#cc819b" roughness={0.57} />
    </mesh>
    <mesh geometry={model.faceReveal}>
      <meshStandardMaterial color="#fbd0df" roughness={0.42} />
    </mesh>

    <mesh geometry={model.bezel} rotation={[Math.PI / 2, 0, 0]} position={[0, BUTTON_Y, 0]}>
      <meshPhysicalMaterial color="#fa729e" metalness={0.5} roughness={0.23} clearcoat={0.4} />
    </mesh>
    <mesh geometry={model.button}>
      <meshPhysicalMaterial color="#fbc9da" roughness={0.34} clearcoat={0.26} bumpMap={model.shellGrain} bumpScale={0.00035} />
    </mesh>
    <mesh position={[0, BUTTON_Y, BUTTON_BASE_Z]}>
      <torusGeometry args={[BUTTON_FACE_RADIUS + 0.002, 0.004, 8, 128]} />
      <meshStandardMaterial color="#b9426d" metalness={0.35} roughness={0.35} />
    </mesh>
    <HerosBrandDecal geometry={model.shield} variant="shield" />
    <HerosBrandDecal geometry={model.word} variant="wordmark" />

    <group position={[0, 0.955, bodyFront(0, 0.955)]} rotation={[Math.atan((bodyFront(0, 0.956) - bodyFront(0, 0.954)) / 0.002), 0, 0]}>
      <mesh scale={[1, 1, 0.26]}>
        <capsuleGeometry args={[0.051, 0.113, 8, 24]} />
        <meshStandardMaterial color="#a06c80" metalness={0.22} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.013]} scale={[1, 1, 0.3]}>
        <capsuleGeometry args={[0.034, 0.111, 8, 24]} />
        <meshPhysicalMaterial color="#9daeb9" metalness={0.25} roughness={0.3} clearcoat={0.5} />
      </mesh>
    </group>

    <mesh geometry={model.tab}>
      <meshStandardMaterial color="#e890ae" roughness={0.57} bumpMap={model.grain} bumpScale={0.0025} />
    </mesh>
    {model.tabEdges.map((geometry, i) => <mesh key={i} geometry={geometry}>
      <meshStandardMaterial color="#edacc3" roughness={0.6} />
    </mesh>)}
    {model.tabStitches.map((geometry, i) => <mesh key={i} geometry={geometry}>
      <meshStandardMaterial color="#ffd2df" roughness={0.83} />
    </mesh>)}
    {model.links.map((geometry, i) => <mesh key={i} geometry={geometry}>
      <meshStandardMaterial color="#e0e0d9" metalness={0.97} roughness={0.2} />
    </mesh>)}

    <group position={STRAP.position} rotation={[0, STRAP.yaw, STRAP.angle]}>
      <mesh geometry={model.strap}>
        <meshPhysicalMaterial color="#ec9ab7" roughness={0.57} bumpMap={model.grain} bumpScale={0.0025} clearcoat={0.08} />
      </mesh>
      {model.strapEdges.map((geometry, i) => <mesh key={i} geometry={geometry}>
        <meshStandardMaterial color="#c97494" roughness={0.68} />
      </mesh>)}
      {model.strapStitches.map((geometry, i) => <mesh key={i} geometry={geometry}>
        <meshStandardMaterial color="#ffd2df" roughness={0.83} />
      </mesh>)}
      {/* Folded keeper and through-rivet close the two ends around the metal ring. */}
      <RoundedBox args={[0.29, 0.23, 0.046]} radius={0.02} smoothness={5} position={[0, -0.08, 0.145]} rotation={[-0.10, 0, 0]}>
        <meshStandardMaterial color="#ec9ab7" roughness={0.59} bumpMap={model.grain} bumpScale={0.0025} />
      </RoundedBox>
      <mesh position={[0, -0.11, 0.183]} scale={[1, 1, 0.33]}>
        <sphereGeometry args={[0.102, 32, 16]} />
        <meshStandardMaterial color="#d7d9d3" metalness={0.95} roughness={0.23} />
      </mesh>
      <mesh position={[0, -0.11, 0.184]}>
        <torusGeometry args={[0.102, 0.011, 8, 48]} />
        <meshStandardMaterial color="#92948e" metalness={0.9} roughness={0.26} />
      </mesh>
      <mesh position={[0, -0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.35, 16]} />
        <meshStandardMaterial color="#bfc1bc" metalness={0.95} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.11, -0.17]} scale={[1, 1, 0.2]}>
        <sphereGeometry args={[0.072, 24, 12]} />
        <meshStandardMaterial color="#c5c7c1" metalness={0.94} roughness={0.28} />
      </mesh>
      <HerosBrandDecal geometry={model.strapWord} variant="wordmark" tint="#fbd5e2" />
      <HerosBrandDecal geometry={model.strapShield} variant="shield" tint="#ca5f8b" roughness={0.58} />
    </group>
  </group>;
}
