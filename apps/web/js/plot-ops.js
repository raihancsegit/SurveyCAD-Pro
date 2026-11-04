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
    },

    /**
     * Measure perpendicular distance from point p to line segment a-b
     */
    pointToSegmentDistance: function(p, a, b) {
      const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
      if (l2 === 0) return { dist: Math.hypot(p.x - a.x, p.y - a.y), t: 0, proj: a };
      let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      const proj = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
      return { dist: Math.hypot(p.x - proj.x, p.y - proj.y), t, proj };
    },

    /**
     * Calculate signed polygon area
     */
    polygonArea: function(pts) {
      if (!pts || pts.length < 3) return 0;
      let a = 0;
      for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
      }
      return a / 2;
    },

    /**
     * Ensure polygon points are oriented Counter-Clockwise (CCW)
     */
    ensureCCW: function(pts) {
      const copy = pts.map(p => ({ x: p.x, y: p.y }));
      if (this.polygonArea(copy) < 0) copy.reverse();
      return copy;
    },

    /**
     * Cross-insert vertices where one polygon touches the boundary edges of another
     */
    insertPointsOnEdges: function(poly, otherPoly, tol = 8) {
      const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
      let result = poly.map(p => ({ x: p.x, y: p.y }));

      for (const p of otherPoly) {
        const alreadyExists = result.some(v => dist(v, p) <= tol);
        if (alreadyExists) continue;

        let bestEdge = -1;
        let minD = Infinity;
        let insertPt = null;

        for (let i = 0; i < result.length; i++) {
          const a = result[i];
          const b = result[(i + 1) % result.length];
          const res = this.pointToSegmentDistance(p, a, b);
          if (res.t > 0.01 && res.t < 0.99 && res.dist <= tol && res.dist < minD) {
            minD = res.dist;
            bestEdge = i;
            insertPt = { x: p.x, y: p.y };
          }
        }

        if (bestEdge !== -1) {
          result.splice(bestEdge + 1, 0, insertPt);
        }
      }
      return result;
    },

    /**
     * Check adjacency between two cadastral polygons
     */
    checkPlotsAdjacency: function(polyA, polyB, tol = 8) {
      if (!polyA || !polyB || polyA.length < 3 || polyB.length < 3) {
        return { isAdjacent: false, sharedVertices: 0, sharedLength: 0 };
      }
      const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
      let sharedCount = 0;
      let sharedLength = 0;

      for (let i = 0; i < polyA.length; i++) {
        const p1 = polyA[i];
        const p2 = polyA[(i + 1) % polyA.length];
        
        for (let j = 0; j < polyB.length; j++) {
          const q1 = polyB[j];
          const q2 = polyB[(j + 1) % polyB.length];

          // Check if edges match in opposite or same direction
          if ((dist(p1, q2) <= tol && dist(p2, q1) <= tol) ||
              (dist(p1, q1) <= tol && dist(p2, q2) <= tol)) {
            sharedCount++;
            sharedLength += dist(p1, p2);
            break;
          }
        }
      }

      // Also check vertex-level touching
      let sharedVertexCount = 0;
      for (const p of polyA) {
        if (polyB.some(q => dist(p, q) <= tol)) sharedVertexCount++;
      }

      return {
        isAdjacent: sharedCount > 0 || sharedVertexCount >= 2,
        sharedSegments: sharedCount,
        sharedVertices: sharedVertexCount,
        sharedLength: sharedLength
      };
    },

    /**
     * Module 20: Full Geometric Cadastral Polygon Union
     * Removes shared internal dividing lines/aisles and merges exterior boundaries.
     */
    unionCadastralPlots: function(polyA, polyB, tol = 8) {
      if (!polyA || !polyB || polyA.length < 3 || polyB.length < 3) {
        return { success: false, reason: 'দাগের পয়েন্ট যথেষ্ট নয় (কমপক্ষে ৩টি শীর্ষবিন্দু প্রয়োজন)' };
      }

      const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

      let a = this.ensureCCW(polyA);
      let b = this.ensureCCW(polyB);

      // 1. Cross-insert boundary vertices
      a = this.insertPointsOnEdges(a, b, tol);
      b = this.insertPointsOnEdges(b, a, tol);

      // 2. Snap coincident points
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
          if (dist(a[i], b[j]) <= tol) {
            b[j].x = a[i].x;
            b[j].y = a[i].y;
          }
        }
      }

      // 3. Extract directed edges
      function getEdges(poly) {
        const edges = [];
        for (let i = 0; i < poly.length; i++) {
          edges.push({ p1: poly[i], p2: poly[(i + 1) % poly.length] });
        }
        return edges;
      }

      const edgesA = getEdges(a);
      const edgesB = getEdges(b);

      function isEdgeShared(e1, edgesOther) {
        return edgesOther.some(e2 => 
          (dist(e1.p1, e2.p2) <= tol && dist(e1.p2, e2.p1) <= tol) ||
          (dist(e1.p1, e2.p1) <= tol && dist(e1.p2, e2.p2) <= tol)
        );
      }

      // Filter out shared internal dividing edges
      const exteriorEdges = [];
      let sharedCount = 0;

      for (const e of edgesA) {
        if (isEdgeShared(e, edgesB)) {
          sharedCount++;
        } else {
          exteriorEdges.push(e);
        }
      }

      for (const e of edgesB) {
        if (isEdgeShared(e, edgesA)) {
          sharedCount++;
        } else {
          exteriorEdges.push(e);
        }
      }

      if (sharedCount === 0) {
        return { 
          success: false, 
          reason: 'দাগ দুটি পরস্পর সংলগ্ন বা স্পর্শ করা অবস্থায় নেই (কোনো সাধারণ আইল পাওয়া যায়নি)' 
        };
      }

      // 4. Chain exterior edges into a continuous perimeter loop
      const loop = [];
      let currentEdge = exteriorEdges.shift();
      loop.push(currentEdge.p1);

      let safety = exteriorEdges.length * 3 + 10;
      while (exteriorEdges.length > 0 && safety-- > 0) {
        const target = currentEdge.p2;
        loop.push(target);

        let nextIdx = exteriorEdges.findIndex(e => dist(e.p1, target) <= tol);
        if (nextIdx === -1) {
          nextIdx = exteriorEdges.findIndex(e => dist(e.p2, target) <= tol);
          if (nextIdx !== -1) {
            const tmp = exteriorEdges[nextIdx];
            exteriorEdges[nextIdx] = { p1: tmp.p2, p2: tmp.p1 };
          }
        }

        if (nextIdx === -1) break;
        currentEdge = exteriorEdges.splice(nextIdx, 1)[0];
      }

      // 5. Clean close / consecutive duplicate vertices
      const cleaned = [];
      for (let i = 0; i < loop.length; i++) {
        const pt = loop[i];
        const prev = cleaned[cleaned.length - 1];
        if (!prev || dist(pt, prev) > 0.5) cleaned.push(pt);
      }

      if (cleaned.length > 2 && dist(cleaned[0], cleaned[cleaned.length - 1]) <= tol) {
        cleaned.pop();
      }

      // 6. Collinear simplification along straight aisles
      const simplified = [];
      for (let i = 0; i < cleaned.length; i++) {
        const prev = cleaned[(i - 1 + cleaned.length) % cleaned.length];
        const curr = cleaned[i];
        const next = cleaned[(i + 1) % cleaned.length];

        const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
        const v2 = { x: next.x - curr.x, y: next.y - curr.y };
        const cross = v1.x * v2.y - v1.y * v2.x;
        const l1 = Math.hypot(v1.x, v1.y);
        const l2 = Math.hypot(v2.x, v2.y);

        if (l1 > 0 && l2 > 0 && Math.abs(cross) / (l1 * l2) < 0.001) {
          continue; // Collinear point
        }
        simplified.push(curr);
      }

      const finalVertices = simplified.length >= 3 ? simplified : cleaned;
      const totalArea = Math.abs(this.polygonArea(finalVertices));

      return {
        success: true,
        vertices: finalVertices,
        area: totalArea,
        sharedAislesRemoved: sharedCount
      };
    },

    /**
     * Check whether line segments p1-p2 and p3-p4 intersect
     */
    doSegmentsIntersect: function(p1, p2, p3, p4) {
      function ccw(a, b, c) {
        return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
      }
      return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
    },

    /**
     * Module 21: Comprehensive Boundary Closure & Topology Scanner
     */
    checkTopology: function(plots, tol = 5.0) {
      if (!plots || plots.length === 0) {
        return {
          score: 100,
          totalIssues: 0,
          gaps: [],
          selfIntersections: [],
          duplicates: [],
          collinear: [],
          overlaps: []
        };
      }

      const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const issues = {
        gaps: [],
        selfIntersections: [],
        duplicates: [],
        collinear: [],
        overlaps: []
      };

      plots.forEach((plot, pIdx) => {
        const v = plot.vertices;
        if (!v || v.length < 3) return;

        // 1. Check Unclosed Loop / Boundary Gap
        const first = v[0];
        const last = v[v.length - 1];
        const gapDist = dist(first, last);
        if (gapDist > 0.05 && gapDist <= tol * 4) {
          issues.gaps.push({
            plotId: plot.id,
            plotName: plot.name,
            gapDistance: gapDist,
            point: { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2 },
            message: `${plot.name}: সীমানার শেষ প্রান্তে ${gapDist.toFixed(1)} লিংকের ফাঁকা গ্যাপ (Unclosed Gap)`
          });
        }

        // 2. Check Self-Intersections (Bow-tie / Hourglass polygons)
        for (let i = 0; i < v.length; i++) {
          const p1 = v[i];
          const p2 = v[(i + 1) % v.length];
          for (let j = i + 2; j < v.length; j++) {
            if (i === 0 && j === v.length - 1) continue;
            const p3 = v[j];
            const p4 = v[(j + 1) % v.length];
            if (this.doSegmentsIntersect(p1, p2, p3, p4)) {
              issues.selfIntersections.push({
                plotId: plot.id,
                plotName: plot.name,
                edgeA: [i, (i + 1) % v.length],
                edgeB: [j, (j + 1) % v.length],
                point: { x: (p1.x + p3.x) / 2, y: (p1.y + p3.y) / 2 },
                message: `${plot.name}: বাহু ${i + 1} এবং ${j + 1} পরস্পরের ওপর ক্রস করেছে (Bow-tie/ক্রসিং বাউন্ডারি)`
              });
            }
          }
        }

        // 3. Check Duplicate Vertices (consecutive points < 0.5 links)
        for (let i = 0; i < v.length; i++) {
          const curr = v[i];
          const next = v[(i + 1) % v.length];
          if (dist(curr, next) < 0.6) {
            issues.duplicates.push({
              plotId: plot.id,
              plotName: plot.name,
              vertexIndex: i,
              point: curr,
              message: `${plot.name}: শীর্ষবিন্দু #${i + 1}-এ অতি-নিকটবর্তী ডুপ্লিকেট পয়েন্ট`
            });
          }
        }

        // 4. Check Redundant Collinear Points
        for (let i = 0; i < v.length; i++) {
          const prev = v[(i - 1 + v.length) % v.length];
          const curr = v[i];
          const next = v[(i + 1) % v.length];
          const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
          const v2 = { x: next.x - curr.x, y: next.y - curr.y };
          const cross = v1.x * v2.y - v1.y * v2.x;
          const l1 = Math.hypot(v1.x, v1.y);
          const l2 = Math.hypot(v2.x, v2.y);
          if (l1 > 1.0 && l2 > 1.0 && Math.abs(cross) / (l1 * l2) < 0.001) {
            issues.collinear.push({
              plotId: plot.id,
              plotName: plot.name,
              vertexIndex: i,
              point: curr,
              message: `${plot.name}: শীর্ষবিন্দু #${i + 1} সরলরেখায় অপ্রয়োজনীয় অতিরিক্ত পয়েন্ট`
            });
          }
        }
      });

      // 5. Check Overlapping Plots
      for (let i = 0; i < plots.length; i++) {
        for (let j = i + 1; j < plots.length; j++) {
          const pA = plots[i];
          const pB = plots[j];
          // Quick bounding box overlap
          const boxA = this.getBoundingBox(pA.vertices);
          const boxB = this.getBoundingBox(pB.vertices);
          if (boxA.maxX > boxB.minX && boxA.minX < boxB.maxX &&
              boxA.maxY > boxB.minY && boxA.minY < boxB.maxY) {
            // Check if centroid of one is inside another
            const cA = this.getCentroid(pA.vertices);
            const cB = this.getCentroid(pB.vertices);
            if (this.isPointInside(cA, pB.vertices) || this.isPointInside(cB, pA.vertices)) {
              issues.overlaps.push({
                plotIdA: pA.id,
                plotIdB: pB.id,
                plotNameA: pA.name,
                plotNameB: pB.name,
                point: cA,
                message: `${pA.name} এবং ${pB.name} পরস্পর ওভারল্যাপ করছে (আংশিক বা সম্পূর্ণ অধিক্রমণ)`
              });
            }
          }
        }
      }

      const totalIssues = issues.gaps.length + issues.selfIntersections.length + 
                          issues.duplicates.length + issues.collinear.length + issues.overlaps.length;
      let score = 100 - (issues.gaps.length * 15 + issues.selfIntersections.length * 20 + 
                         issues.duplicates.length * 5 + issues.collinear.length * 2 + issues.overlaps.length * 15);
      score = Math.max(0, Math.min(100, score));

      return {
        score,
        totalIssues,
        ...issues
      };
    },

    getBoundingBox: function(vertices) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      vertices.forEach(v => {
        if (v.x < minX) minX = v.x;
        if (v.y < minY) minY = v.y;
        if (v.x > maxX) maxX = v.x;
        if (v.y > maxY) maxY = v.y;
      });
      return { minX, minY, maxX, maxY };
    },

    getCentroid: function(vertices) {
      let x = 0, y = 0;
      vertices.forEach(v => { x += v.x; y += v.y; });
      return { x: x / vertices.length, y: y / vertices.length };
    },

    isPointInside: function(pt, vertices) {
      let inside = false;
      for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const xi = vertices[i].x, yi = vertices[i].y;
        const xj = vertices[j].x, yj = vertices[j].y;
        const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
                          (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    },

    /**
     * Module 21: Auto-Repair Single Plot Gaps, Duplicates & Collinear Points
     */
    repairPlotTopology: function(plot, tol = 10.0) {
      if (!plot || !plot.vertices || plot.vertices.length < 3) return false;
      const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
      let v = plot.vertices.map(p => ({ x: p.x, y: p.y }));

      // 1. Auto-Seal Gaps (if last is close to first, snap together)
      if (v.length > 2) {
        const gap = dist(v[0], v[v.length - 1]);
        if (gap > 0.001 && gap <= tol * 3) {
          v[v.length - 1] = { x: v[0].x, y: v[0].y };
        }
      }

      // 2. Remove consecutive duplicates
      const cleaned = [];
      for (let i = 0; i < v.length; i++) {
        const pt = v[i];
        const prev = cleaned[cleaned.length - 1];
        if (!prev || dist(pt, prev) > 0.6) {
          cleaned.push(pt);
        }
      }
      if (cleaned.length > 2 && dist(cleaned[0], cleaned[cleaned.length - 1]) <= 0.6) {
        cleaned.pop();
      }

      // 3. Simplify collinear points
      const simplified = [];
      for (let i = 0; i < cleaned.length; i++) {
        const prev = cleaned[(i - 1 + cleaned.length) % cleaned.length];
        const curr = cleaned[i];
        const next = cleaned[(i + 1) % cleaned.length];

        const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
        const v2 = { x: next.x - curr.x, y: next.y - curr.y };
        const cross = v1.x * v2.y - v1.y * v2.x;
        const l1 = Math.hypot(v1.x, v1.y);
        const l2 = Math.hypot(v2.x, v2.y);

        if (l1 > 1.0 && l2 > 1.0 && Math.abs(cross) / (l1 * l2) < 0.001) {
          continue; // Omit collinear point
        }
        simplified.push(curr);
      }

      if (simplified.length >= 3) {
        plot.vertices = simplified;
        return true;
      }
      return false;
    },

    /**
     * Module 21: Auto-Repair All Plots Topology in One Click
     */
    repairAllPlotsTopology: function(plots, tol = 10.0) {
      if (!plots || plots.length === 0) return 0;
      let repairedCount = 0;
      plots.forEach(p => {
        if (this.repairPlotTopology(p, tol)) repairedCount++;
      });
      return repairedCount;
    },

    /**
     * Module 11: Digital Pantograph Proportional Scaler
     * Scales plot geometry by scaleFactor around centroid or custom anchor point
     */
    scalePlotGeometry: function(plot, scaleFactor, center = null) {
      if (!plot || !plot.vertices || plot.vertices.length < 2 || scaleFactor <= 0) return false;
      const c = center || this.getCentroid(plot.vertices);
      plot.vertices = plot.vertices.map(v => ({
        x: c.x + scaleFactor * (v.x - c.x),
        y: c.y + scaleFactor * (v.y - c.y)
      }));
      return true;
    },

    /**
     * Module 11: Proportional Scaling of All Plots
     */
    scaleAllPlotsGeometry: function(plots, scaleFactor, origin = null) {
      if (!plots || plots.length === 0 || scaleFactor <= 0) return 0;
      let allVertices = [];
      plots.forEach(p => { if (p.vertices) allVertices.push(...p.vertices); });
      if (allVertices.length === 0) return 0;
      const center = origin || this.getCentroid(allVertices);
      let count = 0;
      plots.forEach(p => {
        if (this.scalePlotGeometry(p, scaleFactor, center)) count++;
      });
      return count;
    },
    /**
     * Module 16: Detailed Vertex Coordinates Table Generator
     */
    getPlotVerticesDetailedTable: function(plot) {
      if (!plot || !plot.vertices || plot.vertices.length < 2) return [];
      const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const v = plot.vertices;
      const n = v.length;
      const table = [];

      for (let i = 0; i < n; i++) {
        const curr = v[i];
        const next = v[(i + 1) % n];
        const segDistLink = dist(curr, next);
        const segDistFeet = segDistLink * 0.66;
        const totalInches = Math.round(segDistFeet * 12);
        const ft = Math.floor(totalInches / 12);
        const inch = totalInches % 12;
        const ftInchStr = `${ft}'-${inch}"`;

        // Bearing / Azimuth (from North clockwise 0-360)
        const dx = next.x - curr.x;
        const dy = -(next.y - curr.y); // Screen Y is inverted
        let deg = (Math.atan2(dx, dy) * 180) / Math.PI;
        if (deg < 0) deg += 360;

        table.push({
          index: i + 1,
          xLinks: curr.x.toFixed(2),
          yLinks: curr.y.toFixed(2),
          xFeet: (curr.x * 0.66).toFixed(2),
          yFeet: (curr.y * 0.66).toFixed(2),
          distLink: segDistLink.toFixed(2),
          distFeet: segDistFeet.toFixed(2),
          distFeetInch: ftInchStr,
          bearing: deg.toFixed(1) + '°'
        });
      }
      return table;
    },

    /**
     * Slice a Polygon by an Infinite Line defined by pA and pB
     * Returns { success: true, polygons: [polyLeft, polyRight] }
     */
    splitPolygonByLine: function(vertices, pA, pB) {
      if (!vertices || vertices.length < 3) return { success: false };
      const dx = pB.x - pA.x;
      const dy = pB.y - pA.y;

      const side = p => dx * (p.y - pA.y) - dy * (p.x - pA.x);

      const polyLeft = [];
      const polyRight = [];
      const n = vertices.length;

      for (let i = 0; i < n; i++) {
        const curr = vertices[i];
        const next = vertices[(i + 1) % n];
        const sCurr = side(curr);
        const sNext = side(next);

        if (sCurr >= 0) polyLeft.push(curr);
        if (sCurr <= 0) polyRight.push(curr);

        if ((sCurr > 0 && sNext < 0) || (sCurr < 0 && sNext > 0)) {
          const t = sCurr / (sCurr - sNext);
          const ip = {
            x: curr.x + t * (next.x - curr.x),
            y: curr.y + t * (next.y - curr.y)
          };
          polyLeft.push(ip);
          polyRight.push(ip);
        }
      }

      if (polyLeft.length >= 3 && polyRight.length >= 3) {
        return { success: true, polygons: [polyLeft, polyRight] };
      }
      return { success: false };
    },

    /**
     * Module 19: Exact Area Cut-Off Engine (Binary Search slicing)
     * Cuts an exact target area (in sq. links) from 'north', 'south', 'east', or 'west'
     */
    cutPolygonExactArea: function(vertices, targetAreaSqLink, side = 'north', maxIter = 50) {
      if (!vertices || vertices.length < 3 || targetAreaSqLink <= 0) {
        return { success: false, reason: 'দাগ বা ক্ষেত্রফলের তথ্য সঠিক নয়' };
      }
      const totalArea = Math.abs(this.polygonArea(vertices));
      if (targetAreaSqLink >= totalArea * 0.999) {
        return { success: false, reason: 'কর্তন করার জমি মূল দাগের মোট জমির সমান বা বেশি হতে পারে না!' };
      }

      // Compute bounding box
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      vertices.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      // Binary search bounds
      let low, high, isHorizontal;
      if (side === 'north') { // cut from top (min Y)
        low = minY; high = maxY; isHorizontal = true;
      } else if (side === 'south') { // cut from bottom (max Y)
        low = minY; high = maxY; isHorizontal = true;
      } else if (side === 'west') { // cut from left (min X)
        low = minX; high = maxX; isHorizontal = false;
      } else { // 'east', cut from right (max X)
        low = minX; high = maxX; isHorizontal = false;
      }

      let bestCut = null;
      let bestDiff = Infinity;

      for (let iter = 0; iter < maxIter; iter++) {
        const mid = (low + high) / 2;
        let pA, pB;
        if (isHorizontal) {
          pA = { x: minX - 100, y: mid };
          pB = { x: maxX + 100, y: mid };
        } else {
          pA = { x: mid, y: minY - 100 };
          pB = { x: mid, y: maxY + 100 };
        }

        const splitRes = this.splitPolygonByLine(vertices, pA, pB);
        if (!splitRes || !splitRes.success || !splitRes.polygons || splitRes.polygons.length < 2) {
          // Adjust bounds
          if (side === 'north' || side === 'west') low = mid;
          else high = mid;
          continue;
        }

        // Determine which polygon corresponds to the targeted side
        const poly1 = splitRes.polygons[0];
        const poly2 = splitRes.polygons[1];
        const c1 = this.getCentroid(poly1);
        const c2 = this.getCentroid(poly2);

        let targetPoly, otherPoly;
        if (side === 'north') {
          targetPoly = c1.y < c2.y ? poly1 : poly2;
          otherPoly = c1.y < c2.y ? poly2 : poly1;
        } else if (side === 'south') {
          targetPoly = c1.y > c2.y ? poly1 : poly2;
          otherPoly = c1.y > c2.y ? poly2 : poly1;
        } else if (side === 'west') {
          targetPoly = c1.x < c2.x ? poly1 : poly2;
          otherPoly = c1.x < c2.x ? poly2 : poly1;
        } else { // east
          targetPoly = c1.x > c2.x ? poly1 : poly2;
          otherPoly = c1.x > c2.x ? poly2 : poly1;
        }

        const currentArea = Math.abs(this.polygonArea(targetPoly));
        const diff = currentArea - targetAreaSqLink;

        if (Math.abs(diff) < bestDiff) {
          bestDiff = Math.abs(diff);
          bestCut = {
            targetPoly,
            otherPoly,
            currentArea,
            remainingArea: totalArea - currentArea,
            cutLine: [pA, pB]
          };
        }

        if (Math.abs(diff) <= 0.05) break; // Reached precision within 0.05 sq. link (~0.0002 decimal!)

        if (diff > 0) {
          // Too big
          if (side === 'north' || side === 'west') high = mid;
          else low = mid;
        } else {
          // Too small
          if (side === 'north' || side === 'west') low = mid;
          else high = mid;
        }
      }

      if (bestCut) {
        return {
          success: true,
          targetPoly: bestCut.targetPoly,
          otherPoly: bestCut.otherPoly,
          targetArea: bestCut.currentArea,
          remainingArea: bestCut.remainingArea,
          accuracy: bestDiff
        };
      }
      return { success: false, reason: 'নির্দিষ্ট ক্ষেত্রফল কর্তনের কাটিং রেখা বের করা যায়নি' };
    },

    /**
     * Module 19: Islamic Faraez Inheritance Share Calculator
     */
    calculateIslamicFaraez: function(totalShotok, config) {
      const {
        wifeCount = 1,
        husbandPresent = false,
        sonCount = 0,
        daughterCount = 0,
        fatherPresent = false,
        motherPresent = false
      } = config;

      const hasChildren = (sonCount + daughterCount) > 0;
      let remainingFraction = 1.0;
      const shares = [];

      // 1. Spouse Share
      if (husbandPresent) {
        const husbandFraction = hasChildren ? 0.25 : 0.50; // 1/4 or 1/2
        shares.push({
          relation: 'স্বামী (Husband)',
          fractionStr: hasChildren ? '১/৪' : '১/২',
          fraction: husbandFraction,
          count: 1
        });
        remainingFraction -= husbandFraction;
      } else if (wifeCount > 0) {
        const wifeFraction = hasChildren ? 0.125 : 0.25; // 1/8 or 1/4
        shares.push({
          relation: `স্ত্রী (${wifeCount > 1 ? wifeCount + ' জন' : 'Wife'})`,
          fractionStr: hasChildren ? '১/৮' : '১/৪',
          fraction: wifeFraction,
          count: wifeCount
        });
        remainingFraction -= wifeFraction;
      }

      // 2. Mother Share
      if (motherPresent) {
        const motherFraction = hasChildren ? (1 / 6) : (1 / 3); // 1/6 or 1/3
        shares.push({
          relation: 'মাতা (Mother)',
          fractionStr: hasChildren ? '১/৬' : '১/৩',
          fraction: motherFraction,
          count: 1
        });
        remainingFraction -= motherFraction;
      }

      // 3. Father Share
      if (fatherPresent) {
        const fatherFraction = hasChildren ? (1 / 6) : remainingFraction;
        shares.push({
          relation: 'পিতা (Father)',
          fractionStr: hasChildren ? '১/৬' : 'অবশিষ্টাংশ (আছাবা)',
          fraction: fatherFraction,
          count: 1
        });
        remainingFraction -= fatherFraction;
      }

      // 4. Children Share (Asabah - 2:1 ratio between Sons and Daughters)
      if (hasChildren && remainingFraction > 0) {
        const totalUnits = (sonCount * 2) + daughterCount;
        if (totalUnits > 0) {
          const unitShare = remainingFraction / totalUnits;
          if (sonCount > 0) {
            const sonsTotalFraction = unitShare * sonCount * 2;
            shares.push({
              relation: `পুত্র (${sonCount} জন)`,
              fractionStr: `অবশিষ্টাংশের ${(sonCount * 2)}/${totalUnits} অংশ (প্রতি পুত্র দ্বিগুণ)`,
              fraction: sonsTotalFraction,
              count: sonCount,
              perPersonShotok: (sonsTotalFraction * totalShotok) / sonCount
            });
          }
          if (daughterCount > 0) {
            const daughtersTotalFraction = unitShare * daughterCount;
            shares.push({
              relation: `কন্যা (${daughterCount} জন)`,
              fractionStr: `অবশিষ্টাংশের ${daughterCount}/${totalUnits} অংশ`,
              fraction: daughtersTotalFraction,
              count: daughterCount,
              perPersonShotok: (daughtersTotalFraction * totalShotok) / daughterCount
            });
          }
        }
      }

      // Format output with decimal land
      return shares.map(s => {
        const shotok = totalShotok * s.fraction;
        const katha = shotok / 1.65;
        const sqft = shotok * 435.6;
        return {
          ...s,
          shotok: parseFloat(shotok.toFixed(3)),
          katha: parseFloat(katha.toFixed(2)),
          sqft: parseFloat(sqft.toFixed(1)),
          percent: parseFloat((s.fraction * 100).toFixed(1))
        };
      });
    },

    /**
     * Module 17: WGS84 GPS to Bangladesh Transverse Mercator (BTM / BUTM) Projection
     * Central Meridian = 90° E, Origin Lat = 0° N, Scale = 0.9996
     * False Easting = 500,000 m, False Northing = -2,000,000 m
     */
    convertGPSToBTM: function(lat, lng) {
      const a = 6378137.0; // WGS84 major axis
      const f = 1 / 298.257223563;
      const k0 = 0.9996;
      const lon0 = 90.0 * (Math.PI / 180); // Central meridian 90° E
      const fn = -2000000.0; // False Northing in meters
      const fe = 500000.0; // False Easting in meters

      const phi = lat * (Math.PI / 180);
      const lambda = lng * (Math.PI / 180);
      const e2 = 2 * f - f * f;
      const ep2 = e2 / (1 - e2);

      const N = a / Math.sqrt(1 - e2 * Math.sin(phi) * Math.sin(phi));
      const T = Math.tan(phi) * Math.tan(phi);
      const C = ep2 * Math.cos(phi) * Math.cos(phi);
      const A = Math.cos(phi) * (lambda - lon0);

      const M = a * ((1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * phi
        - (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2 * e2 / 1024) * Math.sin(2 * phi)
        + (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * phi)
        - (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * phi));

      const easting = fe + k0 * N * (A + (1 - T + C) * Math.pow(A, 3) / 6
        + (5 - 18 * T + T * T + 72 * C - 58 * ep2) * Math.pow(A, 5) / 120);

      const northing = fn + k0 * (M + N * Math.tan(phi) * (A * A / 2
        + (5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4) / 24
        + (61 - 58 * T + T * T + 600 * C - 330 * ep2) * Math.pow(A, 6) / 720));

      return {
        easting: parseFloat(easting.toFixed(2)),
        northing: parseFloat(northing.toFixed(2)),
        datum: 'BTM (Everest 1830 / WGS84 - 90°E)',
        formatted: `E: ${easting.toFixed(1)}m, N: ${northing.toFixed(1)}m`
      };
    },

    /**
     * Convert CAD Canvas Links (x, y) to Real-World GPS (Lat, Lng)
     */
    canvasToGPS: function(xLinks, yLinks, originGPS = { lat: 23.1275, lng: 90.7509 }, anchorWorld = { x: 0, y: 0 }) {
      const latRad = ((originGPS?.lat || 23.1275) * Math.PI) / 180;
      // High-precision WGS84 geodesic constants for Bangladesh:
      // 1 degree Lat = 110,750 meters = ~550,530 links
      // 1 degree Lng = 110,750 * cos(lat) meters = ~550,530 * cos(lat) links
      const linksPerDegLat = 550530;
      const linksPerDegLng = linksPerDegLat * Math.cos(latRad);
      const ax = anchorWorld ? (anchorWorld.x || 0) : 0;
      const ay = anchorWorld ? (anchorWorld.y || 0) : 0;
      const dx = xLinks - ax;
      const dy = yLinks - ay;
      const lat = originGPS.lat - (dy / linksPerDegLat); // Canvas Y increases downwards
      const lng = originGPS.lng + (dx / linksPerDegLng);
      return {
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6))
      };
    },

    gpsToCanvas: function(lat, lng, originGPS = { lat: 23.1275, lng: 90.7509 }, anchorWorld = { x: 0, y: 0 }) {
      const latRad = ((originGPS?.lat || 23.1275) * Math.PI) / 180;
      const linksPerDegLat = 550530;
      const linksPerDegLng = linksPerDegLat * Math.cos(latRad);
      const ax = anchorWorld ? (anchorWorld.x || 0) : 0;
      const ay = anchorWorld ? (anchorWorld.y || 0) : 0;
      const dy = (originGPS.lat - lat) * linksPerDegLat;
      const dx = (lng - originGPS.lng) * linksPerDegLng;
      return {
        x: ax + dx,
        y: ay + dy
      };
    }
  };

  global.LSCAD = global.LSCAD || {};
  global.LSCAD.PlotOps = PlotOps;

})(typeof window !== 'undefined' ? window : this);
