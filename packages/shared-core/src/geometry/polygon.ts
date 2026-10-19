/**
 * Polygon Geometry & Shoelace Area Engine
 */

import { Point2D, distanceBetween } from './point';

export interface PolygonMetrics {
  areaSqUnits: number;
  perimeter: number;
  centroid: Point2D;
  isClockwise: boolean;
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

/**
 * Calculates Shoelace polygon area, perimeter, and centroid
 */
export function computePolygonMetrics(vertices: Point2D[]): PolygonMetrics {
  const n = vertices.length;
  if (n < 3) {
    return {
      areaSqUnits: 0,
      perimeter: 0,
      centroid: vertices[0] || { x: 0, y: 0 },
      isClockwise: false,
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    };
  }

  let signedAreaSum = 0;
  let cxSum = 0;
  let cySum = 0;
  let perimeter = 0;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < n; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % n];

    // Bounding Box
    if (p1.x < minX) minX = p1.x;
    if (p1.y < minY) minY = p1.y;
    if (p1.x > maxX) maxX = p1.x;
    if (p1.y > maxY) maxY = p1.y;

    // Shoelace cross product
    const cross = (p1.x * p2.y) - (p2.x * p1.y);
    signedAreaSum += cross;

    cxSum += (p1.x + p2.x) * cross;
    cySum += (p1.y + p2.y) * cross;

    // Perimeter
    perimeter += distanceBetween(p1, p2);
  }

  const area = Math.abs(signedAreaSum) / 2;
  const isClockwise = signedAreaSum < 0;

  let centroid: Point2D;
  if (signedAreaSum === 0) {
    centroid = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  } else {
    centroid = {
      x: cxSum / (3 * signedAreaSum),
      y: cySum / (3 * signedAreaSum)
    };
  }

  return {
    areaSqUnits: Number(area.toFixed(4)),
    perimeter: Number(perimeter.toFixed(4)),
    centroid,
    isClockwise,
    boundingBox: { minX, minY, maxX, maxY }
  };
}
