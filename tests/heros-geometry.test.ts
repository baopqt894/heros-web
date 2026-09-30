import { test } from "node:test";
import assert from "node:assert/strict";
import { Triangle, TubeGeometry, Vector3, type BufferGeometry, type Curve } from "three";
import {
  BODY,
  CHAIN,
  LINK_BAND,
  STRAP,
  TAB,
  LinkCurve,
  bodyFront,
  createBodyGeometry,
  createLinkBandGeometry,
  createRibbonGeometry,
  strapCurve,
  strapToWorld,
  strapWidthAt,
  topTabCurve,
} from "../src/app/heros-geometry.ts";

function shellLevel(point: Vector3) {
  const radius = (
    Math.abs(point.x / BODY.x) ** BODY.exponent
    + Math.abs(point.y / BODY.y) ** BODY.exponent
  ) ** (1 / BODY.exponent);
  return radius ** BODY.fullness + Math.abs(point.z / BODY.z) ** BODY.fullness;
}

function vertices(geometry: BufferGeometry) {
  const positions = geometry.getAttribute("position");
  return Array.from({ length: positions.count }, (_, i) => new Vector3().fromBufferAttribute(positions, i));
}

function triangles(geometry: BufferGeometry, toWorld = (point: Vector3) => point) {
  const points = vertices(geometry).map(toWorld), indices = geometry.getIndex()!;
  return Array.from({ length: indices.count / 3 }, (_, i) => new Triangle(
    points[indices.getX(i * 3)], points[indices.getX(i * 3 + 1)], points[indices.getX(i * 3 + 2)],
  ));
}

function distanceToTriangles(points: Vector3[], faces: Triangle[]) {
  const nearest = new Vector3();
  let distance = Infinity;
  for (const point of points) {
    for (const face of faces) {
      face.closestPointToPoint(point, nearest);
      distance = Math.min(distance, nearest.distanceTo(point));
    }
  }
  return distance;
}

function sampleLink(index: number, samples = 256) {
  const curve = new LinkCurve(index);
  // Arc-length spacing keeps the bound applicable to oval links as well as
  // circles. Allow a small margin for the curve's numerical length estimate.
  curve.arcLengthDivisions = 4096;
  return { points: curve.getSpacedPoints(samples), samplingBound: curve.getLength() * 1.001 / (2 * samples) };
}

// Midpoint quadrature of Gauss's linking integral: a threaded closed pair has
// linking number ±1; overlapping projections or floating circles still give 0.
function linkingNumber(first: Vector3[], second: Vector3[]) {
  const segments = (points: Vector3[]) => points.slice(1).map((point, i) => ({
    center: point.clone().add(points[i]).multiplyScalar(0.5),
    delta: point.clone().sub(points[i]),
  }));
  const firstSegments = segments(first), secondSegments = segments(second);
  const separation = new Vector3(), cross = new Vector3();
  let integral = 0;
  for (const firstSegment of firstSegments) {
    for (const secondSegment of secondSegments) {
      separation.subVectors(firstSegment.center, secondSegment.center);
      cross.crossVectors(firstSegment.delta, secondSegment.delta);
      integral += separation.dot(cross) / separation.length() ** 3;
    }
  }
  return integral / (4 * Math.PI);
}

test("housing retains product dimensions with curved front and rear surfaces", () => {
  const geometry = createBodyGeometry();
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox!;
  const size = bounds.getSize(new Vector3());
  for (const axis of ["x", "y", "z"] as const) {
    assert.ok(Math.abs(size[axis] - 2 * BODY[axis]) < 1e-6, `${axis} dimension`);
    assert.ok(Math.abs(bounds.min[axis] + bounds.max[axis]) < 1e-6, `${axis} symmetry`);
  }
  for (const point of vertices(geometry)) {
    assert.ok(Math.abs(shellLevel(point) - 1) < 1e-5, "every vertex lies on the curved housing");
  }
  // The face must bow smoothly from its center, rather than being an extruded
  // flat panel whose only curvature occurs at the perimeter bevel.
  for (const axis of ["x", "y"] as const) {
    const depths = [0, 0.25, 0.5, 0.75, 0.95].map((fraction) =>
      bodyFront(axis === "x" ? BODY.x * fraction : 0, axis === "y" ? BODY.y * fraction : 0));
    for (let i = 1; i < depths.length; i++) {
      assert.ok(depths[i] < depths[i - 1] - 0.005, `${axis}: curvature extends across the face`);
    }
  }
  geometry.dispose();
});

test("housing normals and triangle winding point outwards on both halves", () => {
  const geometry = createBodyGeometry();
  const points = vertices(geometry), normals = geometry.getAttribute("normal");
  const normal = new Vector3(), edge = new Vector3(), faceNormal = new Vector3(), center = new Vector3();
  for (let i = 0; i < points.length; i++) {
    normal.fromBufferAttribute(normals, i);
    assert.ok(Math.abs(normal.length() - 1) < 1e-5, "finite unit vertex normal");
    assert.ok(normal.dot(points[i]) > 0, "vertex normal faces away from the housing center");
  }
  const indices = geometry.getIndex()!;
  for (let i = 0; i < indices.count; i += 3) {
    const a = points[indices.getX(i)], b = points[indices.getX(i + 1)], c = points[indices.getX(i + 2)];
    faceNormal.subVectors(b, a).cross(edge.subVectors(c, a));
    center.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    assert.ok(faceNormal.dot(center) > 0, "triangle winding must render the exterior with front-face culling");
  }
  geometry.dispose();
});

test("adjacent metal rings are threaded exactly once and other rings remain unlinked", () => {
  const curves = CHAIN.map((_, i) => new LinkCurve(i).getPoints(192));
  for (let i = 0; i < curves.length; i++) {
    for (let j = i + 1; j < curves.length; j++) {
      const expected = j === i + 1 ? 1 : 0;
      const actual = Math.abs(linkingNumber(curves[i], curves[j]));
      assert.ok(Math.abs(actual - expected) < 0.02, `rings ${i}/${j}: linking number ${actual}, expected ${expected}`);
    }
  }
});

test("the top leather loop and wrist strap each capture their end ring", () => {
  const firstLink = new LinkCurve(0).getPoints(256);
  const lastLink = new LinkCurve(CHAIN.length - 1).getPoints(256);
  const topLinking = Math.abs(linkingNumber(firstLink, topTabCurve.getPoints(256)));
  const wristLinking = Math.abs(linkingNumber(lastLink, strapCurve.getPoints(256).map(strapToWorld)));
  assert.ok(Math.abs(topLinking - 1) < 0.02, `top leather loop is not threaded: linking number ${topLinking}`);
  assert.ok(Math.abs(wristLinking - 1) < 0.02, `wrist strap is not threaded: linking number ${wristLinking}`);
});

test("metal links have clearance between their actual tube and band surfaces", () => {
  const curves = CHAIN.map((_, i) => sampleLink(i));
  const band = createLinkBandGeometry(LINK_BAND.index), bandFaces = triangles(band);
  for (let i = 0; i < curves.length; i++) {
    for (let j = i + 1; j < curves.length; j++) {
      if (i === LINK_BAND.index || j === LINK_BAND.index) {
        const tube = i === LINK_BAND.index ? j : i;
        const clearance = distanceToTriangles(curves[tube].points, bandFaces) - CHAIN[tube].tube - curves[tube].samplingBound;
        assert.ok(clearance > 0.005, `band/ring ${tube}: guaranteed surface gap ${clearance}`);
        continue;
      }
      let sampledDistance = Infinity;
      for (const first of curves[i].points) {
        for (const second of curves[j].points) sampledDistance = Math.min(sampledDistance, first.distanceTo(second));
      }
      // Subtract a bound on the distance from any point on either link to
      // its nearest sample, so passing proves clearance between samples too.
      const samplingBound = curves[i].samplingBound + curves[j].samplingBound;
      const clearance = sampledDistance - samplingBound - CHAIN[i].tube - CHAIN[j].tube;
      assert.ok(clearance > 0.005, `rings ${i}/${j}: guaranteed surface gap ${clearance}`);
    }
  }
  band.dispose();
});

test("the complete wrist ribbon remains outside the device housing", () => {
  const geometry = createRibbonGeometry(strapCurve, STRAP.width, STRAP.thickness, 200, strapWidthAt);
  const points = vertices(geometry).map(strapToWorld);
  let minimum = Infinity;
  for (const point of points) minimum = Math.min(minimum, shellLevel(point));
  const indices = geometry.getIndex()!;
  const center = new Vector3();
  for (let i = 0; i < indices.count; i += 3) {
    center.copy(points[indices.getX(i)]).add(points[indices.getX(i + 1)]).add(points[indices.getX(i + 2)]).multiplyScalar(1 / 3);
    minimum = Math.min(minimum, shellLevel(center));
  }
  assert.ok(minimum > 1.03, `ribbon needs visible separation from the shell; minimum implicit surface level ${minimum}`);
  const bottom = Math.min(...points.map((point) => point.y));
  assert.ok(Math.abs(bottom + BODY.y) < 0.06, `wrist loop should reach the housing base; bottom ${bottom}, housing base ${-BODY.y}`);
  geometry.dispose();
});

test("all metal ring surfaces remain outside the housing shoulder", () => {
  for (let link = 0; link < CHAIN.length; link++) {
    const geometry = link === LINK_BAND.index
      ? createLinkBandGeometry(link)
      : new TubeGeometry(new LinkCurve(link), 192, CHAIN[link].tube, 16, true);
    const minimum = Math.min(...vertices(geometry).map(shellLevel));
    assert.ok(minimum > 1.02, `ring ${link} clips the shell: minimum implicit surface level ${minimum}`);
    geometry.dispose();
  }
});

test("the connector band has a broad thin section with outward-facing surfaces", () => {
  const geometry = createLinkBandGeometry(LINK_BAND.index), curve = new LinkCurve(LINK_BAND.index);
  const points = vertices(geometry), normals = geometry.getAttribute("normal"), uv = geometry.getAttribute("uv");
  const center = new Vector3(...CHAIN[LINK_BAND.index].position);
  const planeNormal = curve.getPoint(0).sub(center).cross(curve.getTangent(0)).normalize();
  const outward = new Vector3(), normal = new Vector3(), radial = new Vector3();
  let minAcross = Infinity, maxAcross = -Infinity, minDepth = Infinity, maxDepth = -Infinity;
  for (let i = 0; i < points.length; i++) {
    const station = curve.getPoint(uv.getY(i));
    outward.subVectors(points[i], station);
    radial.subVectors(station, center).normalize();
    normal.fromBufferAttribute(normals, i);
    assert.ok(Math.abs(normal.length() - 1) < 1e-5, `band vertex ${i}: finite unit normal`);
    assert.ok(normal.dot(outward) > 0, `band vertex ${i}: normal faces into the metal`);
    const across = outward.dot(planeNormal), depth = outward.dot(radial);
    minAcross = Math.min(minAcross, across); maxAcross = Math.max(maxAcross, across);
    minDepth = Math.min(minDepth, depth); maxDepth = Math.max(maxDepth, depth);
  }
  assert.ok(Math.abs(maxAcross - minAcross - LINK_BAND.width) < 1e-6, "band width matches its attachment clearance");
  assert.ok(Math.abs(maxDepth - minDepth - LINK_BAND.depth) < 1e-6, "band remains a thin rolled strip");
  assert.ok(LINK_BAND.width > LINK_BAND.depth * 3, "band must have a visibly flat rather than circular section");
  const indices = geometry.getIndex()!, edge = new Vector3(), faceNormal = new Vector3(), faceCenter = new Vector3();
  for (let i = 0; i < indices.count; i += 3) {
    const a = indices.getX(i), b = indices.getX(i + 1), c = indices.getX(i + 2);
    faceNormal.subVectors(points[b], points[a]).cross(edge.subVectors(points[c], points[a]));
    faceCenter.copy(points[a]).add(points[b]).add(points[c]).multiplyScalar(1 / 3);
    outward.copy(faceCenter).sub(curve.getPoint((uv.getY(a) + uv.getY(b) + uv.getY(c)) / 3));
    assert.ok(faceNormal.dot(outward) > 0, `band triangle ${i / 3}: winding faces into the metal`);
  }
  geometry.dispose();
});

function assertRibbonFacesOutwards(curve: Curve<Vector3>, width: number, thickness: number, widthAt?: (y: number) => number) {
  const segments = 128;
  const geometry = createRibbonGeometry(curve, width, thickness, segments, widthAt);
  const points = vertices(geometry), normals = geometry.getAttribute("normal");
  const sectionSize = points.length / (segments + 1);
  const outward = new Vector3(), normal = new Vector3();
  for (let station = 0; station <= segments; station++) {
    const center = curve.getPointAt(station / segments);
    for (let section = 0; section < sectionSize; section++) {
      const vertex = station * sectionSize + section;
      outward.subVectors(points[vertex], center);
      normal.fromBufferAttribute(normals, vertex);
      assert.ok(normal.dot(outward) > 0, `ribbon vertex ${vertex}: normal faces into the leather`);
    }
  }
  geometry.dispose();
}

test("ribbon surfaces face outwards on the wrist strap and attachment tab", () => {
  assertRibbonFacesOutwards(strapCurve, STRAP.width, STRAP.thickness, strapWidthAt);
  assertRibbonFacesOutwards(topTabCurve, TAB.width, TAB.thickness);
});

test("metal rings do not clip the leather attachment or wrist ribbon", () => {
  const samples = 256;
  const ribbons = [
    { name: "top tab", geometry: createRibbonGeometry(topTabCurve, TAB.width, TAB.thickness, 96), toWorld: (point: Vector3) => point },
    { name: "wrist strap", geometry: createRibbonGeometry(strapCurve, STRAP.width, STRAP.thickness, 200, strapWidthAt), toWorld: strapToWorld },
  ];
  for (const ribbon of ribbons) {
    const faces = triangles(ribbon.geometry, ribbon.toWorld);
    for (let link = 0; link < CHAIN.length; link++) {
      const sampled = sampleLink(link, samples);
      const distance = distanceToTriangles(sampled.points, faces);
      const envelope = link === LINK_BAND.index ? Math.hypot(LINK_BAND.width, LINK_BAND.depth) / 2 : CHAIN[link].tube;
      const clearance = distance - envelope - sampled.samplingBound;
      assert.ok(clearance > 0.003, `${ribbon.name}/ring ${link}: guaranteed metal-to-leather gap ${clearance}`);
    }
    ribbon.geometry.dispose();
  }
});
