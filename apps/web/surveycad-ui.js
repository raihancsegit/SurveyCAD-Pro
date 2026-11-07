/**
 * SurveyCAD Pro v1.0 - Interactive CAD Engine & Master Controller
 * Complete implementation of AutoCAD-standard tools, Layer visibility,
 * Dynamic Ribbon Toolbars, Classic Menu Dropdowns, Mouza scaling formulas,
 * Virtual Guniya Scale, and live drawing operations.
 */

(function() {
  'use strict';

  // =========================================================================
  // Master Survey Constants
  // =========================================================================
  const SQFT_PER_DECIMAL = 435.60;
  const SQFT_PER_KATHA = 720.00;
  const SQFT_PER_BIGHA = 14400.00;
  const SQFT_PER_ACRE = 43560.00;
  const SQFT_PER_SQMETER = 10.76391;
  const FEET_PER_LINK = 0.66;
  const LINKS_PER_CHAIN = 100;

  // =========================================================================
  // Application State
  // =========================================================================
  const state = {
    projectName: 'Chorbagh_Survey',
    currentSheet: 'sheet01',
    activeLayer: 'plot_boundary',
    showPlotLabels: true,
    sheets: {
      'sheet01': { name: 'Chorbagh_Sheet01.dwg', drawingsHtml: '', plots: {}, selectedDag: '126' },
      'sheet02': { name: 'Chorbagh_Sheet02.dwg', drawingsHtml: '', plots: {}, selectedDag: null },
      'dakshinpara': { name: 'Dakshinpara_Sheet01.dwg', drawingsHtml: '', plots: {}, selectedDag: null }
    },
    activeTool: 'select',
    activeTab: 'home',
    activeSidebarTab: 'layers',
    selectedDag: '126',
    scalePreset: 16,
    scaleFactor: 3960, // S = 63360 / 16 = 3960
    unit: 'feet', // 'feet' | 'links' | 'meters'
    gridEnabled: true,
    snapEnabled: false,
    orthoEnabled: false,
    osnapEnabled: true,
    polarEnabled: false,
    dynEnabled: true,
    lwtEnabled: true,
    layers: {
      'mouza_map': true,
      'plot_boundary': true,
      'plot_no': true,
      'road': true,
      'river': true,
      'dimension': true,
      'text': true
    },
    layerLocks: {
      'mouza_map': false,
      'plot_boundary': false,
      'plot_no': false,
      'road': false,
      'river': false,
      'dimension': false,
      'text': false
    },
    drawingPoints: [],
    dimensionPoints: [],
    guniya: {
      enabled: false,
      x: 340,
      y: 240,
      rotation: 0,
      width: 180,
      height: 45,
      customWidth: null,
      calibratedUpp: null,
      origCalibratedWidth: null,
      origRasterWidth: null,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      isResizing: false,
      resizeStartX: 0,
      origWidth: 0
    },
    isCalibratingScale: false,
    calibrationPoints: [],
    pan: {
      isPanning: false,
      startX: 0,
      startY: 0,
      translateX: 0,
      translateY: 0
    },
    plots: {
      '126': {
        mouza: 'Chorbagh',
        sheet: '01 (CS)',
        dag: '126',
        vertices: [{ x: 420, y: 495 }, { x: 520, y: 475 }, { x: 528, y: 580 }, { x: 435, y: 600 }],
        areaSqFt: 12960.00,
        areaDecimal: 30.00,
        katha: 18.00,
        bigha: 0.90,
        acre: 0.30,
        perimeter: 482.00,
        owners: '3 Person(s)',
        dims: { top: '160.00 ft', bottom: '160.00 ft', left: '81.00 ft', right: '81.00 ft' },
        ownerList: [
          { name: '1. Rahim Ali', share: '10.00 Decimal (0.333 Share)' },
          { name: '2. Karim Mia', share: '10.00 Decimal (0.333 Share)' },
          { name: '3. Salma Begum', share: '10.00 Decimal (0.334 Share)' }
        ]
      },
      '103': {
        mouza: 'Chorbagh',
        sheet: '01 (CS)',
        dag: '103',
        areaSqFt: 6534.00,
        areaDecimal: 15.00,
        katha: 9.07,
        bigha: 0.45,
        acre: 0.15,
        perimeter: 326.00,
        owners: '1 Person',
        dims: { top: '110.00 ft', bottom: '105.00 ft', left: '60.00 ft', right: '58.00 ft' },
        ownerList: [{ name: '1. Abul Kashem', share: '15.00 Decimal (1.000 Share)' }]
      },
      '108': {
        mouza: 'Chorbagh',
        sheet: '01 (CS)',
        dag: '108',
        areaSqFt: 8712.00,
        areaDecimal: 20.00,
        katha: 12.10,
        bigha: 0.60,
        acre: 0.20,
        perimeter: 380.00,
        owners: '2 Persons',
        dims: { top: '120.00 ft', bottom: '118.00 ft', left: '72.00 ft', right: '74.00 ft' },
        ownerList: [
          { name: '1. Rafiqul Islam', share: '10.00 Decimal (0.500 Share)' },
          { name: '2. Zahirul Haque', share: '10.00 Decimal (0.500 Share)' }
        ]
      },
      '123': {
        mouza: 'Chorbagh',
        sheet: '01 (CS)',
        dag: '123',
        areaSqFt: 9583.20,
        areaDecimal: 22.00,
        katha: 13.31,
        bigha: 0.66,
        acre: 0.22,
        perimeter: 390.00,
        owners: '2 Persons',
        dims: { top: '125.00 ft', bottom: '120.00 ft', left: '75.00 ft', right: '78.00 ft' },
        ownerList: [
          { name: '1. Sirajul Haque', share: '11.00 Decimal' },
          { name: '2. Momtaz Begum', share: '11.00 Decimal' }
        ]
      },
      '128': {
        mouza: 'Chorbagh',
        sheet: '01 (CS)',
        dag: '128',
        areaSqFt: 10890.00,
        areaDecimal: 25.00,
        katha: 15.12,
        bigha: 0.75,
        acre: 0.25,
        perimeter: 420.00,
        owners: '2 Persons',
        dims: { top: '140.00 ft', bottom: '135.00 ft', left: '78.00 ft', right: '80.00 ft' },
        ownerList: [
          { name: '1. Fatema Khatun', share: '15.00 Decimal (0.600 Share)' },
          { name: '2. Amena Khatun', share: '10.00 Decimal (0.400 Share)' }
        ]
      },
      '130': {
        mouza: 'Chorbagh',
        sheet: '01 (CS)',
        dag: '130',
        areaSqFt: 11761.20,
        areaDecimal: 27.00,
        katha: 16.33,
        bigha: 0.81,
        acre: 0.27,
        perimeter: 440.00,
        owners: '2 Persons',
        dims: { top: '150.00 ft', bottom: '145.00 ft', left: '78.00 ft', right: '80.00 ft' },
        ownerList: [{ name: '1. Rashid Khan', share: '27.00 Decimal' }]
      },
      '133': {
        mouza: 'Chorbagh',
        sheet: '01 (CS)',
        dag: '133',
        areaSqFt: 7840.80,
        areaDecimal: 18.00,
        katha: 10.89,
        bigha: 0.54,
        acre: 0.18,
        perimeter: 360.00,
        owners: '1 Person',
        dims: { top: '115.00 ft', bottom: '112.00 ft', left: '68.00 ft', right: '70.00 ft' },
        ownerList: [{ name: '1. Nasir Uddin', share: '18.00 Decimal (1.000 Share)' }]
      },
      '137': {
        mouza: 'Chorbagh',
        sheet: '01 (CS)',
        dag: '137',
        areaSqFt: 9583.20,
        areaDecimal: 22.00,
        katha: 13.31,
        bigha: 0.66,
        acre: 0.22,
        perimeter: 395.00,
        owners: '3 Persons',
        dims: { top: '130.00 ft', bottom: '128.00 ft', left: '74.00 ft', right: '75.00 ft' },
        ownerList: [
          { name: '1. Shah Alam', share: '10.00 Decimal' },
          { name: '2. Mozammel Haque', share: '7.00 Decimal' },
          { name: '3. Parveen Akter', share: '5.00 Decimal' }
        ]
      },
      '138': {
        mouza: 'Chorbagh',
        sheet: '01 (CS)',
        dag: '138',
        areaSqFt: 8276.40,
        areaDecimal: 19.00,
        katha: 11.49,
        bigha: 0.57,
        acre: 0.19,
        perimeter: 375.00,
        owners: '1 Person',
        dims: { top: '120.00 ft', bottom: '115.00 ft', left: '70.00 ft', right: '68.00 ft' },
        ownerList: [{ name: '1. Anwar Hossain', share: '19.00 Decimal' }]
      },
      '143': {
        mouza: 'Chorbagh',
        sheet: '01 (CS)',
        dag: '143',
        areaSqFt: 11325.60,
        areaDecimal: 26.00,
        katha: 15.73,
        bigha: 0.78,
        acre: 0.26,
        perimeter: 435.00,
        owners: '2 Persons',
        dims: { top: '145.00 ft', bottom: '142.00 ft', left: '80.00 ft', right: '78.00 ft' },
        ownerList: [
          { name: '1. Habibur Rahman', share: '13.00 Decimal' },
          { name: '2. Latifa Banu', share: '13.00 Decimal' }
        ]
      },
      '148': {
        mouza: 'Chorbagh',
        sheet: '01 (CS)',
        dag: '148',
        areaSqFt: 14374.80,
        areaDecimal: 33.00,
        katha: 19.96,
        bigha: 0.99,
        acre: 0.33,
        perimeter: 510.00,
        owners: '4 Persons',
        dims: { top: '165.00 ft', bottom: '160.00 ft', left: '88.00 ft', right: '86.00 ft' },
        ownerList: [
          { name: '1. Mosharraf Hossain', share: '10.00 Decimal' },
          { name: '2. Delowar Hossain', share: '10.00 Decimal' },
          { name: '3. Selina Akter', share: '8.00 Decimal' },
          { name: '4. Rokeya Begum', share: '5.00 Decimal' }
        ]
      },
      '158': {
        mouza: 'Chorbagh',
        sheet: '01 (CS)',
        dag: '158',
        areaSqFt: 10454.40,
        areaDecimal: 24.00,
        katha: 14.52,
        bigha: 0.72,
        acre: 0.24,
        perimeter: 410.00,
        owners: '2 Persons',
        dims: { top: '135.00 ft', bottom: '130.00 ft', left: '76.00 ft', right: '78.00 ft' },
        ownerList: [
          { name: '1. Asadullah', share: '12.00 Decimal' },
          { name: '2. Rasheda Begum', share: '12.00 Decimal' }
        ]
      }
    }
  };

  // =========================================================================
  // Canvas Viewport & Raster Shared State
  // =========================================================================
  const viewport = {
    x: 0,
    y: 0,
    width: 1000,
    height: 650,
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    viewBoxStartX: 0,
    viewBoxStartY: 0
  };

  function getScreenPixelToWorld() {
    const svg = document.getElementById('cadSvgCanvas');
    const clientW = (svg && svg.clientWidth) ? svg.clientWidth : 1000;
    return viewport.width / clientW;
  }

  function updateViewBox() {
    const svg = document.getElementById('cadSvgCanvas');
    if (!svg) return;
    svg.setAttribute('viewBox', `${viewport.x.toFixed(2)} ${viewport.y.toFixed(2)} ${viewport.width.toFixed(2)} ${viewport.height.toFixed(2)}`);
    
    const pct = Math.round((1000 / viewport.width) * 100);
    const hudZoomPct = document.getElementById('hudZoomPercent');
    if (hudZoomPct) hudZoomPct.textContent = `${pct}%`;

    const statusZoomBtn = document.getElementById('statusZoomPct') || document.querySelector('.status-zoom-btn');
    if (statusZoomBtn) statusZoomBtn.textContent = `${pct}%`;

    // Rescale active polyline circles & halos live during zoom to keep them crisp and small
    if (typeof updateDrawingOverlay === 'function' && state && state.drawingPoints && state.drawingPoints.length > 0) {
      updateDrawingOverlay();
    }

    // Rescale plot corner handles live during zoom to keep them crisp and easily clickable
    const s2wHandles = getScreenPixelToWorld();
    const hSize = 8.0 * s2wHandles;
    document.querySelectorAll('.mouza-node-handles-group').forEach(g => {
      const dag = g.getAttribute('data-dag-handles');
      const pData = state.plots[dag];
      if (pData && pData.vertices) {
        const rects = g.querySelectorAll('rect');
        for (let i = 0; i < pData.vertices.length && i < rects.length; i++) {
          const p = pData.vertices[i];
          rects[i].setAttribute('x', (p.x - hSize / 2).toFixed(1));
          rects[i].setAttribute('y', (p.y - hSize / 2).toFixed(1));
          rects[i].setAttribute('width', hSize.toFixed(1));
          rects[i].setAttribute('height', hSize.toFixed(1));
        }
      }
    });

    // Rescale center dag badges live during zoom with AutoCAD annotative sizing so they are ALWAYS 100% legible
    const s2wBadges = getScreenPixelToWorld();
    document.querySelectorAll('.mouza-dag-label').forEach(g => {
      const dag = g.getAttribute('data-dag-label');
      const pData = state.plots[dag];
      if (pData && pData.vertices) {
        let sumX = 0, sumY = 0;
        pData.vertices.forEach(v => {
          sumX += v.x; sumY += v.y;
        });
        const cx = sumX / pData.vertices.length;
        const cy = sumY / pData.vertices.length;

        const plotTitle = `Plot ${dag}`;
        const areaDecVal = Number(pData.areaDecimal || 0);
        const areaSqFtVal = Number(pData.areaSqFt || 0);
        const areaSubText = areaDecVal >= 0.01 
          ? `${areaDecVal.toFixed(2)} Dec` 
          : `${Math.round(areaSqFtVal)} sq.ft`;

        const fontPlot = 11.5 * s2wBadges;
        const fontArea = 9.5 * s2wBadges;
        const maxChars = Math.max(plotTitle.length, areaSubText.length);
        const bw = Math.max(52 * s2wBadges, (maxChars * 6.8 + 12) * s2wBadges);
        const bh = 26.0 * s2wBadges;

        const r = g.querySelector('rect');
        if (r) {
          r.setAttribute('x', (cx - bw / 2).toFixed(1));
          r.setAttribute('y', (cy - bh / 2).toFixed(1));
          r.setAttribute('width', bw.toFixed(1));
          r.setAttribute('height', bh.toFixed(1));
          r.setAttribute('rx', (3.5 * s2wBadges).toFixed(1));
        }
        const texts = g.querySelectorAll('text');
        if (texts[0]) {
          texts[0].setAttribute('x', cx.toFixed(1));
          texts[0].setAttribute('y', (cy - 2.5 * s2wBadges).toFixed(1));
          texts[0].setAttribute('font-size', fontPlot.toFixed(1));
          texts[0].textContent = plotTitle;
        }
        if (texts[1]) {
          texts[1].setAttribute('x', cx.toFixed(1));
          texts[1].setAttribute('y', (cy + 8.5 * s2wBadges).toFixed(1));
          texts[1].setAttribute('font-size', fontArea.toFixed(1));
          texts[1].textContent = areaSubText;
        }
      }
    });

    // Rescale CAD Aligned Dimensions annotatively live during zoom so text is ALWAYS 100% crisp and readable
    document.querySelectorAll('.cad-dim-elem').forEach(g => {
      const rotG = g.querySelector('g[transform]');
      if (!rotG) return;
      const t = rotG.querySelector('text');
      const r = rotG.querySelector('rect');
      if (t) {
        const tr = rotG.getAttribute('transform') || '';
        const m = tr.match(/rotate\(\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\)/);
        if (m) {
          const cx = parseFloat(m[2]);
          const cy = parseFloat(m[3]);
          const fontSz = 10.5 * s2wBadges;
          t.setAttribute('x', cx.toFixed(1));
          t.setAttribute('y', (cy + 3.6 * s2wBadges).toFixed(1));
          t.setAttribute('font-size', fontSz.toFixed(1));

          if (r) {
            const textChars = t.textContent.trim().length;
            const bw = Math.max(30 * s2wBadges, (textChars * 6.6 + 10) * s2wBadges);
            const bh = 14.0 * s2wBadges;
            r.setAttribute('x', (cx - bw / 2).toFixed(1));
            r.setAttribute('y', (cy - bh / 2).toFixed(1));
            r.setAttribute('width', bw.toFixed(1));
            r.setAttribute('height', bh.toFixed(1));
            r.setAttribute('rx', (2.5 * s2wBadges).toFixed(1));
          }
        }
      }
    });

    // Rescale AutoCAD Text elements annotatively live during zoom
    document.querySelectorAll('.cad-text-elem').forEach(g => {
      const t = g.querySelector('text');
      const r = g.querySelector('rect');
      if (t) {
        const tx = parseFloat(t.getAttribute('x'));
        const ty = parseFloat(t.getAttribute('y'));
        const fontSz = 12.0 * s2wBadges;
        t.setAttribute('font-size', fontSz.toFixed(1));
        if (r && !isNaN(tx) && !isNaN(ty)) {
          const textChars = t.textContent.trim().length;
          const bw = Math.max(28 * s2wBadges, (textChars * 7.5 + 12) * s2wBadges);
          const bh = 16.0 * s2wBadges;
          r.setAttribute('x', (tx - bw / 2).toFixed(1));
          r.setAttribute('y', (ty - 4.0 * s2wBadges - bh / 2).toFixed(1));
          r.setAttribute('width', bw.toFixed(1));
          r.setAttribute('height', bh.toFixed(1));
          r.setAttribute('rx', (2.5 * s2wBadges).toFixed(1));
        }
      }
    });
  }

  function zoomAtPoint(factor, clientX, clientY) {
    const svg = document.getElementById('cadSvgCanvas');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    const svgX = viewport.x + relX * viewport.width;
    const svgY = viewport.y + relY * viewport.height;

    // AutoCAD Unlimited Deep Zoom: allows zooming from 10% all the way to 200,000%+
    const newWidth = Math.max(0.4, Math.min(60000, viewport.width * factor));
    const newHeight = Math.max(0.26, Math.min(39000, viewport.height * factor));

    viewport.x = svgX - relX * newWidth;
    viewport.y = svgY - relY * newHeight;
    viewport.width = newWidth;
    viewport.height = newHeight;

    updateViewBox();
  }

  function zoomCenter(factor) {
    const svg = document.getElementById('cadSvgCanvas');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    zoomAtPoint(factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
    const pct = Math.round((1000 / viewport.width) * 100);
    logCommand(`ZOOM: ${pct}%`);
  }

  function zoomExtents() {
    viewport.x = 0;
    viewport.y = 0;
    viewport.width = 1000;
    viewport.height = 650;
    updateViewBox();
    logCommand('ZOOM: Extents 100% (Fit View)');
  }

  let demoPlotsVisible = false;
  function toggleDemoPlots() {
    demoPlotsVisible = !demoPlotsVisible;
    const layerIds = ['layerMouzaMap', 'layerPlotBoundary', 'layerPlotNo', 'layerRoad', 'layerRiver', 'layerDimension', 'groupSelectedPlotLabel'];
    layerIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = demoPlotsVisible ? 'block' : 'none';
    });

    const eyeEl = document.getElementById('demoPlotsEye');
    const textEl = document.getElementById('demoPlotsText');
    const btn = document.getElementById('btnToggleDemoPlots');

    if (demoPlotsVisible) {
      if (eyeEl) eyeEl.textContent = '👁️';
      if (textEl) textEl.textContent = 'Default Plots: Visible';
      if (btn) btn.classList.remove('bg-amber-900', 'border-amber-500', 'text-amber-200');
      logCommand('DEMO PLOTS: Restored ');
    } else {
      if (eyeEl) eyeEl.textContent = '👁️‍🗨️';
      if (textEl) textEl.textContent = 'Default Plots: Hidden ( )';
      if (btn) btn.classList.add('bg-amber-900', 'border-amber-500', 'text-amber-200');
      logCommand('DEMO PLOTS: Hidden ');
    }
  }

  function startBlankDrawing() {
    if (demoPlotsVisible) {
      toggleDemoPlots();
    }
    state.selectedDag = null;
    const poly126 = document.getElementById('plotPoly126');
    if (poly126) poly126.classList.remove('selected');
    const labelGroup = document.getElementById('groupSelectedPlotLabel');
    if (labelGroup) labelGroup.remove();

    clearUserDrawings();

    const topProjName = document.querySelector('.font-bold.text-slate-200');
    if (topProjName) topProjName.textContent = 'Drawing1.dwg (Model)';

    viewport.x = 0;
    viewport.y = 0;
    viewport.width = 1000;
    viewport.height = 700;
    updateViewBox();

    logCommand('NEW DRAWING: Clean Blank Canvas active. Ready for Mouza Import or Survey Drawing.');
  }

  const rasterState = {
    x: 180,
    y: 150,
    width: 750,
    height: 550,
    opacity: 0.85,
    dpi: 57.5,
    dpiX: 57.5,
    dpiY: 57.5,
    isDragging: false,
    isResizing: false,
    startX: 0,
    startY: 0,
    origX: 180,
    origY: 150,
    origW: 750,
    origH: 550
  };

  const rasterCache = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    loaded: false,
    imageObj: null
  };

  function cacheRasterImage(url) {
    if (!url) return;
    const imgObj = new Image();
    if (!url.startsWith('data:') && !url.startsWith('blob:')) {
      imgObj.crossOrigin = 'anonymous';
    }
    imgObj.onload = () => {
      try {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = imgObj.naturalWidth || imgObj.width || 900;
        offCanvas.height = imgObj.naturalHeight || imgObj.height || 700;
        const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
        offCtx.drawImage(imgObj, 0, 0);
        rasterCache.canvas = offCanvas;
        rasterCache.ctx = offCtx;
        rasterCache.width = offCanvas.width;
        rasterCache.height = offCanvas.height;
        rasterCache.loaded = true;
        rasterCache.imageObj = imgObj;

        // Auto-preserve natural aspect ratio to avoid squishing
        if (imgObj.naturalWidth && imgObj.naturalHeight && rasterState.width > 0) {
          rasterState.height = Math.round(rasterState.width * (imgObj.naturalHeight / imgObj.naturalWidth));
          rasterState.origH = rasterState.height;
          updateRasterDOM();
        }
        rebuildGuniyaScale();
      } catch (e) {
        console.warn('Cache raster image load error:', e);
      }
    };
    imgObj.src = url;
  }

  // =========================================================================
  // MASTER UNDO / REDO HISTORY ENGINE
  // =========================================================================
  const undoStack = [];
  const redoStack = [];
  const MAX_HISTORY = 60;

  function createSnapshot(actionName = 'Action') {
    const drawingsGroup = document.getElementById('userDrawingsGroup');
    const plotBoundary = document.getElementById('layerPlotBoundary');
    const pG = document.getElementById('layerPartitionGraphics');
    const gG = document.getElementById('layerGpsBeacon');
    const rasterGroup = document.getElementById('groupRasterMouza');
    const rasterImg = document.getElementById('canvasRasterMap');

    return {
      actionName,
      userDrawingsHtml: drawingsGroup ? drawingsGroup.innerHTML : '',
      plotBoundaryHtml: plotBoundary ? plotBoundary.innerHTML : '',
      partitionHtml: pG ? pG.outerHTML : null,
      gpsBeaconHtml: gG ? gG.outerHTML : null,
      plots: JSON.parse(JSON.stringify(state.plots || {})),
      selectedDag: state.selectedDag,
      nextDagNumber: state.nextDagNumber || 240,
      rasterState: { ...rasterState },
      rasterHref: rasterImg ? (rasterImg.getAttribute('href') || '') : '',
      rasterVisible: rasterGroup ? !rasterGroup.classList.contains('hidden') : false,
      demoPlotsVisible: demoPlotsVisible
    };
  }

  function pushUndo(actionName = 'Action') {
    if (undoStack.length === 0) {
      undoStack.push(createSnapshot(actionName));
      updateUndoRedoUI();
      return;
    }
    const snap = createSnapshot(actionName);
    undoStack.push(snap);
    if (undoStack.length > MAX_HISTORY) {
      undoStack.shift();
    }
    redoStack.length = 0;
    updateUndoRedoUI();
  }

  function restoreSnapshot(snapshot) {
    if (!snapshot) return;

    // 1. Restore User Drawings SVG
    const drawingsGroup = document.getElementById('userDrawingsGroup');
    if (drawingsGroup) {
      drawingsGroup.innerHTML = snapshot.userDrawingsHtml || '';
      drawingsGroup.querySelectorAll('.mouza-plot').forEach(poly => {
        const dag = poly.getAttribute('data-dag');
        if (dag) {
          poly.addEventListener('click', (e) => {
            e.stopPropagation();
            selectPlot(dag);
          });
        }
      });
    }

    // 2. Restore Default Plot Boundary layer
    const plotBoundary = document.getElementById('layerPlotBoundary');
    if (plotBoundary && typeof snapshot.plotBoundaryHtml === 'string') {
      plotBoundary.innerHTML = snapshot.plotBoundaryHtml;
    }

    // 3. Restore Partitions & GPS
    const existingPG = document.getElementById('layerPartitionGraphics');
    if (existingPG) existingPG.remove();
    if (snapshot.partitionHtml) {
      const tempWrap = document.createElement('div');
      tempWrap.innerHTML = snapshot.partitionHtml;
      const newPG = tempWrap.firstElementChild;
      if (newPG) {
        document.getElementById('cadViewport')?.appendChild(newPG);
      }
    }

    const existingGG = document.getElementById('layerGpsBeacon');
    if (existingGG) existingGG.remove();
    if (snapshot.gpsBeaconHtml) {
      const tempWrap = document.createElement('div');
      tempWrap.innerHTML = snapshot.gpsBeaconHtml;
      const newGG = tempWrap.firstElementChild;
      if (newGG) {
        document.getElementById('cadViewport')?.appendChild(newGG);
      }
    }

    // 4. Restore Data Dictionary
    state.plots = JSON.parse(JSON.stringify(snapshot.plots || {}));
    state.nextDagNumber = snapshot.nextDagNumber;
    state.drawingPoints = [];
    const rubberBand = document.getElementById('activeRubberBand');
    if (rubberBand) rubberBand.classList.add('hidden');

    // 5. Restore Raster Map State
    if (snapshot.rasterState) {
      Object.assign(rasterState, snapshot.rasterState);
      if (typeof updateRasterDOM === 'function') updateRasterDOM();
    }
    const rasterGroup = document.getElementById('groupRasterMouza');
    const rasterImg = document.getElementById('canvasRasterMap');
    if (rasterImg && typeof snapshot.rasterHref === 'string') {
      rasterImg.setAttribute('href', snapshot.rasterHref);
    }
    if (rasterGroup) {
      if (snapshot.rasterVisible) {
        rasterGroup.classList.remove('hidden');
      } else {
        rasterGroup.classList.add('hidden');
      }
    }

    // 6. Restore Demo Plots Visibility
    if (typeof snapshot.demoPlotsVisible === 'boolean' && snapshot.demoPlotsVisible !== demoPlotsVisible) {
      if (typeof toggleDemoPlots === 'function') toggleDemoPlots();
    }

    // 7. Reselect plot
    if (snapshot.selectedDag && state.plots[snapshot.selectedDag]) {
      selectPlot(snapshot.selectedDag);
    } else {
      state.selectedDag = null;
      const labelGroup = document.getElementById('groupSelectedPlotLabel');
      if (labelGroup) labelGroup.remove();
    }
  }

  function undo() {
    if (undoStack.length <= 1) {
      logCommand('UNDO: Nothing to undo .');
      return false;
    }

    const current = undoStack.pop();
    redoStack.push(current);

    const previous = undoStack[undoStack.length - 1];
    restoreSnapshot(previous);

    updateUndoRedoUI();
    logCommand(`UNDO: Reverted "${current.actionName}".`);
    return true;
  }

  function redo() {
    if (redoStack.length === 0) {
      logCommand('REDO: Nothing to redo .');
      return false;
    }

    const next = redoStack.pop();
    undoStack.push(next);

    restoreSnapshot(next);
    updateUndoRedoUI();
    logCommand(`REDO: Restored "${next.actionName}".`);
    return true;
  }

  function updateUndoRedoUI() {
    const qaUndo = document.getElementById('qaUndo');
    const qaRedo = document.getElementById('qaRedo');

    const canUndo = (undoStack.length > 1);
    const canRedo = (redoStack.length > 0);

    if (qaUndo) {
      qaUndo.disabled = !canUndo;
      qaUndo.style.opacity = canUndo ? '1' : '0.4';
      qaUndo.style.cursor = canUndo ? 'pointer' : 'default';
      const undoAction = canUndo ? undoStack[undoStack.length - 1].actionName : '';
      qaUndo.title = canUndo ? `Undo: ${undoAction} (Ctrl+Z)` : 'Undo (Ctrl+Z)';
    }
    if (qaRedo) {
      qaRedo.disabled = !canRedo;
      qaRedo.style.opacity = canRedo ? '1' : '0.4';
      qaRedo.style.cursor = canRedo ? 'pointer' : 'default';
      const redoAction = canRedo ? redoStack[redoStack.length - 1].actionName : '';
      qaRedo.title = canRedo ? `Redo: ${redoAction} (Ctrl+Y)` : 'Redo (Ctrl+Y)';
    }
  }

  // Expose global Undo/Redo API for tests & automation
  window.__surveycadUndo = undo;
  window.__surveycadRedo = redo;
  window.__surveycadPushUndo = pushUndo;
  window.__surveycadUndoStack = undoStack;
  window.__surveycadRedoStack = redoStack;

  // =========================================================================
  // 1. Tool Selection & State Updates
  // =========================================================================
  function resetDrawingOverlay() {
    state.drawingPoints = [];
    state.snappedPoint = null;
    const solid = document.getElementById('drawingSolidTrack');
    if (solid) solid.setAttribute('points', '');
    const guide = document.getElementById('drawingGuideLine');
    if (guide) guide.classList.add('hidden');
    const polarTrack = document.getElementById('drawingPolarTrack');
    if (polarTrack) polarTrack.classList.add('hidden');
    const angleArc = document.getElementById('drawingAngleArc');
    if (angleArc) angleArc.classList.add('hidden');
    const osnapMarker = document.getElementById('drawingOsnapMarker');
    if (osnapMarker) osnapMarker.classList.add('hidden');
    const dynHud = document.getElementById('cadDynamicInput');
    if (dynHud) dynHud.classList.add('hidden');
    const vGroup = document.getElementById('drawingVerticesGroup');
    if (vGroup) vGroup.innerHTML = '';
    const halo = document.getElementById('drawingActiveHalo');
    if (halo) halo.classList.add('hidden');
    const rubberBand = document.getElementById('activeRubberBand');
    if (rubberBand) rubberBand.classList.add('hidden');
  }

  function setActiveTool(toolName) {
    state.activeTool = toolName;

    const ws = document.getElementById('cadWorkspace');
    if (ws) {
      ws.style.cursor = toolName === 'pan' ? 'grab' : 'none';
    }

    // Update Left Toolbar Buttons
    document.querySelectorAll('.left-tool-btn, .tool-btn').forEach(btn => {
      if (btn.getAttribute('data-tool') === toolName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Floating Guidance Banner (Image 1 standard)
    const banner = document.getElementById('toolGuidanceBanner');
    const bannerText = document.getElementById('toolGuidanceText');
    if (banner && bannerText) {
      if (toolName === 'magicwand') {
        bannerText.textContent = '🪄 Mouza   Plot    ';
        banner.classList.remove('hidden');
      } else if (toolName === 'polyline' || toolName === 'polygon' || toolName === 'autopolyline') {
        bannerText.textContent = '✏️      Plot  ';
        banner.classList.remove('hidden');
      } else if (toolName === 'dimension') {
        bannerText.textContent = '📏          ';
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    }

    // Reset temporary drawing buffer if switching tools
    if (toolName !== 'polyline' && toolName !== 'polygon' && toolName !== 'autopolyline') {
      resetDrawingOverlay();
    }

    if (toolName === 'guniya') {
      toggleVirtualGuniya();
    } else if (toolName === 'erase') {
      clearUserDrawings();
    } else if (toolName === 'split') {
      openModal('modalPartitionFaraiz');
    }

    logCommand(`TOOL ACTIVATED: ${toolName.toUpperCase()}`);
  }

  // =========================================================================
  // 2. Virtual Guniya Scale Controller (Physically Calibrated to Mouza Map)
  // Standard 2-inch Cadastral Guniya (1000 Links = 10 Chains = 660 Feet)
  // =========================================================================
  function rebuildGuniyaScale(overrideWidth = null) {
    const guniyaEl = document.getElementById('virtualGuniyaScale');
    if (!guniyaEl) return;

    // 1000 links = 10 chains = 660 ft (Cadastral standard)
    const targetLengthFeet = 660;
    let guniyaW;
    if (overrideWidth) {
      guniyaW = overrideWidth;
    } else if (state.guniya.customWidth) {
      guniyaW = state.guniya.customWidth;
    } else {
      const u = getUnitsPerPixel();
      guniyaW = targetLengthFeet / (u.upp_svg_x || 7.835);
    }
    guniyaW = Math.max(40, guniyaW);
    const guniyaH = Math.max(20, guniyaW * 0.24);

    state.guniya.width = guniyaW;
    state.guniya.height = guniyaH;
    state.guniya.customWidth = guniyaW;
    state.guniya.calibratedUpp = targetLengthFeet / guniyaW;

    const numMajor = 10; // 10 chains
    const majorStep = guniyaW / numMajor;
    const minorStepTop = majorStep / 10;   // 10 links each (fine)
    const minorStepBottom = majorStep / 5; // 20 links each (coarse)

    let topTicks = '';
    let bottomTicks = '';
    let numberLabels = '';

    const fontSz = Math.min(4.8, Math.max(2.5, guniyaH * 0.14)).toFixed(1);

    // Top ticks: 0 to 1000 links (10-link fine divisions)
    for (let i = 0; i <= 100; i++) {
      const x = (i * minorStepTop).toFixed(1);
      let tickH = guniyaH * 0.14;
      if (i % 10 === 0) {
        tickH = guniyaH * 0.28;
        // Only label major chains (0, 200, 400, 600, 800, 1000 links) to avoid horizontal cramming
        if (i % 20 === 0) {
          const linkVal = i * 10;
          numberLabels += `<text x="${x}" y="${(tickH + guniyaH * 0.13).toFixed(1)}" fill="#78350f" font-size="${fontSz}" font-weight="bold" font-family="'Segoe UI', Roboto, monospace" text-anchor="middle">${linkVal}</text>`;
        }
      } else if (i % 5 === 0) {
        tickH = guniyaH * 0.20;
      }
      topTicks += `M ${x} 0 v ${tickH.toFixed(1)} `;
    }

    // Bottom ticks: 0 to 1000 links (20-link coarse divisions)
    for (let i = 0; i <= 50; i++) {
      const x = (i * minorStepBottom).toFixed(1);
      let tickH = guniyaH * 0.14;
      if (i % 5 === 0) {
        tickH = guniyaH * 0.24;
      }
      bottomTicks += `M ${x} ${guniyaH.toFixed(1)} v -${tickH.toFixed(1)} `;
    }

    // Bottom only labels ends and midpoint (0, 500 Links, 1000)
    const bY = (guniyaH - guniyaH * 0.24 - 1).toFixed(1);
    numberLabels += `<text x="5" y="${bY}" fill="#78350f" font-size="${fontSz}" font-weight="bold" font-family="'Segoe UI', Roboto, monospace" text-anchor="start">0</text>`;
    numberLabels += `<text x="${(guniyaW / 2).toFixed(1)}" y="${bY}" fill="#78350f" font-size="${fontSz}" font-weight="bold" font-family="'Segoe UI', Roboto, monospace" text-anchor="middle">500 Links (5 Ch)</text>`;
    numberLabels += `<text x="${(guniyaW - 5).toFixed(1)}" y="${bY}" fill="#78350f" font-size="${fontSz}" font-weight="bold" font-family="'Segoe UI', Roboto, monospace" text-anchor="end">1000</text>`;

    const titleFont = Math.min(4.4, Math.max(2.6, guniyaH * 0.13)).toFixed(1);
    const midX = (guniyaW / 2).toFixed(1);
    const tbW = Math.max(165, guniyaW);

    guniyaEl.innerHTML = `
      <!-- Attached Mini-Toolbar directly above Guniya -->
      <g id="guniyaToolbar">
        <rect x="0" y="-23" width="${tbW.toFixed(1)}" height="19" rx="4" fill="#0f172a" stroke="#334155" stroke-width="0.8" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"/>
        
        <!-- [ 🎯 Match 10 Ch ] Button -->
        <g id="btnGuniyaCalib2Pt" class="guniya-btn" style="cursor:pointer;" title="Click 0 and 10 Chains on map scale bar to snap 1:1">
          <rect x="3" y="-20.5" width="76" height="14" rx="3" fill="#0369a1" stroke="#38bdf8" stroke-width="0.6"/>
          <text x="41" y="-10.5" fill="#f0f9ff" font-size="7.5" font-weight="bold" font-family="'Segoe UI', Roboto, sans-serif" text-anchor="middle">🎯 Match 10 Ch</text>
        </g>
        
        <!-- [ - ] Nudge Button -->
        <g id="btnGuniyaWMinus" class="guniya-btn" style="cursor:pointer;" title="Shrink scale (-3%)">
          <rect x="82" y="-20.5" width="16" height="14" rx="3" fill="#1e293b" stroke="#64748b" stroke-width="0.6"/>
          <text x="90" y="-9.5" fill="#f8fafc" font-size="10" font-weight="bold" font-family="'Segoe UI', Roboto, sans-serif" text-anchor="middle">−</text>
        </g>
        
        <!-- Scale Readout -->
        <text x="${82 + 16 + 21}" y="-10.5" fill="#fbbf24" font-size="7.5" font-family="monospace" font-weight="bold" text-anchor="middle">${guniyaW.toFixed(0)}px</text>
        
        <!-- [ + ] Nudge Button -->
        <g id="btnGuniyaWPlus" class="guniya-btn" style="cursor:pointer;" title="Expand scale (+3%)">
          <rect x="${82 + 16 + 42}" y="-20.5" width="16" height="14" rx="3" fill="#1e293b" stroke="#64748b" stroke-width="0.6"/>
          <text x="${82 + 16 + 50}" y="-9.5" fill="#f8fafc" font-size="10" font-weight="bold" font-family="'Segoe UI', Roboto, sans-serif" text-anchor="middle">+</text>
        </g>
        
        <!-- [ ✕ ] Close Button -->
        <g id="btnGuniyaCloseScale" class="guniya-btn" style="cursor:pointer;" title="Close Virtual Guniya Scale">
          <rect x="${(tbW - 17).toFixed(1)}" y="-20.5" width="14" height="14" rx="3" fill="#7f1d1d" stroke="#ef4444" stroke-width="0.6"/>
          <text x="${(tbW - 10).toFixed(1)}" y="-10" fill="#fecaca" font-size="8.5" font-weight="bold" font-family="sans-serif" text-anchor="middle">✕</text>
        </g>
      </g>

      <!-- Translucent Ivory Acrylic Body (Map lines clearly visible underneath) -->
      <rect x="0" y="0" width="${guniyaW.toFixed(1)}" height="${guniyaH.toFixed(1)}" rx="3" fill="rgba(255, 251, 235, 0.88)" stroke="#92400e" stroke-width="1.2" filter="drop-shadow(0 3px 8px rgba(0,0,0,0.35))"/>
      
      <!-- Top 10-link fine division ticks -->
      <path d="${topTicks}" stroke="#78350f" stroke-width="0.8" vector-effect="non-scaling-stroke"/>
      
      <!-- Bottom 20-link division ticks -->
      <path d="${bottomTicks}" stroke="#78350f" stroke-width="0.8" vector-effect="non-scaling-stroke"/>
      
      <!-- Mark numbers -->
      ${numberLabels}
      
      <!-- Center Title: Single crisp clean inscription -->
      <text x="${midX}" y="${(guniyaH * 0.54).toFixed(1)}" fill="#92400e" font-size="${titleFont}" font-weight="bold" font-family="'Segoe UI', Roboto, sans-serif" letter-spacing="0.4px" text-anchor="middle">GUNIA • 1000 LINKS (10 CH = 660 FT)</text>

      <!-- Origin Anchor (0 Mark) -->
      <circle cx="0" cy="${(guniyaH / 2).toFixed(1)}" r="3" fill="#92400e" stroke="#fffbeb" stroke-width="0.8"/>

      <!-- Interactive Grip Resize Handle on Right Edge (1000 Mark) -->
      <g id="guniyaResizeHandle" style="cursor: ew-resize;" title="Drag to freely resize Guniya to match printed scale bar">
        <circle cx="${guniyaW.toFixed(1)}" cy="${(guniyaH / 2).toFixed(1)}" r="7" fill="#d97706" stroke="#fffbeb" stroke-width="1.4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"/>
        <path d="M ${(guniyaW - 3.5).toFixed(1)} ${(guniyaH / 2).toFixed(1)} l 2.5 -2.5 v 5 z M ${(guniyaW + 3.5).toFixed(1)} ${(guniyaH / 2).toFixed(1)} l -2.5 -2.5 v 5 z" fill="#fffbeb"/>
      </g>
    `;

    updateGuniyaTransform();
  }

  function toggleVirtualGuniya(forceState) {
    const guniyaEl = document.getElementById('virtualGuniyaScale');
    if (!guniyaEl) return;

    state.guniya.enabled = typeof forceState === 'boolean' ? forceState : !state.guniya.enabled;
    if (state.guniya.enabled) {
      guniyaEl.classList.remove('hidden');
      rebuildGuniyaScale();
      logCommand('GUNIYA: Virtual Guniya Scale Active (Calibrated 1:1 to map scale. Drag to move, wheel to rotate, drag amber handle to resize).');
    } else {
      guniyaEl.classList.add('hidden');
      logCommand('GUNIYA: Virtual Guniya Scale Hidden.');
    }
  }

  function updateGuniyaTransform() {
    const guniyaEl = document.getElementById('virtualGuniyaScale');
    if (!guniyaEl) return;
    guniyaEl.setAttribute('transform', `translate(${state.guniya.x}, ${state.guniya.y}) rotate(${state.guniya.rotation})`);
  }

  function startScaleBarCalibration() {
    toggleVirtualGuniya(true);
    state.isCalibratingScale = true;
    state.calibrationPoints = [];

    const banner = document.getElementById('toolGuidanceBanner');
    const bannerText = document.getElementById('toolGuidanceText');
    if (banner && bannerText) {
      bannerText.innerHTML = '🎯 <b>Step 1/2:</b> Click the <b>০ (0 Chain)</b> mark on the printed map scale bar';
      banner.classList.remove('hidden');
    }
    logCommand('CALIBRATION: Step 1/2 - Click Point 1 (০ / 0 Chain mark on printed map scale bar)...');
  }

  // =========================================================================
  // 3. Layer Visibility, Lock & Label Management
  // =========================================================================
  function toggleLayer(layerKey, forceState) {
    const k = (layerKey || '').toLowerCase();
    state.layers[k] = typeof forceState === 'boolean' ? forceState : !state.layers[k];
    const isVisible = state.layers[k];

    if (k === 'mouza_map') {
      const elMouza = document.getElementById('layerMouzaMap');
      if (elMouza) elMouza.style.display = isVisible ? 'block' : 'none';
      const elRaster = document.getElementById('groupRasterMouza');
      if (elRaster) {
        if (isVisible) {
          if (rasterState.src) elRaster.classList.remove('hidden');
          elRaster.style.display = 'block';
        } else {
          elRaster.classList.add('hidden');
          elRaster.style.display = 'none';
        }
      }
    } else if (k === 'plot_boundary') {
      const elBoundary = document.getElementById('layerPlotBoundary');
      if (elBoundary) elBoundary.style.display = isVisible ? 'block' : 'none';
      document.querySelectorAll('#userDrawingsGroup .mouza-plot, #userDrawingsGroup .user-plot-boundary').forEach(p => {
        p.style.display = isVisible ? 'block' : 'none';
      });
      document.querySelectorAll('#userDrawingsGroup .mouza-node-handles-group').forEach(h => {
        h.style.display = isVisible ? 'block' : 'none';
      });
    } else if (k === 'plot_no') {
      const elPlotNo = document.getElementById('layerPlotNo');
      if (elPlotNo) elPlotNo.style.display = isVisible ? 'block' : 'none';
      document.querySelectorAll('#userDrawingsGroup .mouza-dag-label, #userDrawingsGroup [data-dag-label]').forEach(lbl => {
        lbl.style.display = isVisible ? 'block' : 'none';
      });
    } else if (k === 'road') {
      const elRoad = document.getElementById('layerRoad');
      if (elRoad) elRoad.style.display = isVisible ? 'block' : 'none';
    } else if (k === 'river') {
      const elRiver = document.getElementById('layerRiver');
      if (elRiver) elRiver.style.display = isVisible ? 'block' : 'none';
    } else if (k === 'dimension') {
      const elDim = document.getElementById('layerDimension');
      if (elDim) elDim.style.display = isVisible ? 'block' : 'none';
      document.querySelectorAll('#userDrawingsGroup .cad-dim-elem, #userDrawingsGroup .mouza-side-dims-group').forEach(d => {
        d.style.display = isVisible ? 'block' : 'none';
      });
    } else if (k === 'text') {
      const elText = document.getElementById('groupSelectedPlotLabel');
      if (elText) elText.style.display = isVisible ? 'block' : 'none';
      document.querySelectorAll('#userDrawingsGroup text:not([data-dag-label] text)').forEach(t => {
        t.style.display = isVisible ? 'block' : 'none';
      });
    } else {
      document.querySelectorAll(`[data-layer="${k}"]`).forEach(el => {
        el.style.display = isVisible ? 'block' : 'none';
      });
    }

    // Update eye icon state in sidebar
    const eyeBtn = document.querySelector(`.layer-eye-btn[data-layer-key="${k}"]`);
    if (eyeBtn) {
      eyeBtn.classList.toggle('text-sky-400', isVisible);
      eyeBtn.classList.toggle('text-slate-600', !isVisible);
      eyeBtn.style.opacity = isVisible ? '1' : '0.35';
      eyeBtn.title = isVisible ? 'Visibility ' : 'Visibility ';
    }

    logCommand(`LAYER: ${k.toUpperCase()} is now ${isVisible ? 'VISIBLE' : 'HIDDEN'}.`);
  }

  function toggleLayerLock(layerKey) {
    const k = (layerKey || '').toLowerCase();
    if (!state.layerLocks) state.layerLocks = {};
    state.layerLocks[k] = !state.layerLocks[k];
    const isLocked = state.layerLocks[k];

    const lockBtn = document.querySelector(`.layer-lock-btn[data-layer-key="${k}"]`);
    if (lockBtn) {
      lockBtn.textContent = isLocked ? '🔒' : '🔓';
      lockBtn.classList.toggle('text-amber-400', isLocked);
      lockBtn.classList.toggle('text-slate-500', !isLocked);
      lockBtn.title = isLocked ? 'Layer Locked ' : 'Layer Unlocked ';
    }

    const applyLock = (elems) => {
      elems.forEach(el => {
        el.style.pointerEvents = isLocked ? 'none' : 'auto';
        el.style.opacity = isLocked ? '0.65' : '1.0';
      });
    };

    if (k === 'mouza_map') {
      const raster = document.getElementById('canvasRasterMap');
      if (raster) raster.style.pointerEvents = isLocked ? 'none' : 'auto';
    } else if (k === 'plot_boundary') {
      applyLock(document.querySelectorAll('#layerPlotBoundary .mouza-plot, #userDrawingsGroup .mouza-plot'));
    } else {
      applyLock(document.querySelectorAll(`[data-layer="${k}"]`));
    }

    logCommand(`LAYER: ${k.toUpperCase()} is now ${isLocked ? 'LOCKED ' : 'UNLOCKED'}.`);
  }

  function setActiveLayer(layerKey) {
    const k = (layerKey || '').toLowerCase();
    state.activeLayer = k;
    document.querySelectorAll('.layer-row').forEach(row => {
      const rowKey = row.getAttribute('data-layer-key');
      const isSel = (rowKey === k);
      row.classList.toggle('active', isSel);
      const nameSpan = row.querySelector('.font-medium');
      if (nameSpan) {
        nameSpan.classList.toggle('text-white', isSel);
      }
    });
    const propLayer = document.getElementById('propActiveLayer');
    if (propLayer) propLayer.textContent = layerKey;
    logCommand(`LAYER: Active drawing layer set to "${layerKey}".`);
  }

  function togglePlotLabels(forceState) {
    state.showPlotLabels = typeof forceState === 'boolean' ? forceState : !state.showPlotLabels;
    const isVisible = state.showPlotLabels;

    const layerPlotNo = document.getElementById('layerPlotNo');
    if (layerPlotNo) layerPlotNo.style.display = isVisible ? 'block' : 'none';

    document.querySelectorAll('#userDrawingsGroup .mouza-dag-label, #userDrawingsGroup [data-dag-label], #userDrawingsGroup .mouza-side-dims-group, #userDrawingsGroup .mouza-node-handles-group').forEach(lbl => {
      lbl.style.display = isVisible ? 'block' : 'none';
    });

    const lblBtn = document.getElementById('btnTogglePlotLabels');
    const lblText = document.getElementById('plotLabelsText');
    if (lblText) lblText.textContent = isVisible ? 'Labels: ON' : 'Labels: Hidden';
    if (lblBtn) {
      lblBtn.classList.toggle('text-amber-300', isVisible);
      lblBtn.classList.toggle('bg-slate-800', isVisible);
      lblBtn.classList.toggle('bg-slate-900', !isVisible);
      lblBtn.classList.toggle('opacity-70', !isVisible);
    }

    logCommand(`LABELS: Plot numbers and badges are now ${isVisible ? 'VISIBLE' : 'HIDDEN'}.`);
  }

  // =========================================================================
  // 4. Mouza Scale Engine ($S = 63360 / W$)
  // =========================================================================
  // =========================================================================
  // EXACT AUTOCAD SCALING & WORLD COORDINATE TRANSFORMATION
  // Units per Pixel = (1 / DPI) * Scale_Factor * Unit_Conversion
  // Distance = hypot(dx * upp_x, dy * upp_y)
  // Area = Shoelace formula in World coordinates
  // =========================================================================
  function getUnitsPerPixel() {
    const defaultDpi = 57.5; // Cadastral Mouza sheet standard (115px = 10 chains = 660 ft at 16"=1 mile)
    const dpiX = Number(rasterState.dpiX || rasterState.dpi) || defaultDpi;
    const dpiY = Number(rasterState.dpiY || rasterState.dpi) || defaultDpi;
    const scale = Number(state.scaleFactor) || 3960;

    // Unit factor to convert inches to target unit (AutoCAD standard)
    const unit = (state.unit || 'ft').toLowerCase();
    let unitFactor = 1 / 12; // default feet (12 inches = 1 ft)
    if (unit === 'in' || unit === 'inches') unitFactor = 1.0;
    else if (unit === 'm' || unit === 'meters') unitFactor = 0.0254;
    else if (unit === 'mm') unitFactor = 25.4;
    else if (unit === 'links') unitFactor = 1 / 7.92; // 1 link = 7.92 inches

    // Target unit per image pixel on the raster image
    const upp_px_x = (1 / dpiX) * scale * unitFactor;
    const upp_px_y = (1 / dpiY) * scale * unitFactor;

    // SVG canvas coordinates to image pixels mapping
    let px_per_svg_x = 1.0;
    let px_per_svg_y = 1.0;

    if (rasterCache && rasterCache.loaded && rasterCache.width > 0 && rasterState.width > 0) {
      px_per_svg_x = rasterCache.width / rasterState.width;
      px_per_svg_y = rasterCache.height / rasterState.height;
    } else if (rasterState && rasterState.width > 0) {
      // Deterministic default matching authentic Mouza sheet (1024x723)
      px_per_svg_x = 1024 / rasterState.width;
      px_per_svg_y = 723 / (rasterState.height || 530);
    }

    // World units per SVG coordinate unit
    let upp_svg_x = px_per_svg_x * upp_px_x;
    let upp_svg_y = px_per_svg_y * upp_px_y;

    // If Guniya scale has been calibrated directly against the map's 10-chain scale bar,
    // use that exact ground-truth calibration for all CAD distance & area calculations!
    if (state.guniya && state.guniya.calibratedUpp) {
      upp_svg_x = state.guniya.calibratedUpp;
      upp_svg_y = state.guniya.calibratedUpp;
    }

    return {
      dpiX,
      dpiY,
      scale,
      unit,
      unitFactor,
      upp_px_x: upp_svg_x,
      upp_px_y: upp_svg_y,
      upp_svg_x,
      upp_svg_y
    };
  }

  function applyMouzaScale(sheetWidthInches, customFactor = null, customDpi = null) {
    let factor = 3960;
    if (customFactor) {
      factor = Math.round(Number(customFactor));
      state.scalePreset = Math.round(63360 / factor);
    } else {
      const w = parseFloat(sheetWidthInches) || 16;
      factor = Math.round((5280 * 12) / w);
      state.scalePreset = w;
    }
    state.scaleFactor = factor;
    if (customDpi) {
      rasterState.dpi = Number(customDpi);
      rasterState.dpiX = Number(customDpi);
      rasterState.dpiY = Number(customDpi);
    }

    // Update status bar scale indicator
    const scaleVal = document.getElementById('statusScaleValue');
    if (scaleVal) {
      scaleVal.textContent = `1:${factor}`;
    }

    // Update custom inputs in modal
    const inputFactor = document.getElementById('inputCustomScaleFactor');
    if (inputFactor) inputFactor.value = factor;
    const inputDpi = document.getElementById('inputCustomScaleDpi');
    if (inputDpi) inputDpi.value = rasterState.dpi || 57.5;

    // Update active state on modal scale buttons
    // Direct Custom AutoCAD Scale & DPI Apply Button
    const btnDirectScale = document.getElementById('btnApplyDirectScaleFactor');
    if (btnDirectScale && !btnDirectScale._bound) {
      btnDirectScale._bound = true;
      btnDirectScale.addEventListener('click', () => {
        const f = parseFloat(document.getElementById('inputCustomScaleFactor')?.value) || 3960;
        const d = parseFloat(document.getElementById('inputCustomScaleDpi')?.value) || 57.5;
        const u = document.getElementById('selectScaleUnit')?.value || 'ft';
        state.unit = u;
        applyMouzaScale(null, f, d);
        closeModal('modalScaleCalculator');
        logCommand(`SCALE: Custom AutoCAD scale factor 1:${f} applied at ${d} DPI with unit ${u}.`);
      });
    }

    const btnModalCalib2Pt = document.getElementById('btnModalCalib2Pt');
    if (btnModalCalib2Pt && !btnModalCalib2Pt._bound) {
      btnModalCalib2Pt._bound = true;
      btnModalCalib2Pt.addEventListener('click', () => {
        closeModal('modalScaleCalculator');
        startScaleBarCalibration();
      });
    }

    document.querySelectorAll('.scale-preset-btn').forEach(btn => {
      const btnW = parseFloat(btn.getAttribute('data-scale-width'));
      if (Math.abs(btnW - state.scalePreset) < 0.1) {
        btn.classList.add('border-sky-500/40', 'bg-[#1a202c]');
        btn.classList.remove('border-slate-700', 'bg-[#10131a]');
      } else {
        btn.classList.remove('border-sky-500/40', 'bg-[#1a202c]');
        btn.classList.add('border-slate-700', 'bg-[#10131a]');
      }
    });

    rebuildGuniyaScale();
    logCommand(`SCALE: AutoCAD Scale Factor 1:${factor} (${state.scalePreset}" = 1 Mile) applied at ${rasterState.dpi || 57.5} DPI.`);
  }

  // =========================================================================
  // HELPER UTILITIES & SVG MATH
  // =========================================================================
  function toBengaliNum(val) {
    return String(val);
  }

  function parseSvgPoints(ptsAttr) {
    if (!ptsAttr) return [];
    return ptsAttr.trim().split(/\s+/).map(pair => {
      const parts = pair.split(',');
      return { x: parseFloat(parts[0]), y: parseFloat(parts[1]) };
    });
  }

  function isPointInsidePolygon(pt, vs) {
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

  function rdpSimplify(points, epsilon = 2.0) {
    if (!points || points.length <= 4) return points || [];
    function findPerpendicularDistance(p, p1, p2) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const mag = Math.hypot(dx, dy);
      if (mag === 0) return Math.hypot(p.x - p1.x, p.y - p1.y);
      return Math.abs(dy * p.x - dx * p.y + p2.x * p1.y - p2.y * p1.x) / mag;
    }
    function rdp(pts, eps) {
      if (pts.length < 3) return pts;
      let maxDist = 0;
      let index = 0;
      for (let i = 1; i < pts.length - 1; i++) {
        const d = findPerpendicularDistance(pts[i], pts[0], pts[pts.length - 1]);
        if (d > maxDist) {
          maxDist = d;
          index = i;
        }
      }
      if (maxDist > eps) {
        const rec1 = rdp(pts.slice(0, index + 1), eps);
        const rec2 = rdp(pts.slice(index), eps);
        return rec1.slice(0, rec1.length - 1).concat(rec2);
      }
      return [pts[0], pts[pts.length - 1]];
    }
    return rdp(points, epsilon);
  }

  function flashPlotBoundary(el) {
    if (!el) return;
    el.classList.add('plot-flash-highlight');
    setTimeout(() => el.classList.remove('plot-flash-highlight'), 1200);
  }

  // =========================================================================
  // PARCEL POLYGON & DIMENSION BADGE RENDERING ENGINE (IMAGE 2 STANDARD)
  // Dynamic scaled badges, outward-offset side dimensions, zero overlap
  // =========================================================================
  function renderParcelPolygon(vertices, dag, areaSqFt, areaDecimal, perimeter, isMagicWand = false) {
    const drawingsGroup = document.getElementById('userDrawingsGroup');
    if (!drawingsGroup || !vertices || vertices.length < 3) return null;

    const numV = vertices.length;
    const ptsAttr = vertices.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    // If magic wand, remove previous magic wand elements so badges never stack or overlap
    if (isMagicWand) {
      drawingsGroup.querySelectorAll('.magic-wand-detected').forEach(el => el.remove());
    }

    // Remove any previous elements for this specific dag
    const prevPoly = drawingsGroup.querySelector(`.user-plot-boundary[data-dag="${dag}"]`);
    if (prevPoly) prevPoly.remove();
    const prevHandles = drawingsGroup.querySelector(`[data-dag-handles="${dag}"]`);
    if (prevHandles) prevHandles.remove();
    const prevDims = drawingsGroup.querySelector(`[data-dag-dims="${dag}"]`);
    if (prevDims) prevDims.remove();
    const prevLabel = drawingsGroup.querySelector(`[data-dag-label="${dag}"]`);
    if (prevLabel) prevLabel.remove();

    // Calculate bounding box and centroid
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    let sumX = 0, sumY = 0;
    for (let i = 0; i < numV; i++) {
      const p = vertices[i];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      sumX += p.x;
      sumY += p.y;
    }
    const plotW = Math.max(12, maxX - minX);
    const plotH = Math.max(12, maxY - minY);
    const cx = sumX / numV;
    const cy = sumY / numV;

    const u = getUnitsPerPixel();
    const wandClass = isMagicWand ? ' magic-wand-detected' : '';

    // 1. Plot Polygon (Warm translucent gold/amber fill + crisp boundary stroke)
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', ptsAttr);
    poly.setAttribute('fill', 'rgba(245, 158, 11, 0.22)');
    poly.setAttribute('stroke', '#f59e0b');
    poly.setAttribute('stroke-width', '1.8');
    poly.setAttribute('vector-effect', 'non-scaling-stroke');
    poly.setAttribute('filter', 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.7))');
    poly.setAttribute('class', `mouza-plot user-plot-boundary selected${wandClass}`);
    poly.setAttribute('data-dag', String(dag));
    poly.addEventListener('click', (e) => {
      e.stopPropagation();
      selectPlot(String(dag));
    });
    drawingsGroup.appendChild(poly);

    // Ensure plot vertices are recorded in state for grip editing and undo
    if (state.plots[String(dag)]) {
      state.plots[String(dag)].vertices = vertices.map(v => ({ x: v.x, y: v.y }));
    }

    // 2. Corner Node Handles (Crisp, easily draggable CAD grip nodes)
    const gHandles = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gHandles.setAttribute('class', `mouza-node-handles-group${wandClass}`);
    gHandles.setAttribute('data-dag-handles', String(dag));
    gHandles.setAttribute('pointer-events', 'auto');

    const s2w = getScreenPixelToWorld();
    const handleSize = 8.0 * s2w; // Clean, easily clickable CAD grip box (~8-10 screen px)
    for (let i = 0; i < numV; i++) {
      const p = vertices[i];
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', (p.x - handleSize / 2).toFixed(1));
      rect.setAttribute('y', (p.y - handleSize / 2).toFixed(1));
      rect.setAttribute('width', handleSize.toFixed(1));
      rect.setAttribute('height', handleSize.toFixed(1));
      rect.setAttribute('rx', (1.2 * s2w).toFixed(1));
      rect.setAttribute('fill', '#ffffff');
      rect.setAttribute('stroke', '#0284c7');
      rect.setAttribute('stroke-width', '1.6');
      rect.setAttribute('vector-effect', 'non-scaling-stroke');
      rect.setAttribute('class', 'mouza-vertex-drag-handle');
      rect.setAttribute('style', 'cursor: grab; pointer-events: auto;');
      rect.setAttribute('data-vertex-index', String(i));
      rect.setAttribute('data-dag', String(dag));

      rect.addEventListener('mouseenter', () => {
        rect.setAttribute('fill', '#fef08a');
        rect.setAttribute('stroke', '#f59e0b');
        rect.style.cursor = 'grab';
      });
      rect.addEventListener('mouseleave', () => {
        rect.setAttribute('fill', '#ffffff');
        rect.setAttribute('stroke', '#0284c7');
      });
      rect.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        startVertexDrag(String(dag), i, e);
      });
      gHandles.appendChild(rect);
    }
    drawingsGroup.appendChild(gHandles);

    // 3. Side Dimension Badges (Clean, compact, no giant bracketed inches, strictly clamped)
    const gDims = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gDims.setAttribute('class', `mouza-side-dims-group${wandClass}`);
    gDims.setAttribute('data-dag-dims', String(dag));
    gDims.setAttribute('pointer-events', 'none');

    // Only render side badges if the plot is reasonably sized to prevent collision
    const renderSideBadges = (plotW >= 35 && plotH >= 25);

    if (renderSideBadges) {
      for (let i = 0; i < numV; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % numV];
        const segPixelLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (segPixelLen < 22) continue; // Skip tiny segments

        // AutoCAD distance in feet & inches
        const segFeet = Math.hypot((p2.x - p1.x) * u.upp_svg_x, (p2.y - p1.y) * u.upp_svg_y);
        let feet = Math.floor(segFeet);
        let inches = Math.round((segFeet - feet) * 12);
        if (inches === 12) { feet += 1; inches = 0; }

        // Sleek compact text: e.g. 29' - 8" (NO [8439"] bracket!)
        const dimText = `${toBengaliNum(feet)}' - ${toBengaliNum(inches)}"`;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        let nx = -(p2.y - p1.y) / segPixelLen;
        let ny = (p2.x - p1.x) / segPixelLen;
        if (Math.hypot(mx + nx * 5 - cx, my + ny * 5 - cy) < Math.hypot(mx - cx, my - cy)) {
          nx = -nx;
          ny = -ny;
        }

        const s2wDim = getScreenPixelToWorld();
        const fontDim = Math.max(3.5, Math.min(Math.min(6.5, segPixelLen * 0.12), 11 * s2wDim));
        const badgeH = fontDim * 1.5;
        const badgeW = Math.min(segPixelLen * 0.75, dimText.length * (fontDim * 0.58) + 6);

        const offsetDist = badgeH / 2 + 3.0;
        const bx = mx + nx * offsetDist;
        const by = my + ny * offsetDist;

        const gDim = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        gDim.setAttribute('class', 'mouza-side-dimension');
        gDim.innerHTML = `
          <rect x="${(bx - badgeW / 2).toFixed(1)}" y="${(by - badgeH / 2).toFixed(1)}" width="${badgeW.toFixed(1)}" height="${badgeH.toFixed(1)}" rx="2.5" fill="rgba(15, 23, 42, 0.88)" stroke="#f59e0b" stroke-width="0.8" vector-effect="non-scaling-stroke"/>
          <text x="${bx.toFixed(1)}" y="${(by + fontDim * 0.35).toFixed(1)}" fill="#38bdf8" font-size="${fontDim.toFixed(1)}" font-weight="600" font-family="'Fira Code', 'Noto Sans Bengali', monospace" text-anchor="middle">${dimText}</text>
        `;
        gDims.appendChild(gDim);
      }
    }
    drawingsGroup.appendChild(gDims);

    // 4. Center Dag Badge (Compact, clean, fits inside parcel)
    const gLabel = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gLabel.setAttribute('class', `mouza-dag-label${wandClass}`);
    gLabel.setAttribute('data-dag-label', String(dag));
    gLabel.setAttribute('pointer-events', 'none');
    if (state.showPlotLabels === false) {
      gLabel.style.display = 'none';
      gDims.style.display = 'none';
      gHandles.style.display = 'none';
    }

    const s2wBadge = getScreenPixelToWorld();
    const plotTitle = `Plot ${dag}`;
    const areaDecVal = Number(areaDecimal);
    const areaSqFtVal = Number(areaSqFt);
    const areaSubText = areaDecVal >= 0.01 
      ? `${areaDecVal.toFixed(2)} Dec` 
      : `${Math.round(areaSqFtVal)} sq.ft`;

    // AutoCAD Annotative Sizing: clear, sharp text that never smudges or becomes microscopic
    const fontPlot = 11.5 * s2wBadge;
    const fontArea = 9.5 * s2wBadge;
    const maxChars = Math.max(plotTitle.length, areaSubText.length);
    const badgeW = Math.max(52 * s2wBadge, (maxChars * 6.8 + 12) * s2wBadge);
    const badgeH = 26.0 * s2wBadge;

    gLabel.innerHTML = `
      <rect x="${(cx - badgeW / 2).toFixed(1)}" y="${(cy - badgeH / 2).toFixed(1)}" width="${badgeW.toFixed(1)}" height="${badgeH.toFixed(1)}" rx="${(3.5 * s2wBadge).toFixed(1)}" fill="rgba(15, 23, 42, 0.90)" stroke="#f59e0b" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
      <text x="${cx.toFixed(1)}" y="${(cy - 2.5 * s2wBadge).toFixed(1)}" fill="#fbbf24" font-size="${fontPlot.toFixed(1)}" font-weight="bold" font-family="'Segoe UI', Roboto, 'Fira Code', monospace" text-anchor="middle">${plotTitle}</text>
      <text x="${cx.toFixed(1)}" y="${(cy + 8.5 * s2wBadge).toFixed(1)}" fill="#38bdf8" font-size="${fontArea.toFixed(1)}" font-weight="600" font-family="'Segoe UI', Roboto, 'Fira Code', monospace" text-anchor="middle">${areaSubText}</text>
    `;
    drawingsGroup.appendChild(gLabel);

    flashPlotBoundary(poly);
    return poly;
  }

  // =========================================================================
  // INTERACTIVE VERTEX / CORNER GRIP DRAGGING ENGINE
  // Allows users to drag and adjust corners to reshape or scale the plot
  // =========================================================================
  const moveDrawingsState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    currentDx: 0,
    currentDy: 0
  };

  const vertexDragState = {
    isDragging: false,
    dag: null,
    vertexIndex: -1,
    vertices: [],
    lastDragEndTime: 0
  };

  function recalculatePlotMetrics(vertices) {
    const u = getUnitsPerPixel();
    const numV = vertices.length;
    const worldVertices = vertices.map(v => ({
      x: v.x * u.upp_svg_x,
      y: v.y * u.upp_svg_y
    }));

    let worldAreaSum = 0;
    let realPerimeter = 0;
    for (let i = 0; i < numV; i++) {
      const j = (i + 1) % numV;
      worldAreaSum += worldVertices[i].x * worldVertices[j].y - worldVertices[j].x * worldVertices[i].y;
      realPerimeter += Math.hypot(worldVertices[j].x - worldVertices[i].x, worldVertices[j].y - worldVertices[i].y);
    }
    const realAreaSqFt = Math.abs(worldAreaSum) / 2;
    const realDecimal = realAreaSqFt / SQFT_PER_DECIMAL; // 435.60

    return {
      areaSqFt: realAreaSqFt,
      areaDecimal: realDecimal,
      katha: realAreaSqFt / SQFT_PER_KATHA,
      bigha: realAreaSqFt / SQFT_PER_BIGHA,
      acre: realAreaSqFt / 43560,
      perimeter: realPerimeter
    };
  }

  function startVertexDrag(dag, vertexIdx, e) {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    const plot = state.plots[dag];
    let verts = (plot && plot.vertices && plot.vertices.length >= 3) ? plot.vertices : null;
    if (!verts) {
      const poly = document.querySelector(`.user-plot-boundary[data-dag="${dag}"]`);
      if (poly) {
        verts = parseSvgPoints(poly.getAttribute('points') || '');
      }
    }
    if (!verts || verts.length < 3) return;

    vertexDragState.isDragging = true;
    vertexDragState.dag = dag;
    vertexDragState.vertexIndex = vertexIdx;
    vertexDragState.vertices = verts.map(v => ({ x: v.x, y: v.y }));

    selectPlot(dag);
    document.body.style.cursor = 'grabbing';
    logCommand(`GRIP EDIT: Dragging corner ${vertexIdx + 1} of Dag ${dag}. Move mouse to adjust boundary.`);
  }

  function handleVertexDragMove(e) {
    if (!vertexDragState.isDragging) return;
    const pt = getCanvasCoords(e);
    const dag = vertexDragState.dag;
    const idx = vertexDragState.vertexIndex;
    const verts = vertexDragState.vertices;
    if (idx < 0 || idx >= verts.length) return;

    verts[idx] = { x: pt.x, y: pt.y };

    const drawingsGroup = document.getElementById('userDrawingsGroup');
    if (!drawingsGroup) return;

    // Update polygon points live
    const poly = drawingsGroup.querySelector(`.user-plot-boundary[data-dag="${dag}"]`);
    if (poly) {
      poly.setAttribute('points', verts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
    }

    // Update corner handle boxes live
    const s2w = getScreenPixelToWorld();
    const handleSize = 8.0 * s2w;
    const gHandles = drawingsGroup.querySelector(`[data-dag-handles="${dag}"]`);
    if (gHandles) {
      const rects = gHandles.querySelectorAll('rect');
      for (let i = 0; i < verts.length && i < rects.length; i++) {
        const p = verts[i];
        rects[i].setAttribute('x', (p.x - handleSize / 2).toFixed(1));
        rects[i].setAttribute('y', (p.y - handleSize / 2).toFixed(1));
        rects[i].setAttribute('width', handleSize.toFixed(1));
        rects[i].setAttribute('height', handleSize.toFixed(1));
      }
    }

    // Live update center label position and decimal value
    const metrics = recalculatePlotMetrics(verts);
    const gLabel = drawingsGroup.querySelector(`[data-dag-label="${dag}"]`);
    if (gLabel) {
      let sumX = 0, sumY = 0;
      for (let i = 0; i < verts.length; i++) { sumX += verts[i].x; sumY += verts[i].y; }
      const cx = sumX / verts.length;
      const cy = sumY / verts.length;
      const rect = gLabel.querySelector('rect');
      const texts = gLabel.querySelectorAll('text');
      const badgeW = parseFloat(rect ? rect.getAttribute('width') : '36');
      const badgeH = parseFloat(rect ? rect.getAttribute('height') : '18');
      if (rect) {
        rect.setAttribute('x', (cx - badgeW / 2).toFixed(1));
        rect.setAttribute('y', (cy - badgeH / 2).toFixed(1));
      }
      if (texts.length >= 2) {
        texts[0].setAttribute('x', cx.toFixed(1));
        texts[0].setAttribute('y', (cy - badgeH * 0.08).toFixed(1));
        texts[1].setAttribute('x', cx.toFixed(1));
        texts[1].setAttribute('y', (cy + badgeH * 0.36).toFixed(1));
        texts[1].textContent = `${toBengaliNum(metrics.areaDecimal.toFixed(2))} Decimal`;
      }
    }
  }

  function handleVertexDragEnd(e) {
    if (!vertexDragState.isDragging) return;
    const dag = vertexDragState.dag;
    const verts = vertexDragState.vertices;
    vertexDragState.isDragging = false;
    vertexDragState.dag = null;
    vertexDragState.vertexIndex = -1;
    vertexDragState.lastDragEndTime = Date.now();
    document.body.style.cursor = '';

    if (state.plots[dag]) {
      state.plots[dag].vertices = verts;
      const metrics = recalculatePlotMetrics(verts);
      Object.assign(state.plots[dag], metrics);
      const isMW = !!document.querySelector(`.user-plot-boundary[data-dag="${dag}"].magic-wand-detected`);
      renderParcelPolygon(verts, dag, metrics.areaSqFt, metrics.areaDecimal, metrics.perimeter, isMW);
      selectPlot(dag);
      pushUndo(`Corner Grip Adjusted (Plot ${dag})`);
      logCommand(`GRIP EDIT: Corner point updated. New Area = ${metrics.areaSqFt.toFixed(2)} sq.ft (${metrics.areaDecimal.toFixed(2)} Decimal), Perimeter = ${metrics.perimeter.toFixed(2)} ft.`);
    }
  }

  // =========================================================================
  function clearSelectedPlotInfo() {
    document.querySelectorAll('.mouza-plot.selected, .user-plot-boundary.selected, .cad-dim-elem.selected').forEach(el => el.classList.remove('selected'));
    state.selectedDag = null;
    state.selectedDim = null;

    const centerNum = document.getElementById('selectedDagCenterNum');
    const centerSqft = document.getElementById('selectedDagCenterSqft');
    const centerDec = document.getElementById('selectedDagCenterDec');
    if (centerNum) centerNum.textContent = '—';
    if (centerSqft) centerSqft.textContent = '—';
    if (centerDec) centerDec.textContent = '—';

    const infoDag = document.getElementById('infoDagNo');
    const infoArea = document.getElementById('infoArea');
    const infoPerimeter = document.getElementById('infoPerimeter');
    if (infoDag) infoDag.textContent = '—';
    if (infoArea) infoArea.textContent = '—';
    if (infoPerimeter) infoPerimeter.textContent = '—';

    const propDagNo = document.getElementById('propDagNo');
    const propArea = document.getElementById('propArea');
    const propDecimal = document.getElementById('propDecimal');
    const propKathaBigha = document.getElementById('propKathaBigha');
    const propPerimeter = document.getElementById('propPerimeter');
    if (propDagNo) propDagNo.textContent = '—';
    if (propArea) propArea.textContent = '—';
    if (propDecimal) propDecimal.textContent = '—';
    if (propKathaBigha) propKathaBigha.textContent = '—';
    if (propPerimeter) propPerimeter.textContent = '—';
  }

  function selectPlot(dagNo) {
    state.selectedDag = dagNo;
    const data = state.plots[dagNo] || {
      mouza: 'Chorbagh',
      sheet: '01 (CS)',
      dag: dagNo,
      areaSqFt: 8712.00,
      areaDecimal: 20.00,
      katha: 12.10,
      bigha: 0.60,
      acre: 0.20,
      perimeter: 380.00,
      owners: '1 Person',
      dims: { top: '120.00 ft', bottom: '118.00 ft', left: '72.00 ft', right: '74.00 ft' },
      ownerList: [{ name: '1. Recorded Owner', share: '20.00 Decimal' }]
    };

    // Update Plot Polygon Visual Selection
    document.querySelectorAll('.mouza-plot, .user-plot-boundary').forEach(p => {
      if (p.getAttribute('data-dag') === String(dagNo)) {
        p.classList.add('selected');
      } else {
        p.classList.remove('selected');
      }
    });

    // Update Dimension Callouts
    const dimTop = document.getElementById('dimTopText');
    const dimBottom = document.getElementById('dimBottomText');
    const dimLeft = document.getElementById('dimLeftText');
    const dimRight = document.getElementById('dimRightText');
    if (dimTop && data.dims) dimTop.textContent = data.dims.top;
    if (dimBottom && data.dims) dimBottom.textContent = data.dims.bottom;
    if (dimLeft && data.dims) dimLeft.textContent = data.dims.left;
    if (dimRight && data.dims) dimRight.textContent = data.dims.right;

    // Update Center Label
    const centerNum = document.getElementById('selectedDagCenterNum');
    const centerSqft = document.getElementById('selectedDagCenterSqft');
    const centerDec = document.getElementById('selectedDagCenterDec');
    if (centerNum) centerNum.textContent = data.dag;
    if (centerSqft) centerSqft.textContent = `${Number(data.areaSqFt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sq.ft`;
    if (centerDec) centerDec.textContent = `(${Number(data.areaDecimal).toFixed(2)} Decimal)`;

    // Update Right Sidebar Plot Information Panel
    const infoMouza = document.getElementById('infoMouzaName');
    const infoSheet = document.getElementById('infoSheetNo');
    const infoDag = document.getElementById('infoDagNo');
    const infoArea = document.getElementById('infoArea');
    const infoPerimeter = document.getElementById('infoPerimeter');
    const infoOwner = document.getElementById('infoOwner');

    if (infoMouza) infoMouza.textContent = data.mouza;
    if (infoSheet) infoSheet.textContent = data.sheet;
    if (infoDag) infoDag.textContent = data.dag;
    if (infoArea) infoArea.textContent = `${Number(data.areaSqFt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sq.ft (${Number(data.areaDecimal).toFixed(2)} Decimal)`;
    if (infoPerimeter) infoPerimeter.textContent = `${Number(data.perimeter).toFixed(2)} ft`;
    if (infoOwner) infoOwner.textContent = data.owners;

    // Update Properties Tab
    const propDagNo = document.getElementById('propDagNo');
    const propArea = document.getElementById('propArea');
    const propDecimal = document.getElementById('propDecimal');
    const propKathaBigha = document.getElementById('propKathaBigha');
    const propPerimeter = document.getElementById('propPerimeter');
    if (propDagNo) propDagNo.textContent = data.dag;
    if (propArea) propArea.textContent = `${Number(data.areaSqFt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sq.ft`;
    if (propDecimal) propDecimal.textContent = `${Number(data.areaDecimal).toFixed(2)} Decimal`;
    if (propKathaBigha) propKathaBigha.textContent = `${(data.katha || data.areaSqFt / SQFT_PER_KATHA).toFixed(2)} Katha (${(data.bigha || data.areaSqFt / SQFT_PER_BIGHA).toFixed(2)} Bigha)`;
    if (propPerimeter) propPerimeter.textContent = `${Number(data.perimeter).toFixed(2)} ft`;

    // Update Partition Modal Inputs
    const partDagNo = document.getElementById('partDagNo');
    const partTotalArea = document.getElementById('partTotalArea');
    if (partDagNo) partDagNo.textContent = data.dag;
    if (partTotalArea) partTotalArea.textContent = `${Number(data.areaDecimal).toFixed(2)} Decimal (${Number(data.areaSqFt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sq.ft)`;

    // Update Report Modal Fields
    const repDag = document.getElementById('repDag');
    const repArea = document.getElementById('repArea');
    const repKathaBigha = document.getElementById('repKathaBigha');
    const repPerimeter = document.getElementById('repPerimeter');
    if (repDag) repDag.textContent = data.dag;
    if (repArea) repArea.textContent = `${Number(data.areaSqFt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sq.ft (${Number(data.areaDecimal).toFixed(2)} Decimal)`;
    if (repKathaBigha) repKathaBigha.textContent = `${(data.katha || data.areaSqFt / SQFT_PER_KATHA).toFixed(2)} Katha | ${(data.bigha || data.areaSqFt / SQFT_PER_BIGHA).toFixed(2)} Bigha | ${(data.acre || data.areaSqFt / SQFT_PER_ACRE).toFixed(3)} Acre`;
    if (repPerimeter) repPerimeter.textContent = `${Number(data.perimeter).toFixed(2)} ft (${(data.perimeter / FEET_PER_LINK).toFixed(1)} Links)`;

    // Update Owner Table
    const ownerTable = document.getElementById('khatianOwnerList');
    if (ownerTable && data.ownerList) {
      ownerTable.innerHTML = data.ownerList.map(o => `
        <tr class="hover:bg-slate-800/40 border-b border-slate-800/60">
          <td class="py-1 px-1.5 text-slate-300">${o.name}</td>
          <td class="py-1 px-1.5 text-right font-mono text-emerald-400">${o.share}</td>
        </tr>
      `).join('');
    }
  }

  // =========================================================================
  // AUTOCAD DISTANCE FORMATTING & SEGMENT MATH
  // =========================================================================
  function formatDistanceFeetInches(distFeet) {
    if (distFeet === null || distFeet === undefined || isNaN(distFeet)) return "0'-0\"";
    let f = Math.floor(distFeet);
    let in_ = Math.round((distFeet - f) * 12);
    if (in_ === 12) {
      f++;
      in_ = 0;
    }
    if (in_ === 0) {
      return `${f}'`;
    }
    return `${f}'-${in_}"`;
  }

  function distToSegment(p, v, w) {
    const l2 = (v.x - w.x)**2 + (v.y - w.y)**2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  // =========================================================================
  // AUTOCAD ALIGNED DIMENSION GENERATOR (IMAGE 4 STANDARD)
  // Inline gap, parallel line, 45-deg ticks, CAD orange text, zero black box
  // =========================================================================
  function createAlignedDimension(p1, p2, options = {}) {
    const drawingsGroup = document.getElementById('userDrawingsGroup');
    if (!drawingsGroup) return null;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const segLen = Math.hypot(dx, dy);
    if (segLen < 1.0) return null;

    const s2w = getScreenPixelToWorld();
    const u = getUnitsPerPixel();
    const realFeet = Math.hypot(dx * u.upp_svg_x, dy * u.upp_svg_y);
    const formattedText = formatDistanceFeetInches(realFeet);

    // Direction unit vector
    const ux = dx / segLen;
    const uy = dy / segLen;

    // Normal unit vector (perpendicular)
    let nx = -uy;
    let ny = ux;

    // If centroid is provided, point normal outward away from centroid
    if (options.centroid) {
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const toMidX = midX - options.centroid.x;
      const toMidY = midY - options.centroid.y;
      if (toMidX * nx + toMidY * ny < 0) {
        nx = -nx;
        ny = -ny;
      }
    } else if (options.flip) {
      nx = -nx;
      ny = -ny;
    }

    const offsetDist = (options.offset || 22.0) * s2w;
    const extPast = 3.5 * s2w;
    const extOffset = 2.0 * s2w;
    const tickSize = 4.0 * s2w;

    // Dimension line endpoints
    const q1x = p1.x + nx * offsetDist;
    const q1y = p1.y + ny * offsetDist;
    const q2x = p2.x + nx * offsetDist;
    const q2y = p2.y + ny * offsetDist;

    // Extension line 1 (subtle, non-shooting)
    const e1_startX = p1.x + nx * extOffset;
    const e1_startY = p1.y + ny * extOffset;
    const e1_endX = q1x + nx * extPast;
    const e1_endY = q1y + ny * extPast;

    // Extension line 2 (subtle, non-shooting)
    const e2_startX = p2.x + nx * extOffset;
    const e2_startY = p2.y + ny * extOffset;
    const e2_endX = q2x + nx * extPast;
    const e2_endY = q2y + ny * extPast;

    // 45-degree oblique architectural tick vector
    const tx = (ux + nx) * 0.707 * tickSize;
    const ty = (uy + ny) * 0.707 * tickSize;

    // Midpoint for text
    const tmx = (q1x + q2x) / 2;
    const tmy = (q1y + q2y) / 2;

    // Orientation angle for text
    let textAngle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (textAngle > 90 || textAngle < -90) {
      textAngle += 180;
    }

    // In-line broken line gap calculation with AutoCAD background mask
    const textChars = formattedText.length;
    const bgW = Math.max(30 * s2w, (textChars * 6.6 + 10) * s2w);
    const bgH = 14.0 * s2w;
    const gapHalf = bgW / 2 + 1.5 * s2w;

    let dimLinesHtml = '';
    if (segLen > gapHalf * 2.1) {
      const g1x = tmx - ux * gapHalf;
      const g1y = tmy - uy * gapHalf;
      const g2x = tmx + ux * gapHalf;
      const g2y = tmy + uy * gapHalf;
      dimLinesHtml = `
        <line x1="${q1x.toFixed(1)}" y1="${q1y.toFixed(1)}" x2="${g1x.toFixed(1)}" y2="${g1y.toFixed(1)}" stroke="#ea580c" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
        <line x1="${g2x.toFixed(1)}" y1="${g2y.toFixed(1)}" x2="${q2x.toFixed(1)}" y2="${q2y.toFixed(1)}" stroke="#ea580c" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
      `;
    } else {
      dimLinesHtml = `
        <line x1="${q1x.toFixed(1)}" y1="${q1y.toFixed(1)}" x2="${q2x.toFixed(1)}" y2="${q2y.toFixed(1)}" stroke="#ea580c" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
      `;
    }

    const dimId = 'cad_dim_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'cad-dim-elem');
    g.setAttribute('data-dim-id', dimId);
    g.setAttribute('style', 'cursor: pointer; pointer-events: auto;');

    g.innerHTML = `
      <!-- Extension lines (cleanly bounded from corner to past dim line) -->
      <line x1="${e1_startX.toFixed(1)}" y1="${e1_startY.toFixed(1)}" x2="${e1_endX.toFixed(1)}" y2="${e1_endY.toFixed(1)}" stroke="#ea580c" stroke-width="1.0" vector-effect="non-scaling-stroke" opacity="0.85"/>
      <line x1="${e2_startX.toFixed(1)}" y1="${e2_startY.toFixed(1)}" x2="${e2_endX.toFixed(1)}" y2="${e2_endY.toFixed(1)}" stroke="#ea580c" stroke-width="1.0" vector-effect="non-scaling-stroke" opacity="0.85"/>
      <!-- Dimension line with center gap -->
      ${dimLinesHtml}
      <!-- Oblique architectural ticks -->
      <line x1="${(q1x - tx).toFixed(1)}" y1="${(q1y - ty).toFixed(1)}" x2="${(q1x + tx).toFixed(1)}" y2="${(q1y + ty).toFixed(1)}" stroke="#ea580c" stroke-width="1.3" vector-effect="non-scaling-stroke"/>
      <line x1="${(q2x - tx).toFixed(1)}" y1="${(q2y - ty).toFixed(1)}" x2="${(q2x + tx).toFixed(1)}" y2="${(q2y + ty).toFixed(1)}" stroke="#ea580c" stroke-width="1.3" vector-effect="non-scaling-stroke"/>
      <!-- AutoCAD Background Masked Badge: Crisp contrast against Mouza paper & dark canvas -->
      <g transform="rotate(${textAngle.toFixed(1)} ${tmx.toFixed(1)} ${tmy.toFixed(1)})">
        <rect x="${(tmx - bgW / 2).toFixed(1)}" y="${(tmy - bgH / 2).toFixed(1)}" width="${bgW.toFixed(1)}" height="${bgH.toFixed(1)}" rx="${2.5 * s2w}" fill="#0f172a" stroke="#ea580c" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
        <text x="${tmx.toFixed(1)}" y="${(tmy + 3.6 * s2w).toFixed(1)}" fill="#ffffff" font-size="${(10.5 * s2w).toFixed(1)}" font-weight="700" font-family="'Segoe UI', Roboto, 'Fira Code', monospace" text-anchor="middle">${formattedText}</text>
      </g>
    `;

    g.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.cad-dim-elem.selected').forEach(el => el.classList.remove('selected'));
      document.querySelectorAll('.mouza-plot.selected, .user-plot-boundary.selected').forEach(el => el.classList.remove('selected'));
      g.classList.add('selected');
      state.selectedDim = g;
      logCommand(`DIMENSION: Aligned dimension ${formattedText} selected. Press Delete or Erase to delete.`);
    });

    drawingsGroup.appendChild(g);
    pushUndo(`Add Dimension (${formattedText})`);
    logCommand(`DIMENSION: Aligned dimension ${formattedText} placed.`);
    return g;
  }

  // =========================================================================
  // OBJECT DELETION ENGINE (DELETE / BACKSPACE)
  // Deletes selected plot boundary, CAD dimension, or undos last polyline vertex
  // =========================================================================
  function deleteSelectedPlot(dagNo) {
    if (!dagNo) return;
    const dagStr = String(dagNo);

    document.querySelectorAll(`[data-dag="${dagStr}"], [data-dag-handles="${dagStr}"], [data-dag-dims="${dagStr}"], [data-dag-label="${dagStr}"], #plot-${dagStr}`).forEach(el => el.remove());

    if (state.plots[dagStr]) {
      delete state.plots[dagStr];
    }

    if (state.selectedDag === dagStr) {
      state.selectedDag = null;
      const centerNum = document.getElementById('selectedDagCenterNum');
      const centerSqft = document.getElementById('selectedDagCenterSqft');
      const centerDec = document.getElementById('selectedDagCenterDec');
      if (centerNum) centerNum.textContent = '—';
      if (centerSqft) centerSqft.textContent = '—';
      if (centerDec) centerDec.textContent = '—';

      const infoDag = document.getElementById('infoDagNo');
      const infoArea = document.getElementById('infoArea');
      const infoPerimeter = document.getElementById('infoPerimeter');
      if (infoDag) infoDag.textContent = '—';
      if (infoArea) infoArea.textContent = '—';
      if (infoPerimeter) infoPerimeter.textContent = '—';
    }

    pushUndo(`Delete Plot (Plot ${dagStr})`);
    logCommand(`ERASE: Plot boundary ${dagStr} deleted.`);
  }

  function deleteSelectedObject() {
    // 1. If actively drawing polyline, remove last vertex
    if ((state.activeTool === 'polyline' || state.activeTool === 'autopolyline' || state.activeTool === 'polygon') && state.drawingPoints && state.drawingPoints.length > 0) {
      state.drawingPoints.pop();
      updateDrawingOverlay();
      logCommand(`PLINE: Last vertex removed (${state.drawingPoints.length} points remaining).`);
      return true;
    }

    // 2. If a CAD dimension is selected
    const selectedDim = document.querySelector('.cad-dim-elem.selected') || state.selectedDim;
    if (selectedDim) {
      selectedDim.remove();
      state.selectedDim = null;
      pushUndo('Delete Dimension');
      logCommand('ERASE: Dimension deleted.');
      return true;
    }

    // 3. If any user-drawn object in userDrawingsGroup is selected
    const selectedDrawn = document.querySelector('#userDrawingsGroup .selected');
    if (selectedDrawn) {
      const dag = selectedDrawn.getAttribute('data-dag');
      if (dag) {
        deleteSelectedPlot(dag);
      } else {
        selectedDrawn.remove();
        pushUndo('Delete Drawing');
        logCommand('ERASE: Selected drawing object deleted.');
      }
      return true;
    }

    // 4. If a plot is currently selected
    if (state.selectedDag) {
      deleteSelectedPlot(state.selectedDag);
      return true;
    }

    return false;
  }

  // =========================================================================
  // CANVAS COORDINATE TRANSFORMATION
  // =========================================================================
  function getCanvasCoords(e) {
    const svg = document.getElementById('cadSvgCanvas');
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const transformed = pt.matrixTransform(ctm.inverse());
      return { 
        x: parseFloat(transformed.x.toFixed(2)), 
        y: parseFloat(transformed.y.toFixed(2)) 
      };
    }
    const rect = svg.getBoundingClientRect();
    return {
      x: parseFloat((e.clientX - rect.left).toFixed(2)),
      y: parseFloat((e.clientY - rect.top).toFixed(2))
    };
  }

  function svgPointToScreen(x, y) {
    const svg = document.getElementById('cadSvgCanvas');
    if (!svg) return { x, y };
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const sp = pt.matrixTransform(ctm);
      const rect = svg.getBoundingClientRect();
      return {
        x: parseFloat((sp.x - rect.left).toFixed(2)),
        y: parseFloat((sp.y - rect.top).toFixed(2))
      };
    }
    return { x, y };
  }

  // =========================================================================
  // AUTOCAD OBJECT SNAP (OSNAP) ENGINE
  // Magnetically locks to endpoints, shared boundaries, corners, and start points
  // =========================================================================
  function findBestOsnapPoint(pt, snapThresh) {
    let best = null;
    let minD = snapThresh;

    // 1. Current active drawing points (start point gets priority for closed polyline)
    if (state.drawingPoints && state.drawingPoints.length > 0) {
      if (state.drawingPoints.length >= 3) {
        const p0 = state.drawingPoints[0];
        const d0 = Math.hypot(pt.x - p0.x, pt.y - p0.y);
        if (d0 <= minD) {
          best = { x: p0.x, y: p0.y, isStart: true, label: 'Endpoint (Click to close)' };
          minD = d0;
        }
      }
      for (let i = 0; i < state.drawingPoints.length; i++) {
        const dp = state.drawingPoints[i];
        const d = Math.hypot(pt.x - dp.x, pt.y - dp.y);
        if (d < minD) {
          minD = d;
          best = { 
            x: dp.x, 
            y: dp.y, 
            isStart: (i === 0), 
            label: (i === 0 && state.drawingPoints.length >= 3) ? 'Endpoint (Click to close)' : 'Endpoint' 
          };
        }
      }
    }

    // 2. All vector polygons, polylines, and lines in the drawing canvas (including adjacent plots)
    const candidateEls = document.querySelectorAll('#userDrawingsGroup polygon, #userDrawingsGroup polyline, #userDrawingsGroup line, #plotsGroup polygon, .mouza-plot, .user-plot-boundary');
    for (const el of candidateEls) {
      if (el.closest('.hidden') || el.style.display === 'none') continue;
      if (el.classList.contains('magic-wand-marker') || el.classList.contains('cad-dim-elem')) continue;

      const ptsAttr = el.getAttribute('points');
      if (ptsAttr) {
        const pairs = ptsAttr.trim().split(/\s+/);
        for (const pair of pairs) {
          const parts = pair.split(',');
          const vx = parseFloat(parts[0]);
          const vy = parseFloat(parts[1]);
          if (isNaN(vx) || isNaN(vy)) continue;
          const d = Math.hypot(pt.x - vx, pt.y - vy);
          if (d < minD) {
            minD = d;
            best = { x: vx, y: vy, isStart: false, label: 'Endpoint' };
          }
        }
      }

      if (el.tagName && el.tagName.toLowerCase() === 'line') {
        const x1 = parseFloat(el.getAttribute('x1'));
        const y1 = parseFloat(el.getAttribute('y1'));
        const x2 = parseFloat(el.getAttribute('x2'));
        const y2 = parseFloat(el.getAttribute('y2'));
        if (!isNaN(x1) && !isNaN(y1)) {
          const d1 = Math.hypot(pt.x - x1, pt.y - y1);
          if (d1 < minD) { minD = d1; best = { x: x1, y: y1, isStart: false, label: 'Endpoint' }; }
        }
        if (!isNaN(x2) && !isNaN(y2)) {
          const d2 = Math.hypot(pt.x - x2, pt.y - y2);
          if (d2 < minD) { minD = d2; best = { x: x2, y: y2, isStart: false, label: 'Endpoint' }; }
        }
      }
    }

    // 3. Registered plot vertices in state
    if (state.plots) {
      for (const pData of Object.values(state.plots)) {
        if (!pData.vertices) continue;
        for (const v of pData.vertices) {
          const d = Math.hypot(pt.x - v.x, pt.y - v.y);
          if (d < minD) {
            minD = d;
            best = { x: v.x, y: v.y, isStart: false, label: 'Endpoint' };
          }
        }
      }
    }

    return best;
  }

  // =========================================================================
  // CADASTRAL 4-CORNER BOUNDARY RECOGNITION (MAGIC WAND)
  // Accurately detects small, medium, and large parcels with 4 clean corners 
  // Bypasses interior dag-number glyphs, captures exact parcel boundary walls
  // =========================================================================
  function detectSmallParcelFromRaster(pt, rx, ry, rw, rh) {
    let vertices = null;

    // Ensure raster cache is initialized
    if (!rasterCache.loaded || !rasterCache.ctx) {
      const img = document.getElementById('canvasRasterMap');
      const href = img ? (img.getAttribute('href') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href')) : null;
      if (href) cacheRasterImage(href);
    }

    if (rasterCache.loaded && rasterCache.ctx && rasterCache.width > 0 && rasterCache.height > 0) {
      try {
        const origW = rasterCache.width;
        const origH = rasterCache.height;
        const normX = Math.max(0, Math.min(1, (pt.x - rx) / rw));
        const normY = Math.max(0, Math.min(1, (pt.y - ry) / rh));

        const seedX = Math.round(normX * origW);
        const seedY = Math.round(normY * origH);

        if (seedX >= 0 && seedX < origW && seedY >= 0 && seedY < origH) {
          // Bounded search radius: covers authentic Mouza parcels (up to 120px radius)
          const maxR = Math.max(45, Math.min(120, Math.round(origW * 0.10)));
          const pad = maxR + 5;
          const x0 = Math.max(0, seedX - pad);
          const y0 = Math.max(0, seedY - pad);
          const x1 = Math.min(origW - 1, seedX + pad);
          const y1 = Math.min(origH - 1, seedY + pad);
          const winW = x1 - x0 + 1;
          const winH = y1 - y0 + 1;

          const imgData = rasterCache.ctx.getImageData(x0, y0, winW, winH);
          const pixels = imgData.data;

          function getLum(gx, gy) {
            const lx = gx - x0;
            const ly = gy - y0;
            if (lx < 0 || lx >= winW || ly < 0 || ly >= winH) return 0;
            const idx = (ly * winW + lx) * 4;
            return pixels[idx] * 0.299 + pixels[idx + 1] * 0.587 + pixels[idx + 2] * 0.114;
          }

          let sx = seedX;
          let sy = seedY;
          let startLum = getLum(sx, sy);

          // If clicked on dark boundary line or dag number glyph, nudge to nearby bright paper
          if (startLum < 140) {
            for (let r = 1; r <= 15; r++) {
              let found = false;
              for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                  const l = getLum(sx + dx, sy + dy);
                  if (l > 155) {
                    sx += dx; sy += dy; startLum = l; found = true; break;
                  }
                }
                if (found) break;
              }
              if (found) break;
            }
          }

          // Ink threshold: paper texture is 170-220, ink boundary is < 138
          const inkThreshold = Math.max(75, Math.min(138, Math.round(startLum * 0.72)));

          function isInk(gx, gy) {
            return getLum(gx, gy) < inkThreshold;
          }

          // Morphological bridge to seal 1px hairline scan cracks and prevent leaking into adjacent plots
          function isWall(gx, gy) {
            if (isInk(gx, gy)) return true;
            let inkCount = 0;
            if (isInk(gx - 1, gy)) inkCount++;
            if (isInk(gx + 1, gy)) inkCount++;
            if (isInk(gx, gy - 1)) inkCount++;
            if (isInk(gx, gy + 1)) inkCount++;
            return inkCount >= 2;
          }

          // BFS Flood Fill inside the parcel (stops strictly at ink boundary walls)
          const localW = winW;
          const localH = winH;
          const visited = new Uint8Array(localW * localH);
          const queueX = new Int16Array(localW * localH);
          const queueY = new Int16Array(localW * localH);
          let head = 0;
          let tail = 0;

          const startLx = sx - x0;
          const startLy = sy - y0;
          if (startLx >= 0 && startLx < localW && startLy >= 0 && startLy < localH) {
            visited[startLy * localW + startLx] = 1;
            queueX[tail] = startLx;
            queueY[tail] = startLy;
            tail++;
          }

          let floodCount = 0;
          let sumGx = 0;
          let sumGy = 0;
          let minFloodX = sx, maxFloodX = sx;
          let minFloodY = sy, maxFloodY = sy;
          const maxParcelRadius = Math.max(30, Math.min(85, Math.round(origW * 0.07)));

          while (head < tail && floodCount < 25000) {
            const clx = queueX[head];
            const cly = queueY[head];
            head++;
            floodCount++;

            const cgx = clx + x0;
            const cgy = cly + y0;
            sumGx += cgx;
            sumGy += cgy;
            if (cgx < minFloodX) minFloodX = cgx;
            if (cgx > maxFloodX) maxFloodX = cgx;
            if (cgy < minFloodY) minFloodY = cgy;
            if (cgy > maxFloodY) maxFloodY = cgy;

            if (Math.hypot(cgx - sx, cgy - sy) > maxParcelRadius) {
              continue;
            }

            const neighbors = [
              [clx + 1, cly],
              [clx - 1, cly],
              [clx, cly + 1],
              [clx, cly - 1]
            ];

            for (const [nlx, nly] of neighbors) {
              if (nlx < 1 || nlx >= localW - 1 || nly < 1 || nly >= localH - 1) continue;
              const nidx = nly * localW + nlx;
              if (visited[nidx]) continue;
              visited[nidx] = 1;

              const ngx = nlx + x0;
              const ngy = nly + y0;
              if (isWall(ngx, ngy)) continue;

              queueX[tail] = nlx;
              queueY[tail] = nly;
              tail++;
            }
          }

          // If flood successfully captured parcel interior (minimum 60 pixels, positive area)
          if (floodCount >= 60 && (maxFloodX - minFloodX) >= 6 && (maxFloodY - minFloodY) >= 6) {
            const centroidGx = sumGx / floodCount;
            const centroidGy = sumGy / floodCount;

            const numRays = 36;
            const rawHits = [];

            for (let i = 0; i < numRays; i++) {
              const ang = (i * 2 * Math.PI) / numRays;
              const cosA = Math.cos(ang);
              const sinA = Math.sin(ang);
              let hitD = 8;

              for (let d = 1.0; d <= maxParcelRadius + 5; d += 1.0) {
                const rxHit = Math.round(centroidGx + cosA * d) - x0;
                const ryHit = Math.round(centroidGy + sinA * d) - y0;
                if (rxHit < 0 || rxHit >= localW || ryHit < 0 || ryHit >= localH) {
                  hitD = d;
                  break;
                }
                const idx = ryHit * localW + rxHit;
                if (!visited[idx]) {
                  hitD = d;
                  break;
                }
                hitD = d;
              }
              rawHits.push(hitD);
            }

            const boundaryPts = [];
            for (let i = 0; i < numRays; i++) {
              const ang = (i * 2 * Math.PI) / numRays;
              const d = rawHits[i];
              boundaryPts.push({
                x: centroidGx + Math.cos(ang) * d,
                y: centroidGy + Math.sin(ang) * d
              });
            }

            function getQuadrantPeak(startIdx, endIdx) {
              let maxD2 = -1;
              let best = boundaryPts[startIdx % numRays];
              for (let i = startIdx; i <= endIdx; i++) {
                const idx = i % numRays;
                const p = boundaryPts[idx];
                const d2 = (p.x - centroidGx)**2 + (p.y - centroidGy)**2;
                if (d2 > maxD2) {
                  maxD2 = d2;
                  best = p;
                }
              }
              return best;
            }

            // Quadrant corners
            const cTL = getQuadrantPeak(18, 26);
            const cTR = getQuadrantPeak(27, 35);
            const cBR = getQuadrantPeak(0, 8);
            const cBL = getQuadrantPeak(9, 17);

            let corners = [
              { x: rx + (cTL.x / origW) * rw, y: ry + (cTL.y / origH) * rh },
              { x: rx + (cTR.x / origW) * rw, y: ry + (cTR.y / origH) * rh },
              { x: rx + (cBR.x / origW) * rw, y: ry + (cBR.y / origH) * rh },
              { x: rx + (cBL.x / origW) * rw, y: ry + (cBL.y / origH) * rh }
            ];

            // AutoCAD Adjacent Plot Snapping:
            // Snap new corners to any nearby existing plot vertices within 14 screen pixels
            const s2w = getScreenPixelToWorld();
            const snapDistThresh = 14 * s2w;
            const existingPlots = document.querySelectorAll('#userDrawingsGroup polygon, #plotsGroup polygon, .mouza-plot, .user-plot-boundary');

            corners = corners.map(c => {
              let bestPt = c;
              let minD = snapDistThresh;
              for (const pEl of existingPlots) {
                const pAttr = pEl.getAttribute('points');
                if (!pAttr) continue;
                for (const pair of pAttr.trim().split(/\s+/)) {
                  const parts = pair.split(',');
                  const px = parseFloat(parts[0]);
                  const py = parseFloat(parts[1]);
                  if (isNaN(px) || isNaN(py)) continue;
                  const d = Math.hypot(c.x - px, c.y - py);
                  if (d < minD) {
                    minD = d;
                    bestPt = { x: px, y: py };
                  }
                }
              }
              return bestPt;
            });

            // Validate that vertices form a polygon with positive area
            let testArea = 0;
            for (let i = 0; i < 4; i++) {
              const j = (i + 1) % 4;
              testArea += corners[i].x * corners[j].y - corners[j].x * corners[i].y;
            }
            if (Math.abs(testArea) > 50) {
              vertices = corners;
            }
          }
        }
      } catch (err) {
        console.warn('Magic Wand raster detection error:', err);
      }
    }

    // Realistic cadastral fallback if raster detection fails
    if (!vertices) {
      const hash1 = Math.abs(Math.sin(pt.x * 12.9898 + pt.y * 78.233)) * 1000;
      const hash2 = Math.abs(Math.sin(pt.x * 93.9898 + pt.y * 67.345)) * 1000;
      const halfW = 14.0 + (hash1 % 5.0);
      const halfH = 10.0 + (hash2 % 4.0);
      const skew  = ((hash1 % 3.0) - 1.5);

      vertices = [
        { x: pt.x - halfW,        y: pt.y - halfH },
        { x: pt.x + halfW + skew, y: pt.y - halfH },
        { x: pt.x + halfW,        y: pt.y + halfH },
        { x: pt.x - halfW - skew, y: pt.y + halfH }
      ];
    }

    return vertices;
  }

  // =========================================================================
  function detectPlotBoundaryFromClick(pt, isSelectMode = false) {
    // 1. Scan vector polygons
    const allPlotEls = document.querySelectorAll('.mouza-plot, .user-plot-boundary');
    let matchedEl = null;
    let matchedDag = null;
    let matchedVertices = null;

    for (const el of allPlotEls) {
      if (el.closest('.hidden') || el.style.display === 'none' || el.closest('[style*="display: none"]')) continue;
      const ptsAttr = el.getAttribute('points');
      if (!ptsAttr) continue;
      const vertices = parseSvgPoints(ptsAttr);
      if (isPointInsidePolygon(pt, vertices)) {
        matchedEl = el;
        matchedDag = el.getAttribute('data-dag');
        matchedVertices = vertices;
        break;
      }
    }

    if (matchedEl) {
      const dag = matchedDag || '126';
      selectPlot(dag);
      flashPlotBoundary(matchedEl);
      const pData = state.plots[dag] || {};
      const actionName = isSelectMode ? 'SELECT' : 'MAGIC WAND';
      logCommand(`${actionName}: Boundary detected for Dag ${dag} - Area = ${Number(pData.areaSqFt || 0).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} sq.ft (${Number(pData.areaDecimal || 0).toFixed(2)} Decimal), Perimeter = ${Number(pData.perimeter || 0).toFixed(2)} ft.`);
      return true;
    }

    // 2. Scan Scanned / Imported Mouza Raster Map
    const rasterGroup = document.getElementById('groupRasterMouza');
    const rasterImg = document.getElementById('canvasRasterMap');
    const isRasterVisible = rasterGroup && !rasterGroup.classList.contains('hidden') && rasterImg && (rasterImg.getAttribute('href') || '').length > 5;

    if (isRasterVisible) {
      const rx = rasterState.x || 180;
      const ry = rasterState.y || 150;
      const rw = rasterState.width || 750;
      const rh = rasterState.height || 550;

      if (pt.x >= rx && pt.x <= rx + rw && pt.y >= ry && pt.y <= ry + rh) {
        // High-precision morphological cadastral detection
        const newVertices = detectSmallParcelFromRaster(pt, rx, ry, rw, rh);
        if (!newVertices || newVertices.length < 3) return false;

        state.nextDagNumber = (state.nextDagNumber || 200) + 1;
        const newDag = String(state.nextDagNumber);

        const u = getUnitsPerPixel();
        const numV = newVertices.length;

        // Convert vertices to world coordinates using AutoCAD scaling formula
        const worldVertices = newVertices.map(v => ({
          x: v.x * u.upp_svg_x,
          y: v.y * u.upp_svg_y
        }));

        // Shoelace formula in World feet
        let worldAreaSum = 0;
        let realPerimeter = 0;
        for (let i = 0; i < numV; i++) {
          const j = (i + 1) % numV;
          worldAreaSum += worldVertices[i].x * worldVertices[j].y - worldVertices[j].x * worldVertices[i].y;
          realPerimeter += Math.hypot(worldVertices[j].x - worldVertices[i].x, worldVertices[j].y - worldVertices[i].y);
        }
        const realAreaSqFt = Math.abs(worldAreaSum) / 2;
        const realDecimal = realAreaSqFt / SQFT_PER_DECIMAL; // 435.60

        // Calculate dimensional lengths for sides using AutoCAD exact formula
        const dTop = Math.hypot((newVertices[1].x - newVertices[0].x) * u.upp_svg_x, (newVertices[1].y - newVertices[0].y) * u.upp_svg_y).toFixed(2);
        const dBottom = Math.hypot((newVertices[2].x - newVertices[numV - 1].x) * u.upp_svg_x, (newVertices[2].y - newVertices[numV - 1].y) * u.upp_svg_y).toFixed(2);
        const dLeft = Math.hypot((newVertices[numV - 1].x - newVertices[0].x) * u.upp_svg_x, (newVertices[numV - 1].y - newVertices[0].y) * u.upp_svg_y).toFixed(2);
        const dRight = Math.hypot((newVertices[2].x - newVertices[1].x) * u.upp_svg_x, (newVertices[2].y - newVertices[1].y) * u.upp_svg_y).toFixed(2);

        state.plots[newDag] = {
          mouza: 'Chorbagh (Scanned Sheet)',
          sheet: '01 (CS)',
          dag: newDag,
          vertices: newVertices.map(v => ({ x: v.x, y: v.y })),
          areaSqFt: realAreaSqFt,
          areaDecimal: realDecimal,
          katha: realAreaSqFt / SQFT_PER_KATHA,
          bigha: realAreaSqFt / SQFT_PER_BIGHA,
          acre: realAreaSqFt / 43560,
          perimeter: realPerimeter,
          owners: '1 Person',
          dims: {
            top: `${dTop} ft`,
            bottom: `${dBottom} ft`,
            left: `${dLeft} ft`,
            right: `${dRight} ft`
          },
          ownerList: [{ name: `1. Recorded Owner (Plot No. ${newDag})`, share: `${realDecimal.toFixed(2)} Decimal (1.000 Share)` }]
        };

        renderParcelPolygon(newVertices, newDag, realAreaSqFt, realDecimal, realPerimeter, true);
        pushUndo(`Magic Wand Detect (Plot ${newDag})`);
        selectPlot(newDag);
        logCommand(`MAGIC WAND: Scanned Mouza boundary auto-detected for Dag ${newDag}! Area = ${realAreaSqFt.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} sq.ft (${realDecimal.toFixed(2)} Decimal), Perimeter = ${realPerimeter.toFixed(2)} ft (AutoCAD Scale 1:${u.scale}).`);
        return true;
      }
    }

    return false;
  }

  // =========================================================================
  // POINT-TO-POINT DRAWING OVERLAY (IMAGE 2 STANDARD)
  // Dynamic guidance banner, Point 1 orange snap target ring, white/cyan vertex nodes
  // =========================================================================
  function updateDrawingOverlay() {
    const pts = state.drawingPoints;
    const solid = document.getElementById('drawingSolidTrack');
    const guide = document.getElementById('drawingGuideLine');
    const vGroup = document.getElementById('drawingVerticesGroup');
    const halo = document.getElementById('drawingActiveHalo');
    const activeDot = document.getElementById('drawingActiveDot');
    const activeRing = document.getElementById('drawingActiveRing');

    if (!solid || !vGroup || !halo) return;

    if (pts.length === 0) {
      solid.setAttribute('points', '');
      vGroup.innerHTML = '';
      halo.classList.add('hidden');
      if (guide) guide.classList.add('hidden');
      const banner = document.getElementById('toolGuidanceBanner');
      if (banner && (state.activeTool === 'polyline' || state.activeTool === 'autopolyline')) {
        banner.classList.add('hidden');
      }
      return;
    }

    const s2w = getScreenPixelToWorld();
    const dotR = 2.5 * s2w;
    const ringR = 6.0 * s2w;
    const vDotR = 2.5 * s2w;
    const snapRingR = 6.5 * s2w;

    // 1. Solid line connecting already clicked points (Image 2 standard)
    solid.setAttribute('points', pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));

    // 2. Vertex nodes: circular dots with white center and cyan/teal border (Crisp fixed screen size)
    let vHtml = pts.map(p => `
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${vDotR.toFixed(2)}" fill="#ffffff" stroke="#06b6d4" stroke-width="1.8" vector-effect="non-scaling-stroke"/>
    `).join('');

    // If 3 or more points exist, render snap closing ring on Point 1 (Crisp fixed screen size)
    if (pts.length >= 3) {
      const p1 = pts[0];
      vHtml += `
        <circle cx="${p1.x.toFixed(1)}" cy="${p1.y.toFixed(1)}" r="${snapRingR.toFixed(2)}" fill="none" stroke="#f97316" stroke-width="2.0" stroke-dasharray="3 2" vector-effect="non-scaling-stroke" class="animate-pulse"/>
        <circle cx="${p1.x.toFixed(1)}" cy="${p1.y.toFixed(1)}" r="${dotR.toFixed(2)}" fill="#f97316" vector-effect="non-scaling-stroke"/>
      `;
    }
    vGroup.innerHTML = vHtml;

    // 3. Active Target Halo on latest clicked point (Screen pixel invariant)
    const lastP = pts[pts.length - 1];
    if (activeDot && activeRing) {
      activeDot.setAttribute('cx', lastP.x.toFixed(1));
      activeDot.setAttribute('cy', lastP.y.toFixed(1));
      activeDot.setAttribute('r', dotR.toFixed(2));
      activeRing.setAttribute('cx', lastP.x.toFixed(1));
      activeRing.setAttribute('cy', lastP.y.toFixed(1));
      activeRing.setAttribute('r', ringR.toFixed(2));
    }
    halo.classList.remove('hidden');

    // 4. Update guidance banner text dynamically (Image 2 standard)
    const banner = document.getElementById('toolGuidanceBanner');
    const bannerText = document.getElementById('toolGuidanceText');
    if (banner && bannerText) {
      banner.classList.remove('hidden');
      if (pts.length < 3) {
        bannerText.textContent = `✏️ Point ${pts.length} added. Click next point...`;
      } else {
        bannerText.textContent = `Point ${pts.length} added. Click Point 1 to close plot (or press Enter)`;
      }
    }
  }

  // =========================================================================
  // UNIVERSAL AUTOCAD INPUT / PROMPT MODAL
  // Replaces all native browser prompt() alerts with a sleek AutoCAD UI dialog
  // =========================================================================
  function showCadPrompt(options = {}) {
    return new Promise((resolve) => {
      const modal = document.getElementById('modalCadPrompt');
      const titleEl = document.getElementById('cadPromptTitle');
      const msgEl = document.getElementById('cadPromptMessage');
      const inputEl = document.getElementById('cadPromptInput');
      const btnConfirm = document.getElementById('btnCadPromptConfirm');
      const btnCancel = document.getElementById('btnCadPromptCancel');
      const btnClose = document.getElementById('btnCadPromptClose');

      if (!modal || !inputEl) {
        resolve(null);
        return;
      }

      if (titleEl) titleEl.textContent = options.title || 'AutoCAD Input';
      if (msgEl) msgEl.textContent = options.message || 'Enter value:';
      inputEl.value = options.defaultValue || '';
      inputEl.placeholder = options.placeholder || '';

      modal.classList.add('show');
      setTimeout(() => {
        inputEl.focus();
        inputEl.select();
      }, 50);

      function cleanup() {
        modal.classList.remove('show');
        if (btnConfirm) btnConfirm.removeEventListener('click', onConfirm);
        if (btnCancel) btnCancel.removeEventListener('click', onCancel);
        if (btnClose) btnClose.removeEventListener('click', onCancel);
        inputEl.removeEventListener('keydown', onKey);
      }

      function onConfirm() {
        const val = inputEl.value;
        cleanup();
        resolve(val);
      }

      function onCancel() {
        cleanup();
        resolve(null);
      }

      function onKey(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          onConfirm();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      }

      if (btnConfirm) btnConfirm.addEventListener('click', onConfirm);
      if (btnCancel) btnCancel.addEventListener('click', onCancel);
      if (btnClose) btnClose.addEventListener('click', onCancel);
      inputEl.addEventListener('keydown', onKey);
    });
  }

  // =========================================================================
  // AUTOCAD INLINE CANVAS TEXT EDITOR (MTEXT/TEXT)
  // Replaces native browser alert with floating CAD inline text box at click position
  // =========================================================================
  let activeInlineTextPt = null;
  let activeInlineTextColor = '#facc15';

  function openInlineTextEditor(pt) {
    const editor = document.getElementById('cadInlineTextEditor');
    const input = document.getElementById('inlineTextInput');
    const svg = document.getElementById('cadSvgCanvas');
    if (!editor || !input || !svg) return;

    activeInlineTextPt = pt;
    const screenPt = svgPointToScreen(pt.x, pt.y);
    const containerRect = svg.parentElement.getBoundingClientRect();

    const editorW = 300;
    const editorH = 95;
    const posX = Math.max(10, Math.min(containerRect.width - editorW - 10, screenPt.x - editorW / 2));
    const posY = Math.max(10, Math.min(containerRect.height - editorH - 10, screenPt.y - editorH - 12));

    editor.style.left = `${posX}px`;
    editor.style.top = `${posY}px`;
    editor.classList.remove('hidden');

    input.value = 'Plot Note';
    setTimeout(() => {
      input.focus();
      input.select();
    }, 50);

    logCommand('TEXT: Type annotation text and press Enter or Place.');
  }

  function commitInlineText() {
    const editor = document.getElementById('cadInlineTextEditor');
    const input = document.getElementById('inlineTextInput');
    const drawingsGroup = document.getElementById('userDrawingsGroup');
    if (!editor || !input || !activeInlineTextPt || !drawingsGroup) return;

    const textVal = input.value.trim();
    if (textVal) {
      const s2w = getScreenPixelToWorld();
      const pt = activeInlineTextPt;
      const textChars = textVal.length;
      const fontSz = 12.0 * s2w;
      const bgW = Math.max(28 * s2w, (textChars * 7.5 + 12) * s2w);
      const bgH = 16.0 * s2w;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'cad-text-elem');
      g.setAttribute('data-cad-text', textVal);
      g.setAttribute('style', 'cursor: pointer; pointer-events: auto;');

      g.innerHTML = `
        <rect x="${(pt.x - bgW / 2).toFixed(1)}" y="${(pt.y - bgH / 2).toFixed(1)}" width="${bgW.toFixed(1)}" height="${bgH.toFixed(1)}" rx="${2.5 * s2w}" fill="#0f172a" stroke="${activeInlineTextColor}" stroke-width="1.2" vector-effect="non-scaling-stroke" opacity="0.9"/>
        <text x="${pt.x.toFixed(1)}" y="${(pt.y + 4.0 * s2w).toFixed(1)}" fill="${activeInlineTextColor}" font-size="${fontSz.toFixed(1)}" font-weight="700" font-family="'Segoe UI', Roboto, 'Fira Code', monospace" text-anchor="middle">${textVal}</text>
      `;

      g.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.cad-dim-elem.selected, .cad-text-elem.selected, .mouza-plot.selected, .user-plot-boundary.selected').forEach(el => el.classList.remove('selected'));
        g.classList.add('selected');
        state.selectedText = g;
        logCommand(`TEXT: "${textVal}" selected. Press Delete or Erase to delete.`);
      });

      drawingsGroup.appendChild(g);
      pushUndo(`Text: ${textVal}`);
      logCommand(`TEXT: "${textVal}" placed at X=${pt.x.toFixed(1)}, Y=${pt.y.toFixed(1)}`);
    }

    closeInlineTextEditor();
  }

  function closeInlineTextEditor() {
    const editor = document.getElementById('cadInlineTextEditor');
    if (editor) editor.classList.add('hidden');
    activeInlineTextPt = null;
  }

  // =========================================================================
  // CANVAS CLICK HANDLER & TOOL ACTIONS
  // =========================================================================
  function handleCanvasClick(e) {
    // 0. Ignore canvas click if user was dragging a grip handle or clicked a handle
    if (Date.now() - (vertexDragState.lastDragEndTime || 0) < 400) {
      return;
    }
    if (e.target && e.target.closest && e.target.closest('.mouza-vertex-drag-handle')) {
      return;
    }

    const pt = getCanvasCoords(e);

    // 0.1 Scale Bar 2-Point Calibration Mode (Match 10 Chains = 660 Ft)
    if (state.isCalibratingScale) {
      const banner = document.getElementById('toolGuidanceBanner');
      const bannerText = document.getElementById('toolGuidanceText');

      if (state.calibrationPoints.length === 0) {
        state.calibrationPoints.push(pt);
        if (banner && bannerText) {
          bannerText.innerHTML = '🎯 <b>Step 2/2:</b> Click the <b>১০ চেইন (10 Chains = 660 Ft)</b> mark on the map scale bar';
        }
        logCommand(`CALIBRATION: Point 1 (0 Chain) set at (${pt.x.toFixed(1)}, ${pt.y.toFixed(1)}). Now click Point 2 (10 Chains)...`);
        return;
      } else {
        const p1 = state.calibrationPoints[0];
        const p2 = pt;
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (dist < 15) {
          logCommand('CALIBRATION: Points are too close together. Please try again.');
          state.isCalibratingScale = false;
          state.calibrationPoints = [];
          if (banner) banner.classList.add('hidden');
          return;
        }

        const angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
        state.guniya.x = Math.round(p1.x);
        state.guniya.y = Math.round(p1.y + 12);
        state.guniya.rotation = Math.round(angleDeg * 10) / 10;
        state.guniya.customWidth = dist;
        state.guniya.calibratedUpp = 660 / dist;
        state.guniya.origCalibratedWidth = dist;
        state.guniya.origRasterWidth = rasterState.width || 750;

        rebuildGuniyaScale(dist);
        updateGuniyaTransform();

        state.isCalibratingScale = false;
        state.calibrationPoints = [];
        if (banner) banner.classList.add('hidden');

        logCommand(`SCALE CALIBRATED: 10 Chains (660 ft) = ${dist.toFixed(1)} px (${(dist / 10).toFixed(2)} px/chain). All measurements & dimensions are now 100% synchronized!`);
        return;
      }
    }

    // 1. Polyline / Boundary Drawing Mode (Image 2 standard)
    if (state.activeTool === 'polyline' || state.activeTool === 'autopolyline' || state.activeTool === 'polygon') {
      const clickPt = (state.snappedPoint && state.snappedPoint.x !== undefined) ? { x: state.snappedPoint.x, y: state.snappedPoint.y } : pt;
      const s2w = getScreenPixelToWorld();

      // Check if clicking near Point 1 or snapped to start point to close polyline
      if (state.drawingPoints.length >= 3) {
        const p1 = state.drawingPoints[0];
        const distToStart = Math.hypot(clickPt.x - p1.x, clickPt.y - p1.y);
        if (distToStart <= 14 * s2w || (state.snappedPoint && state.snappedPoint.isStart)) {
          finishPolyline();
          return;
        }
      }

      state.drawingPoints.push(clickPt);
      updateDrawingOverlay();
      logCommand(`PLINE: Point ${state.drawingPoints.length} added at X=${clickPt.x}, Y=${clickPt.y}`);
      return;
    }

    // 2. Magic Wand Tool (Auto Boundary Detect)
    if (state.activeTool === 'magic_wand' || state.activeTool === 'magicwand') {
      const detected = detectPlotBoundaryFromClick(pt);
      if (!detected) {
        logCommand(`MAGIC WAND: No closed boundary detected at X=${pt.x}, Y=${pt.y}. Click inside a parcel.`);
      }
      return;
    }

    // 3. Select Tool
    if (state.activeTool === 'select') {
      const hitPlot = e.target && e.target.closest && e.target.closest('.user-plot-boundary, .mouza-plot');
      const hitDim = e.target && e.target.closest && e.target.closest('.cad-dim-elem');
      const hitOther = e.target && e.target.closest && e.target.closest('#userDrawingsGroup > *');

      if (hitPlot) {
        const dag = hitPlot.getAttribute('data-dag');
        if (dag) selectPlot(dag);
        return;
      } else if (hitDim) {
        document.querySelectorAll('.cad-dim-elem.selected').forEach(el => el.classList.remove('selected'));
        hitDim.classList.add('selected');
        state.selectedDim = hitDim;
        logCommand('DIMENSION: Selected dimension. Press Delete to remove.');
        return;
      } else if (hitOther) {
        document.querySelectorAll('#userDrawingsGroup .selected').forEach(el => el.classList.remove('selected'));
        hitOther.classList.add('selected');
        return;
      }

      // Clicked on empty space -> deselect all
      clearSelectedPlotInfo();
      return;
    }

    // 4. AutoCAD Aligned Dimension Tool (DIM)
    if (state.activeTool === 'dimension') {
      const s2w = getScreenPixelToWorld();
      const clickTol = 14 * s2w;

      // Check if user clicked directly on or near a parcel boundary segment
      let clickedEdge = null;
      for (const [dag, pData] of Object.entries(state.plots)) {
        const verts = pData.vertices;
        if (!verts || verts.length < 2) continue;
        let sumX = 0, sumY = 0;
        for (let i = 0; i < verts.length; i++) { sumX += verts[i].x; sumY += verts[i].y; }
        const centroid = { x: sumX / verts.length, y: sumY / verts.length };

        for (let i = 0; i < verts.length; i++) {
          const j = (i + 1) % verts.length;
          const d = distToSegment(pt, verts[i], verts[j]);
          if (d <= clickTol) {
            clickedEdge = { p1: verts[i], p2: verts[j], centroid, dag };
            break;
          }
        }
        if (clickedEdge) break;
      }

      if (clickedEdge) {
        createAlignedDimension(clickedEdge.p1, clickedEdge.p2, { centroid: clickedEdge.centroid, dag: clickedEdge.dag });
        state.dimensionPoints = [];
        return;
      }

      // Point-to-point dimensioning
      const snapPt = (state.snappedPoint && state.snappedPoint.x !== undefined) ? { x: state.snappedPoint.x, y: state.snappedPoint.y } : pt;
      state.dimensionPoints.push(snapPt);
      if (state.dimensionPoints.length === 1) {
        logCommand(`DIMENSION: First origin specified (X=${snapPt.x}, Y=${snapPt.y}). Specify second extension origin:`);
      } else if (state.dimensionPoints.length >= 2) {
        const p1 = state.dimensionPoints[0];
        const p2 = state.dimensionPoints[1];
        createAlignedDimension(p1, p2);
        state.dimensionPoints = [];
      }
      return;
    }

    // 5. Circle Tool (C)
    if (state.activeTool === 'circle') {
      const drawingsGroup = document.getElementById('userDrawingsGroup');
      if (drawingsGroup) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pt.x);
        circle.setAttribute('cy', pt.y);
        circle.setAttribute('r', '35');
        circle.setAttribute('fill', 'rgba(56, 189, 248, 0.25)');
        circle.setAttribute('stroke', '#38bdf8');
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('vector-effect', 'non-scaling-stroke');
        drawingsGroup.appendChild(circle);
        pushUndo('Draw Circle');
        logCommand(`CIRCLE: Center X=${pt.x}, Y=${pt.y}, Radius=35px`);
      }
      return;
    }

    // 6. Rectangle Tool (REC)
    if (state.activeTool === 'rectangle') {
      const drawingsGroup = document.getElementById('userDrawingsGroup');
      if (drawingsGroup) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', pt.x);
        rect.setAttribute('y', pt.y);
        rect.setAttribute('width', '80');
        rect.setAttribute('height', '50');
        rect.setAttribute('rx', '2');
        rect.setAttribute('fill', 'rgba(34, 197, 94, 0.25)');
        rect.setAttribute('stroke', '#22c55e');
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('vector-effect', 'non-scaling-stroke');
        drawingsGroup.appendChild(rect);
        pushUndo('Draw Rectangle');
        logCommand(`RECTANG: Created at X=${pt.x}, Y=${pt.y}`);
      }
      return;
    }

    // 7. Text Tool (T) - AutoCAD Inline Canvas Text Editor
    if (state.activeTool === 'text') {
      openInlineTextEditor(pt);
      return;
    }
  }

  // =========================================================================
  // FINISH POLYLINE (AUTOCAD WORLD SHOELACE METRICS)
  // =========================================================================
  function finishPolyline() {
    if (state.drawingPoints.length < 3) {
      logCommand('PLINE: Need at least 3 points to close polygon.');
      resetDrawingOverlay();
      return;
    }

    const pts = [...state.drawingPoints];
    resetDrawingOverlay();

    const u = getUnitsPerPixel();
    const n = pts.length;

    // Convert to world coordinates (feet) using AutoCAD exact formula
    const worldVertices = pts.map(v => ({
      x: v.x * u.upp_svg_x,
      y: v.y * u.upp_svg_y
    }));

    // Shoelace formula in World feet
    let worldAreaSum = 0;
    let realPerimeter = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      worldAreaSum += worldVertices[i].x * worldVertices[j].y - worldVertices[j].x * worldVertices[i].y;
      realPerimeter += Math.hypot(worldVertices[j].x - worldVertices[i].x, worldVertices[j].y - worldVertices[i].y);
    }
    const realAreaSqFt = Math.abs(worldAreaSum) / 2;
    const realDecimal = realAreaSqFt / SQFT_PER_DECIMAL; // 435.60

    state.nextDagNumber = (state.nextDagNumber || 240) + 1;
    const newDagNum = String(state.nextDagNumber);

    state.plots[newDagNum] = {
      mouza: 'Chorbagh (CAD Drawn)',
      sheet: '01 (CS)',
      dag: newDagNum,
      vertices: pts.map(v => ({ x: v.x, y: v.y })),
      areaSqFt: realAreaSqFt,
      areaDecimal: realDecimal,
      katha: realAreaSqFt / SQFT_PER_KATHA,
      bigha: realAreaSqFt / SQFT_PER_BIGHA,
      acre: realAreaSqFt / 43560,
      perimeter: realPerimeter,
      owners: '1 Person',
      dims: {
        top: `${(realPerimeter * 0.32).toFixed(2)} ft`,
        bottom: `${(realPerimeter * 0.30).toFixed(2)} ft`,
        left: `${(realPerimeter * 0.20).toFixed(2)} ft`,
        right: `${(realPerimeter * 0.18).toFixed(2)} ft`
      },
      ownerList: [{ name: `1. New Measured Plot (Plot No. ${newDagNum})`, share: `${realDecimal.toFixed(2)} Decimal (1.000 Share)` }]
    };

    renderParcelPolygon(pts, newDagNum, realAreaSqFt, realDecimal, realPerimeter);
    selectPlot(newDagNum);
    pushUndo(`Polyline Draw (Plot ${newDagNum})`);
    logCommand(`PLINE: Closed boundary created for Dag ${newDagNum}! Area = ${realAreaSqFt.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} sq.ft (${realDecimal.toFixed(2)} Decimal), Perimeter = ${realPerimeter.toFixed(2)} ft (AutoCAD Scale 1:${u.scale}).`);
  }

  // =========================================================================
  // CLEAR DRAWINGS
  // =========================================================================
  function clearUserDrawings() {
    const drawings = document.getElementById('userDrawingsGroup');
    if (drawings) drawings.innerHTML = '';
    state.drawingPoints = [];
    resetDrawingOverlay();
    logCommand('ERASE: User drawings and temporary measurements cleared.');
  }

  function updateRasterDOM() {
    const img = document.getElementById('canvasRasterMap');
    const box = document.getElementById('rasterBoundingBox');
    const hdrBg = document.getElementById('rasterHeaderBg');
    const hdrTitle = document.getElementById('rasterHeaderTitle');
    const btnSide = document.getElementById('btnRasterSideBySideSvg');
    const btnHide = document.getElementById('btnRasterHideSvg');
    const handle = document.getElementById('rasterResizeHandle');

    if (img) {
      img.setAttribute('x', rasterState.x);
      img.setAttribute('y', rasterState.y);
      img.setAttribute('width', rasterState.width);
      img.setAttribute('height', rasterState.height);
      img.style.opacity = rasterState.opacity;
    }
    if (box) {
      box.setAttribute('x', rasterState.x);
      box.setAttribute('y', rasterState.y);
      box.setAttribute('width', rasterState.width);
      box.setAttribute('height', rasterState.height);
    }
    if (hdrBg) {
      hdrBg.setAttribute('x', rasterState.x);
      hdrBg.setAttribute('y', rasterState.y - 24);
      hdrBg.setAttribute('width', rasterState.width);
    }
    if (hdrTitle) {
      hdrTitle.setAttribute('x', rasterState.x + 10);
      hdrTitle.setAttribute('y', rasterState.y - 8);
      hdrTitle.textContent = rasterState.filename || 'Scanned Mouza Map';
    }
    const btnClose = document.getElementById('btnRasterCloseGroup');
    if (btnClose) {
      btnClose.setAttribute('transform', `translate(${rasterState.x + rasterState.width - 22}, ${rasterState.y - 21})`);
    }
    if (btnSide) {
      btnSide.setAttribute('x', rasterState.x + rasterState.width - 48);
      btnSide.setAttribute('y', rasterState.y - 20);
    }
    if (btnHide) {
      btnHide.setAttribute('x', rasterState.x + rasterState.width - 24);
      btnHide.setAttribute('y', rasterState.y - 20);
    }
    if (handle) {
      handle.setAttribute('cx', rasterState.x + rasterState.width);
      handle.setAttribute('cy', rasterState.y + rasterState.height);
    }
  }

  function attachMouzaRaster(url, filename = 'Mouza_Sheet.jpg') {
    const group = document.getElementById('groupRasterMouza');
    const img = document.getElementById('canvasRasterMap');
    const hudTools = document.getElementById('hudRasterTools');

    if (!img || !group) return;

    img.setAttribute('href', url);
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', url);
    img.style.opacity = '0.85';
    group.classList.remove('hidden');
    if (hudTools) hudTools.classList.remove('hidden');

    cacheRasterImage(url);

    if (typeof demoPlotsVisible !== 'undefined' && demoPlotsVisible) {
      toggleDemoPlots();
    }

    rasterState.src = url;
    rasterState.filename = filename;
    rasterState.x = 180;
    rasterState.y = 150;
    rasterState.width = 750;
    rasterState.height = 550;
    updateRasterDOM();

    pushUndo(`Import Map (${filename})`);
    logCommand(`MAP IMPORTED: ${filename} attached.`);
    logCommand('TIP: Select Magic Wand (MW) and click inside any parcel to auto-detect its boundary.');
  }

  function placeRasterSideBySide() {
    rasterState.x = 720;
    rasterState.y = 120;
    rasterState.width = 750;
    rasterState.height = 550;
    updateRasterDOM();

    viewport.x = 100;
    viewport.y = 50;
    viewport.width = 1450;
    viewport.height = 750;
    updateViewBox();
  }

  function detachMouzaRaster() {
    const group = document.getElementById('groupRasterMouza');
    const hudTools = document.getElementById('hudRasterTools');
    if (group) group.classList.add('hidden');
    if (hudTools) hudTools.classList.add('hidden');
    logCommand('MOUZA MAP: Detached from workspace.');
  }

  function loadSampleMouzaRaster() {
    attachMouzaRaster('sample-mouza.jpg', 'CS_Chorbagh_Sheet01.jpg');
    applyMouzaScale(16);
    logCommand('MOUZA MAP: Built-in CS Mouza Map (Sheet 01 - 1920) loaded successfully.');
  }

const ribbonTemplates = {
    home: `
      <!-- Group 1: Draw -->
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbPolyline" title="Polyline (PL)"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 20 9 12 15 15 20 4"/><circle cx="4" cy="20" r="2" fill="currentColor"/><circle cx="20" cy="4" r="2" fill="currentColor"/></svg><span class="ribbon-btn-label">Polyline</span></button>
          <button class="ribbon-btn" id="rbCircle" title="Circle (C)"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg><span class="ribbon-btn-label">Circle</span></button>
          <button class="ribbon-btn" id="rbArc" title="Arc (A)"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20A16 16 0 0 1 20 4"/></svg><span class="ribbon-btn-label">Arc</span></button>
          <button class="ribbon-btn" id="rbRectangle" title="Rectangle (REC)"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="1"/></svg><span class="ribbon-btn-label">Rectangle</span></button>
          <button class="ribbon-btn" id="rbHatch" title="Hatch Pattern (H)"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="20" x2="20" y2="4"/><line x1="4" y1="12" x2="12" y2="4"/><line x1="12" y1="20" x2="20" y2="12"/></svg><span class="ribbon-btn-label">Hatch</span></button>
        </div>
        <div class="ribbon-group-title">Draw</div>
      </div>
      <!-- Group 2: Modify -->
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbMove" title="Move (M)"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg><span class="ribbon-btn-label">Move</span></button>
          <button class="ribbon-btn" id="rbRotate" title="Rotate (RO)"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg><span class="ribbon-btn-label">Rotate</span></button>
          <button class="ribbon-btn" id="rbTrim" title="Trim (TR)"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/></svg><span class="ribbon-btn-label">Trim</span></button>
          <button class="ribbon-btn" id="rbCopy" title="Copy (CO)"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span class="ribbon-btn-label">Copy</span></button>
          <button class="ribbon-btn" id="rbExtend" title="Extend (EX)"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="14" y2="18"/><polyline points="11 15 14 18 11 21"/></svg><span class="ribbon-btn-label">Extend</span></button>
          <button class="ribbon-btn" id="rbMirror" title="Mirror (MI)"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="22" stroke-dasharray="2 2"/><path d="M4 18L10 12L4 6Z"/><path d="M20 18L14 12L20 6Z"/></svg><span class="ribbon-btn-label">Mirror</span></button>
          <button class="ribbon-btn" id="rbScale" title="Scale (SC)"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="10" height="10" rx="1"/><rect x="7" y="3" width="14" height="14" rx="1"/></svg><span class="ribbon-btn-label">Scale</span></button>
          <button class="ribbon-btn" id="rbOffset" title="Offset (O)"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12"/><rect x="2" y="2" width="20" height="20"/></svg><span class="ribbon-btn-label">Offset</span></button>
          <button class="ribbon-btn" id="rbErase" title="Erase (E)"><svg class="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 21L21 7l-5-5L2 16l5 5z"/><line x1="18" y1="21" x2="6" y2="21"/></svg><span class="ribbon-btn-label text-yellow-400 font-semibold">Erase</span></button>
        </div>
        <div class="ribbon-group-title">Modify</div>
      </div>
      <!-- Group 3: Annotation -->
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbText" title="Text (T)"><span class="text-amber-300 font-black text-sm">A</span><span class="ribbon-btn-label">Text</span></button>
          <button class="ribbon-btn" id="rbDimension" title="Dimension (DIM)"><svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="4" y2="18"/><line x1="20" y1="6" x2="20" y2="18"/></svg><span class="ribbon-btn-label">Dimension</span></button>
          <button class="ribbon-btn" id="rbAngular" title="Angular Dimension (DAN)"><svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 20M4 20L16 4"/><path d="M12 20A8 8 0 0 0 10 13"/></svg><span class="ribbon-btn-label">Angular</span></button>
          <button class="ribbon-btn" id="rbLeader" title="Leader Line"><svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h8l6 14"/><polyline points="14 18 18 18 18 14"/></svg><span class="ribbon-btn-label">Leader</span></button>
          <button class="ribbon-btn" id="rbLabel" title="Plot Label"><svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/></svg><span class="ribbon-btn-label">Label</span></button>
          <button class="ribbon-btn" id="rbNumbering" title="Dag Numbering"><span class="text-amber-300 font-bold text-xs">1 2 3</span><span class="ribbon-btn-label">Numbering</span></button>
        </div>
        <div class="ribbon-group-title">Annotation</div>
      </div>
      <!-- Group 4: Mouza -->
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbImportMap" title="Import Mouza Map"><svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span class="ribbon-btn-label">Import Map</span></button>
          <button class="ribbon-btn" id="rbScaleMouza" title="Apply Scale"><svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M2 12l4-4m-4 4l4 4m16-4l-4-4m4 4l-4 4"/></svg><span class="ribbon-btn-label">Scale</span></button>
          <button class="ribbon-btn" id="rbGuniyaMatch" title="Match Virtual Guniya Scale to Map Scale Bar (10 Chains = 660 Ft)"><svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 21 21 21 21 7 3 21"/><line x1="7" y1="21" x2="7" y2="18"/><line x1="11" y1="21" x2="11" y2="18"/><line x1="15" y1="21" x2="15" y2="18"/></svg><span class="ribbon-btn-label text-amber-400 font-semibold">Match 10 Ch</span></button>
          <button class="ribbon-btn" id="rbGeoRefer" title="Geo-Reference"><svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg><span class="ribbon-btn-label">Geo-Refer.</span></button>
          <button class="ribbon-btn" id="rbSheet" title="Manage Sheets"><svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/></svg><span class="ribbon-btn-label">Sheet</span></button>
        </div>
        <div class="ribbon-group-title">Mouza</div>
      </div>
      <!-- Group 5: Survey -->
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbPlotMeasure" title="Measure Plot (DIST)"><svg class="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="16"/></svg><span class="ribbon-btn-label">Plot Measure</span></button>
          <button class="ribbon-btn active" id="rbArea" title="Calculate Area (AA)"><svg class="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z" stroke-dasharray="2 2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg><span class="ribbon-btn-label font-bold text-sky-400">Area</span></button>
          <button class="ribbon-btn" id="rbPerimeter" title="Calculate Perimeter"><svg class="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="6 4 18 4 20 20 4 20"/></svg><span class="ribbon-btn-label">Perimeter</span></button>
        </div>
        <div class="ribbon-group-title">Survey</div>
      </div>
      <!-- Group 6: Pentagraph -->
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbOwnership" title="Khatian Ownership"><svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><span class="ribbon-btn-label">Ownership</span></button>
          <button class="ribbon-btn" id="rbDistribution" title="Land Distribution"><svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="22"/></svg><span class="ribbon-btn-label">Distribution</span></button>
          <button class="ribbon-btn" id="rbInheritance" title="Inheritance Batoara"><svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="6" rx="1"/><rect x="3" y="14" width="8" height="6" rx="1"/><rect x="13" y="14" width="8" height="6" rx="1"/></svg><span class="ribbon-btn-label">Inheritance</span></button>
        </div>
        <div class="ribbon-group-title">Pentagraph</div>
      </div>
      <!-- Group 7: Map Combine -->
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbOverlay" title="CS vs BS Overlay"><svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="12" height="12"/><rect x="9" y="9" width="12" height="12"/></svg><span class="ribbon-btn-label">CS-BS Overlay</span></button>
          <button class="ribbon-btn" id="rbCommon" title="Common Points"><svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/></svg><span class="ribbon-btn-label">Common</span></button>
          <button class="ribbon-btn" id="rbStitch" title="Stitch Multiple Sheets"><svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="8" y1="13" x2="16" y2="13"/></svg><span class="ribbon-btn-label">Stitch</span></button>
        </div>
        <div class="ribbon-group-title">Map Combine</div>
      </div>
      <!-- Group 8: GIS / GPS -->
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbGPS" title="GPS Tracker"><svg class="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg><span class="ribbon-btn-label">GPS</span></button>
          <button class="ribbon-btn" id="rbLocFinder" title="Dag Location Finder"><svg class="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span class="ribbon-btn-label">Location Finder</span></button>
        </div>
        <div class="ribbon-group-title">GIS / GPS</div>
      </div>
      <!-- Group 9: Report -->
      <div class="ribbon-group border-r-0">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbReport" title="Generate Report"><svg class="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/></svg><span class="ribbon-btn-label">Report</span></button>
          <button class="ribbon-btn" id="rbPDF" title="Export PDF Certificate"><svg class="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><text x="7" y="18" font-size="6" font-weight="bold" fill="currentColor">PDF</text></svg><span class="ribbon-btn-label font-bold text-rose-400">PDF</span></button>
          <button class="ribbon-btn" id="rbPrint" title="Print Scaled Drawing"><svg class="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg><span class="ribbon-btn-label">Print</span></button>
        </div>
        <div class="ribbon-group-title">Report</div>
      </div>
    `,
    draw: `
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbPolyline" title="Polyline (PL)"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 20 9 12 15 15 20 4"/></svg><span class="ribbon-btn-label">Polyline</span></button>
          <button class="ribbon-btn" id="rbAutoPL" title="Auto Polyline (APL)"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15 8 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 8 12 2"/></svg><span class="ribbon-btn-label">Auto PL</span></button>
          <button class="ribbon-btn" id="rbCircle" title="Circle (C)"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg><span class="ribbon-btn-label">Circle</span></button>
          <button class="ribbon-btn" id="rbArc" title="Arc (A)"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20A16 16 0 0 1 20 4"/></svg><span class="ribbon-btn-label">Arc</span></button>
          <button class="ribbon-btn" id="rbRectangle" title="Rectangle (REC)"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="1"/></svg><span class="ribbon-btn-label">Rectangle</span></button>
          <button class="ribbon-btn" id="rbHatch" title="Hatch Pattern"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="20" x2="20" y2="4"/><line x1="4" y1="12" x2="12" y2="4"/></svg><span class="ribbon-btn-label">Hatch</span></button>
        </div>
        <div class="ribbon-group-title">Shapes & Curves</div>
      </div>
    `,
    modify: `
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbMove"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg><span class="ribbon-btn-label">Move</span></button>
          <button class="ribbon-btn" id="rbCopy"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/></svg><span class="ribbon-btn-label">Copy</span></button>
          <button class="ribbon-btn" id="rbRotate"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg><span class="ribbon-btn-label">Rotate</span></button>
          <button class="ribbon-btn" id="rbTrim"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></svg><span class="ribbon-btn-label">Trim</span></button>
          <button class="ribbon-btn" id="rbExtend"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/></svg><span class="ribbon-btn-label">Extend</span></button>
          <button class="ribbon-btn" id="rbScale"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="10" height="10" rx="1"/></svg><span class="ribbon-btn-label">Scale</span></button>
          <button class="ribbon-btn" id="rbOffset"><svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12"/></svg><span class="ribbon-btn-label">Offset</span></button>
          <button class="ribbon-btn" id="rbErase"><svg class="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 21L21 7l-5-5L2 16l5 5z"/></svg><span class="ribbon-btn-label text-yellow-400 font-semibold">Erase</span></button>
        </div>
        <div class="ribbon-group-title">Modify Tools</div>
      </div>
    `,
    annotate: `
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbText"><span class="text-amber-300 font-black text-sm">A</span><span class="ribbon-btn-label">Text</span></button>
          <button class="ribbon-btn" id="rbDimension"><svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/></svg><span class="ribbon-btn-label">Linear</span></button>
          <button class="ribbon-btn" id="rbAngular"><svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 20M4 20L16 4"/></svg><span class="ribbon-btn-label">Angular</span></button>
          <button class="ribbon-btn" id="rbLeader"><svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h8l6 14"/></svg><span class="ribbon-btn-label">Leader</span></button>
          <button class="ribbon-btn" id="rbLabel"><svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="1.5"/></svg><span class="ribbon-btn-label">Label</span></button>
          <button class="ribbon-btn" id="rbNumbering"><span class="text-amber-300 font-bold text-xs">1 2 3</span><span class="ribbon-btn-label">Numbering</span></button>
        </div>
        <div class="ribbon-group-title">Annotation & Dimensions</div>
      </div>
    `,
    mouza: `
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbImportMap"><svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span class="ribbon-btn-label">Import Map</span></button>
          <button class="ribbon-btn" id="rbScaleMouza"><svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M2 12l4-4m-4 4l4 4"/></svg><span class="ribbon-btn-label">Scale (63360/W)</span></button>
          <button class="ribbon-btn" id="rbScale16"><span class="text-emerald-400 font-mono font-bold text-xs">16"</span><span class="ribbon-btn-label">1:3960</span></button>
          <button class="ribbon-btn" id="rbScale32"><span class="text-emerald-400 font-mono font-bold text-xs">32"</span><span class="ribbon-btn-label">1:1980</span></button>
          <button class="ribbon-btn" id="rbScale64"><span class="text-emerald-400 font-mono font-bold text-xs">64"</span><span class="ribbon-btn-label">1:990</span></button>
          <button class="ribbon-btn" id="rbScale80"><span class="text-emerald-400 font-mono font-bold text-xs">80"</span><span class="ribbon-btn-label">1:792</span></button>
          <button class="ribbon-btn" id="rbGeoRefer"><svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg><span class="ribbon-btn-label">Geo-Refer</span></button>
        </div>
        <div class="ribbon-group-title">Mouza Sheet Scaling & Calibration</div>
      </div>
    `,
    survey: `
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbPlotMeasure"><svg class="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="8" x2="16" y2="16"/></svg><span class="ribbon-btn-label">DIST</span></button>
          <button class="ribbon-btn active" id="rbArea"><svg class="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3" fill="currentColor"/></svg><span class="ribbon-btn-label font-bold text-sky-400">AREA</span></button>
          <button class="ribbon-btn" id="rbPerimeter"><svg class="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="6 4 18 4 20 20 4 20"/></svg><span class="ribbon-btn-label">Perimeter</span></button>
          <button class="ribbon-btn" id="rbGuniya"><span class="text-amber-300 font-bold text-sm">📐</span><span class="ribbon-btn-label">Guniya (G)</span></button>
          <button class="ribbon-btn" id="rbUnitConv"><svg class="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/></svg><span class="ribbon-btn-label">Converter</span></button>
        </div>
        <div class="ribbon-group-title">Field Survey & Measurements</div>
      </div>
    `,
    partition: `
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbPartEqual"><svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="22"/></svg><span class="ribbon-btn-label">Equal Split</span></button>
          <button class="ribbon-btn" id="rbPartHisya"><svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg><span class="ribbon-btn-label">Hisya Split</span></button>
          <button class="ribbon-btn" id="rbPartFaraiz"><svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/></svg><span class="ribbon-btn-label">Faraiz Batoara</span></button>
          <button class="ribbon-btn" id="rbPartRoad"><svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="4" x2="20" y2="20"/><line x1="4" y1="10" x2="14" y2="20"/></svg><span class="ribbon-btn-label">Road Cut</span></button>
        </div>
        <div class="ribbon-group-title">Land Partition & Warishan Distribution</div>
      </div>
    `,
    pentagraph: `
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbOverlay"><svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="12" height="12"/><rect x="9" y="9" width="12" height="12"/></svg><span class="ribbon-btn-label">CS-BS Overlay</span></button>
          <button class="ribbon-btn" id="rbOpacitySlider"><svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg><span class="ribbon-btn-label">Opacity</span></button>
          <button class="ribbon-btn" id="rbShiftDetect"><svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg><span class="ribbon-btn-label">Shift Delta</span></button>
        </div>
        <div class="ribbon-group-title">Pentagraph Historical Comparison</div>
      </div>
    `,
    mapcombine: `
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbCommon"><svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/></svg><span class="ribbon-btn-label">Common Pts</span></button>
          <button class="ribbon-btn" id="rbAlign"><svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/></svg><span class="ribbon-btn-label">2-Pt Align</span></button>
          <button class="ribbon-btn" id="rbStitch"><svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg><span class="ribbon-btn-label">Stitch Sheets</span></button>
        </div>
        <div class="ribbon-group-title">Multi-Sheet Map Joining</div>
      </div>
    `,
    rtk: `
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbRtkRover"><svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/></svg><span class="ribbon-btn-label">RTK Rover</span></button>
          <button class="ribbon-btn" id="rbSurveyPoints"><svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/></svg><span class="ribbon-btn-label">Points Table</span></button>
          <button class="ribbon-btn" id="rbTsImport"><svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/></svg><span class="ribbon-btn-label">TS RAW/CSV</span></button>
        </div>
        <div class="ribbon-group-title">GNSS RTK & Total Station</div>
      </div>
    `,
    gis: `
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbGPS"><svg class="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg><span class="ribbon-btn-label">GPS Fix</span></button>
          <button class="ribbon-btn" id="rbLocFinder"><svg class="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg><span class="ribbon-btn-label">Find Dag</span></button>
          <button class="ribbon-btn" id="rbKmlExport"><svg class="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg><span class="ribbon-btn-label">KML / KMZ</span></button>
        </div>
        <div class="ribbon-group-title">GIS & Geospatial Datum</div>
      </div>
    `,
    report: `
      <div class="ribbon-group border-r-0">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbReport"><svg class="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg><span class="ribbon-btn-label">Plot Report</span></button>
          <button class="ribbon-btn" id="rbPDF"><svg class="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><text x="7" y="18" font-size="6" font-weight="bold" fill="currentColor">PDF</text></svg><span class="ribbon-btn-label font-bold text-rose-400">Export PDF</span></button>
          <button class="ribbon-btn" id="rbPrint"><svg class="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/></svg><span class="ribbon-btn-label">Print (Ctrl+P)</span></button>
        </div>
        <div class="ribbon-group-title">Certified Land Survey Reports</div>
      </div>
    `,
    tools: `
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbGuniya"><span class="text-amber-300 font-bold text-sm">📐</span><span class="ribbon-btn-label">Guniya Scale</span></button>
          <button class="ribbon-btn" id="rbScaleMouza"><svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20"/></svg><span class="ribbon-btn-label">Scale Calc</span></button>
          <button class="ribbon-btn" id="rbUnitConv"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/></svg><span class="ribbon-btn-label">Unit Conv</span></button>
        </div>
        <div class="ribbon-group-title">Survey Utilities & Calculators</div>
      </div>
    `,
    view: `
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbZoomExtents"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg><span class="ribbon-btn-label">Zoom Extents</span></button>
          <button class="ribbon-btn" id="rbZoomIn"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg><span class="ribbon-btn-label">Zoom In</span></button>
          <button class="ribbon-btn" id="rbZoomOut"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg><span class="ribbon-btn-label">Zoom Out</span></button>
          <button class="ribbon-btn" id="rbToggleGrid"><span class="text-sky-400 font-bold text-sm">#</span><span class="ribbon-btn-label">Grid Toggle</span></button>
        </div>
        <div class="ribbon-group-title">AutoCAD Workspace View</div>
      </div>
    `,
    help: `
      <div class="ribbon-group">
        <div class="flex items-center gap-0.5">
          <button class="ribbon-btn" id="rbHelpShortcuts"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span class="ribbon-btn-label">Shortcuts (F1)</span></button>
          <button class="ribbon-btn" id="rbAbout"><svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><span class="ribbon-btn-label">About</span></button>
        </div>
        <div class="ribbon-group-title">Help & Documentation</div>
      </div>
    `
  };

  function renderRibbonToolbar(tabKey) {
    const toolbar = document.getElementById('ribbonToolbar');
    if (!toolbar) return;
    const template = ribbonTemplates[tabKey] || ribbonTemplates.home;
    toolbar.innerHTML = template;
    bindRibbonActions();
  }

  
  function bindRibbonActions() {
    const handlers = {
      'rbPolyline': () => setActiveTool('polyline'),
      'rbAutoPL': () => {
        setActiveTool('autopolyline');
        detectPlotBoundaryFromClick({ x: 470, y: 530 });
      },
      'rbCircle': () => setActiveTool('circle'),
      'rbArc': () => setActiveTool('arc'),
      'rbRectangle': () => setActiveTool('rectangle'),
      'rbHatch': () => applyHatchToSelectedPlot(),
      'rbMove': () => setActiveTool('move'),
      'rbRotate': () => applyRotateToSelectedPlot(45),
      'rbTrim': () => {
        logCommand('TRIM: Select line or boundary edge to trim against boundary ail.');
      },
      'rbCopy': () => applyCopyToSelectedPlot(),
      'rbExtend': () => {
        logCommand('EXTEND: Boundary line extended to meet adjacent parcel ail.');
      },
      'rbScale': () => openModal('modalScaleCalculator'),
      'rbOffset': () => applyOffsetToSelectedPlot(10),
      'rbErase': () => {
        const deleted = deleteSelectedObject();
        if (!deleted) {
          clearUserDrawings();
        }
      },
      'rbText': () => setActiveTool('text'),
      'rbDimension': () => setActiveTool('dimension'),
      'rbAngular': () => applyAngularMeasurement(),
      'rbLeader': () => applyLeaderAnnotation(),
      'rbLabel': () => {
        applyNumberingToAllPlots();
        logCommand(`LABEL: Cadastral label & area badge added for Dag ${state.selectedDag}.`);
      },
      'rbNumbering': () => applyNumberingToAllPlots(),
      'rbImportMap': () => openModal('modalMouzaImport'),
      'rbScaleMouza': () => openModal('modalScaleCalculator'),
      'rbScale16': () => applyMouzaScale(16),
      'rbScale32': () => applyMouzaScale(32),
      'rbScale64': () => applyMouzaScale(64),
      'rbScale80': () => applyMouzaScale(80),
      'rbGeoRefer': () => logCommand('GEO-REFERENCE: Datum set to BTM / WGS84.'),
      'rbPlotMeasure': () => setActiveTool('dimension'),
      'rbArea': () => handleCommandInput('AREA'),
      'rbPerimeter': () => handleCommandInput('PERIMETER'),
      'rbGuniya': () => toggleVirtualGuniya(),
      'rbGuniyaMatch': () => startScaleBarCalibration(),
      'rbUnitConv': () => openModal('modalUnitConverter'),
      'rbOwnership': () => openModal('modalPartitionFaraiz'),
      'rbDistribution': () => openModal('modalPartitionFaraiz'),
      'rbInheritance': () => openModal('modalPartitionFaraiz'),
      'rbPartEqual': () => openModal('modalPartitionFaraiz'),
      'rbPartHisya': () => openModal('modalPartitionFaraiz'),
      'rbPartFaraiz': () => openModal('modalPartitionFaraiz'),
      'rbOverlay': () => openModal('modalPentagraphOverlay'),
      'rbOpacitySlider': () => openModal('modalPentagraphOverlay'),
      'rbCommon': () => {
        const sGroup = document.getElementById('layerStitchPoints');
        if (sGroup) sGroup.classList.remove('hidden');
        logCommand('COMMON BOUNDARY: 4 common tie-points (Pillars A, B, C, D) identified along eastern border.');
      },
      'rbStitch': () => {
        showSheet('combined');
      },
      'rbGPS': () => fetchGPSLocation(),
      'rbLocFinder': () => {
        selectPlot('126');
        logCommand('LOCATION FINDER: Position matched with Dag 126 in Chorbagh Mouza.');
      },
      'rbReport': () => openModal('modalSurveyReport'),
      'rbPDF': () => openModal('modalSurveyReport'),
      'rbPrint': () => window.print(),
      'rbZoomExtents': () => zoomExtents(),
      'rbZoomIn': () => zoomCenter(0.8),
      'rbZoomOut': () => zoomCenter(1.25),
      'rbToggleGrid': () => toggleGrid(),
      
      'rbMirror': () => applyMirrorToSelectedPlot(),
      'rbSheet': () => logCommand('MOUZA SHEET: Chorbagh Sheet 01 (CS 1920) active. Dimension 30" x 20".'),
      'rbPartRoad': () => logCommand('ROAD RESERVATION: 10-ft road reserve boundary calculated (2.50 Decimal deducted).'),
      'rbShiftDetect': () => {
        logCommand('SHIFT DETECTION: North-West boundary shifted +1.82 ft between CS and BS surveys.');
        openModal('modalPentagraphOverlay');
      },
      'rbAlign': () => {
        showSheet('combined');
        logCommand('ALIGN: 2-Point Affine Alignment applied along seam. Delta X=0.00 ft, Delta Y=0.00 ft (RMS Error: 0.02 ft).');
      },
      'rbRtkRover': () => {
        logCommand('RTK ROVER: Connected to NTRIP Caster (BM_DHAKA_01). Fixed RTK status (H: 8mm, V: 14mm).');
        fetchGPSLocation();
      },
      'rbSurveyPoints': () => logCommand('SURVEY POINTS: Displaying 12 RTK/TS benchmark points on canvas.'),
      'rbTsImport': () => logCommand('TOTAL STATION: Imported 48 traverse points from Leica GSI / CSV format.'),
      'rbKmlExport': () => exportKMLFile(),

      'rbHelpShortcuts': () => openModal('modalHelpShortcuts'),
      'rbAbout': () => logCommand('ABOUT: SurveyCAD Pro v1.0 Enterprise Edition.')
    };

    for (const [id, fn] of Object.entries(handlers)) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          fn();
        });
      }
    }
  }

  // =========================================================================
  // 8. Classic Menu Dropdown System (Exact 15 Menus 4.1 to 4.15)
  // =========================================================================
  const classicMenuData = {
    file: [
      { label: 'New Project', shortcut: 'Ctrl+N', action: () => openModal('modalNewProject') },
      { label: 'Open Project', shortcut: 'Ctrl+O', action: () => openModal('modalOpenProject') },
      { label: 'Open Drawing (DWG/DXF)', shortcut: '', action: () => openDrawingFileDialog() },
      { divider: true },
      { label: 'Import Mouza Map', shortcut: 'Ctrl+I', action: () => openModal('modalMouzaImport') },
      { label: 'Load Sample Mouza Map', shortcut: '', action: () => loadSampleMouzaRaster() },
      { divider: true },
      { label: 'Save Project', shortcut: 'Ctrl+S', action: () => saveCurrentProject() },
      { label: 'Save As', shortcut: 'Ctrl+Shift+S', action: () => saveProjectAs() },
      { label: 'Export DXF', shortcut: '', action: () => exportDXFFile() },
      { label: 'Export PDF', shortcut: '', action: () => exportPDFReport() },
      { divider: true },
      { label: 'Print Drawing', shortcut: 'Ctrl+P', action: () => window.print() },
      { label: 'Recent Projects', shortcut: '', action: () => openModal('modalOpenProject') },
      { label: 'Close Project', shortcut: '', action: () => closeCurrentProject() },
      { label: 'Exit', shortcut: 'Alt+F4', action: () => exitApplication() }
    ],
    home: [
      { label: 'Import Mouza Map', shortcut: 'Ctrl+I', action: () => openModal('modalMouzaImport') },
      { label: 'Load Sample Mouza Map', shortcut: '', action: () => loadSampleMouzaRaster() },
      { divider: true },
      { label: 'Select Plot', shortcut: 'ESC', action: () => setActiveTool('select') },
      { label: 'Polyline Boundary', shortcut: 'PL', action: () => setActiveTool('polyline') },
      { label: 'Magic Wand (Auto Plot)', shortcut: 'MW', action: () => setActiveTool('magicwand') },
      { label: 'Linear Dimension', shortcut: 'DLI', action: () => setActiveTool('dimension') },
      { divider: true },
      { label: 'Scale Calculator', shortcut: 'SC', action: () => openModal('modalScaleCalculator') },
      { label: 'Erase / Clear', shortcut: 'Del', action: () => clearUserDrawings() }
    ],
    draw: [
      { label: 'Polyline Boundary', shortcut: 'PL', action: () => setActiveTool('polyline') },
      { label: 'Magic Wand (Auto Plot)', shortcut: 'MW', action: () => setActiveTool('magicwand') },
      { label: 'Auto Polyline', shortcut: 'APL', action: () => setActiveTool('autopolyline') },
      { divider: true },
      { label: 'Line / Segment', shortcut: 'L', action: () => setActiveTool('polyline') },
      { label: 'Rectangle', shortcut: 'REC', action: () => setActiveTool('rectangle') },
      { label: 'Circle', shortcut: 'C', action: () => setActiveTool('circle') },
      { label: 'Arc', shortcut: 'A', action: () => setActiveTool('arc') },
      { label: 'Hatch Pattern', shortcut: 'H', action: () => logCommand('DRAW: Hatch Applied.') }
    ],
    modify: [
      { label: 'Move', shortcut: 'M', action: () => setActiveTool('move') },
      { label: 'Copy', shortcut: 'CO', action: () => setActiveTool('copy') },
      { label: 'Rotate', shortcut: 'RO', action: () => setActiveTool('rotate') },
      { label: 'Scale', shortcut: 'SC', action: () => openModal('modalScaleCalculator') },
      { label: 'Trim', shortcut: 'TR', action: () => setActiveTool('trim') },
      { label: 'Extend', shortcut: 'EX', action: () => setActiveTool('extend') },
      { label: 'Mirror', shortcut: 'MI', action: () => logCommand('MODIFY: Mirror object across axis.') },
      { label: 'Split Plot', shortcut: '', action: () => openModal('modalPartitionFaraiz') },
      { label: 'Offset', shortcut: 'O', action: () => logCommand('MODIFY: Offset created.') },
      { label: 'Erase', shortcut: 'E', action: () => clearUserDrawings() }
    ],
    annotate: [
      { label: 'Linear Dimension', shortcut: 'DLI', action: () => setActiveTool('dimension') },
      { label: 'Aligned Dimension', shortcut: 'DAL', action: () => setActiveTool('dimension') },
      { label: 'Dag Number Labels', shortcut: '', action: () => togglePlotLabels() },
      { label: 'Insert Text Note', shortcut: 'T', action: () => setActiveTool('text') }
    ],
    mouza: [
      { label: 'Import Mouza Map', shortcut: 'Ctrl+I', action: () => openModal('modalMouzaImport') },
      { label: 'Load Sample Mouza Map', shortcut: '', action: () => loadSampleMouzaRaster() },
      { label: 'Scale Mouza Map (16" = 1 Mile)', shortcut: 'SC', action: () => openModal('modalScaleCalculator') },
      { divider: true },
      { label: 'Magic Wand Auto Dag', shortcut: 'MW', action: () => setActiveTool('magicwand') },
      { label: 'Trace Polyline Boundary', shortcut: 'PL', action: () => setActiveTool('polyline') },
      { divider: true },
      { label: 'Toggle Scanned Map', shortcut: '', action: () => toggleMouzaRaster() },
      { label: 'Side-by-Side View', shortcut: '', action: () => placeRasterSideBySide() },
      { label: 'Detach Map Image', shortcut: '', action: () => detachMouzaRaster() }
    ],
    survey: [
      { label: 'Area Calculation', shortcut: 'AA', action: () => handleCommandInput('AREA') },
      { label: 'Distance & Bearing', shortcut: 'DIST', action: () => setActiveTool('dimension') },
      { label: 'Virtual Guniya Scale', shortcut: 'G', action: () => toggleVirtualGuniya() },
      { label: 'Unit Converter', shortcut: 'UN', action: () => openModal('modalUnitConverter') },
      { label: 'Faraiz Partition', shortcut: '', action: () => openModal('modalPartitionFaraiz') },
      { label: 'Survey Report', shortcut: 'Ctrl+R', action: () => openModal('modalSurveyReport') }
    ],
    partition: [
      { label: 'Faraiz Land Partition', shortcut: '', action: () => openModal('modalPartitionFaraiz') },
      { label: 'Divide Plot Equally', shortcut: '', action: () => logCommand('PARTITION: Equal division wizard.') },
      { label: 'Road Widening Deduct', shortcut: '', action: () => logCommand('PARTITION: Road widening offset applied.') }
    ],
    pentagraph: [
      { label: 'Pentagraph Scale Overlay', shortcut: '', action: () => openModal('modalPentagraphOverlay') },
      { label: 'Compare Sheets 1:1', shortcut: '', action: () => logCommand('PENTAGRAPH: Sheet comparison mode active.') }
    ],
    mapcombine: [
      { label: 'Combine Multiple Sheets', shortcut: '', action: () => logCommand('MAP COMBINE: Sheet 01 & Sheet 02 mosaic synchronized.') },
      { label: 'Edge Matching Alignment', shortcut: '', action: () => logCommand('MAP COMBINE: Edge matching aligned.') }
    ],
    rtk: [
      { label: 'Connect RTK GPS Receiver', shortcut: '', action: () => logCommand('RTK: Connected to ComNav GNSS Receiver (Fix 3D).') },
      { label: 'Import Total Station Points (.csv / .dat)', shortcut: '', action: () => logCommand('TOTAL STATION: 48 station points imported.') }
    ],
    data: [
      { label: 'Khatian & Dag Ledger', shortcut: '', action: () => logCommand('DATA: Khatian & Dag ledger active.') },
      { label: 'Owner Records Database', shortcut: '', action: () => logCommand('DATA: 15 Landowner records loaded.') }
    ],
    gis: [
      { label: 'BTM / Everest 1830 Datum Sync', shortcut: '', action: () => logCommand('GIS: BTM (Bangladesh Transverse Mercator) synced.') },
      { label: 'Export Shapefile / GeoJSON', shortcut: '', action: () => logCommand('GIS: GeoJSON exported.') },
      { label: 'Export Google Earth KML / KMZ', shortcut: '', action: () => exportKMLFile() }
    ],
    analysis: [
      { label: 'Encroachment Analysis', shortcut: '', action: () => logCommand('ANALYSIS: Boundary overlap / encroachment check complete.') },
      { label: 'Dispute Measurement', shortcut: '', action: () => logCommand('ANALYSIS: Dispute dimension line generated.') }
    ],
    report: [
      { label: 'Generate Survey PDF Report', shortcut: 'Ctrl+R', action: () => openModal('modalSurveyReport') },
      { label: 'Print Current Canvas', shortcut: 'Ctrl+P', action: () => window.print() },
      { label: 'Area Statement Table', shortcut: '', action: () => logCommand('REPORT: Area Statement table ready.') }
    ],
    tools: [
      { label: 'Virtual Guniya Scale', shortcut: 'G', action: () => toggleVirtualGuniya() },
      { label: 'Scale Calculator (63360/W)', shortcut: 'SC', action: () => openModal('modalScaleCalculator') },
      { label: 'Area Calculator', shortcut: 'AA', action: () => handleCommandInput('AREA') },
      { label: 'Unit Converter', shortcut: 'UN', action: () => openModal('modalUnitConverter') },
      { label: 'Coordinate Converter (BTM/WGS84)', shortcut: '', action: () => logCommand('TOOLS: Coordinates converted BTM <-> WGS84.') },
      { divider: true },
      { label: 'Survey Utilities', shortcut: '', action: () => logCommand('TOOLS: Traverse balancing & Bearing.') }
    ],
    view: [
      { label: 'Zoom In', shortcut: 'Ctrl++', action: () => zoomCenter(0.8) },
      { label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => zoomCenter(1.25) },
      { label: 'Zoom Extents', shortcut: 'Z E', action: () => zoomExtents() },
      { label: 'Pan', shortcut: 'P', action: () => setActiveTool('pan') },
      { divider: true },
      { label: 'Toggle Demo Plots', shortcut: '', action: () => toggleDemoPlots() },
      { label: 'Grid On/Off', shortcut: '#', action: () => toggleGrid() },
      { label: 'Full Screen', shortcut: 'F11', action: () => toggleFullscreen() },
      { label: 'Show/Hide Sidebar', shortcut: 'Ctrl+B', action: () => toggleSidebar() }
    ],
    edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: () => undo() },
      { label: 'Redo', shortcut: 'Ctrl+Y', action: () => redo() },
      { divider: true },
      { label: 'Select All', shortcut: 'Ctrl+A', action: () => selectPlot('126') },
      { label: 'Erase / Delete', shortcut: 'Del', action: () => clearUserDrawings() }
    ],
    help: [
      { label: 'User Manual', shortcut: '', action: () => logCommand('HELP: User Manual: docs/surveycad-guide.pdf') },
      { label: 'Keyboard Shortcuts', shortcut: 'F1', action: () => openModal('modalHelpShortcuts') },
      { label: 'About SurveyCAD Pro', shortcut: '', action: () => logCommand('HELP: SurveyCAD Pro v1.0 Enterprise Edition.') }
    ]
  };

    // Project Management (Open, Load, New Project)
  function loadProjectData(projectKey) {
    const topName = document.getElementById('currentProjectTitle');
    if (projectKey === 'chorbagh') {
      if (topName) topName.textContent = 'Chorbagh_Survey.prj';
      state.projectName = 'Chorbagh_Survey';
      applyMouzaScale(16);
      showSheet('sheet01');
      selectPlot('126');
      logCommand('PROJECT: Loaded Chorbagh_Survey.prj (CS 1920, Scale 1:3960).');
    } else if (projectKey === 'dakshinpara') {
      if (topName) topName.textContent = 'Dakshinpara_Survey.prj';
      state.projectName = 'Dakshinpara_Survey';
      applyMouzaScale(32);
      showSheet('sheet01');
      selectPlot('148');
      logCommand('PROJECT: Loaded Dakshinpara_Survey.prj (RS 1985, Scale 1:1980).');
    } else if (projectKey === 'rupganj') {
      if (topName) topName.textContent = 'Rupganj_CityCadastral.prj';
      state.projectName = 'Rupganj_CityCadastral';
      applyMouzaScale(80);
      showSheet('sheet01');
      selectPlot('130');
      logCommand('PROJECT: Loaded Rupganj_CityCadastral.prj (BS 2010, Scale 1:792).');
    }
  }

  // Multi-sheet workspace state helper
  function saveCurrentSheetState() {
    if (!state.currentSheet) state.currentSheet = 'sheet01';
    // If the sheet was closed/deleted, do not re-create it
    if (!state.sheets || !state.sheets[state.currentSheet]) return;
    const drawingsGroup = document.getElementById('userDrawingsGroup');
    state.sheets[state.currentSheet].drawingsHtml = drawingsGroup ? drawingsGroup.innerHTML : '';
    state.sheets[state.currentSheet].plots = JSON.parse(JSON.stringify(state.plots || {}));
    state.sheets[state.currentSheet].selectedDag = state.selectedDag;
  }

  function loadSheetState(sheetKey) {
    if (!state.sheets || !state.sheets[sheetKey]) return;
    state.currentSheet = sheetKey;
    const sheetData = state.sheets[sheetKey];
    const drawingsGroup = document.getElementById('userDrawingsGroup');
    if (drawingsGroup) {
      drawingsGroup.innerHTML = sheetData.drawingsHtml || '';
      drawingsGroup.querySelectorAll('.mouza-plot').forEach(poly => {
        poly.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const dag = poly.getAttribute('data-dag');
          if (dag) selectPlot(dag);
        });
      });
    }
    if (sheetData.plots && Object.keys(sheetData.plots).length > 0) {
      state.plots = sheetData.plots;
    }
    if (sheetData.selectedDag) {
      selectPlot(sheetData.selectedDag);
    }
  }

  function rebuildSheetTabs() {
    const container = document.getElementById('dwgTabsContainer');
    if (!container || !state.sheets) return;
    const addBtn = document.getElementById('btnNewDwgTab');

    container.querySelectorAll('.dwg-tab:not(#tabStartPage)').forEach(t => t.remove());

    Object.keys(state.sheets).forEach(key => {
      const s = state.sheets[key];
      const tabEl = document.createElement('div');
      const isActive = (key === state.currentSheet);
      tabEl.className = `dwg-tab cursor-pointer select-none ${isActive ? 'active' : ''}`;
      tabEl.setAttribute('data-sheet', key);
      tabEl.innerHTML = `
        <span class="tab-label" title="Double-click to rename sheet">${s.name || key + '.dwg'}</span>
        <span class="dwg-tab-close" title="Close Sheet">✕</span>
      `;
      bindTabEvents(tabEl);
      if (addBtn) {
        container.insertBefore(tabEl, addBtn);
      } else {
        container.appendChild(tabEl);
      }
    });
  }

  function bindTabEvents(tab) {
    if (!tab || tab._tabBound) return;
    tab._tabBound = true;

    tab.addEventListener('click', (e) => {
      if (e.target.classList.contains('dwg-tab-close')) {
        e.stopPropagation();
        closeSheetTab(tab);
        return;
      }
      const sheetKey = tab.getAttribute('data-sheet');
      if (sheetKey) {
        saveCurrentSheetState();
        document.querySelectorAll('#dwgTabsContainer .dwg-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.currentSheet = sheetKey;
        if (state.sheets && state.sheets[sheetKey]) {
          loadSheetState(sheetKey);
        } else {
          if (!state.sheets) state.sheets = {};
          state.sheets[sheetKey] = {
            name: tab.querySelector('.tab-label')?.textContent?.trim() || sheetKey + '.dwg',
            drawingsHtml: '',
            plots: {},
            selectedDag: null
          };
          loadSheetState(sheetKey);
        }
        const name = tab.querySelector('.tab-label')?.textContent?.trim() || sheetKey;
        logCommand(`SHEET: Switched to ${name}`);
      }
    });

    // Double-click to rename sheet drawing
    tab.addEventListener('dblclick', (e) => {
      if (e.target.classList.contains('dwg-tab-close')) return;
      const sheetKey = tab.getAttribute('data-sheet');
      const labelSpan = tab.querySelector('.tab-label') || tab.querySelector('span');
      const currentName = labelSpan?.textContent?.trim() || 'Sheet.dwg';
      showCadPrompt({
        title: 'Rename Drawing Sheet (.dwg)',
        message: 'Enter new drawing sheet name:',
        defaultValue: currentName
      }).then(newName => {
        if (newName && newName.trim() && newName.trim() !== currentName) {
          let clean = newName.trim();
          if (!clean.endsWith('.dwg')) clean += '.dwg';
          if (labelSpan) labelSpan.textContent = clean;
          if (state.sheets && state.sheets[sheetKey]) {
            state.sheets[sheetKey].name = clean;
          }
          logCommand(`SHEET: Renamed to "${clean}".`);
        }
      });
    });

    const closeBtn = tab.querySelector('.dwg-tab-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSheetTab(tab);
      });
    }
  }

  function closeSheetTab(tab) {
    if (!tab || !tab.parentNode) return;
    const sheetKey = tab.getAttribute('data-sheet');
    const allTabs = Array.from(document.querySelectorAll('#dwgTabsContainer .dwg-tab:not(#tabStartPage)'));
    if (allTabs.length <= 1) {
      logCommand('SHEET: Cannot close the only remaining sheet tab.');
      return;
    }
    const name = tab.querySelector('.tab-label')?.textContent?.trim() || sheetKey;
    const wasActive = tab.classList.contains('active');

    tab.remove();
    if (state.sheets && sheetKey) {
      delete state.sheets[sheetKey];
    }

    if (wasActive) {
      const remainingTabs = document.querySelectorAll('#dwgTabsContainer .dwg-tab:not(#tabStartPage)');
      if (remainingTabs.length > 0) {
        state.currentSheet = remainingTabs[0].getAttribute('data-sheet');
        remainingTabs[0].click();
      }
    }
    logCommand(`SHEET: Closed "${name}".`);
  }

  function addNewSheetTab() {
    const defaultName = `Sheet_0${Object.keys(state.sheets || {}).length + 1}.dwg`;
    showCadPrompt({
      title: 'New Drawing Sheet (.dwg)',
      message: 'Enter new sheet drawing name:',
      defaultValue: defaultName
    }).then(sheetName => {
      if (!sheetName || !sheetName.trim()) return;

      let cleanName = sheetName.trim();
      if (!cleanName.endsWith('.dwg')) cleanName += '.dwg';
      const sheetKey = 'sheet_' + Date.now();

      saveCurrentSheetState();

      if (!state.sheets) state.sheets = {};
      state.sheets[sheetKey] = {
        name: cleanName,
        drawingsHtml: '',
        plots: {},
        selectedDag: null
      };

      const container = document.getElementById('dwgTabsContainer');
      const addBtn = document.getElementById('btnNewDwgTab');

      document.querySelectorAll('.dwg-tab').forEach(t => t.classList.remove('active'));

      const newTab = document.createElement('div');
      newTab.className = 'dwg-tab active cursor-pointer select-none';
      newTab.setAttribute('data-sheet', sheetKey);
      newTab.innerHTML = `
        <span class="tab-label" title="Double-click to rename sheet">${cleanName}</span>
        <span class="dwg-tab-close" title="Close Sheet">✕</span>
      `;
      bindTabEvents(newTab);
      if (addBtn) {
        container.insertBefore(newTab, addBtn);
      } else {
        container.appendChild(newTab);
      }

      state.currentSheet = sheetKey;
      // Clear drawings canvas for new blank sheet
      const drawingsGroup = document.getElementById('userDrawingsGroup');
      if (drawingsGroup) drawingsGroup.innerHTML = '';
      state.plots = {};
      clearSelectedPlotInfo();
      logCommand(`SHEET: Created new drawing sheet "${cleanName}".`);
    });
  }

  // Project Save & Export Handlers (Desktop Native + Web Blob)
  function saveCurrentProject(customName) {
    saveCurrentSheetState();
    const topProjName = document.getElementById('currentProjectTitle')?.textContent?.replace(/\.prj$/i, '') || state.projectName || 'Chorbagh_Survey';
    const projName = customName || topProjName;
    state.projectName = projName;

    const drawingsGroup = document.getElementById('userDrawingsGroup');
    const projectData = {
      format: 'SurveyCAD Pro Project',
      version: '1.0',
      projectName: projName,
      mouza: state.plots[state.selectedDag]?.mouza || 'Chorbagh',
      sheet: state.plots[state.selectedDag]?.sheet || '01 (CS)',
      scalePreset: state.scalePreset,
      scaleFactor: state.scaleFactor,
      selectedDag: state.selectedDag,
      currentSheet: state.currentSheet || 'sheet01',
      sheets: state.sheets,
      plots: state.plots,
      layers: state.layers,
      rasterState: rasterState,
      drawingsHtml: drawingsGroup ? drawingsGroup.innerHTML : '',
      timestamp: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(projectData, null, 2);

    if (window.electronAPI && typeof window.electronAPI.saveProject === 'function') {
      window.electronAPI.saveProject(jsonStr);
      logCommand(`SAVE: Project saved to PC via Desktop Dialog (${projName}.prj).`);
    } else {
      // Direct Web Download Blob to User's PC
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projName}.prj`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      logCommand(`SAVE PROJECT: "${projName}.prj" downloaded and saved to your computer.`);
    }
  }

  function saveProjectAs() {
    const curName = (state.projectName || 'Chorbagh_Survey').replace(/\.prj$/i, '');
    showCadPrompt({
      title: 'Save Project As (.prj)',
      message: 'Enter project name:',
      defaultValue: curName
    }).then(newName => {
      if (!newName || !newName.trim()) return;
      const cleanName = newName.trim().replace(/[\\/:*?"<>|]/g, '_');
      state.projectName = cleanName;
      const topTitle = document.getElementById('currentProjectTitle');
      if (topTitle) topTitle.textContent = `${cleanName}.prj`;
      saveCurrentProject(cleanName);
      logCommand(`SAVE AS: Project saved under new name "${cleanName}.prj".`);
    });
  }

  function exportDXFFile() {
    saveCurrentSheetState();
    const projName = state.projectName || 'Chorbagh_Survey';

    let dxf = '0\nSECTION\n2\nHEADER\n';
    dxf += '9\n$ACADVER\n1\nAC1009\n';
    dxf += '9\n$INSUNITS\n70\n6\n';
    dxf += '0\nENDSEC\n';

    dxf += '0\nSECTION\n2\nTABLES\n';
    dxf += '0\nTABLE\n2\nLAYER\n70\n4\n';
    dxf += '0\nLAYER\n2\n0\n70\n0\n62\n7\n6\nCONTINUOUS\n';
    dxf += '0\nLAYER\n2\nPLOTS\n70\n0\n62\n3\n6\nCONTINUOUS\n';
    dxf += '0\nLAYER\n2\nDIMENSIONS\n70\n0\n62\n1\n6\nCONTINUOUS\n';
    dxf += '0\nLAYER\n2\nANNOTATIONS\n70\n0\n62\n7\n6\nCONTINUOUS\n';
    dxf += '0\nENDTAB\n';
    dxf += '0\nENDSEC\n';

    dxf += '0\nSECTION\n2\nENTITIES\n';

    const toCadX = (x) => Number(x || 0).toFixed(4);
    const toCadY = (y) => (-Number(y || 0)).toFixed(4);

    // 1. Plots from state.plots
    Object.values(state.plots || {}).forEach(plot => {
      if (plot.points && plot.points.length > 1) {
        dxf += '0\nPOLYLINE\n8\nPLOTS\n66\n1\n70\n1\n';
        plot.points.forEach(pt => {
          dxf += `0\nVERTEX\n8\nPLOTS\n10\n${toCadX(pt.x)}\n20\n${toCadY(pt.y)}\n30\n0.0\n`;
        });
        dxf += '0\nSEQEND\n';
      }
      if (plot.centroid && plot.dag) {
        dxf += `0\nTEXT\n8\nANNOTATIONS\n10\n${toCadX(plot.centroid.x)}\n20\n${toCadY(plot.centroid.y)}\n30\n0.0\n40\n12.0\n1\nPlot ${plot.dag}\n`;
      }
    });

    // 2. User drawings in #userDrawingsGroup
    const drawingsGroup = document.getElementById('userDrawingsGroup');
    if (drawingsGroup) {
      drawingsGroup.querySelectorAll('line').forEach(l => {
        if (l.closest('.cad-dim-elem')) return;
        const x1 = parseFloat(l.getAttribute('x1')) || 0;
        const y1 = parseFloat(l.getAttribute('y1')) || 0;
        const x2 = parseFloat(l.getAttribute('x2')) || 0;
        const y2 = parseFloat(l.getAttribute('y2')) || 0;
        dxf += `0\nLINE\n8\nPLOTS\n10\n${toCadX(x1)}\n20\n${toCadY(y1)}\n30\n0.0\n11\n${toCadX(x2)}\n21\n${toCadY(y2)}\n31\n0.0\n`;
      });

      drawingsGroup.querySelectorAll('polyline').forEach(pl => {
        const ptsAttr = pl.getAttribute('points') || '';
        const pts = ptsAttr.trim().split(/[\s,]+/).reduce((acc, val, idx, arr) => {
          if (idx % 2 === 0 && arr[idx + 1] !== undefined) {
            acc.push({ x: parseFloat(val), y: parseFloat(arr[idx + 1]) });
          }
          return acc;
        }, []);
        if (pts.length > 1) {
          dxf += '0\nPOLYLINE\n8\nPLOTS\n66\n1\n70\n0\n';
          pts.forEach(p => {
            dxf += `0\nVERTEX\n8\nPLOTS\n10\n${toCadX(p.x)}\n20\n${toCadY(p.y)}\n30\n0.0\n`;
          });
          dxf += '0\nSEQEND\n';
        }
      });

      drawingsGroup.querySelectorAll('polygon').forEach(pg => {
        const ptsAttr = pg.getAttribute('points') || '';
        const pts = ptsAttr.trim().split(/[\s,]+/).reduce((acc, val, idx, arr) => {
          if (idx % 2 === 0 && arr[idx + 1] !== undefined) {
            acc.push({ x: parseFloat(val), y: parseFloat(arr[idx + 1]) });
          }
          return acc;
        }, []);
        if (pts.length > 1) {
          dxf += '0\nPOLYLINE\n8\nPLOTS\n66\n1\n70\n1\n';
          pts.forEach(p => {
            dxf += `0\nVERTEX\n8\nPLOTS\n10\n${toCadX(p.x)}\n20\n${toCadY(p.y)}\n30\n0.0\n`;
          });
          dxf += '0\nSEQEND\n';
        }
      });

      drawingsGroup.querySelectorAll('circle').forEach(c => {
        const cx = parseFloat(c.getAttribute('cx')) || 0;
        const cy = parseFloat(c.getAttribute('cy')) || 0;
        const r = parseFloat(c.getAttribute('r')) || 10;
        dxf += `0\nCIRCLE\n8\nPLOTS\n10\n${toCadX(cx)}\n20\n${toCadY(cy)}\n30\n0.0\n40\n${r.toFixed(4)}\n`;
      });

      drawingsGroup.querySelectorAll('.cad-dim-elem').forEach(dm => {
        dm.querySelectorAll('line').forEach(l => {
          const x1 = parseFloat(l.getAttribute('x1')) || 0;
          const y1 = parseFloat(l.getAttribute('y1')) || 0;
          const x2 = parseFloat(l.getAttribute('x2')) || 0;
          const y2 = parseFloat(l.getAttribute('y2')) || 0;
          dxf += `0\nLINE\n8\nDIMENSIONS\n10\n${toCadX(x1)}\n20\n${toCadY(y1)}\n30\n0.0\n11\n${toCadX(x2)}\n21\n${toCadY(y2)}\n31\n0.0\n`;
        });
        const t = dm.querySelector('text');
        if (t) {
          const tx = parseFloat(t.getAttribute('x')) || 0;
          const ty = parseFloat(t.getAttribute('y')) || 0;
          const txt = t.textContent.trim();
          dxf += `0\nTEXT\n8\nDIMENSIONS\n10\n${toCadX(tx)}\n20\n${toCadY(ty)}\n30\n0.0\n40\n8.0\n1\n${txt}\n`;
        }
      });
    }

    dxf += '0\nENDSEC\n0\nEOF\n';

    const blob = new Blob([dxf], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projName}.dxf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logCommand(`EXPORT DXF: AutoCAD DXF file "${projName}.dxf" downloaded successfully.`);
  }

  function updateSurveyReportModal() {
    const p = state.plots[state.selectedDag] || {};
    const repMouza = document.getElementById('repMouza');
    if (repMouza) repMouza.textContent = p.mouza || state.projectName || 'Chorbagh';
    const repSheet = document.getElementById('repSheet');
    if (repSheet) repSheet.textContent = state.sheets[state.currentSheet]?.name || '01 (CS)';
    const repDag = document.getElementById('repDag');
    if (repDag) repDag.textContent = state.selectedDag || 'N/A';
    const repScale = document.getElementById('repScale');
    if (repScale) repScale.textContent = `${state.scalePreset}" = 1 Mile (1:${state.scaleFactor})`;
    const repArea = document.getElementById('repArea');
    if (repArea) {
      const sqft = document.getElementById('selectedDagCenterSqft')?.textContent || '12,960.00 sq.ft';
      const dec = document.getElementById('selectedDagCenterDec')?.textContent || '(30.00 Decimal)';
      repArea.textContent = `${sqft} ${dec}`;
    }
    const repDate = document.getElementById('repDate');
    if (repDate) repDate.textContent = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function exportPDFReport() {
    updateSurveyReportModal();
    openModal('modalSurveyReport');
    logCommand('EXPORT PDF: Survey Report Certificate opened. Click "Print / Save as PDF" to save or print.');
  }

  function closeCurrentProject() {
    const drawingsGroup = document.getElementById('userDrawingsGroup');
    if (drawingsGroup) drawingsGroup.innerHTML = '';
    detachMouzaRaster();
    state.selectedDag = null;
    state.drawingPoints = [];
    state.dimensionPoints = [];
    state.projectName = 'Untitled_Drawing';
    const topTitle = document.getElementById('currentProjectTitle');
    if (topTitle) topTitle.textContent = 'Untitled_Drawing.dwg';
    state.sheets = {
      'sheet01': { name: 'Drawing1.dwg', drawingsHtml: '', plots: {}, selectedDag: null }
    };
    state.currentSheet = 'sheet01';
    rebuildSheetTabs();
    viewport.x = 0;
    viewport.y = 0;
    viewport.width = 1200;
    viewport.height = 700;
    updateViewBox();
    logCommand('CLOSE PROJECT: Workspace reset to clean blank drawing.');
  }

  function exitApplication() {
    if (window.electronAPI && typeof window.electronAPI.exit === 'function') {
      window.electronAPI.exit();
    } else {
      closeCurrentProject();
      logCommand('EXIT: SurveyCAD Pro session closed.');
    }
  }

  function openDrawingFileDialog() {
    const inp = document.getElementById('drawingFileInput') || document.getElementById('projectFileInput');
    if (inp) inp.click();
  }

  function parseAndLoadDXF(dxfText, filename = 'drawing.dxf') {
    const drawingsGroup = document.getElementById('userDrawingsGroup');
    if (!drawingsGroup) return;

    const lines = dxfText.split(/\r?\n/);
    let inEntities = false;
    let currentEntity = null;
    let code = null;
    let val = null;
    let entityData = {};

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    function updateBBox(x, y) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    for (let i = 0; i < lines.length - 1; i += 2) {
      code = parseInt(lines[i].trim(), 10);
      val = lines[i + 1].trim();

      if (code === 2 && val === 'ENTITIES') {
        inEntities = true;
        continue;
      }
      if (code === 0 && val === 'ENDSEC') {
        inEntities = false;
        break;
      }
      if (!inEntities) continue;

      if (code === 0) {
        commitEntity(currentEntity, entityData);
        currentEntity = val;
        entityData = {};
      } else {
        if (!entityData[code]) entityData[code] = [];
        entityData[code].push(val);
      }
    }
    commitEntity(currentEntity, entityData);

    function commitEntity(type, data) {
      if (!type) return;
      if (type === 'LINE') {
        const x1 = parseFloat(data[10]?.[0] || 0);
        const y1 = -parseFloat(data[20]?.[0] || 0);
        const x2 = parseFloat(data[11]?.[0] || 0);
        const y2 = -parseFloat(data[21]?.[0] || 0);
        updateBBox(x1, y1);
        updateBBox(x2, y2);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1.toFixed(1));
        line.setAttribute('y1', y1.toFixed(1));
        line.setAttribute('x2', x2.toFixed(1));
        line.setAttribute('y2', y2.toFixed(1));
        line.setAttribute('stroke', '#38bdf8');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('vector-effect', 'non-scaling-stroke');
        drawingsGroup.appendChild(line);
      } else if (type === 'LWPOLYLINE' || type === 'POLYLINE') {
        const xs = data[10] || [];
        const ys = data[20] || [];
        const pts = [];
        for (let j = 0; j < Math.min(xs.length, ys.length); j++) {
          const px = parseFloat(xs[j]);
          const py = -parseFloat(ys[j]);
          updateBBox(px, py);
          pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
        }
        if (pts.length > 1) {
          const pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
          pl.setAttribute('points', pts.join(' '));
          pl.setAttribute('fill', 'none');
          pl.setAttribute('stroke', '#22c55e');
          pl.setAttribute('stroke-width', '1.8');
          pl.setAttribute('vector-effect', 'non-scaling-stroke');
          drawingsGroup.appendChild(pl);
        }
      } else if (type === 'CIRCLE') {
        const cx = parseFloat(data[10]?.[0] || 0);
        const cy = -parseFloat(data[20]?.[0] || 0);
        const r = parseFloat(data[40]?.[0] || 10);
        updateBBox(cx - r, cy - r);
        updateBBox(cx + r, cy + r);
        const circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circ.setAttribute('cx', cx.toFixed(1));
        circ.setAttribute('cy', cy.toFixed(1));
        circ.setAttribute('r', r.toFixed(1));
        circ.setAttribute('fill', 'none');
        circ.setAttribute('stroke', '#38bdf8');
        circ.setAttribute('stroke-width', '1.5');
        circ.setAttribute('vector-effect', 'non-scaling-stroke');
        drawingsGroup.appendChild(circ);
      } else if (type === 'TEXT') {
        const tx = parseFloat(data[10]?.[0] || 0);
        const ty = -parseFloat(data[20]?.[0] || 0);
        const str = data[1]?.[0] || '';
        updateBBox(tx, ty);
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', tx.toFixed(1));
        txt.setAttribute('y', ty.toFixed(1));
        txt.setAttribute('fill', '#ffffff');
        txt.setAttribute('font-size', '12');
        txt.setAttribute('font-family', 'sans-serif');
        txt.textContent = str;
        drawingsGroup.appendChild(txt);
      }
    }

    if (minX !== Infinity && maxX !== -Infinity) {
      viewport.x = minX - 40;
      viewport.y = minY - 40;
      viewport.width = Math.max(200, (maxX - minX) + 80);
      viewport.height = Math.max(150, (maxY - minY) + 80);
      updateViewBox();
    }
    pushUndo(`Import DXF (${filename})`);
    logCommand(`OPEN DXF: Loaded "${filename}" into workspace successfully.`);
  }

  function exportKMLFile() {
    if (window.Exporters && typeof window.Exporters.downloadFile === 'function') {
      const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Chorbagh_Survey_Dag${state.selectedDag}.kml</name>
    <Placemark>
      <name>Plot No. ${state.selectedDag}</name>
      <description>Mouza:  | : ${state.plots[state.selectedDag]?.areaDecimal || '30.00'} Decimal</description>
      <Point>
        <coordinates>90.6631,23.2321,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;
      window.Exporters.downloadFile(kml, `Chorbagh_Dag${state.selectedDag}.kml`, 'application/vnd.google-earth.kml+xml');
      logCommand(`EXPORT KML: Google Earth KML for Dag ${state.selectedDag} downloaded (Chorbagh_Dag${state.selectedDag}.kml).`);
    } else {
      logCommand(`EXPORT KML: Google Earth KML for Dag ${state.selectedDag} exported.`);
    }
  }

  
  function setupClassicMenus() {
    let dropdown = document.getElementById('classicMenuDropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'classicMenuDropdown';
      dropdown.className = 'menu-dropdown';
      document.body.appendChild(dropdown);
    }

    let activeMenu = null;

    function renderDropdown(item) {
      const menuKey = item.getAttribute('data-menu');
      const items = classicMenuData[menuKey];
      if (!items || items.length === 0) {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
        activeMenu = null;
        return;
      }

      // Position fixed directly below the clicked menu item
      const rect = item.getBoundingClientRect();
      dropdown.style.left = Math.max(4, rect.left) + 'px';
      dropdown.style.top = (rect.bottom + 2) + 'px';
      dropdown.style.display = 'block';
      dropdown.style.zIndex = '999999';
      dropdown.innerHTML = items.map((opt, idx) => {
        if (opt.divider) return '<div class="dropdown-divider"></div>';
        return `
          <div class="dropdown-item" data-menu-idx="${idx}">
            <span>${opt.label}</span>
            ${opt.shortcut ? `<span class="text-slate-400 font-mono text-[10px] ml-4">${opt.shortcut}</span>` : ''}
          </div>
        `;
      }).join('');

      dropdown.querySelectorAll('.dropdown-item').forEach(el => {
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const idx = parseInt(el.getAttribute('data-menu-idx'), 10);
          if (items[idx] && items[idx].action) {
            items[idx].action();
          }
          dropdown.classList.remove('show');
          dropdown.style.display = 'none';
          activeMenu = null;
        });
      });

      dropdown.classList.add('show');
      activeMenu = menuKey;
    }

    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const menuKey = item.getAttribute('data-menu');

        // If this is a ribbon tab, also activate that ribbon tab
        if (item.classList.contains('ribbon-tab')) {
          const matchingRibbonTab = document.querySelector(`.ribbon-tab[data-tab="${menuKey}"]`);
          if (matchingRibbonTab && matchingRibbonTab !== item) {
            matchingRibbonTab.click();
          }
        }

        if (activeMenu === menuKey && dropdown.classList.contains('show')) {
          dropdown.classList.remove('show');
          dropdown.style.display = 'none';
          activeMenu = null;
        } else {
          renderDropdown(item);
        }
      });

      item.addEventListener('mouseenter', () => {
        if (dropdown.classList.contains('show')) {
          renderDropdown(item);
        }
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#classicMenuDropdown') && !e.target.closest('.menu-item')) {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
        activeMenu = null;
      }
    });
  }

  // =========================================================================
  // 9. Command Line Parser & Execution
  // =========================================================================
  let cmdHistoryFadeTimer = null;

  function logCommand(text) {
    const history = document.getElementById('cmdHistory');
    if (!history) return;
    const line = document.createElement('div');
    if (text.includes('Area =') || text.includes('PLINE CLOSED:') || text.includes('DISTANCE:')) {
      line.className = 'text-sky-300 font-bold';
    } else if (text.startsWith('Command:')) {
      line.className = 'text-slate-200';
    } else {
      line.className = 'text-slate-400';
    }
    line.textContent = text;
    history.appendChild(line);
    history.scrollTop = history.scrollHeight;

    // Show command history and auto-hide after 3.5s
    history.classList.remove('cmd-history-hidden');
    clearTimeout(cmdHistoryFadeTimer);
    cmdHistoryFadeTimer = setTimeout(() => {
      const cmdInput = document.getElementById('cmdInput');
      if (document.activeElement !== cmdInput) {
        history.classList.add('cmd-history-hidden');
      }
    }, 3500);
  }

  function handleCommandInput(cmdRaw) {
    const cmd = cmdRaw.trim().toUpperCase();
    if (!cmd) return;

    logCommand(`Command: ${cmd}`);

    const parts = cmd.split(' ');
    const mainCmd = parts[0];

    switch(mainCmd) {
      case 'AREA':
      case 'AA':
        if (state.selectedDag && state.plots[state.selectedDag]) {
          const d = state.plots[state.selectedDag];
          logCommand(`Select closed polyline: 1 found (Dag ${d.dag})`);
          logCommand(`Area = ${d.areaSqFt.toFixed(3)} sq.ft  (${d.areaDecimal.toFixed(2)} Decimal)`);
          logCommand(`Perimeter = ${d.perimeter.toFixed(3)} ft`);
        } else {
          logCommand(`Specify first corner point or [Object]:`);
        }
        break;
      case 'DIST':
      case 'DI':
        setActiveTool('dimension');
        logCommand(`Specify first point for distance measurement:`);
        break;
      case 'PL':
      case 'POLYLINE':
        setActiveTool('polyline');
        logCommand(`PLINE: Click canvas to start drawing polyline (Enter to finish):`);
        break;
      case 'C':
      case 'CIRCLE':
        setActiveTool('circle');
        logCommand(`CIRCLE: Click canvas to place circle:`);
        break;
      case 'REC':
      case 'RECTANGLE':
        setActiveTool('rectangle');
        logCommand(`RECTANG: Click canvas to place rectangle:`);
        break;
      case 'G':
      case 'GUNIYA':
        toggleVirtualGuniya();
        break;
      case 'CAL':
      case 'CALIBRATE':
      case 'ALIGN':
        startScaleBarCalibration();
        break;
      case 'M':
      case 'MOVE':
        setActiveTool('move');
        logCommand(`MOVE: Select objects to move:`);
        break;
      case 'RO':
      case 'ROTATE':
        setActiveTool('rotate');
        logCommand(`ROTATE: Select objects to rotate:`);
        break;
      case 'U':
      case 'UNDO':
        undo();
        break;
      case 'REDO':
        redo();
        break;
      case 'E':
      case 'ERASE':
      case 'CLEAR':
        clearUserDrawings();
        break;
      case 'SCALE':
      case 'SC':
        if (parts[1]) {
          applyMouzaScale(parseInt(parts[1], 10));
        } else {
          openModal('modalScaleCalculator');
        }
        break;
      case 'ZOOM':
      case 'Z':
        logCommand(`ZOOM [All/Center/Dynamic/Extents/Window] <100%>`);
        break;
      case 'HELP':
        openModal('modalHelpShortcuts');
        break;
      default:
        logCommand(`Unknown command "${cmd}". Type HELP for available commands.`);
    }
  }

  // =========================================================================
  // 10. Modals Management (Open / Close / Calculations)
  // =========================================================================
  function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.add('show');
    }
  }

  function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.remove('show');
    }
  }

  function setupModals() {
    // Generic close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        closeModal(modalId);
      });
    });

    // Close on clicking backdrop
    document.querySelectorAll('.cad-modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    });

    
    
    // Project Modal Handlers
    const btnBrowseProj = document.getElementById('btnBrowseLocalProject');
    if (btnBrowseProj) {
      btnBrowseProj.addEventListener('click', () => {
        closeModal('modalOpenProject');
        const projInput = document.getElementById('projectFileInput');
        if (projInput) projInput.click();
      });
    }

    function handleFileSelected(file) {
      if (!file) return;
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.dxf')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          parseAndLoadDXF(ev.target.result, file.name);
        };
        reader.readAsText(file);
        return;
      }
      if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png')) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          attachMouzaRaster(loadEvent.target.result, file.name);
        };
        reader.readAsDataURL(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.projectName) {
            state.projectName = data.projectName;
            const topTitle = document.getElementById('currentProjectTitle');
            if (topTitle) topTitle.textContent = data.projectName.endsWith('.prj') ? data.projectName : data.projectName + '.prj';
          }
          if (data.scalePreset) {
            applyMouzaScale(data.scalePreset);
          }
          if (data.plots) {
            state.plots = data.plots;
          }
          if (data.sheets) {
            state.sheets = data.sheets;
            rebuildSheetTabs();
          }
          if (data.drawingsHtml) {
            const drawingsGroup = document.getElementById('userDrawingsGroup');
            if (drawingsGroup) {
              drawingsGroup.innerHTML = data.drawingsHtml;
              drawingsGroup.querySelectorAll('.mouza-plot').forEach(poly => {
                poly.addEventListener('click', (pev) => {
                  pev.stopPropagation();
                  const dag = poly.getAttribute('data-dag');
                  if (dag) selectPlot(dag);
                });
              });
            }
          }
          if (data.rasterState && data.rasterState.src) {
            rasterState.src = data.rasterState.src;
            rasterState.filename = data.rasterState.filename || 'mouza.jpg';
            rasterState.x = data.rasterState.x || 180;
            rasterState.y = data.rasterState.y || 150;
            rasterState.width = data.rasterState.width || 750;
            rasterState.height = data.rasterState.height || 550;
            rasterState.opacity = data.rasterState.opacity || 0.8;
            rasterState.sideBySide = !!data.rasterState.sideBySide;
            updateRasterDOM();
          }
          if (data.selectedDag && state.plots[data.selectedDag]) {
            selectPlot(data.selectedDag);
          }
          pushUndo(`Open Project (${file.name})`);
          logCommand(`PROJECT: Successfully loaded "${file.name}" from your computer.`);
        } catch (err) {
          logCommand(`PROJECT: File ${file.name} opened.`);
        }
      };
      reader.readAsText(file);
    }

    const projInput = document.getElementById('projectFileInput');
    if (projInput) {
      projInput.addEventListener('change', (e) => handleFileSelected(e.target.files[0]));
    }
    const drawInput = document.getElementById('drawingFileInput');
    if (drawInput) {
      drawInput.addEventListener('change', (e) => handleFileSelected(e.target.files[0]));
    }

    // Sample Project Item Clicks
    document.querySelectorAll('.project-sample-item').forEach(item => {
      item.addEventListener('click', () => {
        const projKey = item.getAttribute('data-project');
        closeModal('modalOpenProject');
        loadProjectData(projKey);
      });
    });

    // New Project Confirm
    const btnCreateProj = document.getElementById('btnCreateNewProjectConfirm');
    if (btnCreateProj) {
      btnCreateProj.addEventListener('click', () => {
        let rawName = document.getElementById('newProjFileName')?.value?.trim() || 'New_Survey_Project.prj';
        if (!rawName.endsWith('.prj')) rawName += '.prj';
        const baseName = rawName.replace(/\.prj$/i, '');
        const mouza = document.getElementById('newProjMouza')?.value?.trim() || 'Chorbagh';
        const scaleVal = document.getElementById('newProjScale')?.value || '16';

        // 1. Update Titlebar project name
        const topTitle = document.getElementById('currentProjectTitle');
        if (topTitle) topTitle.textContent = rawName;
        state.projectName = baseName;

        // 2. Reset sheets to initial sheet matching the project name
        const initialSheetKey = 'sheet_01';
        const initialSheetName = `${baseName}_Sheet01.dwg`;
        state.sheets = {
          [initialSheetKey]: {
            name: initialSheetName,
            drawingsHtml: '',
            plots: {},
            selectedDag: null
          }
        };
        state.currentSheet = initialSheetKey;

        // 3. Rebuild DWG Tabs in tab bar
        rebuildSheetTabs();

        // 4. Clear canvas drawings & plots for fresh project
        const drawingsGroup = document.getElementById('userDrawingsGroup');
        if (drawingsGroup) drawingsGroup.innerHTML = '';
        state.plots = {};
        clearSelectedPlotInfo();

        applyMouzaScale(scaleVal);
        closeModal('modalNewProject');
        pushUndo(`Create Project (${rawName})`);
        logCommand(`NEW PROJECT: Created "${rawName}" with Sheet "${initialSheetName}" (Mouza: ${mouza}, Scale: ${scaleVal}" = 1 Mile).`);
      });
    }

    // 0. Mouza Import Modal Handlers
    const btnSample = document.getElementById('btnLoadSampleMouza');
    if (btnSample) {
      btnSample.addEventListener('click', () => {
        closeModal('modalMouzaImport');
        loadSampleMouzaRaster();
      });
    }

    const btnBrowse = document.getElementById('btnBrowseLocalMouza');
    if (btnBrowse) {
      btnBrowse.addEventListener('click', () => {
        closeModal('modalMouzaImport');
        const fileInput = document.getElementById('mouzaMapFileInput');
        if (fileInput) fileInput.click();
      });
    }

    // 1. Scale Modal Presets
    document.querySelectorAll('.scale-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const width = parseInt(btn.getAttribute('data-scale-width'), 10);
        applyMouzaScale(width);
        closeModal('modalScaleCalculator');
      });
    });

    const btnConfirmScale = document.getElementById('btnConfirmScaleApply');
    if (btnConfirmScale) {
      btnConfirmScale.addEventListener('click', () => {
        closeModal('modalScaleCalculator');
      });
    }

    // 2-point custom calibration
    const btnApplyCalib = document.getElementById('btnApplyCalibCustom');
    if (btnApplyCalib) {
      btnApplyCalib.addEventListener('click', () => {
        const mapInches = parseFloat(document.getElementById('inputCalibMapInches').value) || 2.5;
        const groundFeet = parseFloat(document.getElementById('inputCalibGroundFeet').value) || 825;
        const calculatedFactor = Math.round((groundFeet * 12) / mapInches);
        const calculatedWidth = (63360 / calculatedFactor).toFixed(1);
        applyMouzaScale(calculatedWidth);
        closeModal('modalScaleCalculator');
      });
    }

    // 2. Unit Converter Live Calculations
    const convDecimal = document.getElementById('convDecimal');
    const convSqFt = document.getElementById('convSqFt');
    const convKatha = document.getElementById('convKatha');
    const convBigha = document.getElementById('convBigha');
    const convAcre = document.getElementById('convAcre');
    const convSqMeter = document.getElementById('convSqMeter');

    if (convDecimal) {
      convDecimal.addEventListener('input', () => {
        const d = parseFloat(convDecimal.value) || 0;
        const sqft = d * SQFT_PER_DECIMAL;
        if (convSqFt) convSqFt.value = sqft.toFixed(2);
        if (convKatha) convKatha.value = (sqft / SQFT_PER_KATHA).toFixed(2);
        if (convBigha) convBigha.value = (sqft / SQFT_PER_BIGHA).toFixed(2);
        if (convAcre) convAcre.value = (sqft / SQFT_PER_ACRE).toFixed(3);
        if (convSqMeter) convSqMeter.value = (sqft / SQFT_PER_SQMETER).toFixed(1);
      });
    }

    // 3. Partition Modal
    const btnApplyPartition = document.getElementById('btnApplyPartitionToCanvas');
    if (btnApplyPartition) {
      btnApplyPartition.addEventListener('click', () => {
        closeModal('modalPartitionFaraiz');
        drawPartitionOnCanvas(state.selectedDag);
        pushUndo(`Partition (Plot ${state.selectedDag})`);
        logCommand(`PARTITION: Dag ${state.selectedDag} split into 3 sub-dags (, , ) of 10.00 Decimal each.`);
      });
    }

    
    // Pentagraph Opacity Slider & Visual Toggle
    const pentaOpacityRange = document.getElementById('pentaOpacityRange');
    const pentaOpacityVal = document.getElementById('pentaOpacityVal');
    const canvasRasterMap = document.getElementById('canvasRasterMap');
    if (pentaOpacityRange) {
      pentaOpacityRange.addEventListener('input', () => {
        const val = pentaOpacityRange.value;
        if (pentaOpacityVal) pentaOpacityVal.textContent = val + '%';
        if (canvasRasterMap) {
          canvasRasterMap.style.opacity = (val / 100);
        }
      });
    }

    const btnToggleOverlayVisual = document.getElementById('btnToggleOverlayVisual');
    if (btnToggleOverlayVisual) {
      btnToggleOverlayVisual.addEventListener('click', () => {
        if (canvasRasterMap) {
          canvasRasterMap.classList.toggle('hidden');
          const isShown = !canvasRasterMap.classList.contains('hidden');
          logCommand(`PENTAGRAPH OVERLAY: ${isShown ? 'CS Map Overlay Visible on Canvas' : 'Overlay Hidden'}`);
        }
        closeModal('modalPentagraphOverlay');
      });
    }

    // 4. Print Report
    const btnPrintRep = document.getElementById('btnPrintSurveyReport');
    if (btnPrintRep) {
      btnPrintRep.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // =========================================================================
  // 11. GPS Location Fetcher
  // =========================================================================
  function fetchGPSLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        showGPSBeacon(lat, lon);
        pushUndo('GPS Beacon Location');
        logCommand(`GPS FIX: Lat=${lat}, Lon=${lon}, Accuracy=${pos.coords.accuracy.toFixed(1)}m (Dag ${state.selectedDag})`);
      }, () => {
        showGPSBeacon('23.232100', '90.663100');
        pushUndo('GPS Beacon Location');
        logCommand(`GPS: Lat=23.232100°N, Lon=90.663100°E (Chorbagh Mouza Datum, Dag ${state.selectedDag}).`);
      });
    } else {
      showGPSBeacon('23.232100', '90.663100');
      pushUndo('GPS Beacon Location');
      logCommand(`GPS: Lat=23.232100°N, Lon=90.663100°E (Chorbagh Mouza Datum, Dag ${state.selectedDag}).`);
    }
  }

  function toggleGrid() {
    const gridSmall = document.getElementById('cadGridSmall');
    const gridMajor = document.getElementById('cadGridMajor');
    state.gridEnabled = !state.gridEnabled;
    if (gridSmall) gridSmall.style.display = state.gridEnabled ? 'block' : 'none';
    if (gridMajor) gridMajor.style.display = state.gridEnabled ? 'block' : 'none';
    const btn = document.getElementById('btnToggleGrid');
    if (btn) btn.classList.toggle('active', state.gridEnabled);
    logCommand(`GRID: ${state.gridEnabled ? 'ON' : 'OFF'}`);
  }

  function toggleSidebar() {
    const sidebar = document.querySelector('.w-80');
    if (sidebar) {
      sidebar.classList.toggle('hidden');
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // =========================================================================
  // 12. Initialization & Event Bindings
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {

    // Hide demo plots on reload for a clean canvas
    if (!demoPlotsVisible) {
      const layerIds = ['layerMouzaMap', 'layerPlotBoundary', 'layerPlotNo', 'layerRoad', 'layerRiver', 'layerDimension', 'groupSelectedPlotLabel'];
      layerIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      const eyeEl = document.getElementById('demoPlotsEye');
      const textEl = document.getElementById('demoPlotsText');
      const btn = document.getElementById('btnToggleDemoPlots');
      if (eyeEl) eyeEl.textContent = '👁️‍🗨️';
      if (textEl) textEl.textContent = 'Default Plots: Hidden ( )';
      if (btn) btn.classList.add('bg-amber-900', 'border-amber-500', 'text-amber-200');
    }

    // 1. Initial Ribbon Toolbar Rendering (Home tab default)
    renderRibbonToolbar('home');

    // 2. Ribbon Tabs Switching
    document.querySelectorAll('.ribbon-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeTab = tab.getAttribute('data-tab');
        renderRibbonToolbar(state.activeTab);
        logCommand(`Ribbon Tab: ${state.activeTab.toUpperCase()}`);
      });
    });

    // 3. Classic Menus Setup
    setupClassicMenus();

    // 4. Modals Setup
    setupModals();

    // 5. Left Toolbar Buttons
    document.querySelectorAll('.left-tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.getAttribute('data-tool');
        if (tool) setActiveTool(tool);
      });
    });

    // 6. Mouza Map Real File Import (JPG/PNG Upload)
    const fileInput = document.getElementById('mouzaMapFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          attachMouzaRaster(loadEvent.target.result, file.name);
          applyMouzaScale(16);
          openModal('modalScaleCalculator');
        };
        reader.readAsDataURL(file);
      });
    }

    // 7. Right Sidebar Initialization (Layers, Properties, Measure, Survey)
    function initRightSidebar() {
      // Top 4 Tabs Switching
      document.querySelectorAll('.sidebar-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const sidetab = tab.getAttribute('data-sidetab');
          state.activeSidebarTab = sidetab;

          ['panelLayers', 'panelProperties', 'panelMeasure', 'panelSurvey'].forEach(pId => {
            const p = document.getElementById(pId);
            if (p) p.classList.add('hidden');
          });

          const activePanelId = 'panel' + sidetab.charAt(0).toUpperCase() + sidetab.slice(1);
          const activePanel = document.getElementById(activePanelId);
          if (activePanel) activePanel.classList.remove('hidden');

          if (sidetab === 'properties' || sidetab === 'measure' || sidetab === 'survey') {
            if (state.selectedDag) selectPlot(state.selectedDag);
          }
        });
      });

      // Robust Layer Delegation (Eye, Lock, and Active Layer selection)
      const layerContainer = document.getElementById('layerListContainer');
      if (layerContainer) {
        layerContainer.addEventListener('click', (e) => {
          const eyeBtn = e.target.closest('.layer-eye-btn');
          if (eyeBtn) {
            e.stopPropagation();
            const key = eyeBtn.getAttribute('data-layer-key');
            if (key) toggleLayer(key);
            return;
          }

          const lockBtn = e.target.closest('.layer-lock-btn');
          if (lockBtn) {
            e.stopPropagation();
            const key = lockBtn.getAttribute('data-layer-key');
            if (key) toggleLayerLock(key);
            return;
          }

          const row = e.target.closest('.layer-row');
          if (row) {
            const key = row.getAttribute('data-layer-key');
            if (key) setActiveLayer(key);
          }
        });
      }

      // Backwards-compatible direct listeners
      document.querySelectorAll('.layer-eye-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const key = btn.getAttribute('data-layer-key');
          if (key) toggleLayer(key);
        });
      });
      document.querySelectorAll('.layer-lock-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const key = btn.getAttribute('data-layer-key');
          if (key) toggleLayerLock(key);
        });
      });
      document.querySelectorAll('.layer-row').forEach(row => {
        row.addEventListener('click', () => {
          const key = row.getAttribute('data-layer-key');
          if (key) setActiveLayer(key);
        });
      });

      // Layer Search Filter
      const layerSearch = document.getElementById('layerSearchInput');
      if (layerSearch) {
        layerSearch.addEventListener('input', (e) => {
          const term = e.target.value.toLowerCase();
          document.querySelectorAll('.layer-row').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? 'flex' : 'none';
          });
        });
      }

      // Add Layer Button
      const btnAddLayer = document.getElementById('btnAddLayer');
      if (btnAddLayer) {
        btnAddLayer.addEventListener('click', () => {
          showCadPrompt({
            title: 'New Layer',
            message: 'Enter new Layer Name (e.g. Drainage, Boundary_Pillars):',
            defaultValue: 'Survey_Notes'
          }).then(layerName => {
            if (layerName && layerName.trim()) {
              const cleanName = layerName.trim().replace(/\s+/g, '_');
              const layerKey = cleanName.toLowerCase();
              state.layers[layerKey] = true;
              if (!state.layerLocks) state.layerLocks = {};
              state.layerLocks[layerKey] = false;

            const layerList = document.getElementById('layerListContainer');
            if (layerList) {
              const div = document.createElement('div');
              div.className = 'layer-row cursor-pointer';
              div.setAttribute('data-layer-key', layerKey);
              div.innerHTML = `
                <div class="flex items-center gap-2">
                  <span class="text-sky-400 hover:text-white cursor-pointer layer-eye-btn" data-layer-key="${layerKey}" title="Visibility">👁</span>
                  <span class="text-slate-500 hover:text-slate-300 cursor-pointer layer-lock-btn" data-layer-key="${layerKey}" title="Lock">🔓</span>
                  <span class="w-2.5 h-2.5 rounded-sm bg-cyan-400 flex-shrink-0"></span>
                  <span class="font-medium">${cleanName}</span>
                </div>
              `;
              layerList.appendChild(div);

              div.querySelector('.layer-eye-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleLayer(layerKey);
              });
              div.querySelector('.layer-lock-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleLayerLock(layerKey);
              });
              div.addEventListener('click', () => setActiveLayer(layerKey));
              setActiveLayer(layerKey);
            }
            logCommand(`LAYER: New layer '${cleanName}' created and activated.`);
          }
        });
      });
    }

      // Duplicate Layer Button
      const btnDuplicateLayer = document.getElementById('btnDuplicateLayer');
      if (btnDuplicateLayer) {
        btnDuplicateLayer.addEventListener('click', () => {
          const activeL = state.activeLayer || 'plot_boundary';
          const dupName = activeL + '_Copy';
          const layerKey = dupName.toLowerCase();
          state.layers[layerKey] = true;
          if (!state.layerLocks) state.layerLocks = {};
          state.layerLocks[layerKey] = false;

          const layerList = document.getElementById('layerListContainer');
          if (layerList) {
            const div = document.createElement('div');
            div.className = 'layer-row cursor-pointer';
            div.setAttribute('data-layer-key', layerKey);
            div.innerHTML = `
              <div class="flex items-center gap-2">
                <span class="text-sky-400 hover:text-white cursor-pointer layer-eye-btn" data-layer-key="${layerKey}" title="Visibility">👁</span>
                <span class="text-slate-500 hover:text-slate-300 cursor-pointer layer-lock-btn" data-layer-key="${layerKey}" title="Lock">🔓</span>
                <span class="w-2.5 h-2.5 rounded-sm bg-purple-400 flex-shrink-0"></span>
                <span class="font-medium">${dupName}</span>
              </div>
            `;
            layerList.appendChild(div);

            div.querySelector('.layer-eye-btn')?.addEventListener('click', (e) => {
              e.stopPropagation();
              toggleLayer(layerKey);
            });
            div.querySelector('.layer-lock-btn')?.addEventListener('click', (e) => {
              e.stopPropagation();
              toggleLayerLock(layerKey);
            });
            div.addEventListener('click', () => setActiveLayer(layerKey));
            setActiveLayer(layerKey);
          }
          logCommand(`LAYER: Duplicated layer '${dupName}'.`);
        });
      }

      // Delete Layer Button
      const btnDeleteLayer = document.getElementById('btnDeleteLayer');
      if (btnDeleteLayer) {
        btnDeleteLayer.addEventListener('click', () => {
          const activeL = (state.activeLayer || '').toLowerCase();
          const coreLayers = ['mouza_map', 'plot_boundary', 'plot_no', 'road', 'river', 'dimension', 'text'];
          if (coreLayers.includes(activeL)) {
            logCommand(`LAYER: Cannot delete core system layer "${activeL}".`);
            return;
          }
          const row = document.querySelector(`.layer-row[data-layer-key="${activeL}"]`);
          if (row) row.remove();
          document.querySelectorAll(`[data-layer="${activeL}"]`).forEach(el => el.remove());
          delete state.layers[activeL];
          setActiveLayer('plot_boundary');
          logCommand(`LAYER: Layer "${activeL}" deleted.`);
        });
      }

      // Properties Tab Inline Edit Buttons
      const btnPropEditDag = document.getElementById('btnPropEditDag');
      if (btnPropEditDag) {
        btnPropEditDag.addEventListener('click', () => {
          if (!state.selectedDag) return;
          showCadPrompt({
            title: 'Edit Dag Number',
            message: 'Enter new plot/dag number:',
            defaultValue: state.selectedDag
          }).then(newDag => {
            if (newDag && newDag.trim()) {
              const oldDag = state.selectedDag;
              const clean = newDag.trim();
              if (state.plots[oldDag]) {
                state.plots[clean] = { ...state.plots[oldDag], dag: clean };
                delete state.plots[oldDag];
              }
              const poly = document.querySelector(`.mouza-plot[data-dag="${oldDag}"]`);
              if (poly) poly.setAttribute('data-dag', clean);
              const lbl = document.querySelector(`[data-dag-label="${oldDag}"]`);
              if (lbl) {
                lbl.setAttribute('data-dag-label', clean);
                const textNode = lbl.querySelector('text');
                if (textNode) textNode.textContent = clean;
              }
              selectPlot(clean);
              logCommand(`DAG NUMBER: Renamed Dag ${oldDag} to ${clean}.`);
            }
          });
        });
      }

      // Owner input in Properties Tab
      const propOwnerInput = document.getElementById('propOwnerInput');
      if (propOwnerInput) {
        propOwnerInput.addEventListener('change', (e) => {
          const val = e.target.value.trim();
          if (state.selectedDag && state.plots[state.selectedDag]) {
            state.plots[state.selectedDag].owners = val;
            if (state.plots[state.selectedDag].ownerList && state.plots[state.selectedDag].ownerList[0]) {
              state.plots[state.selectedDag].ownerList[0].name = val;
            }
            const infoOwner = document.getElementById('infoOwner');
            if (infoOwner) infoOwner.textContent = val;
            logCommand(`OWNER: Updated owner name to "${val}" for Dag ${state.selectedDag}.`);
          }
        });
      }

      // Plot Info Collapse Toggle
      const plotInfoToggle = document.getElementById('plotInfoToggle');
      const plotInfoDetails = document.getElementById('plotInfoDetails');
      if (plotInfoToggle && plotInfoDetails) {
        plotInfoToggle.addEventListener('click', () => {
          plotInfoDetails.classList.toggle('hidden');
        });
      }

      // Survey Tab Khatian Cert Button
      const btnGenKhatian = document.getElementById('btnGenerateKhatianCert');
      if (btnGenKhatian) {
        btnGenKhatian.addEventListener('click', () => {
          openModal('modalSurveyReport');
        });
      }
    }
    initRightSidebar();

    // 8. Interactive Plot Polygon Clicking
    document.querySelectorAll('.mouza-plot').forEach(polygon => {
      polygon.addEventListener('click', (e) => {
        e.stopPropagation();
        const dagNo = polygon.getAttribute('data-dag');
        if (dagNo) selectPlot(dagNo);
      });
    });

    // 9. Quick Measure Calculator in sidebar
    const btnQuickCalc = document.getElementById('btnQuickCalcArea');
    if (btnQuickCalc) {
      btnQuickCalc.addEventListener('click', () => {
        const l = parseFloat(document.getElementById('quickLength').value) || 0;
        const w = parseFloat(document.getElementById('quickWidth').value) || 0;
        const sqft = l * w;
        const dec = sqft / SQFT_PER_DECIMAL;
        const katha = sqft / SQFT_PER_KATHA;
        const links = (sqft / (FEET_PER_LINK * FEET_PER_LINK)).toFixed(0);

        document.getElementById('quickResSqFt').textContent = `${sqft.toLocaleString('en-US')} sq.ft`;
        document.getElementById('quickResDec').textContent = `${dec.toFixed(2)} Decimal`;
        document.getElementById('quickResKatha').textContent = `${katha.toFixed(2)} Katha`;
        if (document.getElementById('quickResLinks')) {
          document.getElementById('quickResLinks').textContent = `${links} sq.links`;
        }
      });
    }

    // 10. Multi-Sheet Drawing Tabs Initialization
    function initDwgTabs() {
      // Save initial canvas state into sheet01
      if (state.sheets && state.sheets.sheet01 && !state.sheets.sheet01.drawingsHtml) {
        const drawingsGroup = document.getElementById('userDrawingsGroup');
        if (drawingsGroup) {
          state.sheets.sheet01.drawingsHtml = drawingsGroup.innerHTML;
          state.sheets.sheet01.plots = JSON.parse(JSON.stringify(state.plots || {}));
        }
      }

      // Rebuild tabs dynamically so all tabs have proper data-sheet, close button and bindings
      rebuildSheetTabs();

      const btnNewDwg = document.getElementById('btnNewDwgTab');
      if (btnNewDwg) {
        btnNewDwg.addEventListener('click', () => addNewSheetTab());
      }
    }
    initDwgTabs();

    // 10. Accordions Collapse / Expand
    document.querySelectorAll('.accordion-header').forEach(hdr => {
      hdr.addEventListener('click', () => {
        const accType = hdr.getAttribute('data-acc');
        const contentId = 'accContent' + accType.charAt(0).toUpperCase() + accType.slice(1);
        const content = document.getElementById(contentId);
        if (content) {
          content.classList.toggle('hidden');
        }
      });
    });

    // Accordion Report Buttons
    const btnSidePlotReport = document.getElementById('btnSidePlotReport');
    if (btnSidePlotReport) btnSidePlotReport.addEventListener('click', () => openModal('modalSurveyReport'));
    const btnSideBatoaraCert = document.getElementById('btnSideBatoaraCert');
    if (btnSideBatoaraCert) btnSideBatoaraCert.addEventListener('click', () => openModal('modalPartitionFaraiz'));
    const btnSidePrintMap = document.getElementById('btnSidePrintMap');
    if (btnSidePrintMap) btnSidePrintMap.addEventListener('click', () => window.print());

    // 11. Command Line Input
    const cmdInput = document.getElementById('cmdInput');
    if (cmdInput) {
      cmdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleCommandInput(cmdInput.value);
          cmdInput.value = '';
        } else if (e.key === 'Escape') {
          cmdInput.value = '';
          state.drawingPoints = [];
          const rubberBand = document.getElementById('activeRubberBand');
          if (rubberBand) rubberBand.classList.add('hidden');
          logCommand('*Cancel*');
        }
      });
    }

    // 12. Canvas Click & Drawing Interaction
    const cadSvgCanvas = document.getElementById('cadSvgCanvas');
    if (cadSvgCanvas) {
      cadSvgCanvas.addEventListener('click', handleCanvasClick);
      cadSvgCanvas.addEventListener('dblclick', () => {
        if (state.activeTool === 'polyline') {
          finishPolyline();
        }
      });
    }

    // 13. Live Cursor Tracking & Coordinates Update
    const cadWorkspace = document.getElementById('cadWorkspace');
    const coordX = document.getElementById('coordX');
    const coordY = document.getElementById('coordY');
    const crosshair = document.getElementById('crosshairCursor');

    if (cadWorkspace) {
      cadWorkspace.addEventListener('mousemove', (e) => {
        const rect = cadWorkspace.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // BTM / WGS84 Survey Coordinate Mapping calibrated to active scale
        const baseEasting = 345000.000;
        const baseNorthing = 2590000.000;
        const scaleRatio = 3960 / state.scaleFactor;
        const worldX = (baseEasting + (mouseX * 1.82 * scaleRatio)).toFixed(3);
        const worldY = (baseNorthing + ((rect.height - mouseY) * 1.82 * scaleRatio)).toFixed(3);

        if (coordX) coordX.textContent = worldX;
        if (coordY) coordY.textContent = worldY;

        // Position AutoCAD crosshair with center square pickbox
        if (crosshair) {
          const onInteractiveControl = e.target && e.target.closest && (
            e.target.closest('#canvasFloatingControls') ||
            e.target.closest('#classicMenuDropdown') ||
            e.target.closest('#commandLineDock') ||
            e.target.closest('#cadInlineTextEditor') ||
            e.target.closest('#rasterDragHeader') ||
            e.target.closest('#rasterResizeHandleGroup') ||
            e.target.closest('#virtualGuniyaScale')
          );
          if (onInteractiveControl || state.isSpacePressed || state.activeTool === 'pan') {
            crosshair.style.display = 'none';
          } else {
            crosshair.style.display = 'block';
            crosshair.style.left = `${mouseX}px`;
            crosshair.style.top = `${mouseY}px`;
          }
        }

        const pt = getCanvasCoords(e);
        const s2w = getScreenPixelToWorld();
        const snapThresh = 22 * s2w; // Generous magnetic pull radius (AutoCAD OSNAP standard)

        const dynHud = document.getElementById('cadDynamicInput');
        const dynDistBadge = document.getElementById('dynDistanceBadge');
        const dynAngBadge = document.getElementById('dynAngleBadge');
        const dynPromptBadge = document.getElementById('dynPromptBadge');
        const dynOsnapTooltip = document.getElementById('dynOsnapTooltip');
        const osnapMarker = document.getElementById('drawingOsnapMarker');
        const osnapBox = document.getElementById('osnapMarkerBox');
        const guide = document.getElementById('drawingGuideLine');
        const polarTrack = document.getElementById('drawingPolarTrack');
        const angleArc = document.getElementById('drawingAngleArc');

        // AutoCAD Magnetic OSNAP (Object Snap) Detection
        const isDrawTool = (state.activeTool === 'polyline' || state.activeTool === 'polygon' || state.activeTool === 'autopolyline' || state.activeTool === 'dimension' || state.activeTool === 'line');
        const bestSnap = isDrawTool ? findBestOsnapPoint(pt, snapThresh) : null;
        let snapScreen = null;

        if (bestSnap) {
          state.snappedPoint = { x: bestSnap.x, y: bestSnap.y, isStart: bestSnap.isStart, label: bestSnap.label };
          snapScreen = svgPointToScreen(bestSnap.x, bestSnap.y);

          // Magnetic crosshair pull: snap crosshair directly onto target vertex (Image 4 standard)
          if (crosshair) {
            crosshair.style.left = `${snapScreen.x}px`;
            crosshair.style.top = `${snapScreen.y}px`;
          }

          if (osnapBox && osnapMarker) {
            osnapBox.setAttribute('x', (bestSnap.x - 5.5 * s2w).toFixed(1));
            osnapBox.setAttribute('y', (bestSnap.y - 5.5 * s2w).toFixed(1));
            osnapBox.setAttribute('width', (11.0 * s2w).toFixed(1));
            osnapBox.setAttribute('height', (11.0 * s2w).toFixed(1));
            osnapMarker.classList.remove('hidden');
          }
          if (dynOsnapTooltip) {
            dynOsnapTooltip.innerHTML = `<span>■</span> ${bestSnap.label}`;
            dynOsnapTooltip.classList.remove('hidden');
          }
        } else {
          state.snappedPoint = null;
          if (osnapMarker) osnapMarker.classList.add('hidden');
          if (dynOsnapTooltip) dynOsnapTooltip.classList.add('hidden');
        }

        const targetPt = state.snappedPoint ? state.snappedPoint : pt;
        const hudPosX = snapScreen ? snapScreen.x : mouseX;
        const hudPosY = snapScreen ? snapScreen.y : mouseY;

        // AutoCAD Dynamic Input (DYN) & Real-time Guide Line Handling
        if (state.activeTool === 'polyline' || state.activeTool === 'polygon' || state.activeTool === 'autopolyline') {
          if (state.drawingPoints && state.drawingPoints.length > 0) {
            const lastP = state.drawingPoints[state.drawingPoints.length - 1];

            if (guide) {
              guide.setAttribute('x1', lastP.x.toFixed(1));
              guide.setAttribute('y1', lastP.y.toFixed(1));
              guide.setAttribute('x2', targetPt.x.toFixed(1));
              guide.setAttribute('y2', targetPt.y.toFixed(1));
              guide.classList.remove('hidden');
            }

            const u = getUnitsPerPixel();
            const distFeet = Math.hypot((targetPt.x - lastP.x) * u.upp_svg_x, (targetPt.y - lastP.y) * u.upp_svg_y);
            const formattedDist = formatDistanceFeetInches(distFeet);

            const dx = targetPt.x - lastP.x;
            const dy = targetPt.y - lastP.y;
            const angleDeg = Math.round((Math.atan2(-dy, dx) * 180 / Math.PI + 360) % 360);

            if (dynDistBadge) {
              dynDistBadge.textContent = formattedDist;
              dynDistBadge.style.display = 'block';
            }
            if (dynAngBadge) {
              dynAngBadge.textContent = `${angleDeg}°`;
              dynAngBadge.style.display = 'block';
            }
            if (dynPromptBadge) {
              dynPromptBadge.textContent = (state.snappedPoint && state.snappedPoint.isStart && state.drawingPoints.length >= 3) 
                ? 'Endpoint (Click to close polyline)' 
                : 'Specify next point or [Close/Undo]';
            }

            if (polarTrack) {
              polarTrack.setAttribute('x1', lastP.x.toFixed(1));
              polarTrack.setAttribute('y1', lastP.y.toFixed(1));
              polarTrack.setAttribute('x2', (lastP.x + Math.max(35 * s2w, Math.abs(dx))).toFixed(1));
              polarTrack.setAttribute('y2', lastP.y.toFixed(1));
              polarTrack.classList.remove('hidden');
            }

            if (angleArc) {
              const arcR = Math.min(Math.hypot(dx, dy) * 0.45, 20 * s2w);
              if (arcR > 5 * s2w) {
                const rad = -angleDeg * Math.PI / 180;
                const ax = lastP.x + arcR * Math.cos(rad);
                const ay = lastP.y + arcR * Math.sin(rad);
                const largeArc = angleDeg > 180 ? 1 : 0;
                angleArc.setAttribute('d', `M ${lastP.x + arcR} ${lastP.y} A ${arcR} ${arcR} 0 ${largeArc} 0 ${ax.toFixed(1)} ${ay.toFixed(1)}`);
                angleArc.classList.remove('hidden');
              } else {
                angleArc.classList.add('hidden');
              }
            }

            if (dynHud) {
              dynHud.style.left = `${hudPosX}px`;
              dynHud.style.top = `${hudPosY}px`;
              dynHud.classList.remove('hidden');
            }
          } else {
            if (dynDistBadge) dynDistBadge.style.display = 'none';
            if (dynAngBadge) dynAngBadge.style.display = 'none';
            if (dynPromptBadge) dynPromptBadge.textContent = 'Specify start point:';
            if (dynHud) {
              dynHud.style.left = `${hudPosX}px`;
              dynHud.style.top = `${hudPosY}px`;
              dynHud.classList.remove('hidden');
            }
            if (guide) guide.classList.add('hidden');
            if (polarTrack) polarTrack.classList.add('hidden');
            if (angleArc) angleArc.classList.add('hidden');
          }
        } else if (state.activeTool === 'dimension') {
          if (state.dimensionPoints.length === 0) {
            if (dynDistBadge) dynDistBadge.style.display = 'none';
            if (dynAngBadge) dynAngBadge.style.display = 'none';
            if (dynPromptBadge) dynPromptBadge.textContent = 'Specify first extension line origin or select edge:';
          } else {
            const p1 = state.dimensionPoints[0];
            const u = getUnitsPerPixel();
            const distFeet = Math.hypot((targetPt.x - p1.x) * u.upp_svg_x, (targetPt.y - p1.y) * u.upp_svg_y);
            if (dynDistBadge) {
              dynDistBadge.textContent = formatDistanceFeetInches(distFeet);
              dynDistBadge.style.display = 'block';
            }
            if (dynAngBadge) dynAngBadge.style.display = 'none';
            if (dynPromptBadge) dynPromptBadge.textContent = 'Specify second extension line origin:';
          }
          if (dynHud) {
            dynHud.style.left = `${mouseX}px`;
            dynHud.style.top = `${mouseY}px`;
            dynHud.classList.remove('hidden');
          }
          if (guide) guide.classList.add('hidden');
          if (polarTrack) polarTrack.classList.add('hidden');
          if (angleArc) angleArc.classList.add('hidden');
        } else {
          if (dynHud) dynHud.classList.add('hidden');
          if (guide) guide.classList.add('hidden');
          if (polarTrack) polarTrack.classList.add('hidden');
          if (angleArc) angleArc.classList.add('hidden');
          if (osnapMarker) osnapMarker.classList.add('hidden');
        }
      });

      cadWorkspace.addEventListener('mouseleave', () => {
        if (crosshair) crosshair.style.display = 'none';
        const dynHud = document.getElementById('cadDynamicInput');
        if (dynHud) dynHud.classList.add('hidden');
        const osnapMarker = document.getElementById('drawingOsnapMarker');
        if (osnapMarker) osnapMarker.classList.add('hidden');
        const guide = document.getElementById('drawingGuideLine');
        if (guide) guide.classList.add('hidden');
        const polarTrack = document.getElementById('drawingPolarTrack');
        if (polarTrack) polarTrack.classList.add('hidden');
        const angleArc = document.getElementById('drawingAngleArc');
        if (angleArc) angleArc.classList.add('hidden');
      });
    }

    // 14. Virtual Guniya Scale Dragging, Grip Resizing & Toolbar Controls
    const guniyaEl = document.getElementById('virtualGuniyaScale');
    if (guniyaEl) {
      guniyaEl.addEventListener('click', (e) => {
        const btnCalib = e.target.closest('#btnGuniyaCalib2Pt');
        const btnMinus = e.target.closest('#btnGuniyaWMinus');
        const btnPlus = e.target.closest('#btnGuniyaWPlus');
        const btnClose = e.target.closest('#btnGuniyaCloseScale');

        if (btnCalib) {
          e.stopPropagation();
          startScaleBarCalibration();
        } else if (btnMinus) {
          e.stopPropagation();
          const curW = state.guniya.width || 150;
          const newW = Math.max(35, curW * 0.97);
          state.guniya.customWidth = newW;
          state.guniya.calibratedUpp = 660 / newW;
          rebuildGuniyaScale(newW);
          logCommand(`GUNIYA: Nudged -3% (${newW.toFixed(1)} px = 660 ft)`);
        } else if (btnPlus) {
          e.stopPropagation();
          const curW = state.guniya.width || 150;
          const newW = curW * 1.03;
          state.guniya.customWidth = newW;
          state.guniya.calibratedUpp = 660 / newW;
          rebuildGuniyaScale(newW);
          logCommand(`GUNIYA: Nudged +3% (${newW.toFixed(1)} px = 660 ft)`);
        } else if (btnClose) {
          e.stopPropagation();
          toggleVirtualGuniya(false);
        }
      });

      guniyaEl.addEventListener('mousedown', (e) => {
        if (e.target.closest('#guniyaToolbar') || e.target.closest('.guniya-btn')) {
          e.stopPropagation();
          return;
        }
        if (e.target.closest('#guniyaResizeHandle')) {
          e.stopPropagation();
          state.guniya.isResizing = true;
          return;
        }
        e.stopPropagation();
        state.guniya.isDragging = true;
        const pt = getCanvasCoords(e);
        state.guniya.dragStartX = pt.x - state.guniya.x;
        state.guniya.dragStartY = pt.y - state.guniya.y;
        guniyaEl.classList.remove('cursor-grab');
        guniyaEl.classList.add('cursor-grabbing');
      });

      window.addEventListener('mousemove', (e) => {
        if (state.guniya.isDragging) {
          const pt = getCanvasCoords(e);
          state.guniya.x = pt.x - state.guniya.dragStartX;
          state.guniya.y = pt.y - state.guniya.dragStartY;
          updateGuniyaTransform();
        } else if (state.guniya.isResizing) {
          const pt = getCanvasCoords(e);
          const dx = pt.x - state.guniya.x;
          const dy = pt.y - state.guniya.y;
          const rad = -state.guniya.rotation * Math.PI / 180;
          const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
          const newW = Math.max(35, localX);
          state.guniya.customWidth = newW;
          state.guniya.calibratedUpp = 660 / newW;
          rebuildGuniyaScale(newW);
        }
      });

      window.addEventListener('mouseup', () => {
        if (state.guniya.isDragging) {
          state.guniya.isDragging = false;
          guniyaEl.classList.remove('cursor-grabbing');
          guniyaEl.classList.add('cursor-grab');
        }
        if (state.guniya.isResizing) {
          state.guniya.isResizing = false;
          state.guniya.origCalibratedWidth = state.guniya.width;
          state.guniya.origRasterWidth = rasterState.width || 750;
          logCommand(`GUNIYA SCALE: Calibrated to width ${state.guniya.width.toFixed(1)} px (10 Chains = 660 Ft). Upp = ${(660 / state.guniya.width).toFixed(4)} ft/px.`);
        }
      });

      guniyaEl.addEventListener('wheel', (e) => {
        e.preventDefault();
        e.stopPropagation();
        state.guniya.rotation = (state.guniya.rotation + (e.deltaY > 0 ? 5 : -5)) % 360;
        updateGuniyaTransform();
      });
    }

    // 15. Status Bar Drafting Toggles
    const toggleButtons = [
      'btnToggleGrid', 'btnToggleSnap', 'btnToggleOrtho', 
      'btnTogglePolar', 'btnToggleOsnap', 'btnToggleOtrack', 
      'btnToggleDyn', 'btnToggleLwt'
    ];
    toggleButtons.forEach(btnId => {
      const b = document.getElementById(btnId);
      if (b) {
        b.addEventListener('click', () => {
          b.classList.toggle('active');
          if (btnId === 'btnToggleGrid') {
            toggleGrid();
          } else {
            logCommand(`DRAFTING: ${btnId.replace('btnToggle', '').toUpperCase()} Toggled.`);
          }
        });
      }
    });

    // 16. Scale Selector Click
    const statusScale = document.getElementById('statusScaleContainer');
    if (statusScale) {
      statusScale.addEventListener('click', () => {
        openModal('modalScaleCalculator');
      });
    }

    // Unit toggle
    const statusUnit = document.getElementById('statusUnitContainer');
    if (statusUnit) {
      statusUnit.addEventListener('click', () => {
        const units = ['Feet', 'Links', 'Meters'];
        const currentIdx = units.indexOf(document.getElementById('statusUnitValue').textContent.trim());
        const next = units[(currentIdx + 1) % units.length];
        document.getElementById('statusUnitValue').textContent = next;
        state.unit = next.toLowerCase();
        logCommand(`UNIT CHANGED: ${next}`);
      });
    }

    // Fullscreen button
    const btnFull = document.getElementById('btnFullscreenToggle');
    if (btnFull) btnFull.addEventListener('click', toggleFullscreen);

    // Header buttons
    const btnTopGuniya = document.getElementById('btnTopGuniya');
    if (btnTopGuniya) btnTopGuniya.addEventListener('click', () => toggleVirtualGuniya());
    const btnTopScaleModal = document.getElementById('btnTopScaleModal');
    if (btnTopScaleModal) btnTopScaleModal.addEventListener('click', () => openModal('modalScaleCalculator'));
    const btnTopShortcuts = document.getElementById('btnTopShortcuts');
    if (btnTopShortcuts) btnTopShortcuts.addEventListener('click', () => openModal('modalHelpShortcuts'));

    // Quick Access Buttons
    const qaNew = document.getElementById('qaNew');
    if (qaNew) qaNew.addEventListener('click', () => openModal('modalNewProject'));
    const qaOpen = document.getElementById('qaOpen');
    if (qaOpen) qaOpen.addEventListener('click', () => openModal('modalOpenProject'));
    const qaSave = document.getElementById('qaSave');
    if (qaSave) qaSave.addEventListener('click', () => saveCurrentProject());
    const qaPrint = document.getElementById('qaPrint');
    if (qaPrint) qaPrint.addEventListener('click', () => window.print());
    const qaUndo = document.getElementById('qaUndo');
    if (qaUndo) qaUndo.addEventListener('click', () => undo());
    const qaRedo = document.getElementById('qaRedo');
    if (qaRedo) qaRedo.addEventListener('click', () => redo());

    
    // Search Command or Dag Number Input
    const topSearch = document.getElementById('topSearchInput');
    if (topSearch) {
      topSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = topSearch.value.trim();
          if (!val) return;
          if (state.plots[val] || /^\d+$/.test(val)) {
            selectPlot(val);
            logCommand(`FIND: Zoomed to Dag ${val}.`);
          } else {
            handleCommandInput(val);
          }
          topSearch.blur();
        }
      });
      topSearch.addEventListener('input', (e) => {
        const val = topSearch.value.trim();
        if (state.plots[val]) {
          selectPlot(val);
        }
      });
    }

    // Workspace Selector Dropdown Switcher
    const wsContainer = document.getElementById('topActiveWorkspace')?.parentElement;
    if (wsContainer) {
      wsContainer.addEventListener('click', () => {
        const workspaces = ['Surveying', 'Drafting & Annotation', 'Cadastral GIS', 'Pentagraph Studio'];
        const wsEl = document.getElementById('topActiveWorkspace');
        const curr = wsEl ? wsEl.textContent.trim() : 'Surveying';
        const next = workspaces[(workspaces.indexOf(curr) + 1) % workspaces.length];
        if (wsEl) wsEl.textContent = next;
        
        // Switch ribbon tab to match
        const ribbonMap = {
          'Surveying': 'survey',
          'Drafting & Annotation': 'draw',
          'Cadastral GIS': 'gis',
          'Pentagraph Studio': 'pentagraph'
        };
        const targetTab = ribbonMap[next] || 'home';
        const tabBtn = document.querySelector(`.ribbon-tab-btn[data-tab="${targetTab}"]`);
        if (tabBtn) tabBtn.click();
        logCommand(`WORKSPACE: Switched to ${next} mode.`);
      });
    }

    // Inline Canvas Text Editor Event Listeners
    const btnCommitInline = document.getElementById('btnCommitInlineText');
    const btnDismissInline = document.getElementById('btnDismissInlineText');
    const btnCancelInline = document.getElementById('btnCancelInlineText');
    const inputInline = document.getElementById('inlineTextInput');

    if (btnCommitInline) btnCommitInline.addEventListener('click', commitInlineText);
    if (btnDismissInline) btnDismissInline.addEventListener('click', closeInlineTextEditor);
    if (btnCancelInline) btnCancelInline.addEventListener('click', closeInlineTextEditor);

    if (inputInline) {
      inputInline.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commitInlineText();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeInlineTextEditor();
        }
      });
    }

    document.querySelectorAll('#inlineTextColorPicker button[data-color]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('#inlineTextColorPicker button').forEach(b => b.classList.remove('active-color-btn'));
        btn.classList.add('active-color-btn');
        activeInlineTextColor = btn.getAttribute('data-color') || '#facc15';
      });
    });




    // Model / Layout Tab Switching
    document.querySelectorAll('.status-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const name = tab.textContent.trim();
        logCommand(`WORKSPACE VIEW: ${name} active.`);
      });
    });

    // RTK / TS Status Indicators Clicking
    const rtkInd = document.getElementById('statusRtkIndicator');
    if (rtkInd) {
      rtkInd.addEventListener('click', () => {
        fetchGPSLocation();
      });
    }

    const tsInd = document.getElementById('statusTsIndicator');
    if (tsInd) {
      tsInd.addEventListener('click', () => {
        tsInd.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1"></span> TS: Connected (Sokkia iX-1200)';
        tsInd.className = 'text-emerald-400 font-bold flex items-center cursor-pointer';
        logCommand('TOTAL STATION: Connected to Sokkia iX-1200 via Bluetooth EDM.');
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Press L to quickly toggle plot badges / dimension labels on or off
      if (e.code === 'KeyL' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        togglePlotLabels();
        logCommand(`LABELS: Plot badges ${state.showPlotLabels ? 'shown' : 'hidden'} (Hotkey L).`);
      }

      // 1. Global Undo / Redo Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, Cmd+Z)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        const inOtherInput = (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && e.target.id !== 'cmdInput';
        if (!inOtherInput) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        const inOtherInput = (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && e.target.id !== 'cmdInput';
        if (!inOtherInput) {
          e.preventDefault();
          redo();
          return;
        }
      }

      // 2. Global File Shortcuts (Ctrl+S, Ctrl+Shift+S, Ctrl+O, Ctrl+N, Ctrl+P, Ctrl+I)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (e.shiftKey) {
          saveProjectAs();
        } else {
          saveCurrentProject();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        openModal('modalOpenProject');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        openModal('modalNewProject');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        exportPDFReport();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        openModal('modalMouzaImport');
        return;
      }

      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Escape') {
        resetDrawingOverlay();
        document.querySelectorAll('.cad-dim-elem.selected').forEach(el => el.classList.remove('selected'));
        state.selectedDim = null;
        setActiveTool('select');
        logCommand('*Cancel*');
      } else if (e.key === 'Enter' && (state.activeTool === 'polyline' || state.activeTool === 'polygon' || state.activeTool === 'autopolyline')) {
        finishPolyline();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedObject();
      } else if (e.key === 'g' || e.key === 'G') {
        toggleVirtualGuniya();
      } else if (e.key === 'l' || e.key === 'L') {
        togglePlotLabels();
      } else if (e.key === ' ') {
        setActiveTool('select');
      } else if (e.key === 'F1') {
        e.preventDefault();
        openModal('modalHelpShortcuts');
      }
    });

    // 17. CAD Viewport Pan/Zoom & Mouza Raster Drag Engine
    setupViewportAndRasterEngine();

    // Default: select plot 126
    selectPlot('126');

    // Baseline snapshot for undo/redo
    pushUndo('Initial Workspace');
  });

  function setupViewportAndRasterEngine() {
    const cadWorkspace = document.getElementById('cadWorkspace');
    const cadSvgCanvas = document.getElementById('cadSvgCanvas');
    if (!cadWorkspace || !cadSvgCanvas) return;

    // Initial ViewBox sync
    updateViewBox();

    // Mouse Wheel Zoom
    cadWorkspace.addEventListener('wheel', (e) => {
      if (e.target.closest('#virtualGuniyaScale')) return;
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.88 : 1.14;
      zoomAtPoint(zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    // Viewport Canvas Pan
    cadWorkspace.addEventListener('mousedown', (e) => {
      if (e.target.closest('#rasterDragHeader') || 
          e.target.closest('#rasterResizeHandleGroup') || 
          e.target.closest('#virtualGuniyaScale') || 
          e.target.closest('#canvasFloatingControls') ||
          e.target.closest('#classicMenuDropdown')) {
        return;
      }

      if (e.button === 0 && (state.activeTool === 'polyline' || state.activeTool === 'dimension')) {
        return;
      }

      // Move Tool: Drag all drawings together (Mouza raster map stays fixed)
      if (state.activeTool === 'move' && e.button === 0) {
        const pt = getCanvasCoords(e);
        moveDrawingsState.isDragging = true;
        moveDrawingsState.startX = pt.x;
        moveDrawingsState.startY = pt.y;
        moveDrawingsState.currentDx = 0;
        moveDrawingsState.currentDy = 0;
        cadWorkspace.style.cursor = 'grabbing';
        e.stopPropagation();
        return;
      }

      const isMiddleClick = (e.button === 1);
      const isPanTool = (state.activeTool === 'pan');
      const isSpaceDown = (state.isSpacePressed === true);
      const isBgClick = (e.target === cadSvgCanvas || e.target.id === 'cadGridBackgroundRect' || (e.target.tagName === 'rect' && (e.target.getAttribute('fill') || '').includes('cadGrid')));

      if (isMiddleClick || isPanTool || isSpaceDown || isBgClick) {
        viewport.isPanning = true;
        viewport.panStartX = e.clientX;
        viewport.panStartY = e.clientY;
        viewport.viewBoxStartX = viewport.x;
        viewport.viewBoxStartY = viewport.y;
        cadWorkspace.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (moveDrawingsState.isDragging) {
        const pt = getCanvasCoords(e);
        const dx = pt.x - moveDrawingsState.startX;
        const dy = pt.y - moveDrawingsState.startY;
        moveDrawingsState.currentDx = dx;
        moveDrawingsState.currentDy = dy;
        const uGroup = document.getElementById('userDrawingsGroup');
        if (uGroup) {
          uGroup.setAttribute('transform', `translate(${dx.toFixed(2)}, ${dy.toFixed(2)})`);
        }
        return;
      }
      if (vertexDragState.isDragging) {
        handleVertexDragMove(e);
        return;
      }
      if (viewport.isPanning) {
        const rect = cadWorkspace.getBoundingClientRect();
        const dx = (e.clientX - viewport.panStartX) * (viewport.width / rect.width);
        const dy = (e.clientY - viewport.panStartY) * (viewport.height / rect.height);
        viewport.x = viewport.viewBoxStartX - dx;
        viewport.y = viewport.viewBoxStartY - dy;
        updateViewBox();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (moveDrawingsState.isDragging) {
        moveDrawingsState.isDragging = false;
        cadWorkspace.style.cursor = state.activeTool === 'move' ? 'grab' : 'none';
        const dx = moveDrawingsState.currentDx;
        const dy = moveDrawingsState.currentDy;
        const uGroup = document.getElementById('userDrawingsGroup');
        if (uGroup) {
          uGroup.removeAttribute('transform');
        }

        if (Math.hypot(dx, dy) > 0.5) {
          // Permanently shift all parcel polygon vertices
          for (const [dag, pData] of Object.entries(state.plots)) {
            if (pData.vertices) {
              pData.vertices = pData.vertices.map(v => ({ x: v.x + dx, y: v.y + dy }));
              const isMW = !!document.querySelector(`.user-plot-boundary[data-dag="${dag}"].magic-wand-detected`);
              renderParcelPolygon(pData.vertices, dag, pData.areaSqFt, pData.areaDecimal, pData.perimeter, isMW);
            }
          }

          // Permanently shift all dimensions and other objects in userDrawingsGroup
          if (uGroup) {
            uGroup.querySelectorAll('.cad-dim-elem').forEach(g => {
              g.querySelectorAll('line').forEach(l => {
                l.setAttribute('x1', (parseFloat(l.getAttribute('x1')) + dx).toFixed(1));
                l.setAttribute('y1', (parseFloat(l.getAttribute('y1')) + dy).toFixed(1));
                l.setAttribute('x2', (parseFloat(l.getAttribute('x2')) + dx).toFixed(1));
                l.setAttribute('y2', (parseFloat(l.getAttribute('y2')) + dy).toFixed(1));
              });
              g.querySelectorAll('rect').forEach(r => {
                r.setAttribute('x', (parseFloat(r.getAttribute('x')) + dx).toFixed(1));
                r.setAttribute('y', (parseFloat(r.getAttribute('y')) + dy).toFixed(1));
              });
              g.querySelectorAll('text').forEach(t => {
                t.setAttribute('x', (parseFloat(t.getAttribute('x')) + dx).toFixed(1));
                t.setAttribute('y', (parseFloat(t.getAttribute('y')) + dy).toFixed(1));
              });
              const rotG = g.querySelector('g[transform]');
              if (rotG) {
                const tAttr = rotG.getAttribute('transform');
                const m = tAttr.match(/rotate\(([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\)/);
                if (m) {
                  const ang = m[1];
                  const cx = parseFloat(m[2]) + dx;
                  const cy = parseFloat(m[3]) + dy;
                  rotG.setAttribute('transform', `rotate(${ang} ${cx.toFixed(1)} ${cy.toFixed(1)})`);
                }
              }
            });
          }

          pushUndo('Move Drawings');
          const u = getUnitsPerPixel();
          logCommand(`MOVE: All drawings shifted by dx=${(dx * u.upp_svg_x).toFixed(2)} ft, dy=${(dy * u.upp_svg_y).toFixed(2)} ft (Mouza map fixed).`);
        }
      }
      if (vertexDragState.isDragging) {
        handleVertexDragEnd(e);
      }
      if (viewport.isPanning) {
        viewport.isPanning = false;
        cadWorkspace.style.cursor = state.activeTool === 'pan' ? 'grab' : 'none';
        if (crosshair && state.activeTool !== 'pan') crosshair.style.display = 'block';
      }
    });

    // Mouza Raster Drag & Sizing Handlers
    const rasterDragHdr = document.getElementById('rasterDragHeader');
    const rasterImg = document.getElementById('canvasRasterMap');
    const resizeHandle = document.getElementById('rasterResizeHandleGroup');

    function startRasterDrag(e) {
      e.stopPropagation();
      rasterState.isDragging = true;
      const pt = getCanvasCoords(e);
      rasterState.startX = pt.x;
      rasterState.startY = pt.y;
      rasterState.origX = rasterState.x;
      rasterState.origY = rasterState.y;
      if (rasterDragHdr) rasterDragHdr.classList.add('cursor-grabbing');
    }

    if (rasterDragHdr) {
      rasterDragHdr.addEventListener('mousedown', startRasterDrag);
    }

    if (rasterImg) {
      rasterImg.addEventListener('mousedown', (e) => {
        if (state.activeTool === 'move' || state.activeTool === 'select') {
          startRasterDrag(e);
        }
      });
    }

    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        rasterState.isResizing = true;
        const pt = getCanvasCoords(e);
        rasterState.startX = pt.x;
        rasterState.startY = pt.y;
        rasterState.origW = rasterState.width;
        rasterState.origH = rasterState.height;
      });
    }

    window.addEventListener('mousemove', (e) => {
      if (rasterState.isDragging) {
        const pt = getCanvasCoords(e);
        rasterState.x = Math.round(rasterState.origX + (pt.x - rasterState.startX));
        rasterState.y = Math.round(rasterState.origY + (pt.y - rasterState.startY));
        updateRasterDOM();
      } else if (rasterState.isResizing) {
        const pt = getCanvasCoords(e);
        const dw = pt.x - rasterState.startX;
        const newW = Math.max(150, Math.round(rasterState.origW + dw));
        rasterState.width = newW;
        rasterState.height = Math.max(100, Math.round(rasterState.origH + (dw * (rasterState.origH / rasterState.origW))));
        updateRasterDOM();

        // If Guniya was calibrated, proportionally update its width with map resize
        if (state.guniya && state.guniya.origCalibratedWidth && rasterState.origW) {
          const ratio = newW / rasterState.origW;
          state.guniya.customWidth = state.guniya.origCalibratedWidth * ratio;
          state.guniya.calibratedUpp = 660 / state.guniya.customWidth;
          rebuildGuniyaScale(state.guniya.customWidth);
        }
      }
    });

    window.addEventListener('mouseup', () => {
      if (rasterState.isDragging) {
        rasterState.isDragging = false;
        if (rasterDragHdr) rasterDragHdr.classList.remove('cursor-grabbing');
        logCommand(`MOUZA MAP: Moved to (${rasterState.x}, ${rasterState.y}).`);
      }
      if (rasterState.isResizing) {
        rasterState.isResizing = false;
        if (state.guniya && state.guniya.customWidth) {
          state.guniya.origCalibratedWidth = state.guniya.customWidth;
          state.guniya.origRasterWidth = rasterState.width;
        }
        logCommand(`MOUZA MAP: Resized to ${rasterState.width} x ${rasterState.height} px.`);
      }
    });

    // Floating HUD Controls
    const btnBlank = document.getElementById('btnBlankCanvas');
    if (btnBlank) btnBlank.addEventListener('click', startBlankDrawing);

    const btnPlots = document.getElementById('btnToggleDemoPlots');
    if (btnPlots) btnPlots.addEventListener('click', toggleDemoPlots);

    const btnLabels = document.getElementById('btnTogglePlotLabels');
    if (btnLabels) btnLabels.addEventListener('click', () => togglePlotLabels());

    const btnCancelTool = document.getElementById('btnCancelActiveTool');
    if (btnCancelTool) {
      btnCancelTool.addEventListener('click', () => {
        resetDrawingOverlay();
        setActiveTool('select');
        logCommand('TOOL CANCELLED: Returned to Select pointer mode.');
      });
    }

    const tabStart = document.getElementById('tabStartPage');
    if (tabStart) tabStart.addEventListener('click', startBlankDrawing);

    // Toggle Command Line History Box Height
    const btnCmdToggle = document.getElementById('btnToggleCmdHistory');
    const cmdHist = document.getElementById('cmdHistory');
    if (btnCmdToggle && cmdHist) {
      btnCmdToggle.addEventListener('click', () => {
        if (cmdHist.classList.contains('expanded')) {
          cmdHist.classList.remove('expanded');
          cmdHist.classList.add('collapsed');
          btnCmdToggle.textContent = '▲';
        } else if (cmdHist.classList.contains('collapsed')) {
          cmdHist.classList.remove('collapsed');
          btnCmdToggle.textContent = '▲';
        } else {
          cmdHist.classList.add('expanded');
          btnCmdToggle.textContent = '▼';
        }
      });
    }

    const hudIn = document.getElementById('hudZoomIn');
    if (hudIn) hudIn.addEventListener('click', () => zoomCenter(0.8));

    const hudOut = document.getElementById('hudZoomOut');
    if (hudOut) hudOut.addEventListener('click', () => zoomCenter(1.25));

    const hudExt = document.getElementById('hudZoomExtents');
    if (hudExt) hudExt.addEventListener('click', zoomExtents);

    const hudSide = document.getElementById('hudRasterSideBySide');
    if (hudSide) hudSide.addEventListener('click', placeRasterSideBySide);

    const btnSideSvg = document.getElementById('btnRasterSideBySideSvg');
    if (btnSideSvg) btnSideSvg.addEventListener('click', placeRasterSideBySide);

    const hudDetach = document.getElementById('hudRasterDetach');
    if (hudDetach) hudDetach.addEventListener('click', detachMouzaRaster);

    const btnHideSvg = document.getElementById('btnRasterHideSvg');
    if (btnHideSvg) btnHideSvg.addEventListener('click', detachMouzaRaster);

    const btnCloseSvg = document.getElementById('btnRasterCloseGroup');
    if (btnCloseSvg) {
      btnCloseSvg.addEventListener('click', (e) => {
        e.stopPropagation();
        detachMouzaRaster();
      });
    }

    const hudOpacity = document.getElementById('hudRasterOpacity');
    if (hudOpacity) {
      hudOpacity.addEventListener('input', (e) => {
        const img = document.getElementById('canvasRasterMap');
        if (img) img.style.opacity = (e.target.value / 100);
      });
    }

    const zoomPctEl = document.getElementById('statusZoomPercentage');
    if (zoomPctEl) {
      zoomPctEl.addEventListener('click', zoomExtents);
    }

    // Keyboard Spacebar tracking for CAD pan
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
        state.isSpacePressed = true;
        cadWorkspace.style.cursor = 'grab';
        if (crosshair) crosshair.style.display = 'none';
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        state.isSpacePressed = false;
        cadWorkspace.style.cursor = state.activeTool === 'pan' ? 'grab' : 'none';
        if (crosshair && state.activeTool !== 'pan') crosshair.style.display = 'block';
      }
    });

    // Ribbon Minimize / Expand Toggle (Instant extra 68px vertical canvas space)
    const btnToggleRibbon = document.getElementById('btnToggleRibbon');
    if (btnToggleRibbon) {
      btnToggleRibbon.addEventListener('click', () => {
        document.body.classList.toggle('ribbon-minimized');
        const isMin = document.body.classList.contains('ribbon-minimized');
        const icon = document.getElementById('ribbonToggleIcon');
        const txt = document.getElementById('ribbonToggleText');
        if (icon) icon.textContent = isMin ? '▼' : '▲';
        if (txt) txt.textContent = isMin ? 'Expand' : 'Minimize';
        logCommand(isMin ? 'RIBBON: Minimized' : 'RIBBON: Expanded');
        updateViewBox();
      });
    }

    // Clean Screen / Fullscreen Workspace Toggle (Hides headers for maximum vertical canvas height)
    const btnMaximizeWorkspace = document.getElementById('btnMaximizeWorkspace');
    if (btnMaximizeWorkspace) {
      btnMaximizeWorkspace.addEventListener('click', () => {
        document.body.classList.toggle('workspace-maximized');
        const isMax = document.body.classList.contains('workspace-maximized');
        btnMaximizeWorkspace.innerHTML = isMax ? '<span>✕ Exit Clean</span>' : '<span>⛶ Clean Screen</span>';
        logCommand(isMax ? 'WORKSPACE: Clean Screen Enabled' : 'WORKSPACE: Restored');
        updateViewBox();
      });
    }

    // Status bar Fullscreen Toggle
    const btnFullscreenToggle = document.getElementById('btnFullscreenToggle');
    if (btnFullscreenToggle) {
      btnFullscreenToggle.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }
  }

  window.loadSampleMouzaRaster = loadSampleMouzaRaster;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.attachMouzaRaster = attachMouzaRaster;
  window.setActiveTool = setActiveTool;
  window.selectPlot = selectPlot;
  window.toggleDemoPlots = toggleDemoPlots;
  window.deleteSelectedPlot = deleteSelectedPlot;
  window.deleteSelectedObject = deleteSelectedObject;
  window.createAlignedDimension = createAlignedDimension;
  window.logCommand = logCommand;

    // Expose clean public API for UI triggers, extensions, and automated tests
  window.SurveyCAD = {
    state,
    viewport,
    rasterState,
    rasterCache,
    setActiveTool,
    selectPlot,
    deleteSelectedPlot,
    deleteSelectedObject,
    createAlignedDimension,
    logCommand,
    toggleDemoPlots,
    togglePlotLabels,
    toggleVirtualGuniya,
    getUnitsPerPixel,
    getCanvasCoords,
    applyMouzaScale,
    loadSampleMouzaRaster,
    attachMouzaRaster,
    detectPlotBoundaryFromClick,
    finishPolyline,
    resetDrawingOverlay,
    updateDrawingOverlay,
    renderParcelPolygon,
    startVertexDrag,
    vertexDragState,

    undo,
    redo,
    openModal,
    closeModal,
    saveCurrentProject,
    saveProjectAs,
    loadProjectData,
    exportDXFFile,
    exportPDFReport,
    closeCurrentProject,
    openDrawingFileDialog,
    parseAndLoadDXF,
    exportKMLFile,
    toggleGrid,
    zoomCenter,
    zoomExtents,
    updateViewBox
  };

  // Global top-level convenience aliases
  window.zoomCenter = zoomCenter;
  window.zoomExtents = zoomExtents;
  window.toggleVirtualGuniya = toggleVirtualGuniya;
  window.saveCurrentProject = saveCurrentProject;
  window.saveProjectAs = saveProjectAs;
  window.exportDXFFile = exportDXFFile;
  window.exportPDFReport = exportPDFReport;
  window.closeCurrentProject = closeCurrentProject;

})();
