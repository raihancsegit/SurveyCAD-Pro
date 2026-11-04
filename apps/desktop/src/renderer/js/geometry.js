/**
 * Land Survey CAD - Geometry & Spatial Math Engine
 * Shoelace area formula, perimeter, centroid, RDP simplification, angles, bearing & snapping
 */

(function(global) {
  'use strict';

  const Geometry = {
    /**
     * Calculates Shoelace polygon area (in square units of the vertices coordinates)
     */
    calculateShoelaceArea: function(vertices) {
      if (!vertices || vertices.length < 3) return 0;
      let area = 0;
      const n = vertices.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += vertices[i].x * vertices[j].y;
        area -= vertices[j].x * vertices[i].y;
      }
      return Math.abs(area) / 2;
    },

    /**
     * Calculates Polygon Perimeter
     */
    calculatePerimeter: function(vertices) {
      if (!vertices || vertices.length < 2) return 0;
      let perimeter = 0;
      const n = vertices.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const dx = vertices[j].x - vertices[i].x;
        const dy = vertices[j].y - vertices[i].y;
        perimeter += Math.sqrt(dx * dx + dy * dy);
      }
      return perimeter;
    },

    /**
     * Calculates Polygon Centroid
     */
    calculateCentroid: function(vertices) {
      if (!vertices || vertices.length === 0) return { x: 0, y: 0 };
      if (vertices.length < 3) {
        let sx = 0, sy = 0;
        vertices.forEach(v => { sx += v.x; sy += v.y; });
        return { x: sx / vertices.length, y: sy / vertices.length };
      }

      let cx = 0, cy = 0, signedArea = 0;
      const n = vertices.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const cross = (vertices[i].x * vertices[j].y) - (vertices[j].x * vertices[i].y);
        signedArea += cross;
        cx += (vertices[i].x + vertices[j].x) * cross;
        cy += (vertices[i].y + vertices[j].y) * cross;
      }
      signedArea *= 0.5;
      if (Math.abs(signedArea) < 1e-6) {
        let sx = 0, sy = 0;
        vertices.forEach(v => { sx += v.x; sy += v.y; });
        return { x: sx / n, y: sy / n };
      }
      return {
        x: cx / (6 * signedArea),
        y: cy / (6 * signedArea)
      };
    },

    /**
     * Check if a point is inside a polygon (Ray Casting Algorithm)
     */
    isPointInPolygon: function(pt, vs) {
      if (!vs || vs.length < 3) return false;
      let inside = false;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i].x, yi = vs[i].y;
        const xj = vs[j].x, yj = vs[j].y;
        const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
          (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    },

    /**
     * Perpendicular distance from point to line segment
     */
    perpendicularDistance: function(pt, lineStart, lineEnd) {
      const dx = lineEnd.x - lineStart.x;
      const dy = lineEnd.y - lineStart.y;
      const mag = Math.sqrt(dx * dx + dy * dy);
      if (mag === 0) {
        const px = pt.x - lineStart.x;
        const py = pt.y - lineStart.y;
        return Math.sqrt(px * px + py * py);
      }
      const u = ((pt.x - lineStart.x) * dx + (pt.y - lineStart.y) * dy) / (mag * mag);
      const clampedU = Math.max(0, Math.min(1, u));
      const projX = lineStart.x + clampedU * dx;
      const projY = lineStart.y + clampedU * dy;
      const dpx = pt.x - projX;
      const dpy = pt.y - projY;
      return Math.sqrt(dpx * dpx + dpy * dpy);
    },

    /**
     * Ramer-Douglas-Peucker (RDP) Simplification
     */
    simplifyRDP: function(points, epsilon) {
      if (!points || points.length <= 2) return points || [];
      let dmax = 0;
      let index = 0;
      const end = points.length - 1;

      for (let i = 1; i < end; i++) {
        const d = this.perpendicularDistance(points[i], points[0], points[end]);
        if (d > dmax) {
          index = i;
          dmax = d;
        }
      }

      if (dmax > epsilon) {
        const rec1 = this.simplifyRDP(points.slice(0, index + 1), epsilon);
        const rec2 = this.simplifyRDP(points.slice(index), epsilon);
        return rec1.slice(0, rec1.length - 1).concat(rec2);
      }
      return [points[0], points[end]];
    },

    /**
     * Calculate Interior Angle at vertex pB (pA -> pB -> pC)
     */
    calculateInteriorAngle: function(pA, pB, pC) {
      const v1x = pA.x - pB.x;
      const v1y = pA.y - pB.y;
      const v2x = pC.x - pB.x;
      const v2y = pC.y - pB.y;

      const dot = v1x * v2x + v1y * v2y;
      const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
      const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

      if (mag1 === 0 || mag2 === 0) return 180;
      const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
      return ((Math.acos(cosTheta) * 180) / Math.PI).toFixed(1);
    },

    /**
     * Calculate Compass Bearing
     */
    calculateBearing: function(p1, p2) {
      const dx = p2.x - p1.x;
      const dy = -(p2.y - p1.y); // Canvas Y inverted
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
  };

  global.LSCAD = global.LSCAD || {};
  global.LSCAD.Geometry = Geometry;

})(typeof window !== 'undefined' ? window : this);
