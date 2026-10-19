/**
 * Boundary Closure & Topology Gap Validator
 */

import { Point2D, distanceBetween } from '../geometry/point';

export interface ClosureValidationResult {
  isClosed: boolean;
  gapDistance: number;
  startPoint: Point2D | null;
  endPoint: Point2D | null;
  message: string;
}

export function validateBoundaryClosure(
  points: Point2D[],
  tolerance: number = 0.5
): ClosureValidationResult {
  if (points.length < 3) {
    return {
      isClosed: false,
      gapDistance: 0,
      startPoint: points[0] || null,
      endPoint: points[points.length - 1] || null,
      message: 'At least 3 vertices required to form a closed plot boundary'
    };
  }

  const pFirst = points[0];
  const pLast = points[points.length - 1];
  const gap = distanceBetween(pFirst, pLast);

  if (gap <= tolerance) {
    return {
      isClosed: true,
      gapDistance: Number(gap.toFixed(4)),
      startPoint: pFirst,
      endPoint: pLast,
      message: 'Plot boundary is perfectly closed'
    };
  }

  return {
    isClosed: false,
    gapDistance: Number(gap.toFixed(4)),
    startPoint: pFirst,
    endPoint: pLast,
    message: `Open boundary detected. Gap of ${gap.toFixed(2)} units between start and end point.`
  };
}
