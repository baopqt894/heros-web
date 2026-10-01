"use client";

import { useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import {
  BufferGeometry,
  type ColorRepresentation,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector4,
} from "three";

export type HerosBrandVariant = "shield" | "wordmark";

export type HerosBrandDecalProps = {
  /** Surface-following geometry, with UV (0, 0) at the artwork's lower left. */
  geometry: BufferGeometry;
  variant: HerosBrandVariant;
  /** Optional ink color, using the artwork of the front product reference. */
  tint?: ColorRepresentation;
  roughness?: number;
  opacity?: number;
  renderOrder?: number;
};

const ARTWORK_SIZE = 1254;

// Artwork on the approved front photograph, measured from its upper-left corner.
// This product uses the portrait-shaped O and closed shield seen in that photo.
const ARTWORK_BOUNDS = {
  shield: [532, 565, 648, 694],
  wordmark: [503, 797, 664, 840],
} as const;

export const HEROS_BRAND_ASPECT = {
  shield: (648 - 532) / (694 - 565),
  wordmark: (664 - 503) / (840 - 797),
} as const;

/** Lit artwork on a curved surface supplied and positioned by the parent. */
export function HerosBrandDecal({
  geometry,
  variant,
  tint,
  roughness,
  opacity = 1,
  renderOrder = 2,
}: HerosBrandDecalProps) {
  const source = useTexture("/images/heros-product-reference-v2.png");
  const texture = useMemo(() => {
    // useTexture caches its result. Clone before configuring the color space so
    // another consumer cannot change this material's texture interpretation.
    const image = source.clone();
    image.colorSpace = SRGBColorSpace;
    image.flipY = true;
    image.anisotropy = 8;
    image.needsUpdate = true;
    return image;
  }, [source]);

  const material = useMemo(() => {
    const [left, top, right, bottom] = ARTWORK_BOUNDS[variant];
    const crop = new Vector4(
      left / ARTWORK_SIZE,
      1 - bottom / ARTWORK_SIZE,
      (right - left) / ARTWORK_SIZE,
      (bottom - top) / ARTWORK_SIZE,
    );
    const ink = new MeshStandardMaterial({
      map: texture,
      color: tint ?? (variant === "wordmark" ? "#e9769e" : "#e75686"),
      roughness: roughness ?? (variant === "wordmark" ? 0.65 : 0.32),
      metalness: variant === "shield" ? 0.22 : 0,
      opacity,
      transparent: true,
      alphaTest: 0.02,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    ink.onBeforeCompile = (shader) => {
      shader.uniforms.herosCrop = { value: crop };
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_pars_fragment>",
        `#include <map_pars_fragment>
uniform vec4 herosCrop;`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `#ifdef USE_MAP
  vec2 brandUv = herosCrop.xy + vMapUv * herosCrop.zw;
  // The sRGB texture is decoded by Three/WebGL before lighting is applied.
  vec4 artwork = texture2D(map, brandUv);
  float pinkChroma = artwork.r - artwork.g;
  // Separate the saturated printed artwork from the pastel plastic behind it.
  // Use ink reflectance, not the photograph's baked-in highlights and shadows.
  float inkAlpha = smoothstep(0.405, 0.575, pinkChroma) * artwork.a;
  diffuseColor.a *= inkAlpha;
#endif`,
      );
    };
    // Crops and tint mode are uniforms, so all variants share one program.
    ink.customProgramCacheKey = () => "heros-reference-brand-v3";
    return ink;
  }, [texture, variant, tint, roughness, opacity]);

  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh geometry={geometry} material={material} renderOrder={renderOrder} />
  );
}

export default HerosBrandDecal;
