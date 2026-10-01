import {
  BufferGeometry,
  CatmullRomCurve3,
  Curve,
  Float32BufferAttribute,
  Euler,
  Vector3,
} from "three";

// Model units are 20 mm. Width/height follow the 38 × 62 mm product dimensions;
// the 22.4 mm visual depth is inferred from the supplied side-view reference.
export const BODY = { x: 0.95, y: 1.55, z: 0.56, exponent: 2.65, fullness: 2.4 } as const;
const TAU = Math.PI * 2;
const signedPower = (x: number, p: number) => Math.sign(x) * Math.abs(x) ** p;

export function bodyRadius(x: number, y: number) {
  return (Math.abs(x / BODY.x) ** BODY.exponent + Math.abs(y / BODY.y) ** BODY.exponent) ** (1 / BODY.exponent);
}

export function bodyFront(x: number, y: number) {
  return BODY.z * Math.max(0, 1 - bodyRadius(x, y) ** BODY.fullness) ** (1 / BODY.fullness);
}

export function bodyContour(angle: number, radius = 1, z = 0) {
  return new Vector3(
    BODY.x * radius * signedPower(Math.cos(angle), 2 / BODY.exponent),
    BODY.y * radius * signedPower(Math.sin(angle), 2 / BODY.exponent),
    z,
  );
}

/** A closed pillow surface: curvature across the entire front AND rear. */
export function createBodyGeometry() {
  const positions: number[] = [], normals: number[] = [], uvs: number[] = [], indices: number[] = [];
  const rows = 64, columns = 128;
  for (let row = 0; row <= rows; row++) {
    const phi = row / rows * Math.PI;
    const radius = Math.sin(phi) ** (2 / BODY.fullness);
    for (let col = 0; col <= columns; col++) {
      const point = bodyContour(col / columns * TAU, radius, BODY.z * signedPower(Math.cos(phi), 2 / BODY.fullness));
      positions.push(...point.toArray());
      const factor = radius > 1e-8 ? radius ** (BODY.fullness - BODY.exponent) : 0;
      const normal = new Vector3(
        factor * signedPower(point.x / BODY.x, BODY.exponent - 1) / BODY.x,
        factor * signedPower(point.y / BODY.y, BODY.exponent - 1) / BODY.y,
        signedPower(point.z / BODY.z, BODY.fullness - 1) / BODY.z,
      ).normalize();
      normals.push(...normal.toArray());
      uvs.push(col / columns, row / rows);
      if (row < rows && col < columns) {
        const a = row * (columns + 1) + col, b = a + columns + 1;
        if (row > 0) indices.push(a, b, a + 1);
        if (row < rows - 1) indices.push(b, b + 1, a + 1);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

export class OutlineCurve extends Curve<Vector3> {
  radius: number;
  z: number;
  constructor(radius: number, z: number) {
    super();
    this.radius = radius;
    this.z = z;
  }
  getPoint(t: number, target = new Vector3()) {
    return target.copy(bodyContour(t * TAU, this.radius, this.z));
  }
}

/** Subdivided labels follow the surface rather than hovering on a flat card. */
export function createSurfacePatch(width: number, height: number, centerX: number, centerY: number, surface: (x: number, y: number) => number) {
  const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
  const columns = 32, rows = 24;
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= columns; col++) {
      const u = col / columns, v = row / rows;
      const x = centerX + (u - 0.5) * width, y = centerY + (v - 0.5) * height;
      positions.push(x, y, surface(x, y));
      uvs.push(u, v);
      if (row < rows && col < columns) {
        const a = row * (columns + 1) + col, b = a + columns + 1;
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export const BUTTON_Y = -0.06;
export const BUTTON_FACE_RADIUS = 0.485;
export const BUTTON_BASE_Z = 0.605;
export function buttonFront(x: number, y: number) {
  return BUTTON_BASE_Z + 0.028 * Math.max(0, 1 - (x * x + (y - BUTTON_Y) ** 2) / BUTTON_FACE_RADIUS ** 2);
}

export function createButtonFace() {
  const positions = [0, BUTTON_Y, buttonFront(0, BUTTON_Y)], uvs = [0.5, 0.5], indices: number[] = [];
  const rows = 16, columns = 96;
  for (let row = 1; row <= rows; row++) {
    const radius = row / rows * BUTTON_FACE_RADIUS;
    for (let col = 0; col <= columns; col++) {
      const angle = col / columns * TAU, x = radius * Math.cos(angle), y = radius * Math.sin(angle);
      positions.push(x, y + BUTTON_Y, buttonFront(x, y + BUTTON_Y));
      uvs.push(x + 0.5, y + 0.5);
      if (row === 1 && col < columns) indices.push(0, 1 + col, 2 + col);
      if (row > 1 && col < columns) {
        const a = 1 + (row - 2) * (columns + 1) + col, b = a + columns + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export const CHAIN_AXIS = new Vector3(0.91, -0.4146, 0).normalize();
const CHAIN_UP = new Vector3(-CHAIN_AXIS.y, CHAIN_AXIS.x, 0);
// A shallow articulated arch keeps the large center ring above the shoulder.
// Each crosswise connector follows the line between its two neighboring rings.
export const CHAIN = [
  { position: [0.015, 1.825, 0], radius: 0.29, ellipseY: 0.19, tube: 0.028, perpendicular: false },
  { position: [0.3004, 1.7993, 0], radius: 0.17, tube: 0.027, perpendicular: true },
  { position: [0.6492, 1.7679, 0], radius: 0.255, tube: 0.029, perpendicular: false },
  { position: [0.8749, 1.5422, 0], radius: 0.17, tube: 0.026, perpendicular: true },
  { position: [1.0751, 1.3421, 0], radius: 0.215, tube: 0.028, perpendicular: false },
] as const;

export function chainCenter(index: number) {
  return new Vector3(...CHAIN[index].position);
}

export class LinkCurve extends Curve<Vector3> {
  index: number;
  constructor(index: number) { super(); this.index = index; }
  getPoint(t: number, target = new Vector3()) {
    const link = CHAIN[this.index];
    if ("ellipseY" in link) {
      return target.copy(chainCenter(this.index)).add(new Vector3(
        Math.cos(t * TAU) * link.radius,
        Math.sin(t * TAU) * link.ellipseY,
        0,
      ));
    }
    const axis = link.perpendicular
      ? chainCenter(this.index + 1).sub(chainCenter(this.index - 1)).normalize()
      : CHAIN_AXIS;
    const v = link.perpendicular ? new Vector3(0, 0, 1) : CHAIN_UP;
    return target.copy(chainCenter(this.index))
      .addScaledVector(axis, Math.cos(t * TAU) * link.radius)
      .addScaledVector(v, Math.sin(t * TAU) * link.radius);
  }
}

export const LINK_BAND = { index: 3, width: 0.09, depth: 0.026 } as const;

function roundedRectangleSection(width: number, thickness: number) {
  const section: [number, number][] = [];
  const bevel = Math.min(thickness * 0.32, 0.014);
  for (const [cx, cy, start] of [
    [width / 2 - bevel, thickness / 2 - bevel, 0],
    [-width / 2 + bevel, thickness / 2 - bevel, Math.PI / 2],
    [-width / 2 + bevel, -thickness / 2 + bevel, Math.PI],
    [width / 2 - bevel, -thickness / 2 + bevel, Math.PI * 1.5],
  ]) {
    for (let j = 0; j <= 3; j++) {
      const theta = start + j / 3 * Math.PI / 2;
      section.push([cx + bevel * Math.cos(theta), cy + bevel * Math.sin(theta)]);
    }
  }
  return section;
}

/** A rolled metal bail: a broad strip normal to the ring plane, with thin rounded edges. */
export function createLinkBandGeometry(index: number, width: number = LINK_BAND.width) {
  const curve = new LinkCurve(index), center = chainCenter(index);
  const radialAtStart = curve.getPoint(0).sub(center).normalize();
  const planeNormal = radialAtStart.clone().cross(curve.getTangent(0)).normalize();
  const section = roundedRectangleSection(width, LINK_BAND.depth);
  const segments = 128, count = section.length;
  const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const point = curve.getPoint(i / segments), radial = point.clone().sub(center).normalize();
    for (let j = 0; j <= count; j++) {
      const [across, depth] = section[j % count];
      const vertex = point.clone().addScaledVector(planeNormal, across).addScaledVector(radial, depth);
      positions.push(...vertex.toArray());
      uvs.push(j / count, i / segments);
      if (i < segments && j < count) {
        const a = i * (count + 1) + j, b = a + count + 1;
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// Ribbon local coordinates: x across its width, y downward, z through the loop.
// The top return captures the bottom of the final ring; both runs stay outside the shell.
export const STRAP = {
  position: [1.13, 1.18, 0] as [number, number, number],
  angle: 0.34,
  yaw: -0.4,
  width: 0.47,
  thickness: 0.045,
  length: 3.05,
};

export const TAB = { width: 0.36, thickness: 0.052 };

export function strapWidthAt(y: number) {
  const t = Math.max(0, Math.min(1, (-y + 0.03) / 0.48));
  return 0.265 + (STRAP.width - 0.265) * t * t * (3 - 2 * t);
}

export const strapCurve = new CatmullRomCurve3([
  new Vector3(0, 0.20, 0),
  new Vector3(0, 0.06, 0.125),
  new Vector3(0, -0.40, 0.185),
  new Vector3(0, -1.34, 0.20),
  new Vector3(0, -2.46, 0.15),
  new Vector3(0, -2.81, 0.02),
  new Vector3(0, -2.66, -0.17),
  new Vector3(0, -1.56, -0.25),
  new Vector3(0, -0.42, -0.18),
  new Vector3(0, 0.07, -0.11),
], true, "centripetal");

export function strapToWorld(point: Vector3) {
  return point.clone().applyEuler(new Euler(0, STRAP.yaw, STRAP.angle)).add(new Vector3(...STRAP.position));
}

/** Rounded rectangular ribbon section, swept in the yz plane, with real thickness. */
export function createRibbonGeometry(curve: Curve<Vector3>, width: number, thickness: number, segments = 200, widthAt?: (y: number) => number) {
  const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
  const section = roundedRectangleSection(width, thickness);
  const count = section.length;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments, p = curve.getPointAt(t), tangent = curve.getTangentAt(t);
    const normal = new Vector3(0, -tangent.z, tangent.y).normalize();
    for (let j = 0; j <= count; j++) {
      const [x, n] = section[j % count];
      positions.push(p.x + x * (widthAt ? widthAt(p.y) / width : 1), p.y + normal.y * n, p.z + normal.z * n);
      uvs.push(j / count, t * 8);
      if (i < segments && j < count) {
        const a = i * (count + 1) + j, b = a + count + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export class RibbonEdgeCurve extends Curve<Vector3> {
  source: Curve<Vector3>;
  x: number;
  lift: number;
  tapered: boolean;
  constructor(source: Curve<Vector3>, x: number, lift: number, tapered = false) {
    super(); this.source = source; this.x = x; this.lift = lift; this.tapered = tapered;
  }
  getPoint(t: number, target = new Vector3()) {
    const tangent = this.source.getTangentAt(t);
    const center = this.source.getPointAt(t);
    const x = this.tapered ? Math.sign(this.x) * (Math.abs(this.x) - (STRAP.width - strapWidthAt(center.y)) / 2) : this.x;
    return target.copy(center).add(new Vector3(x, tangent.z * this.lift, -tangent.y * this.lift));
  }
}

export const topTabCurve = new CatmullRomCurve3([
  new Vector3(0.01, 1.40, -0.18),
  new Vector3(0.01, 1.47, -0.10),
  new Vector3(0.01, 1.60, -0.14),
  new Vector3(0.01, 1.82, -0.24),
  new Vector3(0.01, 1.97, 0.15),
  new Vector3(0.01, 2.17, 0.10),
  new Vector3(0.01, 2.31, -0.20),
  new Vector3(0.01, 2.08, -0.43),
  new Vector3(0.01, 1.64, -0.34),
  new Vector3(0.01, 1.47, -0.27),
], true, "centripetal");
