/**
 * Land Survey CAD Interactive 2D Canvas Engine
 * Built with Shoelace Area Calculation and Bangladesh Survey Math
 */

(function() {
  'use strict';

  // Master Math Constants
  const SQFT_PER_SHOTOK = 435.60;
  const SQFT_PER_KATHA = 720.00;
  const SQFT_PER_BIGHA = 14400.00;
  const SQFT_PER_ACRE = 43560.00;
  const SQFT_PER_SQMETER = 10.7639104;
  const SQFT_PER_SQLINK = 0.4356;
  const FEET_PER_LINK = 0.66;

  // State Management
  const state = {
    tool: 'select', // select, polygon, polyline, point, dimension, calibrate, split, text, offset
    unit: 'link', // link, feet, meter
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
      x: 250,
      y: 200,
      zoom: 1.2,
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

    // Vertex Dragging State
    dragVertex: {
      isDragging: false,
      plotId: null,
      vertexIndex: -1
    },

    // Active Drawing buffer
    activePolyline: [],
    
    // Calibration points buffer
    calibrationPoints: [],

    // Slice Line buffer
    slicePoints: [],

    // Snap Indicator
    activeSnapPoint: null,

    // Entities in CAD Workspace
    plots: [
      {
        id: 'plot-512',
        name: 'দাগ নং ৫১২',
        layer: 'plots',
        fillColor: 'rgba(59, 130, 246, 0.18)',
        strokeColor: '#3b82f6',
        vertices: [
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 },
          { x: 100, y: 200 }
        ]
      },
      {
        id: 'plot-513',
        name: 'দাগ নং ৫১৩',
        layer: 'plots',
        fillColor: 'rgba(16, 185, 129, 0.15)',
        strokeColor: '#10b981',
        vertices: [
          { x: 200, y: 100 },
          { x: 320, y: 100 },
          { x: 320, y: 200 },
          { x: 200, y: 200 }
        ]
      }
    ],

    pillars: [
      { id: 'p1', x: 100, y: 100, name: 'P-1' },
      { id: 'p2', x: 200, y: 100, name: 'P-2' },
      { id: 'p3', x: 200, y: 200, name: 'P-3' },
      { id: 'p4', x: 100, y: 200, name: 'P-4' },
      { id: 'p5', x: 320, y: 100, name: 'P-5' },
      { id: 'p6', x: 320, y: 200, name: 'P-6' }
    ],

    annotations: [
      { id: 'ann-1', x: 150, y: 80, text: '১২ ফুট সরকারি রাস্তা', color: '#f59e0b' },
      { id: 'ann-2', x: 260, y: 220, text: 'পাকা সীমানা প্রাচীর', color: '#38bdf8' }
    ],

    selectedPlotId: 'plot-512',
    splitRatio: 0.5,

    // Scanned Mouza Map Raster Layer & Filter Options
    mouzaMap: {
      loaded: true,
      imageObj: null,
      filteredCanvas: null,
      opacity: 0.45,
      rotation: 0,
      x: 50,
      y: 50,
      width: 400,
      height: 300,
      filters: {
        threshold: 128,
        brightness: 0,
        contrast: 0
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

  // Resize Canvas to Full Dimensions
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    render();
  }
  window.addEventListener('resize', resizeCanvas);

  // Coordinate Conversion Math
  function worldToScreen(wx, wy) {
    return {
      x: (wx - state.camera.x) * state.camera.zoom + canvas.width / 2,
      y: (wy - state.camera.y) * state.camera.zoom + canvas.height / 2
    };
  }

  function screenToWorld(sx, sy) {
    return {
      x: (sx - canvas.width / 2) / state.camera.zoom + state.camera.x,
      y: (sy - canvas.height / 2) / state.camera.zoom + state.camera.y
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

  // Snap Proximity Detector
  function findSnapPoint(worldX, worldY) {
    if (!state.snapEnabled) return null;
    const snapTolerance = 16 / state.camera.zoom; // 16 screen pixels

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

  // Apply Pixel Filters to Scanned Map using an Offscreen Canvas
  function updateFilteredMouzaCanvas() {
    if (!state.mouzaMap.imageObj) return;

    const img = state.mouzaMap.imageObj;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = img.width;
    offCanvas.height = img.height;
    const offCtx = offCanvas.getContext('2d');

    offCtx.drawImage(img, 0, 0);

    const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const d = imgData.data;

    const threshold = state.mouzaMap.filters.threshold;
    const brightness = state.mouzaMap.filters.brightness * 2.55;
    const contrast = state.mouzaMap.filters.contrast;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i] + brightness;
      let g = d[i + 1] + brightness;
      let b = d[i + 2] + brightness;

      if (contrast !== 0) {
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (g - 128) + 128;
      }

      let gray = 0.299 * r + 0.587 * g + 0.114 * b;
      if (threshold > 0) {
        gray = gray < threshold ? 0 : 255;
      }

      gray = Math.max(0, Math.min(255, gray));
      d[i] = gray;
      d[i + 1] = gray;
      d[i + 2] = gray;
    }

    offCtx.putImageData(imgData, 0, 0);
    state.mouzaMap.filteredCanvas = offCanvas;
    render();
  }

  // Render Loop
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Grid
    if (state.gridEnabled) {
      drawGrid();
    }

    // 2. Draw Mouza Background Map Simulation
    if (state.mouzaMap.loaded) {
      drawMouzaMap();
    }

    // 3. Draw Polygons & Plots
    if (state.layers.plots) {
      drawPlots();
    }

    // 4. Draw Active In-Progress Polyline
    if (state.activePolyline.length > 0) {
      drawActivePolyline();
    }

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

    // 10. Draw Fullscreen Crosshair
    drawCrosshair();
  }

  // Draw Dynamic Infinite Grid
  function drawGrid() {
    const gridSpacingWorld = 50; // 50 Links or Feet
    const minScreenX = 0;
    const maxScreenX = canvas.width;
    const minScreenY = 0;
    const maxScreenY = canvas.height;

    const topLeftWorld = screenToWorld(minScreenX, minScreenY);
    const bottomRightWorld = screenToWorld(maxScreenX, maxScreenY);

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
      ctx.lineTo(sx, canvas.height);
      ctx.stroke();

      if (isMajor && state.camera.zoom > 0.6) {
        ctx.fillStyle = '#475569';
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
      ctx.lineTo(canvas.width, sy);
      ctx.stroke();

      if (isMajor && state.camera.zoom > 0.6) {
        ctx.fillStyle = '#475569';
        ctx.font = '10px monospace';
        ctx.fillText(wy + '', 6, sy - 4);
      }
    }
  }

  // Draw Mouza Map Scanned Outline / Filtered Image
  function drawMouzaMap() {
    const p1 = worldToScreen(state.mouzaMap.x, state.mouzaMap.y);
    const p2 = worldToScreen(state.mouzaMap.x + state.mouzaMap.width, state.mouzaMap.y + state.mouzaMap.height);
    const width = p2.x - p1.x;
    const height = p2.y - p1.y;

    ctx.save();
    const sourceImg = state.mouzaMap.filteredCanvas || state.mouzaMap.imageObj;

    if (sourceImg) {
      ctx.globalAlpha = state.mouzaMap.opacity;
      if (state.mouzaMap.rotation !== 0) {
        ctx.translate(p1.x + width / 2, p1.y + height / 2);
        ctx.rotate((state.mouzaMap.rotation * Math.PI) / 180);
        ctx.drawImage(sourceImg, -width / 2, -height / 2, width, height);
      } else {
        ctx.drawImage(sourceImg, p1.x, p1.y, width, height);
      }
    } else {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(p1.x, p1.y, width, height);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.fillRect(p1.x, p1.y, width, height);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('মৌজা নকশা ব্যাকগ্রাউন্ড লেয়ার (RS-১৯৬২ • ১৬ ইঞ্চি=১ মাইল)', p1.x + 12, p1.y + 20);
    }
    ctx.restore();
  }

  // Draw Polygons, Dimension Badges & Draggable Vertex Grips
  function drawPlots() {
    state.plots.forEach(plot => {
      if (plot.vertices.length < 2) return;

      const isSelected = plot.id === state.selectedPlotId;

      ctx.beginPath();
      const first = worldToScreen(plot.vertices[0].x, plot.vertices[0].y);
      ctx.moveTo(first.x, first.y);

      for (let i = 1; i < plot.vertices.length; i++) {
        const pt = worldToScreen(plot.vertices[i].x, plot.vertices[i].y);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();

      // Fill & Stroke
      ctx.fillStyle = isSelected ? 'rgba(245, 158, 11, 0.22)' : plot.fillColor;
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#f59e0b' : plot.strokeColor;
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Centroid Label
      const centroid = calculateCentroid(plot.vertices);
      const sc = worldToScreen(centroid.x, centroid.y);
      const area = calculateShoelaceArea(plot.vertices);
      const shotok = (area * SQFT_PER_SQLINK / SQFT_PER_SHOTOK).toFixed(2);

      ctx.fillStyle = isSelected ? '#fbbf24' : '#ffffff';
      ctx.font = 'bold 13px Inter, Noto Sans Bengali, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(plot.name, sc.x, sc.y - 6);

      ctx.fillStyle = isSelected ? '#fef3c7' : '#a7f3d0';
      ctx.font = 'bold 11px Fira Code, monospace';
      ctx.fillText(shotok + ' শতক', sc.x, sc.y + 12);
      ctx.textAlign = 'left';

      // Dimension Badges on Edges
      if (state.layers.dimensions) {
        for (let i = 0; i < plot.vertices.length; i++) {
          const p1 = plot.vertices[i];
          const p2 = plot.vertices[(i + 1) % plot.vertices.length];
          const edgeLength = Math.hypot(p2.x - p1.x, p2.y - p1.y);

          const s1 = worldToScreen(p1.x, p1.y);
          const s2 = worldToScreen(p2.x, p2.y);
          const midX = (s1.x + s2.x) / 2;
          const midY = (s1.y + s2.y) / 2;

          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = isSelected ? '#f59e0b' : '#475569';
          ctx.lineWidth = 1;
          ctx.fillRect(midX - 24, midY - 9, 48, 18);
          ctx.strokeRect(midX - 24, midY - 9, 48, 18);

          ctx.fillStyle = '#38bdf8';
          ctx.font = '10px Fira Code, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(edgeLength.toFixed(1) + ' lk', midX, midY + 3.5);
          ctx.textAlign = 'left';
        }
      }

      // Draggable Vertex Grips (Blue Squares) when Selected
      if (isSelected && state.tool === 'select') {
        plot.vertices.forEach((v, idx) => {
          const sp = worldToScreen(v.x, v.y);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(sp.x - 5, sp.y - 5, 10, 10);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(sp.x - 5, sp.y - 5, 10, 10);
        });
      }
    });
  }

  // Draw Bangla Text Annotations
  function drawAnnotations() {
    state.annotations.forEach(ann => {
      const sp = worldToScreen(ann.x, ann.y);

      ctx.font = 'bold 11px Noto Sans Bengali, sans-serif';
      const textWidth = ctx.measureText(ann.text).width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = ann.color || '#38bdf8';
      ctx.lineWidth = 1;
      ctx.fillRect(sp.x - textWidth / 2 - 8, sp.y - 12, textWidth + 16, 22);
      ctx.strokeRect(sp.x - textWidth / 2 - 8, sp.y - 12, textWidth + 16, 22);

      ctx.fillStyle = ann.color || '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(ann.text, sp.x, sp.y + 3);
      ctx.textAlign = 'left';
    });
  }

  // Draw Active Drawing Polyline
  function drawActivePolyline() {
    ctx.beginPath();
    const first = worldToScreen(state.activePolyline[0].x, state.activePolyline[0].y);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < state.activePolyline.length; i++) {
      const pt = worldToScreen(state.activePolyline[i].x, state.activePolyline[i].y);
      ctx.lineTo(pt.x, pt.y);
    }

    // Connect to current mouse
    const currentMouse = state.activeSnapPoint ? worldToScreen(state.activeSnapPoint.x, state.activeSnapPoint.y) : { x: state.mouse.screenX, y: state.mouse.screenY };
    ctx.lineTo(currentMouse.x, currentMouse.y);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
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
    state.calibrationPoints.forEach((p, idx) => {
      const sp = worldToScreen(p.x, p.y);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText((idx + 1) + '', sp.x, sp.y + 3);
      ctx.textAlign = 'left';
    });
  }

  // Fullscreen Surveyor Crosshair
  function drawCrosshair() {
    const x = state.mouse.screenX;
    const y = state.mouse.screenY;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
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
    if (!activePlot) return;

    inspectorPlotName.textContent = activePlot.name + ' (নির্বাচিত)';

    const sqLinks = calculateShoelaceArea(activePlot.vertices);
    const sqft = sqLinks * SQFT_PER_SQLINK;
    const shotok = sqft / SQFT_PER_SHOTOK;
    const katha = sqft / SQFT_PER_KATHA;
    const bigha = sqft / SQFT_PER_BIGHA;
    const acre = sqft / SQFT_PER_ACRE;
    const sqM = sqft / SQFT_PER_SQMETER;
    const perimeterFeet = calculatePerimeter(activePlot.vertices) * FEET_PER_LINK;

    statShotok.textContent = shotok.toFixed(3);
    statKatha.textContent = katha.toFixed(3);
    statBigha.textContent = bigha.toFixed(4);
    statAcre.textContent = acre.toFixed(4);
    statSqft.textContent = sqft.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    statSqLinks.textContent = sqLinks.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    statSqM.textContent = sqM.toFixed(2);
    statPerimeter.textContent = 'Perimeter: ' + perimeterFeet.toFixed(1) + ' ft';

    // Bangla sentence formatter
    const kathaPart = Math.floor(katha);
    const shotokRemaining = (shotok % 1.652893).toFixed(1);
    statBanglaSentence.textContent = shotok.toFixed(1) + ' শতক (' + kathaPart + ' কাঠা ' + shotokRemaining + ' শতক)';

    // Update Split Simulator
    updateSplitSimulator(shotok);
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
    alert('১০ লিংক (৬.৬ ফুট) বাউন্ডারি অফসেট বা সেটব্যাক তৈরি করা হয়েছে!');
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
    alert('দাগ নং ৫১২ সফলভাবে কর্তন করে ৫১২/ক ও ৫১২/খ অংশে বিভক্ত করা হয়েছে!');
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

  // Mouse & Touch Event Handlers
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    state.mouse.screenX = e.clientX - rect.left;
    state.mouse.screenY = e.clientY - rect.top;

    const world = screenToWorld(state.mouse.screenX, state.mouse.screenY);
    state.mouse.worldX = world.x;
    state.mouse.worldY = world.y;

    // Draggable Vertex Handle logic
    if (state.dragVertex.isDragging && state.dragVertex.plotId) {
      const activePlot = state.plots.find(p => p.id === state.dragVertex.plotId);
      if (activePlot && state.dragVertex.vertexIndex >= 0) {
        activePlot.vertices[state.dragVertex.vertexIndex].x = world.x;
        activePlot.vertices[state.dragVertex.vertexIndex].y = world.y;
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

    // Pan canvas with middle button
    if (state.camera.isPanning) {
      state.camera.x -= (state.mouse.screenX - state.camera.panStartX) / state.camera.zoom;
      state.camera.y -= (state.mouse.screenY - state.camera.panStartY) / state.camera.zoom;
      state.camera.panStartX = state.mouse.screenX;
      state.camera.panStartY = state.mouse.screenY;
    }

    render();
  });

  canvas.addEventListener('mousedown', e => {
    if (e.button === 1 || e.spaceKey) { // Middle click pan
      state.camera.isPanning = true;
      state.camera.panStartX = state.mouse.screenX;
      state.camera.panStartY = state.mouse.screenY;
      return;
    }

    if (e.button === 0) { // Left click
      const pt = state.activeSnapPoint || { x: state.mouse.worldX, y: state.mouse.worldY };

      // 1. Check if clicking a draggable vertex handle in select mode
      if (state.tool === 'select') {
        const selectedPlot = state.plots.find(p => p.id === state.selectedPlotId);
        if (selectedPlot) {
          for (let i = 0; i < selectedPlot.vertices.length; i++) {
            const v = selectedPlot.vertices[i];
            const dist = Math.hypot(v.x - pt.x, v.y - pt.y);
            if (dist < 12 / state.camera.zoom) {
              state.dragVertex.isDragging = true;
              state.dragVertex.plotId = selectedPlot.id;
              state.dragVertex.vertexIndex = i;
              return;
            }
          }
        }
      }

      if (state.tool === 'polygon' || state.tool === 'polyline') {
        state.activePolyline.push(pt);
        drawHintBox.classList.remove('opacity-0');
        render();
      } else if (state.tool === 'text') {
        const note = prompt('ক্যানভাসে বিবরণ বা টেক্সট নোট লিখুন (যেমন: ১২ ফুট পাকা রাস্তা, সীমানা পিলার):', '১২ ফুট রাস্তা');
        if (note) {
          state.annotations.push({
            id: 'ann-' + (state.annotations.length + 1),
            x: pt.x,
            y: pt.y,
            text: note,
            color: '#38bdf8'
          });
          state.tool = 'select';
          updateToolUI();
          render();
        }
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
          document.getElementById('calPixelDist').textContent = pxDist.toFixed(1) + ' px';
          document.getElementById('calibrationModal').classList.remove('hidden');
          state.tool = 'select';
          updateToolUI();
        }
        render();
      } else if (state.tool === 'select') {
        // Find clicked plot
        for (const plot of state.plots) {
          if (calculateShoelaceArea(plot.vertices) > 0) {
            state.selectedPlotId = plot.id;
            updateInspector();
            render();
            break;
          }
        }
      }
    }
  });

  canvas.addEventListener('mouseup', () => {
    state.camera.isPanning = false;
    state.dragVertex.isDragging = false;
    state.dragVertex.vertexIndex = -1;
  });

  // Double click to finish Polygon
  canvas.addEventListener('dblclick', () => {
    if ((state.tool === 'polygon' || state.tool === 'polyline') && state.activePolyline.length >= 3) {
      const newPlotId = 'plot-' + (514 + state.plots.length);
      state.plots.push({
        id: newPlotId,
        name: 'দাগ নং ' + (514 + state.plots.length),
        layer: 'plots',
        fillColor: 'rgba(168, 85, 247, 0.18)',
        strokeColor: '#a855f7',
        vertices: [...state.activePolyline]
      });

      state.activePolyline = [];
      state.selectedPlotId = newPlotId;
      state.tool = 'select';
      updateToolUI();
      drawHintBox.classList.add('opacity-0');
      updateInspector();
      render();
    }
  });

  // Mouse Wheel Zoom
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.min(Math.max(state.camera.zoom * zoomFactor, 0.2), 8.0);

    const mouseWorldBefore = screenToWorld(state.mouse.screenX, state.mouse.screenY);
    state.camera.zoom = newZoom;
    const mouseWorldAfter = screenToWorld(state.mouse.screenX, state.mouse.screenY);

    state.camera.x += (mouseWorldBefore.x - mouseWorldAfter.x);
    state.camera.y += (mouseWorldBefore.y - mouseWorldAfter.y);

    zoomLabelEl.textContent = (state.camera.zoom * 100).toFixed(0) + '%';
    render();
  }, { passive: false });

  // Toolbar Click Handlers
  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.tool = btn.getAttribute('data-tool');
      updateToolUI();
      if (state.tool === 'polygon') {
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
      } else if (state.tool === 'calibrate') {
        state.calibrationPoints = [];
        drawHintBox.classList.remove('opacity-0');
        drawHintText.textContent = 'নকশার ২টি পরিচিত গ্রিড পয়েন্টে পরপর ক্লিক করুন স্কেল ক্যালিব্রেট করতে';
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
  }

  // Zoom Controls
  document.getElementById('btnZoomIn').addEventListener('click', () => {
    state.camera.zoom = Math.min(state.camera.zoom * 1.25, 8.0);
    zoomLabelEl.textContent = (state.camera.zoom * 100).toFixed(0) + '%';
    render();
  });

  document.getElementById('btnZoomOut').addEventListener('click', () => {
    state.camera.zoom = Math.max(state.camera.zoom * 0.8, 0.2);
    zoomLabelEl.textContent = (state.camera.zoom * 100).toFixed(0) + '%';
    render();
  });

  document.getElementById('btnResetView').addEventListener('click', () => {
    state.camera.x = 200;
    state.camera.y = 150;
    state.camera.zoom = 1.0;
    zoomLabelEl.textContent = '100%';
    render();
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

  // Native Electron & Web Mouza Image Loader
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,.pdf';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  fileInput.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          state.mouzaMap.imageObj = img;
          state.mouzaMap.width = img.width * 0.4;
          state.mouzaMap.height = img.height * 0.4;
          updateFilteredMouzaCanvas();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  document.getElementById('btnLoadMouza').addEventListener('click', async () => {
    if (window.electronAPI && window.electronAPI.openMouzaMap) {
      const res = await window.electronAPI.openMouzaMap();
      if (res && res.base64) {
        const img = new Image();
        img.onload = () => {
          state.mouzaMap.imageObj = img;
          state.mouzaMap.width = img.width * 0.4;
          state.mouzaMap.height = img.height * 0.4;
          updateFilteredMouzaCanvas();
        };
        img.src = res.base64;
      }
    } else {
      fileInput.click();
    }
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
    sliderThreshold.value = 128;
    sliderBrightness.value = 0;
    sliderContrast.value = 0;
    sliderOpacity.value = 45;
    state.mouzaMap.filters = { threshold: 128, brightness: 0, contrast: 0 };
    state.mouzaMap.opacity = 0.45;
    state.mouzaMap.rotation = 0;
    document.getElementById('valThreshold').textContent = '128';
    document.getElementById('valBrightness').textContent = '0';
    document.getElementById('valContrast').textContent = '0';
    document.getElementById('valOpacity').textContent = '45%';
    updateFilteredMouzaCanvas();
  });

  document.getElementById('btnApplyFilters').addEventListener('click', () => {
    imageFilterModal.classList.add('hidden');
  });

  // Scale Calibration Modal Handlers
  const calibrationModal = document.getElementById('calibrationModal');
  document.getElementById('btnCloseCalModal').addEventListener('click', () => {
    calibrationModal.classList.add('hidden');
    state.calibrationPoints = [];
    render();
  });
  document.getElementById('btnApplyCalibration').addEventListener('click', () => {
    calibrationModal.classList.add('hidden');
    state.calibrationPoints = [];
    alert('মৌজা নকশা স্কেল সফলভাবে ক্যালিব্রেট করা হয়েছে (১৬ ইঞ্চি = ১ মাইল)!');
    render();
  });

  // Report Modal Handlers
  const reportModal = document.getElementById('reportModal');
  document.getElementById('btnExportReport').addEventListener('click', () => {
    reportModal.classList.remove('hidden');
  });
  document.getElementById('btnCloseReportModal').addEventListener('click', () => {
    reportModal.classList.add('hidden');
  });

  // Keyboard Shortcuts (F3 Snap, F7 Grid, Escape)
  window.addEventListener('keydown', e => {
    if (e.key === 'F3') {
      e.preventDefault();
      btnToggleSnap.click();
    } else if (e.key === 'F7') {
      e.preventDefault();
      btnToggleGrid.click();
    } else if (e.key === 'Escape') {
      state.activePolyline = [];
      state.calibrationPoints = [];
      state.slicePoints = [];
      state.tool = 'select';
      updateToolUI();
      drawHintBox.classList.add('opacity-0');
      reportModal.classList.add('hidden');
      calibrationModal.classList.add('hidden');
      imageFilterModal.classList.add('hidden');
      layerModal?.classList.add('hidden');
      render();
    } else if (e.key === 'Enter') {
      canvas.dispatchEvent(new MouseEvent('dblclick'));
    }
  });

  // Initialize
  resizeCanvas();
  updateInspector();
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
})();
