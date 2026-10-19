/**
 * Land Survey CAD - Plot Operations & Bangla Formatting Engine
 * Polygon offset, cutting/slicing, Bangla digits & formatting
 */

(function(global) {
  'use strict';

  const PlotOps = {
    /**
     * Convert English digits to Bengali digits
     */
    toBanglaDigits: function(str) {
      if (str === null || str === undefined) return '';
      const bDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return String(str).replace(/[0-9]/g, w => bDigits[+w]);
    },

    /**
     * Format Daag/Plot name cleanly in Bangla
     */
    formatBanglaDaagName: function(input) {
      if (!input) return 'দাগ';
      let clean = String(input).trim()
        .replace(/^(দাগ|প্লট|Plot|Daag)\s*:?\s*/i, '')
        .replace(/\s*\((নির্বাচিত|অটো)\)/g, '');
      if (/^[0-9]+(\/[ক-হa-z0-9]+)?$/i.test(clean)) {
        return 'দাগ ' + this.toBanglaDigits(clean);
      }
      return clean.startsWith('দাগ') ? clean : 'দাগ ' + clean;
    },

    /**
     * Apply boundary setback / offset to a polygon
     */
    applyOffset: function(vertices, offsetDist) {
      if (!vertices || vertices.length < 3) return null;
      const n = vertices.length;
      const offsetVertices = [];

      // Calculate centroid to determine inward/outward direction
      let cx = 0, cy = 0;
      vertices.forEach(v => { cx += v.x; cy += v.y; });
      cx /= n; cy /= n;

      for (let i = 0; i < n; i++) {
        const pPrev = vertices[(i + n - 1) % n];
        const pCurr = vertices[i];
        const pNext = vertices[(i + 1) % n];

        // Edge 1 vector & normal
        const d1x = pCurr.x - pPrev.x;
        const d1y = pCurr.y - pPrev.y;
        const l1 = Math.sqrt(d1x * d1x + d1y * d1y) || 1;
        const n1x = -d1y / l1;
        const n1y = d1x / l1;

        // Edge 2 vector & normal
        const d2x = pNext.x - pCurr.x;
        const d2y = pNext.y - pCurr.y;
        const l2 = Math.sqrt(d2x * d2x + d2y * d2y) || 1;
        const n2x = -d2y / l2;
        const n2y = d2x / l2;

        // Average normal at vertex
        let nx = (n1x + n2x) / 2;
        let ny = (n1y + n2y) / 2;
        const nl = Math.sqrt(nx * nx + ny * ny) || 1;
        nx /= nl; ny /= nl;

        // Check if normal points toward or away from centroid
        const toCentroidX = cx - pCurr.x;
        const toCentroidY = cy - pCurr.y;
        const dot = nx * toCentroidX + ny * toCentroidY;

        // Inward offset
        const sign = dot > 0 ? 1 : -1;
        offsetVertices.push({
          x: pCurr.x + nx * offsetDist * sign,
          y: pCurr.y + ny * offsetDist * sign
        });
      }

      return offsetVertices;
    }
  };

  global.LSCAD = global.LSCAD || {};
  global.LSCAD.PlotOps = PlotOps;

})(typeof window !== 'undefined' ? window : this);
