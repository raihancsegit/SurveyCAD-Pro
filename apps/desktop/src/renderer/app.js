/**
 * Land Survey CAD Interactive 2D Canvas Engine
 * Built with Shoelace Area Calculation and Bangladesh Survey Math
 */

(function() {
  'use strict';

  // Master Math Constants (Uses LSCAD.Constants module when available)
  const Constants = (typeof window !== 'undefined' && window.LSCAD && window.LSCAD.Constants) ? window.LSCAD.Constants : {};
  const SQFT_PER_SHOTOK = Constants.SQFT_PER_SHOTOK || 435.60;
  const SQFT_PER_KATHA = Constants.SQFT_PER_KATHA || 720.00;
  const SQFT_PER_BIGHA = Constants.SQFT_PER_BIGHA || 14400.00;
  const SQFT_PER_ACRE = Constants.SQFT_PER_ACRE || 43560.00;
  const SQFT_PER_SQMETER = Constants.SQFT_PER_SQMETER || 10.7639104;
  const SQFT_PER_SQLINK = Constants.SQFT_PER_SQLINK || 0.4356;
  const FEET_PER_LINK = Constants.FEET_PER_LINK || 0.66;

  
  // =========================================================================
  // Professional Non-Blocking CAD Notification & Dialog Engine (NO ALERTS)
  // =========================================================================
  function showToast(message, type = 'info') {
    let toast = document.getElementById('cadToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cadToast';
      document.body.appendChild(toast);
    }
    const bgClass = type === 'success' ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/50 shadow-emerald-950/40' :
                    type === 'warning' ? 'bg-amber-950/95 text-amber-200 border-amber-500/50 shadow-amber-950/40' :
                    type === 'error'   ? 'bg-rose-950/95 text-rose-200 border-rose-500/50 shadow-rose-950/40' :
                                         'bg-slate-900/95 text-sky-200 border-sky-500/40 shadow-slate-950/40';
    toast.className = `fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 pointer-events-none text-xs font-semibold border ${bgClass}`;
    const dotColor = type === 'success' ? 'bg-emerald-400' : type === 'error' ? 'bg-rose-400' : type === 'warning' ? 'bg-amber-400' : 'bg-sky-400';
    toast.innerHTML = `<span class="w-2.5 h-2.5 rounded-full ${dotColor} animate-pulse flex-shrink-0"></span><span>${message}</span>`;

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-12px)';
    }, 4000);
  }

  function showConfirmDialog(title, message, onConfirm) {
    let modal = document.getElementById('cadConfirmModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cadConfirmModal';
      modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden';
      modal.innerHTML = `
        <div class="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
          <div class="flex items-center gap-2 text-rose-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <h3 id="cadConfirmTitle" class="text-base font-extrabold text-white"></h3>
          </div>
          <p id="cadConfirmMessage" class="text-xs text-slate-300 leading-relaxed"></p>
          <div class="flex justify-end gap-2.5 pt-2">
            <button id="btnCadConfirmCancel" type="button" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors">বাতিল</button>
            <button id="btnCadConfirmOk" type="button" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer transition-colors">নিশ্চিত করুন</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('btnCadConfirmCancel').addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }
    document.getElementById('cadConfirmTitle').textContent = title;
    document.getElementById('cadConfirmMessage').textContent = message;
    const okBtn = document.getElementById('btnCadConfirmOk');
    const newOkBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    newOkBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      if (onConfirm) onConfirm();
    });
    modal.classList.remove('hidden');
  }

  function showPromptDialog(title, placeholder, defaultValue, onConfirm) {
    let modal = document.getElementById('cadPromptModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cadPromptModal';
      modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden';
      modal.innerHTML = `
        <div class="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
          <h3 id="cadPromptTitle" class="text-base font-extrabold text-white"></h3>
          <input type="text" id="cadPromptInput" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-medium">
          <div class="flex justify-end gap-2.5 pt-2">
            <button id="btnCadPromptCancel" type="button" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors">বাতিল</button>
            <button id="btnCadPromptOk" type="button" class="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 cursor-pointer transition-colors">সংরক্ষণ করুন</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('btnCadPromptCancel').addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }
    document.getElementById('cadPromptTitle').textContent = title;
    const input = document.getElementById('cadPromptInput');
    input.placeholder = placeholder || '';
    input.value = defaultValue || '';
    const okBtn = document.getElementById('btnCadPromptOk');
    const newOkBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    newOkBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      if (onConfirm) onConfirm(input.value);
    });
    modal.classList.remove('hidden');
    setTimeout(() => input.focus(), 60);
  }

  // State Management
  const state = {
    tool: 'select', // select, polygon, polyline, point, dimension, calibrate, split, text, offset
    unit: 'feet_inch', // feet_inch, inch, feet, meter (Link removed)
    scalePreset: '16_inch',
    scaleFactor: 1.0, // World units per pixel
    snapEnabled: true,
    gridEnabled: true,
    
    // Layer Visibility
    layers: {
      plots: true,
      pillars: true,
      dimensions: true,
      annotations: true
    },

    // Camera Viewport Transformation
    camera: {
      x: 450,
      y: 325,
      zoom: 0.85,
      isPanning: false,
      panStartX: 0,
      panStartY: 0
    },

    // Cursor position in screen & world coords
    mouse: {
      screenX: 0,
      screenY: 0,
      worldX: 0,
      worldY: 0
    },

    // AutoCAD Glowing Green Grip Dragging State
    dragVertex: {
      isDragging: false,
      plotId: null,
      vertexIndex: -1
    },
    hoveredVertex: null,
    liveDragTooltip: null,

    // Active Drawing buffer
    activePolyline: [],
    activeTracedLineId: null,
    
    // Calibration points buffer
    calibrationPoints: [],

    // Slice Line buffer
    slicePoints: [],

    // Snap Indicator
    activeSnapPoint: null,

    // Entities in CAD Workspace
    plots: [],
    pillars: [],
    annotations: [],

    selectedPlotId: null,
    splitRatio: 0.5,
    showAngles: false,
    nextPlotNumber: 1,
    autoNumberSettings: {
      start: 501,
      current: 501,
      prefix: 'দাগ নং ',
      step: 1
    },
    mergeSelectedPlots: [],
    history: [],
    historyIndex: -1,
    khatianOwners: [
      { id: 1, name: 'মোঃ রহিম মিয়া', share: 0.400 },
      { id: 2, name: 'করিম আহমেদ', share: 0.350 },
      { id: 3, name: 'মোসাঃ সালমা বেগম', share: 0.250 }
    ],

    // Land Valuation & Class
    landClass: 'nal',
    ratePerShotok: 350000,

    // Virtual Gunia Scale Tool State
    gunia: {
      enabled: false,
      x: 350,
      y: 280,
      rotation: 0,
      isDragging: false,
      isRotating: false,
      dragOffsetX: 0,
      dragOffsetY: 0
    },

    // Diagonal Tie-Line Measurement Points
    diagonalPoints: [],

    // Satellite Imagery & GPS Benchmark State (Google Satellite + Hybrid Engine)
    satellite: {
      enabled: false,
      opacity: 0.65,
      source: 'google_hybrid', // 'google_hybrid', 'google_sat', 'esri'
      layerPosition: 'top', // 'top' (overlaid on top of map) or 'bottom' (underneath map)
      blendMode: 'normal', // 'normal' or 'multiply'
      imageObj: null,
      originGPS: { lat: 23.127500, lng: 90.750900 }, // Faridganj, Chandpur
      anchorWorld: { x: 800, y: 550 },
      pinPlaced: true
    },

    // Highlighted Vertex on Canvas (Module 16)
    highlightedVertex: null,

    // Multi-Map Sheets Engine & Layer Architecture (AutoCAD Multi-Sheet Support)
    mouzaMaps: [],
    activeMapId: null,
    dragMap: {
      isDragging: false,
      mapId: null,
      dragStartX: 0,
      dragStartY: 0,
      mapStartX: 0,
      mapStartY: 0
    },

    // Backward-Compatible Getter/Setter for Active Mouza Map
    get mouzaMap() {
      if (!this.mouzaMaps || this.mouzaMaps.length === 0) {
        if (!this._fallbackMap) {
          this._fallbackMap = {
            id: 'map_0',
            name: 'নকশা ১ (প্রধান শিট)',
            loaded: false,
            isVector: false,
            isCalibrated: false,
            scaleFactor: 1.0,
            scaleRatio: 1.0,
            scalePreset: '16_inch',
            imageObj: null,
            filteredCanvas: null,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            opacity: 0.95,
            rotation: 0,
            locked: false,
            visible: true,
            calibratedTargetLinks: 0,
            calibratedPixelDist: 0,
            filters: { threshold: 0, brightness: 0, contrast: 0 }
          };
        }
        return this._fallbackMap;
      }
      const found = this.mouzaMaps.find(m => m.id === this.activeMapId);
      return found || this.mouzaMaps[0];
    },
    set mouzaMap(val) {
      if (!this.mouzaMaps || this.mouzaMaps.length === 0) {
        if (!val.id) val.id = 'map_1';
        if (!val.name) val.name = 'নকশা ১ (প্রধান শিট)';
        if (val.visible === undefined) val.visible = true;
        if (val.locked === undefined) val.locked = false;
        this.mouzaMaps = [val];
        this.activeMapId = val.id;
      } else {
        const idx = this.mouzaMaps.findIndex(m => m.id === this.activeMapId);
        if (idx !== -1) {
          Object.assign(this.mouzaMaps[idx], val);
        } else {
          Object.assign(this.mouzaMaps[0], val);
        }
      }
    }
  };

  // DOM Elements
  const canvas = document.getElementById('cadCanvas');
  const ctx = canvas.getContext('2d');

  const coordXEl = document.getElementById('coordX');
  const coordYEl = document.getElementById('coordY');
  const zoomLabelEl = document.getElementById('zoomLabel');
  const drawHintBox = document.getElementById('drawHintBox');
  const drawHintText = document.getElementById('drawHintText');

  const statShotok = document.getElementById('statShotok');
  const statKatha = document.getElementById('statKatha');
  const statBigha = document.getElementById('statBigha');
  const statAcre = document.getElementById('statAcre');
  const statSqft = document.getElementById('statSqft');
  const statSqLinks = document.getElementById('statSqLinks');
  const statSqM = document.getElementById('statSqM');
  const statBanglaSentence = document.getElementById('statBanglaSentence');
  const statPerimeter = document.getElementById('statPerimeter');
  const sideMeasurementsTable = document.getElementById('sideMeasurementsTable');
  const inspectorPlotName = document.getElementById('inspectorPlotName');

  const splitSlider = document.getElementById('splitSlider');
  const splitRatioLabel = document.getElementById('splitRatioLabel');
  const splitPlotA = document.getElementById('splitPlotA');
  const splitPlotB = document.getElementById('splitPlotB');

  let dpr = window.devicePixelRatio || 1;
  let logicalW = 800;
  let logicalH = 600;

  // High-DPI / Retina Canvas Resize Engine
  function resizeCanvas() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    logicalW = Math.floor(rect.width || parent.clientWidth || window.innerWidth - 384);
    logicalH = Math.floor(rect.height || parent.clientHeight || window.innerHeight - 96);
    if (logicalW <= 0 || logicalH <= 0) return;

    dpr = window.devicePixelRatio || 1;
    const targetW = Math.round(logicalW * dpr);
    const targetH = Math.round(logicalH * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      canvas.style.width = logicalW + 'px';
      canvas.style.height = logicalH + 'px';
    }
    render();
  }
  window.addEventListener('resize', resizeCanvas);
  if (window.ResizeObserver && canvas.parentElement) {
    const ro = new ResizeObserver(() => {
      resizeCanvas();
    });
    ro.observe(canvas.parentElement);
  }

  // Coordinate Conversion Math (Always using crisp logical space)
  function worldToScreen(wx, wy) {
    return {
      x: (wx - state.camera.x) * state.camera.zoom + logicalW / 2,
      y: (wy - state.camera.y) * state.camera.zoom + logicalH / 2
    };
  }

  function screenToWorld(sx, sy) {
    return {
      x: (sx - logicalW / 2) / state.camera.zoom + state.camera.x,
      y: (sy - logicalH / 2) / state.camera.zoom + state.camera.y
    };
  }

  // Shoelace Polygon Area Formula
  function calculateShoelaceArea(vertices) {
    if (!vertices || vertices.length < 3) return 0;
    let sum = 0;
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      sum += (p1.x * p2.y) - (p2.x * p1.y);
    }
    return Math.abs(sum) / 2;
  }

  function calculatePerimeter(vertices) {
    if (!vertices || vertices.length < 2) return 0;
    let perim = 0;
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      perim += Math.sqrt(dx * dx + dy * dy);
    }
    return perim;
  }

  function calculateCentroid(vertices) {
    let cx = 0, cy = 0;
    vertices.forEach(v => { cx += v.x; cy += v.y; });
    return { x: cx / vertices.length, y: cy / vertices.length };
  }

  function isPointInPolygon(pt, vs) {
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

  // Snap Proximity Detector
  function findSnapPoint(worldX, worldY) {
    if (!state.snapEnabled) return null;
    const snapTolerance = 16 / state.camera.zoom; // 16 screen pixels

    // 0. High-Priority Magnetic Snap to First Point of In-Progress Polyline
    if ((state.tool === 'polygon' || state.tool === 'polyline') && state.activePolyline && state.activePolyline.length >= 3) {
      const first = state.activePolyline[0];
      const distToFirst = Math.hypot(first.x - worldX, first.y - worldY);
      if (distToFirst < snapTolerance * 1.6) {
        return { x: first.x, y: first.y, type: 'firstpoint' };
      }
    }

    // 1. Check all plot vertices
    if (state.layers.plots) {
      for (const plot of state.plots) {
        for (let i = 0; i < plot.vertices.length; i++) {
          const v = plot.vertices[i];
          const dist = Math.hypot(v.x - worldX, v.y - worldY);
          if (dist < snapTolerance) {
            return { x: v.x, y: v.y, type: 'endpoint' };
          }

          // Midpoints
          const nextV = plot.vertices[(i + 1) % plot.vertices.length];
          const midX = (v.x + nextV.x) / 2;
          const midY = (v.y + nextV.y) / 2;
          const midDist = Math.hypot(midX - worldX, midY - worldY);
          if (midDist < snapTolerance) {
            return { x: midX, y: midY, type: 'midpoint' };
          }
        }
      }
    }

    // 2. Check Pillars
    if (state.layers.pillars) {
      for (const p of state.pillars) {
        const dist = Math.hypot(p.x - worldX, p.y - worldY);
        if (dist < snapTolerance) {
          return { x: p.x, y: p.y, type: 'endpoint' };
        }
      }
    }

    return null;
  }

  // Ramer-Douglas-Peucker (RDP) Algorithm for Polygon Simplification
  function perpendicularDistance(pt, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const mag = Math.hypot(dx, dy);
    if (mag === 0) return Math.hypot(pt.x - lineStart.x, pt.y - lineStart.y);
    return Math.abs(dy * pt.x - dx * pt.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / mag;
  }

  function simplifyRDP(points, epsilon) {
    if (points.length <= 2) return points;

    let maxDist = 0;
    let index = 0;
    const start = points[0];
    const end = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
      const dist = perpendicularDistance(points[i], start, end);
      if (dist > maxDist) {
        maxDist = dist;
        index = i;
      }
    }

    if (maxDist > epsilon) {
      const left = simplifyRDP(points.slice(0, index + 1), epsilon);
      const right = simplifyRDP(points.slice(index), epsilon);
      return left.slice(0, -1).concat(right);
    } else {
      return [start, end];
    }
  }

  // Prune collinear vertices along straight cadastral ails to eliminate pixel staircase noise
  function pruneCollinearPoints(points, maxAngleDeg = 6) {
    if (!points || points.length <= 3) return points;
    const result = [];
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const prev = points[(i - 1 + n) % n];
      const cur = points[i];
      const next = points[(i + 1) % n];

      const v1x = cur.x - prev.x;
      const v1y = cur.y - prev.y;
      const v2x = next.x - cur.x;
      const v2y = next.y - cur.y;

      const len1 = Math.hypot(v1x, v1y);
      const len2 = Math.hypot(v2x, v2y);
      if (len1 < 1e-4 || len2 < 1e-4) continue;

      const dot = (v1x * v2x + v1y * v2y) / (len1 * len2);
      const clampedDot = Math.max(-1, Math.min(1, dot));
      const angleDeg = Math.acos(clampedDot) * (180 / Math.PI);

      // Keep point only if it is a real corner (turns by more than maxAngleDeg)
      if (angleDeg > maxAngleDeg) {
        result.push(cur);
      }
    }
    return result.length >= 3 ? result : points;
  }

  // Calculate Interior Angle (in degrees) at vertex B between A->B and B->C
  function calculateInteriorAngle(pA, pB, pC) {
    const v1x = pA.x - pB.x;
    const v1y = pA.y - pB.y;
    const v2x = pC.x - pB.x;
    const v2y = pC.y - pB.y;

    const angle1 = Math.atan2(v1y, v1x);
    const angle2 = Math.atan2(v2y, v2x);

    let diff = (angle2 - angle1) * (180 / Math.PI);
    if (diff < 0) diff += 360;
    return diff;
  }

  // Calculate Survey Azimuth & Compass Bearing (e.g. N 45° E, S 30° W)
  function calculateBearing(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    let azimuth = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (azimuth < 0) azimuth += 360;

    if (azimuth >= 0 && azimuth < 90) {
      return 'N ' + azimuth.toFixed(0) + '° E';
    } else if (azimuth >= 90 && azimuth < 180) {
      return 'S ' + (180 - azimuth).toFixed(0) + '° E';
    } else if (azimuth >= 180 && azimuth < 270) {
      return 'S ' + (azimuth - 180).toFixed(0) + '° W';
    } else {
      return 'N ' + (360 - azimuth).toFixed(0) + '° W';
    }
  }

  // Undo / Redo History Management
  function pushHistory() {
    if (state.historyIndex < state.history.length - 1) {
      state.history = state.history.slice(0, state.historyIndex + 1);
    }
    const snapshot = {
      plots: JSON.parse(JSON.stringify(state.plots)),
      pillars: JSON.parse(JSON.stringify(state.pillars)),
      annotations: JSON.parse(JSON.stringify(state.annotations)),
      selectedPlotId: state.selectedPlotId
    };
    state.history.push(snapshot);
    if (state.history.length > 35) {
      state.history.shift();
    }
    state.historyIndex = state.history.length - 1;
    updateUndoRedoUI();
  }

  function undo() {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      const snapshot = state.history[state.historyIndex];
      state.plots = JSON.parse(JSON.stringify(snapshot.plots));
      state.pillars = JSON.parse(JSON.stringify(snapshot.pillars));
      state.annotations = JSON.parse(JSON.stringify(snapshot.annotations));
      state.selectedPlotId = snapshot.selectedPlotId;
      updateUndoRedoUI();
      updateInspector();
      render();
    }
  }

  function redo() {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex++;
      const snapshot = state.history[state.historyIndex];
      state.plots = JSON.parse(JSON.stringify(snapshot.plots));
      state.pillars = JSON.parse(JSON.stringify(snapshot.pillars));
      state.annotations = JSON.parse(JSON.stringify(snapshot.annotations));
      state.selectedPlotId = snapshot.selectedPlotId;
      updateUndoRedoUI();
      updateInspector();
      render();
    }
  }

  function updateUndoRedoUI() {
    const btnUndo = document.getElementById('btnUndo');
    const btnRedo = document.getElementById('btnRedo');
    if (btnUndo) {
      btnUndo.classList.toggle('opacity-30', state.historyIndex <= 0);
    }
    if (btnRedo) {
      btnRedo.classList.toggle('opacity-30', state.historyIndex >= state.history.length - 1);
    }
  }

  // Flash / Highlight Animation when Plot is Auto Detected
  function flashPlotDetected(vertices) {
    let opacity = 0.9;
    const flashTimer = setInterval(() => {
      opacity -= 0.12;
      if (opacity <= 0) {
        clearInterval(flashTimer);
        render();
      } else {
        render();
        ctx.save();
        ctx.beginPath();
        const f = worldToScreen(vertices[0].x, vertices[0].y);
        ctx.moveTo(f.x, f.y);
        for (let i = 1; i < vertices.length; i++) {
          const pt = worldToScreen(vertices[i].x, vertices[i].y);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(168, 85, 247, ${opacity * 0.35})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
      }
    }, 35);
  }

  // Bengali Digits & Daag Number Formatter
  function toBanglaDigits(str) {
    const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(str).replace(/[0-9]/g, d => bn[d]);
  }

  // Precise Feet & Inches Converter (1 Link = 0.66 Feet = 7.92 Inches)
  function convertFeetToFeetInches(totalFeet, bangla = true) {
    if (isNaN(totalFeet) || totalFeet < 0) totalFeet = 0;
    let wholeFeet = Math.floor(totalFeet);
    let inches = Math.round((totalFeet - wholeFeet) * 12);
    if (inches >= 12) {
      wholeFeet += 1;
      inches = 0;
    }
    const bFeet = toBanglaDigits(wholeFeet);
    const bInches = toBanglaDigits(inches);
    return {
      totalFeet: totalFeet,
      feet: wholeFeet,
      inches: inches,
      formattedBengali: `${bFeet} ফুট ${bInches} ইঞ্চি`,
      formattedShortBengali: `${bFeet}' - ${bInches}"`,
      formattedEnglish: `${wholeFeet}' - ${inches}"`,
      formattedFullEnglish: `${wholeFeet} ft ${inches} in`,
      badgeText: bangla ? `${bFeet}' - ${bInches}"` : `${wholeFeet}' - ${inches}"`
    };
  }

  function convertLinksToFeetInches(links, bangla = true) {
    const totalFeet = (links || 0) * FEET_PER_LINK;
    return convertFeetToFeetInches(totalFeet, bangla);
  }

  // Official Bangladesh Cadastral Survey Scale Math: 1 Mile = 5280 ft = 63,360 inches
  // ১৬ ইঞ্চি = ১ মাইল: ৫২৮০ / ১৬ * ১২ = ৩৯৬০ ইঞ্চি মাটিতে (৩৩০ ফুট)
  // ৩২ ইঞ্চি = ১ মাইল: ৫২৮০ / ৩২ * ১২ = ১৯৮০ ইঞ্চি মাটিতে (১৬৫ ফুট)
  // ৬৪ ইঞ্চি = ১ মাইল: ৫২৮০ / ৬৪ * ১২ = ৯৯০ ইঞ্চি মাটিতে (৮২.৫ ফুট / ৮২' ৬")
  // ৮০ ইঞ্চি = ১ মাইল: ৫২৮০ / ৮০ * ১২ = ৭৯২ ইঞ্চি মাটিতে (৬৬ ফুট)
  // ৪ ইঞ্চি  = ১ মাইল: ৫২৮০ / ৪  * ১২ = ১৫৮৪০ ইঞ্চি মাটিতে (১৩২০ ফুট)
  function getInchesPerMapInch() {
    if (state.customScaleInchesPerMapInch) return state.customScaleInchesPerMapInch;
    if (state.scalePreset === '32_inch') return 1980; // 5280 / 32 * 12 = 1980
    if (state.scalePreset === '64_inch') return 990;  // 5280 / 64 * 12 = 990
    if (state.scalePreset === '80_inch') return 792;  // 5280 / 80 * 12 = 792
    if (state.scalePreset === '4_inch') return 15840; // 5280 / 4 * 12 = 15840
    return 3960; // default 16_inch: 5280 / 16 * 12 = 3960
  }

  function getFeetPerMapInch() {
    return getInchesPerMapInch() / 12.0;
  }

  function formatBanglaDaagName(input) {
    if (!input) return 'দাগ নং';
    let str = String(input).trim();
    const digitsOnly = str.replace(/[^0-9০-৯]/g, '');
    if (digitsOnly && !str.includes('দাগ')) {
      return `দাগ নং ${toBanglaDigits(digitsOnly)}`;
    }
    return toBanglaDigits(str);
  }

  // Floating Quick Rename Badge for Instant Dag Matching
  let renameTargetPlotId = null;

  function showFloatingRenameBox(plotId, screenX, screenY) {
    const plot = state.plots.find(p => p.id === plotId);
    const box = document.getElementById('floatingRenameBox');
    const input = document.getElementById('floatingPlotNameInput');
    if (!plot || !box || !input) return;

    // Do NOT show rename box for lines or measurement references
    const rawArea = calculateShoelaceArea(plot.vertices);
    if (!plot.vertices || plot.vertices.length <= 2 || rawArea < 0.15) return;

    renameTargetPlotId = plotId;
    const pureNum = plot.name.replace(/^দাগ\s*(নং)?\s*/i, '').replace(/\s*\(.*\)/, '').trim();
    input.value = pureNum || '';
    input.placeholder = 'ম্যাপের দাগ নং লিখুন';

    const boxW = 220;
    const boxH = 46;
    const clampedX = Math.max(15, Math.min(window.innerWidth - boxW - 320, screenX - boxW / 2));
    const clampedY = Math.max(70, Math.min(window.innerHeight - boxH - 60, screenY - 50));

    box.style.left = clampedX + 'px';
    box.style.top = clampedY + 'px';
    box.classList.remove('hidden');

    setTimeout(() => {
      input.focus();
      input.select();
    }, 60);
  }

  function hideFloatingRenameBox(save = true) {
    const box = document.getElementById('floatingRenameBox');
    const input = document.getElementById('floatingPlotNameInput');
    if (!box || box.classList.contains('hidden')) return;

    if (save && renameTargetPlotId && input) {
      const plot = state.plots.find(p => p.id === renameTargetPlotId);
      if (plot && input.value.trim()) {
        plot.name = formatBanglaDaagName(input.value.trim());
        updateInspector();
        render();
      }
    }
    box.classList.add('hidden');
    renameTargetPlotId = null;
  }

  // Helper: Retrieve the currently active Mouza Map Sheet
  function getActiveMouzaMap() {
    if (state.mouzaMaps && state.mouzaMaps.length > 0) {
      const found = state.mouzaMaps.find(m => m.id === state.activeMapId);
      return found || state.mouzaMaps[0];
    }
    return state.mouzaMap;
  }

  // Helper: Identify which Mouza Map Sheet bounding box contains a world (x, y) coordinate
  function getMapAtWorldCoord(worldX, worldY) {
    const maps = state.mouzaMaps || [];
    // Check in reverse order (topmost rendered sheet first)
    for (let i = maps.length - 1; i >= 0; i--) {
      const sheet = maps[i];
      if (!sheet || !sheet.loaded || sheet.visible === false) continue;

      let rx = worldX - sheet.x;
      let ry = worldY - sheet.y;
      if (sheet.rotation && sheet.rotation !== 0) {
        const cx = sheet.x + sheet.width / 2;
        const cy = sheet.y + sheet.height / 2;
        const rad = (-sheet.rotation * Math.PI) / 180;
        const dx = worldX - cx;
        const dy = worldY - cy;
        rx = dx * Math.cos(rad) - dy * Math.sin(rad) + sheet.width / 2;
        ry = dx * Math.sin(rad) + dy * Math.cos(rad) + sheet.height / 2;
      }
      if (rx >= 0 && rx <= sheet.width && ry >= 0 && ry <= sheet.height) {
        return sheet;
      }
    }
    return getActiveMouzaMap();
  }

  // Magic Wand Auto Plot Boundary Detection Engine (Multi-Sheet Aware, Dual-Pass Leak Prevention & Collinear Smoothing)
  function detectPlotBoundaryFromClick(worldX, worldY) {
    // 1. Identify which Mouza Map Sheet the user clicked on
    const mm = getMapAtWorldCoord(worldX, worldY);
    if (!mm || !mm.loaded) {
      showToast('প্রথমে একটি স্ক্যান করা নকশা ম্যাপ ইমপোর্ট করুন', 'warning');
      return;
    }

    const srcCanvas = mm.filteredCanvas || mm.imageObj;
    if (!srcCanvas) {
      showToast('ম্যাপ ইমেজ সঠিকভাবে লোড হয়নি, পুনরায় চেষ্টা করুন', 'warning');
      return;
    }

    // Auto-activate this map sheet in the UI
    if (mm.id && state.activeMapId !== mm.id) {
      state.activeMapId = mm.id;
      updateMapSheetsUI();
      updateScaleStatusBadge();
    }

    const origW = srcCanvas.naturalWidth || srcCanvas.width;
    const origH = srcCanvas.naturalHeight || srcCanvas.height;
    if (!origW || !origH) {
      showToast('ম্যাপ ইমেজ সঠিকভাবে লোড হয়নি, পুনরায় চেষ্টা করুন', 'warning');
      return;
    }

    // Convert World (X, Y) to Image Pixel Coordinates (supporting rotation if any)
    let relX = (worldX - mm.x) / mm.width;
    let relY = (worldY - mm.y) / mm.height;

    if (mm.rotation && mm.rotation !== 0) {
      const cx = mm.x + mm.width / 2;
      const cy = mm.y + mm.height / 2;
      const rad = (-mm.rotation * Math.PI) / 180;
      const dx = worldX - cx;
      const dy = worldY - cy;
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
      relX = (rx + mm.width / 2) / mm.width;
      relY = (ry + mm.height / 2) / mm.height;
    }

    if (relX < 0 || relX > 1 || relY < 0 || relY > 1) {
      showToast('দয়া করে মৌজা নকশার সীমানার ভেতরে ক্লিক করুন', 'info');
      return;
    }

    // Immediate Precision Detection for Demo Cadastral Sheet if applicable
    if (mm.demoPlots && mm.demoPlots.length > 0) {
      const imgX = relX * (mm.baseWidth || 900);
      const imgY = relY * (mm.baseHeight || 650);
      const matchedDemo = mm.demoPlots.find(dp => {
        const pts = dp.poly.map(p => ({ x: p[0], y: p[1] }));
        return isPointInPolygon({ x: imgX, y: imgY }, pts);
      });

      if (matchedDemo) {
        const worldVertices = matchedDemo.poly.map(p => {
          let wx = mm.x + (p[0] / (mm.baseWidth || 900)) * mm.width;
          let wy = mm.y + (p[1] / (mm.baseHeight || 650)) * mm.height;
          return { x: wx, y: wy };
        });

        const newPlotNumber = state.nextPlotNumber || (101 + state.plots.length);
        state.nextPlotNumber = newPlotNumber + 1;
        const newPlotId = 'plot-magic-' + newPlotNumber + '-' + Date.now();
        const bnLabel = matchedDemo.label ? `দাগ নং ${matchedDemo.label}` : ('দাগ নং ' + toBanglaDigits(newPlotNumber));

        const palette = [
          { fill: 'rgba(168, 85, 247, 0.22)', stroke: '#a855f7' },
          { fill: 'rgba(236, 72, 153, 0.22)', stroke: '#ec4899' },
          { fill: 'rgba(56, 189, 248, 0.22)', stroke: '#38bdf8' },
          { fill: 'rgba(245, 158, 11, 0.22)', stroke: '#f59e0b' },
          { fill: 'rgba(16, 185, 129, 0.22)', stroke: '#10b981' }
        ];
        const colorStyle = palette[state.plots.length % palette.length];

        const newPlot = {
          id: newPlotId,
          name: bnLabel,
          layer: 'plots',
          mapSheetId: mm.id,
          fillColor: colorStyle.fill,
          strokeColor: colorStyle.stroke,
          vertices: worldVertices
        };

        state.plots.push(newPlot);
        state.selectedPlotId = newPlotId;
        pushHistory();
        updateInspector();
        render();

        flashPlotDetected(worldVertices);
        playCadSound('snap');

        const areaSqLk = calculatePolygonArea(worldVertices);
        const sqFt = areaSqLk * (FEET_PER_LINK * FEET_PER_LINK);
        const decimal = sqFt / 435.6;
        showToast(`🪄 ${bnLabel} চিহ্নিত হয়েছে: ${decimal.toFixed(2)} শতক (${sqFt.toFixed(0)} বর্গফুট)`, 'success');
        return;
      }
    }

    let seedX = Math.round(relX * origW);
    let seedY = Math.round(relY * origH);
    seedX = Math.max(0, Math.min(origW - 1, seedX));
    seedY = Math.max(0, Math.min(origH - 1, seedY));

    // High performance local windowing around clicked seed point
    // Supports both medium and high-resolution cadastral sheets (up to 850px radius)
    const maxDim = Math.max(origW, origH);
    const maxPlotRadius = Math.min(
      maxDim > 4000 ? 950 : (maxDim > 2000 ? 750 : 550),
      Math.floor(Math.min(origW, origH) / 2)
    );
    const cropX0 = Math.max(0, seedX - maxPlotRadius);
    const cropY0 = Math.max(0, seedY - maxPlotRadius);
    const cropX1 = Math.min(origW - 1, seedX + maxPlotRadius);
    const cropY1 = Math.min(origH - 1, seedY + maxPlotRadius);
    const cropW = cropX1 - cropX0 + 1;
    const cropH = cropY1 - cropY0 + 1;

    // Fast offscreen raster capture of local region
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
    cropCtx.drawImage(srcCanvas, cropX0, cropY0, cropW, cropH, 0, 0, cropW, cropH);
    const imgData = cropCtx.getImageData(0, 0, cropW, cropH);
    const pixels = imgData.data;

    let localSeedX = seedX - cropX0;
    let localSeedY = seedY - cropY0;

    // Helper: luminance calculator
    function getLum(lx, ly) {
      const idx = (ly * cropW + lx) * 4;
      return 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
    }

    // 1. Sample local background (paper) and foreground (ink lines) in adaptive window
    const sampleR = 40;
    const lums = [];
    for (let dy = -sampleR; dy <= sampleR; dy += 3) {
      for (let dx = -sampleR; dx <= sampleR; dx += 3) {
        const sx = localSeedX + dx;
        const sy = localSeedY + dy;
        if (sx >= 0 && sx < cropW && sy >= 0 && sy < cropH) {
          lums.push(getLum(sx, sy));
        }
      }
    }
    lums.sort((a, b) => a - b);
    
    // Background paper is typically the 85th percentile of local luminance
    const bgLum = lums.length > 0 ? lums[Math.floor(lums.length * 0.85)] : 210;
    const minLum = lums.length > 0 ? lums[0] : 40;

    // If user clicked right on an ink line or dag number text, seek outward for clear paper interior
    let curSeedLum = getLum(localSeedX, localSeedY);
    if (curSeedLum < bgLum - 25) {
      let bestX = localSeedX, bestY = localSeedY, bestLum = curSeedLum;
      for (let r = 2; r <= 48; r += 2) {
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
          const sx = Math.round(localSeedX + Math.cos(angle) * r);
          const sy = Math.round(localSeedY + Math.sin(angle) * r);
          if (sx >= 0 && sx < cropW && sy >= 0 && sy < cropH) {
            const l = getLum(sx, sy);
            if (l > bestLum) {
              bestLum = l;
              bestX = sx;
              bestY = sy;
            }
          }
        }
        if (bestLum >= bgLum - 15) break;
      }
      localSeedX = bestX;
      localSeedY = bestY;
    }

    // Dynamic adaptive threshold for ink line barrier
    const inkDelta = Math.max(20, Math.min(50, (bgLum - minLum) * 0.40));
    const inkThreshold = Math.max(60, Math.min(175, bgLum - inkDelta));

    // 2. Build raw barrier mask (1 = ink line / ail boundary, 0 = interior paper)
    const rawBarrier = new Uint8Array(cropW * cropH);
    for (let y = 0; y < cropH; y++) {
      for (let x = 0; x < cropW; x++) {
        if (getLum(x, y) <= inkThreshold) {
          rawBarrier[y * cropW + x] = 1;
        }
      }
    }

    // 3. Dual-Pass Flood Fill with Morphological Gap-Closing:
    // Pass 1: Dilate 1px (3x3 kernel) to close 1-2px line breaks cleanly
    // Pass 2: If Pass 1 leaks to crop border (faint breaks in boundary), dilate 2px (5x5 kernel) to seal breaks up to 4px
    function runFloodFill(dilationRadius) {
      const closedBarrier = new Uint8Array(cropW * cropH);
      for (let y = 0; y < cropH; y++) {
        for (let x = 0; x < cropW; x++) {
          if (rawBarrier[y * cropW + x] === 1) {
            closedBarrier[y * cropW + x] = 1;
            for (let dy = -dilationRadius; dy <= dilationRadius; dy++) {
              for (let dx = -dilationRadius; dx <= dilationRadius; dx++) {
                if (Math.abs(dx) + Math.abs(dy) <= dilationRadius + 0.5) {
                  const nx = x + dx;
                  const ny = y + dy;
                  if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH) {
                    closedBarrier[ny * cropW + nx] = 1;
                  }
                }
              }
            }
          }
        }
      }

      let sX = localSeedX;
      let sY = localSeedY;
      if (closedBarrier[sY * cropW + sX] === 1) {
        let unblocked = false;
        for (let r = 1; r <= 10 && !unblocked; r++) {
          for (let dy = -r; dy <= r && !unblocked; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              const nx = sX + dx;
              const ny = sY + dy;
              if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH && closedBarrier[ny * cropW + nx] === 0) {
                sX = nx;
                sY = ny;
                unblocked = true;
                break;
              }
            }
          }
        }
        if (!unblocked) return null;
      }

      const visited = new Uint8Array(cropW * cropH);
      const qx = new Int32Array(cropW * cropH);
      const qy = new Int32Array(cropW * cropH);
      let head = 0, tail = 0;

      visited[sY * cropW + sX] = 1;
      qx[tail] = sX;
      qy[tail] = sY;
      tail++;

      let minX = sX, maxX = sX, minY = sY, maxY = sY;
      let hitCropBorder = false;

      while (head < tail) {
        const cx = qx[head];
        const cy = qy[head];
        head++;

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        // If fill hits the edge of our crop box, boundary leaked or didn't close
        if (cx <= 1 || cx >= cropW - 2 || cy <= 1 || cy >= cropH - 2) {
          hitCropBorder = true;
          break;
        }

        const nbs = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1]
        ];

        for (let i = 0; i < 4; i++) {
          const nx = nbs[i][0];
          const ny = nbs[i][1];
          if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH) {
            const nidx = ny * cropW + nx;
            if (visited[nidx] === 0 && closedBarrier[nidx] === 0) {
              visited[nidx] = 1;
              qx[tail] = nx;
              qy[tail] = ny;
              tail++;
            }
          }
        }
      }

      return {
        hitCropBorder,
        count: tail,
        visited,
        minX, maxX, minY, maxY
      };
    }

    let fillResult = runFloodFill(1);
    // If Pass 1 leaked due to faint micro-breaks in scanned vintage ails, retry with Pass 2 (radius 2 dilation)
    if (!fillResult || fillResult.hitCropBorder || fillResult.count > cropW * cropH * 0.70) {
      fillResult = runFloodFill(2);
    }

    if (!fillResult || fillResult.hitCropBorder || fillResult.count > cropW * cropH * 0.75) {
      showToast('দাগের সীমানা সম্পূর্ণ বন্ধ (Closed) নয় অথবা অতিরিক্ত বড় এলাকা', 'warning');
      return;
    }

    if (fillResult.count < 35) {
      showToast('খুব ছোট এলাকা চিহ্নিত হয়েছে। দাগের ফাঁকা অংশে ক্লিক করুন।', 'warning');
      return;
    }

    // 4. Restore plot boundary to original line center (dilating back visited mask)
    const { visited, minX, maxX, minY, maxY } = fillResult;
    const plotMask = new Uint8Array(cropW * cropH);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (visited[y * cropW + x] === 1) {
          plotMask[y * cropW + x] = 1;
          if (x > 0 && rawBarrier[y * cropW + (x - 1)] === 0) plotMask[y * cropW + (x - 1)] = 1;
          if (x < cropW - 1 && rawBarrier[y * cropW + (x + 1)] === 0) plotMask[y * cropW + (x + 1)] = 1;
          if (y > 0 && rawBarrier[(y - 1) * cropW + x] === 0) plotMask[(y - 1) * cropW + x] = 1;
          if (y < cropH - 1 && rawBarrier[(y + 1) * cropW + x] === 0) plotMask[(y + 1) * cropW + x] = 1;
        }
      }
    }

    // 5. Fill interior text holes (Bengali dag numbers like "৫১৩", well/pond symbols inside the plot)
    // Exterior flood fill from outer bounding box leaves internal islands seamlessly filled!
    const outsideMask = new Uint8Array(cropW * cropH);
    const oqx = new Int32Array(cropW * cropH);
    const oqy = new Int32Array(cropW * cropH);
    let ohead = 0, otail = 0;

    const padMinX = Math.max(0, minX - 6);
    const padMaxX = Math.min(cropW - 1, maxX + 6);
    const padMinY = Math.max(0, minY - 6);
    const padMaxY = Math.min(cropH - 1, maxY + 6);

    for (let x = padMinX; x <= padMaxX; x++) {
      if (plotMask[padMinY * cropW + x] === 0 && outsideMask[padMinY * cropW + x] === 0) {
        outsideMask[padMinY * cropW + x] = 1;
        oqx[otail] = x; oqy[otail] = padMinY; otail++;
      }
      if (plotMask[padMaxY * cropW + x] === 0 && outsideMask[padMaxY * cropW + x] === 0) {
        outsideMask[padMaxY * cropW + x] = 1;
        oqx[otail] = x; oqy[otail] = padMaxY; otail++;
      }
    }
    for (let y = padMinY; y <= padMaxY; y++) {
      if (plotMask[y * cropW + padMinX] === 0 && outsideMask[y * cropW + padMinX] === 0) {
        outsideMask[y * cropW + padMinX] = 1;
        oqx[otail] = padMinX; oqy[otail] = y; otail++;
      }
      if (plotMask[y * cropW + padMaxX] === 0 && outsideMask[y * cropW + padMaxX] === 0) {
        outsideMask[y * cropW + padMaxX] = 1;
        oqx[otail] = padMaxX; oqy[otail] = y; otail++;
      }
    }

    while (ohead < otail) {
      const cx = oqx[ohead];
      const cy = oqy[ohead];
      ohead++;

      const nbs = [
        [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
      ];
      for (let i = 0; i < 4; i++) {
        const nx = nbs[i][0];
        const ny = nbs[i][1];
        if (nx >= padMinX && nx <= padMaxX && ny >= padMinY && ny <= padMaxY) {
          const idx = ny * cropW + nx;
          if (outsideMask[idx] === 0 && plotMask[idx] === 0) {
            outsideMask[idx] = 1;
            oqx[otail] = nx;
            oqy[otail] = ny;
            otail++;
          }
        }
      }
    }

    // Solid plot mask: within bounding box, anything NOT outside is part of the plot
    const solidMask = new Uint8Array(cropW * cropH);
    for (let y = padMinY; y <= padMaxY; y++) {
      for (let x = padMinX; x <= padMaxX; x++) {
        if (outsideMask[y * cropW + x] === 0) {
          solidMask[y * cropW + x] = 1;
        }
      }
    }

    // 6. Robust Outer Perimeter Tracing (Clockwise Wall-Follower)
    let startPt = null;
    topSearch:
    for (let y = padMinY; y <= padMaxY; y++) {
      for (let x = padMinX; x <= padMaxX; x++) {
        if (solidMask[y * cropW + x] === 1) {
          startPt = { x, y };
          break topSearch;
        }
      }
    }

    if (!startPt) {
      showToast('বাউন্ডারি কনট্যুর চিহ্নিত করা যায়নি', 'error');
      return;
    }

    // 8-direction clockwise offsets
    const dirs = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 1, dy: 1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: -1, dy: -1 }
    ];

    const contour = [];
    let curX = startPt.x;
    let curY = startPt.y;
    let checkDir = 6; // start checking from west
    const maxSteps = 16000;
    let steps = 0;

    contour.push({ x: curX, y: curY });

    while (steps < maxSteps) {
      steps++;
      let foundNext = false;
      for (let i = 0; i < 8; i++) {
        const dirIdx = (checkDir + i) % 8;
        const nx = curX + dirs[dirIdx].dx;
        const ny = curY + dirs[dirIdx].dy;

        if (nx >= padMinX && nx <= padMaxX && ny >= padMinY && ny <= padMaxY) {
          if (solidMask[ny * cropW + nx] === 1) {
            curX = nx;
            curY = ny;
            contour.push({ x: curX, y: curY });
            checkDir = (dirIdx + 5) % 8;
            foundNext = true;
            break;
          }
        }
      }

      if (!foundNext) break;
      if (curX === startPt.x && curY === startPt.y && contour.length > 5) break;
    }

    if (contour.length < 5) {
      showToast('সঠিক বাউন্ডারি পাওয়া যায়নি, দাগের মাঝে পুনরায় ক্লিক করুন', 'warning');
      return;
    }

    // 7. Simplify with Ramer-Douglas-Peucker (RDP) & Cadastral Collinear Pruning
    const stepContour = [];
    const stepSize = Math.max(1, Math.floor(contour.length / 320));
    for (let i = 0; i < contour.length; i += stepSize) {
      stepContour.push(contour[i]);
    }
    if (stepContour.length > 0) stepContour.push(stepContour[0]);

    // RDP with balanced 2.5px tolerance
    let simplifiedPixelPts = simplifyRDP(stepContour, 2.5);

    if (simplifiedPixelPts.length > 3 &&
        simplifiedPixelPts[0].x === simplifiedPixelPts[simplifiedPixelPts.length - 1].x &&
        simplifiedPixelPts[0].y === simplifiedPixelPts[simplifiedPixelPts.length - 1].y) {
      simplifiedPixelPts.pop();
    }

    // CAD Cadastral Collinear Smoothing: eliminates staircase zig-zag raster noise along straight ails
    simplifiedPixelPts = pruneCollinearPoints(simplifiedPixelPts, 5.5);

    if (simplifiedPixelPts.length < 3) {
      simplifiedPixelPts = simplifyRDP(stepContour, 1.8);
      if (simplifiedPixelPts.length > 3 &&
          simplifiedPixelPts[0].x === simplifiedPixelPts[simplifiedPixelPts.length - 1].x &&
          simplifiedPixelPts[0].y === simplifiedPixelPts[simplifiedPixelPts.length - 1].y) {
        simplifiedPixelPts.pop();
      }
    }

    if (simplifiedPixelPts.length < 3) {
      showToast('দাগের ভেতরে পুনরায় ক্লিক করে চেষ্টা করুন', 'warning');
      return;
    }

    // 8. Convert Crop Pixel Coordinates back to CAD World Coordinates on this specific map sheet
    const worldVertices = simplifiedPixelPts.map(pt => {
      const globalPx = pt.x + cropX0;
      const globalPy = pt.y + cropY0;
      let wx = mm.x + (globalPx / origW) * mm.width;
      let wy = mm.y + (globalPy / origH) * mm.height;

      if (mm.rotation && mm.rotation !== 0) {
        const cx = mm.x + mm.width / 2;
        const cy = mm.y + mm.height / 2;
        const rad = (mm.rotation * Math.PI) / 180;
        const dx = wx - cx;
        const dy = wy - cy;
        wx = cx + dx * Math.cos(rad) - dy * Math.sin(rad);
        wy = cy + dx * Math.sin(rad) + dy * Math.cos(rad);
      }
      return { x: wx, y: wy };
    });

    // 9. Auto-create Plot Entity with Bengali naming & Survey Metrics
    const newPlotNumber = state.nextPlotNumber || (101 + state.plots.length);
    state.nextPlotNumber = newPlotNumber + 1;
    const newPlotId = 'plot-magic-' + newPlotNumber + '-' + Date.now();
    const bnNum = toBanglaDigits(newPlotNumber);

    const palette = [
      { fill: 'rgba(168, 85, 247, 0.22)', stroke: '#a855f7' },
      { fill: 'rgba(236, 72, 153, 0.22)', stroke: '#ec4899' },
      { fill: 'rgba(56, 189, 248, 0.22)', stroke: '#38bdf8' },
      { fill: 'rgba(245, 158, 11, 0.22)', stroke: '#f59e0b' },
      { fill: 'rgba(16, 185, 129, 0.22)', stroke: '#10b981' }
    ];
    const colorStyle = palette[state.plots.length % palette.length];

    const newPlot = {
      id: newPlotId,
      name: 'দাগ নং ' + bnNum,
      layer: 'plots',
      mapSheetId: mm.id,
      fillColor: colorStyle.fill,
      strokeColor: colorStyle.stroke,
      vertices: worldVertices
    };

    state.plots.push(newPlot);
    state.selectedPlotId = newPlotId;
    pushHistory();
    updateInspector();
    render();

    // Trigger Visual Ripple Flash on the newly created plot
    flashPlotDetected(worldVertices);

    // Calculate Area for user toast feedback
    const areaSqLk = calculatePolygonArea(worldVertices);
    const sqFt = areaSqLk * (FEET_PER_LINK * FEET_PER_LINK);
    const decimal = sqFt / 435.6;
    showToast(`🪄 দাগ নং ${bnNum} চিহ্নিত হয়েছে: ${decimal.toFixed(2)} শতক (${sqFt.toFixed(0)} বর্গফুট)। প্রয়োজনে দাগ নম্বর পরিবর্তন করুন।`, 'success');

    // Show floating quick-rename badge right over the newly detected plot
    const centroid = calculateCentroid(worldVertices);
    const sc = worldToScreen(centroid.x, centroid.y);
    showFloatingRenameBox(newPlotId, sc.x, sc.y);
  }

  // Point to finite segment distance
  function pointToSegmentDistance(pt, p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(pt.x - p1.x, pt.y - p1.y);
    let t = ((pt.x - p1.x) * dx + (pt.y - p1.y) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(pt.x - (p1.x + t * dx), pt.y - (p1.y + t * dy));
  }

  // MinHeap implementation for ultra-fast A* pathfinding on mouza ink raster
  class AStarMinHeap {
    constructor() {
      this.heap = [];
    }
    push(node) {
      this.heap.push(node);
      this._bubbleUp(this.heap.length - 1);
    }
    pop() {
      if (this.heap.length === 0) return null;
      const top = this.heap[0];
      const bottom = this.heap.pop();
      if (this.heap.length > 0) {
        this.heap[0] = bottom;
        this._sinkDown(0);
      }
      return top;
    }
    get size() {
      return this.heap.length;
    }
    _bubbleUp(idx) {
      const element = this.heap[idx];
      while (idx > 0) {
        const parentIdx = (idx - 1) >> 1;
        const parent = this.heap[parentIdx];
        if (element.f >= parent.f) break;
        this.heap[idx] = parent;
        idx = parentIdx;
      }
      this.heap[idx] = element;
    }
    _sinkDown(idx) {
      const length = this.heap.length;
      const element = this.heap[idx];
      while (true) {
        let leftChildIdx = (idx << 1) + 1;
        let rightChildIdx = leftChildIdx + 1;
        let swapIdx = -1;
        if (leftChildIdx < length && this.heap[leftChildIdx].f < element.f) {
          swapIdx = leftChildIdx;
        }
        if (rightChildIdx < length) {
          if (
            (swapIdx === -1 && this.heap[rightChildIdx].f < element.f) ||
            (swapIdx !== -1 && this.heap[rightChildIdx].f < this.heap[leftChildIdx].f)
          ) {
            swapIdx = rightChildIdx;
          }
        }
        if (swapIdx === -1) break;
        this.heap[idx] = this.heap[swapIdx];
        idx = swapIdx;
      }
      this.heap[idx] = element;
    }
  }

  // Find projected point and distance info along polygon perimeter
  function getPerimeterInfo(poly, pt) {
    let totalPerimeter = 0;
    const segLengths = [];
    for (let i = 0; i < poly.length; i++) {
      const p1 = poly[i];
      const p2 = poly[(i + 1) % poly.length];
      const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      segLengths.push(len);
      totalPerimeter += len;
    }

    let bestDist = Infinity;
    let bestT = 0;
    let bestProj = null;
    let bestSegIdx = 0;
    let currentAccum = 0;

    for (let i = 0; i < poly.length; i++) {
      const p1 = poly[i];
      const p2 = poly[(i + 1) % poly.length];
      const d = pointToSegmentDistance({ x: pt[0], y: pt[1] }, { x: p1[0], y: p1[1] }, { x: p2[0], y: p2[1] });
      if (d < bestDist) {
        bestDist = d;
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const l2 = dx * dx + dy * dy;
        let t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((pt[0] - p1[0]) * dx + (pt[1] - p1[1]) * dy) / l2));
        bestProj = [p1[0] + t * dx, p1[1] + t * dy];
        bestSegIdx = i;
        bestT = currentAccum + Math.hypot(bestProj[0] - p1[0], bestProj[1] - p1[1]);
      }
      currentAccum += segLengths[i];
    }

    return { dist: bestDist, t: bestT, proj: bestProj, segIdx: bestSegIdx, totalPerimeter };
  }

  // Find intermediate ink / perimeter path between two world points on map
  function findInkPathBetweenPoints(ptA, ptB, mm) {
    if (!mm || !mm.loaded) {
      return [ptA, ptB];
    }

    // 1. Vector Demo Plots: Walk along polygon boundary perimeter
    if (mm.demoPlots && mm.demoPlots.length > 0) {
      const bW = mm.baseWidth || 900;
      const bH = mm.baseHeight || 650;
      const imgAX = ((ptA.x - mm.x) / mm.width) * bW;
      const imgAY = ((ptA.y - mm.y) / mm.height) * bH;
      const imgBX = ((ptB.x - mm.x) / mm.width) * bW;
      const imgBY = ((ptB.y - mm.y) / mm.height) * bH;

      for (const dp of mm.demoPlots) {
        const infoA = getPerimeterInfo(dp.poly, [imgAX, imgAY]);
        const infoB = getPerimeterInfo(dp.poly, [imgBX, imgBY]);
        if (infoA.dist <= 50 && infoB.dist <= 50) {
          const total = infoA.totalPerimeter;
          const fwdDist = (infoB.t - infoA.t + total) % total;
          const bwdDist = (infoA.t - infoB.t + total) % total;

          const imgPath = [infoA.proj];
          const n = dp.poly.length;

          if (fwdDist <= bwdDist) {
            let seg = infoA.segIdx;
            while (seg !== infoB.segIdx) {
              const corner = dp.poly[(seg + 1) % n];
              imgPath.push(corner);
              seg = (seg + 1) % n;
            }
          } else {
            let seg = infoA.segIdx;
            while (seg !== infoB.segIdx) {
              const corner = dp.poly[seg];
              imgPath.push(corner);
              seg = (seg - 1 + n) % n;
            }
          }
          imgPath.push(infoB.proj);

          // Convert imgPath back to world coordinates
          const worldPath = imgPath.map(p => ({
            x: mm.x + (p[0] / bW) * mm.width,
            y: mm.y + (p[1] / bH) * mm.height
          }));
          return worldPath;
        }
      }
    }

    // 2. Scanned Mouza Map Raster Sheet: A* Ink Ridge Pathfinder
    const srcCanvas = mm.filteredCanvas || mm.imageObj;
    if (!srcCanvas) return [ptA, ptB];

    const origW = srcCanvas.naturalWidth || srcCanvas.width;
    const origH = srcCanvas.naturalHeight || srcCanvas.height;
    if (!origW || !origH) return [ptA, ptB];

    const pxA = Math.max(0, Math.min(origW - 1, Math.round(((ptA.x - mm.x) / mm.width) * origW)));
    const pyA = Math.max(0, Math.min(origH - 1, Math.round(((ptA.y - mm.y) / mm.height) * origH)));
    let pxB = Math.max(0, Math.min(origW - 1, Math.round(((ptB.x - mm.x) / mm.width) * origW)));
    let pyB = Math.max(0, Math.min(origH - 1, Math.round(((ptB.y - mm.y) / mm.height) * origH)));

    // Bounding box with generous padding around the segment
    const pad = 65;
    const minX = Math.max(0, Math.min(pxA, pxB) - pad);
    const minY = Math.max(0, Math.min(pyA, pyB) - pad);
    const maxX = Math.min(origW - 1, Math.max(pxA, pxB) + pad);
    const maxY = Math.min(origH - 1, Math.max(pyA, pyB) + pad);
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    if (cropW <= 2 || cropH <= 2) return [ptA, ptB];

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
    cropCtx.drawImage(srcCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    const imgData = cropCtx.getImageData(0, 0, cropW, cropH);
    const pixels = imgData.data;

    function getLum(lx, ly) {
      if (lx < 0 || lx >= cropW || ly < 0 || ly >= cropH) return 255;
      const idx = (ly * cropW + lx) * 4;
      return 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
    }

    let startX = pxA - minX;
    let startY = pyA - minY;
    let targetX = pxB - minX;
    let targetY = pyB - minY;

    // Snap target to local dark ink ridge within 25px
    let bestDistTarget = 255;
    let snappedTargetX = targetX, snappedTargetY = targetY;
    for (let r = 0; r <= 25; r += 2) {
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        const tx = Math.round(targetX + Math.cos(a) * r);
        const ty = Math.round(targetY + Math.sin(a) * r);
        const l = getLum(tx, ty);
        if (l < bestDistTarget) {
          bestDistTarget = l;
          snappedTargetX = tx;
          snappedTargetY = ty;
        }
      }
    }
    if (bestDistTarget < 190) {
      targetX = snappedTargetX;
      targetY = snappedTargetY;
    }

    // A* Pathfinding along ink ridge
    const heap = new AStarMinHeap();
    const totalCells = cropW * cropH;
    const cameFrom = new Int32Array(totalCells).fill(-1);
    const gScore = new Float32Array(totalCells).fill(1e9);
    const closed = new Uint8Array(totalCells);

    const startIdx = startY * cropW + startX;
    gScore[startIdx] = 0;
    heap.push({
      x: startX,
      y: startY,
      idx: startIdx,
      f: Math.hypot(targetX - startX, targetY - startY)
    });

    const neighbors = [
      [-1, 0, 1], [1, 0, 1], [0, -1, 1], [0, 1, 1],
      [-1, -1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [1, 1, 1.414]
    ];

    let foundTarget = false;
    let finalIdx = -1;
    let iterations = 0;
    const maxIterations = Math.min(totalCells * 2, 70000);

    while (heap.size > 0 && iterations++ < maxIterations) {
      const current = heap.pop();
      const cx = current.x;
      const cy = current.y;
      const cIdx = current.idx;

      if (closed[cIdx]) continue;
      closed[cIdx] = 1;

      if (Math.abs(cx - targetX) <= 1 && Math.abs(cy - targetY) <= 1) {
        foundTarget = true;
        finalIdx = cIdx;
        break;
      }

      const currentG = gScore[cIdx];

      for (const [dx, dy, stepDist] of neighbors) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || nx >= cropW || ny < 0 || ny >= cropH) continue;

        const nIdx = ny * cropW + nx;
        if (closed[nIdx]) continue;

        const lum = getLum(nx, ny);
        let inkCost;
        if (lum <= 165) {
          inkCost = 1.0 + (lum / 165) * 1.5;
        } else {
          inkCost = 22.0 + ((lum - 165) / 90) * 65.0;
        }

        const tentativeG = currentG + stepDist * inkCost;

        if (tentativeG < gScore[nIdx]) {
          cameFrom[nIdx] = cIdx;
          gScore[nIdx] = tentativeG;
          const h = Math.hypot(targetX - nx, targetY - ny);
          heap.push({
            x: nx,
            y: ny,
            idx: nIdx,
            f: tentativeG + h * 1.05
          });
        }
      }
    }

    if (foundTarget && finalIdx !== -1) {
      const pixelPath = [{ x: targetX, y: targetY }];
      let curr = finalIdx;
      while (curr !== startIdx && curr !== -1) {
        pixelPath.push({ x: curr % cropW, y: Math.floor(curr / cropW) });
        curr = cameFrom[curr];
      }
      pixelPath.push({ x: startX, y: startY });
      pixelPath.reverse();

      // Convert to world coordinates
      const worldPts = pixelPath.map(p => ({
        x: mm.x + ((minX + p.x) / origW) * mm.width,
        y: mm.y + ((minY + p.y) / origH) * mm.height
      }));

      // Simplify to smooth natural CAD polyline
      const simplified = simplifyRDP(worldPts, 4.0);
      return simplified;
    }

    // Fallback: direct connection
    return [ptA, ptB];
  }

  // Closes an active traced boundary line and converts it into a full Plot entity
  function closeActiveTracedLineAsDag(activeLine) {
    if (!activeLine || !activeLine.vertices || activeLine.vertices.length < 2) return;

    activeLine.isLine = true;
    activeLine.layer = 'measurements';

    let totalLengthFt = 0;
    for (let i = 0; i < activeLine.vertices.length - 1; i++) {
      totalLengthFt += Math.hypot(
        activeLine.vertices[i + 1].x - activeLine.vertices[i].x,
        activeLine.vertices[i + 1].y - activeLine.vertices[i].y
      ) * FEET_PER_LINK;
    }
    const ftIn = convertFeetToFeetInches(totalLengthFt);
    const groundInches = Math.round(totalLengthFt * 12);
    const mapInches = totalLengthFt / getFeetPerMapInch();

    playCadSound('snap');
    showToast(`✅ সীমানা আইল সম্পন্ন: ${ftIn.formattedBengali} (মাটিতে ${toBanglaDigits(groundInches)} ইঞ্চি)`, 'success');

    state.activeTracedLineId = null;
    state.selectedPlotId = activeLine.id;
    if (drawHintBox) {
      drawHintBox.classList.remove('opacity-0');
      drawHintText.textContent = `✅ সীমানা আইল সম্পন্ন (${ftIn.formattedShortBengali})! নতুন আইল মাপতে যেকোনো আইলে ক্লিক করুন`;
    }
    pushHistory();
    updateInspector();
    render();
  }

  // Helper: Detect full aisle/boundary line segment under click
  function detectAisleSegmentAtClick(worldX, worldY, mm) {
    // 1. Vector edges check (existing plots/lines)
    const clickCoord = { x: worldX, y: worldY };
    const hitTol = 25 / state.camera.zoom;
    let bestPlotEdge = null;
    let bestDist = Infinity;

    for (const plot of state.plots) {
      if (plot.vertices && plot.vertices.length >= 2) {
        const edgeCount = plot.isLine ? (plot.vertices.length - 1) : plot.vertices.length;
        for (let i = 0; i < edgeCount; i++) {
          const p1 = plot.vertices[i];
          const p2 = plot.vertices[(i + 1) % plot.vertices.length];
          const dist = pointToSegmentDistance(clickCoord, p1, p2);
          if (dist < bestDist) {
            bestDist = dist;
            bestPlotEdge = [{ x: p1.x, y: p1.y }, { x: p2.x, y: p2.y }];
          }
        }
      }
    }
    if (bestPlotEdge && bestDist <= hitTol) {
      return bestPlotEdge;
    }

    if (!mm || !mm.loaded) {
      return [{ x: worldX - 20, y: worldY }, { x: worldX + 20, y: worldY }];
    }

    // 2. Demo Plots edge detection
    if (mm.demoPlots && mm.demoPlots.length > 0) {
      const bW = mm.baseWidth || 900;
      const bH = mm.baseHeight || 650;
      const imgX = ((worldX - mm.x) / mm.width) * bW;
      const imgY = ((worldY - mm.y) / mm.height) * bH;
      let closestEdge = null;
      let minDist = Infinity;

      for (const dp of mm.demoPlots) {
        for (let i = 0; i < dp.poly.length; i++) {
          const ptA = dp.poly[i];
          const ptB = dp.poly[(i + 1) % dp.poly.length];
          const dist = pointToSegmentDistance({ x: imgX, y: imgY }, { x: ptA[0], y: ptA[1] }, { x: ptB[0], y: ptB[1] });
          if (dist < minDist) {
            minDist = dist;
            closestEdge = { ptA, ptB };
          }
        }
      }

      if (closestEdge && minDist < 45) {
        return [
          { x: mm.x + (closestEdge.ptA[0] / bW) * mm.width, y: mm.y + (closestEdge.ptA[1] / bH) * mm.height },
          { x: mm.x + (closestEdge.ptB[0] / bW) * mm.width, y: mm.y + (closestEdge.ptB[1] / bH) * mm.height }
        ];
      }
    }

    // 3. Raster Mouza Ink Ridge Tracer (traces full aisle line under click)
    const srcCanvas = mm.filteredCanvas || mm.imageObj;
    if (srcCanvas) {
      const origW = srcCanvas.naturalWidth || srcCanvas.width;
      const origH = srcCanvas.naturalHeight || srcCanvas.height;
      if (origW && origH) {
        const relX = (worldX - mm.x) / mm.width;
        const relY = (worldY - mm.y) / mm.height;
        const seedX = Math.max(0, Math.min(origW - 1, Math.round(relX * origW)));
        const seedY = Math.max(0, Math.min(origH - 1, Math.round(relY * origH)));

        const cropR = 300;
        const cropX0 = Math.max(0, seedX - cropR);
        const cropY0 = Math.max(0, seedY - cropR);
        const cropX1 = Math.min(origW - 1, seedX + cropR);
        const cropY1 = Math.min(origH - 1, seedY + cropR);
        const cropW = cropX1 - cropX0 + 1;
        const cropH = cropY1 - cropY0 + 1;

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = cropW;
        cropCanvas.height = cropH;
        const cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
        cropCtx.drawImage(srcCanvas, cropX0, cropY0, cropW, cropH, 0, 0, cropW, cropH);
        const imgData = cropCtx.getImageData(0, 0, cropW, cropH);
        const pixels = imgData.data;

        function getLum(lx, ly) {
          if (lx < 0 || lx >= cropW || ly < 0 || ly >= cropH) return 255;
          const idx = (ly * cropW + lx) * 4;
          return 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
        }

        let localX = seedX - cropX0;
        let localY = seedY - cropY0;

        // Darkest ink point within 25px
        let bestX = localX, bestY = localY, minLum = 255;
        for (let r = 0; r <= 25; r += 2) {
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
            const tx = Math.round(localX + Math.cos(a) * r);
            const ty = Math.round(localY + Math.sin(a) * r);
            const l = getLum(tx, ty);
            if (l < minLum) {
              minLum = l;
              bestX = tx;
              bestY = ty;
            }
          }
        }
        localX = bestX;
        localY = bestY;

        if (minLum < 190) {
          // Sample background
          let bgSamples = [];
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
            bgSamples.push(getLum(Math.round(localX + Math.cos(a) * 35), Math.round(localY + Math.sin(a) * 35)));
          }
          bgSamples.sort((a, b) => a - b);
          const bgLum = bgSamples[Math.floor(bgSamples.length * 0.75)] || 240;
          const inkThreshold = Math.min(185, minLum + (bgLum - minLum) * 0.65);

          // Find principal orientation
          let bestAngle = 0;
          let maxContrast = 0;
          for (let a = 0; a < Math.PI; a += Math.PI / 16) {
            const p1x = Math.round(localX + Math.cos(a) * 8);
            const p1y = Math.round(localY + Math.sin(a) * 8);
            const p2x = Math.round(localX - Math.cos(a) * 8);
            const p2y = Math.round(localY - Math.sin(a) * 8);
            const alongLum = (getLum(p1x, p1y) + getLum(p2x, p2y)) / 2;

            const perpA = a + Math.PI / 2;
            const q1x = Math.round(localX + Math.cos(perpA) * 8);
            const q1y = Math.round(localY + Math.sin(perpA) * 8);
            const q2x = Math.round(localX - Math.cos(perpA) * 8);
            const q2y = Math.round(localY - Math.sin(perpA) * 8);
            const acrossLum = (getLum(q1x, q1y) + getLum(q2x, q2y)) / 2;

            const contrast = acrossLum - alongLum;
            if (contrast > maxContrast) {
              maxContrast = contrast;
              bestAngle = a;
            }
          }

          function traceInDirection(initAngle) {
            let cx = localX, cy = localY;
            let angle = initAngle;
            const pts = [{ x: cx, y: cy }];
            for (let step = 0; step < 260; step++) {
              let forwardMinLum = 255;
              let nextX = cx, nextY = cy;
              let chosenAngle = angle;

              for (let da of [-0.35, -0.18, 0, 0.18, 0.35]) {
                const testA = angle + da;
                const tx = Math.round(cx + Math.cos(testA) * 3);
                const ty = Math.round(cy + Math.sin(testA) * 3);
                const l = getLum(tx, ty);
                if (l < forwardMinLum) {
                  forwardMinLum = l;
                  nextX = tx;
                  nextY = ty;
                  chosenAngle = testA;
                }
              }

              if (forwardMinLum > inkThreshold) break;
              if (nextX <= 3 || nextX >= cropW - 4 || nextY <= 3 || nextY >= cropH - 4) break;

              cx = nextX;
              cy = nextY;
              angle = chosenAngle;
              pts.push({ x: cx, y: cy });
            }
            return pts;
          }

          const fwd = traceInDirection(bestAngle);
          const bwd = traceInDirection(bestAngle + Math.PI);
          bwd.reverse();
          const fullLineCrop = [...bwd, ...fwd.slice(1)];

          if (fullLineCrop.length >= 6) {
            const simplified = simplifyRDP(fullLineCrop, 2.8);
            return simplified.map(p => ({
              x: mm.x + ((cropX0 + p.x) / origW) * mm.width,
              y: mm.y + ((cropY0 + p.y) / origH) * mm.height
            }));
          }
        }
      }
    }

    return [{ x: worldX - 15, y: worldY }, { x: worldX + 15, y: worldY }];
  }

  // Chaining & connecting boundary line segments in continuous Line Wand mode
  function applyDetectedBoundarySegment(newVertices, sourceName = 'সীমানা আইল') {
    if (!newVertices || newVertices.length < 2) return;

    const snapThreshold = 65 / state.camera.zoom;
    let activeLine = state.plots.find(p => (p.id === state.activeTracedLineId || p.id === state.selectedPlotId) && p.isLine);

    let isConnected = false;
    const mm = state.mouzaMap;

    if (activeLine && activeLine.vertices && activeLine.vertices.length >= 2) {
      const actStart = activeLine.vertices[0];
      const actEnd = activeLine.vertices[activeLine.vertices.length - 1];
      const newStart = newVertices[0];
      const newEnd = newVertices[newVertices.length - 1];

      const dEndStart = Math.hypot(actEnd.x - newStart.x, actEnd.y - newStart.y);
      const dEndEnd = Math.hypot(actEnd.x - newEnd.x, actEnd.y - newEnd.y);
      const dStartEnd = Math.hypot(actStart.x - newEnd.x, actStart.y - newEnd.y);
      const dStartStart = Math.hypot(actStart.x - newStart.x, actStart.y - newStart.y);

      if (dEndStart <= snapThreshold) {
        newVertices[0] = { x: actEnd.x, y: actEnd.y };
        activeLine.vertices.push(...newVertices.slice(1));
        isConnected = true;
      } else if (dEndEnd <= snapThreshold) {
        const rev = [...newVertices].reverse();
        rev[0] = { x: actEnd.x, y: actEnd.y };
        activeLine.vertices.push(...rev.slice(1));
        isConnected = true;
      } else if (dStartEnd <= snapThreshold) {
        newVertices[newVertices.length - 1] = { x: actStart.x, y: actStart.y };
        activeLine.vertices = [...newVertices.slice(0, -1), ...activeLine.vertices];
        isConnected = true;
      } else if (dStartStart <= snapThreshold) {
        const rev = [...newVertices].reverse();
        rev[rev.length - 1] = { x: actStart.x, y: actStart.y };
        activeLine.vertices = [...rev.slice(0, -1), ...activeLine.vertices];
        isConnected = true;
      } else {
        // User clicked another aisle with a gap! Connect between the lines!
        const pA = actEnd;
        const pB = (dEndStart <= dEndEnd) ? newStart : newEnd;
        const isReversed = (pB === newEnd);
        const connecting = findInkPathBetweenPoints(pA, pB, mm);
        const toAdd = isReversed ? [...newVertices].reverse() : newVertices;

        if (connecting && connecting.length >= 2) {
          activeLine.vertices.push(...connecting.slice(1), ...toAdd.slice(1));
          isConnected = true;
        }
      }
    }

    if (!isConnected) {
      // Start a new line entity
      const lineId = 'line-edge-' + Date.now();
      const lineCount = state.plots.filter(p => p.isLine).length + 1;
      activeLine = {
        id: lineId,
        name: `${sourceName} ${toBanglaDigits(lineCount)}`,
        layer: 'measurements',
        isLine: true,
        fillColor: 'transparent',
        strokeColor: '#ec4899',
        strokeWidth: 2.8,
        vertices: newVertices
      };
      state.plots.push(activeLine);
      state.selectedPlotId = lineId;
      state.activeTracedLineId = lineId;
    }

    // Cumulative length along all polyline segments in Links & Feet
    let totalLengthLinks = 0;
    for (let i = 0; i < activeLine.vertices.length - 1; i++) {
      totalLengthLinks += Math.hypot(
        activeLine.vertices[i + 1].x - activeLine.vertices[i].x,
        activeLine.vertices[i + 1].y - activeLine.vertices[i].y
      );
    }
    const totalFt = totalLengthLinks * FEET_PER_LINK;
    const ftIn = convertFeetToFeetInches(totalFt);
    const groundInches = Math.round(totalFt * 12);
    const mapInches = totalFt / getFeetPerMapInch();

    // Check if loop closure formed
    const vStart = activeLine.vertices[0];
    const vEnd = activeLine.vertices[activeLine.vertices.length - 1];
    const isLoopClosed = activeLine.vertices.length >= 4 && Math.hypot(vStart.x - vEnd.x, vStart.y - vEnd.y) <= snapThreshold;

    state.tool = 'line-wand';
    updateToolUI();
    updateInspector();
    pushHistory();
    render();
    playCadSound('snap');

    if (isLoopClosed) {
      showToast(`🎉 সম্পূর্ণ বাউন্ডারি সংযুক্ত হয়েছে: ${ftIn.formattedBengali} (মাটিতে ${toBanglaDigits(groundInches)} ইঞ্চি)`, 'success');
      drawHintBox.classList.remove('opacity-0');
      drawHintText.textContent = `🎉 সম্পূর্ণ বাউন্ডারি সংযুক্ত: ${ftIn.formattedBengali} (মাটিতে ${toBanglaDigits(groundInches)} ইঞ্চি)`;
    } else if (isConnected) {
      showToast(`🔗 আইল সংযুক্ত হয়েছে: ${ftIn.formattedBengali} (মাটিতে ${toBanglaDigits(groundInches)} ইঞ্চি • নকশায় ${toBanglaDigits(mapInches.toFixed(2))} ইঞ্চি)`, 'success');
      drawHintBox.classList.remove('opacity-0');
      drawHintText.textContent = `⚡ চিহ্নিত আইল: ${ftIn.formattedBengali} (মাটিতে ${toBanglaDigits(groundInches)} ইঞ্চি) | পরবর্তী আইলে ক্লিক করুন (মাঝের অংশ অটো কানেক্ট হবে)`;
    } else {
      showToast(`📍 আইল চিহ্নিত হয়েছে: ${ftIn.formattedBengali} (মাটিতে ${toBanglaDigits(groundInches)} ইঞ্চি)`, 'success');
      drawHintBox.classList.remove('opacity-0');
      drawHintText.textContent = `⚡ চিহ্নিত আইল: ${ftIn.formattedBengali} (মাটিতে ${toBanglaDigits(groundInches)} ইঞ্চি) | পরবর্তী আইলে ক্লিক করুন (মাঝের অংশ অটো কানেক্ট হবে)`;
    }
  }

  // Boundary Line Tracer (Click on any line to detect it, and chain with other lines)
  function detectBoundaryLineFromClick(worldX, worldY) {
    const mm = getMapAtWorldCoord(worldX, worldY) || state.mouzaMap;
    const snapCloseRadius = 50 / state.camera.zoom;

    let activeLine = state.plots.find(p => (p.id === state.activeTracedLineId || p.id === state.selectedPlotId) && p.isLine);

    // If user clicks near the starting vertex of an active line, close the loop!
    if (activeLine && activeLine.vertices && activeLine.vertices.length >= 3) {
      const firstPt = activeLine.vertices[0];
      const distToFirst = Math.hypot(worldX - firstPt.x, worldY - firstPt.y);
      if (distToFirst <= snapCloseRadius) {
        closeActiveTracedLineAsDag(activeLine);
        return;
      }
    }

    // Detect the aisle line under the click!
    const detectedSegment = detectAisleSegmentAtClick(worldX, worldY, mm);
    if (detectedSegment && detectedSegment.length >= 2) {
      applyDetectedBoundarySegment(detectedSegment, 'সীমানা আইল');
    }
  }

  // Utility: Draw crisp rounded rectangle
  function drawRoundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  // Generate an Authentic, Ultra-Realistic Bangladeshi RS Mouza Map Sheet
  function initDemoMouzaMap() {
    const w = 900;
    const h = 650;
    const scaleFactor = 2; // 2x backing store for ultra crisp sharpness
    const offCanvas = document.createElement('canvas');
    offCanvas.width = w * scaleFactor;
    offCanvas.height = h * scaleFactor;
    const g = offCanvas.getContext('2d');
    g.scale(scaleFactor, scaleFactor);

    // 1. Vintage Cadastral Sheet Parchment Background
    g.fillStyle = '#faf7ee';
    g.fillRect(0, 0, w, h);

    // Subtle Cadastral Grid Coordinates (Cross ticks)
    g.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    g.lineWidth = 1;
    for (let gx = 50; gx < w; gx += 100) {
      for (let gy = 50; gy < h; gy += 100) {
        g.beginPath();
        g.moveTo(gx - 5, gy); g.lineTo(gx + 5, gy);
        g.moveTo(gx, gy - 5); g.lineTo(gx, gy + 5);
        g.stroke();
      }
    }

    // 2. Dual Cadastral Border & Outer Sheet Frame
    g.strokeStyle = '#18181b';
    g.lineWidth = 3.5;
    g.strokeRect(20, 18, 860, 614);
    g.lineWidth = 1;
    g.strokeRect(26, 24, 848, 602);

    // 3. Official Government Survey Sheet Header
    g.fillStyle = '#18181b';
    g.font = 'bold 13px "Noto Sans Bengali", sans-serif';
    g.textAlign = 'center';
    g.fillText('গণপ্রজাতন্ত্রী বাংলাদেশ সরকার — ভূমি রেকর্ড ও জরিপ অধিদপ্তর', 450, 42);

    g.font = 'bold 15px "Noto Sans Bengali", sans-serif';
    g.fillText('মৌজা: রূপনগর • জে.এল. নং: ৪২ • থানা: সাভার • জেলা: ঢাকা', 450, 64);

    g.font = 'bold 11px "Noto Sans Bengali", sans-serif';
    g.fillStyle = '#3f3f46';
    g.fillText('আর.এস. জরিপ (১৯৫৬-১৯৬২) • স্কেল: ১৬ ইঞ্চি = ১ মাইল • শীট নং: ০১', 450, 80);

    // Header Divider Lines
    g.strokeStyle = '#18181b';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(30, 92);
    g.lineTo(870, 92);
    g.stroke();

    // 4. North Arrow (ঐতিহ্যবাহী কম্পাস উত্তর দিক)
    g.save();
    g.translate(830, 56);
    g.beginPath();
    g.arc(0, 0, 16, 0, Math.PI * 2);
    g.strokeStyle = '#18181b';
    g.lineWidth = 1.5;
    g.stroke();
    // Arrow
    g.beginPath();
    g.moveTo(0, -14);
    g.lineTo(5, 10);
    g.lineTo(0, 5);
    g.lineTo(-5, 10);
    g.closePath();
    g.fillStyle = '#18181b';
    g.fill();
    g.font = 'bold 10px monospace';
    g.fillStyle = '#18181b';
    g.textAlign = 'center';
    g.fillText('N', 0, -18);
    g.restore();

    // 5. Main Public Road (১২ ফুট সরকারি পাকা রাস্তা) with Hatching
    g.save();
    g.fillStyle = '#f4efe4';
    g.beginPath();
    g.moveTo(30, 96);
    g.lineTo(870, 96);
    g.lineTo(870, 126);
    g.lineTo(30, 126);
    g.closePath();
    g.fill();
    g.strokeStyle = '#18181b';
    g.lineWidth = 2.5;
    g.stroke();

    // Road diagonal stripe hatching
    g.strokeStyle = '#a1a1aa';
    g.lineWidth = 1;
    for (let rx = 35; rx < 865; rx += 14) {
      g.beginPath();
      g.moveTo(rx, 96);
      g.lineTo(rx + 10, 126);
      g.stroke();
    }

    g.fillStyle = '#18181b';
    g.font = 'bold 12px "Noto Sans Bengali", sans-serif';
    g.textAlign = 'center';
    g.fillText('১২ ফুট চওড়া সরকারি পাকা রাস্তা (উত্তরে সাভার মহাসড়ক সংযোগ)', 450, 116);
    g.restore();

    // 6. Branch Halot / Kacha Meathopath (৬ ফুট হালট / মেঠোপথ)
    g.save();
    g.fillStyle = '#f7f2e9';
    g.beginPath();
    g.moveTo(275, 126);
    g.lineTo(290, 126);
    g.lineTo(298, 595);
    g.lineTo(283, 595);
    g.closePath();
    g.fill();
    g.strokeStyle = '#52525b';
    g.lineWidth = 1.5;
    g.setLineDash([4, 3]);
    g.stroke();
    g.setLineDash([]);
    g.font = 'bold 9px "Noto Sans Bengali", sans-serif';
    g.fillStyle = '#52525b';
    g.fillText('৬ ফুট হালট', 290, 260);
    g.restore();

    // 7. Pond / Dighi (দাগ নং ৫২৫ - নীল পুকুর জলাশয়)
    g.save();
    g.fillStyle = 'rgba(186, 230, 253, 0.55)';
    g.beginPath();
    g.moveTo(560, 395);
    g.lineTo(730, 390);
    g.lineTo(725, 500);
    g.lineTo(555, 505);
    g.closePath();
    g.fill();
    g.strokeStyle = '#0284c7';
    g.lineWidth = 2;
    g.stroke();

    // Water wave ripples
    g.strokeStyle = '#0284c7';
    g.lineWidth = 1.2;
    for (let wy = 415; wy < 490; wy += 18) {
      g.beginPath();
      g.moveTo(580, wy);
      g.quadraticCurveTo(600, wy - 3, 620, wy);
      g.quadraticCurveTo(640, wy + 3, 660, wy);
      g.quadraticCurveTo(680, wy - 3, 700, wy);
      g.stroke();
    }
    g.fillStyle = '#0369a1';
    g.font = 'bold 14px "Noto Sans Bengali", sans-serif';
    g.textAlign = 'center';
    g.fillText('৫২৫ (পুকুর)', 640, 455);
    g.restore();

    // 8. Homestead / Vita (দাগ নং ৫২৬ - বাড়ি ও বাগান)
    g.save();
    g.fillStyle = 'rgba(254, 240, 138, 0.35)';
    g.beginPath();
    g.moveTo(730, 390);
    g.lineTo(845, 388);
    g.lineTo(840, 500);
    g.lineTo(725, 500);
    g.closePath();
    g.fill();
    g.strokeStyle = '#ca8a04';
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = '#854d0e';
    g.font = 'bold 14px "Noto Sans Bengali", sans-serif';
    g.textAlign = 'center';
    g.fillText('৫২৬ (ভিটা)', 785, 450);
    g.restore();

    // 9. All Cadastral Survey Plots (দাগ বাউন্ডারি ও বাংলা নম্বর)
    g.strokeStyle = '#18181b';
    g.lineWidth = 2.8;
    g.lineCap = 'round';
    g.lineJoin = 'round';

    const sheetPlots = [
      // Top Row (Agricultural & Commercial plots along road)
      { poly: [[50, 130], [160, 130], [160, 230], [50, 230]], label: '৫১২', cx: 105, cy: 185 },
      { poly: [[160, 130], [275, 130], [275, 230], [160, 230]], label: '৫১৩', cx: 218, cy: 185 },
      { poly: [[290, 130], [425, 130], [420, 235], [290, 235]], label: '৫১৪', cx: 358, cy: 185 },
      { poly: [[425, 130], [560, 130], [555, 235], [420, 235]], label: '৫১৫', cx: 490, cy: 185 },
      { poly: [[560, 130], [700, 130], [695, 240], [555, 235]], label: '৫১৬', cx: 628, cy: 185 },
      { poly: [[700, 130], [845, 130], [840, 240], [695, 240]], label: '৫১৭', cx: 770, cy: 185 },

      // Middle Row
      { poly: [[50, 230], [160, 230], [165, 395], [52, 400]], label: '৫১৮', cx: 108, cy: 315 },
      { poly: [[160, 230], [275, 230], [280, 390], [165, 395]], label: '৫১৯', cx: 220, cy: 312 },
      { poly: [[290, 235], [420, 235], [415, 390], [292, 390]], label: '৫২০', cx: 355, cy: 312 },
      { poly: [[420, 235], [555, 235], [550, 390], [415, 390]], label: '৫২১', cx: 485, cy: 312 },
      { poly: [[555, 235], [695, 240], [690, 390], [550, 390]], label: '৫২২', cx: 622, cy: 315 },
      { poly: [[695, 240], [840, 240], [845, 388], [690, 390]], label: '৫২৩', cx: 768, cy: 315 },

      // Bottom Row
      { poly: [[52, 400], [165, 395], [170, 595], [55, 595]], label: '৫২৪', cx: 112, cy: 495 },
      { poly: [[165, 395], [280, 390], [285, 595], [170, 595]], label: '৫২৮', cx: 225, cy: 495 },
      { poly: [[292, 390], [415, 390], [410, 595], [298, 595]], label: '৫২৯', cx: 354, cy: 495 },
      { poly: [[415, 390], [550, 390], [545, 595], [410, 595]], label: '৫৩০', cx: 480, cy: 495 },
      { poly: [[555, 505], [725, 500], [720, 595], [545, 595]], label: '৫৩১', cx: 635, cy: 550 },
      { poly: [[725, 500], [840, 500], [835, 595], [720, 595]], label: '৫৩২', cx: 780, cy: 550 }
    ];

    sheetPlots.forEach(p => {
      g.beginPath();
      g.moveTo(p.poly[0][0], p.poly[0][1]);
      for (let i = 1; i < p.poly.length; i++) {
        g.lineTo(p.poly[i][0], p.poly[i][1]);
      }
      g.closePath();
      g.stroke();

      if (p.label) {
        g.fillStyle = '#18181b';
        g.font = 'bold 17px "Noto Sans Bengali", sans-serif';
        g.textAlign = 'center';
        g.fillText(p.label, p.cx, p.cy);
      }
    });

    // 10. Survey Benchmarks / Pillars at Boundary Junctions
    const pillars = [
      [50, 130], [160, 130], [275, 130], [425, 130], [560, 130], [700, 130], [845, 130],
      [50, 230], [160, 230], [275, 230], [420, 235], [555, 235], [695, 240], [840, 240],
      [52, 400], [165, 395], [280, 390], [415, 390], [550, 390], [690, 390], [845, 388],
      [55, 595], [170, 595], [285, 595], [410, 595], [545, 595], [720, 595], [835, 595]
    ];

    pillars.forEach(([px, py]) => {
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(px, py, 3.5, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#18181b';
      g.lineWidth = 1.5;
      g.stroke();
    });

    // 11. Scale Bar & Legend Box (নকশা সংকেত) at Bottom Center
    g.save();
    g.translate(35, 602);
    g.fillStyle = '#3f3f46';
    g.font = 'bold 9px "Noto Sans Bengali", sans-serif';
    g.textAlign = 'left';
    g.fillText('নকশা সংকেত:  ━ পাকা রাস্তা   ┄ হালট   ⬚ সীমানা আইল   ■ পুকুর   ⨁ পিলার', 0, 14);

    // Chain scale bar
    g.strokeStyle = '#18181b';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(600, 10);
    g.lineTo(800, 10);
    g.stroke();
    for (let sc = 0; sc <= 200; sc += 50) {
      g.beginPath();
      g.moveTo(600 + sc, 6);
      g.lineTo(600 + sc, 14);
      g.stroke();
      g.font = '8px monospace';
      g.fillText((sc * 2) + ' lk', 595 + sc, 23);
    }
    g.restore();

    state.mouzaMap.imageObj = offCanvas;
    state.mouzaMap.filteredCanvas = offCanvas;
    state.mouzaMap.x = 0;
    state.mouzaMap.y = 0;
    state.mouzaMap.width = 900;
    state.mouzaMap.height = 650;
    state.mouzaMap.baseWidth = 900;
    state.mouzaMap.baseHeight = 650;
    state.mouzaMap.demoPlots = sheetPlots;
    state.mouzaMap.opacity = 0.95;
    state.mouzaMap.loaded = true;
  }

  // Default Mouza Map Loader (Faridganj, Khajuradia, 16" = 1 mile)
    // Default Mouza Sheet Initializer (Vector Authentic Faridganj Sheet)
    // Clean Professional Startup (No mock image forced!)
  function initDefaultMouzaMap() {
    state.mouzaMap.loaded = false;
    state.mouzaMap.isVector = false;
    state.mouzaMap.imageObj = null;
    state.mouzaMap.filteredCanvas = null;
    state.mouzaMap.isCalibrated = false;
    state.plots = [];
    state.pillars = [];
    state.annotations = [];
    state.selectedPlotId = null;

    updateScaleStatusBadge();
    updateInspector();
    render();
  }
  initDefaultMouzaMap();

  // Apply Pixel Filters to Scanned Map using an Offscreen Canvas
  function updateFilteredMouzaCanvas() {
    const targetMap = getActiveMouzaMap();
    if (!targetMap || !targetMap.imageObj) return;

    const { threshold, brightness, contrast } = targetMap.filters || { threshold: 0, brightness: 0, contrast: 0 };

    // Fast-path: If no custom filters applied, use high-resolution canvas directly
    if (threshold === 0 && brightness === 0 && contrast === 0) {
      targetMap.filteredCanvas = targetMap.imageObj;
      render();
      return;
    }

    const img = targetMap.imageObj;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = img.width;
    offCanvas.height = img.height;
    const offCtx = offCanvas.getContext('2d');

    offCtx.drawImage(img, 0, 0);

    const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const d = imgData.data;

    const bFactor = brightness * 2.55;
    const factor = contrast !== 0 ? (259 * (contrast + 255)) / (255 * (259 - contrast)) : 1;

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i] + bFactor;
      let g = d[i + 1] + bFactor;
      let b = d[i + 2] + bFactor;

      if (contrast !== 0) {
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (g - 128) + 128;
      }

      if (threshold > 0) {
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
        if (gray > threshold) {
          d[i] = 252;
          d[i + 1] = 251;
          d[i + 2] = 247;
          d[i + 3] = 235; // Authentic vintage mouza sheet paper
        } else {
          d[i] = 24;
          d[i + 1] = 24;
          d[i + 2] = 27; // Crisp black ink lines
          d[i + 3] = 255;
        }
      } else {
        d[i] = Math.max(0, Math.min(255, r));
        d[i + 1] = Math.max(0, Math.min(255, g));
        d[i + 2] = Math.max(0, Math.min(255, b));
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    targetMap.filteredCanvas = offCanvas;
    render();
  }

  
  // =========================================================================
  // Official Bangladeshi Cadastral Vector Mouza Map Sheet (Never Pixelates)
  // মৌজা: খাজুরাদিয়া, জে.এল: ১৬, ফরিদগঞ্জ, চাঁদপুর, স্কেল ১৬" = ১ মাইল
  // =========================================================================
  function drawVectorCadastralSheet() {
    const mm = state.mouzaMap;
    if (!mm.isVector) return;

    // 1. Cadastral Parchment Background
    const p1 = worldToScreen(0, 0);
    const p2 = worldToScreen(2400, 1600);
    const sheetW = p2.x - p1.x;
    const sheetH = p2.y - p1.y;

    ctx.save();
    ctx.fillStyle = '#faf7ed';
    ctx.fillRect(p1.x, p1.y, sheetW, sheetH);

    // Outer & Inner Cadastral Sheet Border
    const b1 = worldToScreen(20, 20);
    const b2 = worldToScreen(2380, 1580);
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = Math.max(1.5, 3.5 * state.camera.zoom);
    ctx.strokeRect(b1.x, b1.y, b2.x - b1.x, b2.y - b1.y);

    const bInner1 = worldToScreen(30, 30);
    const bInner2 = worldToScreen(2370, 1570);
    ctx.lineWidth = Math.max(0.8, 1.2 * state.camera.zoom);
    ctx.strokeRect(bInner1.x, bInner1.y, bInner2.x - bInner1.x, bInner2.y - bInner1.y);

    // Coordinate Grid cross-hairs every 400 links
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 1;
    for (let gx = 400; gx < 2400; gx += 400) {
      for (let gy = 400; gy < 1600; gy += 400) {
        const cp = worldToScreen(gx, gy);
        ctx.beginPath();
        ctx.moveTo(cp.x - 7, cp.y); ctx.lineTo(cp.x + 7, cp.y);
        ctx.moveTo(cp.x, cp.y - 7); ctx.lineTo(cp.x, cp.y + 7);
        ctx.stroke();
      }
    }

    // 2. Official Title Block (Top-Left)
    const tb1 = worldToScreen(50, 45);
    const tb2 = worldToScreen(780, 480);
    ctx.fillStyle = '#fffefb';
    ctx.fillRect(tb1.x, tb1.y, tb2.x - tb1.x, tb2.y - tb1.y);
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = Math.max(1, 2 * state.camera.zoom);
    ctx.strokeRect(tb1.x, tb1.y, tb2.x - tb1.x, tb2.y - tb1.y);

    // Title Text (Vector Scaled)
    const zoom = state.camera.zoom;
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';

    const tP1 = worldToScreen(75, 80);
    ctx.font = `bold ${Math.max(10, 15 * zoom)}px "Noto Sans Bengali", sans-serif`;
    ctx.fillText('গণপ্রজাতন্ত্রী বাংলাদেশ সরকার', tP1.x, tP1.y);

    const tP2 = worldToScreen(75, 115);
    ctx.font = `bold ${Math.max(9, 13 * zoom)}px "Noto Sans Bengali", sans-serif`;
    ctx.fillText('ভূমি রেকর্ড ও জরিপ অধিদপ্তর — আর.এস. নকশা', tP2.x, tP2.y);

    const tP3 = worldToScreen(75, 155);
    ctx.font = `bold ${Math.max(11, 16 * zoom)}px "Noto Sans Bengali", sans-serif`;
    ctx.fillText('উপজেলা: ফরিদগঞ্জ • মৌজা: খাজুরাদিয়া', tP3.x, tP3.y);

    const tP4 = worldToScreen(75, 190);
    ctx.font = `bold ${Math.max(9, 13 * zoom)}px "Noto Sans Bengali", sans-serif`;
    ctx.fillText('জে.এল. নং: ১৬ • সিট নং: ০১ • জেলা: চাঁদপুর', tP4.x, tP4.y);

    const tP5 = worldToScreen(75, 220);
    ctx.font = `${Math.max(8, 12 * zoom)}px "Noto Sans Bengali", sans-serif`;
    ctx.fillText('রেকর্ড সাবেকি নং: ৩৯৩৬ • জরিপকাল: ১৯৮৭-১৯৯২', tP5.x, tP5.y);

    const tP6 = worldToScreen(75, 255);
    ctx.font = `bold ${Math.max(10, 15 * zoom)}px "Noto Sans Bengali", sans-serif`;
    ctx.fillStyle = '#b91c1c';
    ctx.fillText('স্কেল: ১৬" = ১ মাইল (১০০ লিঙ্কে ১ চেইন, ৮০ চেইনে ১ মাইল)', tP6.x, tP6.y);

    // Divider line inside Title Block
    const div1 = worldToScreen(65, 275);
    const div2 = worldToScreen(765, 275);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = Math.max(0.8, 1.2 * zoom);
    ctx.beginPath();
    ctx.moveTo(div1.x, div1.y);
    ctx.lineTo(div2.x, div2.y);
    ctx.stroke();

    // 3. Official Gunter Scale Bar (0 to 10 Chains = Exact 1,000 Links in CAD units!)
    // 0 Chain at (100, 360), 10 Chains at (1100, 360) -> 1,000 links exact!
    // Inside the title box we show 0 to 6 chains (600 links), or full 10 chains across!
    const sbStart = worldToScreen(90, 370);
    const sbWidthLinks = 600; // 6 Chains = 600 Links
    const sbEnd = worldToScreen(90 + sbWidthLinks, 370);
    const barW = sbEnd.x - sbStart.x;
    const barH = Math.max(10, 16 * zoom);

    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${Math.max(9, 13 * zoom)}px "Noto Sans Bengali", sans-serif`;
    ctx.fillText('অফিসিয়াল গান্টার স্কেল বার (Gunter Scale Bar):', sbStart.x, sbStart.y - 12);

    // Segmented Chain Blocks (Each block = 1 Chain = 100 Links)
    const numChains = 6;
    for (let c = 0; c < numChains; c++) {
      const bx = sbStart.x + (c / numChains) * barW;
      const bw = barW / numChains;
      ctx.fillStyle = (c % 2 === 0) ? '#0f172a' : '#ffffff';
      ctx.fillRect(bx, sbStart.y, bw, barH);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = Math.max(1, 1.5 * zoom);
      ctx.strokeRect(bx, sbStart.y, bw, barH);

      // Label on top
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${Math.max(7, 10 * zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText((c * 100) + '', bx, sbStart.y - 3);
    }
    // Final end label
    ctx.fillText((numChains * 100) + ' lk (' + numChains + ' Ch)', sbStart.x + barW, sbStart.y - 3);

    // Additional large 10-Chain master calibration bar at bottom
    const mBar1 = worldToScreen(60, 440);
    const mBar2 = worldToScreen(60 + 1000, 440); // Exactly 1,000 Links = 10 Chains!
    const mWidth = mBar2.x - mBar1.x;
    const mHeight = Math.max(12, 18 * zoom);

    ctx.fillStyle = '#065f46';
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.max(8, 12 * zoom)}px "Noto Sans Bengali", sans-serif`;
    ctx.fillText('রেফারেন্স স্কেল: ০ থেকে ১০ চেইন (১০০০ লিংক = ৬৬০ ফুট):', mBar1.x, mBar1.y - 8);

    for (let ch = 0; ch < 10; ch++) {
      const segX = mBar1.x + (ch / 10) * mWidth;
      const segW = mWidth / 10;
      ctx.fillStyle = (ch % 2 === 0) ? '#047857' : '#ffffff';
      ctx.fillRect(segX, mBar1.y, segW, mHeight);
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = Math.max(1, 1.5 * zoom);
      ctx.strokeRect(segX, mBar1.y, segW, mHeight);

      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${Math.max(7, 9 * zoom)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(ch + '', segX, mBar1.y + mHeight + 12);
    }
    ctx.fillText('১০ চেইন', mBar1.x + mWidth, mBar1.y + mHeight + 12);

    // 4. Meandering Canal (খাজুরাদিয়া সরকারি খাল)
    const canalPoints = [
      { x: 790, y: 720 },
      { x: 1030, y: 710 },
      { x: 1270, y: 700 },
      { x: 1510, y: 770 },
      { x: 1810, y: 780 },
      { x: 2350, y: 760 }
    ];
    ctx.beginPath();
    const cStartN = worldToScreen(canalPoints[0].x, canalPoints[0].y - 30);
    ctx.moveTo(cStartN.x, cStartN.y);
    for (let i = 1; i < canalPoints.length; i++) {
      const pt = worldToScreen(canalPoints[i].x, canalPoints[i].y - 30);
      ctx.lineTo(pt.x, pt.y);
    }
    for (let i = canalPoints.length - 1; i >= 0; i--) {
      const pt = worldToScreen(canalPoints[i].x, canalPoints[i].y + 30);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = Math.max(1.5, 3 * zoom);
    ctx.stroke();

    // Canal Label
    const cMid = worldToScreen(1400, 740);
    ctx.fillStyle = '#0369a1';
    ctx.font = `bold ${Math.max(9, 14 * zoom)}px "Noto Sans Bengali", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('〰〰 খাজুরাদিয়া সরকারি খাল (প্রস্থ: ৪০ ফুট) 〰〰', cMid.x, cMid.y + 5);

    // 5. Public Road (১২ ফুট পাকা রাস্তা)
    const rStart = worldToScreen(800, 50);
    const rEnd = worldToScreen(2350, 90);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(rStart.x, rStart.y, rEnd.x - rStart.x, Math.max(15, 25 * zoom));
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = Math.max(1.2, 2 * zoom);
    ctx.strokeRect(rStart.x, rStart.y, rEnd.x - rStart.x, Math.max(15, 25 * zoom));

    const rText = worldToScreen(1500, 68);
    ctx.fillStyle = '#334155';
    ctx.font = `bold ${Math.max(8, 12 * zoom)}px "Noto Sans Bengali", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('১২ ফুট চওড়া সরকারি পাকা রাস্তা (ফরিদগঞ্জ টু চাঁদপুর সদর সংযোগ)', rText.x, rText.y);

    // 6. Conventional Signs Table (সাংকেতিক চিহ্ন - Bottom-Right)
    const sym1 = worldToScreen(1800, 1150);
    const sym2 = worldToScreen(2340, 1530);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sym1.x, sym1.y, sym2.x - sym1.x, sym2.y - sym1.y);
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = Math.max(1, 1.8 * zoom);
    ctx.strokeRect(sym1.x, sym1.y, sym2.x - sym1.x, sym2.y - sym1.y);

    const sHeader = worldToScreen(1820, 1180);
    ctx.fillStyle = '#18181b';
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.max(9, 13 * zoom)}px "Noto Sans Bengali", sans-serif`;
    ctx.fillText('সাংকেতিক চিহ্ন (Conventional Signs):', sHeader.x, sHeader.y);

    const signs = [
      '▲ ত্রিকোণাকার বাউন্ডারি পিলার',
      '◉ লোহার পিলার ও বেঞ্চমার্ক',
      '═ পাকা রাস্তা ও ব্রিজ',
      '╌ কাঁচা রাস্তা ও সরকারি হালট',
      '≋ সরকারি খাল ও নদী',
      '▓ পুকুর / দিঘি জলাশয়'
    ];
    signs.forEach((sig, idx) => {
      const sp = worldToScreen(1820, 1220 + idx * 45);
      ctx.font = `${Math.max(8, 11 * zoom)}px "Noto Sans Bengali", sans-serif`;
      ctx.fillStyle = '#334155';
      ctx.fillText(sig, sp.x, sp.y);
    });

    // 7. Government Certification Block (Bottom-Center)
    const certP = worldToScreen(1250, 1530);
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.max(8, 12 * zoom)}px "Noto Sans Bengali", sans-serif`;
    ctx.fillText('গণপ্রজাতন্ত্রী বাংলাদেশ সরকার কর্তৃক প্রদত্ত ক্ষমতাবলে ১৯৮৭-১৯৯২ সনে প্রস্তুত', certP.x, certP.y);
    ctx.font = `${Math.max(7, 11 * zoom)}px "Noto Sans Bengali", sans-serif`;
    ctx.fillText('সেটেলমেন্ট অফিসার ও সুপারিনটেনডেন্ট অব সার্ভে, চাঁদপুর জিলা', certP.x, certP.y + 20 * zoom);

    ctx.restore();
  }

  // Master Render Loop (AutoCAD-Style Sharp Retina Backing Store)
  function render() {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Draw Grid
    if (state.gridEnabled) {
      drawGrid();
    }

    // 1.5 Draw Satellite as Background if layerPosition === 'bottom'
    if (state.satellite && state.satellite.enabled && state.satellite.layerPosition === 'bottom') {
      drawSatelliteOverlay();
    }

    // 2. Draw Mouza Background Map (Vector CAD Sheet or Scanned Raster)
    if (state.mouzaMap.loaded) {
      if (state.mouzaMap.isVector) {
        drawVectorCadastralSheet();
      } else {
        drawMouzaMap();
      }
    }

    // 2.5 Draw Satellite ON TOP of Mouza Map (Default: layerPosition === 'top')
    if (state.satellite && state.satellite.enabled && state.satellite.layerPosition !== 'bottom') {
      drawSatelliteOverlay();
    }

    // 3. Draw Polygons & Plots
    if (state.layers.plots) {
      drawPlots();
    }

    // 3.5 Draw Highlighted Vertex Ring (Module 16)
    if (state.highlightedVertex) {
      drawHighlightedVertex();
    }

    // 4. Draw Active In-Progress Polyline
    if (state.activePolyline.length > 0) {
      drawActivePolyline();
    }

    // (drawActiveTracedLinePreview disabled to keep view clean without elastic rubberband line)

    // 5. Draw Slice Line
    if (state.slicePoints.length > 0) {
      drawSliceLine();
    }

    // 6. Draw Pillars
    if (state.layers.pillars) {
      drawPillars();
    }

    // 7. Draw Annotations & Bangla Text
    if (state.layers.annotations) {
      drawAnnotations();
    }

    // 8. Draw Snap Indicator
    if (state.activeSnapPoint) {
      drawSnapGlyph(state.activeSnapPoint);
    }

    // 9. Draw Calibration markers
    if (state.calibrationPoints.length > 0) {
      drawCalibrationMarkers();
    }

    // 10. Draw Diagonal Tie-Line Measurements
    if (state.diagonalPoints.length > 0) {
      drawDiagonalMeasurements();
    }

    // 11. Draw Virtual Gunia Scale
    if (state.gunia.enabled) {
      drawGuniaScale();
    }

    // 11.5 Draw AutoCAD Geographic Location Marker / GPS Pin
    drawAutoCadGpsPin();

    // 12. Draw Fullscreen Crosshair
    drawCrosshair();

    ctx.restore();
  }

  // Draw Dynamic Infinite Grid
  function drawGrid() {
    const gridSpacingWorld = 50; // 50 Links or Feet

    const topLeftWorld = screenToWorld(0, 0);
    const bottomRightWorld = screenToWorld(logicalW, logicalH);

    const startX = Math.floor(topLeftWorld.x / gridSpacingWorld) * gridSpacingWorld;
    const endX = Math.ceil(bottomRightWorld.x / gridSpacingWorld) * gridSpacingWorld;
    const startY = Math.floor(topLeftWorld.y / gridSpacingWorld) * gridSpacingWorld;
    const endY = Math.ceil(bottomRightWorld.y / gridSpacingWorld) * gridSpacingWorld;

    ctx.lineWidth = 1;

    for (let wx = startX; wx <= endX; wx += gridSpacingWorld) {
      const sx = worldToScreen(wx, 0).x;
      const isMajor = wx % (gridSpacingWorld * 5) === 0;
      ctx.strokeStyle = isMajor ? '#1e293b' : '#0f172a';
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, logicalH);
      ctx.stroke();

      if (isMajor && state.camera.zoom > 0.6) {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.fillText(wx + '', sx + 4, 16);
      }
    }

    for (let wy = startY; wy <= endY; wy += gridSpacingWorld) {
      const sy = worldToScreen(0, wy).y;
      const isMajor = wy % (gridSpacingWorld * 5) === 0;
      ctx.strokeStyle = isMajor ? '#1e293b' : '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(logicalW, sy);
      ctx.stroke();

      if (isMajor && state.camera.zoom > 0.6) {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.fillText(wy + '', 6, sy - 4);
      }
    }
  }

  // Draw Procedural High-Res Satellite Aerial Imagery Layer (Module 17)
  let _satellitePatternCache = null;
  function getSatellitePatternCanvas() {
    if (_satellitePatternCache) return _satellitePatternCache;
    const patCanvas = document.createElement('canvas');
    patCanvas.width = 400;
    patCanvas.height = 400;
    const pCtx = patCanvas.getContext('2d');

    // Rich Bengali landscape: paddy green, earthen dikes, subtle canal water and foliage
    pCtx.fillStyle = '#1c301e';
    pCtx.fillRect(0, 0, 400, 400);

    // Sub-plot agricultural textures
    const fieldColors = ['#233d26', '#2d4d2f', '#1e3821', '#28462a', '#1a331c', '#345233'];
    const fields = [
      { x: 0, y: 0, w: 180, h: 120, c: fieldColors[0] },
      { x: 180, y: 0, w: 220, h: 160, c: fieldColors[1] },
      { x: 0, y: 120, w: 130, h: 180, c: fieldColors[2] },
      { x: 130, y: 120, w: 150, h: 150, c: fieldColors[3] },
      { x: 280, y: 160, w: 120, h: 140, c: fieldColors[4] },
      { x: 0, y: 300, w: 200, h: 100, c: fieldColors[5] },
      { x: 200, y: 300, w: 200, h: 100, c: fieldColors[1] }
    ];

    fields.forEach(f => {
      pCtx.fillStyle = f.c;
      pCtx.fillRect(f.x, f.y, f.w, f.h);
      pCtx.strokeStyle = 'rgba(74, 120, 80, 0.35)';
      pCtx.lineWidth = 1.5;
      pCtx.strokeRect(f.x, f.y, f.w, f.h);
    });

    // Natural canal / water body
    pCtx.strokeStyle = 'rgba(25, 75, 95, 0.75)';
    pCtx.lineWidth = 14;
    pCtx.beginPath();
    pCtx.moveTo(0, 60);
    pCtx.bezierCurveTo(120, 80, 240, 40, 400, 90);
    pCtx.stroke();

    // Winding village path
    pCtx.strokeStyle = 'rgba(160, 140, 110, 0.45)';
    pCtx.lineWidth = 4;
    pCtx.beginPath();
    pCtx.moveTo(70, 0);
    pCtx.bezierCurveTo(90, 150, 160, 250, 220, 400);
    pCtx.stroke();

    _satellitePatternCache = patCanvas;
    return patCanvas;
  }

  // Multi-Provider High-Definition Satellite Tile Engine
  // Supports: Google Hybrid (Satellite + Roads/Labels), Google Pure Satellite, and Esri
  const _satelliteTileCache = {};

  function fetchSatelliteTile(source, z, x, y) {
    const key = `${source}/${z}/${y}/${x}`;
    if (_satelliteTileCache[key]) return _satelliteTileCache[key];

    let tileUrl = '';
    const sub = Math.abs((x + y) % 4);

    if (source === 'google_sat') {
      tileUrl = `https://mt${sub}.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`;
    } else if (source === 'esri') {
      tileUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
    } else {
      // Default: Google Hybrid (Satellite + Roads, Waterways & Boundaries)
      tileUrl = `https://mt${sub}.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = tileUrl;
    _satelliteTileCache[key] = { img, loaded: false, error: false };

    img.onload = () => {
      _satelliteTileCache[key].loaded = true;
      render();
    };
    img.onerror = () => {
      _satelliteTileCache[key].error = true;
      // Graceful fallback to Esri if Google tile network hiccups
      if (source !== 'esri') {
        const fbImg = new Image();
        fbImg.crossOrigin = 'anonymous';
        fbImg.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
        fbImg.onload = () => {
          _satelliteTileCache[key].img = fbImg;
          _satelliteTileCache[key].loaded = true;
          render();
        };
      }
    };

    return _satelliteTileCache[key];
  }

  function drawSatelliteOverlay() {
    if (!state.satellite || !state.satellite.enabled) return;

    ctx.save();
    const isUnder = state.satellite.layerPosition === 'bottom';
    const satOpacity = state.satellite.opacity !== undefined ? state.satellite.opacity : 0.65;

    if (isUnder) {
      // When satellite is underneath as background, draw full crisp 100% color
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    } else {
      // When satellite is on top, slider controls transparency directly
      ctx.globalAlpha = Math.min(1.0, Math.max(0.05, satOpacity));
      if (state.satellite.blendMode === 'multiply') {
        ctx.globalCompositeOperation = 'multiply';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // Default to Faridganj, Chandpur (where the default Mouza sheet belongs!)
    const originGPS = state.satellite.originGPS || { lat: 23.127500, lng: 90.750900 };
    const source = state.satellite.source || 'google_hybrid';

    // Adaptive zoom level based on camera zoom:
    // When zooming in, automatically load Level 17, 18, or 19 for crisp high-definition aerial detail
    let zoomLvl = 16;
    if (state.camera.zoom >= 2.0) zoomLvl = 19;
    else if (state.camera.zoom >= 1.0) zoomLvl = 18;
    else if (state.camera.zoom >= 0.45) zoomLvl = 17;
    else if (state.camera.zoom >= 0.20) zoomLvl = 16;
    else zoomLvl = 15;

    const n = Math.pow(2, zoomLvl);
    const centerTileX = Math.floor(((originGPS.lng + 180) / 360) * n);
    const latRad = (originGPS.lat * Math.PI) / 180;
    const centerTileY = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);

    // Exact Web Mercator tile size in CAD units (links) at this latitude:
    // Earth circ = 40,075,016.686m; 1 link = 0.201168m -> 4.97097 links per meter
    const metersPerTile = (40075016.686 * Math.cos(latRad)) / n;
    const tileWorldSize = metersPerTile * 4.97097;

    const anchorX = state.satellite.anchorWorld ? state.satellite.anchorWorld.x : 800;
    const anchorY = state.satellite.anchorWorld ? state.satellite.anchorWorld.y : 550;

    // Viewport-based tile bounds calculation (Dynamically covers 100% of the visible screen)
    const topLeftWorld = screenToWorld(0, 0);
    const btmRightWorld = screenToWorld(logicalW, logicalH);

    const minDx = Math.floor((topLeftWorld.x - anchorX) / tileWorldSize) - 1;
    const maxDx = Math.ceil((btmRightWorld.x - anchorX) / tileWorldSize) + 1;
    const minDy = Math.floor((topLeftWorld.y - anchorY) / tileWorldSize) - 1;
    const maxDy = Math.ceil((btmRightWorld.y - anchorY) / tileWorldSize) + 1;

    // Guard against excessive tile requests when zoomed out extremely
    const cMinDx = Math.max(-12, minDx);
    const cMaxDx = Math.min(12, maxDx);
    const cMinDy = Math.max(-10, minDy);
    const cMaxDy = Math.min(10, maxDy);

    for (let dx = cMinDx; dx <= cMaxDx; dx++) {
      for (let dy = cMinDy; dy <= cMaxDy; dy++) {
        const tx = centerTileX + dx;
        const ty = centerTileY + dy;
        const tileData = fetchSatelliteTile(source, zoomLvl, tx, ty);
        if (tileData && tileData.loaded && tileData.img) {
          const twX = anchorX + dx * tileWorldSize;
          const twY = anchorY + dy * tileWorldSize;
          const spTopLeft = worldToScreen(twX, twY);
          const spBottomRight = worldToScreen(twX + tileWorldSize, twY + tileWorldSize);
          ctx.drawImage(tileData.img, spTopLeft.x, spTopLeft.y, spBottomRight.x - spTopLeft.x, spBottomRight.y - spTopLeft.y);
        }
      }
    }

    // 3. AutoCAD GPS Coordinate Graticule Grid (WGS84 Lat/Long Lines in subtle cyan)
    if (state.camera.zoom > 0.35) {
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);

      const topLeft = screenToWorld(0, 0);
      const btmRight = screenToWorld(logicalW, logicalH);
      const step = 500;
      const startX = Math.floor(topLeft.x / step) * step;
      const startY = Math.floor(topLeft.y / step) * step;

      for (let gx = startX; gx <= btmRight.x; gx += step) {
        const sx = worldToScreen(gx, 0).x;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, logicalH);
        ctx.stroke();

        const gpsAtX = window.LSCAD?.PlotOps?.canvasToGPS ? window.LSCAD.PlotOps.canvasToGPS(gx, 0, originGPS) : null;
        if (gpsAtX) {
          ctx.fillStyle = '#22d3ee';
          ctx.font = '9px monospace';
          ctx.fillText(`${gpsAtX.lng.toFixed(4)}°E`, sx + 4, logicalH - 12);
        }
      }

      for (let gy = startY; gy <= btmRight.y; gy += step) {
        const sy = worldToScreen(0, gy).y;
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(logicalW, sy);
        ctx.stroke();

        const gpsAtY = window.LSCAD?.PlotOps?.canvasToGPS ? window.LSCAD.PlotOps.canvasToGPS(0, gy, originGPS) : null;
        if (gpsAtY) {
          ctx.fillStyle = '#22d3ee';
          ctx.font = '9px monospace';
          ctx.fillText(`${gpsAtY.lat.toFixed(4)}°N`, 8, sy - 4);
        }
      }
      ctx.restore();
    }

    ctx.restore();

    // 4. AutoCAD Satellite HUD Watermark Badge
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.lineWidth = 1.2;
    const badgeX = logicalW - 280;
    const badgeY = 16;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, 265, 42, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 11px "Noto Sans Bengali", sans-serif';
    ctx.fillText('🛰️ লাইভ স্যাটেলাইট GPS ওভারলে (AutoCAD Datum)', badgeX + 12, badgeY + 17);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    const gpsLat = originGPS.lat.toFixed(5);
    const gpsLng = originGPS.lng.toFixed(5);
    ctx.fillText(`GPS: ${gpsLat}°N, ${gpsLng}°E | BTM: 90°E WGS84`, badgeX + 12, badgeY + 33);
    ctx.restore();
  }

  // AutoCAD Geographic Location Pin Placement Engine
  function setGpsLocationPin(worldX, worldY, customLat, customLng) {
    if (!state.satellite) {
      state.satellite = { enabled: true, opacity: 0.7, originGPS: { lat: 23.3167, lng: 90.7500 } };
    }
    state.satellite.anchorWorld = { x: worldX, y: worldY };
    state.satellite.pinPlaced = true;
    state.satellite.enabled = true;

    if (customLat !== undefined && customLng !== undefined) {
      state.satellite.originGPS = { lat: customLat, lng: customLng };
    }

    const lat = state.satellite.originGPS.lat;
    const lng = state.satellite.originGPS.lng;

    const inpGeoLat = document.getElementById('inpGeoLat');
    const inpGeoLng = document.getElementById('inpGeoLng');
    if (inpGeoLat) inpGeoLat.value = lat.toFixed(6);
    if (inpGeoLng) inpGeoLng.value = lng.toFixed(6);

    updateSatelliteUIState();
    playCadSound('snap');
    showToast(`📍 AutoCAD GPS পিন বসানো হয়েছে (${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E) ও স্যাটেলাইট চালু হয়েছে!`, 'success');
    pushHistory();
    render();
  }
  window.setGpsLocationPin = setGpsLocationPin;

  // Draw AutoCAD Geographic Location Marker / GPS Pin on Canvas
  function drawAutoCadGpsPin() {
    if (!state.satellite || !state.satellite.anchorWorld || !state.satellite.pinPlaced) return;

    const anchor = state.satellite.anchorWorld;
    const sp = worldToScreen(anchor.x, anchor.y);
    const originGPS = state.satellite.originGPS || { lat: 23.3167, lng: 90.7500 };

    ctx.save();

    // 1. Pulsing Target Bullseye Rings (AutoCAD Datum Pin)
    const time = Date.now() / 400;
    const pulseR = 14 + Math.sin(time) * 3;

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, pulseR + 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, pulseR, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair target
    ctx.beginPath();
    ctx.moveTo(sp.x - pulseR - 6, sp.y);
    ctx.lineTo(sp.x + pulseR + 6, sp.y);
    ctx.moveTo(sp.x, sp.y - pulseR - 6);
    ctx.lineTo(sp.x, sp.y + pulseR + 6);
    ctx.stroke();

    // 2. Central Pin Head
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Iconic AutoCAD Location Label Badge
    const labelText = `📍 AutoCAD GPS: ${originGPS.lat.toFixed(5)}°N, ${originGPS.lng.toFixed(5)}°E`;
    ctx.font = 'bold 11px "Noto Sans Bengali", monospace';
    const tw = ctx.measureText(labelText).width;
    const bw = tw + 20;
    const bh = 24;
    const bx = sp.x + 14;
    const by = sp.y - 12;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, bx + 10, by + bh / 2);

    ctx.restore();
  }


  // Draw Highlighted Vertex Target Reticle & Tooltip (Module 16)
  function drawHighlightedVertex() {
    if (!state.highlightedVertex) return;
    const hv = state.highlightedVertex;
    const sp = worldToScreen(hv.x, hv.y);

    ctx.save();
    // Outer dashed pulsing reticle ring
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshairs
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sp.x - 26, sp.y); ctx.lineTo(sp.x - 8, sp.y);
    ctx.moveTo(sp.x + 8, sp.y); ctx.lineTo(sp.x + 26, sp.y);
    ctx.moveTo(sp.x, sp.y - 26); ctx.lineTo(sp.x, sp.y - 8);
    ctx.moveTo(sp.x, sp.y + 8); ctx.lineTo(sp.x, sp.y + 26);
    ctx.stroke();

    // Solid inner bullseye
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Floating Tooltip Badge
    const tag = `P${(hv.index ?? 0) + 1}: (${hv.x.toFixed(1)} lk, ${hv.y.toFixed(1)} lk)`;
    ctx.font = 'bold 11px monospace';
    const tw = ctx.measureText(tag).width;
    const bx = sp.x - tw / 2 - 8;
    const by = sp.y - 38;

    ctx.fillStyle = 'rgba(8, 145, 178, 0.95)';
    ctx.beginPath();
    ctx.roundRect(bx, by, tw + 16, 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(tag, bx + 8, by + 15);
    ctx.restore();
  }

  // Helper: Draw a single Mouza Map Sheet on Canvas
  function drawSingleMouzaSheet(sheet, isActive, idx) {
    if (!sheet || !sheet.loaded) return;
    const p1 = worldToScreen(sheet.x, sheet.y);
    const p2 = worldToScreen(sheet.x + sheet.width, sheet.y + sheet.height);
    const width = p2.x - p1.x;
    const height = p2.y - p1.y;

    ctx.save();
    // High-Fidelity Smooth Interpolation: Clean scanned ink lines without pixel tearing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const sourceImg = sheet.filteredCanvas || sheet.imageObj;

    if (sourceImg) {
      const isSatelliteActive = state.satellite && state.satellite.enabled;
      const isSatelliteUnder = isSatelliteActive && state.satellite.layerPosition === 'bottom';
      const isMultiplyMode = state.satellite?.blendMode === 'multiply' || sheet.blendMode === 'multiply';

      if (isSatelliteUnder && isMultiplyMode) {
        // Satellite is underneath, so Mouza map on top in Multiply mode makes white paper transparent!
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = state.satellite.opacity !== undefined ? state.satellite.opacity : 1.0;
      } else if (isSatelliteUnder && !isMultiplyMode) {
        // Satellite is underneath, Mouza map on top with opacity slider
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = state.satellite.opacity !== undefined ? state.satellite.opacity : 0.65;
      } else {
        // Satellite is on top or inactive: Mouza map is drawn 100% solid & crisp
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = sheet.opacity ?? 1.0;
      }

      if (sheet.rotation && sheet.rotation !== 0) {
        ctx.translate(p1.x + width / 2, p1.y + height / 2);
        ctx.rotate((sheet.rotation * Math.PI) / 180);
        ctx.drawImage(sourceImg, -width / 2, -height / 2, width, height);
      } else {
        ctx.drawImage(sourceImg, p1.x, p1.y, width, height);
      }
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(p1.x, p1.y, width, height);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.fillRect(p1.x, p1.y, width, height);
    }

    // AutoCAD-Style Sheet Selection Border & Top Drag Grip Badge
    if (isActive || state.tool === 'map-move') {
      ctx.save();
      ctx.strokeStyle = sheet.locked ? 'rgba(239, 68, 68, 0.7)' : (isActive ? '#38bdf8' : 'rgba(148, 163, 184, 0.4)');
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(p1.x, p1.y, width, height);
      ctx.setLineDash([]);

      // Corner Grips
      const gripSize = 7;
      ctx.fillStyle = isActive ? '#38bdf8' : '#94a3b8';
      ctx.fillRect(p1.x - gripSize / 2, p1.y - gripSize / 2, gripSize, gripSize);
      ctx.fillRect(p1.x + width - gripSize / 2, p1.y - gripSize / 2, gripSize, gripSize);
      ctx.fillRect(p1.x - gripSize / 2, p1.y + height - gripSize / 2, gripSize, gripSize);
      ctx.fillRect(p1.x + width - gripSize / 2, p1.y + height - gripSize / 2, gripSize, gripSize);

      // On-Canvas Sheet Name & Drag Tag
      const sheetTitle = `${sheet.name || 'নকশা ' + (idx + 1)} ${sheet.locked ? '🔒' : '⠿ টেনে সরান'}`;
      ctx.font = 'bold 11px "Noto Sans Bengali", sans-serif';
      const tw = ctx.measureText(sheetTitle).width;
      const tagW = tw + 18;
      const tagH = 22;
      const tagX = p1.x;
      const tagY = Math.max(10, p1.y - tagH - 4);

      ctx.fillStyle = isActive ? 'rgba(2, 132, 199, 0.95)' : 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = isActive ? '#38bdf8' : '#475569';
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, tagX, tagY, tagW, tagH, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(sheetTitle, tagX + 9, tagY + 15);
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw Mouza Map Scanned Outline / Filtered Image (Supports Multi-Sheet Canvas)
  function drawMouzaMap() {
    if (!state.mouzaMaps || state.mouzaMaps.length === 0) {
      if (state.mouzaMap && state.mouzaMap.loaded) {
        drawSingleMouzaSheet(state.mouzaMap, true, 0);
      }
      return;
    }

    state.mouzaMaps.forEach((sheet, idx) => {
      if (sheet.visible !== false && sheet.loaded) {
        const isActive = sheet.id === state.activeMapId;
        drawSingleMouzaSheet(sheet, isActive, idx);
      }
    });
  }

  // Extracts major boundary arms (sides) for clean CAD dimensioning and eliminates micro-edge clutter
  function getSimplifiedBoundaryArms(vertices, isClosed, tolerance = 14) {
    if (!vertices || vertices.length < 2) return [];
    if (vertices.length <= 4) {
      const arms = [];
      const count = isClosed ? vertices.length : (vertices.length - 1);
      for (let i = 0; i < count; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % vertices.length];
        const length = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        arms.push({ p1, p2, startIndex: i, endIndex: (i + 1) % vertices.length, cumulativeLength: length });
      }
      return arms;
    }

    const closedPts = isClosed ? [...vertices, vertices[0]] : [...vertices];
    const corners = simplifyRDP(closedPts, tolerance);

    const cornerIndices = [];
    let searchStart = 0;
    for (let c = 0; c < (isClosed ? corners.length - 1 : corners.length); c++) {
      const target = corners[c];
      let bestIdx = searchStart;
      let minD = Infinity;
      for (let i = searchStart; i < vertices.length; i++) {
        const d = Math.hypot(vertices[i].x - target.x, vertices[i].y - target.y);
        if (d < minD) {
          minD = d;
          bestIdx = i;
        }
      }
      cornerIndices.push(bestIdx);
      searchStart = bestIdx + 1;
    }

    if (cornerIndices.length < 2) {
      cornerIndices.length = 0;
      cornerIndices.push(0, Math.floor(vertices.length / 2));
      if (isClosed) cornerIndices.push(vertices.length - 1);
    }

    const arms = [];
    const numCorners = cornerIndices.length;
    const numArms = isClosed ? numCorners : (numCorners - 1);

    for (let k = 0; k < numArms; k++) {
      const idxA = cornerIndices[k];
      const idxB = cornerIndices[(k + 1) % numCorners];

      let cumLen = 0;
      let curr = idxA;
      while (curr !== idxB) {
        const next = (curr + 1) % vertices.length;
        cumLen += Math.hypot(vertices[next].x - vertices[curr].x, vertices[next].y - vertices[curr].y);
        curr = next;
        if (curr === idxA) break;
      }

      arms.push({
        p1: vertices[idxA],
        p2: vertices[idxB],
        startIndex: idxA,
        endIndex: idxB,
        cumulativeLength: cumLen
      });
    }

    return arms;
  }

  // Draw Polygons, Dimension Badges & Draggable Vertex Grips (With Collision Avoidance)
  function drawPlots() {
    state.plots.forEach(plot => {
      if (!plot.vertices || plot.vertices.length < 2) return;

      const isSelected = plot.id === state.selectedPlotId;
      const rawArea = calculateShoelaceArea(plot.vertices);
      const isEffectiveLine = Boolean(plot.isLine) || plot.vertices.length <= 2 || rawArea < 0.15;

      ctx.beginPath();
      const first = worldToScreen(plot.vertices[0].x, plot.vertices[0].y);
      ctx.moveTo(first.x, first.y);

      for (let i = 1; i < plot.vertices.length; i++) {
        const pt = worldToScreen(plot.vertices[i].x, plot.vertices[i].y);
        ctx.lineTo(pt.x, pt.y);
      }

      // Close polygon only if real enclosed polygon
      if (!isEffectiveLine) {
        ctx.closePath();
      }

      // 1. Draw Selected / Merge Highlighted Entity
      const isMergeSelected = state.mergeSelectedPlots && state.mergeSelectedPlots.includes(plot.id);
      if (isMergeSelected) {
        if (!isEffectiveLine) {
          ctx.fillStyle = 'rgba(217, 70, 239, 0.28)';
          ctx.fill();
        }
        ctx.strokeStyle = '#d946ef';
        ctx.lineWidth = 3.5;
        ctx.save();
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.restore();
      } else if (isSelected) {
        if (!isEffectiveLine) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
          ctx.fill();
        }

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        let centroidScreen = null;

        // Centroid Badge ONLY for true closed polygons with area > 0.05 decimal
        if (!isEffectiveLine && !plot.isLine && rawArea > 0.05) {
          const centroid = calculateCentroid(plot.vertices);
          centroidScreen = worldToScreen(centroid.x, centroid.y);
          const shotok = (rawArea * SQFT_PER_SQLINK / SQFT_PER_SHOTOK).toFixed(2);

          const labelText = plot.name;
          ctx.font = 'bold 12px "Noto Sans Bengali", sans-serif';
          const nameW = ctx.measureText(labelText).width;
          const badgeW = Math.max(nameW + 18, 85);
          const badgeH = 34;

          ctx.fillStyle = 'rgba(30, 27, 75, 0.95)';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.8;
          drawRoundedRect(ctx, centroidScreen.x - badgeW / 2, centroidScreen.y - badgeH / 2, badgeW, badgeH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 12px "Noto Sans Bengali", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, centroidScreen.x, centroidScreen.y - 6);

          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 10px "Fira Code", monospace';
          ctx.fillText(shotok + ' শতক', centroidScreen.x, centroidScreen.y + 8);
          ctx.textAlign = 'left';
        }

        // Edge Dimension Badges (Smart Boundary Arms & Clean Line Measurement)
        if (state.layers.dimensions) {
          if (isEffectiveLine) {
            // Aisle Line: Draw ONE single clean badge showing total length in Feet & Inches (NO LINK)
            let totalLk = 0;
            for (let i = 0; i < plot.vertices.length - 1; i++) {
              totalLk += Math.hypot(plot.vertices[i + 1].x - plot.vertices[i].x, plot.vertices[i + 1].y - plot.vertices[i].y);
            }
            if (totalLk > 0.001) {
              const totalFt = totalLk * FEET_PER_LINK;
              const ftIn = convertFeetToFeetInches(totalFt);
              const mapInches = totalFt / getFeetPerMapInch();
              const groundInches = Math.round(totalFt * 12);

              const midIdx = Math.floor(plot.vertices.length / 2);
              const pA = plot.vertices[midIdx] || plot.vertices[0];
              const pB = plot.vertices[Math.min(plot.vertices.length - 1, midIdx + 1)] || pA;
              const spA = worldToScreen(pA.x, pA.y);
              const spB = worldToScreen(pB.x, pB.y);
              const sp = { x: (spA.x + spB.x) / 2, y: (spA.y + spB.y) / 2 };

              const dimText = `📏 ${ftIn.formattedShortBengali} [নকশায় ${toBanglaDigits(mapInches.toFixed(2))}" • মাটিতে ${toBanglaDigits(groundInches)}" ]`;

              ctx.save();
              ctx.font = 'bold 11px "Noto Sans Bengali", "Fira Code", monospace';
              const tw = ctx.measureText(dimText).width;
              const bw = tw + 22;
              const bh = 25;
              const br = 6;

              ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
              ctx.strokeStyle = plot.strokeColor || '#ec4899';
              ctx.lineWidth = 1.4;
              drawRoundedRect(ctx, sp.x - bw / 2, sp.y - bh - 8, bw, bh, br);
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = '#38bdf8';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(dimText, sp.x, sp.y - bh / 2 - 8);
              ctx.restore();
            }
          } else {
            // True Closed Plot Polygon: Clean major boundary arms
            const arms = getSimplifiedBoundaryArms(plot.vertices, true, 12);
            const placedPlotBadges = [];

            for (const arm of arms) {
              const edgeLength = arm.cumulativeLength;
              if (edgeLength <= 0.001) continue;

              const edgeFeet = edgeLength * FEET_PER_LINK;
              const ftIn = convertFeetToFeetInches(edgeFeet);

              const s1 = worldToScreen(arm.p1.x, arm.p1.y);
              const s2 = worldToScreen(arm.p2.x, arm.p2.y);

              const dx = s2.x - s1.x;
              const dy = s2.y - s1.y;
              const segLen = Math.hypot(dx, dy) || 1;

              if (segLen < 28 && arms.length > 2) continue;

              const midX = (s1.x + s2.x) / 2;
              const midY = (s1.y + s2.y) / 2;

              let nx = -dy / segLen;
              let ny = dx / segLen;
              if (ny > 0) { nx = -nx; ny = -ny; }

              let badgeX = midX + nx * 22;
              let badgeY = midY + ny * 22;

              if (centroidScreen) {
                const distToCentroid = Math.hypot(badgeX - centroidScreen.x, badgeY - centroidScreen.y);
                if (distToCentroid < 42) {
                  const angle = Math.atan2(badgeY - centroidScreen.y, badgeX - centroidScreen.x);
                  badgeX += Math.cos(angle) * 26;
                  badgeY += Math.sin(angle) * 26;
                }
              }

              const edgeInches = edgeFeet * 12;
              let dimText = '';
              if (state.unit === 'inch') {
                dimText = `${toBanglaDigits(edgeInches.toFixed(1))}" (${ftIn.formattedShortBengali})`;
              } else if (state.unit === 'feet') {
                dimText = `${toBanglaDigits(edgeFeet.toFixed(2))} ft (${ftIn.formattedShortBengali})`;
              } else if (state.unit === 'meter') {
                dimText = `${toBanglaDigits((edgeFeet / 3.28084).toFixed(2))} m (${ftIn.formattedShortBengali})`;
              } else {
                dimText = `${ftIn.formattedShortBengali} [${toBanglaDigits(edgeInches.toFixed(0))}" ]`;
              }

              ctx.save();
              ctx.font = 'bold 11px "Noto Sans Bengali", "Fira Code", monospace';
              const tw = ctx.measureText(dimText).width;
              const bw = Math.max(56, tw + 20);
              const bh = 25;
              const br = 6;

              let collides = false;
              for (const b of placedPlotBadges) {
                if (Math.abs(badgeX - b.x) < (bw + b.w) / 2 + 6 && Math.abs(badgeY - b.y) < (bh + b.h) / 2 + 6) {
                  collides = true;
                  break;
                }
              }
              if (collides) {
                const altX = badgeX + nx * 22;
                const altY = badgeY + ny * 22;
                let altCollides = false;
                for (const b of placedPlotBadges) {
                  if (Math.abs(altX - b.x) < (bw + b.w) / 2 + 6 && Math.abs(altY - b.y) < (bh + b.h) / 2 + 6) {
                    altCollides = true;
                    break;
                  }
                }
                if (!altCollides) {
                  badgeX = altX;
                  badgeY = altY;
                  collides = false;
                }
              }

              if (!collides) {
                placedPlotBadges.push({ x: badgeX, y: badgeY, w: bw, h: bh });

                ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 1.4;
                drawRoundedRect(ctx, badgeX - bw / 2, badgeY - bh / 2, bw, bh, br);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#38bdf8';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(dimText, badgeX, badgeY);
              }
              ctx.restore();
            }
          }
        }
      } else {
        // 2. Unselected Plot / Line
        if (!isEffectiveLine) {
          ctx.fillStyle = plot.fillColor || 'rgba(56, 189, 248, 0.12)';
          ctx.fill();
        }

        ctx.strokeStyle = plot.strokeColor || '#38bdf8';
        ctx.lineWidth = isEffectiveLine ? 2.5 : 2.0;
        ctx.stroke();

        if (!isEffectiveLine && !plot.isLine) {
          const centroid = calculateCentroid(plot.vertices);
          const sc = worldToScreen(centroid.x, centroid.y);

          ctx.save();
          const zoom = state.camera.zoom;
          if (zoom < 0.28) {
            // Very zoomed out: draw clean mini dot marker to avoid clutter
            ctx.fillStyle = plot.strokeColor || '#38bdf8';
            ctx.beginPath();
            ctx.arc(sc.x, sc.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            const fontPx = Math.max(9, Math.min(12, Math.round(11 * Math.min(zoom * 1.4, 1.0))));
            ctx.font = `bold ${fontPx}px "Noto Sans Bengali", sans-serif`;
            const nameW = ctx.measureText(plot.name).width;
            const badgeW = nameW + (zoom < 0.5 ? 10 : 16);
            const badgeH = zoom < 0.5 ? 18 : 22;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.strokeStyle = plot.strokeColor || '#38bdf8';
            ctx.lineWidth = 1.2;
            drawRoundedRect(ctx, sc.x - badgeW / 2, sc.y - badgeH / 2, badgeW, badgeH, 5);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#f1f5f9';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(plot.name, sc.x, sc.y);
          }
          ctx.restore();
        } else {
          // Unselected 2-point or effective line: draw clean dimension badge floating above line
          const p1 = plot.vertices[0];
          const p2 = plot.vertices[plot.vertices.length - 1];
          const lk = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const ft = lk * FEET_PER_LINK;
          const ftIn = convertFeetToFeetInches(ft);
          const mapInches = ft / getFeetPerMapInch();
          const s1 = worldToScreen(p1.x, p1.y);
          const s2 = worldToScreen(p2.x, p2.y);
          const midX = (s1.x + s2.x) / 2;
          const midY = (s1.y + s2.y) / 2;

          const dx = s2.x - s1.x;
          const dy = s2.y - s1.y;
          const segLen = Math.hypot(dx, dy) || 1;
          let nx = -dy / segLen;
          let ny = dx / segLen;
          if (ny > 0) { nx = -nx; ny = -ny; }
          const badgeX = midX + nx * 18;
          const badgeY = midY + ny * 18;

          const dimText = `${ftIn.formattedShortBengali} [নকশায় ${toBanglaDigits(mapInches.toFixed(2))}" • মাটিতে ${toBanglaDigits((ft * 12).toFixed(0))}" ]`;
          ctx.save();
          ctx.font = 'bold 10px "Noto Sans Bengali", "Fira Code", monospace';
          const tw = ctx.measureText(dimText).width;
          const bw = tw + 18;
          const bh = 24;
          drawRoundedRect(ctx, badgeX - bw / 2, badgeY - bh / 2, bw, bh, 5);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#cbd5e1';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(dimText, badgeX, badgeY);
          ctx.restore();
        }
      }

      // Internal Angles & Compass Bearings Overlay (Only when toggled AND for the selected plot)
      if (state.showAngles && isSelected) {
        for (let i = 0; i < plot.vertices.length; i++) {
          const prev = plot.vertices[(i - 1 + plot.vertices.length) % plot.vertices.length];
          const curr = plot.vertices[i];
          const next = plot.vertices[(i + 1) % plot.vertices.length];
          const angleDeg = calculateInteriorAngle(prev, curr, next);

          const sp = worldToScreen(curr.x, curr.y);
          
          // Small corner dot
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Compact angle badge
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1;
          drawRoundedRect(ctx, sp.x + 4, sp.y - 16, 36, 14, 3);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#67e8f9';
          ctx.font = 'bold 8.5px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(angleDeg.toFixed(0) + '°', sp.x + 22, sp.y - 6);
          ctx.textAlign = 'left';

          // Bearing on Edge
          const midX = (curr.x + next.x) / 2;
          const midY = (curr.y + next.y) / 2;
          const sm = worldToScreen(midX, midY);
          const bearing = calculateBearing(curr, next);

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1;
          drawRoundedRect(ctx, sm.x - 24, sm.y + 7, 48, 14, 3);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#a5f3fc';
          ctx.font = 'bold 8.5px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(bearing, sm.x, sm.y + 17.5);
          ctx.textAlign = 'left';
        }
      }

      // AutoCAD-Style Glowing Green Grip Boxes (Decimated on dense curves to prevent clutter)
      const isPlotHovered = state.hoveredVertex && state.hoveredVertex.plotId === plot.id;
      if (isSelected || isPlotHovered) {
        let lastGripScreen = null;
        const cornerIndicesSet = new Set();
        if (plot.vertices.length > 8) {
          const arms = getSimplifiedBoundaryArms(plot.vertices, !isEffectiveLine, 12);
          arms.forEach(a => {
            cornerIndicesSet.add(a.startIndex);
            cornerIndicesSet.add(a.endIndex);
          });
        }

        plot.vertices.forEach((v, idx) => {
          if (isEffectiveLine && idx !== 0 && idx !== plot.vertices.length - 1) return;
          const sp = worldToScreen(v.x, v.y);
          const isCorner = cornerIndicesSet.size === 0 || cornerIndicesSet.has(idx) || idx === 0 || idx === plot.vertices.length - 1;

          if (!isCorner && lastGripScreen) {
            const distToLast = Math.hypot(sp.x - lastGripScreen.x, sp.y - lastGripScreen.y);
            if (distToLast < 24) {
              return; // Decimate dense intermediate grip handles to eliminate green clutter
            }
          }
          lastGripScreen = sp;

          const isDraggingThis = state.dragVertex && state.dragVertex.isDragging && state.dragVertex.plotId === plot.id && state.dragVertex.vertexIndex === idx;
          const isHovered = (state.hoveredVertex && state.hoveredVertex.plotId === plot.id && state.hoveredVertex.vertexIndex === idx) || isDraggingThis;
          const boxSize = isDraggingThis ? 18 : (isHovered ? 16 : 12);

          ctx.save();
          // Vibrant Green Glowing Aura (উজ্জ্বল সবুজ আলো)
          ctx.shadowColor = isDraggingThis ? '#00ff88' : '#10b981';
          ctx.shadowBlur = isDraggingThis ? 26 : (isHovered ? 20 : 14);

          // Outer green pulse halo on hover or drag
          if (isHovered || isDraggingThis) {
            ctx.fillStyle = isDraggingThis ? 'rgba(0, 255, 136, 0.40)' : 'rgba(16, 185, 129, 0.28)';
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, boxSize + 6, 0, Math.PI * 2);
            ctx.fill();
          }

          // AutoCAD Solid Green Square Grip Box
          ctx.fillStyle = isDraggingThis ? '#00ff88' : '#10b981';
          ctx.fillRect(sp.x - boxSize / 2, sp.y - boxSize / 2, boxSize, boxSize);

          // Crisp White Precision Border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = isDraggingThis ? 2.5 : 2.0;
          ctx.strokeRect(sp.x - boxSize / 2, sp.y - boxSize / 2, boxSize, boxSize);

          // Inner white pinpoint dot for millimeter accuracy
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sp.x - 2, sp.y - 2, 4, 4);
          ctx.restore();
        });
      }
    });

    // 4. Live AutoCAD Floating Dimension Tooltip while dragging a Green Grip Point (tene boro korar somoy map dekhabe)
    if (state.dragVertex && state.dragVertex.isDragging && state.liveDragTooltip) {
      const tip = state.liveDragTooltip;
      ctx.save();
      ctx.font = 'bold 11px "Noto Sans Bengali", "Fira Code", monospace';
      const txt1 = `📐 দৈর্ঘ্য: ${tip.ftIn}`;
      const txt2 = `🗺️ নকশায়: ${tip.mapInches}" • মাটিতে: ${tip.inches}"`;
      const tw = Math.max(ctx.measureText(txt1).width, ctx.measureText(txt2).width);
      const bx = tip.screenX + 18;
      const by = tip.screenY - 50;
      const bw = tw + 22;
      const bh = 42;

      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 16;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.8;
      drawRoundedRect(ctx, bx, by, bw, bh, 7);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fef08a';
      ctx.fillText(txt1, bx + 11, by + 16);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(txt2, bx + 11, by + 32);
      ctx.restore();
    }
  }

  // Draw Bangla Text Annotations
  function drawAnnotations() {
    state.annotations.forEach(ann => {
      const sp = worldToScreen(ann.x, ann.y);

      ctx.font = 'bold 11px "Noto Sans Bengali", sans-serif';
      const textWidth = ctx.measureText(ann.text).width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = ann.color || '#38bdf8';
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, sp.x - textWidth / 2 - 8, sp.y - 12, textWidth + 16, 22, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = ann.color || '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(ann.text, sp.x, sp.y + 3.5);
      ctx.textAlign = 'left';
    });
  }

  // Draw Active Drawing Polyline (Supports Tool Switching & Pause/Resume)
  function drawActivePolyline() {
    if (!state.activePolyline || state.activePolyline.length === 0) return;
    const isPolyTool = state.tool === 'polygon' || state.tool === 'polyline';

    ctx.save();
    ctx.beginPath();
    const first = worldToScreen(state.activePolyline[0].x, state.activePolyline[0].y);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < state.activePolyline.length; i++) {
      const pt = worldToScreen(state.activePolyline[i].x, state.activePolyline[i].y);
      ctx.lineTo(pt.x, pt.y);
    }

    if (isPolyTool) {
      // Connect to current mouse or snapped point
      const currentMouse = state.activeSnapPoint ? worldToScreen(state.activeSnapPoint.x, state.activeSnapPoint.y) : { x: state.mouse.screenX, y: state.mouse.screenY };
      ctx.lineTo(currentMouse.x, currentMouse.y);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([5, 5]);
    } else {
      // Paused / resting track while in other tools (e.g. Pan, Select, Gunia)
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw vertex pins along the active line
    for (let i = 0; i < state.activePolyline.length; i++) {
      const sp = worldToScreen(state.activePolyline[i].x, state.activePolyline[i].y);
      const isFirst = i === 0;
      const isLast = i === state.activePolyline.length - 1;

      ctx.fillStyle = isFirst ? '#f59e0b' : (isLast ? '#10b981' : '#38bdf8');
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, isFirst ? 6.5 : 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // If active and has 3+ points, draw magnetic guide circle around first point
      if (isPolyTool && isFirst && state.activePolyline.length >= 3) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 14, 0, Math.PI * 2);
        ctx.stroke();
      }

      // If in another tool, show vertex labels P1, P2.. Pn
      if (!isPolyTool) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.font = 'bold 9.5px monospace';
        if (isFirst) {
          ctx.fillText(`P1 (শুরু)`, sp.x + 8, sp.y - 7);
        } else if (isLast) {
          ctx.fillText(`P${i + 1} (শেষ)`, sp.x + 8, sp.y - 7);
        }
      }
    }

    ctx.restore();
  }

  // Draw Active Traced Dag Boundary Preview (Rubberband line & snap-to-close guide)
  function drawActiveTracedLinePreview() {
    if (state.tool !== 'line-wand' || !state.activeTracedLineId) return;
    const activeLine = state.plots.find(p => p.id === state.activeTracedLineId && p.isLine);
    if (!activeLine || !activeLine.vertices || activeLine.vertices.length === 0) return;

    const lastPt = activeLine.vertices[activeLine.vertices.length - 1];
    const firstPt = activeLine.vertices[0];
    const mouseWorld = { x: state.mouse.worldX, y: state.mouse.worldY };

    ctx.save();
    // Glowing pink rubberband line to current mouse position
    const sLast = worldToScreen(lastPt.x, lastPt.y);
    const sMouse = worldToScreen(mouseWorld.x, mouseWorld.y);

    ctx.beginPath();
    ctx.moveTo(sLast.x, sLast.y);
    ctx.lineTo(sMouse.x, sMouse.y);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Snapping guide circle on the start vertex if 2+ points exist
    if (activeLine.vertices.length >= 2) {
      const sFirst = worldToScreen(firstPt.x, firstPt.y);
      const distToFirst = Math.hypot(mouseWorld.x - firstPt.x, mouseWorld.y - firstPt.y);
      const snapCloseRadius = 45 / state.camera.zoom;
      const isHoveringStart = distToFirst <= snapCloseRadius;

      ctx.beginPath();
      ctx.arc(sFirst.x, sFirst.y, isHoveringStart ? 16 : 10, 0, Math.PI * 2);
      ctx.strokeStyle = isHoveringStart ? '#00ff88' : '#ec4899';
      ctx.lineWidth = isHoveringStart ? 2.5 : 1.5;
      ctx.stroke();

      if (isHoveringStart) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, sFirst.x + 18, sFirst.y - 14, 135, 24, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 10px "Noto Sans Bengali", sans-serif';
        ctx.fillText('দাগ সম্পন্ন করুন (ক্লিক)', sFirst.x + 24, sFirst.y + 2);
      }
    }

    ctx.restore();
  }

  // Draw Interactive Slice Cut Line
  function drawSliceLine() {
    ctx.beginPath();
    const first = worldToScreen(state.slicePoints[0].x, state.slicePoints[0].y);
    ctx.moveTo(first.x, first.y);

    const cur = worldToScreen(state.mouse.worldX, state.mouse.worldY);
    ctx.lineTo(cur.x, cur.y);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw Pillars / Stations
  function drawPillars() {
    state.pillars.forEach(p => {
      const sp = worldToScreen(p.x, p.y);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  // Draw Snap Glyph
  function drawSnapGlyph(snap) {
    const sp = worldToScreen(snap.x, snap.y);

    if (snap.type === 'firstpoint') {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(sp.x - 8, sp.y - 8, 16, 16);
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Tooltip label on first point snap
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      const text = '🎯 ১ম পয়েন্ট (ক্লিক করে দাগ বন্ধ করুন)';
      ctx.font = 'bold 11px "Noto Sans Bengali", sans-serif';
      const tw = ctx.measureText(text).width;
      ctx.beginPath();
      ctx.roundRect(sp.x + 12, sp.y - 12, tw + 16, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.fillText(text, sp.x + 20, sp.y + 4);
      ctx.restore();
      return;
    }

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;

    if (snap.type === 'endpoint') {
      ctx.strokeRect(sp.x - 6, sp.y - 6, 12, 12);
    } else if (snap.type === 'midpoint') {
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y - 7);
      ctx.lineTo(sp.x + 6, sp.y + 5);
      ctx.lineTo(sp.x - 6, sp.y + 5);
      ctx.closePath();
      ctx.stroke();
    }
  }

  function drawCalibrationMarkers() {
    if (!state.calibrationPoints || state.calibrationPoints.length === 0) return;

    ctx.save();

    // 1. Draw Point 1 (Reference Start)
    const p1 = state.calibrationPoints[0];
    const s1 = worldToScreen(p1.x, p1.y);

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(s1.x, s1.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px "Noto Sans Bengali", sans-serif';
    ctx.fillText('রেফারেন্স শুরু [১]', s1.x + 10, s1.y - 10);

    // 2. Draw Point 2 or Live Cursor Preview Line
    let p2 = state.calibrationPoints[1];
    let isLive = false;
    if (!p2 && state.tool === 'calibrate') {
      p2 = { x: state.mouse.worldX, y: state.mouse.worldY };
      isLive = true;
    }

    if (p2) {
      const s2 = worldToScreen(p2.x, p2.y);

      // Connecting line
      ctx.strokeStyle = isLive ? '#38bdf8' : '#10b981';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(s1.x, s1.y);
      ctx.lineTo(s2.x, s2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // If Point 2 locked
      if (!isLive) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(s2.x, s2.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px "Noto Sans Bengali", sans-serif';
        ctx.fillText('রেফারেন্স শেষ [২]', s2.x + 10, s2.y - 10);
      }

      // Midpoint measurement badge
      const midX = (s1.x + s2.x) / 2;
      const midY = (s1.y + s2.y) / 2;
      const distPx = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = isLive ? '#38bdf8' : '#10b981';
      ctx.lineWidth = 1.5;
      const badgeW = 120, badgeH = 24;
      drawRoundedRect(ctx, midX - badgeW / 2, midY - badgeH / 2, badgeW, badgeH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`দূরত্ব: ${distPx.toFixed(1)} px`, midX, midY + 4);
      ctx.textAlign = 'left';
    }

    ctx.restore();
  }

  // Draw Diagonal Tie-Line Measurements
  function drawDiagonalMeasurements() {
    if (state.diagonalPoints.length === 0) return;

    ctx.save();
    const p1 = state.diagonalPoints[0];
    const s1 = worldToScreen(p1.x, p1.y);

    // Marker 1
    ctx.fillStyle = '#818cf8';
    ctx.beginPath();
    ctx.arc(s1.x, s1.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    const p2 = state.diagonalPoints[1] || { x: state.mouse.worldX, y: state.mouse.worldY };
    const s2 = worldToScreen(p2.x, p2.y);

    // Diagonal Line
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(s1.x, s1.y);
    ctx.lineTo(s2.x, s2.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Measurement badge in middle
    const midX = (s1.x + s2.x) / 2;
    const midY = (s1.y + s2.y) / 2;
    const distLk = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const distFt = distLk * FEET_PER_LINK;
    const ftIn = convertFeetToFeetInches(distFt);

    ctx.font = 'bold 10.5px "Noto Sans Bengali", monospace';
    const diagText = `কর্ণ: ${toBanglaDigits(distLk.toFixed(1))} lk (${ftIn.formattedShortBengali})`;
    const bw = Math.max(110, ctx.measureText(diagText).width + 20);
    const bh = 24;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, midX - bw / 2, midY - bh / 2, bw, bh, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#a5b4fc';
    ctx.textAlign = 'center';
    ctx.fillText(diagText, midX, midY + 4);
    ctx.textAlign = 'left';

    ctx.restore();
  }

  // Draw Virtual Gunia Scale (2-inch / 20-chain ivory/brass surveyor ruler)
  function drawGuniaScale() {
    if (!state.gunia.enabled) return;
    const gState = state.gunia;
    const p = worldToScreen(gState.x, gState.y);
    const zoom = state.camera.zoom;

    // Standard 2-inch Gunia (200 Links / 20 Chains at 16"=1 mile)
    const w = 200 * zoom;
    const h = 50 * zoom;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((gState.rotation * Math.PI) / 180);

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;

    // Semi-translucent aged ivory acrylic body
    ctx.fillStyle = 'rgba(254, 252, 232, 0.92)';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, -w / 2, -h / 2, w, h, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    // Scale title & scale preset
    ctx.fillStyle = '#78350f';
    ctx.font = `bold ${Math.max(9, 11 * zoom)}px "Noto Sans Bengali", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('গুনিয়া স্কেল • ১৬"=১ মাইল', 0, -h / 6);

    // Top graduations (10 Links per small tick, 50 per major)
    const numTicks = 20; // 10 links each = 200 links total
    ctx.strokeStyle = '#451a03';
    for (let i = 0; i <= numTicks; i++) {
      const tx = -w / 2 + (i / numTicks) * w;
      const isMajor = i % 5 === 0;
      const isHalf = i % 5 === 2.5 || i % 2 === 0;
      const tickH = isMajor ? h * 0.42 : (isHalf ? h * 0.28 : h * 0.16);

      ctx.lineWidth = isMajor ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.moveTo(tx, -h / 2);
      ctx.lineTo(tx, -h / 2 + tickH);
      ctx.stroke();

      if (isMajor && zoom > 0.6) {
        ctx.font = `bold ${Math.max(8, 9 * zoom)}px monospace`;
        ctx.fillStyle = '#78350f';
        ctx.fillText((i * 10) + '', tx, -h / 2 + tickH + 9);
      }
    }

    // Bottom graduations (Chains scale: 1 Chain = 100 Links)
    for (let i = 0; i <= 2; i++) {
      const bx = -w / 2 + (i / 2) * w;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, h / 2);
      ctx.lineTo(bx, h / 2 - h * 0.35);
      ctx.stroke();
      if (zoom > 0.6) {
        ctx.font = `bold ${Math.max(8, 9 * zoom)}px monospace`;
        ctx.fillStyle = '#78350f';
        ctx.fillText(`${i} Ch`, bx, h / 2 - h * 0.35 - 3);
      }
    }

    // Rotation Handle (Right edge circle)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(w / 2 - 12 * zoom, 0, 7 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(7, 8 * zoom)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('↻', w / 2 - 12 * zoom, 3 * zoom);

    ctx.restore();
  }

  // Fullscreen Surveyor Crosshair
  function drawCrosshair() {
    const x = state.mouse.screenX;
    const y = state.mouse.screenY;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(logicalW, y);
    ctx.moveTo(x, 0);
    ctx.lineTo(x, logicalH);
    ctx.stroke();

    // Center aperture
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Update Inspector Panel with Active Plot Stats
  function updateInspector() {
    const activePlot = state.plots.find(p => p.id === state.selectedPlotId);
    const inputPlotName = document.getElementById('inputPlotName');

    const selectedCountBadge = document.getElementById('selectedCountBadge');
    if (!activePlot) {
      if (selectedCountBadge) {
        selectedCountBadge.textContent = '০ দাগ';
        selectedCountBadge.className = 'text-[10px] px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-400 font-mono font-bold border border-slate-700/60 shadow-sm';
      }
      if (inputPlotName) {
        inputPlotName.value = '';
        inputPlotName.placeholder = 'কোনো দাগ নির্বাচিত নেই';
        inputPlotName.disabled = true;
      }
      if (typeof inspectorPlotName !== 'undefined' && inspectorPlotName) inspectorPlotName.textContent = 'কোনো দাগ নির্বাচিত নেই';
      if (typeof statShotok !== 'undefined' && statShotok) statShotok.textContent = '0.000';
      if (typeof statKatha !== 'undefined' && statKatha) statKatha.textContent = '0.000';
      if (typeof statBigha !== 'undefined' && statBigha) statBigha.textContent = '0.0000';
      if (typeof statAcre !== 'undefined' && statAcre) statAcre.textContent = '0.0000';
      if (typeof statSqft !== 'undefined' && statSqft) statSqft.textContent = '0.0';
      if (typeof statSqLinks !== 'undefined' && statSqLinks) statSqLinks.textContent = '0';
      if (typeof statSqM !== 'undefined' && statSqM) statSqM.textContent = '0.00';
      if (typeof statPerimeter !== 'undefined' && statPerimeter) statPerimeter.textContent = 'পরিসীমা: ০ ফুট ০ ইঞ্চি (০.০ ft)';
      if (typeof statBanglaSentence !== 'undefined' && statBanglaSentence) statBanglaSentence.textContent = 'দাগ আঁকুন (P) বা সিলেক্ট করুন (V)';
      if (typeof sideMeasurementsTable !== 'undefined' && sideMeasurementsTable) {
        sideMeasurementsTable.innerHTML = '<tr><td colspan="4" class="text-center py-2 text-slate-500">দাগ নির্বাচন করলে আইলের মাপ প্রদর্শিত হবে</td></tr>';
      }
      const scaleByPlotCurrentLen = document.getElementById('scaleByPlotCurrentLen');
      if (scaleByPlotCurrentLen) scaleByPlotCurrentLen.textContent = '০\' - ০" (০ লিংক)';
      const scaleByPlotGroundFeet = document.getElementById('scaleByPlotGroundFeet');
      if (scaleByPlotGroundFeet) scaleByPlotGroundFeet.textContent = '০\' - ০" (০.০ ফুট)';
      const scaleByPlotMapInches = document.getElementById('scaleByPlotMapInches');
      if (scaleByPlotMapInches) scaleByPlotMapInches.textContent = '০.০০ ইঞ্চি (0.00")';
      const scaleByPlotLinks = document.getElementById('scaleByPlotLinks');
      if (scaleByPlotLinks) scaleByPlotLinks.textContent = '০.০ লিংক';
      return;
    }

    const rawArea = calculateShoelaceArea(activePlot.vertices);
    const isEffectiveLine = Boolean(activePlot.isLine) || !activePlot.vertices || activePlot.vertices.length <= 2 || rawArea < 0.15;

    if (selectedCountBadge) {
      selectedCountBadge.textContent = isEffectiveLine ? 'রেখা' : '১টি দাগ';
      selectedCountBadge.className = 'text-[10px] px-2 py-0.5 rounded-lg bg-sky-500/15 text-sky-300 font-mono font-bold border border-sky-500/30 shadow-sm';
    }

    if (inputPlotName) {
      inputPlotName.disabled = false;
      inputPlotName.value = activePlot.name;
    }
    if (typeof inspectorPlotName !== 'undefined' && inspectorPlotName) {
      inspectorPlotName.textContent = activePlot.name + (isEffectiveLine ? ' (রেখা নির্বাচিত)' : ' (নির্বাচিত)');
    }

    // Scale Map by Selected Plot / Line Card Inspector sync (Feet-Inches First Priority & Map Inches)
    const scaleByPlotCurrentLen = document.getElementById('scaleByPlotCurrentLen');
    const scaleByPlotGroundFeet = document.getElementById('scaleByPlotGroundFeet');
    const scaleByPlotMapInches = document.getElementById('scaleByPlotMapInches');
    const scaleByPlotLinks = document.getElementById('scaleByPlotLinks');

    let lineDist = 0;
    if (activePlot.vertices && activePlot.vertices.length > 1) {
      for (let s = 0; s < activePlot.vertices.length - 1; s++) {
        lineDist += Math.hypot(
          activePlot.vertices[s + 1].x - activePlot.vertices[s].x,
          activePlot.vertices[s + 1].y - activePlot.vertices[s].y
        );
      }
    }
    let lineFt = lineDist * FEET_PER_LINK;
    let ftIn = convertFeetToFeetInches(lineFt);
    let mapInches = lineFt / getFeetPerMapInch();

    if (scaleByPlotCurrentLen) {
      scaleByPlotCurrentLen.textContent = `${ftIn.formattedBengali} (${ftIn.formattedShortBengali})`;
    }
    if (scaleByPlotGroundFeet) {
      scaleByPlotGroundFeet.textContent = `${ftIn.formattedBengali} (${toBanglaDigits(lineFt.toFixed(1))} ফুট)`;
    }
    if (scaleByPlotMapInches) {
      scaleByPlotMapInches.textContent = `${toBanglaDigits(mapInches.toFixed(2))} ইঞ্চি (${mapInches.toFixed(2)}")`;
    }
    if (scaleByPlotLinks) {
      const groundInches = Math.round(lineFt * 12);
      scaleByPlotLinks.textContent = `${toBanglaDigits(groundInches)} ইঞ্চি (${toBanglaDigits((lineFt / 3).toFixed(1))} গজ)`;
    }

    if (isEffectiveLine) {
      statShotok.textContent = '০.০০০';
      statKatha.textContent = '০.০০০';
      statBigha.textContent = '০.০০০০';
      statAcre.textContent = '০.০০০০';
      statSqft.textContent = '০.০';
      statSqLinks.textContent = '০';
      statSqM.textContent = '০.০০';
      const segCount = activePlot.vertices ? activePlot.vertices.length - 1 : 1;
      statPerimeter.textContent = (segCount > 1 ? `মোট আইলের দৈর্ঘ্য (${toBanglaDigits(segCount)}টি খণ্ড): ` : 'রেখার দৈর্ঘ্য: ') + ftIn.formattedShortBengali + ' (' + toBanglaDigits(lineFt.toFixed(1)) + ' ft)';
      statBanglaSentence.textContent = `সীমানা আইল রেখা: ${ftIn.formattedBengali} (নকশায় ${toBanglaDigits(mapInches.toFixed(2))} ইঞ্চি • মাটিতে ${toBanglaDigits(Math.round(lineFt * 12))} ইঞ্চি)`;

      if (sideMeasurementsTable) {
        if (activePlot.vertices && activePlot.vertices.length > 2) {
          let rowsHtml = '';
          for (let s = 0; s < activePlot.vertices.length - 1; s++) {
            const segA = activePlot.vertices[s];
            const segB = activePlot.vertices[s + 1];
            const segFt = Math.hypot(segB.x - segA.x, segB.y - segA.y) * FEET_PER_LINK;
            const segFtIn = convertFeetToFeetInches(segFt);
            rowsHtml += `
              <tr class="hover:bg-slate-800/60 transition-colors">
                <td class="py-1.5 px-2.5 font-sans font-bold text-sky-300 text-left">আইল খণ্ড ${toBanglaDigits(s + 1)}</td>
                <td class="py-1.5 px-2 text-center text-emerald-400 font-mono">${toBanglaDigits(Math.round(segFt * 12))}"</td>
                <td class="py-1.5 px-2 text-center text-amber-300 font-mono font-bold">${segFtIn.formattedShortBengali}</td>
                <td class="py-1.5 px-2 text-right text-sky-400 font-mono">${toBanglaDigits(segFt.toFixed(1))} ft</td>
              </tr>
            `;
          }
          rowsHtml += `
            <tr class="bg-sky-950/50 border-t-2 border-sky-500/40 font-bold">
              <td class="py-1.5 px-2.5 font-sans text-amber-300 text-left">মোট দৈর্ঘ্য</td>
              <td class="py-1.5 px-2 text-center text-emerald-400 font-mono">${toBanglaDigits(Math.round(lineFt * 12))}"</td>
              <td class="py-1.5 px-2 text-center text-amber-300 font-mono">${ftIn.formattedShortBengali}</td>
              <td class="py-1.5 px-2 text-right text-sky-400 font-mono">${toBanglaDigits(lineFt.toFixed(1))} ft</td>
            </tr>
          `;
          sideMeasurementsTable.innerHTML = rowsHtml;
        } else {
          sideMeasurementsTable.innerHTML = `
            <tr class="hover:bg-slate-800/60 transition-colors">
              <td class="py-1.5 px-2.5 font-sans font-bold text-sky-300 text-left">আইল রেখা</td>
              <td class="py-1.5 px-2 text-center text-emerald-400 font-mono">${toBanglaDigits(Math.round(lineFt * 12))}" ইঞ্চি</td>
              <td class="py-1.5 px-2 text-center text-amber-300 font-mono font-bold">${ftIn.formattedShortBengali}</td>
              <td class="py-1.5 px-2 text-right text-sky-400 font-mono">${toBanglaDigits(lineFt.toFixed(1))} ft</td>
            </tr>
          `;
        }
      }
      return;
    }

    const sqLinks = rawArea;
    const sqft = sqLinks * SQFT_PER_SQLINK;
    const shotok = sqft / SQFT_PER_SHOTOK;
    const katha = sqft / SQFT_PER_KATHA;
    const bigha = sqft / SQFT_PER_BIGHA;
    const acre = sqft / SQFT_PER_ACRE;
    const sqM = sqft / SQFT_PER_SQMETER;
    const perimLinks = calculatePerimeter(activePlot.vertices);
    const perimeterFeet = perimLinks * FEET_PER_LINK;
    const perimFtIn = convertFeetToFeetInches(perimeterFeet);

    statShotok.textContent = toBanglaDigits(shotok.toFixed(3));
    statKatha.textContent = toBanglaDigits(katha.toFixed(3));
    statBigha.textContent = toBanglaDigits(bigha.toFixed(4));
    statAcre.textContent = toBanglaDigits(acre.toFixed(4));
    statSqft.textContent = toBanglaDigits(sqft.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
    statSqLinks.textContent = toBanglaDigits((sqft * 144).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }));
    statSqM.textContent = toBanglaDigits(sqM.toFixed(2));
    statPerimeter.textContent = 'পরিসীমা: ' + perimFtIn.formattedShortBengali + ' (' + toBanglaDigits(perimeterFeet.toFixed(1)) + ' ft)';

    // Bangla sentence formatter
    const kathaPart = Math.floor(katha);
    const shotokRemaining = (shotok % 1.652893).toFixed(1);
    statBanglaSentence.textContent = toBanglaDigits(shotok.toFixed(2)) + ' শতক (' + toBanglaDigits(kathaPart) + ' কাঠা ' + toBanglaDigits(shotokRemaining) + ' শতক)';

    // Dynamic Side Measurements Table in Inspector (4 columns: আইল, ইঞ্চি, ফুট-ইঞ্চি, দশমিক ফুট)
    if (sideMeasurementsTable) {
      let rowsHtml = '';
      const sideNames = ['উত্তর আইল (North)', 'পূর্ব আইল (East)', 'দক্ষিণ আইল (South)', 'পশ্চিম আইল (West)', 'আইল ৫', 'আইল ৬', 'আইল ৭', 'আইল ৮', 'আইল ৯', 'আইল ১০'];
      for (let i = 0; i < activePlot.vertices.length; i++) {
        const pA = activePlot.vertices[i];
        const pB = activePlot.vertices[(i + 1) % activePlot.vertices.length];
        const lk = Math.hypot(pB.x - pA.x, pB.y - pA.y);
        const ft = lk * FEET_PER_LINK;
        const ftInSide = convertFeetToFeetInches(ft);
        const name = sideNames[i] || `আইল ${toBanglaDigits(i + 1)}`;
        const groundInchesSide = Math.round(ft * 12);
        rowsHtml += `
          <tr class="hover:bg-slate-800/60 transition-colors">
            <td class="py-1.5 px-2.5 font-sans font-bold text-slate-300 text-left">${name}</td>
            <td class="py-1.5 px-2 text-center text-emerald-400 font-mono">${toBanglaDigits(groundInchesSide)}" ইঞ্চি</td>
            <td class="py-1.5 px-2 text-center text-amber-300 font-mono font-bold">${ftInSide.formattedShortBengali}</td>
            <td class="py-1.5 px-2 text-right text-sky-400 font-mono">${toBanglaDigits(ft.toFixed(1))} ft</td>
          </tr>
        `;
      }
      sideMeasurementsTable.innerHTML = rowsHtml;
    }

    // Update Split Simulator
    updateSplitSimulator(shotok);

    // Update Auto 4-Side Boundary (চৌহদ্দি)
    updateChouhaddi(activePlot);

    // Update Land Valuation (বাজারমূল্য)
    updateValuation(shotok);
  }

  // AutoCAD-style Reference Scaling of Active Mouza Map according to a Selected Dag / Scale Bar line
  // Supports Survey Formula: 5280 ft = 1 mile, 16" = 1 mile -> 1" = 330 ft (5 chains), 2" = 660 ft (10 chains)
  function scaleActiveMapByDag(plot, targetVal, unit = 'feet') {
    if (!plot || !plot.vertices || plot.vertices.length < 2) {
      showToast('স্কেল করতে কমপক্ষে ২টি পয়েন্টের দাগ বা রেখা সিলেক্ট করুন', 'warning');
      return;
    }
    const val = parseFloat(targetVal);
    if (!val || val <= 0) {
      showToast('সঠিক দূরত্ব ইনপুট দিন (যেমন: ২ ইঞ্চি, ৬৬০ ফুট বা ৩৩০ ফুট)', 'warning');
      return;
    }

    let targetFeet = 0;
    let targetLinks = 0;
    if (unit === 'inch') {
      targetFeet = val * getFeetPerMapInch();
      targetLinks = targetFeet / FEET_PER_LINK;
    } else if (unit === 'ground_inch') {
      targetFeet = val / 12.0;
      targetLinks = targetFeet / FEET_PER_LINK;
    } else if (unit === 'feet') {
      targetFeet = val;
      targetLinks = targetFeet / FEET_PER_LINK; // 660 ft / 0.66 = 1000 units
    } else if (unit === 'chain') {
      targetLinks = val * 100;
      targetFeet = targetLinks * FEET_PER_LINK;
    } else {
      targetFeet = val;
      targetLinks = targetFeet / FEET_PER_LINK;
    }

    const p1 = plot.vertices[0];
    const p2 = plot.vertices[plot.vertices.length - 1];
    const currDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    if (currDist <= 0.001) {
      showToast('রেখার দৈর্ঘ্য অতি ক্ষুদ্র', 'error');
      return;
    }

    // Find the map sheet that this plot belongs to (or active map)
    const mapForPlot = plot.mapSheetId ? (state.mouzaMaps || []).find(m => m.id === plot.mapSheetId) : null;
    const activeMap = mapForPlot || getMapAtWorldCoord(p1.x, p1.y) || getActiveMouzaMap();

    if (!activeMap || !activeMap.loaded) {
      showToast('কোনো মৌজা নকশা লোড করা নেই', 'warning');
      return;
    }

    if (activeMap.id && state.activeMapId !== activeMap.id) {
      state.activeMapId = activeMap.id;
      updateMapSheetsUI();
    }

    const S = targetLinks / currDist;

    // Scale Mouza Map with anchor at p1 (AutoCAD Reference Scaling)
    const oldW = activeMap.width;
    const oldH = activeMap.height;
    const oldX = activeMap.x;
    const oldY = activeMap.y;

    activeMap.width = oldW * S;
    activeMap.height = oldH * S;
    activeMap.x = p1.x - (p1.x - oldX) * S;
    activeMap.y = p1.y - (p1.y - oldY) * S;
    activeMap.isCalibrated = true;
    activeMap.scaleFactor = S;
    activeMap.calibratedTargetLinks = targetLinks;
    activeMap.calibratedPixelDist = currDist;

    // Scale all vertices of this plot anchored at p1 so this plot's length equals target
    plot.vertices = plot.vertices.map(v => ({
      x: p1.x + (v.x - p1.x) * S,
      y: p1.y + (v.y - p1.y) * S
    }));

    // Also scale any other plots on canvas
    state.plots.forEach(otherPlot => {
      if (otherPlot.id !== plot.id) {
        otherPlot.vertices = otherPlot.vertices.map(v => ({
          x: p1.x + (v.x - p1.x) * S,
          y: p1.y + (v.y - p1.y) * S
        }));
      }
    });

    const ftInRes = convertFeetToFeetInches(targetFeet);
    const mapInchesRes = targetFeet / getFeetPerMapInch();
    updateScaleStatusBadge();
    updateInspector();
    pushHistory();
    render();

    const groundInchesTotal = Math.round(targetFeet * 12);
    showToast(`✓ নকশা নিখুঁতভাবে স্কেল হয়েছে! রেখাটি এখন ${ftInRes.formattedBengali} (নকশায় ${toBanglaDigits(mapInchesRes.toFixed(2))} ইঞ্চি • মাটিতে ${toBanglaDigits(groundInchesTotal)} ইঞ্চি)`, 'success');
  }

  // Wire Scale-by-Plot Quick Chips and Apply Button (Feet-Inches First Priority & Map Inches)
  document.querySelectorAll('.btn-quick-scale-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const activePlot = state.plots.find(p => p.id === state.selectedPlotId);
      if (!activePlot) {
        showToast('প্রথমে ক্যানভাস থেকে দাগ বা স্কেল বারের রেখাটি নির্বাচন করুন', 'warning');
        return;
      }
      const inches = parseFloat(chip.getAttribute('data-inches'));
      const feet = parseFloat(chip.getAttribute('data-feet'));
      if (inches) {
        scaleActiveMapByDag(activePlot, inches, 'inch');
      } else if (feet) {
        scaleActiveMapByDag(activePlot, feet, 'feet');
      } else {
        const links = parseFloat(chip.getAttribute('data-links')) || 1000;
        scaleActiveMapByDag(activePlot, links, 'link');
      }
    });
  });

  document.getElementById('btnApplyScaleByPlot')?.addEventListener('click', () => {
    const activePlot = state.plots.find(p => p.id === state.selectedPlotId);
    if (!activePlot) {
      showToast('প্রথমে ক্যানভাস থেকে দাগ বা স্কেল বারের রেখাটি নির্বাচন করুন', 'warning');
      return;
    }
    const customVal = parseFloat(document.getElementById('inputCustomScaleValue')?.value || document.getElementById('inputCustomScaleLinks')?.value);
    const unit = document.getElementById('selectScaleUnit')?.value || 'feet';
    if (!customVal || customVal <= 0) {
      showToast('সঠিক বাস্তব পরিমাপ ইনপুট দিন (যেমন: ২ ইঞ্চি বা ৬৬০ ফুট)', 'warning');
      return;
    }
    scaleActiveMapByDag(activePlot, customVal, unit);
  });

  // Wire Inspector Plot Name Input
  const inspectorNameInputEl = document.getElementById('inputPlotName');
  if (inspectorNameInputEl) {
    inspectorNameInputEl.addEventListener('input', e => {
      const activePlot = state.plots.find(p => p.id === state.selectedPlotId);
      if (activePlot) {
        activePlot.name = formatBanglaDaagName(e.target.value);
        render();
      }
    });
    inspectorNameInputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        inspectorNameInputEl.blur();
        showToast('✓ দাগ নম্বর সফলভাবে সংরক্ষিত হয়েছে', 'success');
      }
    });
  }

  // Delete Selected Plot or Measurement Line
  function deleteSelectedPlot() {
    if (!state.selectedPlotId) {
      showToast('মুছে ফেলার মতো কোনো দাগ সিলেক্ট করা নেই। দাগে ক্লিক করে সিলেক্ট করুন।', 'warning');
      return;
    }
    const idx = state.plots.findIndex(p => p.id === state.selectedPlotId);
    if (idx !== -1) {
      const deletedPlot = state.plots[idx];
      const name = deletedPlot.name || 'দাগ';
      state.plots.splice(idx, 1);
      state.selectedPlotId = state.plots.length > 0 ? state.plots[state.plots.length - 1].id : null;
      pushHistory();
      updateInspector();
      render();
      showToast(`🗑️ ${name} সফলভাবে মুছে ফেলা হয়েছে!`, 'success');
    }
  }

  // Start Drawing a New Plot/Dag
  function startNewPlotDrawing() {
    state.activePolyline = [];
    state.tool = 'polygon';
    updateToolUI();
    drawHintBox.classList.remove('opacity-0');
    drawHintText.textContent = '✏️ নতুন দাগ আঁকুন: পয়েন্টগুলোতে ক্লিক করুন, শেষ করতে ডাবল ক্লিক করুন (বাতিল করতে Esc)';
    render();
    showToast('নতুন দাগ অঙ্কন মোড সক্রিয়। পয়েন্টগুলোতে ক্লিক করুন।', 'info');
  }

  // Wire Delete and New Plot buttons
  document.getElementById('btnDeleteSelectedPlot')?.addEventListener('click', deleteSelectedPlot);
  document.getElementById('btnDeletePlotSecondary')?.addEventListener('click', deleteSelectedPlot);
  document.getElementById('btnDrawNewPlot')?.addEventListener('click', startNewPlotDrawing);
  document.getElementById('btnCancelActiveDrawing')?.addEventListener('click', () => {
    state.activePolyline = [];
    state.calibrationPoints = [];
    state.slicePoints = [];
    state.tool = 'select';
    updateToolUI();
    drawHintBox.classList.add('opacity-0');
    render();
    showToast('অঙ্কন বাতিল করা হয়েছে', 'info');
  });

  // Wire Floating Rename Box Actions
  document.getElementById('btnFloatingSaveName')?.addEventListener('click', () => {
    hideFloatingRenameBox(true);
    showToast('✓ দাগ নম্বর সফলভাবে সেট হয়েছে', 'success');
  });
  document.getElementById('btnFloatingCloseName')?.addEventListener('click', () => {
    hideFloatingRenameBox(false);
  });
  document.getElementById('floatingPlotNameInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      hideFloatingRenameBox(true);
      showToast('✓ দাগ নম্বর সফলভাবে সেট হয়েছে', 'success');
    } else if (e.key === 'Escape') {
      hideFloatingRenameBox(false);
    }
  });

  function updateChouhaddi(activePlot) {
    if (!activePlot || !activePlot.vertices || activePlot.vertices.length < 3) return;

    const c = calculateCentroid(activePlot.vertices);
    const minY = Math.min(...activePlot.vertices.map(v => v.y));

    let north = 'দাগ সীমানা';
    let south = 'দাগ সীমানা';
    let east = 'দাগ সীমানা';
    let west = 'দাগ সীমানা';

    if (minY <= 140) {
      north = '১২ ফুট সরকারি পাকা রাস্তা';
    }

    let distN = Infinity, distS = Infinity, distE = Infinity, distW = Infinity;
    for (const p of state.plots) {
      if (p.id === activePlot.id) continue;
      const pc = calculateCentroid(p.vertices);
      const dx = pc.x - c.x;
      const dy = pc.y - c.y;

      // North
      if (dy < -20 && Math.abs(dx) < 110 && Math.abs(dy) < distN) {
        distN = Math.abs(dy);
        north = p.name;
      }
      // South
      if (dy > 20 && Math.abs(dx) < 110 && dy < distS) {
        distS = dy;
        south = p.name;
      }
      // East
      if (dx > 20 && Math.abs(dy) < 90 && dx < distE) {
        distE = dx;
        east = p.name;
      }
      // West
      if (dx < -20 && Math.abs(dy) < 90 && Math.abs(dx) < distW) {
        distW = Math.abs(dx);
        west = p.name;
      }
    }

    const elN = document.getElementById('chouhaddiNorth');
    const elS = document.getElementById('chouhaddiSouth');
    const elE = document.getElementById('chouhaddiEast');
    const elW = document.getElementById('chouhaddiWest');
    if (elN) elN.textContent = north;
    if (elS) elS.textContent = south;
    if (elE) elE.textContent = east;
    if (elW) elW.textContent = west;
  }

  function updateValuation(shotok) {
    const rateInput = document.getElementById('ratePerShotokInput');
    const rate = parseFloat(rateInput?.value) || state.ratePerShotok || 350000;
    const total = shotok * rate;
    const totalEl = document.getElementById('statTotalValuation');
    if (totalEl) {
      let formatted = '৳ ' + Math.round(total).toLocaleString('en-IN');
      if (total >= 10000000) {
        formatted += ` (${(total / 10000000).toFixed(2)} কোটি)`;
      } else if (total >= 100000) {
        formatted += ` (${(total / 100000).toFixed(2)} লাখ)`;
      }
      totalEl.textContent = formatted;
    }
  }

  function updateSplitSimulator(totalShotok) {
    const ratio = state.splitRatio;
    const partA = totalShotok * ratio;
    const partB = totalShotok * (1 - ratio);

    splitRatioLabel.textContent = (ratio * 100).toFixed(0) + '% : ' + ((1 - ratio) * 100).toFixed(0) + '%';
    splitPlotA.textContent = partA.toFixed(2) + ' শতক';
    splitPlotB.textContent = partB.toFixed(2) + ' শতক';
  }

  // CAD Offset Setback Generator (e.g. 10 links road setback)
  function applyPlotOffset(plotId, offsetDist) {
    const plot = state.plots.find(p => p.id === plotId);
    if (!plot || plot.vertices.length < 3) return;

    const centroid = calculateCentroid(plot.vertices);
    const newVertices = plot.vertices.map(v => {
      const dx = v.x - centroid.x;
      const dy = v.y - centroid.y;
      const dist = Math.hypot(dx, dy);
      const scale = (dist - offsetDist) / dist;
      return {
        x: centroid.x + dx * scale,
        y: centroid.y + dy * scale
      };
    });

    const newPlotId = 'plot-offset-' + (state.plots.length + 1);
    state.plots.push({
      id: newPlotId,
      name: plot.name + ' (অফসেট বাউন্ডারি)',
      layer: 'plots',
      fillColor: 'rgba(236, 72, 153, 0.18)',
      strokeColor: '#ec4899',
      vertices: newVertices
    });

    state.selectedPlotId = newPlotId;
    state.tool = 'select';
    updateToolUI();
    updateInspector();
    render();
    showToast('১০ লিংক বাউন্ডারি অফসেট তৈরি করা হয়েছে', 'success');
  }

  // Geometric Slicer: Cut a Polygon into Two Sub-Polygons by Partition Line
  function applyPlotSlice(cutStart, cutEnd) {
    const targetPlot = state.plots.find(p => p.id === state.selectedPlotId);
    if (!targetPlot || targetPlot.vertices.length < 3) return;

    const vs = targetPlot.vertices;
    const minX = Math.min(...vs.map(v => v.x));
    const maxX = Math.max(...vs.map(v => v.x));
    const minY = Math.min(...vs.map(v => v.y));
    const maxY = Math.max(...vs.map(v => v.y));

    const midX = minX + (maxX - minX) * state.splitRatio;

    const plotA_vertices = [
      { x: minX, y: minY },
      { x: midX, y: minY },
      { x: midX, y: maxY },
      { x: minX, y: maxY }
    ];

    const plotB_vertices = [
      { x: midX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: midX, y: maxY }
    ];

    state.plots = state.plots.filter(p => p.id !== targetPlot.id);

    const baseName = targetPlot.name.replace(' (বন্টিত)', '');
    const idA = targetPlot.id + '-a';
    const idB = targetPlot.id + '-b';

    state.plots.push({
      id: idA,
      name: baseName + '/ক',
      layer: 'plots',
      fillColor: 'rgba(245, 158, 11, 0.22)',
      strokeColor: '#f59e0b',
      vertices: plotA_vertices
    });

    state.plots.push({
      id: idB,
      name: baseName + '/খ',
      layer: 'plots',
      fillColor: 'rgba(56, 189, 248, 0.20)',
      strokeColor: '#38bdf8',
      vertices: plotB_vertices
    });

    state.selectedPlotId = idA;
    state.slicePoints = [];
    state.tool = 'select';
    updateToolUI();
    updateInspector();
    render();
    showToast('দাগ সফলভাবে কর্তন করে দুটি অংশে বিভক্ত করা হয়েছে', 'success');
  }

  // Generate DXF File Content (AutoCAD R12/2000 Compatible ASCII)
  function generateDXF() {
    let dxf = '0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n0\nLAYER\n2\nPLOTS\n70\n0\n62\n5\n6\nCONTINUOUS\n0\nENDTAB\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n';

    state.plots.forEach(plot => {
      dxf += '0\nLWPOLYLINE\n';
      dxf += '8\nPLOTS\n';
      dxf += '90\n' + plot.vertices.length + '\n';
      dxf += '70\n1\n';
      plot.vertices.forEach(v => {
        dxf += '10\n' + v.x.toFixed(4) + '\n';
        dxf += '20\n' + v.y.toFixed(4) + '\n';
      });

      const c = calculateCentroid(plot.vertices);
      dxf += '0\nTEXT\n8\nPLOTS\n';
      dxf += '10\n' + c.x.toFixed(4) + '\n';
      dxf += '20\n' + c.y.toFixed(4) + '\n';
      dxf += '40\n8.0\n';
      dxf += '1\n' + plot.name + '\n';
    });

    dxf += '0\nENDSEC\n0\nEOF\n';
    return dxf;
  }

  function downloadDXF() {
    const dxfContent = generateDXF();
    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'মৌজা_দাগ_নকশা.dxf';
    a.click();
    URL.revokeObjectURL(url);
  }

  function saveLscadProject() {
    const projectData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      scalePreset: state.scalePreset,
      unit: state.unit,
      plots: state.plots,
      pillars: state.pillars,
      annotations: state.annotations,
      mouzaMap: {
        x: state.mouzaMap.x,
        y: state.mouzaMap.y,
        width: state.mouzaMap.width,
        height: state.mouzaMap.height,
        opacity: state.mouzaMap.opacity,
        filters: state.mouzaMap.filters
      }
    };

    if (window.electronAPI && window.electronAPI.saveProject) {
      window.electronAPI.saveProject(projectData);
    } else {
      const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'মৌজা_জরিপ_নকশা.lscad';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // Spacebar and Keydown Tracking for Pan & Shortcuts
  let isSpacePressed = false;
  window.addEventListener('keydown', e => {
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      isSpacePressed = true;
      if (!state.camera.isPanning) canvas.style.cursor = 'grab';
    }
    if ((e.key === 'h' || e.key === 'H') && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      document.querySelector('.tool-btn[data-tool="pan"]')?.click();
    }
  });
  window.addEventListener('keyup', e => {
    if (e.code === 'Space') {
      isSpacePressed = false;
      if (!state.camera.isPanning) {
        canvas.style.cursor = (state.tool === 'pan' || state.tool === 'map-move') ? 'grab' : 'crosshair';
      }
    }
  });

  // Disable Browser Context Menu on Canvas to enable smooth Right-Click Drag Pan
  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
  });

  // Mouse & Touch Event Handlers
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    state.mouse.screenX = e.clientX - rect.left;
    state.mouse.screenY = e.clientY - rect.top;

    // Pan canvas anytime isPanning is true (High Priority Top Handler - smooth at all zoom levels)
    if (state.camera.isPanning) {
      const dx = state.mouse.screenX - state.camera.panStartX;
      const dy = state.mouse.screenY - state.camera.panStartY;
      state.camera.x -= dx / state.camera.zoom;
      state.camera.y -= dy / state.camera.zoom;
      state.camera.panStartX = state.mouse.screenX;
      state.camera.panStartY = state.mouse.screenY;
      canvas.style.cursor = 'grabbing';
      render();
      return;
    }

    const world = screenToWorld(state.mouse.screenX, state.mouse.screenY);
    state.mouse.worldX = world.x;
    state.mouse.worldY = world.y;

    // Map Sheet Dragging / Moving (AutoCAD Multi-Sheet Free Positioning)
    if (state.dragMap && state.dragMap.isDragging && state.dragMap.mapId) {
      const activeSheet = (state.mouzaMaps || []).find(m => m.id === state.dragMap.mapId);
      if (activeSheet && !activeSheet.locked) {
        activeSheet.x = state.dragMap.mapStartX + (world.x - state.dragMap.dragStartX);
        activeSheet.y = state.dragMap.mapStartY + (world.y - state.dragMap.dragStartY);
        canvas.style.cursor = 'grabbing';
        render();
        return;
      }
    }

    // Set cursor for Map Move tool and Pan tool
    if (state.tool === 'map-move' || state.tool === 'pan' || isSpacePressed) {
      canvas.style.cursor = 'grab';
    } else {
      canvas.style.cursor = 'crosshair';
    }

    // Gunia Scale dragging / rotation
    if (state.gunia.enabled && state.gunia.isDragging) {
      state.gunia.x = world.x - state.gunia.dragOffsetX;
      state.gunia.y = world.y - state.gunia.dragOffsetY;
      render();
      return;
    }
    if (state.gunia.enabled && state.gunia.isRotating) {
      const gp = worldToScreen(state.gunia.x, state.gunia.y);
      const angleRad = Math.atan2(state.mouse.screenY - gp.y, state.mouse.screenX - gp.x);
      state.gunia.rotation = Math.round(angleRad * (180 / Math.PI));
      render();
      return;
    }

    // Check hover over green grip boxes (AutoCAD Glowing Green Aura) - for selected plot or any plot
    state.hoveredVertex = null;
    if (!state.camera.isPanning && !state.dragVertex.isDragging) {
      if (state.selectedPlotId) {
        const activePlot = state.plots.find(p => p.id === state.selectedPlotId);
        if (activePlot) {
          for (let i = 0; i < activePlot.vertices.length; i++) {
            const v = activePlot.vertices[i];
            const sp = worldToScreen(v.x, v.y);
            if (Math.hypot(sp.x - state.mouse.screenX, sp.y - state.mouse.screenY) <= 18) {
              state.hoveredVertex = { plotId: activePlot.id, vertexIndex: i };
              canvas.style.cursor = 'grab';
              break;
            }
          }
        }
      }
      if (!state.hoveredVertex) {
        for (const plot of state.plots) {
          if (plot.id === state.selectedPlotId) continue;
          for (let i = 0; i < plot.vertices.length; i++) {
            const v = plot.vertices[i];
            const sp = worldToScreen(v.x, v.y);
            if (Math.hypot(sp.x - state.mouse.screenX, sp.y - state.mouse.screenY) <= 16) {
              state.hoveredVertex = { plotId: plot.id, vertexIndex: i };
              canvas.style.cursor = 'grab';
              break;
            }
          }
          if (state.hoveredVertex) break;
        }
      }
    }

    // Draggable Vertex Handle logic (AutoCAD Glowing Green Grip Points with Live Dimension Tooltip)
    if (state.dragVertex.isDragging && state.dragVertex.plotId) {
      const activePlot = state.plots.find(p => p.id === state.dragVertex.plotId);
      if (activePlot && state.dragVertex.vertexIndex >= 0) {
        activePlot.vertices[state.dragVertex.vertexIndex].x = world.x;
        activePlot.vertices[state.dragVertex.vertexIndex].y = world.y;

        // Calculate live dimension feedback for the floating tooltip
        const idx = state.dragVertex.vertexIndex;
        const vs = activePlot.vertices;
        let refV = null;
        if (vs.length === 2) {
          refV = vs[1 - idx];
        } else if (vs.length >= 3) {
          refV = vs[(idx - 1 + vs.length) % vs.length];
        }
        if (refV) {
          const lk = Math.hypot(world.x - refV.x, world.y - refV.y);
          const ft = lk * FEET_PER_LINK;
          const ftIn = convertFeetToFeetInches(ft, true);
          const mapInches = ft / getFeetPerMapInch();
          const groundInches = ft * 12;
          state.liveDragTooltip = {
            screenX: state.mouse.screenX,
            screenY: state.mouse.screenY,
            ftIn: ftIn.formattedShortBengali,
            mapInches: toBanglaDigits(mapInches.toFixed(2)),
            inches: toBanglaDigits(groundInches.toFixed(0))
          };
        }
        canvas.style.cursor = 'grabbing';
        updateInspector();
        render();
        return;
      }
    }

    // Check Snapping
    state.activeSnapPoint = findSnapPoint(world.x, world.y);

    // Coordinate HUD
    const displayX = state.activeSnapPoint ? state.activeSnapPoint.x : world.x;
    const displayY = state.activeSnapPoint ? state.activeSnapPoint.y : world.y;
    coordXEl.textContent = displayX.toFixed(1);
    coordYEl.textContent = displayY.toFixed(1);

    // Update live GPS in bottom status bar
    const coordGPSEl = document.getElementById('coordGPS');
    if (coordGPSEl) {
      const originGPS = state.satellite?.originGPS || { lat: 23.3167, lng: 90.7500 };
      const anchorWorld = state.satellite?.anchorWorld || { x: 0, y: 0 };
      const gps = window.LSCAD?.PlotOps?.canvasToGPS ? window.LSCAD.PlotOps.canvasToGPS(displayX, displayY, originGPS, anchorWorld) : null;
      if (gps) {
        coordGPSEl.textContent = `GPS: ${gps.lat.toFixed(5)}°N, ${gps.lng.toFixed(5)}°E`;
      } else {
        const dLat = ((displayY - anchorWorld.y) * 0.66) / 364000;
        const dLng = ((displayX - anchorWorld.x) * 0.66) / (364000 * Math.cos(originGPS.lat * Math.PI / 180));
        coordGPSEl.textContent = `GPS: ${(originGPS.lat - dLat).toFixed(5)}°N, ${(originGPS.lng + dLng).toFixed(5)}°E`;
      }
    }

    // Live Scale Calibration hint during mouse move
    if (state.tool === 'calibrate' && state.calibrationPoints.length === 1) {
      const p1 = state.calibrationPoints[0];
      const curDist = Math.hypot(world.x - p1.x, world.y - p1.y);
      const curFtIn = convertLinksToFeetInches(curDist);
      drawHintBox.classList.remove('opacity-0');
      drawHintText.textContent = `[AutoCAD ALIGN ধাপ ২/২] স্কেল বারের অপর প্রান্ত ক্লিক করুন • লাইভ দূরত্ব: ${curDist.toFixed(1)} px (${curFtIn.formattedShortBengali})`;
    }

    render();
  });

  canvas.addEventListener('mousedown', e => {
    hideFloatingRenameBox(true);

    // Universal Pan: Right-Click (2), Middle-Click (1), Spacebar + Click, or Pan Tool (H)
    if (e.button === 2 || e.button === 1 || isSpacePressed || state.tool === 'pan') {
      state.camera.isPanning = true;
      state.camera.panStartX = state.mouse.screenX;
      state.camera.panStartY = state.mouse.screenY;
      canvas.style.cursor = 'grabbing';
      return;
    }

    if (e.button === 0) { // Left click
      const pt = state.activeSnapPoint || { x: state.mouse.worldX, y: state.mouse.worldY };

      // 0. AutoCAD GPS Pin Placement (Can click ANY point/vertex on a plot, snap point, or canvas)
      if (state.tool === 'gps-pin') {
        let targetPt = pt;
        // Priority 1: Check active snap point
        if (state.activeSnapPoint) {
          targetPt = { x: state.activeSnapPoint.x, y: state.activeSnapPoint.y };
        }
        // Priority 2: Check hovered vertex
        else if (state.hoveredVertex) {
          targetPt = { x: state.hoveredVertex.x, y: state.hoveredVertex.y };
        } else {
          // Priority 3: Check if within 25px of ANY plot vertex
          for (const plot of state.plots) {
            for (const v of plot.vertices) {
              const sp = worldToScreen(v.x, v.y);
              if (Math.hypot(sp.x - state.mouse.screenX, sp.y - state.mouse.screenY) <= 25) {
                targetPt = { x: v.x, y: v.y };
                break;
              }
            }
          }
        }

        setGpsLocationPin(targetPt.x, targetPt.y);
        state.tool = 'select';
        updateToolUI();
        drawHintBox.classList.add('opacity-0');
        render();
        return;
      }

      // Multi-sheet intelligent auto-activation:
      // Clicking on any loaded map sheet instantly focuses that sheet for all tools
      const clickedMap = getMapAtWorldCoord(state.mouse.worldX, state.mouse.worldY);
      if (clickedMap && clickedMap.id && clickedMap.id !== state.activeMapId && clickedMap.loaded) {
        state.activeMapId = clickedMap.id;
        updateMapSheetsUI();
        updateScaleStatusBadge();
      }

      // Check Map Move Interaction (Map Move Tool OR Click on Map Drag Tag OR Alt Key)
      if (state.tool === 'map-move' || e.altKey) {
        const maps = state.mouzaMaps || [];
        for (let i = maps.length - 1; i >= 0; i--) {
          const sheet = maps[i];
          if (!sheet.visible || sheet.locked) continue;
          if (state.mouse.worldX >= sheet.x && state.mouse.worldX <= sheet.x + sheet.width &&
              state.mouse.worldY >= sheet.y && state.mouse.worldY <= sheet.y + sheet.height) {
            state.activeMapId = sheet.id;
            state.dragMap.isDragging = true;
            state.dragMap.mapId = sheet.id;
            state.dragMap.dragStartX = state.mouse.worldX;
            state.dragMap.dragStartY = state.mouse.worldY;
            state.dragMap.mapStartX = sheet.x;
            state.dragMap.mapStartY = sheet.y;
            canvas.style.cursor = 'grabbing';
            render();
            return;
          }
        }
      }

      // Check if user clicked on any Map's top-left title tag in ANY tool
      const maps = state.mouzaMaps || [];
      for (let i = maps.length - 1; i >= 0; i--) {
        const sheet = maps[i];
        if (!sheet.visible || sheet.locked) continue;
        const sp = worldToScreen(sheet.x, sheet.y);
        if (state.mouse.screenX >= sp.x && state.mouse.screenX <= sp.x + 180 &&
            state.mouse.screenY >= sp.y - 32 && state.mouse.screenY <= sp.y + 10) {
          state.activeMapId = sheet.id;
          state.dragMap.isDragging = true;
          state.dragMap.mapId = sheet.id;
          state.dragMap.dragStartX = state.mouse.worldX;
          state.dragMap.dragStartY = state.mouse.worldY;
          state.dragMap.mapStartX = sheet.x;
          state.dragMap.mapStartY = sheet.y;
          canvas.style.cursor = 'grabbing';
          render();
          return;
        }
      }

      // 0. Check Gunia Scale interaction (Draggable / Rotatable)
      if (state.gunia.enabled) {
        const gp = worldToScreen(state.gunia.x, state.gunia.y);
        const zoom = state.camera.zoom;
        const w = 200 * zoom;
        const h = 50 * zoom;

        const dx = state.mouse.screenX - gp.x;
        const dy = state.mouse.screenY - gp.y;
        const rad = (-state.gunia.rotation * Math.PI) / 180;
        const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
        const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

        // Rotation Handle at (w/2 - 12*zoom, 0)
        const handleDist = Math.hypot(localX - (w / 2 - 12 * zoom), localY);
        if (handleDist < 16 * zoom) {
          state.gunia.isRotating = true;
          return;
        }

        // Body Drag
        if (Math.abs(localX) <= w / 2 && Math.abs(localY) <= h / 2) {
          state.gunia.isDragging = true;
          state.gunia.dragOffsetX = state.mouse.worldX - state.gunia.x;
          state.gunia.dragOffsetY = state.mouse.worldY - state.gunia.y;
          return;
        }
      }

      // Georeferencing / AutoCAD Align 2-point mode
      if (state.geoAlignMode && state.geoAlignMode.active) {
        handleGeoAlignClick(pt.x, pt.y);
        return;
      }

      // 1. Diagonal Measure Tool
      if (state.tool === 'diagonal') {
        state.diagonalPoints.push(pt);
        if (state.diagonalPoints.length === 2) {
          const p1 = state.diagonalPoints[0];
          const p2 = state.diagonalPoints[1];
          const lk = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const ft = lk * FEET_PER_LINK;
          drawHintBox.classList.remove('opacity-0');
          drawHintText.textContent = `📐 কর্ণের পরিমাপ: ${lk.toFixed(2)} লিংক (${ft.toFixed(2)} ফুট)`;
        } else if (state.diagonalPoints.length > 2) {
          state.diagonalPoints = [pt];
          drawHintBox.classList.remove('opacity-0');
          drawHintText.textContent = 'কর্ণের দ্বিতীয় পয়েন্টে ক্লিক করুন পরিমাপের জন্য';
        } else {
          drawHintBox.classList.remove('opacity-0');
          drawHintText.textContent = 'কর্ণের দ্বিতীয় পয়েন্টে ক্লিক করুন পরিমাপের জন্য';
        }
        render();
        return;
      }

      // 2. Check if clicking ANY plot vertex green grip handle (AutoCAD Glowing Green Box)
      if (state.hoveredVertex || (state.activePolyline.length === 0 && (state.tool === 'select' || state.tool === 'polyline' || state.tool === 'polygon' || state.tool === 'magic-wand'))) {
        const targetPlotId = state.hoveredVertex ? state.hoveredVertex.plotId : state.selectedPlotId;
        const candidatePlots = targetPlotId
          ? [state.plots.find(p => p.id === targetPlotId), ...state.plots.filter(p => p.id !== targetPlotId)].filter(Boolean)
          : state.plots;

        for (const plot of candidatePlots) {
          for (let i = 0; i < plot.vertices.length; i++) {
            const v = plot.vertices[i];
            const sp = worldToScreen(v.x, v.y);
            // 20px screen-space hit-testing ensures effortless grab at ANY zoom level
            if (Math.hypot(sp.x - state.mouse.screenX, sp.y - state.mouse.screenY) <= 20) {
              state.selectedPlotId = plot.id;
              state.dragVertex.isDragging = true;
              state.dragVertex.plotId = plot.id;
              state.dragVertex.vertexIndex = i;
              canvas.style.cursor = 'grabbing';
              updateInspector();
              render();
              return;
            }
          }
        }
      }

      if (state.tool === 'polygon' || state.tool === 'polyline') {
        const firstPt = state.activePolyline[0];
        const isClosingClick = state.activePolyline.length >= 3 && (
          (state.activeSnapPoint && state.activeSnapPoint.type === 'firstpoint') ||
          (firstPt && Math.hypot(firstPt.x - pt.x, firstPt.y - pt.y) < (22 / state.camera.zoom))
        );

        if (isClosingClick) {
          finishActivePolygon();
          return;
        }

        state.activePolyline.push(pt);
        drawHintBox.classList.remove('opacity-0');
        const count = state.activePolyline.length;
        if (count >= 3) {
          drawHintText.textContent = `পয়েন্ট ${count} যোগ হয়েছে। প্রথম পয়েন্টে ক্লিক করে দাগ বন্ধ করুন (অথবা Double Click / Enter চাপুন)`;
        } else {
          drawHintText.textContent = `পয়েন্ট ${count} যোগ হয়েছে। পরবর্তী পয়েন্টে ক্লিক করুন...`;
        }
        playCadSound('snap');
        render();
      } else if (state.tool === 'text') {
        showPromptDialog('ক্যানভাসে বিবরণ বা টেক্সট নোট লিখুন', 'যেমন: ১২ ফুট পাকা রাস্তা, সীমানা পিলার', '১২ ফুট রাস্তা', note => {
        if (note && note.trim()) {
          state.annotations.push({
            id: 'ann-' + Date.now(),
            x: pt.x,
            y: pt.y,
            text: note.trim(),
            color: '#38bdf8'
          });
          pushHistory();
          render();
        }
      });
    } else if (state.tool === 'offset') {
        applyPlotOffset(state.selectedPlotId, 15);
      } else if (state.tool === 'split') {
        state.slicePoints.push(pt);
        if (state.slicePoints.length === 2) {
          applyPlotSlice(state.slicePoints[0], state.slicePoints[1]);
        }
        render();
      } else if (state.tool === 'point') {
        const pillarId = 'p' + (state.pillars.length + 1);
        state.pillars.push({
          id: pillarId,
          x: pt.x,
          y: pt.y,
          name: 'P-' + (state.pillars.length + 1)
        });
        render();
      } else if (state.tool === 'calibrate') {
        state.calibrationPoints.push(pt);
        if (state.calibrationPoints.length === 2) {
          const p1 = state.calibrationPoints[0];
          const p2 = state.calibrationPoints[1];
          const pxDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          if (pxDist < 2) {
            state.calibrationPoints = [];
            showToast('পয়েন্ট দুটি খুব কাছাকাছি। স্পষ্ট দুটি ভিন্ন পয়েন্টে ক্লিক করুন।', 'error');
            render();
            return;
          }
          drawHintBox.classList.add('opacity-0');
          openCalibrationModal(pxDist);
        } else {
          drawHintBox.classList.remove('opacity-0');
          drawHintText.innerHTML = '<span class="text-amber-400 font-bold">[AutoCAD SCALE ধাপ ২/২]</span> জানা দূরত্বের ২য় বিন্দুতে ক্লিক করুন (রেফারেন্স মাপ নির্ধারণ করতে)';
        }
        render();
      } else if (state.tool === 'auto-number') {
        let foundPlot = false;
        for (const plot of state.plots) {
          const c = calculateCentroid(plot.vertices);
          if (isPointInPolygon(pt, plot.vertices) || Math.hypot(c.x - pt.x, c.y - pt.y) < 70 / state.camera.zoom) {
            applyAutoNumberToPlot(plot);
            foundPlot = true;
            break;
          }
        }
        if (!foundPlot) {
          const num = state.autoNumberSettings ? state.autoNumberSettings.current : (state.nextPlotNumber || 501);
          const prefix = state.autoNumberSettings ? state.autoNumberSettings.prefix : 'দাগ নং ';
          const annText = `${prefix}${toBanglaDigits(num)}`;
          state.annotations.push({
            id: 'ann-num-' + num,
            x: pt.x,
            y: pt.y,
            text: annText,
            color: '#10b981'
          });
          if (state.autoNumberSettings) {
            state.autoNumberSettings.current += state.autoNumberSettings.step;
          } else {
            state.nextPlotNumber++;
          }
          playCadSound('beep');
          showToast(`টেক্সট দাগ নম্বর যোগ করা হয়েছে: ${annText}`, 'info');
          pushHistory();
          render();
        }
      } else if (state.tool === 'merge') {
        let clickedPlot = null;
        for (const plot of state.plots) {
          const c = calculateCentroid(plot.vertices);
          if (isPointInPolygon(pt, plot.vertices) || Math.hypot(c.x - pt.x, c.y - pt.y) < 80 / state.camera.zoom) {
            clickedPlot = plot;
            break;
          }
        }
        if (clickedPlot) {
          if (!state.mergeSelectedPlots.includes(clickedPlot.id)) {
            state.mergeSelectedPlots.push(clickedPlot.id);
            playCadSound('beep');
            if (state.mergeSelectedPlots.length === 1) {
              drawHintBox.classList.remove('opacity-0');
              drawHintText.innerHTML = `<span class="text-fuchsia-400 font-bold">[প্লট মার্জ ১/২]</span> ${clickedPlot.name} নির্বাচিত। জোড়া লাগাতে ২য় সংলগ্ন দাগে ক্লিক করুন`;
              showToast(`${clickedPlot.name} নির্বাচিত! এবার ২য় সংলগ্ন দাগে ক্লিক করুন`, 'info');
              render();
            } else if (state.mergeSelectedPlots.length === 2) {
              const success = executePlotMerge(state.mergeSelectedPlots[0], state.mergeSelectedPlots[1]);
              if (success) {
                state.tool = 'select';
                updateToolUI();
              } else {
                state.mergeSelectedPlots = [state.mergeSelectedPlots[0]];
              }
              render();
            }
          } else {
            showToast('একই দাগ দুবার নির্বাচন করা যাবে না! সংলগ্ন অন্য দাগে ক্লিক করুন', 'warning');
          }
        }
      } else if (state.tool === 'line-wand') {
        detectBoundaryLineFromClick(pt.x, pt.y);
      } else if (state.tool === 'magic-wand') {
        // Photoshop-like Dag Wand: Click on an already detected dag to select it immediately,
        // or click inside an adjacent/new dag boundary to auto-recognize and select it.
        const clickCoord = { x: state.mouse.worldX, y: state.mouse.worldY };
        let foundExistingPlot = null;
        for (const plot of state.plots) {
          if (isPointInPolygon(pt, plot.vertices) || isPointInPolygon(clickCoord, plot.vertices)) {
            foundExistingPlot = plot;
            break;
          }
        }
        if (foundExistingPlot) {
          state.selectedPlotId = foundExistingPlot.id;
          playCadSound('snap');
          showToast(`🪄 ${foundExistingPlot.name} নির্বাচিত হয়েছে`, 'info');
          updateInspector();
          render();
          return;
        }
        detectPlotBoundaryFromClick(pt.x, pt.y);
      } else if (state.tool === 'select') {
        // Find clicked plot using ray-casting point-in-polygon, centroid proximity, or edge proximity
        let found = false;
        const clickPt = { x: state.mouse.worldX, y: state.mouse.worldY };

        for (const plot of state.plots) {
          if (isPointInPolygon(pt, plot.vertices) || isPointInPolygon(clickPt, plot.vertices)) {
            state.selectedPlotId = plot.id;
            found = true;
            updateInspector();
            render();
            break;
          }

          // Check centroid proximity (within 40px radius)
          const centroid = calculateCentroid(plot.vertices);
          if (Math.hypot(centroid.x - clickPt.x, centroid.y - clickPt.y) < 45 / state.camera.zoom) {
            state.selectedPlotId = plot.id;
            found = true;
            updateInspector();
            render();
            break;
          }

          // Check edge proximity (within 14px tolerance)
          for (let i = 0; i < plot.vertices.length; i++) {
            const p1 = plot.vertices[i];
            const p2 = plot.vertices[(i + 1) % plot.vertices.length];
            const dist = perpendicularDistance(clickPt, p1, p2);
            const minX = Math.min(p1.x, p2.x) - 14 / state.camera.zoom;
            const maxX = Math.max(p1.x, p2.x) + 14 / state.camera.zoom;
            const minY = Math.min(p1.y, p2.y) - 14 / state.camera.zoom;
            const maxY = Math.max(p1.y, p2.y) + 14 / state.camera.zoom;
            if (dist < 14 / state.camera.zoom && clickPt.x >= minX && clickPt.x <= maxX && clickPt.y >= minY && clickPt.y <= maxY) {
              state.selectedPlotId = plot.id;
              found = true;
              updateInspector();
              render();
              break;
            }
          }
          if (found) break;
        }
        if (!found) {
          // In select tool, clicking on empty canvas initiates smooth Pan
          state.camera.isPanning = true;
          state.camera.panStartX = state.mouse.screenX;
          state.camera.panStartY = state.mouse.screenY;
          canvas.style.cursor = 'grabbing';
          render();
        }
      }
    }
  });

  canvas.addEventListener('mouseup', () => {
    state.camera.isPanning = false;
    if (state.dragVertex && state.dragVertex.isDragging) {
      pushHistory();
      showToast('✅ পয়েন্ট ড্র্যাগ করে রিশেপ/সাইজ আপডেট সম্পন্ন হয়েছে', 'success');
    }
    state.dragVertex.isDragging = false;
    state.dragVertex.vertexIndex = -1;
    state.liveDragTooltip = null;
    state.gunia.isDragging = false;
    state.gunia.isRotating = false;
    if (state.dragMap) state.dragMap.isDragging = false;
    canvas.style.cursor = (state.tool === 'pan' || state.tool === 'map-move' || isSpacePressed) ? 'grab' : (state.hoveredVertex ? 'grab' : 'crosshair');
    render();
  });

  window.addEventListener('mouseup', () => {
    state.camera.isPanning = false;
    if (state.dragMap) state.dragMap.isDragging = false;
    if (state.dragVertex && state.dragVertex.isDragging) {
      pushHistory();
      state.dragVertex.isDragging = false;
      state.dragVertex.vertexIndex = -1;
      state.liveDragTooltip = null;
      render();
    }
    if (state.gunia) { state.gunia.isDragging = false; state.gunia.isRotating = false; }
  });

  // Right-click to finish active line/polygon immediately (AutoCAD standard)
  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    if ((state.tool === 'polygon' || state.tool === 'polyline') && state.activePolyline && state.activePolyline.length >= 2) {
      finishActivePolygon();
    }
  });

  // Finish In-Progress Polygon or Line
  function finishActivePolygon() {
    if ((state.tool === 'polygon' || state.tool === 'polyline') && state.activePolyline && state.activePolyline.length >= 2) {
      const rawArea = calculateShoelaceArea(state.activePolyline);
      const isLine = state.activePolyline.length === 2 || rawArea < 0.15;
      const newPlotNumber = state.nextPlotNumber || (101 + state.plots.length);
      state.nextPlotNumber = newPlotNumber + 1;
      const newPlotId = isLine ? ('line-' + Date.now()) : ('plot-' + newPlotNumber);
      state.plots.push({
        id: newPlotId,
        name: isLine ? 'স্কেল রেফারেন্স রেখা' : ('দাগ নং ' + toBanglaDigits(newPlotNumber)),
        layer: isLine ? 'measurements' : 'plots',
        fillColor: isLine ? 'transparent' : 'rgba(168, 85, 247, 0.18)',
        strokeColor: isLine ? '#38bdf8' : '#a855f7',
        vertices: [...state.activePolyline]
      });

      state.activePolyline = [];
      state.selectedPlotId = newPlotId;
      state.tool = 'select';
      updateToolUI();
      drawHintBox.classList.add('opacity-0');
      pushHistory();
      updateInspector();
      render();
      playCadSound('calibrate');
      showToast(isLine ? 'রেখা অঙ্কন সম্পন্ন হয়েছে' : `দাগ নং ${toBanglaDigits(newPlotNumber)} সফলভাবে তৈরি ও আবদ্ধ করা হয়েছে!`, 'success');

      if (!isLine) {
        const lastPlot = state.plots[state.plots.length - 1];
        const centroid = calculateCentroid(lastPlot.vertices);
        const sc = worldToScreen(centroid.x, centroid.y);
        showFloatingRenameBox(newPlotId, sc.x, sc.y);
      } else {
        hideFloatingRenameBox(false);
      }
    }
  }

  // Double click to finish Polygon or Line (Without popup on lines)
  canvas.addEventListener('dblclick', () => {
    if (state.tool === 'polygon' || state.tool === 'polyline') {
      finishActivePolygon();
    } else if (state.tool === 'select' && state.selectedPlotId) {
      const plot = state.plots.find(p => p.id === state.selectedPlotId);
      if (plot) {
        const rawArea = calculateShoelaceArea(plot.vertices);
        const isLine = plot.vertices.length <= 2 || rawArea < 0.15;
        if (!isLine) {
          const centroid = calculateCentroid(plot.vertices);
          const sc = worldToScreen(centroid.x, centroid.y);
          showFloatingRenameBox(plot.id, sc.x, sc.y);
        } else {
          hideFloatingRenameBox(false);
        }
      }
    }
  });

  // Mouse Wheel Zoom (Anchor-Accurate AutoCAD Style with Smooth 5000% Depth down to 0.5%)
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    state.mouse.screenX = sx;
    state.mouse.screenY = sy;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.min(Math.max(state.camera.zoom * zoomFactor, 0.005), 50.0);

    const mouseWorldBefore = screenToWorld(sx, sy);
    state.camera.zoom = newZoom;
    const mouseWorldAfter = screenToWorld(sx, sy);

    state.camera.x += (mouseWorldBefore.x - mouseWorldAfter.x);
    state.camera.y += (mouseWorldBefore.y - mouseWorldAfter.y);

    zoomLabelEl.textContent = (state.camera.zoom * 100).toFixed(0) + '%';
    render();
  }, { passive: false });

  // Toolbar Click Handlers (Supports Polyline State Persistence & Resume)
  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prevTool = state.tool;
      const newTool = btn.getAttribute('data-tool');
      state.tool = newTool;
      updateToolUI();

      const isPrevPoly = (prevTool === 'polygon' || prevTool === 'polyline');
      const isNewPoly = (newTool === 'polygon' || newTool === 'polyline');

      if (isNewPoly && state.activePolyline && state.activePolyline.length > 0) {
        drawHintBox.classList.remove('opacity-0');
        drawHintText.textContent = `🔄 অসমাপ্ত পলিলাইন সক্রিয় আছে (${state.activePolyline.length}টি পয়েন্ট)! পরবর্তী পয়েন্ট যোগ করুন অথবা ১ম পয়েন্টে ক্লিক করে দাগ বন্ধ করুন।`;
        showToast(`পলিলাইন পুনঃসক্রিয় হয়েছে (${state.activePolyline.length}টি পয়েন্ট সংরক্ষিত)`, 'success');
        render();
        return;
      }

      if (isPrevPoly && !isNewPoly && state.activePolyline && state.activePolyline.length > 0) {
        showToast('পলিলাইন অঙ্কন সাময়িক পজ (Paused) আছে। পলিলাইন টুলে ফিরলে আগের পয়েন্ট থেকেই মেলানো যাবে।', 'info');
        render();
      }

      if (state.tool === 'pan') {
        drawHintBox.classList.remove('opacity-0');
        drawHintText.textContent = '✋ ক্যানভাসে যেকোনো স্থানে ক্লিক করে টেনে উপরে/নিচে/বামে/ডানে সরান (Pan)';
        canvas.style.cursor = 'grab';
      } else if (state.tool === 'map-move') {
        drawHintBox.classList.remove('opacity-0');
        drawHintText.textContent = '✋ ক্যানভাসে যেকোনো নকশায় ক্লিক করে ডানে/বামে/উপরে/নিচে টেনে পাশাপাশি সাজান (AutoCAD Sheet Placement)';
        canvas.style.cursor = 'grab';
      } else if (state.tool === 'auto-number') {
        drawHintBox.classList.remove('opacity-0');
        const currNum = state.autoNumberSettings ? state.autoNumberSettings.current : (state.nextPlotNumber || 501);
        const prefix = state.autoNumberSettings ? state.autoNumberSettings.prefix : 'দাগ নং ';
        drawHintText.textContent = `🔢 দাগে ক্লিক করে স্বয়ংক্রিয়ভাবে ${prefix}${toBanglaDigits(currNum)} বসান (প্রতি ক্লিকে ক্রমানুসারে নম্বর বাড়বে)`;
      } else if (state.tool === 'merge') {
        state.mergeSelectedPlots = [];
        drawHintBox.classList.remove('opacity-0');
        drawHintText.textContent = '🔗 পাশাপাশি ২টি সংলগ্ন দাগে পরপর ক্লিক করে একটি বড় দাগে রূপান্তর (Merge) করুন (১ম দাগে ক্লিক করুন)';
        render();
      } else if (state.tool === 'line-wand') {
        drawHintBox.classList.remove('opacity-0');
        drawHintText.textContent = '⚡ মৌজা নকশার যেকোনো সীমানা রেখা বা আইলে (Boundary Line) ক্লিক করুন — নিখুঁত রেখা ও দৈর্ঘ্য ডিটেক্ট হবে';
      } else if (state.tool === 'magic-wand') {
        drawHintBox.classList.remove('opacity-0');
        drawHintText.textContent = '🪄 মৌজা নকশার যেকোনো দাগের মাঝখানে ক্লিক করুন (অটো দাগ বাউন্ডারি ডিটেক্ট)';
      } else if (state.tool === 'polygon') {
        drawHintBox.classList.remove('opacity-0');
        drawHintText.textContent = 'পয়েন্ট ক্লিক করুন বাউন্ডারি আঁকার জন্য (Double click / Enter to complete)';
      } else if (state.tool === 'split') {
        state.slicePoints = [];
        drawHintBox.classList.remove('opacity-0');
        drawHintText.textContent = 'দাগের ভেতর ২ প্রান্তে ক্লিক করে কর্তন লাইন (Cut Line) টানুন';
      } else if (state.tool === 'text') {
        drawHintBox.classList.remove('opacity-0');
        drawHintText.textContent = 'ক্যানভাসে যেখানে টেক্সট বা বিবরণ লিখতে চান ক্লিক করুন';
      } else if (state.tool === 'offset') {
        drawHintBox.classList.remove('opacity-0');
        drawHintText.textContent = 'নির্বাচিত দাগের ওপর ক্লিক করে ১০ লিংক বাউন্ডারি অফসেট করুন';
      } else if (state.tool === 'gps-pin') {
        drawHintBox.classList.remove('opacity-0');
        drawHintText.innerHTML = '<span class="text-emerald-400 font-bold">[AutoCAD GPS পিন]</span> ক্যানভাসে নকশার যেকোনো পরিচিত স্থানে ক্লিক করে জিপিএস পিন বসান';
      } else if (state.tool === 'calibrate') {
        state.calibrationPoints = [];
        drawHintBox.classList.remove('opacity-0');
        drawHintText.innerHTML = '<span class="text-cyan-400 font-bold">[AutoCAD SCALE (রেফারেন্স স্কেল)]</span> যেকোনো জানা আইল, রাস্তা বা স্কেল বারের ১ম বিন্দুতে ক্লিক করুন (Base Point)';
      } else {
        drawHintBox.classList.add('opacity-0');
      }
    });
  });

  function updateToolUI() {
    document.querySelectorAll('.tool-btn[data-tool]').forEach(b => {
      if (b.getAttribute('data-tool') === state.tool) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    const quickGpsPinBtn = document.getElementById('btnQuickDropGpsPin');
    if (quickGpsPinBtn) {
      if (state.tool === 'gps-pin') {
        quickGpsPinBtn.className = 'px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-extrabold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/30 ring-2 ring-white shrink-0 animate-pulse';
      } else {
        quickGpsPinBtn.className = 'px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0';
      }
    }

    const quickMoveBtn = document.getElementById('btnQuickMoveMap');
    if (quickMoveBtn) {
      if (state.tool === 'map-move') {
        quickMoveBtn.className = 'px-2.5 py-1 rounded-xl bg-cyan-700 text-white font-bold text-[11px] border border-cyan-400 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ring-2 ring-cyan-300 shadow-lg shadow-cyan-500/30';
      } else {
        quickMoveBtn.className = 'px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-[11px] border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shrink-0';
      }
    }
  }

  // Zoom Controls
  document.getElementById('btnZoomIn').addEventListener('click', () => {
    state.camera.zoom = Math.min(state.camera.zoom * 1.25, 50.0);
    zoomLabelEl.textContent = (state.camera.zoom * 100).toFixed(0) + '%';
    render();
  });

  document.getElementById('btnZoomOut').addEventListener('click', () => {
    state.camera.zoom = Math.max(state.camera.zoom * 0.8, 0.005);
    zoomLabelEl.textContent = (state.camera.zoom * 100).toFixed(0) + '%';
    render();
  });

  function resetFitView() {
    const parent = canvas.parentElement;
    const w = logicalW || (parent ? parent.clientWidth : window.innerWidth - 384);
    const h = logicalH || (parent ? parent.clientHeight : window.innerHeight - 96);

    const loadedMaps = (state.mouzaMaps || []).filter(m => m.loaded && m.visible !== false);
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    if (loadedMaps.length > 0) {
      loadedMaps.forEach(m => {
        minX = Math.min(minX, m.x);
        minY = Math.min(minY, m.y);
        maxX = Math.max(maxX, m.x + m.width);
        maxY = Math.max(maxY, m.y + m.height);
      });
    } else if (state.mouzaMap && state.mouzaMap.loaded) {
      minX = state.mouzaMap.x;
      minY = state.mouzaMap.y;
      maxX = state.mouzaMap.x + state.mouzaMap.width;
      maxY = state.mouzaMap.y + state.mouzaMap.height;
    } else {
      minX = 0;
      minY = 0;
      maxX = 900;
      maxY = 650;
    }

    if (state.plots && state.plots.length > 0) {
      state.plots.forEach(p => {
        if (p.vertices) {
          p.vertices.forEach(v => {
            minX = Math.min(minX, v.x);
            minY = Math.min(minY, v.y);
            maxX = Math.max(maxX, v.x);
            maxY = Math.max(maxY, v.y);
          });
        }
      });
    }

    const bboxW = Math.max(maxX - minX, 100);
    const bboxH = Math.max(maxY - minY, 100);
    const padding = 40;

    const zoomX = (w - padding * 2) / bboxW;
    const zoomY = (h - padding * 2) / bboxH;
    const optimalZoom = Math.min(zoomX, zoomY);

    state.camera.x = minX + bboxW / 2;
    state.camera.y = minY + bboxH / 2;
    // Comfortable fit: never allow the view to collapse into an unreadable 14% dot
    // Ensures clean, crisp view of the Mouza sheet and survey plots (clamped between 50% and 250%)
    state.camera.zoom = Math.max(0.50, Math.min(optimalZoom, 2.50));

    if (zoomLabelEl) {
      zoomLabelEl.textContent = (state.camera.zoom * 100).toFixed(0) + '%';
    }
    render();
  }

  document.getElementById('btnResetView')?.addEventListener('click', resetFitView);
  document.getElementById('btnZoomExtents')?.addEventListener('click', resetFitView);

  // Photoshop-style 2-Column / 1-Column Toolbar Toggle
  const btnToggleToolbarCols = document.getElementById('btnToggleToolbarCols');
  const leftToolbar = document.getElementById('leftToolbar');
  const toolsGrid = document.getElementById('toolsGrid');
  const toolbarToggleIcon = document.getElementById('toolbarToggleIcon');

  if (btnToggleToolbarCols && leftToolbar && toolsGrid) {
    btnToggleToolbarCols.addEventListener('click', () => {
      const is2Col = toolsGrid.classList.contains('grid-cols-2');
      if (is2Col) {
        // Collapse to 1 Column
        toolsGrid.classList.remove('grid-cols-2');
        toolsGrid.classList.add('grid-cols-1');
        leftToolbar.classList.remove('w-[92px]');
        leftToolbar.classList.add('w-[52px]');
        leftToolbar.querySelector('.toolbar-title')?.classList.add('hidden');
        if (toolbarToggleIcon) toolbarToggleIcon.setAttribute('data-lucide', 'chevrons-right');
        showToast('টুলবার: ১ কলাম সক্রিয়', 'info');
      } else {
        // Expand to 2 Columns (Photoshop style)
        toolsGrid.classList.remove('grid-cols-1');
        toolsGrid.classList.add('grid-cols-2');
        leftToolbar.classList.remove('w-[52px]');
        leftToolbar.classList.add('w-[92px]');
        leftToolbar.querySelector('.toolbar-title')?.classList.remove('hidden');
        if (toolbarToggleIcon) toolbarToggleIcon.setAttribute('data-lucide', 'chevrons-left');
        showToast('টুলবার: ২ কলাম সক্রিয় (Photoshop স্টাইল)', 'info');
      }
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Scale and Unit Dropdown Handlers
  document.getElementById('scaleSelect')?.addEventListener('change', e => {
    const newPreset = e.target.value;
    const oldPreset = state.scalePreset || '16_inch';
    state.scalePreset = newPreset;

    const presetNames = {
      '16_inch': '১৬" = ১ মাইল (১" = ৫০০ লিংক / ৩৩০ ফুট)',
      '32_inch': '৩২" = ১ মাইল (১" = ২৫০ লিংক / ১৬৫ ফুট)',
      '64_inch': '৬৪" = ১ মাইল (১" = ১২৫ লিংক / ৮২.৫ ফুট)',
      '80_inch': '৮০" = ১ মাইল (১" = ১০০ লিংক / ৬৬ ফুট)',
      '4_inch':  '৪" = ১ মাইল (১" = ২০০০ লিংক / ১৩২০ ফুট)'
    };

    if (state.mouzaMap.loaded && state.mouzaMap.width) {
      const presetRatios = {
        '16_inch': 1.0,
        '32_inch': 0.5,
        '64_inch': 0.25,
        '80_inch': 0.20,
        '4_inch':  4.0
      };
      const oldRatio = presetRatios[oldPreset] || 1.0;
      const newRatio = presetRatios[newPreset] || 1.0;
      const factor = newRatio / oldRatio;

      if (factor !== 1.0 && Math.abs(factor - 1.0) > 0.001) {
        const cx = state.mouzaMap.x + state.mouzaMap.width / 2;
        const cy = state.mouzaMap.y + state.mouzaMap.height / 2;
        state.mouzaMap.width *= factor;
        state.mouzaMap.height *= factor;
        state.mouzaMap.x = cx - state.mouzaMap.width / 2;
        state.mouzaMap.y = cy - state.mouzaMap.height / 2;
      }
    }

    updateScaleStatusBadge();
    updateInspector();
    render();
    showToast(`স্কেল প্রিসেট সক্রিয়: ${presetNames[newPreset] || newPreset}`, 'info');
  });

  document.getElementById('unitSelect')?.addEventListener('change', e => {
    state.unit = e.target.value;
    const unitUnitEl = document.getElementById('coordXUnit');
    const unitUnitYEl = document.getElementById('coordYUnit');
    if (unitUnitEl) unitUnitEl.textContent = state.unit;
    if (unitUnitYEl) unitUnitYEl.textContent = state.unit;
    updateInspector();
    render();
  });

  // Clear Canvas Button
  document.getElementById('btnClearCanvas')?.addEventListener('click', () => {
    showConfirmDialog('ক্যানভাস ক্লিয়ার নিশ্চিতকরণ', 'আপনি কি নিশ্চিত যে সমস্ত দাগ ও নকশা মুছে ক্যানভাস ফ্রেশ করতে চান?', () => {
      state.plots = [];
      state.pillars = [];
      state.annotations = [];
      state.activePolyline = [];
      state.selectedPlotId = null;
      state.mouzaMap.loaded = false;
      state.mouzaMap.imageObj = null;
      state.mouzaMap.filteredCanvas = null;
      state.mouzaMap.isCalibrated = false;
      const emptyState = document.getElementById('canvasEmptyState');
      if (emptyState) emptyState.classList.remove('hidden');
      updateScaleStatusBadge();
      updateInspector();
      pushHistory();
      render();
      showToast('ক্যানভাস সম্পূর্ণ পরিষ্কার করা হয়েছে', 'info');
    });
  });

  // Toggle Snap & Grid
  const btnToggleSnap = document.getElementById('btnToggleSnap');
  btnToggleSnap.addEventListener('click', () => {
    state.snapEnabled = !state.snapEnabled;
    btnToggleSnap.classList.toggle('active', state.snapEnabled);
    render();
  });

  const btnToggleGrid = document.getElementById('btnToggleGrid');
  btnToggleGrid.addEventListener('click', () => {
    state.gridEnabled = !state.gridEnabled;
    btnToggleGrid.classList.toggle('active', state.gridEnabled);
    render();
  });

  // Split Slider & Apply Split Button
  splitSlider.addEventListener('input', e => {
    state.splitRatio = Number(e.target.value) / 100;
    updateInspector();
  });

  document.getElementById('btnApplySplit').addEventListener('click', () => {
    applyPlotSlice({ x: 0, y: 0 }, { x: 100, y: 100 });
  });

  // Export DXF & Save Project
  document.getElementById('btnExportDXF').addEventListener('click', () => {
    downloadDXF();
  });

  document.getElementById('btnSaveProject').addEventListener('click', () => {
    saveLscadProject();
  });

  // Layer Manager Modal Handlers
  const layerModal = document.getElementById('layerModal');
  const btnLayerManager = document.getElementById('btnLayerManager');
  if (btnLayerManager) {
    btnLayerManager.addEventListener('click', () => {
      layerModal.classList.remove('hidden');
    });
  }
  const btnCloseLayerModal = document.getElementById('btnCloseLayerModal');
  if (btnCloseLayerModal) {
    btnCloseLayerModal.addEventListener('click', () => {
      layerModal.classList.add('hidden');
    });
  }

  document.getElementById('btnNewLayer')?.addEventListener('click', () => {
    showPromptDialog('নতুন লেয়ার যুক্ত করুন', 'যেমন: ড্রেনেজ / প্রস্তাবিত সীমানা', 'প্রস্তাবিত সীমানা', layerName => {
      if (!layerName || !layerName.trim()) return;
      layerName = layerName.trim();
      const layerKey = layerName.toLowerCase().replace(/\s+/g, '_');
      state.layers[layerKey] = true;
      renderLayerList();
      render();
      showToast(`নতুন লেয়ার "${layerName}" যুক্ত হয়েছে`, 'success');
    });
  });

  document.getElementById('togglePlotsVisibility')?.addEventListener('click', function() {
    state.layers.plots = !state.layers.plots;
    this.classList.toggle('text-slate-500', !state.layers.plots);
    this.classList.toggle('text-emerald-400', state.layers.plots);
    render();
  });

  document.getElementById('togglePillarsVisibility')?.addEventListener('click', function() {
    state.layers.pillars = !state.layers.pillars;
    this.classList.toggle('text-slate-500', !state.layers.pillars);
    this.classList.toggle('text-emerald-400', state.layers.pillars);
    render();
  });

  document.getElementById('toggleDimensionsVisibility')?.addEventListener('click', function() {
    state.layers.dimensions = !state.layers.dimensions;
    this.classList.toggle('text-slate-500', !state.layers.dimensions);
    this.classList.toggle('text-emerald-400', state.layers.dimensions);
    render();
  });

  document.getElementById('toggleTextsVisibility')?.addEventListener('click', function() {
    state.layers.annotations = !state.layers.annotations;
    this.classList.toggle('text-slate-500', !state.layers.annotations);
    this.classList.toggle('text-emerald-400', state.layers.annotations);
    render();
  });

  // Universal Mouza Map Image Loader (Any image: JPG, PNG, PDF, TIFF) - Multi-Sheet AutoCAD Engine
  let pendingImportImg = null;

  function loadMouzaImageObject(img, silent = false, isNewSheet = false) {
    if (!img) return;

    // Standard initial scale: 16" = 1 mile at 300 DPI (1 px = 1.6667 links)
    const initialLinksPerPx = 8000 / (16 * 300);
    const nw = img.naturalWidth || img.width || 1200;
    const nh = img.naturalHeight || img.height || 900;
    const sheetW = nw * initialLinksPerPx;
    const sheetH = nh * initialLinksPerPx;

    const existingLoaded = (state.mouzaMaps || []).filter(m => m.loaded);

    if (isNewSheet && existingLoaded.length > 0) {
      // Find rightmost edge of all loaded sheets
      let maxX = -Infinity;
      let refY = 0;
      existingLoaded.forEach(m => {
        maxX = Math.max(maxX, m.x + m.width);
        refY = m.y;
      });
      if (maxX === -Infinity) maxX = 0;

      const newId = 'map_' + Date.now();
      const newSheetIndex = (state.mouzaMaps || []).length + 1;
      const newSheet = {
        id: newId,
        name: `নকশা শিট ${toBanglaDigits(newSheetIndex)}`,
        loaded: true,
        isVector: false,
        imageObj: img,
        filteredCanvas: img,
        x: maxX + 100, // Placed side-by-side to the right (AutoCAD style!)
        y: refY,
        width: sheetW,
        height: sheetH,
        opacity: 0.95,
        rotation: 0,
        scaleFactor: 1.0,
        isCalibrated: false,
        visible: true,
        locked: false,
        filters: { threshold: 0, brightness: 0, contrast: 0 }
      };

      if (!state.mouzaMaps) state.mouzaMaps = [];
      state.mouzaMaps.push(newSheet);
      state.activeMapId = newId;

      updateMapSheetsUI();
      updateScaleStatusBadge();
      updateInspector();
      render();

      if (!silent) {
        showToast(`✓ নতুন নকশা শিট (${newSheet.name}) পাশে যুক্ত হয়েছে! নকশা স্থানান্তর (M) টুল দিয়ে যেকোনো স্থানে সরাতে পারেন।`, 'success');
      }
      return;
    }

    // Default or Replace mode:
    const activeMap = (state.mouzaMaps && state.mouzaMaps.length > 0)
      ? (state.mouzaMaps.find(m => m.id === state.activeMapId) || state.mouzaMaps[0])
      : null;

    let currentSheet = activeMap;
    if (activeMap) {
      activeMap.loaded = true;
      activeMap.isVector = false;
      activeMap.imageObj = img;
      activeMap.filteredCanvas = img;
      activeMap.width = sheetW;
      activeMap.height = sheetH;
      activeMap.isCalibrated = false;
      activeMap.scaleFactor = 1.0;
      activeMap.rotation = 0;
      activeMap.visible = true;
      activeMap.locked = false;
      state.activeMapId = activeMap.id;
    } else {
      currentSheet = {
        id: 'map_1',
        name: 'নকশা শিট ১ (প্রধান)',
        loaded: true,
        isVector: false,
        imageObj: img,
        filteredCanvas: img,
        x: 0,
        y: 0,
        width: sheetW,
        height: sheetH,
        opacity: 0.95,
        rotation: 0,
        scaleFactor: 1.0,
        isCalibrated: false,
        visible: true,
        locked: false,
        blendMode: 'normal',
        filters: { threshold: 0, brightness: 0, contrast: 0 }
      };
      state.mouzaMaps = [currentSheet];
      state.activeMapId = 'map_1';
    }
    state.mouzaMap.loaded = true;
    state.mouzaMap.image = img;

    // Auto-center Satellite Anchor to the center of the Mouza Sheet
    if (!state.satellite.pinPlaced || !state.satellite.anchorWorld) {
      state.satellite.anchorWorld = {
        x: currentSheet.x + currentSheet.width / 2,
        y: currentSheet.y + currentSheet.height / 2
      };
    }

    // Fit camera to the newly loaded map
    resetFitView();

    // Hide empty state if shown
    const emptyState = document.getElementById('canvasEmptyState');
    if (emptyState) emptyState.classList.add('hidden');

    updateMapSheetsUI();
    updateScaleStatusBadge();
    updateInspector();
    detectMouzaAndLocationFromMap(currentSheet, false);
    render();

    if (!silent) {
      showToast('✓ মৌজা নকশা সফলভাবে লোড হয়েছে (স্কেল: ১৬" = ১ মাইল)। যেকোনো দাগে ক্লিক করে কাজ শুরু করুন।', 'success');
    }
  }

  function handleLoadedImagePrompt(img) {
    if (!img) return;
    const existingLoaded = (state.mouzaMaps || []).filter(m => m.loaded);
    if (existingLoaded.length > 0) {
      pendingImportImg = img;
      const modal = document.getElementById('mouzaImportChoiceModal');
      if (modal) {
        modal.classList.remove('hidden');
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
      } else {
        loadMouzaImageObject(img, false, false);
      }
    } else {
      loadMouzaImageObject(img, false, false);
    }
  }

  // AutoCAD-Style Side-by-Side Arranger
  function tileMapSheetsSideBySide() {
    if (!state.mouzaMaps || state.mouzaMaps.length === 0) {
      showToast('কোনো নকশা লোড করা নেই', 'warning');
      return;
    }
    const loadedMaps = state.mouzaMaps.filter(m => m.loaded && m.visible !== false);
    if (loadedMaps.length === 0) {
      showToast('কোনো সক্রিয় নকশা নেই', 'warning');
      return;
    }

    let currentX = 0;
    const gap = 80; // 80 links gap between sheets
    loadedMaps.forEach((sheet, idx) => {
      sheet.x = currentX;
      sheet.y = 0;
      currentX += sheet.width + gap;
    });

    updateMapSheetsUI();
    resetFitView();
    render();
    pushHistory();
    showToast(`✓ ${toBanglaDigits(loadedMaps.length)} টি নকশা পাশাপাশি সাজানো হয়েছে (AutoCAD Tiling)`, 'success');
  }

  function updateMapSheetsUI() {
    const badge = document.getElementById('mapSheetCountBadge');
    const container = document.getElementById('mapSheetsListContainer');
    const loadedCount = (state.mouzaMaps || []).filter(m => m.loaded).length;

    if (badge) {
      badge.textContent = toBanglaDigits(loadedCount || 1);
    }

    if (!container) return;

    if (!state.mouzaMaps || state.mouzaMaps.length === 0 || loadedCount === 0) {
      container.innerHTML = `
        <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
          কোনো নকশা শিট লোড করা নেই। "আরেকটি নকশা যোগ করুন" বাটনে ক্লিক করে নকশা আনুন।
        </div>
      `;
      return;
    }

    let html = '';
    state.mouzaMaps.forEach((sheet, idx) => {
      if (!sheet.loaded) return;
      const isActive = sheet.id === state.activeMapId;
      const isLocked = sheet.locked === true;
      const isVisible = sheet.visible !== false;

      html += `
        <div class="p-3 rounded-2xl border transition-all ${isActive ? 'bg-sky-950/40 border-sky-500/60 shadow-lg shadow-sky-950/30' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'}" data-sheet-id="${sheet.id}">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 flex-1 cursor-pointer select-sheet-btn">
              <span class="w-2.5 h-2.5 rounded-full ${isActive ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'}"></span>
              <div>
                <span class="text-xs font-bold text-white block">${sheet.name || `নকশা ${toBanglaDigits(idx + 1)}`}</span>
                <span class="text-[10px] text-slate-400 font-mono">X: ${toBanglaDigits(Math.round(sheet.x))} lk, Y: ${toBanglaDigits(Math.round(sheet.y))} lk | ${toBanglaDigits(Math.round(sheet.width))}x${toBanglaDigits(Math.round(sheet.height))} lk</span>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <!-- Shift Left 50 lk -->
              <button type="button" class="btn-shift-sheet px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-bold cursor-pointer transition-colors" data-sheet-id="${sheet.id}" data-dx="-50" title="বামে ৫০ লিংক সরান">
                ◀ ৫০ lk
              </button>
              <!-- Shift Right 50 lk -->
              <button type="button" class="btn-shift-sheet px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-bold cursor-pointer transition-colors" data-sheet-id="${sheet.id}" data-dx="50" title="ডানে ৫০ লিংক সরান">
                ৫০ lk ▶
              </button>
              <!-- Lock / Unlock Toggle -->
              <button type="button" class="btn-toggle-lock p-1.5 rounded-lg ${isLocked ? 'bg-rose-900/60 text-rose-300 border border-rose-700/60' : 'bg-slate-800 text-slate-400 hover:text-white'} text-xs cursor-pointer transition-colors" data-sheet-id="${sheet.id}" title="${isLocked ? 'আনলক করুন' : 'লক করুন'}">
                <i data-lucide="${isLocked ? 'lock' : 'unlock'}" class="w-3.5 h-3.5"></i>
              </button>
              <!-- Eye Toggle -->
              <button type="button" class="btn-toggle-vis p-1.5 rounded-lg ${isVisible ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/50' : 'bg-slate-800 text-slate-500'} text-xs cursor-pointer transition-colors" data-sheet-id="${sheet.id}" title="${isVisible ? 'হাইড করুন' : 'শো করুন'}">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              </button>
              ${state.mouzaMaps.length > 1 ? `
                <!-- Delete Sheet -->
                <button type="button" class="btn-delete-sheet p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/70 text-slate-400 hover:text-rose-200 text-xs cursor-pointer transition-colors" data-sheet-id="${sheet.id}" title="শিট মুছুন">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();

    // Wire sheet selection
    container.querySelectorAll('.select-sheet-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const row = e.target.closest('[data-sheet-id]');
        if (row) {
          state.activeMapId = row.getAttribute('data-sheet-id');
          updateMapSheetsUI();
          render();
        }
      });
    });

    // Wire shift left/right
    container.querySelectorAll('.btn-shift-sheet').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = btn.getAttribute('data-sheet-id');
        const dx = parseFloat(btn.getAttribute('data-dx')) || 0;
        const sheet = (state.mouzaMaps || []).find(m => m.id === id);
        if (sheet && !sheet.locked) {
          sheet.x += dx;
          updateMapSheetsUI();
          render();
        } else if (sheet && sheet.locked) {
          showToast('এই নকশা শিটটি লক করা আছে! সরানোর পূর্বে আনলক করুন।', 'warning');
        }
      });
    });

    // Wire lock toggle
    container.querySelectorAll('.btn-toggle-lock').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-sheet-id');
        const sheet = (state.mouzaMaps || []).find(m => m.id === id);
        if (sheet) {
          sheet.locked = !sheet.locked;
          updateMapSheetsUI();
          render();
          showToast(sheet.locked ? `🔒 ${sheet.name} লক করা হয়েছে` : `🔓 ${sheet.name} আনলক করা হয়েছে`, 'info');
        }
      });
    });

    // Wire visibility toggle
    container.querySelectorAll('.btn-toggle-vis').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-sheet-id');
        const sheet = (state.mouzaMaps || []).find(m => m.id === id);
        if (sheet) {
          sheet.visible = sheet.visible === false ? true : false;
          updateMapSheetsUI();
          render();
        }
      });
    });

    // Wire delete sheet
    container.querySelectorAll('.btn-delete-sheet').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-sheet-id');
        showConfirmDialog('নকশা শিট মুছে ফেলুন', 'আপনি কি নিশ্চিত যে এই নকশা শিটটি ডিলিট করতে চান?', () => {
          state.mouzaMaps = state.mouzaMaps.filter(m => m.id !== id);
          if (state.activeMapId === id) {
            state.activeMapId = state.mouzaMaps[0]?.id || null;
          }
          updateMapSheetsUI();
          render();
          showToast('নকশা শিট মুছে ফেলা হয়েছে', 'info');
        });
      });
    });
  }

  function loadDefaultScannedMouzaMap(silent = true) {
    const img = new Image();
    img.onload = () => {
      loadMouzaImageObject(img, silent, false);
    };
    img.onerror = () => {
      console.warn('default_mouza_map.jpg not loaded');
    };
    img.src = 'default_mouza_map.jpg';
  }

  // Native Electron & Web Mouza Image Loader
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,.pdf';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  function loadFileAsMouza(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        handleLoadedImagePrompt(img);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      loadFileAsMouza(e.target.files[0]);
      e.target.value = '';
    }
  });

  async function openMouzaFileDialog() {
    if (window.electronAPI && window.electronAPI.openMouzaMap) {
      const res = await window.electronAPI.openMouzaMap();
      if (res && res.base64) {
        const img = new Image();
        img.onload = () => {
          handleLoadedImagePrompt(img);
        };
        img.src = res.base64;
      }
    } else {
      fileInput.click();
    }
  }

  document.getElementById('btnLoadMouza')?.addEventListener('click', openMouzaFileDialog);
  document.getElementById('btnEmptyUpload')?.addEventListener('click', openMouzaFileDialog);
  document.getElementById('btnEmptyStartDemo')?.addEventListener('click', () => {
    state.plots = [
      {
        id: 'plot_501',
        name: 'দাগ নং ৫০১',
        layer: 'plots',
        fillColor: 'rgba(56, 189, 248, 0.25)',
        strokeColor: '#38bdf8',
        strokeWidth: 2,
        vertices: [
          { x: 260, y: 170 },
          { x: 520, y: 170 },
          { x: 535, y: 380 },
          { x: 275, y: 365 }
        ]
      },
      {
        id: 'plot_502',
        name: 'দাগ নং ৫০২',
        layer: 'plots',
        fillColor: 'rgba(16, 185, 129, 0.25)',
        strokeColor: '#10b981',
        strokeWidth: 2,
        vertices: [
          { x: 520, y: 170 },
          { x: 760, y: 170 },
          { x: 775, y: 380 },
          { x: 535, y: 380 }
        ]
      }
    ];
    state.selectedPlotId = 'plot_501';
    document.getElementById('canvasEmptyState')?.classList.add('hidden');
    pushHistory();
    updateInspector();
    render();
    resetFitView();
    showToast('ডেমো জরিপ দাগ (৫০১ ও ৫০২) সফলভাবে লোড হয়েছে!', 'success');
  });

  document.getElementById('btnLoadSampleMouza')?.addEventListener('click', () => {
    loadDefaultScannedMouzaMap(false);
  });
  document.getElementById('btnEmptyLoadSampleMouza')?.addEventListener('click', () => {
    loadDefaultScannedMouzaMap(false);
  });
  window.loadDefaultScannedMouzaMap = loadDefaultScannedMouzaMap;

  // Modal Handlers for Map Sheets Manager and Choice Dialog
  const mapSheetsModal = document.getElementById('mapSheetsModal');
  const mouzaImportChoiceModal = document.getElementById('mouzaImportChoiceModal');

  document.getElementById('btnMapSheetsManager')?.addEventListener('click', () => {
    if (mapSheetsModal) {
      mapSheetsModal.classList.remove('hidden');
      updateMapSheetsUI();
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    }
  });

  document.getElementById('btnCloseMapSheetsModal')?.addEventListener('click', () => {
    if (mapSheetsModal) mapSheetsModal.classList.add('hidden');
  });

  document.getElementById('btnTileMaps')?.addEventListener('click', tileMapSheetsSideBySide);
  document.getElementById('btnModalTileSideBySide')?.addEventListener('click', tileMapSheetsSideBySide);

  document.getElementById('btnModalAddSheet')?.addEventListener('click', () => {
    if (mapSheetsModal) mapSheetsModal.classList.add('hidden');
    openMouzaFileDialog();
  });

  // Choice Dialog Buttons
  document.getElementById('btnImportAsNewSheet')?.addEventListener('click', () => {
    if (mouzaImportChoiceModal) mouzaImportChoiceModal.classList.add('hidden');
    if (pendingImportImg) {
      loadMouzaImageObject(pendingImportImg, false, true);
      pendingImportImg = null;
    }
  });

  document.getElementById('btnImportReplace')?.addEventListener('click', () => {
    if (mouzaImportChoiceModal) mouzaImportChoiceModal.classList.add('hidden');
    if (pendingImportImg) {
      loadMouzaImageObject(pendingImportImg, false, false);
      pendingImportImg = null;
    }
  });

  document.getElementById('btnImportCancel')?.addEventListener('click', () => {
    if (mouzaImportChoiceModal) mouzaImportChoiceModal.classList.add('hidden');
    pendingImportImg = null;
  });

  // Drag and Drop support on Canvas & Empty Dropzone Box
  const dropTargets = [canvas, document.getElementById('canvasEmptyState')].filter(Boolean);
  dropTargets.forEach(target => {
    target.addEventListener('dragover', e => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    });
    target.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp|bmp|tif|tiff|pdf)$/i)) {
          loadFileAsMouza(file);
        } else {
          showToast('অনুগ্রহ করে সঠিক ইমেজ ফাইল ড্রপ করুন (JPG, PNG, TIFF)', 'warning');
        }
      }
    });
  });

  // Image Filter Modal Handlers
  const imageFilterModal = document.getElementById('imageFilterModal');
  document.getElementById('btnImageFilter').addEventListener('click', () => {
    imageFilterModal.classList.remove('hidden');
  });
  document.getElementById('btnCloseFilterModal').addEventListener('click', () => {
    imageFilterModal.classList.add('hidden');
  });

  const sliderThreshold = document.getElementById('sliderThreshold');
  const sliderBrightness = document.getElementById('sliderBrightness');
  const sliderContrast = document.getElementById('sliderContrast');
  const sliderOpacity = document.getElementById('sliderOpacity');

  sliderThreshold.addEventListener('input', e => {
    state.mouzaMap.filters.threshold = Number(e.target.value);
    document.getElementById('valThreshold').textContent = e.target.value;
    updateFilteredMouzaCanvas();
  });

  sliderBrightness.addEventListener('input', e => {
    state.mouzaMap.filters.brightness = Number(e.target.value);
    document.getElementById('valBrightness').textContent = e.target.value;
    updateFilteredMouzaCanvas();
  });

  sliderContrast.addEventListener('input', e => {
    state.mouzaMap.filters.contrast = Number(e.target.value);
    document.getElementById('valContrast').textContent = e.target.value;
    updateFilteredMouzaCanvas();
  });

  sliderOpacity.addEventListener('input', e => {
    state.mouzaMap.opacity = Number(e.target.value) / 100;
    document.getElementById('valOpacity').textContent = e.target.value + '%';
    render();
  });

  document.getElementById('btnRotate90').addEventListener('click', () => {
    state.mouzaMap.rotation = (state.mouzaMap.rotation + 90) % 360;
    render();
  });

  document.getElementById('btnResetFilters').addEventListener('click', () => {
    sliderThreshold.value = 0;
    sliderBrightness.value = 0;
    sliderContrast.value = 0;
    sliderOpacity.value = 95;
    state.mouzaMap.filters = { threshold: 0, brightness: 0, contrast: 0 };
    state.mouzaMap.opacity = 0.95;
    state.mouzaMap.rotation = 0;
    document.getElementById('valThreshold').textContent = '0';
    document.getElementById('valBrightness').textContent = '0';
    document.getElementById('valContrast').textContent = '0';
    document.getElementById('valOpacity').textContent = '95%';
    updateFilteredMouzaCanvas();
  });

  document.getElementById('btnApplyFilters').addEventListener('click', () => {
    imageFilterModal.classList.add('hidden');
  });

  // Scale Calibration Modal Handlers & Logic
  const calibrationModal = document.getElementById('calibrationModal');
  let activeCalTab = '2point';
  let lastCalibratedPixelDist = 250;

    function updateScaleStatusBadge() {
    const statusText = document.getElementById('scaleStatusText');
    const badgeBtn = document.getElementById('btnScaleStatus');
    const ribbonMapName = document.getElementById('ribbonActiveMapName');
    const ribbonMapDot = document.getElementById('ribbonActiveMapDot');

    if (!state.mouzaMap.loaded) {
      if (statusText) statusText.textContent = 'নকশা ইমপোর্ট করুন';
      badgeBtn?.classList.remove('text-emerald-400', 'hover:text-emerald-300', 'text-amber-400', 'hover:text-amber-300');
      badgeBtn?.classList.add('text-slate-400', 'hover:text-slate-200');
      if (ribbonMapName) {
        ribbonMapName.textContent = 'নকশা অপেক্ষমাণ';
        ribbonMapName.className = 'text-slate-400 font-mono';
      }
      if (ribbonMapDot) {
        ribbonMapDot.className = 'w-2 h-2 rounded-full bg-slate-600 flex-shrink-0';
      }
      return;
    }

    const preset = state.scalePreset === '32_inch' ? '৩২" = ১ মাইল' :
                   state.scalePreset === '64_inch' ? '৬৪" = ১ মাইল' :
                   state.scalePreset === '80_inch' ? '৮০" = ১ মাইল' :
                   state.scalePreset === '4_inch'  ? '৪" = ১ মাইল' : '১৬" = ১ মাইল';

    if (ribbonMapName) {
      ribbonMapName.textContent = `${preset} নকশা (সক্রিয়)`;
      ribbonMapName.className = 'text-emerald-300 font-mono';
    }
    if (ribbonMapDot) {
      ribbonMapDot.className = 'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse flex-shrink-0';
    }

    if (state.mouzaMap.isCalibrated) {
      if (statusText) statusText.textContent = `${preset} (ক্যালিব্রেটেড ✓)`;
      badgeBtn?.classList.remove('text-amber-400', 'hover:text-amber-300', 'text-slate-400', 'hover:text-slate-200');
      badgeBtn?.classList.add('text-emerald-400', 'hover:text-emerald-300');
    } else {
      if (statusText) statusText.textContent = `${preset} (ক্যালিব্রেট করুন)`;
      badgeBtn?.classList.remove('text-emerald-400', 'hover:text-emerald-300', 'text-slate-400', 'hover:text-slate-200');
      badgeBtn?.classList.add('text-amber-400', 'hover:text-amber-300');
    }
  }

  function openCalibrationModal(pxDist) {
    if (!calibrationModal) return;

    let effectiveDist = pxDist;
    const activePlot = state.plots.find(p => p.id === state.selectedPlotId);
    if ((!effectiveDist || effectiveDist <= 2) && activePlot && activePlot.vertices && activePlot.vertices.length >= 2) {
      let plotDist = 0;
      for (let i = 0; i < activePlot.vertices.length - 1; i++) {
        plotDist += Math.hypot(activePlot.vertices[i + 1].x - activePlot.vertices[i].x, activePlot.vertices[i + 1].y - activePlot.vertices[i].y);
      }
      effectiveDist = plotDist;
    }
    lastCalibratedPixelDist = effectiveDist || lastCalibratedPixelDist || 250;

    const pxEl = document.getElementById('calPixelDist');
    if (pxEl) {
      const curFt = lastCalibratedPixelDist * FEET_PER_LINK;
      const curFtIn = convertFeetToFeetInches(curFt);
      const groundInches = Math.round(curFt * 12);
      pxEl.textContent = `${curFtIn.formattedBengali} (${curFtIn.formattedShortBengali} • ${toBanglaDigits(groundInches)} ইঞ্চি)`;
    }

    // Default input to match current distance if not set or default
    const feetPartInput = document.getElementById('calFeetPartInput');
    const inchPartInput = document.getElementById('calInchPartInput');
    if (feetPartInput && (!feetPartInput.value || feetPartInput.value === '330')) {
      const curFt = lastCalibratedPixelDist * FEET_PER_LINK;
      feetPartInput.value = Math.round(curFt);
      if (inchPartInput) inchPartInput.value = 0;
    }

    updateCalibrationPreview(lastCalibratedPixelDist);
    updatePresetPreview();

    calibrationModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  function updateCalibrationPreview(pxDist) {
    const distInput = document.getElementById('calDistanceInput');
    const unitSelect = document.getElementById('calUnitSelect');
    const calcScaleEl = document.getElementById('calCalculatedScale');
    const equivScaleEl = document.getElementById('calEquivalentScale');
    const feetInchRow = document.getElementById('calFeetInchRow');
    const feetPartInput = document.getElementById('calFeetPartInput');
    const inchPartInput = document.getElementById('calInchPartInput');
    if (!distInput || !unitSelect || !calcScaleEl) return;

    const unit = unitSelect.value;
    let valInLinks = 0;
    let totalGroundFeet = 0;

    if (feetInchRow) {
      feetInchRow.style.display = (unit === 'feet_inch') ? 'flex' : 'none';
    }

    if (unit === 'feet_inch') {
      distInput.classList.add('opacity-50');
      const ft = parseFloat(feetPartInput?.value) || 0;
      const inch = parseFloat(inchPartInput?.value) || 0;
      totalGroundFeet = ft + (inch / 12);
      valInLinks = totalGroundFeet / FEET_PER_LINK;
      distInput.value = totalGroundFeet.toFixed(1);
    } else {
      distInput.classList.remove('opacity-50');
      const val = parseFloat(distInput.value) || 0;
      if (unit === 'chain') {
        valInLinks = val * 100;
        totalGroundFeet = valInLinks * FEET_PER_LINK;
      } else if (unit === 'feet') {
        totalGroundFeet = val;
        valInLinks = val / FEET_PER_LINK;
      } else if (unit === 'meter') {
        totalGroundFeet = val * 3.28084;
        valInLinks = totalGroundFeet / FEET_PER_LINK;
      } else { // link
        valInLinks = val;
        totalGroundFeet = val * FEET_PER_LINK;
      }
      // Keep feet/inch inputs in sync
      if (feetPartInput && inchPartInput) {
        const ftPart = Math.floor(totalGroundFeet);
        const inPart = Math.round((totalGroundFeet - ftPart) * 12);
        feetPartInput.value = ftPart;
        inchPartInput.value = inPart >= 12 ? 0 : inPart;
      }
    }

    const equivGroundEl = document.getElementById('calEquivGroundHint');
    if (equivGroundEl) {
      const ftIn = convertFeetToFeetInches(totalGroundFeet);
      equivGroundEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span><span>বাস্তব গ্রাউন্ড মাপ: ${ftIn.formattedBengali} (${toBanglaDigits(totalGroundFeet.toFixed(1))} ফুট / ${toBanglaDigits(valInLinks.toFixed(1))} লিংক)</span>`;
    }

    const ratio = pxDist > 0 ? (valInLinks / pxDist) : 1;
    const feetPerPx = ratio * FEET_PER_LINK;
    const pxFtIn = convertFeetToFeetInches(feetPerPx);

    calcScaleEl.textContent = `১ px = ${toBanglaDigits(ratio.toFixed(2))} লিংক (${pxFtIn.formattedShortBengali} / ${toBanglaDigits(feetPerPx.toFixed(2))} ফুট)`;

    if (equivScaleEl) {
      if (ratio >= 2.8) {
        equivScaleEl.textContent = '৩২" বা ৬৪" = ১ মাইল (নদী বা ডিটেইল মৌজা নকশা)';
      } else if (ratio >= 1.1) {
        equivScaleEl.textContent = '১৬" = ১ মাইল (স্ট্যান্ডার্ড CS / RS / SA মৌজা নকশা)';
      } else {
        equivScaleEl.textContent = '৮০" = ১ মাইল (ঘন আবাসন বা সিটি জরিপ নকশা)';
      }
    }
  }

  function updatePresetPreview() {
    const scaleSelect = document.getElementById('calPresetScaleSelect');
    const dpiSelect = document.getElementById('calPresetDpiSelect');
    const inchEl = document.getElementById('calPresetInchGround');
    const pixelEl = document.getElementById('calPresetPixelGround');
    if (!scaleSelect || !dpiSelect || !inchEl || !pixelEl) return;

    const scaleInches = parseFloat(scaleSelect.value) || 16;
    const dpi = parseFloat(dpiSelect.value) || 300;

    const inchLinks = 8000 / scaleInches;
    const inchFeet = inchLinks * FEET_PER_LINK;
    const pixelLinks = inchLinks / dpi;
    const pixelFeet = pixelLinks * FEET_PER_LINK;

    inchEl.textContent = `${inchLinks.toFixed(0)} লিংক (${inchFeet.toFixed(0)} ফুট)`;
    pixelEl.textContent = `${pixelLinks.toFixed(2)} লিংক (${pixelFeet.toFixed(2)} ফুট)`;
  }

  // Tab switching
  const calTab2Point = document.getElementById('calTab2Point');
  const calTabPreset = document.getElementById('calTabPreset');
  const calMode2Point = document.getElementById('calMode2Point');
  const calModePreset = document.getElementById('calModePreset');

  if (calTab2Point && calTabPreset) {
    calTab2Point.addEventListener('click', () => {
      activeCalTab = '2point';
      calTab2Point.classList.add('bg-emerald-600', 'text-white');
      calTab2Point.classList.remove('text-slate-400');
      calTabPreset.classList.remove('bg-emerald-600', 'text-white');
      calTabPreset.classList.add('text-slate-400');
      calMode2Point.classList.remove('hidden');
      calModePreset.classList.add('hidden');
    });

    calTabPreset.addEventListener('click', () => {
      activeCalTab = 'preset';
      calTabPreset.classList.add('bg-emerald-600', 'text-white');
      calTabPreset.classList.remove('text-slate-400');
      calTab2Point.classList.remove('bg-emerald-600', 'text-white');
      calTab2Point.classList.add('text-slate-400');
      calModePreset.classList.remove('hidden');
      calMode2Point.classList.add('hidden');
      updatePresetPreview();
    });
  }

  // Live input changes & Dual Feet-Inch Synchronization
  document.getElementById('calDistanceInput')?.addEventListener('input', () => {
    updateCalibrationPreview(lastCalibratedPixelDist);
  });
  document.getElementById('calUnitSelect')?.addEventListener('change', () => {
    updateCalibrationPreview(lastCalibratedPixelDist);
  });
  document.getElementById('calFeetPartInput')?.addEventListener('input', () => {
    updateCalibrationPreview(lastCalibratedPixelDist);
  });
  document.getElementById('calInchPartInput')?.addEventListener('input', () => {
    updateCalibrationPreview(lastCalibratedPixelDist);
  });

  // Quick Distance Chips
  document.querySelectorAll('.cal-quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = parseFloat(chip.getAttribute('data-val')) || 10;
      const unit = chip.getAttribute('data-unit') || 'chain';
      const unitSelect = document.getElementById('calUnitSelect');
      const distInput = document.getElementById('calDistanceInput');
      const feetPart = document.getElementById('calFeetPartInput');
      const inchPart = document.getElementById('calInchPartInput');
      if (unitSelect) unitSelect.value = unit;
      if (distInput) distInput.value = val;
      if (unit === 'chain') {
        if (feetPart) feetPart.value = val * 66;
        if (inchPart) inchPart.value = 0;
      } else if (unit === 'feet') {
        if (feetPart) feetPart.value = val;
        if (inchPart) inchPart.value = 0;
      } else if (unit === 'link') {
        const ft = val * FEET_PER_LINK;
        if (feetPart) feetPart.value = Math.floor(ft);
        if (inchPart) inchPart.value = Math.round((ft - Math.floor(ft)) * 12);
      }
      updateCalibrationPreview(lastCalibratedPixelDist);
    });
  });

  document.getElementById('calPresetScaleSelect')?.addEventListener('change', updatePresetPreview);
  document.getElementById('calPresetDpiSelect')?.addEventListener('change', updatePresetPreview);

  // Toast Notification System
  function showToast(message, type = 'info') {
    let toast = document.getElementById('cadToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cadToast';
      document.body.appendChild(toast);
    }
    const bgClass = type === 'success' ? 'bg-emerald-950/95 text-emerald-200 border border-emerald-500/50 shadow-emerald-950/40' :
                    type === 'warning' ? 'bg-amber-950/95 text-amber-200 border border-amber-500/50 shadow-amber-950/40' :
                    type === 'error'   ? 'bg-rose-950/95 text-rose-200 border border-rose-500/50 shadow-rose-950/40' :
                                         'bg-slate-900/95 text-slate-200 border border-slate-700/80 shadow-slate-950/40';
    toast.className = `fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 pointer-events-none text-xs font-semibold ${bgClass}`;
    const dotColor = type === 'success' ? 'bg-emerald-400' : type === 'error' ? 'bg-rose-400' : type === 'warning' ? 'bg-amber-400' : 'bg-sky-400';
    toast.innerHTML = `<span class="w-2.5 h-2.5 rounded-full ${dotColor} animate-pulse flex-shrink-0"></span><span>${message}</span>`;
    
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
    
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-12px)';
    }, 4500);
  }

  // Close & Cancel buttons
  const closeCalModalFn = () => {
    calibrationModal.classList.add('hidden');
    state.calibrationPoints = [];
    if (state.tool === 'calibrate') {
      state.tool = 'select';
      updateToolUI();
    }
    render();
  };
  document.getElementById('btnCloseCalModal')?.addEventListener('click', closeCalModalFn);
  document.getElementById('btnCancelCalModal')?.addEventListener('click', closeCalModalFn);

  // Quick measure on canvas button from inside modal
  document.getElementById('btnStartCanvasMeasure')?.addEventListener('click', () => {
    calibrationModal.classList.add('hidden');
    state.calibrationPoints = [];
    state.tool = 'calibrate';
    updateToolUI();
    drawHintBox.classList.remove('opacity-0');
    drawHintText.textContent = 'নকশার স্কেল বারের ১ম পয়েন্টে (০ চেইনে) ক্লিক করুন';
    render();
    showToast('স্কেল বারের ১ম পয়েন্টে (যেমন: ০ চেইনে) ক্লিক করুন', 'info');
  });

  // Status badge click
  document.getElementById('btnScaleStatus')?.addEventListener('click', () => {
    if (state.calibrationPoints.length >= 2) {
      const p1 = state.calibrationPoints[0];
      const p2 = state.calibrationPoints[1];
      openCalibrationModal(Math.hypot(p2.x - p1.x, p2.y - p1.y));
    } else {
      openCalibrationModal(lastCalibratedPixelDist || 250);
    }
  });

  // Apply Calibration
  document.getElementById('btnApplyCalibration')?.addEventListener('click', () => {
    if (activeCalTab === 'preset') {
      const scaleInches = parseFloat(document.getElementById('calPresetScaleSelect')?.value) || 16;
      const dpi = parseFloat(document.getElementById('calPresetDpiSelect')?.value) || 300;
      const targetLinksPerPx = 8000 / (scaleInches * dpi);

      const targetMap = getActiveMouzaMap();
      const img = targetMap ? (targetMap.filteredCanvas || targetMap.imageObj) : null;
      const nw = img ? (img.naturalWidth || img.width || 900) : 900;
      const nh = img ? (img.naturalHeight || img.height || 650) : 650;

      const newW = nw * targetLinksPerPx;
      const newH = nh * targetLinksPerPx;

      const centerX = targetMap.x + targetMap.width / 2;
      const centerY = targetMap.y + targetMap.height / 2;

      targetMap.width = newW;
      targetMap.height = newH;
      targetMap.x = centerX - newW / 2;
      targetMap.y = centerY - newH / 2;
      targetMap.isCalibrated = true;
      targetMap.scaleRatio = targetLinksPerPx;
      targetMap.scalePreset = `${scaleInches}_inch`;

      const scaleSelect = document.getElementById('scaleSelect');
      if (scaleSelect) scaleSelect.value = `${scaleInches}_inch`;
      state.scalePreset = `${scaleInches}_inch`;

      updateScaleStatusBadge();
      calibrationModal.classList.add('hidden');
      state.calibrationPoints = [];
      state.tool = 'select';
      updateToolUI();
      pushHistory();
      render();

      showToast(`মৌজা নকশা প্রিসেট স্কেলে লক হয়েছে (${scaleInches}" = ১ মাইল, ${dpi} DPI)`, 'success');
      return;
    }

    // 2-Point Reference Mode
    let p1 = state.calibrationPoints[0];
    let p2 = state.calibrationPoints[1];
    let currDist = 0;

    if (p1 && p2) {
      currDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    } else {
      const activePlot = state.plots.find(p => p.id === state.selectedPlotId);
      if (activePlot && activePlot.vertices && activePlot.vertices.length >= 2) {
        p1 = activePlot.vertices[0];
        p2 = activePlot.vertices[activePlot.vertices.length - 1];
        for (let i = 0; i < activePlot.vertices.length - 1; i++) {
          currDist += Math.hypot(activePlot.vertices[i + 1].x - activePlot.vertices[i].x, activePlot.vertices[i + 1].y - activePlot.vertices[i].y);
        }
      }
    }

    if (!p1 || currDist <= 0.001) {
      showToast('ক্যানভাসে যেকোনো জানা মাপের ২টি পয়েন্ট সিলেক্ট করুন অথবা একটি আইল সিলেক্ট করুন।', 'warning');
      return;
    }

    const unit = document.getElementById('calUnitSelect').value;
    let targetLinks = 0;

    if (unit === 'feet_inch') {
      const ft = parseFloat(document.getElementById('calFeetPartInput')?.value) || 0;
      const inch = parseFloat(document.getElementById('calInchPartInput')?.value) || 0;
      const totalGroundFeet = ft + (inch / 12);
      if (totalGroundFeet <= 0) {
        showToast('সঠিক বাস্তব দূরত্ব ইনপুট দিন (যেমন: ৬৬০ ফুট ০ ইঞ্চি)।', 'warning');
        return;
      }
      targetLinks = totalGroundFeet / FEET_PER_LINK;
    } else {
      const groundVal = parseFloat(document.getElementById('calDistanceInput').value);
      if (!groundVal || groundVal <= 0) {
        showToast('সঠিক বাস্তব দূরত্ব ইনপুট দিন (যেমন: ১০০০ লিংক বা ৬৬০ ফুট)।', 'warning');
        return;
      }
      if (unit === 'chain') targetLinks = groundVal * 100;
      else if (unit === 'feet') targetLinks = groundVal / FEET_PER_LINK;
      else if (unit === 'meter') targetLinks = (groundVal * 3.28084) / FEET_PER_LINK;
      else targetLinks = groundVal;
    }


    const targetMap = (state.calibrationPoints.length >= 2 ? getMapAtWorldCoord(p1.x, p1.y) : null) || getActiveMouzaMap();
    if (!targetMap || !targetMap.loaded) {
      showToast('কোনো মৌজা নকশা লোড করা নেই', 'warning');
      return;
    }

    if (targetMap.id && state.activeMapId !== targetMap.id) {
      state.activeMapId = targetMap.id;
      updateMapSheetsUI();
    }

    const S = targetLinks / currDist;
    const scope = document.querySelector('input[name="calScope"]:checked')?.value || 'map_only';

    // Scale Mouza Map with anchor at p1 (AutoCAD Reference Scaling)
    const oldW = targetMap.width;
    const oldH = targetMap.height;
    const oldX = targetMap.x;
    const oldY = targetMap.y;

    targetMap.width = oldW * S;
    targetMap.height = oldH * S;
    targetMap.x = p1.x - (p1.x - oldX) * S;
    targetMap.y = p1.y - (p1.y - oldY) * S;
    targetMap.isCalibrated = true;
    targetMap.scaleFactor = S;
    targetMap.calibratedTargetLinks = targetLinks;
    targetMap.calibratedPixelDist = currDist;

    if (scope === 'all') {
      state.plots.forEach(plot => {
        plot.vertices = plot.vertices.map(v => ({
          x: p1.x + (v.x - p1.x) * S,
          y: p1.y + (v.y - p1.y) * S
        }));
      });
      state.pillars.forEach(pil => {
        pil.x = p1.x + (pil.x - p1.x) * S;
        pil.y = p1.y + (pil.y - p1.y) * S;
      });
      state.annotations.forEach(ann => {
        ann.x = p1.x + (ann.x - p1.x) * S;
        ann.y = p1.y + (ann.y - p1.y) * S;
      });
    }

    updateScaleStatusBadge();
    calibrationModal.classList.add('hidden');
    state.calibrationPoints = [];
    state.tool = 'select';
    updateToolUI();
    pushHistory();
    updateInspector();
    render();

    const calFtIn = convertLinksToFeetInches(targetLinks);
    showToast(`মৌজা নকশা ক্যালিব্রেট সম্পন্ন! (${toBanglaDigits(targetLinks.toFixed(1))} লিংক / ${calFtIn.formattedShortBengali}, স্কেল অনুপাত ${toBanglaDigits(S.toFixed(3))}x)`, 'success');
  });

  // ==========================================
  // MODULE 14: PDF Map Export & Field Survey Print Studio
  // ==========================================
  const reportModal = document.getElementById('reportModal');
  const btnExportReport = document.getElementById('btnExportReport');
  const btnCloseReportModal = document.getElementById('btnCloseReportModal');
  const btnPrintReportPdf = document.getElementById('btnPrintReportPdf');
  const btnDownloadReportPng = document.getElementById('btnDownloadReportPng');
  const reportViewMode = document.getElementById('reportViewMode');
  const reportPaperSize = document.getElementById('reportPaperSize');

  function syncReportLabels() {
    const fields = [
      { inp: 'inpReportDistrict', lbl: 'lblReportDistrict' },
      { inp: 'inpReportUpazila', lbl: 'lblReportUpazila' },
      { inp: 'inpReportMouza', lbl: 'lblReportMouza' },
      { inp: 'inpReportJl', lbl: 'lblReportJl' },
      { inp: 'inpReportKhatian', lbl: 'lblReportKhatian' },
      { inp: 'inpReportDaag', lbl: 'lblReportDaag' },
      { inp: 'inpReportOwner', lbl: 'lblReportOwner' },
      { inp: 'inpReportSurveyor', lbl: 'lblReportSurveyor' },
      { inp: 'inpReportSurveyorReg', lbl: 'lblReportReg' },
      { inp: 'inpReportDate', lbl: 'lblReportDate' },
      { inp: 'inpReportScaleText', lbl: 'lblReportScale' },
      { inp: 'inpReportNorthMouza', lbl: 'lblReportNorthMouza' },
      { inp: 'inpReportEastMouza', lbl: 'lblReportEastMouza' },
      { inp: 'inpReportSouthMouza', lbl: 'lblReportSouthMouza' },
      { inp: 'inpReportWestMouza', lbl: 'lblReportWestMouza' }
    ];

    fields.forEach(f => {
      const inpEl = document.getElementById(f.inp);
      const lblEl = document.getElementById(f.lbl);
      if (inpEl && lblEl) {
        lblEl.textContent = inpEl.value || '—';
      }
    });
  }

  function drawReportMapCanvas() {
    const canvas = document.getElementById('reportMapCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // HiDPI crisp resolution (2x buffer)
    const W = 620;
    const H = 320;
    canvas.width = W * 2;
    canvas.height = H * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);

    // Background Fill
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Subtle Cadastral Grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = 20; x < W; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 20; y < H; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Outer Blueprint Border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6, 6, W - 12, H - 12);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(9, 9, W - 18, H - 18);

    const viewMode = reportViewMode ? reportViewMode.value : 'selected';
    const activePlot = state.plots.find(p => p.id === state.selectedPlotId) || state.plots[0];
    let plotsToDraw = [];

    if (viewMode === 'all') {
      plotsToDraw = state.plots.filter(p => p.vertices && p.vertices.length >= 3);
    } else if (activePlot && activePlot.vertices && activePlot.vertices.length >= 3) {
      plotsToDraw = [activePlot];
    }

    if (plotsToDraw.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 14px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('কোনো দাগ অঙ্কন করা নেই — ক্যানভাসে দাগ ট্রেস অথবা নির্বাচন করুন', W / 2, H / 2);
      drawReportCartographicDecorations(ctx, W, H, 1);
      return;
    }

    // Calculate Bounding Box across all plots to draw
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    plotsToDraw.forEach(plot => {
      plot.vertices.forEach(v => {
        minX = Math.min(minX, v.x);
        maxX = Math.max(maxX, v.x);
        minY = Math.min(minY, v.y);
        maxY = Math.max(maxY, v.y);
      });
    });

    const bw = Math.max(maxX - minX, 20);
    const bh = Math.max(maxY - minY, 20);
    const pad = 55;
    const scale = Math.min((W - pad * 2) / bw, (H - pad * 2) / bh);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const toCanvas = (pt) => ({
      x: W / 2 + (pt.x - cx) * scale,
      y: H / 2 + (pt.y - cy) * scale
    });

    // Draw Plots
    plotsToDraw.forEach(plot => {
      const isSelected = activePlot && plot.id === activePlot.id;
      const pts = plot.vertices.map(toCanvas);

      // Polygon Fill & Boundary Stroke
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.closePath();

      ctx.fillStyle = isSelected ? 'rgba(14, 165, 233, 0.12)' : 'rgba(241, 245, 249, 0.7)';
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#0284c7' : '#475569';
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.stroke();

      // Dimension Labels on major boundary arms (Decluttered, zero overlap)
      const reportArms = getSimplifiedBoundaryArms(plot.vertices, true, 12);
      const placedReportBoxes = [];

      for (const arm of reportArms) {
        const cp1 = toCanvas(arm.p1);
        const cp2 = toCanvas(arm.p2);

        const distLk = arm.cumulativeLength;
        if (distLk <= 0.001) continue;
        const distFt = distLk * FEET_PER_LINK;
        const ftIn = convertFeetToFeetInches(distFt);

        const midX = (cp1.x + cp2.x) / 2;
        const midY = (cp1.y + cp2.y) / 2;

        const dx = cp2.x - cp1.x;
        const dy = cp2.y - cp1.y;
        const len = Math.hypot(dx, dy) || 1;
        if (len < 24 && reportArms.length > 3) continue;

        const nx = -dy / len;
        const ny = dx / len;

        const labelX = midX + nx * 14;
        const labelY = midY + ny * 14;

        const labelText = `${toBanglaDigits(distLk.toFixed(1))} lk (${ftIn.formattedShortBengali})`;

        ctx.font = 'bold 9px "Hind Siliguri", sans-serif';
        const metrics = ctx.measureText(labelText);
        const tw = metrics.width + 10;
        const th = 15;

        let collides = false;
        for (const b of placedReportBoxes) {
          if (Math.abs(labelX - b.x) < (tw + b.w) / 2 + 4 && Math.abs(labelY - b.y) < (th + b.h) / 2 + 4) {
            collides = true;
            break;
          }
        }
        if (collides) continue;
        placedReportBoxes.push({ x: labelX, y: labelY, w: tw, h: th });

        // Pill background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.roundRect(labelX - tw / 2, labelY - th / 2, tw, th, 4);
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#93c5fd' : '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, labelX, labelY);
      }

      // Vertex Boundary Pillars (corners only to eliminate clutter)
      const reportCornerIndices = new Set();
      reportArms.forEach(a => {
        reportCornerIndices.add(a.startIndex);
        reportCornerIndices.add(a.endIndex);
      });
      pts.forEach((pt, idx) => {
        if (pts.length > 8 && !reportCornerIndices.has(idx)) return;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Pillar index
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pt.x + 8, pt.y - 8, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#b91c1c';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(toBanglaDigits(idx + 1), pt.x + 8, pt.y - 8);
      });

      // Centroid Daag Number & Area Badge
      const centroid = calculateCentroid(plot.vertices);
      const cp = toCanvas(centroid);
      const rawArea = calculateShoelaceArea(plot.vertices);
      const shotok = (rawArea * SQFT_PER_SQLINK / SQFT_PER_SHOTOK).toFixed(2);
      const plotNameClean = plot.name ? plot.name.replace(' (নির্বাচিত)', '').replace(' (অটো)', '') : 'দাগ';

      ctx.font = 'bold 11px "Hind Siliguri", sans-serif';
      const daagTitle = plotNameClean.includes('দাগ') ? plotNameClean : `দাগ নং ${toBanglaDigits(plotNameClean)}`;
      const areaTitle = `${toBanglaDigits(shotok)} শতক`;
      const badgeW = Math.max(ctx.measureText(daagTitle).width, ctx.measureText(areaTitle).width) + 16;
      const badgeH = 28;

      ctx.fillStyle = 'rgba(240, 249, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(cp.x - badgeW / 2, cp.y - badgeH / 2, badgeW, badgeH, 6);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#0369a1';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(daagTitle, cp.x, cp.y - 6);

      ctx.fillStyle = '#0f172a';
      ctx.font = '9px "Hind Siliguri", sans-serif';
      ctx.fillText(areaTitle, cp.x, cp.y + 7);
    });

    // Draw Cartographic Decorations
    drawReportCartographicDecorations(ctx, W, H, scale);
  }

  function drawReportCartographicDecorations(ctx, W, H, scale) {
    // 1. North Arrow Compass Rose (Top-Right)
    const nx = W - 35;
    const ny = 35;
    ctx.save();
    ctx.beginPath();
    ctx.arc(nx, ny, 16, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // North Pointer (Black/Red)
    ctx.beginPath();
    ctx.moveTo(nx, ny - 13);
    ctx.lineTo(nx - 4, ny);
    ctx.lineTo(nx, ny - 2);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(nx, ny - 13);
    ctx.lineTo(nx + 4, ny);
    ctx.lineTo(nx, ny - 2);
    ctx.closePath();
    ctx.fillStyle = '#991b1b';
    ctx.fill();

    // South Pointer (White/Grey)
    ctx.beginPath();
    ctx.moveTo(nx, ny + 13);
    ctx.lineTo(nx - 4, ny);
    ctx.lineTo(nx, ny + 2);
    ctx.closePath();
    ctx.fillStyle = '#94a3b8';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(nx, ny + 13);
    ctx.lineTo(nx + 4, ny);
    ctx.lineTo(nx, ny + 2);
    ctx.closePath();
    ctx.fillStyle = '#cbd5e1';
    ctx.fill();

    // North Label
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('উ / N', nx, ny - 17);
    ctx.restore();

    // 2. Graphical Scale Bar (Bottom-Left)
    const sx = 20;
    const sy = H - 24;
    const barSegments = 4;
    const segLengthLk = 25; // 25 links per segment = 100 links total
    const segWidthPx = Math.max(16, Math.min(30, segLengthLk * scale));

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(sx - 4, sy - 14, (segWidthPx * barSegments) + 12, 28);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(sx - 4, sy - 14, (segWidthPx * barSegments) + 12, 28);

    for (let i = 0; i < barSegments; i++) {
      ctx.fillStyle = (i % 2 === 0) ? '#0f172a' : '#ffffff';
      ctx.fillRect(sx + i * segWidthPx, sy - 2, segWidthPx, 5);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(sx + i * segWidthPx, sy - 2, segWidthPx, 5);
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 8px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('০', sx - 2, sy - 3);
    ctx.textAlign = 'right';
    ctx.fillText(`${toBanglaDigits(segLengthLk * barSegments)} লিংক (Graphic Scale)`, sx + barSegments * segWidthPx + 2, sy + 11);
    ctx.restore();

    // 3. Cadastral Certification Watermark (Bottom-Right)
    ctx.save();
    ctx.font = '8px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('ল্যান্ড সার্ভে ক্যাড (Land Survey CAD) • কম্পিউটারাইজড নকশা রিপোর্ট', W - 16, H - 16);
    ctx.restore();
  }

  // =========================================================================
  // Official Bangladesh Cadastral Mouza & Area Knowledge Base & Detector
  // =========================================================================
  const DEFAULT_MOUZA_KNOWLEDGE = {
    district: 'চাঁদপুর',
    upazila: 'ফরিদগঞ্জ',
    mouza: 'খাজুরাদিয়া',
    altMouza: 'খাজুরিয়া',
    jl: '১৬',
    sheet: '১',
    reSaNo: '৩৮৬৪',
    gps: { lat: 23.127500, lng: 90.750900 },
    scalePreset: '16_inch',
    scaleText: '১৬ ইঞ্চি = ১ মাইল (স্ট্যান্ডার্ড)',
    boundaries: {
      north: 'সকদিরামপুর (নং ৩)',
      east: 'কৃষ্ণপুর (নং ১২)',
      south: 'মদনগাঁও (নং ১৫) ও দেইচর (নং ৩৬)',
      west: 'সেখদি (নং ১৬)'
    }
  };

  function detectMouzaAndLocationFromMap(targetMap = null, showNotification = false) {
    const activeMap = targetMap || (state.mouzaMaps && state.mouzaMaps.find(m => m.id === state.activeMapId)) || state.mouzaMap;

    let detected = {
      district: DEFAULT_MOUZA_KNOWLEDGE.district,
      upazila: DEFAULT_MOUZA_KNOWLEDGE.upazila,
      mouza: DEFAULT_MOUZA_KNOWLEDGE.mouza,
      jl: DEFAULT_MOUZA_KNOWLEDGE.jl,
      sheet: DEFAULT_MOUZA_KNOWLEDGE.sheet,
      reSaNo: DEFAULT_MOUZA_KNOWLEDGE.reSaNo,
      scaleText: DEFAULT_MOUZA_KNOWLEDGE.scaleText,
      boundaries: { ...DEFAULT_MOUZA_KNOWLEDGE.boundaries }
    };

    if (activeMap) {
      const name = (activeMap.name || '').toLowerCase();
      const src = (activeMap.imageObj && activeMap.imageObj.src) ? activeMap.imageObj.src.toLowerCase() : '';

      // Pattern matcher for custom maps or standard Faridganj scan
      if (name.includes('খাজুর') || src.includes('faridganj') || src.includes('default_mouza')) {
        detected = {
          ...DEFAULT_MOUZA_KNOWLEDGE,
          boundaries: { ...DEFAULT_MOUZA_KNOWLEDGE.boundaries }
        };
      }
    }

    // Save into active map entity
    if (activeMap) {
      activeMap.locationInfo = {
        district: detected.district,
        upazila: detected.upazila,
        mouza: detected.mouza,
        jl: detected.jl,
        sheet: detected.sheet,
        reSaNo: detected.reSaNo,
        scaleText: detected.scaleText,
        boundaries: { ...detected.boundaries }
      };
    }

    // Update Top Navbar Subtitle & Sync Real GPS Datum
    syncLocationToHeader(detected);

    if (detected.district === 'চাঁদপুর' && (detected.upazila === 'ফরিদগঞ্জ' || (detected.mouza || '').includes('খাজুর'))) {
      state.satellite.originGPS = { lat: 23.127500, lng: 90.750900 };
      const quickSel = document.getElementById('quickGpsDistrictSelect');
      if (quickSel) quickSel.value = '23.1275,90.7509';
      const kmzLat = document.getElementById('kmzInpLat');
      const kmzLng = document.getElementById('kmzInpLng');
      if (kmzLat) kmzLat.value = '23.127500';
      if (kmzLng) kmzLng.value = '90.750900';
    }

    // Populate Report Studio Inputs
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    };
    setVal('inpReportDistrict', detected.district);
    setVal('inpReportUpazila', detected.upazila);
    setVal('inpReportMouza', detected.mouza);
    setVal('inpReportJl', detected.jl);
    setVal('inpReportScaleText', detected.scaleText);
    setVal('inpReportNorthMouza', detected.boundaries.north);
    setVal('inpReportEastMouza', detected.boundaries.east);
    setVal('inpReportSouthMouza', detected.boundaries.south);
    setVal('inpReportWestMouza', detected.boundaries.west);

    syncReportLabels();

    if (showNotification) {
      showToast(`✓ নকশা থেকে মৌজা ও এলাকা ডিটেক্ট সম্পন্ন: ${detected.mouza} (জেএল ${toBanglaDigits(detected.jl)}) • ${detected.upazila}, ${detected.district}`, 'success');
    }

    return detected;
  }

  // Auto-detect Mouza & Location Info from Active Map or Header
  function getActiveMapLocationInfo() {
    const activeMap = (state.mouzaMaps && state.mouzaMaps.find(m => m.id === state.activeMapId)) || state.mouzaMap;
    if (activeMap && activeMap.locationInfo && activeMap.locationInfo.mouza) {
      return activeMap.locationInfo;
    }

    const subEl = document.getElementById('mouzaMapInfoSubtitle');
    const text = subEl ? subEl.textContent.trim() : '';

    let district = DEFAULT_MOUZA_KNOWLEDGE.district;
    let upazila = DEFAULT_MOUZA_KNOWLEDGE.upazila;
    let mouza = DEFAULT_MOUZA_KNOWLEDGE.mouza;
    let jl = DEFAULT_MOUZA_KNOWLEDGE.jl;
    let sheet = DEFAULT_MOUZA_KNOWLEDGE.sheet;

    if (text) {
      const mMatch = text.match(/মৌজা:\s*([^\(•]+)(?:\(([^)]+)\))?/);
      if (mMatch) {
        if (mMatch[1]) mouza = mMatch[1].trim();
        if (mMatch[2]) jl = mMatch[2].trim();
      }
      const upzDistMatch = text.match(/•\s*([^,•]+),\s*([^•]+)/);
      if (upzDistMatch) {
        if (upzDistMatch[1]) upazila = upzDistMatch[1].trim();
        if (upzDistMatch[2]) {
          district = upzDistMatch[2].replace(/•.*/, '').trim();
        }
      }
      const sheetMatch = text.match(/সিট\s*নং:\s*([০-৯0-9]+)/);
      if (sheetMatch && sheetMatch[1]) {
        sheet = sheetMatch[1].trim();
      }
    }

    return {
      district, upazila, mouza, jl, sheet,
      boundaries: { ...DEFAULT_MOUZA_KNOWLEDGE.boundaries }
    };
  }

  function syncLocationToHeader(loc) {
    const subEl = document.getElementById('mouzaMapInfoSubtitle');
    if (subEl && loc) {
      subEl.textContent = `মৌজা: ${loc.mouza} (${toBanglaDigits(loc.jl)}) • ${loc.upazila}, ${loc.district} • সিট নং: ${toBanglaDigits(loc.sheet || '১')}`;
    }
    const activeMap = (state.mouzaMaps && state.mouzaMaps.find(m => m.id === state.activeMapId)) || state.mouzaMap;
    if (activeMap) {
      activeMap.locationInfo = { ...loc };
    }
  }

  // =========================================================================
  // Button 1 & 3: Master Survey Report Studio vs Single Plot Certificate
  // =========================================================================
  function openReportStudio(mode = 'selected', specificPlotId = null) {
    if (specificPlotId) {
      state.selectedPlotId = specificPlotId;
    }

    // 1. Auto-detect and populate Mouza & Area location from active map
    const locInfo = getActiveMapLocationInfo();
    const inpDist = document.getElementById('inpReportDistrict');
    const inpUpz = document.getElementById('inpReportUpazila');
    const inpMouza = document.getElementById('inpReportMouza');
    const inpJl = document.getElementById('inpReportJl');
    const inpNorth = document.getElementById('inpReportNorthMouza');
    const inpEast = document.getElementById('inpReportEastMouza');
    const inpSouth = document.getElementById('inpReportSouthMouza');
    const inpWest = document.getElementById('inpReportWestMouza');

    if (inpDist && locInfo.district) inpDist.value = locInfo.district;
    if (inpUpz && locInfo.upazila) inpUpz.value = locInfo.upazila;
    if (inpMouza && locInfo.mouza) inpMouza.value = locInfo.mouza;
    if (inpJl && locInfo.jl) inpJl.value = locInfo.jl;
    if (inpNorth && locInfo.boundaries && locInfo.boundaries.north) inpNorth.value = locInfo.boundaries.north;
    if (inpEast && locInfo.boundaries && locInfo.boundaries.east) inpEast.value = locInfo.boundaries.east;
    if (inpSouth && locInfo.boundaries && locInfo.boundaries.south) inpSouth.value = locInfo.boundaries.south;
    if (inpWest && locInfo.boundaries && locInfo.boundaries.west) inpWest.value = locInfo.boundaries.west;

    // Set view mode
    if (reportViewMode) {
      reportViewMode.value = (mode === 'all') ? 'all' : 'selected';
    }

    // 2. Active Plot data
    let activePlot = state.plots.find(p => p.id === state.selectedPlotId);
    if (!activePlot && state.plots.length > 0) {
      state.selectedPlotId = state.plots[0].id;
      activePlot = state.plots[0];
    }

    if (activePlot) {
      const rawName = activePlot.name.replace(' (নির্বাচিত)', '').replace(' (অটো)', '');
      const cleanDigits = rawName.replace(/[^0-9০-৯]/g, '');
      const inpDaag = document.getElementById('inpReportDaag');
      if (inpDaag && cleanDigits) {
        inpDaag.value = cleanDigits;
      }

      // Calculate area breakdown
      const sqLinks = calculateShoelaceArea(activePlot.vertices);
      const sqft = sqLinks * SQFT_PER_SQLINK;
      const shotok = (sqft / SQFT_PER_SHOTOK).toFixed(3);
      const katha = sqft / SQFT_PER_KATHA;
      const kathaPart = Math.floor(katha);
      const shotokRemaining = ((sqft / SQFT_PER_SHOTOK) % 1.652893).toFixed(1);
      const sqM = sqft / SQFT_PER_SQMETER;

      const reportTotalShotok = document.getElementById('reportTotalShotok');
      const reportBanglaKatha = document.getElementById('reportBanglaKatha');
      const reportTotalSqft = document.getElementById('reportTotalSqft');

      if (reportTotalShotok) reportTotalShotok.textContent = `${toBanglaDigits(shotok)} শতক (Decimal)`;
      if (reportBanglaKatha) reportBanglaKatha.textContent = `${toBanglaDigits(kathaPart)} কাঠা ${toBanglaDigits(shotokRemaining)} শতক`;
      if (reportTotalSqft) reportTotalSqft.textContent = `${toBanglaDigits(sqft.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }))} বর্গফুট (${toBanglaDigits(sqM.toFixed(1))} বর্গমিটার)`;

      // Populate Four-side Chouhaddi measurements
      const grid = document.getElementById('reportBoundaryGrid');
      if (grid && activePlot.vertices && activePlot.vertices.length >= 3) {
        const sides = [];
        const sideNames = ['উত্তর আইল', 'পূর্ব আইল', 'দক্ষিণ আইল', 'পশ্চিম আইল'];
        for (let i = 0; i < activePlot.vertices.length; i++) {
          const pA = activePlot.vertices[i];
          const pB = activePlot.vertices[(i + 1) % activePlot.vertices.length];
          const lk = Math.hypot(pB.x - pA.x, pB.y - pA.y);
          const ft = lk * FEET_PER_LINK;
          const ftIn = convertFeetToFeetInches(ft);
          sides.push({
            name: sideNames[i] || `আইল ${toBanglaDigits(i + 1)}`,
            lk: lk.toFixed(1),
            ftIn: ftIn.formattedShortBengali
          });
        }

        let gridHtml = '';
        sides.forEach(s => {
          gridHtml += `
            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <div class="text-[10px] text-slate-500 font-bold">${s.name}</div>
              <div class="font-extrabold font-mono text-slate-900">${toBanglaDigits(s.lk)} lk (${s.ftIn})</div>
            </div>
          `;
        });
        grid.className = `grid grid-cols-${Math.min(sides.length, 4)} gap-2 text-center text-[11px]`;
        grid.innerHTML = gridHtml;
      }
    } else if (mode === 'selected') {
      showToast('দয়া করে ক্যানভাসে প্রথমে একটি দাগ সিলেক্ট করুন বা আঁকুন।', 'info');
    }

    syncReportLabels();
    drawReportMapCanvas();
    reportModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  // =========================================================================
  // Button 2: Scaled CAD Map Sheet Print Studio (AutoCAD Blueprint A4/A3)
  // =========================================================================
  function renderPrintSheetCanvas() {
    const pCanvas = document.getElementById('printSheetCanvas');
    if (!pCanvas) return;
    const pCtx = pCanvas.getContext('2d');
    pCanvas.width = 650;
    pCanvas.height = 250;
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    const activePlot = state.plots.find(p => p.id === state.selectedPlotId) || state.plots[0];
    const plotsToDraw = activePlot ? [activePlot] : state.plots.filter(p => p.vertices && p.vertices.length >= 3);

    if (plotsToDraw.length === 0) {
      pCtx.fillStyle = '#64748b';
      pCtx.font = 'bold 12px "Hind Siliguri", sans-serif';
      pCtx.textAlign = 'center';
      pCtx.fillText('কোনো সক্রিয় দাগ পাওয়া যায়নি — ক্যানভাসে দাগ ট্রেস করুন', pCanvas.width / 2, pCanvas.height / 2);
      return;
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    plotsToDraw.forEach(plot => {
      plot.vertices.forEach(v => {
        if (v.x < minX) minX = v.x;
        if (v.x > maxX) maxX = v.x;
        if (v.y < minY) minY = v.y;
        if (v.y > maxY) maxY = v.y;
      });
    });

    const plotW = maxX - minX || 1;
    const plotH = maxY - minY || 1;
    const pad = 35;
    const scale = Math.min((pCanvas.width - pad * 2) / plotW, (pCanvas.height - pad * 2) / plotH);
    const offsetX = (pCanvas.width - plotW * scale) / 2 - minX * scale;
    const offsetY = (pCanvas.height - plotH * scale) / 2 - minY * scale;

    plotsToDraw.forEach(plot => {
      const vs = plot.vertices;
      if (vs.length < 3) return;
      pCtx.beginPath();
      pCtx.moveTo(vs[0].x * scale + offsetX, vs[0].y * scale + offsetY);
      for (let i = 1; i < vs.length; i++) {
        pCtx.lineTo(vs[i].x * scale + offsetX, vs[i].y * scale + offsetY);
      }
      pCtx.closePath();
      pCtx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      pCtx.fill();
      pCtx.strokeStyle = '#0f172a';
      pCtx.lineWidth = 2.5;
      pCtx.stroke();

      pCtx.fillStyle = '#0f172a';
      pCtx.font = 'bold 9px monospace';
      pCtx.textAlign = 'center';
      pCtx.textBaseline = 'middle';
      const printArms = getSimplifiedBoundaryArms(plot.vertices, true, 12);
      for (const arm of printArms) {
        const p1 = arm.p1;
        const p2 = arm.p2;
        const mx = ((p1.x + p2.x) / 2) * scale + offsetX;
        const my = ((p1.y + p2.y) / 2) * scale + offsetY;
        const lk = arm.cumulativeLength;
        if (lk <= 0.001) continue;
        pCtx.fillText(`${toBanglaDigits(lk.toFixed(1))}lk`, mx, my - 6);
      }
    });

    if (activePlot) {
      const sqLinks = calculateShoelaceArea(activePlot.vertices);
      const sqft = sqLinks * SQFT_PER_SQLINK;
      const shotok = (sqft / SQFT_PER_SHOTOK).toFixed(2);
      const kathaPart = Math.floor(sqft / SQFT_PER_KATHA);
      const shotokRemaining = ((sqft / SQFT_PER_SHOTOK) % 1.652893).toFixed(1);
      const perimLk = activePlot.vertices.reduce((acc, v, i, arr) => {
        const next = arr[(i + 1) % arr.length];
        return acc + Math.hypot(next.x - v.x, next.y - v.y);
      }, 0);
      const perimFt = (perimLk * FEET_PER_LINK).toFixed(1);

      const daagEl = document.getElementById('printDaagNum');
      const shotokEl = document.getElementById('printAreaShotok');
      const sqftEl = document.getElementById('printAreaSqft');
      const perimEl = document.getElementById('printPerimeter');

      if (daagEl) daagEl.textContent = activePlot.name.replace(' (নির্বাচিত)', '').replace(' (অটো)', '');
      if (shotokEl) shotokEl.textContent = `${toBanglaDigits(shotok)} শতক (${toBanglaDigits(kathaPart)} কাঠা ${toBanglaDigits(shotokRemaining)} শতক)`;
      if (sqftEl) sqftEl.textContent = `${toBanglaDigits(sqft.toFixed(1))} বর্গফুট`;
      if (perimEl) perimEl.textContent = `${toBanglaDigits(perimFt)} ফুট (${toBanglaDigits(perimLk.toFixed(1))} লিংক)`;
    }
  }

  function openPrintLayoutModal() {
    const modal = document.getElementById('printLayoutModal');
    if (modal) {
      modal.classList.remove('hidden');
      setTimeout(renderPrintSheetCanvas, 50);
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    }
  }
  window.openPrintLayoutModal = openPrintLayoutModal;

  // ==========================================
  // Audio Feedback Synthesizer for CAD Operations
  // ==========================================
  function playCadSound(type = 'beep') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (type === 'beep') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } else if (type === 'merge') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch (e) {}
  }

  // ==========================================
  // MODULE 18: Auto Plot Numbering Studio (অটো দাগ নাম্বারিং)
  // ==========================================
  const autoNumberModal = document.getElementById('autoNumberModal');
  const btnCloseAutoNumberModal = document.getElementById('btnCloseAutoNumberModal');
  const btnStartInteractiveNumbering = document.getElementById('btnStartInteractiveNumbering');
  const btnBatchSequenceAll = document.getElementById('btnBatchSequenceAll');
  const btnCheckDuplicates = document.getElementById('btnCheckDuplicates');
  const btnResolveDuplicates = document.getElementById('btnResolveDuplicates');
  const inpAutoNumberStart = document.getElementById('inpAutoNumberStart');
  const selAutoNumberPrefix = document.getElementById('selAutoNumberPrefix');
  const selAutoNumberStep = document.getElementById('selAutoNumberStep');
  const duplicateAuditResult = document.getElementById('duplicateAuditResult');

  function openAutoNumberModal() {
    if (!autoNumberModal) return;
    const emptyNotice = document.getElementById('autoNumberEmptyPlotsNotice');
    if (!state.plots || state.plots.length === 0) {
      if (emptyNotice) emptyNotice.classList.remove('hidden');
    } else {
      if (emptyNotice) emptyNotice.classList.add('hidden');
    }
    if (inpAutoNumberStart) inpAutoNumberStart.value = state.autoNumberSettings.start || 501;
    if (selAutoNumberPrefix) selAutoNumberPrefix.value = state.autoNumberSettings.prefix !== undefined ? state.autoNumberSettings.prefix : 'দাগ নং ';
    if (selAutoNumberStep) selAutoNumberStep.value = String(state.autoNumberSettings.step || 1);
    checkDuplicatePlotNumbers();
    autoNumberModal.classList.remove('hidden');
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }
  window.openAutoNumberModal = openAutoNumberModal;

  function startInteractiveAutoNumbering() {
    const startVal = parseInt(inpAutoNumberStart?.value, 10) || 501;
    const prefixVal = selAutoNumberPrefix ? selAutoNumberPrefix.value : 'দাগ নং ';
    const stepVal = parseInt(selAutoNumberStep?.value, 10) || 1;

    state.autoNumberSettings = {
      start: startVal,
      current: startVal,
      prefix: prefixVal,
      step: stepVal
    };

    state.tool = 'auto-number';
    updateToolUI();
    if (autoNumberModal) autoNumberModal.classList.add('hidden');

    drawHintBox.classList.remove('opacity-0');
    drawHintText.innerHTML = `<span class="text-emerald-400 font-bold">[অটো দাগ নাম্বারিং]</span> ক্যানভাসে দাগের ভেতর ক্লিক করুন (পরবর্তী: ${state.autoNumberSettings.prefix}${toBanglaDigits(state.autoNumberSettings.current)})`;
    showToast(`ক্লিক নাম্বারিং সক্রিয়! দাগের ভেতর ক্লিক করুন (${toBanglaDigits(state.autoNumberSettings.current)} থেকে শুরু)`, 'info');
  }

  function applyAutoNumberToPlot(plot, customNum = null) {
    const num = customNum !== null ? customNum : state.autoNumberSettings.current;
    const prefix = state.autoNumberSettings ? state.autoNumberSettings.prefix : 'দাগ নং ';
    const newName = `${prefix}${toBanglaDigits(num)}`;
    plot.name = newName;
    playCadSound('beep');
    showToast(`দাগ নম্বর নির্ধারণ: ${newName}`, 'success');

    if (customNum === null && state.autoNumberSettings) {
      state.autoNumberSettings.current += (state.autoNumberSettings.step || 1);
      if (inpAutoNumberStart) inpAutoNumberStart.value = state.autoNumberSettings.current;
      drawHintText.innerHTML = `<span class="text-emerald-400 font-bold">[অটো দাগ নাম্বারিং]</span> পরবর্তী দাগে ক্লিক করুন (পরবর্তী: ${state.autoNumberSettings.prefix}${toBanglaDigits(state.autoNumberSettings.current)})`;
    }

    pushHistory();
    updateInspector();
    render();
  }

  function batchSequenceAllPlots() {
    if (!state.plots || state.plots.length === 0) {
      showToast('নাম্বারিং করার মতো কোনো দাগ নেই!', 'warning');
      return;
    }

    const startVal = parseInt(inpAutoNumberStart?.value, 10) || 501;
    const prefixVal = selAutoNumberPrefix ? selAutoNumberPrefix.value : 'দাগ নং ';
    const stepVal = parseInt(selAutoNumberStep?.value, 10) || 1;

    state.autoNumberSettings.start = startVal;
    state.autoNumberSettings.prefix = prefixVal;
    state.autoNumberSettings.step = stepVal;

    // Cadastral Spatial Sequence: Sort NW (North-West) to SE (South-East)
    const plotsWithCentroid = state.plots.map(p => ({
      plot: p,
      centroid: calculateCentroid(p.vertices)
    }));

    plotsWithCentroid.sort((a, b) => {
      if (Math.abs(a.centroid.y - b.centroid.y) > 120) {
        return a.centroid.y - b.centroid.y;
      }
      return a.centroid.x - b.centroid.x;
    });

    let curr = startVal;
    plotsWithCentroid.forEach(item => {
      item.plot.name = `${prefixVal}${toBanglaDigits(curr)}`;
      curr += stepVal;
    });

    state.autoNumberSettings.current = curr;
    if (inpAutoNumberStart) inpAutoNumberStart.value = curr;

    pushHistory();
    updateInspector();
    render();
    checkDuplicatePlotNumbers();
    playCadSound('merge');
    showToast(`সব দাগ (${toBanglaDigits(state.plots.length)} টি) উত্তর-পশ্চিম থেকে ক্রমানুসারে নাম্বারিং সম্পন্ন হয়েছে!`, 'success');
  }

  function checkDuplicatePlotNumbers() {
    if (!duplicateAuditResult) return;
    if (!state.plots || state.plots.length === 0) {
      duplicateAuditResult.innerHTML = '<span class="text-slate-400">নকশায় কোনো দাগ তৈরি করা হয়নি।</span>';
      return;
    }

    const counts = {};
    state.plots.forEach(p => {
      const cleanName = (p.name || '').trim();
      counts[cleanName] = (counts[cleanName] || 0) + 1;
    });

    const duplicates = Object.entries(counts).filter(([name, count]) => count > 1);

    if (duplicates.length === 0) {
      duplicateAuditResult.innerHTML = `
        <div class="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
          <i data-lucide="check" class="w-4 h-4"></i>
          <span>কোনো ডুপ্লিকেট দাগ নেই (সবগুলো ${toBanglaDigits(state.plots.length)} টি দাগ অনন্য)</span>
        </div>
      `;
    } else {
      const dupItems = duplicates.map(([name, count]) => 
        `<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">${name} (${toBanglaDigits(count)} বার)</span>`
      ).join(' ');

      duplicateAuditResult.innerHTML = `
        <div class="space-y-1.5">
          <div class="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <i data-lucide="alert-triangle" class="w-4 h-4"></i>
            <span>${toBanglaDigits(duplicates.length)} টি ডুপ্লিকেট দাগ নম্বর পাওয়া গেছে:</span>
          </div>
          <div class="flex flex-wrap gap-1.5 pt-1">${dupItems}</div>
        </div>
      `;
    }
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  function resolveDuplicatePlotNumbers() {
    if (!state.plots || state.plots.length === 0) return;

    const groups = {};
    state.plots.forEach(p => {
      const cleanName = (p.name || '').trim();
      if (!groups[cleanName]) groups[cleanName] = [];
      groups[cleanName].push(p);
    });

    const subSuffixes = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ'];
    let resolvedCount = 0;

    Object.entries(groups).forEach(([name, plots]) => {
      if (plots.length > 1) {
        plots.forEach((p, idx) => {
          const suffix = subSuffixes[idx] || (idx + 1);
          p.name = `${name}/${suffix}`;
          resolvedCount++;
        });
      }
    });

    if (resolvedCount > 0) {
      pushHistory();
      updateInspector();
      render();
      checkDuplicatePlotNumbers();
      playCadSound('merge');
      showToast(`${toBanglaDigits(resolvedCount)} টি ডুপ্লিকেট দাগ /ক, /খ উপ-দাগ আকারে সমাধান করা হয়েছে!`, 'success');
    } else {
      showToast('কোনো ডুপ্লিকেট দাগ পাওয়া যায়নি!', 'info');
    }
  }

  // ==========================================
  // MODULE 20: Advanced Plot Processing (Merge & Union)
  // ==========================================
  const plotMergeModal = document.getElementById('plotMergeModal');
  const btnClosePlotMergeModal = document.getElementById('btnClosePlotMergeModal');
  const btnStartInteractiveMerge = document.getElementById('btnStartInteractiveMerge');
  const btnExecuteMergePlots = document.getElementById('btnExecuteMergePlots');
  const mergePlotASelect = document.getElementById('mergePlotASelect');
  const mergePlotBSelect = document.getElementById('mergePlotBSelect');
  const mergeAdjacencyBadge = document.getElementById('mergeAdjacencyBadge');
  const mergePlotAArea = document.getElementById('mergePlotAArea');
  const mergePlotBArea = document.getElementById('mergePlotBArea');
  const mergeTotalArea = document.getElementById('mergeTotalArea');
  const mergeTotalSqft = document.getElementById('mergeTotalSqft');
  const mergeOutputName = document.getElementById('mergeOutputName');

  function openPlotMergeModal(selectedPlotId = null) {
    if (!plotMergeModal) return;
    const emptyNotice = document.getElementById('mergeEmptyPlotsNotice');
    if (!state.plots || state.plots.length < 2) {
      if (emptyNotice) emptyNotice.classList.remove('hidden');
    } else {
      if (emptyNotice) emptyNotice.classList.add('hidden');
    }

    populateMergePlotSelects(selectedPlotId || state.selectedPlotId);
    plotMergeModal.classList.remove('hidden');
    updatePlotMergePreview();
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }
  window.openPlotMergeModal = openPlotMergeModal;

  function populateMergePlotSelects(preferredPlotAId = null) {
    if (!mergePlotASelect || !mergePlotBSelect) return;

    mergePlotASelect.innerHTML = '';
    mergePlotBSelect.innerHTML = '';

    state.plots.forEach((p, idx) => {
      const optA = document.createElement('option');
      optA.value = p.id;
      optA.textContent = `${p.name} (দাগ #${idx + 1})`;
      mergePlotASelect.appendChild(optA);

      const optB = document.createElement('option');
      optB.value = p.id;
      optB.textContent = `${p.name} (দাগ #${idx + 1})`;
      mergePlotBSelect.appendChild(optB);
    });

    if (preferredPlotAId && state.plots.some(p => p.id === preferredPlotAId)) {
      mergePlotASelect.value = preferredPlotAId;
    } else {
      mergePlotASelect.value = state.plots[0].id;
    }

    // Auto-select adjacent plot for B if available
    const plotA = state.plots.find(p => p.id === mergePlotASelect.value);
    let chosenB = null;
    if (plotA && window.LSCAD && window.LSCAD.PlotOps) {
      for (const other of state.plots) {
        if (other.id !== plotA.id) {
          const adj = window.LSCAD.PlotOps.checkPlotsAdjacency(plotA.vertices, other.vertices);
          if (adj.isAdjacent) {
            chosenB = other.id;
            break;
          }
        }
      }
    }

    if (chosenB) {
      mergePlotBSelect.value = chosenB;
    } else {
      const other = state.plots.find(p => p.id !== mergePlotASelect.value);
      if (other) mergePlotBSelect.value = other.id;
    }
  }

  function updatePlotMergePreview() {
    if (!mergePlotASelect || !mergePlotBSelect) return;
    const idA = mergePlotASelect.value;
    const idB = mergePlotBSelect.value;

    const plotA = state.plots.find(p => p.id === idA);
    const plotB = state.plots.find(p => p.id === idB);

    if (!plotA || !plotB || idA === idB) {
      if (mergeAdjacencyBadge) {
        mergeAdjacencyBadge.textContent = 'একই দাগ নির্বাচন করা হয়েছে';
        mergeAdjacencyBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30';
      }
      if (mergePlotAArea) mergePlotAArea.textContent = '০.০০০ শতক';
      if (mergePlotBArea) mergePlotBArea.textContent = '০.০০০ শতক';
      if (mergeTotalArea) mergeTotalArea.textContent = '০.০০০ শতক (০ কাঠা)';
      if (mergeTotalSqft) mergeTotalSqft.textContent = '০.০ বর্গফুট';
      return;
    }

    const areaA_sqLink = Math.abs(calculatePolygonArea(plotA.vertices));
    const areaB_sqLink = Math.abs(calculatePolygonArea(plotB.vertices));

    const shotokA = (areaA_sqLink * SQFT_PER_SQLINK / SQFT_PER_SHOTOK);
    const shotokB = (areaB_sqLink * SQFT_PER_SQLINK / SQFT_PER_SHOTOK);
    const totalShotok = shotokA + shotokB;
    const totalKatha = totalShotok / 1.65;
    const totalSqft = (areaA_sqLink + areaB_sqLink) * SQFT_PER_SQLINK;

    if (mergePlotAArea) mergePlotAArea.textContent = `${toBanglaDigits(shotokA.toFixed(3))} শতক`;
    if (mergePlotBArea) mergePlotBArea.textContent = `${toBanglaDigits(shotokB.toFixed(3))} শতক`;
    if (mergeTotalArea) mergeTotalArea.textContent = `${toBanglaDigits(totalShotok.toFixed(3))} শতক (${toBanglaDigits(totalKatha.toFixed(2))} কাঠা)`;
    if (mergeTotalSqft) mergeTotalSqft.textContent = `${toBanglaDigits(totalSqft.toFixed(1))} বর্গফুট`;

    const adj = window.LSCAD?.PlotOps?.checkPlotsAdjacency 
      ? window.LSCAD.PlotOps.checkPlotsAdjacency(plotA.vertices, plotB.vertices)
      : { isAdjacent: true };

    if (mergeAdjacencyBadge) {
      if (adj.isAdjacent) {
        mergeAdjacencyBadge.innerHTML = `<span class="flex items-center gap-1">✅ সংলগ্ন দাগ (সাধারণ আইল পাওয়া গেছে)</span>`;
        mergeAdjacencyBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold';
      } else {
        mergeAdjacencyBadge.innerHTML = `<span class="flex items-center gap-1">⚠️ সংলগ্ন নয় (কোনো সাধারণ আইল স্পর্শ করেনি)</span>`;
        mergeAdjacencyBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold';
      }
    }

    if (mergeOutputName) {
      mergeOutputName.value = `${plotA.name}+${plotB.name.replace(/^(দাগ নং|দাগ)\s*/, '')}`;
    }
  }

  function executePlotMerge(plotIdA, plotIdB, customName = null) {
    if (!plotIdA || !plotIdB || plotIdA === plotIdB) {
      showToast('মার্জ করার জন্য দুটি ভিন্ন দাগ নির্বাচন করুন!', 'warning');
      return false;
    }

    const plotA = state.plots.find(p => p.id === plotIdA);
    const plotB = state.plots.find(p => p.id === plotIdB);

    if (!plotA || !plotB) {
      showToast('নির্বাচিত দাগের তথ্য খুঁজে পাওয়া যায়নি!', 'error');
      return false;
    }

    // Call union engine from LSCAD.PlotOps
    const unionRes = window.LSCAD?.PlotOps?.unionCadastralPlots(plotA.vertices, plotB.vertices);

    if (!unionRes || !unionRes.success) {
      const reason = unionRes?.reason || 'দাগ দুটি পরস্পর সংলগ্ন বা স্পর্শ করা অবস্থায় নেই!';
      showToast(reason, 'error');
      return false;
    }

    const outputName = customName || mergeOutputName?.value || `${plotA.name}+${plotB.name.replace(/^(দাগ নং|দাগ)\s*/, '')}`;

    const mergedPlot = {
      id: 'plot_' + Date.now(),
      name: outputName,
      vertices: unionRes.vertices,
      strokeColor: plotA.strokeColor || '#f59e0b',
      fillColor: plotA.fillColor || 'rgba(245, 158, 11, 0.18)',
      layer: plotA.layer || 'plots',
      createdAt: new Date().toISOString()
    };

    // Remove Plot A and Plot B
    state.plots = state.plots.filter(p => p.id !== plotIdA && p.id !== plotIdB);
    // Add Merged Plot
    state.plots.push(mergedPlot);
    state.selectedPlotId = mergedPlot.id;
    state.mergeSelectedPlots = [];

    pushHistory();
    updateInspector();
    render();

    if (plotMergeModal) plotMergeModal.classList.add('hidden');
    drawHintBox.classList.add('opacity-0');
    playCadSound('merge');

    const totalShotok = (unionRes.area * SQFT_PER_SQLINK / SQFT_PER_SHOTOK).toFixed(3);
    showToast(`দাগ সফলভাবে একত্রিত ও মাঝের আইল অপসারিত হয়েছে! (${outputName} • ${toBanglaDigits(totalShotok)} শতক)`, 'success');
    return true;
  }
  window.applyPlotMerge = executePlotMerge;

  function startInteractiveMerge() {
    state.tool = 'merge';
    state.mergeSelectedPlots = [];
    updateToolUI();
    if (plotMergeModal) plotMergeModal.classList.add('hidden');
    drawHintBox.classList.remove('opacity-0');
    drawHintText.innerHTML = '<span class="text-fuchsia-400 font-bold">[প্লট মার্জ টুল]</span> ক্যানভাসে ১ম দাগের ওপর ক্লিক করুন';
    showToast('প্লট মার্জ টুল অন! ক্যানভাসে ১ম দাগে ক্লিক করুন', 'info');
    render();
  }

  // =========================================================================
  // Wire Action Buttons (3 Distinct, Non-overlapping Actions + Modules 18 & 20)
  // =========================================================================

  // Module 18 Ribbon & Inspector Buttons
  document.getElementById('btnRibbonAutoNumber')?.addEventListener('click', openAutoNumberModal);
  document.getElementById('btnInspectorOpenAutoNumber')?.addEventListener('click', openAutoNumberModal);
  if (btnCloseAutoNumberModal) {
    btnCloseAutoNumberModal.addEventListener('click', () => {
      autoNumberModal?.classList.add('hidden');
    });
  }
  if (btnStartInteractiveNumbering) {
    btnStartInteractiveNumbering.addEventListener('click', startInteractiveAutoNumbering);
  }
  if (btnBatchSequenceAll) {
    btnBatchSequenceAll.addEventListener('click', batchSequenceAllPlots);
  }
  if (btnCheckDuplicates) {
    btnCheckDuplicates.addEventListener('click', checkDuplicatePlotNumbers);
  }
  if (btnResolveDuplicates) {
    btnResolveDuplicates.addEventListener('click', resolveDuplicatePlotNumbers);
  }

  // Module 20 Ribbon & Inspector Buttons
  document.getElementById('btnRibbonMergePlots')?.addEventListener('click', () => openPlotMergeModal());
  document.getElementById('btnInspectorOpenMerge')?.addEventListener('click', () => openPlotMergeModal(state.selectedPlotId));
  if (btnClosePlotMergeModal) {
    btnClosePlotMergeModal.addEventListener('click', () => {
      plotMergeModal?.classList.add('hidden');
    });
  }
  if (btnStartInteractiveMerge) {
    btnStartInteractiveMerge.addEventListener('click', startInteractiveMerge);
  }
  if (btnExecuteMergePlots) {
    btnExecuteMergePlots.addEventListener('click', () => {
      executePlotMerge(mergePlotASelect?.value, mergePlotBSelect?.value, mergeOutputName?.value);
    });
  }
  if (mergePlotASelect) {
    mergePlotASelect.addEventListener('change', updatePlotMergePreview);
  }
  if (mergePlotBSelect) {
    mergePlotBSelect.addEventListener('change', updatePlotMergePreview);
  }

  // Load Demo Plots for Auto Numbering
  document.getElementById('btnLoadDemoPlotsForAutoNumber')?.addEventListener('click', () => {
    state.plots = [
      { id: 'plot_demo_1', name: 'দাগ ৫০১', vertices: [{x: 200, y: 150}, {x: 380, y: 150}, {x: 380, y: 350}, {x: 200, y: 350}], strokeColor: '#38bdf8', fillColor: 'rgba(56, 189, 248, 0.2)', layer: 'plots' },
      { id: 'plot_demo_2', name: 'দাগ ৫০১', vertices: [{x: 380, y: 150}, {x: 560, y: 150}, {x: 560, y: 350}, {x: 380, y: 350}], strokeColor: '#10b981', fillColor: 'rgba(16, 185, 129, 0.2)', layer: 'plots' },
      { id: 'plot_demo_3', name: 'দাগ ৫০৩', vertices: [{x: 560, y: 150}, {x: 740, y: 150}, {x: 740, y: 350}, {x: 560, y: 350}], strokeColor: '#f59e0b', fillColor: 'rgba(245, 158, 11, 0.2)', layer: 'plots' }
    ];
    state.selectedPlotId = 'plot_demo_1';
    document.getElementById('canvasEmptyState')?.classList.add('hidden');
    document.getElementById('autoNumberEmptyPlotsNotice')?.classList.add('hidden');
    pushHistory();
    updateInspector();
    render();
    resetFitView();
    checkDuplicatePlotNumbers();
    showToast('ডেমো ৩টি দাগ লোড করা হয়েছে (ডুপ্লিকেট অডিট ও নাম্বারিং পরীক্ষার জন্য প্রস্তুত)!', 'success');
  });

  // Load Demo Adjacent Plots for Plot Merge
  document.getElementById('btnLoadDemoPlotsForMerge')?.addEventListener('click', () => {
    state.plots = [
      { id: 'plot_m_1', name: 'দাগ নং ৫০১', vertices: [{x: 250, y: 180}, {x: 480, y: 180}, {x: 480, y: 380}, {x: 250, y: 380}], strokeColor: '#38bdf8', fillColor: 'rgba(56, 189, 248, 0.2)', layer: 'plots' },
      { id: 'plot_m_2', name: 'দাগ নং ৫০২', vertices: [{x: 480, y: 180}, {x: 710, y: 180}, {x: 710, y: 380}, {x: 480, y: 380}], strokeColor: '#10b981', fillColor: 'rgba(16, 185, 129, 0.2)', layer: 'plots' }
    ];
    state.selectedPlotId = 'plot_m_1';
    document.getElementById('canvasEmptyState')?.classList.add('hidden');
    document.getElementById('mergeEmptyPlotsNotice')?.classList.add('hidden');
    pushHistory();
    updateInspector();
    render();
    resetFitView();
    populateMergePlotSelects('plot_m_1');
    updatePlotMergePreview();
    showToast('ডেমো ২টি সংলগ্ন দাগ (৫০১ ও ৫০২) তৈরি করা হয়েছে!', 'success');
  });

  // ==========================================
  // MODULE 11: Digital Pantograph Proportional Scaling
  // ==========================================
  const pantographModal = document.getElementById('pantographModal');
  const btnClosePantographModal = document.getElementById('btnClosePantographModal');
  const btnRibbonPantograph = document.getElementById('btnRibbonPantograph');
  const btnExecutePantograph = document.getElementById('btnExecutePantograph');
  const selPantographTargetScale = document.getElementById('selPantographTargetScale');
  const pantographCustomFactorRow = document.getElementById('pantographCustomFactorRow');
  const inpPantographCustomFactor = document.getElementById('inpPantographCustomFactor');
  const selPantographScope = document.getElementById('selPantographScope');
  const selPantographAnchor = document.getElementById('selPantographAnchor');
  const pantographCurrentScaleDisplay = document.getElementById('pantographCurrentScaleDisplay');
  const pantographFactorBadge = document.getElementById('pantographFactorBadge');
  const pantographLengthChange = document.getElementById('pantographLengthChange');
  const pantographAreaMultiplier = document.getElementById('pantographAreaMultiplier');

  function openPantographModal() {
    if (!pantographModal) return;
    if (!state.plots || state.plots.length === 0) {
      showToast('প্যান্টোগ্রাফ স্কেলিং করার জন্য প্রথমে নকশায় দাগ আঁকুন বা লোড করুন!', 'warning');
    }
    const curScale = state.scalePreset || '16_inch';
    const scaleNames = {
      '16_inch': '১৬" = ১ মাইল (16 inch)',
      '32_inch': '৩২" = ১ মাইল (32 inch)',
      '64_inch': '৬৪" = ১ মাইল (64 inch)',
      '80_inch': '৮০" = ১ মাইল (80 inch)',
      '4_inch': '৪" = ১ মাইল (4 inch)'
    };
    if (pantographCurrentScaleDisplay) {
      pantographCurrentScaleDisplay.textContent = scaleNames[curScale] || '১৬" = ১ মাইল (16 inch)';
    }

    updatePantographPreview();
    pantographModal.classList.remove('hidden');
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }
  window.openPantographModal = openPantographModal;

  function getSelectedPantographFactor() {
    const val = selPantographTargetScale?.value;
    if (val === 'custom') {
      const customVal = parseFloat(inpPantographCustomFactor?.value);
      return (!isNaN(customVal) && customVal > 0) ? customVal : 1.0;
    }
    return parseFloat(val) || 2.0;
  }

  function updatePantographPreview() {
    const factor = getSelectedPantographFactor();
    const isCustom = selPantographTargetScale?.value === 'custom';
    if (pantographCustomFactorRow) {
      pantographCustomFactorRow.classList.toggle('hidden', !isCustom);
    }
    if (pantographFactorBadge) {
      pantographFactorBadge.textContent = `${factor.toFixed(2)}× ${factor >= 1 ? 'এনলার্জমেন্ট' : 'রিডাকশন'}`;
    }
    if (pantographLengthChange) {
      pantographLengthChange.textContent = `${(factor * 100).toFixed(1)}% (${factor.toFixed(2)} গুণ)`;
    }
    if (pantographAreaMultiplier) {
      const areaFactor = factor * factor;
      pantographAreaMultiplier.textContent = `${areaFactor.toFixed(2)}× গুণ (k²)`;
    }
  }

  function executePantographScaling() {
    if (!state.plots || state.plots.length === 0) {
      showToast('স্কেল রূপান্তর করার জন্য কোনো দাগ নেই!', 'warning');
      return;
    }

    const factor = getSelectedPantographFactor();
    if (factor <= 0) {
      showToast('সঠিক স্কেল ফ্যাক্টর দিন!', 'warning');
      return;
    }

    const scope = selPantographScope?.value || 'selected';
    const anchorMode = selPantographAnchor?.value || 'centroid';

    let scaledCount = 0;
    if (scope === 'selected') {
      const targetPlot = state.plots.find(p => p.id === state.selectedPlotId) || state.plots[0];
      if (!targetPlot) {
        showToast('কোনো দাগ নির্বাচন করা নেই!', 'warning');
        return;
      }
      let anchor = null;
      if (anchorMode === 'origin') {
        anchor = { x: 0, y: 0 };
      }
      if (window.LSCAD?.PlotOps?.scalePlotGeometry(targetPlot, factor, anchor)) {
        scaledCount = 1;
      }
    } else {
      let anchor = null;
      if (anchorMode === 'origin') {
        anchor = { x: 0, y: 0 };
      }
      scaledCount = window.LSCAD?.PlotOps?.scaleAllPlotsGeometry(state.plots, factor, anchor) || 0;
    }

    if (scaledCount > 0) {
      pushHistory();
      updateInspector();
      render();
      resetFitView();
      if (pantographModal) pantographModal.classList.add('hidden');
      playCadSound('calibrate');
      showToast(`প্যান্টোগ্রাফ সফল! ${toBanglaDigits(scaledCount)} টি দাগ ${toBanglaDigits(factor.toFixed(2))}× স্কেলে রূপান্তরিত হয়েছে!`, 'success');
    } else {
      showToast('প্যান্টোগ্রাফ স্কেলিং প্রয়োগ ব্যর্থ হয়েছে!', 'error');
    }
  }

  // ==========================================
  // MODULE 21: Boundary Closure & Topology Validation Studio
  // ==========================================
  const topologyModal = document.getElementById('topologyModal');
  const btnCloseTopologyModal = document.getElementById('btnCloseTopologyModal');
  const btnRibbonTopology = document.getElementById('btnRibbonTopology');
  const btnAutoRepairAllTopology = document.getElementById('btnAutoRepairAllTopology');
  const btnRescanTopology = document.getElementById('btnRescanTopology');
  const btnFixGapsOnly = document.getElementById('btnFixGapsOnly');
  const btnFixDuplicatesOnly = document.getElementById('btnFixDuplicatesOnly');
  const btnSimplifyCollinearOnly = document.getElementById('btnSimplifyCollinearOnly');
  const selTopologyTolerance = document.getElementById('selTopologyTolerance');
  const topologyScoreNumber = document.getElementById('topologyScoreNumber');
  const topologyScoreBar = document.getElementById('topologyScoreBar');
  const topologyIssueCountBadge = document.getElementById('topologyIssueCountBadge');
  const topologySummaryText = document.getElementById('topologySummaryText');
  const topologyIssuesCountLabel = document.getElementById('topologyIssuesCountLabel');
  const topologyIssuesList = document.getElementById('topologyIssuesList');

  let lastTopologyAudit = null;

  function openTopologyModal() {
    if (!topologyModal) return;
    runTopologyAudit();
    topologyModal.classList.remove('hidden');
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }
  window.openTopologyModal = openTopologyModal;

  function runTopologyAudit() {
    const tol = parseFloat(selTopologyTolerance?.value) || 10.0;
    if (!state.plots || state.plots.length === 0) {
      lastTopologyAudit = { score: 100, totalIssues: 0, gaps: [], intersections: [], duplicates: [], collinear: [] };
      renderTopologyAuditUI(lastTopologyAudit);
      return;
    }

    if (window.LSCAD?.PlotOps?.checkTopology) {
      lastTopologyAudit = window.LSCAD.PlotOps.checkTopology(state.plots, tol);
    } else {
      lastTopologyAudit = { score: 100, totalIssues: 0, gaps: [], intersections: [], duplicates: [], collinear: [] };
    }
    renderTopologyAuditUI(lastTopologyAudit);
  }

  function renderTopologyAuditUI(audit) {
    if (!audit) return;
    const score = audit.score || 0;
    const total = audit.totalIssues || 0;

    if (topologyScoreNumber) {
      topologyScoreNumber.textContent = toBanglaDigits(score);
      topologyScoreNumber.className = `text-2xl font-extrabold font-mono ${score >= 90 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-rose-400'}`;
    }
    if (topologyScoreBar) {
      const barColor = score >= 90 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-rose-500';
      topologyScoreBar.innerHTML = `<div class="${barColor} h-full transition-all duration-300" style="width: ${score}%;"></div>`;
    }
    if (topologyIssueCountBadge) {
      topologyIssueCountBadge.textContent = `${toBanglaDigits(total)} টি`;
      topologyIssueCountBadge.className = `text-xl font-extrabold font-mono mt-1 ${total === 0 ? 'text-emerald-400' : 'text-rose-400'}`;
    }
    if (topologySummaryText) {
      if (total === 0) {
        topologySummaryText.textContent = 'বাউন্ডারি সম্পূর্ণ ত্রুটিমুক্ত ও নিখুঁত';
        topologySummaryText.className = 'text-[10px] text-emerald-400 mt-2 font-medium';
      } else {
        topologySummaryText.textContent = `${toBanglaDigits(total)} টি জ্যামিতিক অসামঞ্জস্য পাওয়া গেছে`;
        topologySummaryText.className = 'text-[10px] text-amber-300 mt-2 font-medium';
      }
    }
    if (topologyIssuesCountLabel) {
      topologyIssuesCountLabel.textContent = `${toBanglaDigits(total)} টি সমস্যা`;
    }

    if (!topologyIssuesList) return;
    topologyIssuesList.innerHTML = '';

    if (total === 0) {
      const cleanEl = document.createElement('div');
      cleanEl.className = 'p-4 rounded-xl bg-slate-950/40 border border-emerald-500/30 text-center text-emerald-400 text-xs font-medium flex items-center justify-center gap-2';
      cleanEl.innerHTML = `<span>✅ নকশার সকল দাগের বাউন্ডারি সম্পূর্ণ আবদ্ধ, সিল্ড ও টপোলজিক্যালভাবে ত্রুটিমুক্ত।</span>`;
      topologyIssuesList.appendChild(cleanEl);
      return;
    }

    // Render Gaps
    (audit.gaps || []).forEach(g => {
      const item = document.createElement('div');
      item.className = 'p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between text-xs';
      item.innerHTML = `
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0"></span>
          <div class="truncate">
            <span class="font-bold text-rose-300">${g.plotName}</span>
            <span class="text-[10px] text-slate-400 block">${g.message || g.desc || 'সীমানা গ্যাপ'}</span>
          </div>
        </div>
        <button type="button" class="btn-repair-single-plot px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold flex-shrink-0 transition-colors cursor-pointer" data-plot-id="${g.plotId}">
          সিল করুন
        </button>
      `;
      topologyIssuesList.appendChild(item);
    });

    // Render Self-Intersections
    (audit.selfIntersections || audit.intersections || []).forEach(inter => {
      const item = document.createElement('div');
      item.className = 'p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs';
      item.innerHTML = `
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
          <div class="truncate">
            <span class="font-bold text-amber-300">${inter.plotName}</span>
            <span class="text-[10px] text-slate-400 block">${inter.message || inter.desc || 'ক্রসিং বাউন্ডারি'}</span>
          </div>
        </div>
        <span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono flex-shrink-0">সেলফ-ক্রস</span>
      `;
      topologyIssuesList.appendChild(item);
    });

    // Render Overlaps
    (audit.overlaps || []).forEach(ov => {
      const item = document.createElement('div');
      item.className = 'p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between text-xs';
      item.innerHTML = `
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0"></span>
          <div class="truncate">
            <span class="font-bold text-rose-300">${ov.plotNameA} ও ${ov.plotNameB}</span>
            <span class="text-[10px] text-slate-400 block">${ov.message || 'পরস্পর ওভারল্যাপ'}</span>
          </div>
        </div>
        <span class="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono flex-shrink-0">ওভারল্যাপ</span>
      `;
      topologyIssuesList.appendChild(item);
    });

    // Render Duplicates
    (audit.duplicates || []).forEach(dup => {
      const item = document.createElement('div');
      item.className = 'p-2.5 rounded-xl bg-sky-950/30 border border-sky-500/30 flex items-center justify-between text-xs';
      item.innerHTML = `
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0"></span>
          <div class="truncate">
            <span class="font-bold text-sky-300">${dup.plotName}</span>
            <span class="text-[10px] text-slate-400 block">${dup.message || dup.desc || 'ডুপ্লিকেট পয়েন্ট'}</span>
          </div>
        </div>
        <button type="button" class="btn-repair-single-plot px-2 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold flex-shrink-0 transition-colors cursor-pointer" data-plot-id="${dup.plotId}">
          ক্লিন করুন
        </button>
      `;
      topologyIssuesList.appendChild(item);
    });

    // Render Collinear Points
    (audit.collinear || []).forEach(col => {
      const item = document.createElement('div');
      item.className = 'p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between text-xs';
      item.innerHTML = `
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
          <div class="truncate">
            <span class="font-bold text-emerald-300">${col.plotName}</span>
            <span class="text-[10px] text-slate-400 block">${col.message || col.desc || 'অতিরিক্ত পয়েন্ট'}</span>
          </div>
        </div>
        <button type="button" class="btn-repair-single-plot px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold flex-shrink-0 transition-colors cursor-pointer" data-plot-id="${col.plotId}">
          সরলীকরণ
        </button>
      `;
      topologyIssuesList.appendChild(item);
    });

    // Attach click events on single repair buttons
    topologyIssuesList.querySelectorAll('.btn-repair-single-plot').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-plot-id');
        const plot = state.plots.find(p => p.id === pId);
        if (plot && window.LSCAD?.PlotOps?.repairPlotTopology(plot)) {
          pushHistory();
          updateInspector();
          render();
          runTopologyAudit();
          playCadSound('merge');
          showToast(`${plot.name} এর বাউন্ডারি মেরামত সম্পন্ন হয়েছে!`, 'success');
        }
      });
    });
  }

  function executeTopologyAutoRepairAll() {
    if (!state.plots || state.plots.length === 0) {
      showToast('মেরামত করার মতো কোনো দাগ নেই!', 'info');
      return;
    }
    const tol = parseFloat(selTopologyTolerance?.value) || 10.0;
    const repaired = window.LSCAD?.PlotOps?.repairAllPlotsTopology(state.plots, tol) || 0;
    pushHistory();
    updateInspector();
    render();
    runTopologyAudit();
    playCadSound('merge');
    showToast(`১-ক্লিকে মেরামত সম্পন্ন! মোট ${toBanglaDigits(repaired)} টি দাগের টপোলজি সংশোধন করা হয়েছে।`, 'success');
  }

  function executeFixGapsOnly() {
    if (!state.plots || state.plots.length === 0) return;
    const tol = parseFloat(selTopologyTolerance?.value) || 10.0;
    const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
    let count = 0;
    state.plots.forEach(plot => {
      if (plot.vertices && plot.vertices.length > 2) {
        const v = plot.vertices;
        const gap = dist(v[0], v[v.length - 1]);
        if (gap > 0.001 && gap <= tol * 3) {
          v[v.length - 1] = { x: v[0].x, y: v[0].y };
          count++;
        }
      }
    });
    pushHistory();
    render();
    runTopologyAudit();
    playCadSound('merge');
    showToast(`${toBanglaDigits(count)} টি দাগের সীমানা গ্যাপ সিল করা হয়েছে!`, 'success');
  }

  function executeFixDuplicatesOnly() {
    if (!state.plots || state.plots.length === 0) return;
    const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
    let count = 0;
    state.plots.forEach(plot => {
      if (plot.vertices && plot.vertices.length > 3) {
        const cleaned = [];
        for (let i = 0; i < plot.vertices.length; i++) {
          const pt = plot.vertices[i];
          const prev = cleaned[cleaned.length - 1];
          if (!prev || dist(pt, prev) > 0.6) {
            cleaned.push(pt);
          }
        }
        if (cleaned.length < plot.vertices.length) {
          plot.vertices = cleaned;
          count++;
        }
      }
    });
    pushHistory();
    render();
    runTopologyAudit();
    playCadSound('merge');
    showToast(`${toBanglaDigits(count)} টি দাগের অতিরিক্ত ডুপ্লিকেট পয়েন্ট সরানো হয়েছে!`, 'success');
  }

  function executeSimplifyCollinearOnly() {
    if (!state.plots || state.plots.length === 0) return;
    let count = 0;
    state.plots.forEach(plot => {
      if (plot.vertices && plot.vertices.length > 3) {
        const v = plot.vertices;
        const simplified = [];
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
            continue;
          }
          simplified.push(curr);
        }
        if (simplified.length >= 3 && simplified.length < v.length) {
          plot.vertices = simplified;
          count++;
        }
      }
    });
    pushHistory();
    render();
    runTopologyAudit();
    playCadSound('merge');
    showToast(`${toBanglaDigits(count)} টি দাগের সরলরেখা পয়েন্ট স্মুথ করা হয়েছে!`, 'success');
  }

  // Wire Module 11 (Pantograph) Listeners
  btnRibbonPantograph?.addEventListener('click', openPantographModal);
  document.getElementById('btnInspectorPantograph')?.addEventListener('click', openPantographModal);
  btnClosePantographModal?.addEventListener('click', () => pantographModal?.classList.add('hidden'));
  btnExecutePantograph?.addEventListener('click', executePantographScaling);
  selPantographTargetScale?.addEventListener('change', updatePantographPreview);
  inpPantographCustomFactor?.addEventListener('input', updatePantographPreview);

  // Wire Module 21 (Topology) Listeners
  btnRibbonTopology?.addEventListener('click', openTopologyModal);
  document.getElementById('btnInspectorTopology')?.addEventListener('click', openTopologyModal);
  btnCloseTopologyModal?.addEventListener('click', () => topologyModal?.classList.add('hidden'));
  btnAutoRepairAllTopology?.addEventListener('click', executeTopologyAutoRepairAll);
  btnRescanTopology?.addEventListener('click', runTopologyAudit);
  selTopologyTolerance?.addEventListener('change', runTopologyAudit);
  btnFixGapsOnly?.addEventListener('click', executeFixGapsOnly);
  btnFixDuplicatesOnly?.addEventListener('click', executeFixDuplicatesOnly);
  btnSimplifyCollinearOnly?.addEventListener('click', executeSimplifyCollinearOnly);

  // Backdrop click to close modals
  autoNumberModal?.addEventListener('click', e => {
    if (e.target === autoNumberModal) autoNumberModal.classList.add('hidden');
  });
  plotMergeModal?.addEventListener('click', e => {
    if (e.target === plotMergeModal) plotMergeModal.classList.add('hidden');
  });
  pantographModal?.addEventListener('click', e => {
    if (e.target === pantographModal) pantographModal.classList.add('hidden');
  });
  topologyModal?.addEventListener('click', e => {
    if (e.target === topologyModal) topologyModal.classList.add('hidden');
  });

  // ==========================================
  // MODULE 16: Object Properties & Vertex Coordinate Table Studio
  // ==========================================
  const objectPropsModal = document.getElementById('objectPropsModal');
  const btnCloseObjectPropsModal = document.getElementById('btnCloseObjectPropsModal');
  const btnRibbonProps = document.getElementById('btnRibbonProps');
  const btnCopyCoordsTable = document.getElementById('btnCopyCoordsTable');
  const btnExportCoordsCSV = document.getElementById('btnExportCoordsCSV');
  const coordsTableBody = document.getElementById('coordsTableBody');

  let currentPropsPlot = null;
  let currentPropsData = null;

  function openObjectPropsModal() {
    const activePlot = state.plots.find(p => p.id === state.selectedPlotId) || state.plots[0];
    if (!activePlot || !activePlot.vertices || activePlot.vertices.length < 3) {
      showToast('দয়া করে প্রথমে একটি দাগ সিলেক্ট করুন বা অঙ্কন করুন', 'warning');
      return;
    }

    currentPropsPlot = activePlot;
    const vs = activePlot.vertices;
    const area = calculateShoelaceArea(vs);
    const perim = calculatePerimeter(vs);
    const c = calculateCentroid(vs);

    // Compute bounding box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    vs.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    let rawRows = [];
    if (window.LSCAD?.PlotOps?.getPlotVerticesDetailedTable) {
      rawRows = window.LSCAD.PlotOps.getPlotVerticesDetailedTable(activePlot);
    }

    currentPropsData = {
      plotName: activePlot.name,
      areaSqLinks: area,
      areaShotok: (area * SQFT_PER_SQLINK / SQFT_PER_SHOTOK).toFixed(3),
      areaSqft: (area * SQFT_PER_SQLINK).toFixed(1),
      perimeterLinks: perim.toFixed(1),
      perimeterFeet: (perim * FEET_PER_LINK).toFixed(1),
      centroid: c,
      boundingBox: { widthLinks: (maxX - minX).toFixed(1), heightLinks: (maxY - minY).toFixed(1) },
      vertices: rawRows.map((r, i) => ({
        index: i,
        vertexName: `P${i + 1}`,
        xLinks: r.xLinks,
        yLinks: r.yLinks,
        xFeet: r.xFeet,
        yFeet: r.yFeet,
        nextDistLinks: r.distLink,
        nextDistFeet: r.distFeetInch,
        bearingDeg: r.bearing || '0.0°',
        bearingDirection: ''
      }))
    };

    // Populate Header & Summary Cards
    const nameBadge = document.getElementById('propsPlotNameBadge');
    if (nameBadge) nameBadge.textContent = currentPropsPlot.name;
    const totalAreaEl = document.getElementById('propsTotalArea');
    if (totalAreaEl) totalAreaEl.textContent = `${currentPropsData.areaShotok} শতক`;
    const totalSqftEl = document.getElementById('propsTotalSqft');
    if (totalSqftEl) totalSqftEl.textContent = `${currentPropsData.areaSqft} বর্গফুট`;
    const totalPerimEl = document.getElementById('propsTotalPerimeter');
    if (totalPerimEl) totalPerimEl.textContent = `${currentPropsData.perimeterFeet} ফুট`;
    const perimLinksEl = document.getElementById('propsPerimeterLinks');
    if (perimLinksEl) perimLinksEl.textContent = `${currentPropsData.perimeterLinks} লিংক`;
    const centroidEl = document.getElementById('propsCentroid');
    if (centroidEl) centroidEl.textContent = `X: ${currentPropsData.centroid.x.toFixed(1)}, Y: ${currentPropsData.centroid.y.toFixed(1)}`;
    const bboxEl = document.getElementById('propsBoundingBox');
    if (bboxEl) bboxEl.textContent = `${currentPropsData.boundingBox.widthLinks} × ${currentPropsData.boundingBox.heightLinks} lk`;

    // Populate Table Body
    if (coordsTableBody) {
      coordsTableBody.innerHTML = '';
      currentPropsData.vertices.forEach(v => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-cyan-950/30 transition-colors cursor-pointer group';
        tr.innerHTML = `
          <td class="py-2 px-3 font-bold text-white group-hover:text-cyan-400 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>${v.vertexName}</span>
          </td>
          <td class="py-2 px-2 text-cyan-300 font-bold">${v.xLinks}</td>
          <td class="py-2 px-2 text-cyan-300 font-bold">${v.yLinks}</td>
          <td class="py-2 px-2 text-amber-300">${v.xFeet}</td>
          <td class="py-2 px-2 text-amber-300">${v.yFeet}</td>
          <td class="py-2 px-2 text-center text-emerald-400 font-semibold">${v.nextDistLinks} lk (${v.nextDistFeet}')</td>
          <td class="py-2 px-2 text-center text-indigo-300">${v.bearingDeg}° ${v.bearingDirection}</td>
        `;

        // Interactive spotlight on canvas on hover
        tr.addEventListener('mouseenter', () => {
          state.highlightedVertex = {
            x: parseFloat(v.xLinks),
            y: parseFloat(v.yLinks),
            index: v.index,
            name: v.vertexName
          };
          render();
        });
        tr.addEventListener('mouseleave', () => {
          state.highlightedVertex = null;
          render();
        });

        coordsTableBody.appendChild(tr);
      });
    }

    if (objectPropsModal) objectPropsModal.classList.remove('hidden');
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }
  window.openObjectPropsModal = openObjectPropsModal;

  function exportCoordinatesCSV() {
    if (!currentPropsData || !currentPropsData.vertices) {
      showToast('কোনো কোঅর্ডিনেট ডাটা পাওয়া যায়নি', 'warning');
      return;
    }
    let csv = '\uFEFFVertex,X_Links,Y_Links,X_Feet,Y_Feet,Aisle_Length_Links,Aisle_Length_Feet,Bearing_Deg,Bearing_Direction\r\n';
    currentPropsData.vertices.forEach(v => {
      csv += `${v.vertexName},${v.xLinks},${v.yLinks},${v.xFeet},${v.yFeet},${v.nextDistLinks},${v.nextDistFeet},${v.bearingDeg},${v.bearingDirection}\r\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Plot_Coordinates_${currentPropsPlot?.name || 'Survey'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('কোঅর্ডিনেট টেবিল CSV সফলভাবে ডাউনলোড হয়েছে!', 'success');
  }

  function copyCoordinatesTable() {
    if (!currentPropsData || !currentPropsData.vertices) return;
    let tsv = 'Vertex\tX (Links)\tY (Links)\tX (Feet)\tY (Feet)\tLength (Links)\tLength (Feet)\tBearing\r\n';
    currentPropsData.vertices.forEach(v => {
      tsv += `${v.vertexName}\t${v.xLinks}\t${v.yLinks}\t${v.xFeet}\t${v.yFeet}\t${v.nextDistLinks}\t${v.nextDistFeet}\t${v.bearingDeg}° ${v.bearingDirection}\r\n`;
    });
    navigator.clipboard.writeText(tsv).then(() => {
      showToast('কোঅর্ডিনেট টেবিল ক্লিপবোর্ডে কপি হয়েছে (Excel-এ পেস্ট করতে পারবেন)', 'success');
    }).catch(() => {
      showToast('ক্লিপবোর্ড কপি ব্যর্থ হয়েছে', 'error');
    });
  }

  // ==========================================
  // MODULE 17: Geo-Referencing, WGS84 GPS Coordinates & Satellite Overlay Studio
  // ==========================================
  const geoRefModal = document.getElementById('geoRefModal');
  const btnCloseGeoRefModal = document.getElementById('btnCloseGeoRefModal');
  const btnRibbonGeoRef = document.getElementById('btnRibbonGeoRef');
  const btnToggleSatelliteMap = document.getElementById('btnToggleSatelliteMap');
  const sliderSatelliteOpacity = document.getElementById('sliderSatelliteOpacity');
  const valSatelliteOpacity = document.getElementById('valSatelliteOpacity');
  const inpGeoLat = document.getElementById('inpGeoLat');
  const inpGeoLng = document.getElementById('inpGeoLng');
  const btmEasting = document.getElementById('btmEasting');
  const btmNorthing = document.getElementById('btmNorthing');
  const btnDownloadKMLFromGeo = document.getElementById('btnDownloadKMLFromGeo');

  function openGeoRefModal() {
    if (!geoRefModal) return;
    if (inpGeoLat && state.satellite.originGPS) inpGeoLat.value = state.satellite.originGPS.lat;
    if (inpGeoLng && state.satellite.originGPS) inpGeoLng.value = state.satellite.originGPS.lng;
    updateBTMProjectionDisplay();
    updateSatelliteUIState();
    geoRefModal.classList.remove('hidden');
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }
  window.openGeoRefModal = openGeoRefModal;

  function updateBTMProjectionDisplay() {
    const lat = parseFloat(inpGeoLat?.value) || 23.316700;
    const lng = parseFloat(inpGeoLng?.value) || 90.750000;
    state.satellite.originGPS = { lat, lng };

    if (window.LSCAD?.PlotOps?.convertGPSToBTM) {
      const btm = window.LSCAD.PlotOps.convertGPSToBTM(lat, lng);
      if (btmEasting) btmEasting.textContent = `${btm.easting.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m`;
      if (btmNorthing) btmNorthing.textContent = `${btm.northing.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m`;
    }
  }

  function updateSatelliteUIState() {
    if (btnToggleSatelliteMap) {
      if (state.satellite.enabled) {
        btnToggleSatelliteMap.textContent = 'স্যাটেলাইট বন্ধ করুন';
        btnToggleSatelliteMap.className = 'px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer';
      } else {
        btnToggleSatelliteMap.textContent = 'স্যাটেলাইট চালু করুন';
        btnToggleSatelliteMap.className = 'px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer';
      }
    }
    const quickDot = document.getElementById('quickSatelliteDot');
    const quickBtn = document.getElementById('btnQuickToggleSatellite');
    const quickText = document.getElementById('quickSatelliteText');
    if (quickDot && quickBtn) {
      if (state.satellite.enabled) {
        quickDot.className = 'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse';
        quickBtn.classList.add('bg-emerald-950/70', 'border-emerald-500/50', 'text-emerald-300');
        if (quickText) quickText.textContent = 'স্যাটেলাইট চালু';
      } else {
        quickDot.className = 'w-2 h-2 rounded-full bg-slate-500 transition-colors';
        quickBtn.classList.remove('bg-emerald-950/70', 'border-emerald-500/50', 'text-emerald-300');
        if (quickText) quickText.textContent = 'স্যাটেলাইট ভিউ';
      }
    }
    if (sliderSatelliteOpacity) {
      sliderSatelliteOpacity.value = Math.round((state.satellite.opacity || 0.7) * 100);
    }
    if (valSatelliteOpacity) {
      valSatelliteOpacity.textContent = `${Math.round((state.satellite.opacity || 0.7) * 100)}%`;
    }
    if (typeof updateSatProviderUI === 'function') {
      updateSatProviderUI();
    }

    // Quick HUD Bar Synchronizer
    const satBar = document.getElementById('satelliteQuickBar');
    if (satBar) {
      if (state.satellite.enabled) {
        satBar.classList.remove('hidden');
      } else {
        satBar.classList.add('hidden');
      }
    }
    const quickSatOp = document.getElementById('quickSatOpacity');
    const quickSatOpVal = document.getElementById('quickSatOpacityVal');
    const curOp = Math.round((state.satellite.opacity !== undefined ? state.satellite.opacity : 0.65) * 100);
    if (quickSatOp) quickSatOp.value = curOp;
    if (quickSatOpVal) quickSatOpVal.textContent = `${curOp}%`;

    const btnTop = document.getElementById('btnSatLayerTop');
    const btnBottom = document.getElementById('btnSatLayerBottom');
    const btnMultiply = document.getElementById('btnSatPaperMultiply');

    const isUnder = state.satellite.layerPosition === 'bottom';
    const isMultiply = state.satellite.blendMode === 'multiply';

    if (btnTop && btnBottom) {
      if (!isUnder) {
        btnTop.className = 'px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] cursor-pointer transition-colors shadow-sm';
        btnBottom.className = 'px-2 py-1 rounded-lg text-slate-400 hover:text-white font-bold text-[10px] cursor-pointer transition-colors';
      } else {
        btnTop.className = 'px-2 py-1 rounded-lg text-slate-400 hover:text-white font-bold text-[10px] cursor-pointer transition-colors';
        btnBottom.className = 'px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] cursor-pointer transition-colors shadow-sm';
      }
    }

    if (btnMultiply) {
      if (isMultiply) {
        btnMultiply.className = 'px-2.5 py-1 rounded-xl bg-amber-600 text-white font-extrabold text-[10px] shadow-sm flex items-center gap-1 transition-all cursor-pointer shrink-0 ring-1 ring-amber-400';
      } else {
        btnMultiply.className = 'px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-[10px] border border-slate-700 flex items-center gap-1 transition-all cursor-pointer shrink-0';
      }
    }
  }

  function toggleSatelliteOverlay() {
    state.satellite.enabled = !state.satellite.enabled;
    updateSatelliteUIState();
    render();
    playCadSound('snap');
    showToast(state.satellite.enabled ? '🛰️ লাইভ স্যাটেলাইট ওভারলে চালু হয়েছে!' : 'স্যাটেলাইট ওভারলে বন্ধ করা হয়েছে', 'info');
  }

  // AutoCAD 2-Point Georeference Alignment Engine
  // Aligns, scales, and rotates scanned Mouza Map directly onto real-world Satellite & GPS!
  function handleGeoAlignClick(worldX, worldY) {
    const activeMap = getActiveMouzaMap();
    if (!activeMap || !activeMap.loaded) {
      showToast('কোনো মৌজা নকশা লোড করা নেই', 'warning');
      state.geoAlignMode = null;
      drawHintBox.classList.add('opacity-0');
      return;
    }

    if (!state.geoAlignMode || state.geoAlignMode.step === 1) {
      const defaultLat = state.satellite?.originGPS?.lat || 23.3167;
      const defaultLng = state.satellite?.originGPS?.lng || 90.7500;

      showPromptDialog(
        'AutoCAD ALIGN - ১ম পয়েন্টের GPS কোঅর্ডিনেট দিন',
        'অক্ষাংশ, দ্রাঘিমাংশ (যেমন: 23.3167, 90.7500)',
        `${defaultLat}, ${defaultLng}`,
        gpsStr => {
          if (!gpsStr) {
            showToast('অ্যালাইনমেন্ট বাতিল করা হয়েছে', 'info');
            state.geoAlignMode = null;
            drawHintBox.classList.add('opacity-0');
            return;
          }
          const parts = gpsStr.split(/[,;\s]+/).map(parseFloat).filter(n => !isNaN(n));
          const lat = parts[0] || defaultLat;
          const lng = parts[1] || defaultLng;

          state.geoAlignMode = {
            active: true,
            step: 2,
            p1: { worldX, worldY, lat, lng }
          };

          drawHintBox.classList.remove('opacity-0');
          drawHintText.innerHTML = '<span class="text-amber-400 font-bold">[AutoCAD ALIGN ধাপ ২/২]</span> মৌজা নকশার ২য় পরিচিত পয়েন্টে (যেমন: অন্য প্রান্তের মোড় বা পুকুর) ক্লিক করুন';
          playCadSound('beep');
          render();
        }
      );
    } else if (state.geoAlignMode.step === 2) {
      const p1 = state.geoAlignMode.p1;
      const p2World = { x: worldX, y: worldY };
      const mapDist = Math.hypot(p2World.x - p1.worldX, p2World.y - p1.worldY);
      if (mapDist < 20) {
        showToast('২য় পয়েন্টটি ১ম পয়েন্টের খুব কাছে। দূরবর্তী অন্য পয়েন্ট নির্বাচন করুন।', 'error');
        return;
      }

      const dLat = (p2World.y - p1.worldY) / 550000;
      const dLng = (p2World.x - p1.worldX) / 505000;
      const defLat2 = (p1.lat - dLat).toFixed(6);
      const defLng2 = (p1.lng + dLng).toFixed(6);

      showPromptDialog(
        'AutoCAD ALIGN - ২য় পয়েন্টের GPS কোঅর্ডিনেট দিন',
        'অক্ষাংশ, দ্রাঘিমাংশ (যেমন: 23.3180, 90.7520)',
        `${defLat2}, ${defLng2}`,
        gpsStr => {
          if (!gpsStr) {
            showToast('অ্যালাইনমেন্ট বাতিল করা হয়েছে', 'info');
            state.geoAlignMode = null;
            drawHintBox.classList.add('opacity-0');
            return;
          }
          const parts = gpsStr.split(/[,;\s]+/).map(parseFloat).filter(n => !isNaN(n));
          const lat2 = parts[0] || parseFloat(defLat2);
          const lng2 = parts[1] || parseFloat(defLng2);

          const originGPS = { lat: p1.lat, lng: p1.lng };
          state.satellite.originGPS = originGPS;
          if (inpGeoLat) inpGeoLat.value = p1.lat;
          if (inpGeoLng) inpGeoLng.value = p1.lng;

          const targetX1 = 0;
          const targetY1 = 0;
          const targetX2 = (lng2 - p1.lng) * 505000;
          const targetY2 = -(lat2 - p1.lat) * 550000;

          const targetDist = Math.hypot(targetX2 - targetX1, targetY2 - targetY1);
          const S = targetDist > 0 ? (targetDist / mapDist) : 1;

          const mapAngle = Math.atan2(p2World.y - p1.worldY, p2World.x - p1.worldX);
          const targetAngle = Math.atan2(targetY2 - targetY1, targetX2 - targetX1);
          const rotDeltaDeg = (targetAngle - mapAngle) * (180 / Math.PI);

          const oldW = activeMap.width;
          const oldH = activeMap.height;
          const oldX = activeMap.x;
          const oldY = activeMap.y;

          activeMap.width = oldW * S;
          activeMap.height = oldH * S;
          activeMap.rotation = ((activeMap.rotation || 0) + rotDeltaDeg) % 360;

          activeMap.x = targetX1 - (p1.worldX - oldX) * S;
          activeMap.y = targetY1 - (p1.worldY - oldY) * S;

          state.satellite.enabled = true;
          state.satellite.opacity = 0.6;
          updateSatelliteUIState();

          state.geoAlignMode = null;
          drawHintBox.classList.add('opacity-0');
          pushHistory();
          render();
          playCadSound('calibrate');
          showToast('✓ মৌজা নকশা সফলভাবে স্যাটেলাইট ও GPS-এ নিখুঁতভাবে বসে গেছে (AutoCAD Georeferenced)!', 'success');
        }
      );
    }
  }

  // ==========================================
  // MODULE 19 Extension: Exact Area Cut-Off Studio
  // ==========================================
  const exactCutModal = document.getElementById('exactCutModal');
  const btnCloseExactCutModal = document.getElementById('btnCloseExactCutModal');
  const btnOpenExactCutModal = document.getElementById('btnOpenExactCutModal');
  const exactCutPlotName = document.getElementById('exactCutPlotName');
  const exactCutTotalArea = document.getElementById('exactCutTotalArea');
  const inpExactCutAmount = document.getElementById('inpExactCutAmount');
  const selExactCutUnit = document.getElementById('selExactCutUnit');
  const selExactCutSide = document.getElementById('selExactCutSide');
  const previewCutPlotA = document.getElementById('previewCutPlotA');
  const previewCutPlotB = document.getElementById('previewCutPlotB');
  const btnExecuteExactCut = document.getElementById('btnExecuteExactCut');

  function openExactCutModal() {
    const activePlot = state.plots.find(p => p.id === state.selectedPlotId) || state.plots[0];
    if (!activePlot || !activePlot.vertices || activePlot.vertices.length < 3) {
      showToast('দয়া করে প্রথমে একটি দাগ সিলেক্ট করুন বা অঙ্কন করুন', 'warning');
      return;
    }
    const area = calculateShoelaceArea(activePlot.vertices);
    const totalShotok = area * SQFT_PER_SQLINK / SQFT_PER_SHOTOK;

    if (exactCutPlotName) exactCutPlotName.textContent = activePlot.name;
    if (exactCutTotalArea) exactCutTotalArea.textContent = `${totalShotok.toFixed(3)} শতক`;
    if (inpExactCutAmount) {
      inpExactCutAmount.max = (totalShotok * 0.98).toFixed(2);
      inpExactCutAmount.value = Math.max(0.1, (totalShotok * 0.35).toFixed(2));
    }

    updateExactCutPreview();
    if (exactCutModal) exactCutModal.classList.remove('hidden');
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }
  window.openExactCutModal = openExactCutModal;

  function updateExactCutPreview() {
    const activePlot = state.plots.find(p => p.id === state.selectedPlotId) || state.plots[0];
    if (!activePlot) return;
    const totalAreaSqLinks = calculateShoelaceArea(activePlot.vertices);
    const totalShotok = totalAreaSqLinks * SQFT_PER_SQLINK / SQFT_PER_SHOTOK;

    const val = parseFloat(inpExactCutAmount?.value) || 0;
    const unit = selExactCutUnit?.value || 'shotok';
    let targetShotok = val;
    if (unit === 'katha') targetShotok = val * 1.652893;
    else if (unit === 'sqft') targetShotok = val / 435.6;

    const remShotok = Math.max(0, totalShotok - targetShotok);
    const baseName = activePlot.name.replace(/ \(\/[কখ]\)/, '');

    if (previewCutPlotA) previewCutPlotA.textContent = `${targetShotok.toFixed(3)} শতক (${baseName}/ক)`;
    if (previewCutPlotB) previewCutPlotB.textContent = `${remShotok.toFixed(3)} শতক (${baseName}/খ)`;
  }

  function executeExactAreaCut() {
    const activePlot = state.plots.find(p => p.id === state.selectedPlotId) || state.plots[0];
    if (!activePlot || !activePlot.vertices || activePlot.vertices.length < 3) return;

    const val = parseFloat(inpExactCutAmount?.value) || 0;
    const unit = selExactCutUnit?.value || 'shotok';
    let targetAreaSqLink = 0;

    // Convert unit to sq. links: 1 sq. link = 0.4356 sq. ft, 1 shotok = 435.6 sq. ft = 1000 sq. links
    if (unit === 'shotok') {
      targetAreaSqLink = val * 1000;
    } else if (unit === 'katha') {
      targetAreaSqLink = val * 1.652893 * 1000;
    } else if (unit === 'sqft') {
      targetAreaSqLink = val / 0.4356;
    }

    const side = selExactCutSide?.value || 'north';
    if (!window.LSCAD?.PlotOps?.cutPolygonExactArea) {
      showToast('কাটিং ইঞ্জিন লোড করা যায়নি', 'error');
      return;
    }

    const res = window.LSCAD.PlotOps.cutPolygonExactArea(activePlot.vertices, targetAreaSqLink, side);
    if (!res || !res.success) {
      showToast(res?.reason || 'নির্দিষ্ট শতক কর্তন সম্পন্ন করা যায়নি', 'warning');
      return;
    }

    const baseName = activePlot.name.replace(/ \(\/[কখ]\)/, '');
    const newPlotA = {
      id: `plot_${Date.now()}_1`,
      name: `${baseName}/ক`,
      layer: 'plots',
      fillColor: 'rgba(16, 185, 129, 0.25)',
      strokeColor: '#10b981',
      strokeWidth: 2,
      vertices: res.targetPoly
    };

    const newPlotB = {
      id: `plot_${Date.now()}_2`,
      name: `${baseName}/খ`,
      layer: 'plots',
      fillColor: 'rgba(56, 189, 248, 0.25)',
      strokeColor: '#38bdf8',
      strokeWidth: 2,
      vertices: res.otherPoly
    };

    state.plots = state.plots.filter(p => p.id !== activePlot.id);
    state.plots.push(newPlotA, newPlotB);
    state.selectedPlotId = newPlotA.id;

    pushHistory();
    updateInspector();
    render();
    if (exactCutModal) exactCutModal.classList.add('hidden');
    playCadSound('split');
    showToast(`সফলভাবে ${(targetAreaSqLink / 1000).toFixed(2)} শতক জমি নিখুঁতভাবে কর্তন করা হয়েছে!`, 'success');
  }

  // ==========================================
  // MODULE 19 Extension: Islamic Faraez Inheritance Partitioning Studio
  // ==========================================
  const faraezModal = document.getElementById('faraezModal');
  const btnCloseFaraezModal = document.getElementById('btnCloseFaraezModal');
  const btnOpenFaraezModal = document.getElementById('btnOpenFaraezModal');
  const faraezPlotName = document.getElementById('faraezPlotName');
  const faraezTotalShotok = document.getElementById('faraezTotalShotok');
  const inpFaraezWife = document.getElementById('inpFaraezWife');
  const inpFaraezSon = document.getElementById('inpFaraezSon');
  const inpFaraezDaughter = document.getElementById('inpFaraezDaughter');
  const chkFaraezFather = document.getElementById('chkFaraezFather');
  const chkFaraezMother = document.getElementById('chkFaraezMother');
  const faraezShareTableBody = document.getElementById('faraezShareTableBody');
  const btnExecuteFaraezPartition = document.getElementById('btnExecuteFaraezPartition');

  let currentFaraezShares = [];

  function openFaraezModal() {
    const activePlot = state.plots.find(p => p.id === state.selectedPlotId) || state.plots[0];
    if (!activePlot || !activePlot.vertices || activePlot.vertices.length < 3) {
      showToast('দয়া করে প্রথমে একটি দাগ সিলেক্ট করুন বা অঙ্কন করুন', 'warning');
      return;
    }
    const area = calculateShoelaceArea(activePlot.vertices);
    const totalShotok = area * SQFT_PER_SQLINK / SQFT_PER_SHOTOK;

    if (faraezPlotName) faraezPlotName.textContent = activePlot.name;
    if (faraezTotalShotok) faraezTotalShotok.textContent = `${totalShotok.toFixed(3)} শতক`;

    updateFaraezCalculation();
    if (faraezModal) faraezModal.classList.remove('hidden');
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }
  window.openFaraezModal = openFaraezModal;

  function updateFaraezCalculation() {
    const activePlot = state.plots.find(p => p.id === state.selectedPlotId) || state.plots[0];
    if (!activePlot) return;
    const totalShotok = calculateShoelaceArea(activePlot.vertices) * SQFT_PER_SQLINK / SQFT_PER_SHOTOK;

    const wifeCount = parseInt(inpFaraezWife?.value) || 0;
    const sonCount = parseInt(inpFaraezSon?.value) || 0;
    const daughterCount = parseInt(inpFaraezDaughter?.value) || 0;
    const fatherPresent = chkFaraezFather?.checked || false;
    const motherPresent = chkFaraezMother?.checked || false;

    if (window.LSCAD?.PlotOps?.calculateIslamicFaraez) {
      currentFaraezShares = window.LSCAD.PlotOps.calculateIslamicFaraez(totalShotok, {
        wifeCount,
        sonCount,
        daughterCount,
        fatherPresent,
        motherPresent
      });
    } else {
      currentFaraezShares = [];
    }

    if (faraezShareTableBody) {
      faraezShareTableBody.innerHTML = '';
      currentFaraezShares.forEach(s => {
        const kathaPart = Math.floor(s.katha);
        const shotokRem = ((s.shotok % 1.652893)).toFixed(1);
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-indigo-950/30 transition-colors';
        tr.innerHTML = `
          <td class="py-2 px-3 font-bold text-white flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>${s.relation}</span>
          </td>
          <td class="py-2 px-2 text-indigo-300 font-bold">${s.fractionStr}</td>
          <td class="py-2 px-2 text-amber-300 font-bold">${s.shotok.toFixed(3)} শতক</td>
          <td class="py-2 px-2 text-sky-300">${kathaPart} কাঠা ${shotokRem} শতক</td>
          <td class="py-2 px-2 text-right font-bold text-emerald-400">${s.percent}%</td>
        `;
        faraezShareTableBody.appendChild(tr);
      });
    }
  }

  function executeFaraezPartition() {
    const activePlot = state.plots.find(p => p.id === state.selectedPlotId) || state.plots[0];
    if (!activePlot || !activePlot.vertices || activePlot.vertices.length < 3) return;
    if (!currentFaraezShares || currentFaraezShares.length === 0) {
      showToast('ওয়ারিশ হিস্যা পাওয়া যায়নি', 'warning');
      return;
    }

    const vs = activePlot.vertices;
    const minX = Math.min(...vs.map(v => v.x));
    const maxX = Math.max(...vs.map(v => v.x));
    const minY = Math.min(...vs.map(v => v.y));
    const maxY = Math.max(...vs.map(v => v.y));
    const totalW = maxX - minX;

    const baseName = activePlot.name.replace(/ \(.*\)/, '');
    const subColors = [
      { fill: 'rgba(99, 102, 241, 0.25)', stroke: '#6366f1' },
      { fill: 'rgba(16, 185, 129, 0.25)', stroke: '#10b981' },
      { fill: 'rgba(245, 158, 11, 0.25)', stroke: '#f59e0b' },
      { fill: 'rgba(56, 189, 248, 0.25)', stroke: '#38bdf8' },
      { fill: 'rgba(236, 72, 153, 0.25)', stroke: '#ec4899' },
      { fill: 'rgba(168, 85, 247, 0.25)', stroke: '#a855f7' }
    ];

    state.plots = state.plots.filter(p => p.id !== activePlot.id);

    let currentX = minX;
    currentFaraezShares.forEach((share, idx) => {
      const partW = totalW * share.fraction;
      const nextX = (idx === currentFaraezShares.length - 1) ? maxX : currentX + partW;

      const subVertices = [
        { x: currentX, y: minY },
        { x: nextX, y: minY },
        { x: nextX, y: maxY },
        { x: currentX, y: maxY }
      ];

      const color = subColors[idx % subColors.length];
      state.plots.push({
        id: `plot_faraez_${Date.now()}_${idx + 1}`,
        name: `${baseName} (${share.relation})`,
        layer: 'plots',
        fillColor: color.fill,
        strokeColor: color.stroke,
        strokeWidth: 2,
        vertices: subVertices
      });

      currentX = nextX;
    });

    state.selectedPlotId = state.plots[state.plots.length - 1].id;
    pushHistory();
    updateInspector();
    render();
    if (faraezModal) faraezModal.classList.add('hidden');
    playCadSound('merge');
    showToast('ইসলামিক ফারায়েজ অনুযায়ী ওয়ারিশদের দাগ সফলভাবে বন্টন করা হয়েছে!', 'success');
  }

  // Wire Listeners for Module 16
  btnRibbonProps?.addEventListener('click', openObjectPropsModal);
  document.getElementById('btnInspectorProps')?.addEventListener('click', openObjectPropsModal);
  btnCloseObjectPropsModal?.addEventListener('click', () => {
    objectPropsModal?.classList.add('hidden');
    state.highlightedVertex = null;
    render();
  });
  btnExportCoordsCSV?.addEventListener('click', exportCoordinatesCSV);
  btnCopyCoordsTable?.addEventListener('click', copyCoordinatesTable);

  // Wire Listeners for Module 17
  btnRibbonGeoRef?.addEventListener('click', openGeoRefModal);
  document.getElementById('btnPickGpsOnCanvas')?.addEventListener('click', () => {
    geoRefModal?.classList.add('hidden');
    state.tool = 'gps-pin';
    updateToolUI();
    drawHintBox.classList.remove('opacity-0');
    drawHintText.innerHTML = '<span class="text-emerald-400 font-bold">[AutoCAD GPS পিন]</span> ক্যানভাসে নকশার যেকোনো পরিচিত স্থানে ক্লিক করে জিপিএস পিন বসান';
    showToast('ক্যানভাসে ক্লিক করে জিপিএস পিন বসান', 'info');
  });
  document.getElementById('btnInspectorGeoRef')?.addEventListener('click', openGeoRefModal);
  btnCloseGeoRefModal?.addEventListener('click', () => geoRefModal?.classList.add('hidden'));
  btnToggleSatelliteMap?.addEventListener('click', toggleSatelliteOverlay);
  document.getElementById('btnQuickToggleSatellite')?.addEventListener('click', toggleSatelliteOverlay);

  document.getElementById('btnDetectCurrentGPS')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('আপনার ব্রাউজারে লাইভ GPS সাপোর্ট করে না', 'warning');
      return;
    }
    showToast('জিপিএস লোকেশন সনাক্ত করা হচ্ছে...', 'info');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        if (inpGeoLat) inpGeoLat.value = lat;
        if (inpGeoLng) inpGeoLng.value = lng;
        state.satellite.originGPS = { lat, lng };
        updateBTMProjectionDisplay();
        render();
        showToast(`🛰️ লাইভ GPS পাওয়া গেছে: ${lat}°N, ${lng}°E`, 'success');
      },
      err => {
        showToast('GPS লোকেশন এক্সেস পাওয়া যায়নি (ডিফল্ট প্রিসেট সিলেক্ট করুন)', 'warning');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });

  document.querySelectorAll('.geo-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const lat = parseFloat(chip.getAttribute('data-lat'));
      const lng = parseFloat(chip.getAttribute('data-lng'));
      if (inpGeoLat) inpGeoLat.value = lat;
      if (inpGeoLng) inpGeoLng.value = lng;
      state.satellite.originGPS = { lat, lng };
      updateBTMProjectionDisplay();
      render();
      showToast(`📍 এলাকা সেট করা হয়েছে: ${chip.textContent.trim()}`, 'info');
    });
  });

  sliderSatelliteOpacity?.addEventListener('input', e => {
    state.satellite.opacity = parseFloat(e.target.value) / 100;
    if (valSatelliteOpacity) valSatelliteOpacity.textContent = `${e.target.value}%`;
    render();
  });

  // Satellite Provider Switcher Listeners (Module 17)
  function updateSatProviderUI() {
    const activeProvider = state.satellite?.source || 'google_hybrid';
    ['btnSatProvGoogleHybrid', 'btnSatProvGoogleSat', 'btnSatProvEsri'].forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const prov = btn.getAttribute('data-provider');
      if (prov === activeProvider) {
        btn.className = 'px-2 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold border border-emerald-400/50 flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm';
      } else {
        btn.className = 'px-2 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-slate-700';
      }
    });

    const isTransparent = state.satellite?.blendMode !== 'multiply';
    const btnTrans = document.getElementById('btnBlendTransparent');
    const btnMult = document.getElementById('btnBlendMultiply');
    if (btnTrans && btnMult) {
      if (isTransparent) {
        btnTrans.className = 'px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold cursor-pointer transition-colors shadow-sm';
        btnMult.className = 'px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-semibold cursor-pointer hover:bg-slate-700 transition-colors';
      } else {
        btnTrans.className = 'px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-semibold cursor-pointer hover:bg-slate-700 transition-colors';
        btnMult.className = 'px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold cursor-pointer transition-colors shadow-sm';
      }
    }
  }

  document.querySelectorAll('.sat-provider-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prov = btn.getAttribute('data-provider');
      if (prov) {
        state.satellite.source = prov;
        updateSatProviderUI();
        render();
        const provNames = {
          google_hybrid: 'গুগল হাইব্রিড (স্যাটেলাইট + রোড)',
          google_sat: 'গুগল স্যাটেলাইট (হাই রেজুলেশন)',
          esri: 'Esri World Imagery Clarity'
        };
        showToast(`🛰️ স্যাটেলাইট প্রোভাইডার: ${provNames[prov] || prov}`, 'info');
      }
    });
  });

  document.getElementById('btnBlendTransparent')?.addEventListener('click', () => {
    state.satellite.blendMode = 'transparent';
    updateSatProviderUI();
    render();
    showToast('মৌজা ওভারলে: স্বচ্ছ ভেক্টর কালি সক্রিয়', 'info');
  });

  document.getElementById('btnBlendMultiply')?.addEventListener('click', () => {
    state.satellite.blendMode = 'multiply';
    updateSatProviderUI();
    render();
    showToast('মৌজা ওভারলে: কাগজের মাল্টিপ্লাই সক্রিয়', 'info');
  });

  // Satellite Quick HUD Bar Action Listeners
  document.getElementById('btnSatLayerTop')?.addEventListener('click', () => {
    state.satellite.layerPosition = 'top';
    state.satellite.blendMode = 'normal';
    updateSatelliteUIState();
    render();
    showToast('🛰️ স্যাটেলাইট ভিউ: নকশার উপরে ওভারলে সক্রিয়', 'info');
  });

  document.getElementById('btnSatLayerBottom')?.addEventListener('click', () => {
    state.satellite.layerPosition = 'bottom';
    updateSatelliteUIState();
    render();
    showToast('🛰️ স্যাটেলাইট ভিউ: নকশার নিচে ব্যাকগ্রাউন্ড সক্রিয়', 'info');
  });

  // Transparent White Paper (Multiply Blend Mode)
  document.getElementById('btnSatPaperMultiply')?.addEventListener('click', () => {
    const willBeMultiply = state.satellite.blendMode !== 'multiply';
    if (willBeMultiply) {
      state.satellite.blendMode = 'multiply';
      state.satellite.layerPosition = 'bottom';
      showToast('✨ সাদা কাগজ স্বচ্ছ করা হয়েছে (কালো দাগগুলো স্যাটেলাইটের উপর ভাসবে)', 'success');
    } else {
      state.satellite.blendMode = 'normal';
      showToast('স্বাভাবিক কাগজ ব্যাকগ্রাউন্ড সক্রিয়', 'info');
    }
    const activeMap = getActiveMouzaMap();
    if (activeMap) activeMap.blendMode = state.satellite.blendMode;
    updateSatelliteUIState();
    render();
  });

  const onQuickSatOpacityChange = e => {
    const val = parseFloat(e.target.value) / 100;
    state.satellite.opacity = val;
    const lbl = document.getElementById('quickSatOpacityVal');
    if (lbl) lbl.textContent = `${e.target.value}%`;
    if (sliderSatelliteOpacity) sliderSatelliteOpacity.value = e.target.value;
    if (valSatelliteOpacity) valSatelliteOpacity.textContent = `${e.target.value}%`;
    render();
  };
  document.getElementById('quickSatOpacity')?.addEventListener('input', onQuickSatOpacityChange);
  document.getElementById('quickSatOpacity')?.addEventListener('change', onQuickSatOpacityChange);

  document.getElementById('btnQuickDropGpsPin')?.addEventListener('click', () => {
    state.tool = (state.tool === 'gps-pin') ? 'select' : 'gps-pin';
    updateToolUI();
    if (state.tool === 'gps-pin') {
      drawHintBox.classList.remove('opacity-0');
      drawHintText.innerHTML = '<span class="text-emerald-400 font-bold">[AutoCAD GPS পিন]</span> ক্যানভাসে নকশার যেকোনো পয়েন্টে ক্লিক করে GPS পিন বসান';
      showToast('📍 ক্যানভাসে নকশার উপর ক্লিক করে GPS পিন বসান', 'info');
    } else {
      drawHintBox.classList.add('opacity-0');
    }
  });

  document.getElementById('btnQuickMoveMap')?.addEventListener('click', () => {
    state.tool = (state.tool === 'map-move') ? 'select' : 'map-move';
    updateToolUI();
    if (state.tool === 'map-move') {
      drawHintBox.classList.remove('opacity-0');
      drawHintText.innerHTML = '<span class="text-cyan-400 font-bold">[নকশা স্থানান্তর]</span> মাউস দিয়ে ড্র্যাগ করে নকশাটিকে স্যাটেলাইটের রোডের সাথে মেলান';
      showToast('✋ মাউস দিয়ে ড্র্যাগ করে নকশাটি সরান', 'info');
    } else {
      drawHintBox.classList.add('opacity-0');
    }
  });

  // Nudge Buttons (20 links / ~13 ft per click)
  const nudgeSheet = (dx, dy, dir) => {
    const sheet = getActiveMouzaMap();
    if (sheet) {
      sheet.x += dx;
      sheet.y += dy;
      state.mouzaMap.x = sheet.x;
      state.mouzaMap.y = sheet.y;
      render();
      playCadSound('snap');
      showToast(`নকশা ${dir} ২০ লিংক সরানো হয়েছে`, 'info');
    }
  };
  document.getElementById('btnNudgeLeft')?.addEventListener('click', () => nudgeSheet(-20, 0, 'বামে'));
  document.getElementById('btnNudgeRight')?.addEventListener('click', () => nudgeSheet(20, 0, 'ডানে'));
  document.getElementById('btnNudgeUp')?.addEventListener('click', () => nudgeSheet(0, -20, 'উপরে'));
  document.getElementById('btnNudgeDown')?.addEventListener('click', () => nudgeSheet(0, 20, 'নিচে'));

  // Scale Adjuster (+3% / -3%)
  document.getElementById('btnScaleMapPlus')?.addEventListener('click', () => {
    const sheet = getActiveMouzaMap();
    if (sheet) {
      sheet.scaleFactor = (sheet.scaleFactor || 1.0) * 1.03;
      sheet.width *= 1.03;
      sheet.height *= 1.03;
      state.mouzaMap.width = sheet.width;
      state.mouzaMap.height = sheet.height;
      render();
      playCadSound('snap');
      showToast(`নকশার স্কেল +৩% বাড়ানো হয়েছে (${Math.round((sheet.scaleFactor || 1) * 100)}%)`, 'info');
    }
  });
  document.getElementById('btnScaleMapMinus')?.addEventListener('click', () => {
    const sheet = getActiveMouzaMap();
    if (sheet) {
      sheet.scaleFactor = (sheet.scaleFactor || 1.0) * 0.97;
      sheet.width *= 0.97;
      sheet.height *= 0.97;
      state.mouzaMap.width = sheet.width;
      state.mouzaMap.height = sheet.height;
      render();
      playCadSound('snap');
      showToast(`নকশার স্কেল -৩% কমানো হয়েছে (${Math.round((sheet.scaleFactor || 1) * 100)}%)`, 'info');
    }
  });

  document.getElementById('quickGpsDistrictSelect')?.addEventListener('change', e => {
    const val = e.target.value;
    if (val === 'custom') {
      openGeoRefModal();
      return;
    }
    const parts = val.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      state.satellite.originGPS = { lat, lng };

      const sheet = getActiveMouzaMap();
      if (sheet) {
        state.satellite.anchorWorld = {
          x: sheet.x + sheet.width / 2,
          y: sheet.y + sheet.height / 2
        };
      }

      if (typeof _satelliteTileCache === 'object') {
        for (const k in _satelliteTileCache) delete _satelliteTileCache[k];
      }
      const inpLat = document.getElementById('inpGeoLat');
      const inpLng = document.getElementById('inpGeoLng');
      if (inpLat) inpLat.value = lat.toFixed(6);
      if (inpLng) inpLng.value = lng.toFixed(6);
      updateBTMProjectionDisplay();
      render();
      const txt = e.target.options[e.target.selectedIndex]?.text || '';
      showToast(`📍 ${txt} জিপিএস সেট সম্পন্ন (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`, 'success');
    }
  });

  document.getElementById('btnCloseSatQuickBar')?.addEventListener('click', () => {
    document.getElementById('satelliteQuickBar')?.classList.add('hidden');
  });
  inpGeoLat?.addEventListener('input', updateBTMProjectionDisplay);
  inpGeoLng?.addEventListener('input', updateBTMProjectionDisplay);
  btnDownloadKMLFromGeo?.addEventListener('click', downloadKML);

  document.getElementById('btnStartAutoCadAlign')?.addEventListener('click', () => {
    geoRefModal?.classList.add('hidden');
    state.geoAlignMode = { active: true, step: 1 };
    drawHintBox.classList.remove('opacity-0');
    drawHintText.innerHTML = '<span class="text-sky-400 font-bold">[AutoCAD ALIGN ধাপ ১/২]</span> মৌজা নকশার ১ম পরিচিত পয়েন্টে (যেমন: রাস্তার মোড় বা মসজিদ) ক্লিক করুন';
    showToast('AutoCAD ALIGN: নকশার ১ম পরিচিত পয়েন্টে ক্লিক করুন', 'info');
  });

  // Wire Listeners for Module 19 Extension (Exact Cut & Faraez)
  btnOpenExactCutModal?.addEventListener('click', openExactCutModal);
  btnCloseExactCutModal?.addEventListener('click', () => exactCutModal?.classList.add('hidden'));
  inpExactCutAmount?.addEventListener('input', updateExactCutPreview);
  selExactCutUnit?.addEventListener('change', updateExactCutPreview);
  selExactCutSide?.addEventListener('change', updateExactCutPreview);
  btnExecuteExactCut?.addEventListener('click', executeExactAreaCut);

  btnOpenFaraezModal?.addEventListener('click', openFaraezModal);
  btnCloseFaraezModal?.addEventListener('click', () => faraezModal?.classList.add('hidden'));
  inpFaraezWife?.addEventListener('input', updateFaraezCalculation);
  inpFaraezSon?.addEventListener('input', updateFaraezCalculation);
  inpFaraezDaughter?.addEventListener('input', updateFaraezCalculation);
  chkFaraezFather?.addEventListener('change', updateFaraezCalculation);
  chkFaraezMother?.addEventListener('change', updateFaraezCalculation);
  btnExecuteFaraezPartition?.addEventListener('click', executeFaraezPartition);

  // Backdrop dismissal for new modals
  objectPropsModal?.addEventListener('click', e => {
    if (e.target === objectPropsModal) {
      objectPropsModal.classList.add('hidden');
      state.highlightedVertex = null;
      render();
    }
  });
  geoRefModal?.addEventListener('click', e => {
    if (e.target === geoRefModal) geoRefModal.classList.add('hidden');
  });
  exactCutModal?.addEventListener('click', e => {
    if (e.target === exactCutModal) exactCutModal.classList.add('hidden');
  });
  faraezModal?.addEventListener('click', e => {
    if (e.target === faraezModal) faraezModal.classList.add('hidden');
  });

  // 1. Top Navbar Button: Full Project Survey Field Report Studio
  if (btnExportReport) {
    btnExportReport.addEventListener('click', () => {
      openReportStudio('all');
    });
  }

  // 2. CAD Ribbon Button: Cartographic Scaled Blueprint Map Sheet Print
  const btnPrintLayout = document.getElementById('btnPrintLayout');
  if (btnPrintLayout) {
    btnPrintLayout.addEventListener('click', openPrintLayoutModal);
  }

  // 3. Right Sidebar Inspector Button: Focused Single-Plot Certificate
  const btnInspectorPrintReport = document.getElementById('btnInspectorPrintReport');
  if (btnInspectorPrintReport) {
    btnInspectorPrintReport.addEventListener('click', () => {
      openReportStudio('selected', state.selectedPlotId);
    });
  }

  // Close modals
  if (btnCloseReportModal) {
    btnCloseReportModal.addEventListener('click', () => {
      reportModal.classList.add('hidden');
    });
  }

  const btnClosePrintLayoutModal = document.getElementById('btnClosePrintLayoutModal');
  if (btnClosePrintLayoutModal) {
    btnClosePrintLayoutModal.addEventListener('click', () => {
      document.getElementById('printLayoutModal')?.classList.add('hidden');
    });
  }

  // Detect Mouza Buttons
  document.getElementById('btnHeaderDetectMouza')?.addEventListener('click', () => {
    detectMouzaAndLocationFromMap(null, true);
  });
  document.getElementById('btnAutoDetectMouza')?.addEventListener('click', () => {
    detectMouzaAndLocationFromMap(null, true);
  });

  // Header Subtitle Click -> Edit Mouza Location Dialog
  document.getElementById('mouzaMapInfoSubtitle')?.addEventListener('click', () => {
    const loc = getActiveMapLocationInfo();
    showPromptDialog('মৌজা ও এলাকা পরিবর্তন করুন', 'মৌজা (জেএল) • থানা, জেলা', `${loc.mouza} (${loc.jl}) • ${loc.upazila}, ${loc.district}`, val => {
      if (val && val.trim()) {
        const subEl = document.getElementById('mouzaMapInfoSubtitle');
        if (subEl) subEl.textContent = `মৌজা: ${val.trim()} • সিট নং: ১`;
        const updatedLoc = getActiveMapLocationInfo();
        const activeMap = (state.mouzaMaps && state.mouzaMaps.find(m => m.id === state.activeMapId)) || state.mouzaMap;
        if (activeMap) activeMap.locationInfo = updatedLoc;
        showToast('মৌজা ও এলাকার বিবরণ আপডেট হয়েছে', 'success');
      }
    });
  });

  // Live input sync for all fields
  const reportInputs = [
    'inpReportDistrict', 'inpReportUpazila', 'inpReportMouza', 'inpReportJl',
    'inpReportKhatian', 'inpReportDaag', 'inpReportOwner', 'inpReportSurveyor',
    'inpReportSurveyorReg', 'inpReportDate', 'inpReportScaleText',
    'inpReportNorthMouza', 'inpReportEastMouza', 'inpReportSouthMouza', 'inpReportWestMouza'
  ];
  reportInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        syncReportLabels();
        // If location inputs are changed, sync back to header
        if (['inpReportDistrict', 'inpReportUpazila', 'inpReportMouza', 'inpReportJl'].includes(id)) {
          const d = document.getElementById('inpReportDistrict')?.value || DEFAULT_MOUZA_KNOWLEDGE.district;
          const u = document.getElementById('inpReportUpazila')?.value || DEFAULT_MOUZA_KNOWLEDGE.upazila;
          const m = document.getElementById('inpReportMouza')?.value || DEFAULT_MOUZA_KNOWLEDGE.mouza;
          const j = document.getElementById('inpReportJl')?.value || DEFAULT_MOUZA_KNOWLEDGE.jl;
          syncLocationToHeader({ district: d, upazila: u, mouza: m, jl: j });
        }
      });
    }
  });

  if (reportViewMode) {
    reportViewMode.addEventListener('change', drawReportMapCanvas);
  }

  if (reportPaperSize) {
    reportPaperSize.addEventListener('change', () => {
      const printable = document.getElementById('printableReport');
      if (!printable) return;
      if (reportPaperSize.value === 'a4_landscape') {
        printable.className = printable.className.replace(/max-w-[a-z0-9]+/g, '') + ' max-w-4xl';
      } else if (reportPaperSize.value === 'a3_landscape') {
        printable.className = printable.className.replace(/max-w-[a-z0-9]+/g, '') + ' max-w-5xl';
      } else {
        printable.className = printable.className.replace(/max-w-[a-z0-9]+/g, '') + ' max-w-2xl';
      }
      drawReportMapCanvas();
    });
  }

  // Print PDF Button
  if (btnPrintReportPdf) {
    btnPrintReportPdf.addEventListener('click', () => {
      window.print();
    });
  }

  // Download High-Res PNG
  if (btnDownloadReportPng) {
    btnDownloadReportPng.addEventListener('click', () => {
      const canvas = document.getElementById('reportMapCanvas');
      if (!canvas) return;
      const daagVal = document.getElementById('inpReportDaag')?.value || 'Survey';
      const link = document.createElement('a');
      link.download = `Noksha_Report_Daag_${daagVal}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('নকশা ইমেজ (PNG) সফলভাবে ডাউনলোড হয়েছে!', 'success');
    });
  }

  // Open / Import .lscad Project File
  const projectFileInput = document.createElement('input');
  projectFileInput.type = 'file';
  projectFileInput.accept = '.lscad,.json';
  projectFileInput.style.display = 'none';
  document.body.appendChild(projectFileInput);

  projectFileInput.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.plots) state.plots = data.plots;
          if (data.pillars) state.pillars = data.pillars;
          if (data.annotations) state.annotations = data.annotations;
          if (data.scalePreset) state.scalePreset = data.scalePreset;
          if (data.unit) state.unit = data.unit;
          if (data.mouzaMap) {
            state.mouzaMap.x = data.mouzaMap.x ?? state.mouzaMap.x;
            state.mouzaMap.y = data.mouzaMap.y ?? state.mouzaMap.y;
            state.mouzaMap.width = data.mouzaMap.width ?? state.mouzaMap.width;
            state.mouzaMap.height = data.mouzaMap.height ?? state.mouzaMap.height;
            state.mouzaMap.opacity = data.mouzaMap.opacity ?? state.mouzaMap.opacity;
            if (data.mouzaMap.filters) state.mouzaMap.filters = data.mouzaMap.filters;
          }
          if (state.plots.length > 0) {
            state.selectedPlotId = state.plots[0].id;
          }
          updateInspector();
          render();
          showToast('প্রজেক্ট ফাইল (.lscad) সফলভাবে লোড হয়েছে!', 'success');
        } catch (err) {
          showToast('ফাইল লোড ত্রুটি: ' + err.message, 'error');
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  });

  const btnOpenProject = document.getElementById('btnOpenProject');
  if (btnOpenProject) {
    btnOpenProject.addEventListener('click', () => {
      projectFileInput.click();
    });
  }

  // Global Helpers for Khatian Calculator
  window.updateKhatianOwnerName = function(idx, name) {
    if (state.khatianOwners[idx]) {
      state.khatianOwners[idx].name = name;
    }
  };

  window.updateKhatianOwnerShare = function(idx, share) {
    if (state.khatianOwners[idx]) {
      state.khatianOwners[idx].share = isNaN(share) ? 0 : share;
      renderKhatianOwnersTable();
    }
  };

  window.deleteKhatianOwner = function(idx) {
    if (state.khatianOwners.length > 1) {
      state.khatianOwners.splice(idx, 1);
      renderKhatianOwnersTable();
    } else {
      showToast('কমপক্ষে একজন মালিকের তথ্য থাকা প্রয়োজন', 'warning');
    }
  };

  function renderKhatianOwnersTable() {
    const tableBody = document.getElementById('khatianOwnersTable');
    if (!tableBody) return;

    const totalShotok = parseFloat(document.getElementById('khatianTotalShotok')?.value) || 10.0;
    let sumShare = 0;
    let rowsHtml = '';

    state.khatianOwners.forEach((owner, idx) => {
      sumShare += owner.share;
      const ownerShotok = totalShotok * owner.share;
      const ownerKatha = ownerShotok / 1.652893;
      const kathaPart = Math.floor(ownerKatha);
      const shotokRem = (ownerShotok % 1.652893).toFixed(1);

      rowsHtml += `
        <tr>
          <td class="py-2 px-3">
            <input type="text" value="${owner.name}" onchange="updateKhatianOwnerName(${idx}, this.value)" class="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-white w-full">
          </td>
          <td class="py-2 px-3">
            <input type="number" step="0.001" min="0" max="1" value="${owner.share.toFixed(3)}" onchange="updateKhatianOwnerShare(${idx}, parseFloat(this.value))" class="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-amber-400 font-bold font-mono w-24">
          </td>
          <td class="py-2 px-3 text-emerald-400 font-bold font-mono">${ownerShotok.toFixed(3)} শতক</td>
          <td class="py-2 px-3 text-sky-400 font-mono">${kathaPart} কাঠা ${shotokRem} শতক</td>
          <td class="py-2 px-2 text-center">
            <button onclick="deleteKhatianOwner(${idx})" class="p-1 text-rose-400 hover:text-rose-300">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = rowsHtml;
    const totalShareSumEl = document.getElementById('khatianTotalShareSum');
    if (totalShareSumEl) {
      const anna = (sumShare * 16).toFixed(1);
      totalShareSumEl.textContent = `${sumShare.toFixed(3)} (${anna} আনা)`;
      totalShareSumEl.classList.toggle('text-rose-400', Math.abs(sumShare - 1.0) > 0.005);
      totalShareSumEl.classList.toggle('text-sky-400', Math.abs(sumShare - 1.0) <= 0.005);
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // Multi-Era CS vs RS Map Comparison Canvas
  function renderCompareCanvas() {
    const cCanvas = document.getElementById('compareCanvas');
    if (!cCanvas) return;
    const cCtx = cCanvas.getContext('2d');
    cCanvas.width = cCanvas.clientWidth || 700;
    cCanvas.height = cCanvas.clientHeight || 350;

    const w = cCanvas.width;
    const h = cCanvas.height;
    const splitPercent = parseFloat(document.getElementById('compareSplitSlider')?.value || 50) / 100;
    const splitX = w * splitPercent;

    cCtx.clearRect(0, 0, w, h);

    // 1. Draw CS Historical Map on Left Side
    cCtx.save();
    cCtx.beginPath();
    cCtx.rect(0, 0, splitX, h);
    cCtx.clip();

    cCtx.fillStyle = '#f5efe6';
    cCtx.fillRect(0, 0, w, h);

    cCtx.strokeStyle = '#78350f';
    cCtx.lineWidth = 3;
    cCtx.strokeRect(30, 30, w - 60, h - 60);

    cCtx.beginPath();
    cCtx.moveTo(w * 0.25, 30); cCtx.lineTo(w * 0.27, h - 30);
    cCtx.moveTo(w * 0.5, 30); cCtx.lineTo(w * 0.48, h - 30);
    cCtx.moveTo(30, h * 0.5); cCtx.lineTo(w - 30, h * 0.52);
    cCtx.stroke();

    cCtx.fillStyle = '#92400e';
    cCtx.font = 'bold 16px "Noto Sans Bengali", sans-serif';
    cCtx.fillText('সিএস দাগ ৩১২', w * 0.12, h * 0.3);
    cCtx.fillText('সিএস দাগ ৩১৩', w * 0.35, h * 0.3);
    cCtx.fillText('সিএস দাগ ৩১৪', w * 0.12, h * 0.7);
    cCtx.restore();

    // 2. Draw RS Modern Map on Right Side
    cCtx.save();
    cCtx.beginPath();
    cCtx.rect(splitX, 0, w - splitX, h);
    cCtx.clip();

    cCtx.fillStyle = '#faf8f2';
    cCtx.fillRect(0, 0, w, h);

    cCtx.strokeStyle = '#0f172a';
    cCtx.lineWidth = 3.5;
    cCtx.strokeRect(30, 30, w - 60, h - 60);

    cCtx.beginPath();
    cCtx.moveTo(w * 0.28, 30); cCtx.lineTo(w * 0.28, h - 30);
    cCtx.moveTo(w * 0.55, 30); cCtx.lineTo(w * 0.55, h - 30);
    cCtx.moveTo(30, h * 0.45); cCtx.lineTo(w - 30, h * 0.45);
    cCtx.stroke();

    cCtx.fillStyle = '#1e293b';
    cCtx.font = 'bold 16px "Noto Sans Bengali", sans-serif';
    cCtx.fillText('আরএস দাগ ৫১২', w * 0.14, h * 0.28);
    cCtx.fillText('আরএস দাগ ৫১৩', w * 0.4, h * 0.28);
    cCtx.fillText('আরএস দাগ ৫১৪', w * 0.65, h * 0.28);
    cCtx.fillText('আরএস দাগ ৫১৮', w * 0.4, h * 0.75);
    cCtx.restore();

    // 3. Draw Split Divider Line
    cCtx.strokeStyle = '#06b6d4';
    cCtx.lineWidth = 3;
    cCtx.beginPath();
    cCtx.moveTo(splitX, 0);
    cCtx.lineTo(splitX, h);
    cCtx.stroke();

    cCtx.fillStyle = '#06b6d4';
    cCtx.beginPath();
    cCtx.arc(splitX, h / 2, 14, 0, Math.PI * 2);
    cCtx.fill();
    cCtx.strokeStyle = '#ffffff';
    cCtx.lineWidth = 2;
    cCtx.stroke();

    cCtx.fillStyle = '#ffffff';
    cCtx.font = 'bold 10px monospace';
    cCtx.textAlign = 'center';
    cCtx.fillText('↔', splitX, h / 2 + 3);
    cCtx.textAlign = 'left';
  }

  // Scaled Map Print Sheet Canvas
  function renderPrintSheetCanvas() {
    const pCanvas = document.getElementById('printSheetCanvas');
    if (!pCanvas) return;
    const pCtx = pCanvas.getContext('2d');
    pCanvas.width = 650;
    pCanvas.height = 250;

    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    const activePlot = state.plots.find(p => p.id === state.selectedPlotId) || state.plots[0];
    if (!activePlot || activePlot.vertices.length < 3) return;

    const vs = activePlot.vertices;
    const minX = Math.min(...vs.map(v => v.x));
    const maxX = Math.max(...vs.map(v => v.x));
    const minY = Math.min(...vs.map(v => v.y));
    const maxY = Math.max(...vs.map(v => v.y));

    const plotW = maxX - minX || 1;
    const plotH = maxY - minY || 1;
    const scale = Math.min(450 / plotW, 170 / plotH);
    const offsetX = (pCanvas.width - plotW * scale) / 2 - minX * scale;
    const offsetY = (pCanvas.height - plotH * scale) / 2 - minY * scale;

    pCtx.beginPath();
    pCtx.moveTo(vs[0].x * scale + offsetX, vs[0].y * scale + offsetY);
    for (let i = 1; i < vs.length; i++) {
      pCtx.lineTo(vs[i].x * scale + offsetX, vs[i].y * scale + offsetY);
    }
    pCtx.closePath();

    pCtx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    pCtx.fill();
    pCtx.strokeStyle = '#0f172a';
    pCtx.lineWidth = 3;
    pCtx.stroke();

    for (let i = 0; i < vs.length; i++) {
      const p1 = vs[i];
      const p2 = vs[(i + 1) % vs.length];
      const mx = ((p1.x + p2.x) / 2) * scale + offsetX;
      const my = ((p1.y + p2.y) / 2) * scale + offsetY;
      const lk = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const ft = (lk * FEET_PER_LINK).toFixed(1);

      pCtx.fillStyle = '#0f172a';
      pCtx.font = 'bold 10px monospace';
      pCtx.textAlign = 'center';
      pCtx.fillText(`${lk.toFixed(1)} lk (${ft} ft)`, mx, my - 4);
    }

    const centroid = calculateCentroid(vs);
    const cx = centroid.x * scale + offsetX;
    const cy = centroid.y * scale + offsetY;
    const area = calculateShoelaceArea(vs);
    const shotok = (area * SQFT_PER_SQLINK / SQFT_PER_SHOTOK).toFixed(2);

    pCtx.fillStyle = '#0f172a';
    pCtx.font = 'bold 14px "Noto Sans Bengali", sans-serif';
    pCtx.textAlign = 'center';
    pCtx.fillText(activePlot.name, cx, cy - 6);
    pCtx.fillStyle = '#059669';
    pCtx.font = 'bold 12px "Noto Sans Bengali", monospace';
    pCtx.fillText(`${shotok} শতক`, cx, cy + 12);
    pCtx.textAlign = 'left';

    const printDaagNum = document.getElementById('printDaagNum');
    const printAreaShotok = document.getElementById('printAreaShotok');
    const printAreaSqft = document.getElementById('printAreaSqft');
    const printPerimeter = document.getElementById('printPerimeter');

    const sqft = area * SQFT_PER_SQLINK;
    const kathaPart = Math.floor(sqft / SQFT_PER_KATHA);
    const shotokRem = ((sqft / SQFT_PER_SHOTOK) % 1.652893).toFixed(1);

    if (printDaagNum) printDaagNum.textContent = activePlot.name;
    if (printAreaShotok) printAreaShotok.textContent = `${shotok} শতক (${kathaPart} কাঠা ${shotokRem} শতক)`;
    if (printAreaSqft) printAreaSqft.textContent = `${sqft.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} বর্গফুট`;
    if (printPerimeter) printPerimeter.textContent = `${(calculatePerimeter(vs) * FEET_PER_LINK).toFixed(1)} ফুট`;
  }

  // Quick Plot / Daag Search Engine
  function searchDaag(query) {
    if (!query) return;
    const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    let norm = query.toString().trim();
    for (let i = 0; i <= 9; i++) {
      norm = norm.replaceAll(bnDigits[i], i.toString());
    }

    const match = state.plots.find(p => {
      let pNameNorm = p.name;
      for (let i = 0; i <= 9; i++) {
        pNameNorm = pNameNorm.replaceAll(bnDigits[i], i.toString());
      }
      return pNameNorm.toLowerCase().includes(norm.toLowerCase()) || p.id.toLowerCase().includes(norm.toLowerCase());
    });

    if (match) {
      state.selectedPlotId = match.id;
      const centroid = calculateCentroid(match.vertices);
      state.camera.x = centroid.x;
      state.camera.y = centroid.y;
      state.camera.zoom = 1.35;
      if (zoomLabelEl) zoomLabelEl.textContent = '135%';
      updateInspector();
      render();

      drawHintBox.classList.remove('opacity-0');
      drawHintText.textContent = `🎯 ${match.name} সফলভাবে খুঁজে পাওয়া গেছে এবং কেন্দ্রে ফোকাস করা হয়েছে!`;
      setTimeout(() => {
        drawHintBox.classList.add('opacity-0');
      }, 3500);
    } else {
      showToast(`দাগ নং "${query}" নকশায় পাওয়া যায়নি`, 'warning');
    }
  }

  const daagSearchInput = document.getElementById('daagSearchInput');
  const btnSearchDaag = document.getElementById('btnSearchDaag');

  if (btnSearchDaag && daagSearchInput) {
    btnSearchDaag.addEventListener('click', () => {
      searchDaag(daagSearchInput.value);
    });
    daagSearchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        searchDaag(daagSearchInput.value);
      }
    });
  }

  // Virtual Gunia Scale Toggle Button
  const btnToggleGunia = document.getElementById('btnToggleGunia');
  if (btnToggleGunia) {
    btnToggleGunia.addEventListener('click', () => {
      state.gunia.enabled = !state.gunia.enabled;
      btnToggleGunia.classList.toggle('active', state.gunia.enabled);
      if (state.gunia.enabled) {
        state.gunia.x = state.camera.x;
        state.gunia.y = state.camera.y;
        drawHintBox.classList.remove('opacity-0');
        drawHintText.textContent = '📏 ভার্চুয়াল গুনিয়া স্কেল সক্রিয়! স্কেলের ওপর মাউস চেপে টেনে আনুন বা ডানপাশের গোল বাটনে ঘুরিয়ে নিন।';
      } else {
        drawHintBox.classList.add('opacity-0');
      }
      render();
    });
  }

  // Land Class & Rate live input listeners
  const landClassSelect = document.getElementById('landClassSelect');
  const ratePerShotokInput = document.getElementById('ratePerShotokInput');

  const defaultRates = {
    nal: 350000,
    vita: 650000,
    commercial: 1500000,
    pukur: 250000,
    bagan: 300000
  };

  if (landClassSelect) {
    landClassSelect.addEventListener('change', e => {
      const selectedClass = e.target.value;
      state.landClass = selectedClass;
      if (defaultRates[selectedClass] && ratePerShotokInput) {
        ratePerShotokInput.value = defaultRates[selectedClass];
        state.ratePerShotok = defaultRates[selectedClass];
      }
      const activePlot = state.plots.find(p => p.id === state.selectedPlotId);
      if (activePlot) {
        const sqft = calculateShoelaceArea(activePlot.vertices) * SQFT_PER_SQLINK;
        updateValuation(sqft / SQFT_PER_SHOTOK);
      }
    });
  }

  if (ratePerShotokInput) {
    ratePerShotokInput.addEventListener('input', () => {
      const activePlot = state.plots.find(p => p.id === state.selectedPlotId);
      if (activePlot) {
        const sqft = calculateShoelaceArea(activePlot.vertices) * SQFT_PER_SQLINK;
        updateValuation(sqft / SQFT_PER_SHOTOK);
      }
    });
  }

  // Auto Physical Partition by Khatian Share
  function applyKhatianPhysicalPartition() {
    const activePlot = state.plots.find(p => p.id === state.selectedPlotId) || state.plots[0];
    if (!activePlot || activePlot.vertices.length < 3) return;

    const vs = activePlot.vertices;
    const minX = Math.min(...vs.map(v => v.x));
    const maxX = Math.max(...vs.map(v => v.x));
    const minY = Math.min(...vs.map(v => v.y));
    const maxY = Math.max(...vs.map(v => v.y));
    const totalW = maxX - minX;

    const totalShare = state.khatianOwners.reduce((sum, o) => sum + (parseFloat(o.share) || 0), 0);
    if (totalShare <= 0) return;

    const subColors = [
      { fill: 'rgba(245, 158, 11, 0.25)', stroke: '#f59e0b' },
      { fill: 'rgba(16, 185, 129, 0.25)', stroke: '#10b981' },
      { fill: 'rgba(56, 189, 248, 0.25)', stroke: '#38bdf8' },
      { fill: 'rgba(168, 85, 247, 0.25)', stroke: '#a855f7' },
      { fill: 'rgba(236, 72, 153, 0.25)', stroke: '#ec4899' }
    ];

    state.plots = state.plots.filter(p => p.id !== activePlot.id);

    let currentX = minX;
    const baseName = activePlot.name.replace(/ \(.*\)/, '');

    state.khatianOwners.forEach((owner, idx) => {
      const shareFraction = (parseFloat(owner.share) || 0) / totalShare;
      const partW = totalW * shareFraction;
      const nextX = (idx === state.khatianOwners.length - 1) ? maxX : currentX + partW;

      const subVertices = [
        { x: currentX, y: minY },
        { x: nextX, y: minY },
        { x: nextX, y: maxY },
        { x: currentX, y: maxY }
      ];

      const color = subColors[idx % subColors.length];
      const subId = `${activePlot.id}-share-${idx + 1}`;

      state.plots.push({
        id: subId,
        name: `${baseName} (${owner.name})`,
        layer: 'plots',
        fillColor: color.fill,
        strokeColor: color.stroke,
        vertices: subVertices
      });

      currentX = nextX;
    });

    state.selectedPlotId = `${activePlot.id}-share-1`;
    updateInspector();
    render();
    pushHistory();
  }

  // Generate & Download Google Earth KML
  function generateKML() {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>মৌজা জরিপ নকশা - রূপনগর (জেএল নং ৪২)</name>
    <description>Land Survey CAD Pro Generated KML Cadastral Map</description>
    <Style id="plotStyle">
      <LineStyle>
        <color>ff0284c7</color>
        <width>2.5</width>
      </LineStyle>
      <PolyStyle>
        <color>400284c7</color>
      </PolyStyle>
    </Style>
`;

    // Base GPS anchor point for Mirpur/Rupnagar, Dhaka: (23.8103° N, 90.3600° E)
    const baseLat = 23.8103;
    const baseLng = 90.3600;
    const latPerLink = 0.00000181;
    const lngPerLink = 0.00000198;

    state.plots.forEach(plot => {
      kml += `    <Placemark>
      <name>${plot.name}</name>
      <styleUrl>#plotStyle</styleUrl>
      <Polygon>
        <extrude>1</extrude>
        <altitudeMode>clampToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>\n`;
      plot.vertices.forEach(v => {
        const lng = (baseLng + v.x * lngPerLink).toFixed(7);
        const lat = (baseLat - v.y * latPerLink).toFixed(7);
        kml += `              ${lng},${lat},0\n`;
      });
      // Close polygon
      const first = plot.vertices[0];
      const lng0 = (baseLng + first.x * lngPerLink).toFixed(7);
      const lat0 = (baseLat - first.y * latPerLink).toFixed(7);
      kml += `              ${lng0},${lat0},0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>\n`;
    });

    kml += `  </Document>
</kml>`;
    return kml;
  }

  function downloadKML() {
    try {
      const kmlContent = generateKML();
      const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'মৌজা_জরিপ_নকশা.kml';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Google Earth KML ফাইল ডাউনলোড হয়েছে!', 'success');
    } catch (e) {
      showToast('KML এক্সপোর্ট ত্রুটি: ' + e.message, 'error');
    }
  }

  // Global Modal & Tool Helpers attached to window
  window.loadSampleMouzaMap = function() {
    const img = new Image();
    img.onload = () => {
      loadMouzaImageObject(img, false, false);
      document.getElementById('canvasEmptyState')?.classList.add('hidden');
      showToast('নমুনা মৌজা ম্যাপ লোড হয়েছে!', 'success');
    };
    img.src = '/default_mouza_map.jpg';
  };

  window.openMouzaMapModal = function() {
    document.getElementById('btnLoadMouza')?.click();
  };

  window.openMapCompareModal = function() {
    const modal = document.getElementById('mapCompareModal');
    if (modal) {
      modal.classList.remove('hidden');
      setTimeout(renderCompareCanvas, 50);
    }
  };

  window.openKhatianModal = function() {
    const modal = document.getElementById('khatianModal');
    if (modal) {
      const activePlot = state.plots.find(p => p.id === state.selectedPlotId) || state.plots[0];
      if (activePlot) {
        const area = calculateShoelaceArea(activePlot.vertices);
        const shotok = (area * SQFT_PER_SQLINK / SQFT_PER_SHOTOK).toFixed(3);
        const plotNameEl = document.getElementById('khatianPlotName');
        const totalShotokInput = document.getElementById('khatianTotalShotok');
        if (plotNameEl) plotNameEl.textContent = activePlot.name;
        if (totalShotokInput) totalShotokInput.value = shotok;
      }
      renderKhatianOwnersTable();
      modal.classList.remove('hidden');
    }
  };

  window.openLayerModal = function() {
    const modal = document.getElementById('layerModal');
    if (modal) {
      modal.classList.remove('hidden');
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    }
  };

  window.openImageFilterModal = function() {
    const modal = document.getElementById('imageFilterModal');
    if (modal) {
      modal.classList.remove('hidden');
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    }
  };

  window.openPrintLayoutModal = function() {
    const modal = document.getElementById('printLayoutModal');
    if (modal) {
      modal.classList.remove('hidden');
      setTimeout(renderPrintSheetCanvas, 50);
    }
  };

  window.exportKMLFile = function() {
    downloadKML();
  };

  window.exportSurveyReport = function() {
    const activePlot = state.plots.find(p => p.id === state.selectedPlotId) || state.plots[0];
    if (activePlot) {
      const sqLinks = calculateShoelaceArea(activePlot.vertices);
      const sqft = sqLinks * SQFT_PER_SQLINK;
      const shotok = (sqft / SQFT_PER_SHOTOK).toFixed(3);
      const kathaPart = Math.floor(sqft / SQFT_PER_KATHA);
      const shotokRemaining = ((sqft / SQFT_PER_SHOTOK) % 1.652893).toFixed(1);

      const reportPlotNum = document.getElementById('reportPlotNum');
      const reportTotalShotok = document.getElementById('reportTotalShotok');
      const reportBanglaKatha = document.getElementById('reportBanglaKatha');
      const reportTotalSqft = document.getElementById('reportTotalSqft');

      if (reportPlotNum) reportPlotNum.textContent = activePlot.name.replace(' (নির্বাচিত)', '').replace(' (অটো)', '');
      if (reportTotalShotok) reportTotalShotok.textContent = `${shotok} শতক (Decimal)`;
      if (reportBanglaKatha) reportBanglaKatha.textContent = `${kathaPart} কাঠা ${shotokRemaining} শতক`;
      if (reportTotalSqft) reportTotalSqft.textContent = `${sqft.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} বর্গফুট (Sq.ft)`;
    }
    const modal = document.getElementById('reportModal');
    if (modal) modal.classList.remove('hidden');
  };

  // Wire Undo, Redo, KML, Khatian, Map Compare & Print Modals
  document.getElementById('btnUndo')?.addEventListener('click', undo);
  document.getElementById('btnRedo')?.addEventListener('click', redo);

  const btnToggleAngles = document.getElementById('btnToggleAngles');
  if (btnToggleAngles) {
    btnToggleAngles.addEventListener('click', () => {
      state.showAngles = !state.showAngles;
      btnToggleAngles.classList.toggle('active', state.showAngles);
      render();
    });
  }

  document.getElementById('btnExportKML')?.addEventListener('click', downloadKML);

  // ========================================================
  // Land Survey CAD - KMZ Maker Studio Integration
  // ========================================================
  const kmzMakerModal = document.getElementById('kmzMakerModal');
  const kmzInpLat = document.getElementById('kmzInpLat');
  const kmzInpLng = document.getElementById('kmzInpLng');
  const kmzSliderOpacity = document.getElementById('kmzSliderOpacity');
  const kmzValOpacity = document.getElementById('kmzValOpacity');
  const kmzStatusMouzaName = document.getElementById('kmzStatusMouzaName');
  const kmzStatusPlotsCount = document.getElementById('kmzStatusPlotsCount');
  const kmzStatusTotalArea = document.getElementById('kmzStatusTotalArea');
  const kmzInpFileName = document.getElementById('kmzInpFileName');
  const kmzProgressContainer = document.getElementById('kmzProgressContainer');
  const kmzProgressStatus = document.getElementById('kmzProgressStatus');
  const kmzProgressPercent = document.getElementById('kmzProgressPercent');
  const kmzProgressBar = document.getElementById('kmzProgressBar');

  function openKmzMakerModal() {
    if (!kmzMakerModal) return;

    // Sync GPS with active state
    if (state.satellite?.originGPS) {
      if (kmzInpLat) kmzInpLat.value = state.satellite.originGPS.lat.toFixed(6);
      if (kmzInpLng) kmzInpLng.value = state.satellite.originGPS.lng.toFixed(6);
    }

    // Sync Mouza Map Sheet info
    const activeMap = (state.mouzaMaps || []).find(m => m.id === state.activeMapId && m.loaded) || (state.mouzaMaps || [])[0];
    if (activeMap && activeMap.loaded) {
      if (kmzStatusMouzaName) kmzStatusMouzaName.textContent = activeMap.name || 'সক্রিয় মৌজা নকশা';
      const cleanName = (activeMap.name || 'mouza_survey').replace(/[\s\/\\:*?"<>|]+/g, '_');
      if (kmzInpFileName) kmzInpFileName.value = `${cleanName}_daag.kmz`;
    } else {
      if (kmzStatusMouzaName) kmzStatusMouzaName.textContent = 'কোনো ম্যাপ লোড করা হয়নি (নমুনা লোড করুন)';
      if (kmzInpFileName) kmzInpFileName.value = 'mouza_survey_daag.kmz';
    }

    // Sync Plots count and total area
    const plotCount = (state.plots || []).length;
    if (kmzStatusPlotsCount) kmzStatusPlotsCount.textContent = `${toBanglaDigits(plotCount)} টি`;

    let totalAreaSqFt = 0;
    (state.plots || []).forEach(p => {
      if (window.LSCAD?.Geometry?.calculateShoelaceArea && p.vertices) {
        totalAreaSqFt += window.LSCAD.Geometry.calculateShoelaceArea(p.vertices) * (0.66 * 0.66);
      } else if (p.area) {
        totalAreaSqFt += p.area;
      }
    });
    const totalShatak = (totalAreaSqFt / 435.60).toFixed(2);
    if (kmzStatusTotalArea) kmzStatusTotalArea.textContent = `${toBanglaDigits(totalShatak)} শতাংশ`;

    // Reset progress container
    if (kmzProgressContainer) kmzProgressContainer.classList.add('hidden');

    // Update satellite button label in modal
    const satBtnText = document.getElementById('kmzSatCanvasBtnText');
    if (satBtnText) {
      satBtnText.textContent = state.satellite?.enabled ? 'স্যাটেলাইট বন্ধ' : 'স্যাটেলাইট ভিউ';
    }

    kmzMakerModal.classList.remove('hidden');
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }
  window.openKmzMakerModal = openKmzMakerModal;

  function closeKmzMakerModal() {
    kmzMakerModal?.classList.add('hidden');
  }

  // Toggle live satellite overlay on canvas from KMZ modal
  document.getElementById('btnKmzToggleSatelliteCanvas')?.addEventListener('click', () => {
    toggleSatelliteOverlay();
    const satBtnText = document.getElementById('kmzSatCanvasBtnText');
    if (satBtnText) {
      satBtnText.textContent = state.satellite?.enabled ? 'স্যাটেলাইট বন্ধ' : 'স্যাটেলাইট ভিউ';
    }
    showToast(state.satellite?.enabled ? 'ক্যানভাসে সরাসরি গুগল স্যাটেলাইট দৃশ্যমান হয়েছে!' : 'স্যাটেলাইট ভিউ বন্ধ করা হয়েছে', 'info');
  });

  // Open triggers
  document.getElementById('btnOpenKMZMaker')?.addEventListener('click', openKmzMakerModal);
  document.getElementById('btnOpenKMZMakerHeader')?.addEventListener('click', openKmzMakerModal);
  document.getElementById('btnOpenKMZFromGeoRef')?.addEventListener('click', () => {
    geoRefModal?.classList.add('hidden');
    openKmzMakerModal();
  });

  // Close triggers
  document.getElementById('btnCloseKmzMakerModal')?.addEventListener('click', closeKmzMakerModal);
  document.getElementById('btnKmzCancel')?.addEventListener('click', closeKmzMakerModal);

  // Opacity Slider
  kmzSliderOpacity?.addEventListener('input', (e) => {
    const val = e.target.value;
    if (kmzValOpacity) kmzValOpacity.textContent = `${toBanglaDigits(val)}%`;
  });

  // District Presets
  document.querySelectorAll('.kmz-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lat = parseFloat(btn.dataset.lat);
      const lng = parseFloat(btn.dataset.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        if (kmzInpLat) kmzInpLat.value = lat.toFixed(6);
        if (kmzInpLng) kmzInpLng.value = lng.toFixed(6);
        if (state.satellite) state.satellite.originGPS = { lat, lng };
        if (inpGeoLat) inpGeoLat.value = lat.toFixed(6);
        if (inpGeoLng) inpGeoLng.value = lng.toFixed(6);
        showToast(`জিপিএস সেট করা হয়েছে: ${btn.textContent.trim()}`, 'info');
      }
    });
  });

  // Current Device GPS
  document.getElementById('btnKmzUseDeviceGps')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('আপনার ব্রাউজারে জিপিএস সমর্থন করে না।', 'error');
      return;
    }
    showToast('ডিভাইসের বর্তমান লাইভ জিপিএস লোকেশন নেওয়া হচ্ছে...', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (kmzInpLat) kmzInpLat.value = lat.toFixed(6);
        if (kmzInpLng) kmzInpLng.value = lng.toFixed(6);
        if (state.satellite) state.satellite.originGPS = { lat, lng };
        if (inpGeoLat) inpGeoLat.value = lat.toFixed(6);
        if (inpGeoLng) inpGeoLng.value = lng.toFixed(6);
        showToast(`সরাসরি লাইভ জিপিএস সফলভাবে গৃহীত: (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`, 'success');
      },
      (err) => {
        showToast('জিপিএস লোকেশন পাওয়া যায়নি: ' + err.message, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  // Load Sample Mouza Map inside KMZ Maker
  document.getElementById('btnKmzLoadSampleMap')?.addEventListener('click', () => {
    window.loadSampleMouzaMap();
    setTimeout(openKmzMakerModal, 300);
  });

  // Generate and Download KMZ
  document.getElementById('btnGenerateAndDownloadKMZ')?.addEventListener('click', async () => {
    const lat = parseFloat(kmzInpLat?.value) || 23.3167;
    const lng = parseFloat(kmzInpLng?.value) || 90.7500;
    const originGPS = { lat, lng };
    const anchorWorld = state.satellite?.anchorWorld || { x: 0, y: 0 };

    const activeMap = (state.mouzaMaps || []).find(m => m.id === state.activeMapId && m.loaded) || (state.mouzaMaps || [])[0];
    const plots = state.plots || [];

    const includeOverlay = document.getElementById('kmzChkOverlay')?.checked ?? true;
    const includePolygons = document.getElementById('kmzChkPolygons')?.checked ?? true;
    const includeCentroidPins = document.getElementById('kmzChkCentroidPins')?.checked ?? true;
    const includeKhatian = document.getElementById('kmzChkKhatianInfo')?.checked ?? true;
    const opacityPct = parseInt(kmzSliderOpacity?.value || '85', 10);
    const overlayOpacity = opacityPct / 100.0;

    let fileName = (kmzInpFileName?.value || 'mouza_survey_kmz.kmz').trim();
    if (!fileName.toLowerCase().endsWith('.kmz')) fileName += '.kmz';

    // Show Progress Indicator
    if (kmzProgressContainer) kmzProgressContainer.classList.remove('hidden');
    if (kmzProgressBar) kmzProgressBar.style.width = '10%';
    if (kmzProgressPercent) kmzProgressPercent.textContent = '১০%';
    if (kmzProgressStatus) kmzProgressStatus.textContent = 'প্রসেসিং শুরু হচ্ছে...';

    const btn = document.getElementById('btnGenerateAndDownloadKMZ');
    if (btn) btn.disabled = true;

    try {
      if (!window.LSCAD?.Exporters?.generateKMZ) {
        throw new Error('KMZ এক্সপোর্টার ইঞ্জিন প্রস্তুত নয়।');
      }

      await window.LSCAD.Exporters.generateKMZ(
        plots,
        activeMap,
        originGPS,
        anchorWorld,
        {
          fileName: fileName,
          includeOverlay: includeOverlay && !!activeMap?.loaded,
          overlayOpacity: overlayOpacity,
          includePolygons: includePolygons,
          includeCentroidPins: includeCentroidPins,
          includeKhatian: includeKhatian
        },
        (pct, msg) => {
          if (kmzProgressBar) kmzProgressBar.style.width = `${pct}%`;
          if (kmzProgressPercent) kmzProgressPercent.textContent = `${toBanglaDigits(pct)}%`;
          if (kmzProgressStatus) kmzProgressStatus.textContent = msg;
        }
      );

      showToast(`সফল! ${fileName} ফাইলটি ডাউনলোড হয়েছে। এটি Google Earth-এ ওপেন করুন।`, 'success');
      playCadSound('snap');
      setTimeout(() => {
        closeKmzMakerModal();
      }, 1200);
    } catch (err) {
      console.error(err);
      showToast('KMZ এক্সপোর্ট ত্রুটি: ' + err.message, 'error');
      if (kmzProgressStatus) kmzProgressStatus.textContent = 'ত্রুটি: ' + err.message;
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  // Download Vector KML Only
  document.getElementById('btnDownloadKMLOnly')?.addEventListener('click', () => {
    const lat = parseFloat(kmzInpLat?.value) || 23.3167;
    const lng = parseFloat(kmzInpLng?.value) || 90.7500;
    const originGPS = { lat, lng };
    const anchorWorld = state.satellite?.anchorWorld || { x: 0, y: 0 };
    const activeMap = (state.mouzaMaps || []).find(m => m.id === state.activeMapId && m.loaded) || (state.mouzaMaps || [])[0];
    const plots = state.plots || [];

    try {
      const kmlContent = window.LSCAD.Exporters.generateKML(plots, activeMap, originGPS, anchorWorld, {
        includeOverlay: false,
        includePolygons: true,
        includeCentroidPins: true,
        includeKhatian: true
      });

      let fileName = (kmzInpFileName?.value || 'mouza_survey').replace(/\.kmz$/i, '') + '.kml';
      window.LSCAD.Exporters.downloadFile(kmlContent, fileName, 'application/vnd.google-earth.kml+xml');
      showToast('Google Earth KML ফাইল ডাউনলোড হয়েছে!', 'success');
      closeKmzMakerModal();
    } catch (err) {
      showToast('KML ডাউনলোড ত্রুটি: ' + err.message, 'error');
    }
  });

  // Khatian Modal Listeners
  const khatianModal = document.getElementById('khatianModal');
  document.getElementById('btnKhatianCalc')?.addEventListener('click', () => {
    window.openKhatianModal();
  });

  document.getElementById('btnCloseKhatianModal')?.addEventListener('click', () => {
    khatianModal?.classList.add('hidden');
  });

  document.getElementById('btnAddKhatianOwner')?.addEventListener('click', () => {
    state.khatianOwners.push({
      id: Date.now(),
      name: `শরিক ${state.khatianOwners.length + 1}`,
      share: 0.100
    });
    renderKhatianOwnersTable();
  });

  document.getElementById('khatianTotalShotok')?.addEventListener('input', () => {
    renderKhatianOwnersTable();
  });

  document.getElementById('btnApplyKhatianDivision')?.addEventListener('click', () => {
    khatianModal?.classList.add('hidden');
    applyKhatianPhysicalPartition();
    showToast('হিস্যা অনুযায়ী অটো বণ্টন নকশায় প্রয়োগ করা হয়েছে!', 'success');
  });

  // Map Compare Modal Listeners
  const mapCompareModal = document.getElementById('mapCompareModal');
  document.getElementById('btnMapCompare')?.addEventListener('click', () => {
    window.openMapCompareModal();
  });

  document.getElementById('btnCloseMapCompareModal')?.addEventListener('click', () => {
    mapCompareModal?.classList.add('hidden');
  });

  document.getElementById('compareSplitSlider')?.addEventListener('input', e => {
    document.getElementById('compareSplitVal').textContent = e.target.value + '%';
    renderCompareCanvas();
  });

  document.getElementById('compareOpacitySlider')?.addEventListener('input', () => {
    renderCompareCanvas();
  });

  // Scaled Map Print Modal Listeners
  const printLayoutModal = document.getElementById('printLayoutModal');
  document.getElementById('btnPrintLayout')?.addEventListener('click', () => {
    window.openPrintLayoutModal();
  });

  document.getElementById('btnClosePrintLayoutModal')?.addEventListener('click', () => {
    printLayoutModal?.classList.add('hidden');
  });

  // Keyboard Shortcuts (F3 Snap, F7 Grid, F8 Angles, G Gunia, Ctrl+Z Undo, Ctrl+Y Redo, W Magic Wand, V Select, P Polygon, N Auto Number, M Merge, Escape)
  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    } else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
      e.preventDefault();
      redo();
    } else if (e.key === 'F3') {
      e.preventDefault();
      btnToggleSnap?.click();
    } else if (e.key === 'F7') {
      e.preventDefault();
      btnToggleGrid?.click();
    } else if (e.key === 'F8') {
      e.preventDefault();
      btnToggleAngles?.click();
    } else if (e.key === 'g' || e.key === 'G') {
      e.preventDefault();
      document.getElementById('btnToggleGunia')?.click();
    } else if (e.key === 'd' || e.key === 'D') {
      document.getElementById('toggleDimensionsVisibility')?.click();
      showToast(state.layers.dimensions ? '📏 বাউন্ডারির মাপ দৃশ্যমান (Dimensions ON)' : '👁️ বাউন্ডারির মাপ লুকানো হয়েছে (Dimensions OFF)', 'info');
    } else if (e.key === 'b' || e.key === 'B') {
      document.querySelector('.tool-btn[data-tool="line-wand"]')?.click();
    } else if (e.key === 'w' || e.key === 'W') {
      document.querySelector('.tool-btn[data-tool="magic-wand"]')?.click();
    } else if (e.key === 'v' || e.key === 'V') {
      document.querySelector('.tool-btn[data-tool="select"]')?.click();
    } else if (e.key === 'h' || e.key === 'H') {
      document.querySelector('.tool-btn[data-tool="pan"]')?.click();
    } else if (e.key === 'p' || e.key === 'P') {
      document.querySelector('.tool-btn[data-tool="polygon"]')?.click();
    } else if (e.key === 'n' || e.key === 'N') {
      document.querySelector('.tool-btn[data-tool="auto-number"]')?.click();
    } else if (e.key === 'm' || e.key === 'M') {
      document.querySelector('.tool-btn[data-tool="merge"]')?.click();
    } else if (e.key === 'Delete') {
      e.preventDefault();
      deleteSelectedPlot();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      if (state.activePolyline && state.activePolyline.length > 0) {
        state.activePolyline.pop();
        if (state.activePolyline.length === 0) {
          drawHintBox.classList.add('opacity-0');
        }
        render();
        showToast('পূর্বের পয়েন্ট বাতিল করা হয়েছে', 'info');
      } else {
        deleteSelectedPlot();
      }
    } else if (e.key === 'Escape') {
      const wasDrawing = state.activePolyline && state.activePolyline.length > 0;
      state.activePolyline = [];
      state.calibrationPoints = [];
      state.slicePoints = [];
      state.diagonalPoints = [];
      state.mergeSelectedPlots = [];
      state.tool = 'select';
      updateToolUI();
      drawHintBox.classList.add('opacity-0');
      document.getElementById('reportModal')?.classList.add('hidden');
      document.getElementById('khatianModal')?.classList.add('hidden');
      document.getElementById('mapCompareModal')?.classList.add('hidden');
      document.getElementById('printLayoutModal')?.classList.add('hidden');
      document.getElementById('calibrationModal')?.classList.add('hidden');
      document.getElementById('imageFilterModal')?.classList.add('hidden');
      document.getElementById('layerModal')?.classList.add('hidden');
      document.getElementById('mapSheetsModal')?.classList.add('hidden');
      document.getElementById('mouzaImportChoiceModal')?.classList.add('hidden');
      document.getElementById('autoNumberModal')?.classList.add('hidden');
      document.getElementById('plotMergeModal')?.classList.add('hidden');
      document.getElementById('pantographModal')?.classList.add('hidden');
      document.getElementById('topologyModal')?.classList.add('hidden');
      document.getElementById('objectPropsModal')?.classList.add('hidden');
      document.getElementById('geoRefModal')?.classList.add('hidden');
      document.getElementById('exactCutModal')?.classList.add('hidden');
      document.getElementById('faraezModal')?.classList.add('hidden');
      state.highlightedVertex = null;
      render();
      if (wasDrawing) {
        showToast('অঙ্কন বাতিল করা হয়েছে', 'info');
      }
    } else if (e.key === 'Enter') {
      canvas.dispatchEvent(new MouseEvent('dblclick'));
    }
  });

  // Initialize (Clean start on reload without forcing default map)
  const initialEmptyState = document.getElementById('canvasEmptyState');
  if (initialEmptyState) initialEmptyState.classList.remove('hidden');
  state.plots = [];
  pushHistory();
  resizeCanvas();
  resetFitView();
  updateInspector();
  updateScaleStatusBadge();

  function refreshIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  refreshIcons();

  window.addEventListener('load', () => {
    resizeCanvas();
    resetFitView();
    refreshIcons();
  });
  document.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    resetFitView();
    refreshIcons();
  });
  requestAnimationFrame(() => {
    resizeCanvas();
    resetFitView();
  });
  setTimeout(() => {
    resizeCanvas();
    resetFitView();
    refreshIcons();
  }, 60);
  setTimeout(() => {
    resizeCanvas();
    resetFitView();
    refreshIcons();
  }, 250);

  // Expose live workspace engine to window.LSCAD for modular consumption
  if (typeof window !== 'undefined') {
    window.LSCAD = window.LSCAD || {};
    window.LSCAD.Engine = {
      state: state,
      render: render,
      resizeCanvas: resizeCanvas,
      resetFitView: resetFitView,
      pushHistory: pushHistory,
      undo: undo,
      redo: redo,
      updateInspector: updateInspector
    };
  }

  // Global API Exposure for Tests, Scripts & External Automation
  window.loadMouzaImageObject = loadMouzaImageObject;
  window.handleLoadedImagePrompt = handleLoadedImagePrompt;
  window.toggleSatelliteOverlay = toggleSatelliteOverlay;
  window.setGpsLocationPin = setGpsLocationPin;
  window.getActiveMouzaMap = getActiveMouzaMap;

})();
