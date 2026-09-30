import {
  BufferGeometry,
  Curve,
  DataTexture,
  Float32BufferAttribute,
  LinearFilter,
  LinearMipmapLinearFilter,
  NoColorSpace,
  RedFormat,
  RepeatWrapping,
  TubeGeometry,
  UnsignedByteType,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const wrap = (value: number, period: number) => ((value % period) + period) % period;
const smoothstep = (start: number, end: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};

// An integer hash avoids a random texture change between renders and machines.
function noise(x: number, y: number, seed = 0) {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function heightTexture(data: Uint8Array, size: number, name: string) {
  const texture = new DataTexture(data, size, size, RedFormat, UnsignedByteType);
  texture.name = name;
  texture.colorSpace = NoColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/** Fine embossed leather, with rounded grains separated by shallow creases. */
export function createLeatherGrain(): DataTexture {
  const size = 512;
  const cells = 48;
  const data = new Uint8Array(size * size);
  const seeds = Array.from({ length: cells * cells }, (_, i) => {
    const x = i % cells;
    const y = Math.floor(i / cells);
    return [0.15 + noise(x, y, 17) * 0.7, 0.15 + noise(x, y, 39) * 0.7, noise(x, y, 73)];
  });

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size * cells;
      const v = y / size * cells;
      const cellX = Math.floor(u);
      const cellY = Math.floor(v);
      let nearest = Infinity;
      let second = Infinity;
      let grainHeight = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const sx = cellX + dx;
          const sy = cellY + dy;
          const seed = seeds[wrap(sy, cells) * cells + wrap(sx, cells)];
          const distance = (sx + seed[0] - u) ** 2 + (sy + seed[1] - v) ** 2;
          if (distance < nearest) {
            second = nearest;
            nearest = distance;
            grainHeight = seed[2];
          } else if (distance < second) {
            second = distance;
          }
        }
      }
      // The difference between two distances produces connected fine creases,
      // unlike independent white noise which reads as coarse sand or glitter.
      const boundary = Math.sqrt(second) - Math.sqrt(nearest);
      const crown = smoothstep(0.015, 0.21, boundary);
      const pore = (noise(x, y, 101) - 0.5) * 4;
      const value = 122 + crown * (39 + grainHeight * 9) - Math.min(nearest, 1) * 5 + pore;
      data[y * size + x] = Math.round(value);
    }
  }

  const texture = heightTexture(data, size, "Heros fine leather grain");
  // Ribbon UVs wrap the section once and run eight times along the loop.
  texture.repeat.set(1, 0.4);
  texture.userData.recommendedBumpScale = 0.0025;
  return texture;
}

/** Low-amplitude microtexture: the housing still reads as smooth satin plastic. */
export function createShellGrain(): DataTexture {
  const size = 256;
  const data = new Uint8Array(size * size);
  const sample = (x: number, y: number) => noise(wrap(x, size), wrap(y, size), 157);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // A small, periodic smoothing kernel softens the random pixel slopes.
      const soft = sample(x, y) * 0.5
        + (sample(x - 1, y) + sample(x + 1, y) + sample(x, y - 1) + sample(x, y + 1)) * 0.125;
      data[y * size + x] = Math.round(128 + (soft - 0.5) * 14);
    }
  }
  const texture = heightTexture(data, size, "Heros satin shell microtexture");
  texture.repeat.set(4, 4);
  texture.userData.recommendedBumpScale = 0.00045;
  return texture;
}

class ThreadDashCurve extends Curve<Vector3> {
  source: Curve<Vector3>;
  start: number;
  end: number;

  constructor(source: Curve<Vector3>, start: number, end: number) {
    super();
    this.source = source;
    this.start = start;
    this.end = end;
  }

  getPoint(t: number, target = new Vector3()) {
    const u = this.start + (this.end - this.start) * t;
    const tangent = this.source.getTangentAt(u);
    const outward = new Vector3(0, tangent.z, -tangent.y).normalize();
    // Each end enters the leather; only the middle arches above its surface.
    return this.source.getPointAt(u, target).addScaledVector(outward, Math.sin(t * Math.PI) * 0.0018);
  }
}

/** Actual sewn thread dashes, merged into one mesh without material groups. */
export function createThreadGeometry(curve: Curve<Vector3>, spacing = 0.06): BufferGeometry {
  if (!Number.isFinite(spacing) || spacing <= 0) {
    throw new RangeError("Thread spacing must be a positive finite number.");
  }
  const count = Math.floor(curve.getLength() / spacing);
  if (count === 0) {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute([], 3));
    geometry.setAttribute("normal", new Float32BufferAttribute([], 3));
    geometry.setAttribute("uv", new Float32BufferAttribute([], 2));
    return geometry;
  }

  const dashes: TubeGeometry[] = [];
  try {
    for (let i = 0; i < count; i++) {
      const dash = new ThreadDashCurve(curve, (i + 0.25) / count, (i + 0.75) / count);
      dashes.push(new TubeGeometry(dash, 6, 0.003, 5, false));
    }
    const geometry = mergeGeometries(dashes, false);
    if (!geometry) throw new Error("Unable to merge the Heros thread geometry.");
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
  } finally {
    dashes.forEach((geometry) => geometry.dispose());
  }
}
