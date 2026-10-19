/**
 * Plot Boundary Operations Engine
 * Offset (Setback), Slicing (Partition), and Simplification
 */

import { Point2D, distanceBetween } from './point';
import { computePolygonMetrics } from './polygon';

/**
 * Ramer-Douglas-Peucker (RDP) Polyline Simplification
 */
export function perpendicularDistance(
  pt: Point2D,
  lineStart: Point2D,
  lineEnd: Point2D
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) return distanceBetween(pt, lineStart);
  const u = ((pt.x - lineStart.x) * dx + (pt.y - lineStart.y) * dy) / (mag * mag);
  const clampedU = Math.max(0, Math.min(1, u));
  const projX = lineStart.x + clampedU * dx;
  const projY = lineStart.y + clampedU * dy;
  return distanceBetween(pt, { x: projX, y: projY });
}

export function simplifyRDP(points: Point2D[], epsilon: number): Point2D[] {
  if (points.length <= 2) return points;
  let dmax = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const rec1 = simplifyRDP(points.slice(0, index + 1), epsilon);
    const rec2 = simplifyRDP(points.slice(index), epsilon);
    return rec1.slice(0, rec1.length - 1).concat(rec2);
  }
  return [points[0], points[end]];
}

/**
 * Calculate Interior Angle at vertex pB formed by pA -> pB -> pC (in degrees)
 */
export function calculateInteriorAngle(pA: Point2D, pB: Point2D, pC: Point2D): number {
  const v1x = pA.x - pB.x;
  const v1y = pA.y - pB.y;
  const v2x = pC.x - pB.x;
  const v2y = pC.y - pB.y;

  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

  if (mag1 === 0 || mag2 === 0) return 180;
  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Number(((Math.acos(cosTheta) * 180) / Math.PI).toFixed(1));
}

/**
 * Calculate Compass Bearing from p1 to p2 (0-360 degrees, 0 = North, 90 = East)
 */
export function calculateBearing(p1: Point2D, p2: Point2D): string {
  const dx = p2.x - p1.x;
  const dy = -(p2.y - p1.y); // Canvas Y is inverted
  let deg = (Math.atan2(dx, dy) * 180) / Math.PI;
  if (deg < 0) deg += 360;

  const degVal = deg.toFixed(1);
  if (deg >= 337.5 || deg < 22.5) return `N ${degVal}°`;
  if (deg >= 22.5 && deg < 67.5) return `NE ${degVal}°`;
  if (deg >= 67.5 && deg < 112.5) return `E ${degVal}°`;
  if (deg >= 112.5 && deg < 157.5) return `SE ${degVal}°`;
  if (deg >= 157.5 && deg < 202.5) return `S ${degVal}°`;
  if (deg >= 202.5 && deg < 247.5) return `SW ${degVal}°`;
  if (deg >= 247.5 && deg < 292.5) return `W ${degVal}°`;
  return `NW ${degVal}°`;
}

/**
 * Check if a point is strictly inside or on the edge of a polygon
 */
export function isPointInPolygon(pt: Point2D, vs: Point2D[]): boolean {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].x, yi = vs[i].y;
    const xj = vs[j].x, yj = vs[j].y;
    const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
      (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Line Segment - Polygon Intersection Finder
 */
export function findLineIntersection(
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  p4: Point2D
): Point2D | null {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (Math.abs(d) < 1e-9) return null;

  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;

  if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
    return {
      x: p1.x + u * (p2.x - p1.x),
      y: p1.y + u * (p2.y - p1.y)
    };
  }
  return null;
}
