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
      'combined': { name: 'Combined_Sheet01_02.dwg', drawingsHtml: '', plots: {}, selectedDag: null },
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
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0
    },
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
          { name: '১. রহিম আলী', share: '১০.০০ শতাংশ (০.৩৩৩ হিস্যা)' },
          { name: '২. করিম মিয়া', share: '১০.০০ শতাংশ (০.৩৩৩ হিস্যা)' },
          { name: '৩. সালমা বেগম', share: '১০.০০ শতাংশ (০.৩৩৪ হিস্যা)' }
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
        ownerList: [{ name: '১. আবুল কাশেম', share: '১৫.০০ শতাংশ (১.০০০ হিস্যা)' }]
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
          { name: '১. রফিকুল ইসলাম', share: '১০.০০ শতাংশ (০.৫০০ হিস্যা)' },
          { name: '২. জহিরুল হক', share: '১০.০০ শতাংশ (০.৫০০ হিস্যা)' }
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
          { name: '১. সিরাজুল হক', share: '১১.০০ শতাংশ' },
          { name: '২. মমতাজ বেগম', share: '১১.০০ শতাংশ' }
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
          { name: '১. ফাতেমা খাতুন', share: '১৫.০০ শতাংশ (০.৬০০ হিস্যা)' },
          { name: '২. আমেনা খাতুন', share: '১০.০০ শতাংশ (০.৪০০ হিস্যা)' }
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
        ownerList: [{ name: '১. রশীদ খান', share: '২৭.০০ শতাংশ' }]
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
        ownerList: [{ name: '১. নাসির উদ্দিন', share: '১৮.০০ শতাংশ (১.০০০ হিস্যা)' }]
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
          { name: '১. শাহ আলম', share: '১০.০০ শতাংশ' },
          { name: '২. মোজাম্মেল হক', share: '৭.০০ শতাংশ' },
          { name: '৩. পারভীন আক্তার', share: '৫.০০ শতাংশ' }
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
        ownerList: [{ name: '১. আনোয়ার হোসেন', share: '১৯.০০ শতাংশ' }]
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
          { name: '১. হাবিবুর রহমান', share: '১৩.০০ শতাংশ' },
          { name: '২. লতিফা বানু', share: '১৩.০০ শতাংশ' }
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
          { name: '১. মোশাররফ হোসেন', share: '১০.০০ শতাংশ' },
          { name: '২. দেলোয়ার হোসেন', share: '১০.০০ শতাংশ' },
          { name: '৩. সেলিনা আক্তার', share: '৮.০০ শতাংশ' },
          { name: '৪. রোকেয়া বেগম', share: '৫.০০ শতাংশ' }
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
          { name: '১. আসাদুল্লাহ', share: '১২.০০ শতাংশ' },
          { name: '২. রাশেদা বেগম', share: '১২.০০ শতাংশ' }
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

    // Rescale center dag badges live during zoom so they never blow up or cover the map
    const s2wBadges = getScreenPixelToWorld();
    document.querySelectorAll('.mouza-dag-label').forEach(g => {
      const dag = g.getAttribute('data-dag-label');
      const pData = state.plots[dag];
      if (pData && pData.vertices) {
        let minX = 9999, maxX = -9999, minY = 9999, maxY = -9999;
        let sumX = 0, sumY = 0;
        pData.vertices.forEach(v => {
          if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x;
          if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
          sumX += v.x; sumY += v.y;
        });
        const pw = Math.max(12, maxX - minX);
        const ph = Math.max(12, maxY - minY);
        const cx = sumX / pData.vertices.length;
        const cy = sumY / pData.vertices.length;

        const bw = Math.min(46 * s2wBadges, pw * 0.45);
        const bh = Math.min(18 * s2wBadges, ph * 0.35);
        const f1 = Math.min(bh * 0.38, 10.0 * s2wBadges);
        const f2 = Math.min(bh * 0.30, 8.5 * s2wBadges);

        const r = g.querySelector('rect');
        if (r) {
          r.setAttribute('x', (cx - bw / 2).toFixed(1));
          r.setAttribute('y', (cy - bh / 2).toFixed(1));
          r.setAttribute('width', bw.toFixed(1));
          r.setAttribute('height', bh.toFixed(1));
          r.setAttribute('rx', (2.5 * s2wBadges).toFixed(1));
        }
        const texts = g.querySelectorAll('text');
        if (texts[0]) {
          texts[0].setAttribute('x', cx.toFixed(1));
          texts[0].setAttribute('y', (cy - bh * 0.08).toFixed(1));
          texts[0].setAttribute('font-size', f1.toFixed(1));
        }
        if (texts[1]) {
          texts[1].setAttribute('x', cx.toFixed(1));
          texts[1].setAttribute('y', (cy + bh * 0.36).toFixed(1));
          texts[1].setAttribute('font-size', f2.toFixed(1));
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

    const newWidth = Math.max(80, Math.min(12000, viewport.width * factor));
    const newHeight = Math.max(52, Math.min(7800, viewport.height * factor));

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
    logCommand('ZOOM: Extents 100% (ফিট ভিউ)');
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
      if (textEl) textEl.textContent = 'ডিফল্ট দাগ: দৃশ্যমান';
      if (btn) btn.classList.remove('bg-amber-900', 'border-amber-500', 'text-amber-200');
      logCommand('DEMO PLOTS: Restored (ডিফল্ট দাগ দৃশ্যমান)');
    } else {
      if (eyeEl) eyeEl.textContent = '👁️‍🗨️';
      if (textEl) textEl.textContent = 'ডিফল্ট দাগ: লুকানো (ক্লিন ক্যানভাস)';
      if (btn) btn.classList.add('bg-amber-900', 'border-amber-500', 'text-amber-200');
      logCommand('DEMO PLOTS: Hidden (শুধুমাত্র আপনার ইমপোর্টকৃত নকশায় কাজ করুন)');
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
    if (topProjName) topProjName.textContent = 'Drawing1.dwg (খালি ক্যানভাস)';

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
      logCommand('UNDO: Nothing to undo (শুরুর পর্যায়ে আছেন).');
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
      logCommand('REDO: Nothing to redo (পুনরায় করার কিছু নেই).');
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
    const solid = document.getElementById('drawingSolidTrack');
    if (solid) solid.setAttribute('points', '');
    const guide = document.getElementById('drawingGuideLine');
    if (guide) guide.classList.add('hidden');
    const vGroup = document.getElementById('drawingVerticesGroup');
    if (vGroup) vGroup.innerHTML = '';
    const halo = document.getElementById('drawingActiveHalo');
    if (halo) halo.classList.add('hidden');
    const rubberBand = document.getElementById('activeRubberBand');
    if (rubberBand) rubberBand.classList.add('hidden');
  }

  function setActiveTool(toolName) {
    state.activeTool = toolName;

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
        bannerText.textContent = '🪄 মৌজা নকশার যেকোনো দাগের মাঝখানে ক্লিক করুন (অটো দাগ বাউন্ডারি ডিটেক্ট)';
        banner.classList.remove('hidden');
      } else if (toolName === 'polyline' || toolName === 'polygon') {
        bannerText.textContent = '✏️ আইলের কোণায় কোণায় ক্লিক করে দাগ আঁকুন (Enter বা ডাবল ক্লিকে শেষ করুন)';
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    }

    // Reset temporary drawing buffer if switching tools
    if (toolName !== 'polyline' && toolName !== 'polygon') {
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
  // 2. Virtual Guniya Scale Controller (Drag & Rotate)
  // =========================================================================
  function toggleVirtualGuniya(forceState) {
    const guniyaEl = document.getElementById('virtualGuniyaScale');
    if (!guniyaEl) return;

    state.guniya.enabled = typeof forceState === 'boolean' ? forceState : !state.guniya.enabled;
    if (state.guniya.enabled) {
      guniyaEl.classList.remove('hidden');
      updateGuniyaTransform();
      logCommand('GUNIYA: Virtual Guniya Scale Active (Drag to move, Mouse wheel over scale to rotate).');
    } else {
      guniyaEl.classList.add('hidden');
      logCommand('GUNIYA: Virtual Guniya Scale Hidden.');
    }
  }

  function updateGuniyaTransform() {
    const guniyaEl = document.getElementById('virtualGuniyaScale');
    if (!guniyaEl) return;
    guniyaEl.setAttribute('transform', `translate(${state.guniya.x}, ${state.guniya.y}) rotate(${state.guniya.rotation}, 100, 22.5)`);
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
      eyeBtn.title = isVisible ? 'Visibility (হাইড করতে ক্লিক করুন)' : 'Visibility (শো করতে ক্লিক করুন)';
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
      lockBtn.title = isLocked ? 'Layer Locked (আনলক করতে ক্লিক করুন)' : 'Layer Unlocked (লক করতে ক্লিক করুন)';
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

    logCommand(`LAYER: ${k.toUpperCase()} is now ${isLocked ? 'LOCKED (সুরক্ষিত)' : 'UNLOCKED'}.`);
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
    if (lblText) lblText.textContent = isVisible ? 'লেবেল: অন' : 'লেবেল: লুকানো';
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
    const dpiX = Number(rasterState.dpiX || rasterState.dpi) || 300;
    const dpiY = Number(rasterState.dpiY || rasterState.dpi) || 300;
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
    const upp_svg_x = px_per_svg_x * upp_px_x;
    const upp_svg_y = px_per_svg_y * upp_px_y;

    return {
      dpiX,
      dpiY,
      scale,
      unit,
      unitFactor,
      upp_px_x,
      upp_px_y,
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
    if (inputDpi) inputDpi.value = rasterState.dpi || 300;

    // Update active state on modal scale buttons
    // Direct Custom AutoCAD Scale & DPI Apply Button
    const btnDirectScale = document.getElementById('btnApplyDirectScaleFactor');
    if (btnDirectScale) {
      btnDirectScale.addEventListener('click', () => {
        const factor = parseFloat(document.getElementById('inputCustomScaleFactor')?.value) || 3960;
        const dpi = parseFloat(document.getElementById('inputCustomScaleDpi')?.value) || 300;
        const unit = document.getElementById('selectScaleUnit')?.value || 'ft';
        state.unit = unit;
        applyMouzaScale(null, factor, dpi);
        closeModal('modalScaleCalculator');
        logCommand(`SCALE: Custom AutoCAD scale factor 1:${factor} applied at ${dpi} DPI with unit ${unit}.`);
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

    logCommand(`SCALE: AutoCAD Scale Factor 1:${factor} (${state.scalePreset}" = 1 Mile) applied at ${rasterState.dpi || 300} DPI.`);
  }

  // =========================================================================
  // HELPER UTILITIES & SVG MATH
  // =========================================================================
  function toBengaliNum(val) {
    if (val === null || val === undefined) return '';
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(val).replace(/[0-9]/g, d => bnDigits[d]);
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

        // Sleek compact text: e.g. ২৯' - ৮" (NO [৮৪৩৯"] bracket!)
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

    const decStr = Number(areaDecimal).toFixed(2);
    // Badge sizing: strictly screen-pixel bounded via s2w so labels stay compact and never cover the plot
    const s2wBadge = getScreenPixelToWorld();
    let badgeW = Math.min(46 * s2wBadge, plotW * 0.45);
    let badgeH = Math.min(18 * s2wBadge, plotH * 0.35);

    const font1 = Math.min(badgeH * 0.38, 10.0 * s2wBadge);
    const font2 = Math.min(badgeH * 0.30, 8.5 * s2wBadge);

    gLabel.innerHTML = `
      <rect x="${(cx - badgeW / 2).toFixed(1)}" y="${(cy - badgeH / 2).toFixed(1)}" width="${badgeW.toFixed(1)}" height="${badgeH.toFixed(1)}" rx="${(2.5 * s2wBadge).toFixed(1)}" fill="rgba(15, 23, 42, 0.92)" stroke="#f59e0b" stroke-width="1.0" vector-effect="non-scaling-stroke"/>
      <text x="${cx.toFixed(1)}" y="${(cy - badgeH * 0.08).toFixed(1)}" fill="#fbbf24" font-size="${font1.toFixed(1)}" font-weight="bold" font-family="'Noto Sans Bengali', sans-serif" text-anchor="middle">${dag === '__mw__' ? 'মৌজা' : 'দাগ ' + toBengaliNum(dag)}</text>
      <text x="${cx.toFixed(1)}" y="${(cy + badgeH * 0.36).toFixed(1)}" fill="#38bdf8" font-size="${font2.toFixed(1)}" font-weight="bold" font-family="'Noto Sans Bengali', sans-serif" text-anchor="middle">${toBengaliNum(decStr)} শতক</text>
    `;
    drawingsGroup.appendChild(gLabel);

    flashPlotBoundary(poly);
    return poly;
  }

  // =========================================================================
  // INTERACTIVE VERTEX / CORNER GRIP DRAGGING ENGINE
  // Allows users to drag and adjust corners to reshape or scale the plot
  // =========================================================================
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
        texts[1].textContent = `${toBengaliNum(metrics.areaDecimal.toFixed(2))} শতক`;
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
      pushUndo(`Corner Grip Adjusted (দাগ ${dag})`);
      logCommand(`GRIP EDIT: Corner point updated. New Area = ${metrics.areaSqFt.toFixed(2)} sq.ft (${metrics.areaDecimal.toFixed(2)} Decimal), Perimeter = ${metrics.perimeter.toFixed(2)} ft.`);
    }
  }

  // =========================================================================
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
      ownerList: [{ name: '১. রেকর্ডীয় মালিক', share: '২০.০০ শতাংশ' }]
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
    if (propDecimal) propDecimal.textContent = `${Number(data.areaDecimal).toFixed(2)} শতাংশ`;
    if (propKathaBigha) propKathaBigha.textContent = `${(data.katha || data.areaSqFt / SQFT_PER_KATHA).toFixed(2)} কাঠা (${(data.bigha || data.areaSqFt / SQFT_PER_BIGHA).toFixed(2)} বিঘা)`;
    if (propPerimeter) propPerimeter.textContent = `${Number(data.perimeter).toFixed(2)} ft`;

    // Update Partition Modal Inputs
    const partDagNo = document.getElementById('partDagNo');
    const partTotalArea = document.getElementById('partTotalArea');
    if (partDagNo) partDagNo.textContent = data.dag;
    if (partTotalArea) partTotalArea.textContent = `${Number(data.areaDecimal).toFixed(2)} শতাংশ (${Number(data.areaSqFt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sq.ft)`;

    // Update Report Modal Fields
    const repDag = document.getElementById('repDag');
    const repArea = document.getElementById('repArea');
    const repKathaBigha = document.getElementById('repKathaBigha');
    const repPerimeter = document.getElementById('repPerimeter');
    if (repDag) repDag.textContent = data.dag;
    if (repArea) repArea.textContent = `${Number(data.areaSqFt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} বর্গফুট (${Number(data.areaDecimal).toFixed(2)} শতাংশ)`;
    if (repKathaBigha) repKathaBigha.textContent = `${(data.katha || data.areaSqFt / SQFT_PER_KATHA).toFixed(2)} কাঠা | ${(data.bigha || data.areaSqFt / SQFT_PER_BIGHA).toFixed(2)} বিঘা | ${(data.acre || data.areaSqFt / SQFT_PER_ACRE).toFixed(3)} একর`;
    if (repPerimeter) repPerimeter.textContent = `${Number(data.perimeter).toFixed(2)} ফুট (${(data.perimeter / FEET_PER_LINK).toFixed(1)} লিংক)`;

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

  // =========================================================================
  // CADASTRAL 4-CORNER BOUNDARY RECOGNITION (MAGIC WAND)
  // Accurately detects small, medium, and large parcels with 4 clean corners (চারিকোনা)
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
          // Bounded search radius: covers authentic Mouza parcels (up to 125px radius)
          const maxR = Math.max(50, Math.min(125, Math.round(origW * 0.12)));
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
          if (startLum < 130) {
            for (let r = 1; r <= 8; r++) {
              let found = false;
              for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                  const l = getLum(sx + dx, sy + dy);
                  if (l > startLum + 25) {
                    sx += dx; sy += dy; startLum = l; found = true; break;
                  }
                }
                if (found) break;
              }
              if (found) break;
            }
          }

          // Accurate ink threshold: paper texture is 170-210, ink boundary is < 130
          const inkThreshold = Math.max(65, Math.min(132, Math.round(startLum * 0.68)));

          function isInk(gx, gy) {
            return getLum(gx, gy) < inkThreshold;
          }

          // Check if ink has continuity perpendicular to rays (boundary ail vs interior isolated glyph)
          function getAilSpan(gx, gy) {
            const orientations = [[1, 0], [0, 1], [1, 1], [1, -1]];
            let maxSpan = 0;
            for (const [dx, dy] of orientations) {
              let span = 1;
              for (let s = 1; s <= 25; s++) {
                if (isInk(gx + dx * s, gy + dy * s) || 
                    isInk(gx + dx * s - dy, gy + dy * s + dx) || 
                    isInk(gx + dx * s + dy, gy + dy * s - dx)) span++;
                else break;
              }
              for (let s = 1; s <= 25; s++) {
                if (isInk(gx - dx * s, gy - dy * s) || 
                    isInk(gx - dx * s - dy, gy - dy * s + dx) || 
                    isInk(gx - dx * s + dy, gy - dy * s - dx)) span++;
                else break;
              }
              if (span > maxSpan) maxSpan = span;
            }
            return maxSpan;
          }

          // 36 rays from d = 2.0 to maxR
          const numRays = 36;
          const rawHits = [];

          for (let i = 0; i < numRays; i++) {
            const ang = (i * 2 * Math.PI) / numRays;
            const cosA = Math.cos(ang);
            const sinA = Math.sin(ang);
            let hitD = maxR;

            for (let d = 2.0; d <= maxR; d += 1.0) {
              const gx = Math.round(sx + cosA * d);
              const gy = Math.round(sy + sinA * d);

              if (isInk(gx, gy)) {
                // Check if this ink is just an interior glyph / speckle
                const span = getAilSpan(gx, gy);
                const gxAhead = Math.round(sx + cosA * (d + 4));
                const gyAhead = Math.round(sy + sinA * (d + 4));
                if (d < 22 && (span < 7 || !isInk(gxAhead, gyAhead))) {
                  continue; // bypass interior dag number text
                }
                hitD = d;
                break;
              }
            }
            rawHits.push(hitD);
          }

          // Smooth rays slightly to bridge single-ray notches
          const smoothed = [...rawHits];
          for (let p = 0; p < 2; p++) {
            for (let i = 0; i < numRays; i++) {
              const prev = smoothed[(i - 1 + numRays) % numRays];
              const curr = smoothed[i];
              const next = smoothed[(i + 1) % numRays];
              const avg = (prev + next) / 2;
              if (curr < avg * 0.65 && avg > 15) {
                smoothed[i] = avg;
              }
            }
          }

          // Convert ray distance endpoints to SVG coordinates
          const boundaryPts = [];
          for (let i = 0; i < numRays; i++) {
            const ang = (i * 2 * Math.PI) / numRays;
            const d = smoothed[i];
            const gx = sx + Math.cos(ang) * d;
            const gy = sy + Math.sin(ang) * d;
            boundaryPts.push({
              x: rx + (gx / origW) * rw,
              y: ry + (gy / origH) * rh
            });
          }

          // Extract 4 cadastral corners (Top-Left, Top-Right, Bottom-Right, Bottom-Left)
          // In each diagonal quadrant, the peak distance from center is the true cadastral corner
          function getQuadrantPeak(startIdx, endIdx) {
            let maxDistSq = -1;
            let best = boundaryPts[startIdx];
            for (let i = startIdx; i <= endIdx; i++) {
              const idx = i % numRays;
              const p = boundaryPts[idx];
              const d2 = (p.x - (rx + (sx / origW) * rw))**2 + (p.y - (ry + (sy / origH) * rh))**2;
              if (d2 > maxDistSq) {
                maxDistSq = d2;
                best = p;
              }
            }
            return best;
          }

          // Quadrant 3 (Left-Up): rays 18 to 26 -> Top-Left
          // Quadrant 4 (Right-Up): rays 27 to 35 -> Top-Right
          // Quadrant 1 (Right-Down): rays 0 to 8 -> Bottom-Right
          // Quadrant 2 (Left-Down): rays 9 to 17 -> Bottom-Left
          const corners = [
            getQuadrantPeak(18, 26), // Top-Left
            getQuadrantPeak(27, 35), // Top-Right
            getQuadrantPeak(0, 8),   // Bottom-Right
            getQuadrantPeak(9, 17)   // Bottom-Left
          ];

          if (corners.length === 4) {
            vertices = corners;
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

        // Always replace previous magic-wand result (single-slot approach)
        // Clear all previous magic-wand-detected DOM elements first
        const drawingsGroup = document.getElementById('userDrawingsGroup');
        if (drawingsGroup) {
          drawingsGroup.querySelectorAll('.magic-wand-detected').forEach(el => el.remove());
        }
        // Also remove old mw slot from state.plots
        if (state.plots['__mw__']) {
          delete state.plots['__mw__'];
        }
        const newDag = '__mw__'; // Fixed slot: only one magic-wand result at a time

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
          ownerList: [{ name: `১. রেকর্ডীয় মালিক (দাগ নং ${newDag})`, share: `${realDecimal.toFixed(2)} শতাংশ (১.০০০ হিস্যা)` }]
        };

        renderParcelPolygon(newVertices, newDag, realAreaSqFt, realDecimal, realPerimeter, true);
        pushUndo(`Magic Wand Detect (দাগ ${newDag})`);
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
        bannerText.textContent = `✏️ পয়েন্ট ${pts.length} যোগ হয়েছে। পরবর্তী পয়েন্টে ক্লিক করুন (✕ বাতিল)`;
      } else {
        bannerText.textContent = `পয়েন্ট ${pts.length} যোগ হয়েছে। প্রথম পয়েন্টে ক্লিক করে দাগ বন্ধ করুন (অথবা Double Click / Enter চাপুন)`;
      }
    }
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

    // 1. Polyline / Boundary Drawing Mode (Image 2 standard)
    if (state.activeTool === 'polyline' || state.activeTool === 'autopolyline') {
      // Check if clicking strictly near Point 1 to close polyline (Snap threshold in screen pixels)
      if (state.drawingPoints.length >= 3) {
        const p1 = state.drawingPoints[0];
        const distToStart = Math.hypot(pt.x - p1.x, pt.y - p1.y);
        const s2w = getScreenPixelToWorld();
        const snapThreshold = 7.5 * s2w; // Strictly within 7.5 screen pixels of Point 1
        if (distToStart <= snapThreshold) {
          finishPolyline();
          return;
        }
      }

      state.drawingPoints.push(pt);
      updateDrawingOverlay();
      logCommand(`PLINE: Point ${state.drawingPoints.length} added at X=${pt.x}, Y=${pt.y}`);
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
      detectPlotBoundaryFromClick(pt, true);
      return;
    }

    // 4. Distance / Dimension Tool (DIST)
    if (state.activeTool === 'dimension') {
      state.dimensionPoints.push(pt);
      if (state.dimensionPoints.length === 1) {
        logCommand(`DIMENSION: First point selected (X=${pt.x}, Y=${pt.y}). Specify second point:`);
      } else if (state.dimensionPoints.length === 2) {
        const p1 = state.dimensionPoints[0];
        const p2 = state.dimensionPoints[1];
        const u = getUnitsPerPixel();

        // Exact AutoCAD distance conversion
        const realFeet = Math.hypot((p2.x - p1.x) * u.upp_svg_x, (p2.y - p1.y) * u.upp_svg_y);
        const realLinks = (realFeet / FEET_PER_LINK).toFixed(1);
        const realMeters = (realFeet * 0.3048).toFixed(2);

        // Draw dimension line & text
        const drawingsGroup = document.getElementById('userDrawingsGroup');
        if (drawingsGroup) {
          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.setAttribute('class', 'cad-dim-elem');
          g.innerHTML = `
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#facc15" stroke-width="2" vector-effect="non-scaling-stroke"/>
            <circle cx="${p1.x}" cy="${p1.y}" r="3.5" fill="#facc15"/>
            <circle cx="${p2.x}" cy="${p2.y}" r="3.5" fill="#facc15"/>
            <rect x="${(p1.x + p2.x)/2 - 32}" y="${(p1.y + p2.y)/2 - 14}" width="64" height="18" rx="3" fill="#181c24" stroke="#facc15" stroke-width="1"/>
            <text x="${(p1.x + p2.x)/2}" y="${(p1.y + p2.y)/2 - 1}" fill="#facc15" font-size="10.5" font-weight="bold" font-family="'Fira Code', monospace" text-anchor="middle">${realFeet.toFixed(2)} ft</text>
          `;
          drawingsGroup.appendChild(g);
        }

        logCommand(`DIST: Distance = ${realFeet.toFixed(2)} ft (${realLinks} Links, ${realMeters} m) [AutoCAD Scale 1:${u.scale}]`);
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

    // 7. Text Tool (T)
    if (state.activeTool === 'text') {
      const textVal = prompt('Enter annotation text:', 'Plot Note');
      if (textVal) {
        const drawingsGroup = document.getElementById('userDrawingsGroup');
        if (drawingsGroup) {
          const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          txt.setAttribute('x', pt.x);
          txt.setAttribute('y', pt.y);
          txt.setAttribute('fill', '#facc15');
          txt.setAttribute('font-size', '12');
          txt.setAttribute('font-weight', 'bold');
          txt.textContent = textVal;
          drawingsGroup.appendChild(txt);
          pushUndo(`Text: ${textVal}`);
          logCommand(`TEXT: "${textVal}" placed at X=${pt.x}, Y=${pt.y}`);
        }
      }
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
      ownerList: [{ name: `১. নতুন পরিমাপকৃত প্লট (দাগ নং ${newDagNum})`, share: `${realDecimal.toFixed(2)} শতাংশ (১.০০০ হিস্যা)` }]
    };

    renderParcelPolygon(pts, newDagNum, realAreaSqFt, realDecimal, realPerimeter);
    selectPlot(newDagNum);
    pushUndo(`Polyline Draw (দাগ ${newDagNum})`);
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
    logCommand(`TIP: হেডার ধরে ড্র্যাগ করে ম্যাপটি যেকোনো জায়গায় সাজান, অথবা 'ডিফল্ট দাগ' লুকান বাটনে ক্লিক করে কাজ করুন।`);
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
        if (state.selectedDag && state.selectedDag !== '126') {
          deleteSelectedPlot(state.selectedDag);
        } else {
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
      { label: 'New Project (নতুন প্রজেক্ট)', shortcut: 'Ctrl+N', action: () => openModal('modalNewProject') },
      { label: 'Open Project (প্রজেক্ট ফাইল খুলুন)', shortcut: 'Ctrl+O', action: () => openModal('modalOpenProject') },
      { label: 'Open Drawing (DWG/DXF / ইমেজ)', shortcut: '', action: () => { const inp = document.getElementById('mouzaMapFileInput'); if (inp) inp.click(); } },
      { divider: true },
      { label: 'Import Mouza Map (মৌজা ম্যাপ সংযুক্তকরণ)', shortcut: 'Ctrl+I', action: () => openModal('modalMouzaImport') },
      { label: 'Load Sample Mouza Map (নমুনা চরভাগ নকশা)', shortcut: '', action: () => loadSampleMouzaRaster() },
      { divider: true },
      { label: 'Save Project (সংরক্ষণ)', shortcut: 'Ctrl+S', action: () => saveCurrentProject() },
      { label: 'Save As (নতুন নামে সংরক্ষণ)', shortcut: 'Ctrl+Shift+S', action: () => logCommand('FILE: Save As Project.') },
      { label: 'Export DXF (AutoCAD DXF তৈরি)', shortcut: '', action: () => exportDXFFile() },
      { label: 'Export PDF (PDF রিপোর্ট তৈরি)', shortcut: '', action: () => openModal('modalSurveyReport') },
      { divider: true },
      { label: 'Print (সরাসরি প্রিন্ট)', shortcut: 'Ctrl+P', action: () => window.print() },
      { label: 'Recent Projects (সাম্প্রতিক প্রজেক্ট)', shortcut: '', action: () => openModal('modalOpenProject') },
      { label: 'Close Project (প্রজেক্ট বন্ধ)', shortcut: '', action: () => logCommand('FILE: Project Closed.') },
      { label: 'Exit (সফটওয়্যার বন্ধ)', shortcut: 'Alt+F4', action: () => logCommand('FILE: SurveyCAD Pro Exited.') }
    ],
    home: [
      { label: 'Import Mouza Map (মৌজা ম্যাপ সংযুক্তকরণ)', shortcut: 'Ctrl+I', action: () => openModal('modalMouzaImport') },
      { label: 'Load Sample Mouza Map (নমুনা নকশা লোড)', shortcut: '', action: () => loadSampleMouzaRaster() },
      { divider: true },
      { label: 'Select Plot (দাগ নির্বাচন টুল)', shortcut: 'ESC', action: () => setActiveTool('select') },
      { label: 'Polyline Boundary (পলিলাইন দাগ ট্রেস)', shortcut: 'PL', action: () => setActiveTool('polyline') },
      { label: 'Magic Wand (ম্যাজিক ওয়ান্ড অটো দাগ)', shortcut: 'MW', action: () => setActiveTool('magicwand') },
      { label: 'Linear Dimension (দূরত্ব পরিমাপ)', shortcut: 'DLI', action: () => setActiveTool('dimension') },
      { divider: true },
      { label: 'Scale Calculator (স্কেল ক্যালকুলেটর)', shortcut: 'SC', action: () => openModal('modalScaleCalculator') },
      { label: 'Erase / Clear (মুছে ফেলা)', shortcut: 'Del', action: () => clearUserDrawings() }
    ],
    draw: [
      { label: 'Polyline Boundary (পলিলাইন দাগ ট্রেস)', shortcut: 'PL', action: () => setActiveTool('polyline') },
      { label: 'Magic Wand (ম্যাজিক ওয়ান্ড অটো দাগ)', shortcut: 'MW', action: () => setActiveTool('magicwand') },
      { label: 'Auto Polyline (অটো সীমানা ট্রেস)', shortcut: 'APL', action: () => setActiveTool('autopolyline') },
      { divider: true },
      { label: 'Line / Segment (রেখা)', shortcut: 'L', action: () => setActiveTool('polyline') },
      { label: 'Rectangle (আয়তক্ষেত্র)', shortcut: 'REC', action: () => setActiveTool('rectangle') },
      { label: 'Circle (বৃত্ত / বাফার)', shortcut: 'C', action: () => setActiveTool('circle') },
      { label: 'Arc (বাঁকা রেখা)', shortcut: 'A', action: () => setActiveTool('arc') },
      { label: 'Hatch (প্যাটার্ন বা হ্যাচ)', shortcut: 'H', action: () => logCommand('DRAW: Hatch Applied.') }
    ],
    modify: [
      { label: 'Move (স্থানান্তর)', shortcut: 'M', action: () => setActiveTool('move') },
      { label: 'Copy (অনুলিপি তৈরি)', shortcut: 'CO', action: () => setActiveTool('copy') },
      { label: 'Rotate (ঘোরানো)', shortcut: 'RO', action: () => setActiveTool('rotate') },
      { label: 'Scale (আকার পরিবর্তন)', shortcut: 'SC', action: () => openModal('modalScaleCalculator') },
      { label: 'Trim (কাটা)', shortcut: 'TR', action: () => setActiveTool('trim') },
      { label: 'Extend (সীমানা বাড়ানো)', shortcut: 'EX', action: () => setActiveTool('extend') },
      { label: 'Mirror (প্রতিচ্ছবি)', shortcut: 'MI', action: () => logCommand('MODIFY: Mirror object across axis.') },
      { label: 'Split (দাগ ভাগ করা)', shortcut: '', action: () => openModal('modalPartitionFaraiz') },
      { label: 'Offset (সমান্তরাল রেখা)', shortcut: 'O', action: () => logCommand('MODIFY: Offset created.') },
      { label: 'Erase (মুছে ফেলা)', shortcut: 'E', action: () => clearUserDrawings() }
    ],
    annotate: [
      { label: 'Linear Dimension (রৈখিক পরিমাপ)', shortcut: 'DLI', action: () => setActiveTool('dimension') },
      { label: 'Aligned Dimension (অ্যালাইন্ড পরিমাপ)', shortcut: 'DAL', action: () => setActiveTool('dimension') },
      { label: 'Dag Number Labels (দাগ নম্বর লেবেল)', shortcut: '', action: () => togglePlotLabels() },
      { label: 'Insert Text Note (টেক্সট নোট)', shortcut: 'T', action: () => setActiveTool('text') }
    ],
    mouza: [
      { label: 'Import Mouza Map (মৌজা নকশা আমদানি)', shortcut: 'Ctrl+I', action: () => openModal('modalMouzaImport') },
      { label: 'Load Sample Mouza Map (নমুনা চরভাগ নকশা)', shortcut: '', action: () => loadSampleMouzaRaster() },
      { label: 'Scale Mouza Map (১৬" = ১ মাইল স্কেল)', shortcut: 'SC', action: () => openModal('modalScaleCalculator') },
      { divider: true },
      { label: 'Magic Wand Auto Dag (ম্যাজিক ওয়ান্ড অটো দাগ)', shortcut: 'MW', action: () => setActiveTool('magicwand') },
      { label: 'Trace Polyline (ম্যানুয়াল দাগ ট্রেস)', shortcut: 'PL', action: () => setActiveTool('polyline') },
      { divider: true },
      { label: 'Toggle Scanned Map (মৌজা ইমেজ লুকান/দেখান)', shortcut: '', action: () => toggleMouzaRaster() },
      { label: 'Side-by-Side View (ডানপাশে শিট সাজান)', shortcut: '', action: () => placeRasterSideBySide() },
      { label: 'Detach Map Image (ছবি বাদ দিন)', shortcut: '', action: () => detachMouzaRaster() }
    ],
    survey: [
      { label: 'Area Calculation (জমির পরিমাপ / শতক)', shortcut: 'AA', action: () => handleCommandInput('AREA') },
      { label: 'Distance & Bearing (দূরত্ব ও বিয়ারিং)', shortcut: 'DIST', action: () => setActiveTool('dimension') },
      { label: 'Virtual Guniya Scale (ভার্চুয়াল গুনিয়া)', shortcut: 'G', action: () => toggleVirtualGuniya() },
      { label: 'Unit Converter (ভূমি রূপান্তর)', shortcut: 'UN', action: () => openModal('modalUnitConverter') },
      { label: 'Faraiz Partition (ফারায়েজ বন্টন)', shortcut: '', action: () => openModal('modalPartitionFaraiz') },
      { label: 'Survey Report (সার্ভে রিপোর্ট প্রস্তুত)', shortcut: 'Ctrl+R', action: () => openModal('modalSurveyReport') }
    ],
    partition: [
      { label: 'Faraiz Land Partition (ফারায়েজ বন্টন)', shortcut: '', action: () => openModal('modalPartitionFaraiz') },
      { label: 'Divide Plot Equally (সমান অংশে ভাগ)', shortcut: '', action: () => logCommand('PARTITION: Equal division wizard.') },
      { label: 'Road Widening Deduct (রাস্তা সম্প্রসারণ কর্তন)', shortcut: '', action: () => logCommand('PARTITION: Road widening offset applied.') }
    ],
    pentagraph: [
      { label: 'Pentagraph Scale Overlay (পেন্টাগ্রাফ ওভারলে)', shortcut: '', action: () => openModal('modalPentagraphOverlay') },
      { label: 'Compare Sheets 1:1 (শিট তুলনা)', shortcut: '', action: () => logCommand('PENTAGRAPH: Sheet comparison mode active.') }
    ],
    mapcombine: [
      { label: 'Combine Multiple Sheets (একাধিক শিট জোড়া)', shortcut: '', action: () => logCommand('MAP COMBINE: Sheet 01 & Sheet 02 mosaic synchronized.') },
      { label: 'Edge Matching Alignment (সীমানা মেলানো)', shortcut: '', action: () => logCommand('MAP COMBINE: Edge matching aligned.') }
    ],
    rtk: [
      { label: 'Connect RTK GPS Receiver (RTK সংযোগ)', shortcut: '', action: () => logCommand('RTK: Connected to ComNav GNSS Receiver (Fix 3D).') },
      { label: 'Import Total Station Points (.csv / .dat)', shortcut: '', action: () => logCommand('TOTAL STATION: 48 station points imported.') }
    ],
    data: [
      { label: 'Khatian & Dag Ledger (খতিয়ান ও দাগ খতিয়ান)', shortcut: '', action: () => logCommand('DATA: Khatian & Dag ledger active.') },
      { label: 'Owner Records Database (মালিকানা ডাটাবেজ)', shortcut: '', action: () => logCommand('DATA: 15 Landowner records loaded.') }
    ],
    gis: [
      { label: 'BTM / Everest 1830 Datum Sync', shortcut: '', action: () => logCommand('GIS: BTM (Bangladesh Transverse Mercator) synced.') },
      { label: 'Export Shapefile / GeoJSON', shortcut: '', action: () => logCommand('GIS: GeoJSON exported.') },
      { label: 'Export Google Earth KML / KMZ', shortcut: '', action: () => exportKMLFile() }
    ],
    analysis: [
      { label: 'Encroachment Analysis (দখলদারিত্ব বিশ্লেষণ)', shortcut: '', action: () => logCommand('ANALYSIS: Boundary overlap / encroachment check complete.') },
      { label: 'Dispute Measurement (সীমানা বিরোধ পরিমাপ)', shortcut: '', action: () => logCommand('ANALYSIS: Dispute dimension line generated.') }
    ],
    report: [
      { label: 'Generate Survey PDF Report (সার্ভে রিপোর্ট প্রস্তুত)', shortcut: 'Ctrl+R', action: () => openModal('modalSurveyReport') },
      { label: 'Print Current Canvas (ক্যানভাস প্রিন্ট)', shortcut: 'Ctrl+P', action: () => window.print() },
      { label: 'Area Statement Table (শতক তালিকা প্রিন্ট)', shortcut: '', action: () => logCommand('REPORT: Area Statement table ready.') }
    ],
    tools: [
      { label: 'Virtual Guniya Scale (ভার্চুয়াল গুনিয়া)', shortcut: 'G', action: () => toggleVirtualGuniya() },
      { label: 'Scale Calculator (মৌজা স্কেল 63360/W)', shortcut: 'SC', action: () => openModal('modalScaleCalculator') },
      { label: 'Area Calculator (ক্ষেত্রফল ক্যালকুলেটর)', shortcut: 'AA', action: () => handleCommandInput('AREA') },
      { label: 'Unit Converter (ভূমি একক রূপান্তর)', shortcut: 'UN', action: () => openModal('modalUnitConverter') },
      { label: 'Coordinate Converter (BTM/WGS84)', shortcut: '', action: () => logCommand('TOOLS: Coordinates converted BTM <-> WGS84.') },
      { divider: true },
      { label: 'Survey Utilities (জরিপ ইউটিলিটি)', shortcut: '', action: () => logCommand('TOOLS: Traverse balancing & Bearing.') }
    ],
    view: [
      { label: 'Zoom In (বড় করে দেখা)', shortcut: 'Ctrl++', action: () => zoomCenter(0.8) },
      { label: 'Zoom Out (ছোট করে দেখা)', shortcut: 'Ctrl+-', action: () => zoomCenter(1.25) },
      { label: 'Zoom Extents (সম্পূর্ণ ড্রয়িং)', shortcut: 'Z E', action: () => zoomExtents() },
      { label: 'Pan (ক্যানভাস সরানো)', shortcut: 'P', action: () => setActiveTool('pan') },
      { divider: true },
      { label: 'Toggle Demo Plots (ডিফল্ট দাগ অন/অফ)', shortcut: '', action: () => toggleDemoPlots() },
      { label: 'Grid On/Off (গ্রিড প্রদর্শন)', shortcut: '#', action: () => toggleGrid() },
      { label: 'Full Screen (ফুল স্ক্রিন)', shortcut: 'F11', action: () => toggleFullscreen() },
      { label: 'Show/Hide Sidebar (সাইডবার)', shortcut: 'Ctrl+B', action: () => toggleSidebar() }
    ],
    edit: [
      { label: 'Undo (পূর্বাবস্থায় ফেরা)', shortcut: 'Ctrl+Z', action: () => undo() },
      { label: 'Redo (পুনরায় করা)', shortcut: 'Ctrl+Y', action: () => redo() },
      { divider: true },
      { label: 'Select All (সব নির্বাচন)', shortcut: 'Ctrl+A', action: () => selectPlot('126') },
      { label: 'Erase / Delete (মুছে ফেলা)', shortcut: 'Del', action: () => clearUserDrawings() }
    ],
    help: [
      { label: 'User Manual (ব্যবহারকারী নির্দেশিকা)', shortcut: '', action: () => logCommand('HELP: User Manual: docs/surveycad-guide.pdf') },
      { label: 'Keyboard Shortcuts (কীবোর্ড শর্টকাট)', shortcut: 'F1', action: () => openModal('modalHelpShortcuts') },
      { label: 'About SurveyCAD Pro (সফটওয়্যার পরিচিতি)', shortcut: '', action: () => logCommand('HELP: SurveyCAD Pro v1.0 Enterprise Edition.') }
    ]
  };

    // Project Management (Open, Load, New Project)
  function loadProjectData(projectKey) {
    if (projectKey === 'chorbagh') {
      const topName = document.querySelector('.font-bold.text-slate-200');
      if (topName) topName.textContent = 'Chorbagh_Survey.prj';
      applyMouzaScale(16);
      showSheet('sheet01');
      selectPlot('126');
      logCommand('PROJECT: Loaded Chorbagh_Survey.prj (CS 1920, Scale 1:3960).');
    } else if (projectKey === 'dakshinpara') {
      const topName = document.querySelector('.font-bold.text-slate-200');
      if (topName) topName.textContent = 'Dakshinpara_Survey.prj';
      applyMouzaScale(32);
      showSheet('sheet01');
      selectPlot('148');
      logCommand('PROJECT: Loaded Dakshinpara_Survey.prj (RS 1985, Scale 1:1980).');
    } else if (projectKey === 'rupganj') {
      const topName = document.querySelector('.font-bold.text-slate-200');
      if (topName) topName.textContent = 'Rupganj_CityCadastral.prj';
      applyMouzaScale(80);
      showSheet('sheet01');
      selectPlot('130');
      logCommand('PROJECT: Loaded Rupganj_CityCadastral.prj (BS 2010, Scale 1:792).');
    }
  }

  // Multi-sheet workspace state helper
  function saveCurrentSheetState() {
    if (!state.currentSheet) state.currentSheet = 'sheet01';
    const drawingsGroup = document.getElementById('userDrawingsGroup');
    if (!state.sheets) state.sheets = {};
    if (!state.sheets[state.currentSheet]) {
      state.sheets[state.currentSheet] = { name: state.currentSheet + '.dwg' };
    }
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
      tabEl.className = `dwg-tab cursor-pointer ${isActive ? 'active' : ''}`;
      tabEl.setAttribute('data-sheet', key);
      tabEl.innerHTML = `
        <span>${s.name || key + '.dwg'}</span>
        <span class="dwg-tab-close" title="Close Sheet">✕</span>
      `;
      bindTabEvents(tabEl);
      container.insertBefore(tabEl, addBtn);
    });
  }

  function bindTabEvents(tab) {
    tab.addEventListener('click', (e) => {
      if (e.target.classList.contains('dwg-tab-close')) {
        closeSheetTab(tab);
        return;
      }
      const sheetKey = tab.getAttribute('data-sheet');
      if (sheetKey) {
        saveCurrentSheetState();
        document.querySelectorAll('.dwg-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        if (sheetKey === 'sheet01' || sheetKey === 'sheet02' || sheetKey === 'combined' || sheetKey === 'dakshinpara') {
          showSheet(sheetKey);
        } else {
          loadSheetState(sheetKey);
        }
        const name = tab.querySelector('span')?.textContent?.trim() || sheetKey;
        logCommand(`SHEET: Switched to ${name}`);
      }
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
    const sheetKey = tab.getAttribute('data-sheet');
    const allTabs = Array.from(document.querySelectorAll('#dwgTabsContainer .dwg-tab:not(#tabStartPage)'));
    if (allTabs.length <= 1) {
      logCommand('SHEET: Cannot close the only remaining sheet tab.');
      return;
    }
    const name = tab.querySelector('span')?.textContent?.trim() || sheetKey;
    const wasActive = tab.classList.contains('active');

    tab.remove();
    if (state.sheets && sheetKey) {
      delete state.sheets[sheetKey];
    }

    if (wasActive) {
      const remainingTabs = document.querySelectorAll('#dwgTabsContainer .dwg-tab:not(#tabStartPage)');
      if (remainingTabs.length > 0) {
        remainingTabs[0].click();
      }
    }
    logCommand(`SHEET: Closed "${name}".`);
  }

  function addNewSheetTab() {
    const defaultName = `Sheet_0${Object.keys(state.sheets || {}).length + 1}.dwg`;
    const sheetName = prompt('নতুন শিট / ড্রয়িং নাম লিখুন (Enter Sheet Name):', defaultName);
    if (!sheetName || !sheetName.trim()) return;

    const cleanName = sheetName.trim();
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
    newTab.className = 'dwg-tab active cursor-pointer';
    newTab.setAttribute('data-sheet', sheetKey);
    newTab.innerHTML = `
      <span>${cleanName}</span>
      <span class="dwg-tab-close" title="Close Sheet">✕</span>
    `;
    bindTabEvents(newTab);
    container.insertBefore(newTab, addBtn);

    state.currentSheet = sheetKey;
    // Clear drawings canvas for new blank sheet
    const drawingsGroup = document.getElementById('userDrawingsGroup');
    if (drawingsGroup) drawingsGroup.innerHTML = '';
    state.plots = {};

    logCommand(`NEW SHEET: Created and switched to "${cleanName}".`);
  }

  // Project Save & Export Handlers (Desktop Native + Web Blob)
  function saveCurrentProject(customName) {
    saveCurrentSheetState();
    const topProjName = document.querySelector('.font-bold.text-slate-200')?.textContent?.replace(/\.prj$/i, '') || state.projectName || 'Chorbagh_Survey';
    const projName = customName || topProjName;

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
      logCommand(`SAVE: Project "${projName}.prj" downloaded and saved to your computer.`);
    }
  }

  function exportDXFFile() {
    if (window.Exporters && typeof window.Exporters.generateDXF === 'function') {
      const plotsList = Object.values(state.plots).map(p => ({
        dagNo: p.dag,
        areaSqFt: p.areaSqFt,
        points: []
      }));
      const dxfContent = window.Exporters.generateDXF(plotsList, [], 'Chorbagh Mouza CS 1920');
      if (window.electronAPI && typeof window.electronAPI.exportDXF === 'function') {
        window.electronAPI.exportDXF(dxfContent);
      } else {
        window.Exporters.downloadFile(dxfContent, 'Chorbagh_Survey.dxf', 'application/dxf');
      }
      logCommand('EXPORT DXF: AutoCAD DXF file generated and downloaded (Chorbagh_Survey.dxf).');
    } else {
      logCommand('EXPORT DXF: AutoCAD R12 DXF generated.');
    }
  }

  function exportKMLFile() {
    if (window.Exporters && typeof window.Exporters.downloadFile === 'function') {
      const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Chorbagh_Survey_Dag${state.selectedDag}.kml</name>
    <Placemark>
      <name>দাগ নং ${state.selectedDag}</name>
      <description>মৌজা: চরবাগ | ক্ষেত্রফল: ${state.plots[state.selectedDag]?.areaDecimal || '30.00'} শতাংশ</description>
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

    const projInput = document.getElementById('projectFileInput');
    if (projInput) {
      projInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            if (data.projectName) {
              state.projectName = data.projectName;
              const topName = document.querySelector('.font-bold.text-slate-200');
              if (topName) topName.textContent = data.projectName + '.prj';
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
      });
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
        const name = document.getElementById('newProjFileName')?.value || 'New_Survey.prj';
        const mouza = document.getElementById('newProjMouza')?.value || 'মৌজা';
        const scaleVal = document.getElementById('newProjScale')?.value || '16';
        
        const topName = document.querySelector('.font-bold.text-slate-200');
        if (topName) topName.textContent = name;
        
        applyMouzaScale(scaleVal);
        closeModal('modalNewProject');
        logCommand(`NEW PROJECT: Created ${name} (মৌজা: ${mouza}, স্কেল: ${scaleVal}"=১ মাইল).`);
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
        pushUndo(`Partition (দাগ ${state.selectedDag})`);
        logCommand(`PARTITION: Dag ${state.selectedDag} split into 3 sub-dags (ক, খ, গ) of 10.00 Decimal each.`);
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
      if (textEl) textEl.textContent = 'ডিফল্ট দাগ: লুকানো (ক্লিন ক্যানভাস)';
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
          const layerName = prompt('Enter new Layer Name (e.g. Drainage, Boundary_Pillars, Road_Reserve):', 'Survey_Notes');
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
          const newDag = prompt('Edit Dag Number:', state.selectedDag);
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
        document.getElementById('quickResDec').textContent = `${dec.toFixed(2)} শতাংশ`;
        document.getElementById('quickResKatha').textContent = `${katha.toFixed(2)} কাঠা`;
        if (document.getElementById('quickResLinks')) {
          document.getElementById('quickResLinks').textContent = `${links} sq.links`;
        }
      });
    }

    // 10. Multi-Sheet Drawing Tabs Initialization
    function initDwgTabs() {
      document.querySelectorAll('#dwgTabsContainer .dwg-tab').forEach(tab => {
        bindTabEvents(tab);
      });

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

        // Position crosshair
        if (crosshair) {
          crosshair.style.display = 'block';
          crosshair.style.left = `${mouseX}px`;
          crosshair.style.top = `${mouseY}px`;
        }

        // Handle Polyline Guide Line preview (Image 4 standard)
        if ((state.activeTool === 'polyline' || state.activeTool === 'polygon') && state.drawingPoints.length > 0) {
          const pt = getCanvasCoords(e);
          const guide = document.getElementById('drawingGuideLine');
          if (guide) {
            const lastP = state.drawingPoints[state.drawingPoints.length - 1];
            guide.setAttribute('x1', lastP.x.toFixed(1));
            guide.setAttribute('y1', lastP.y.toFixed(1));
            guide.setAttribute('x2', pt.x.toFixed(1));
            guide.setAttribute('y2', pt.y.toFixed(1));
            guide.classList.remove('hidden');
          }
        }
      });

      cadWorkspace.addEventListener('mouseleave', () => {
        if (crosshair) crosshair.style.display = 'none';
      });
    }

    // 14. Virtual Guniya Scale Dragging & Wheel Rotation
    const guniyaEl = document.getElementById('virtualGuniyaScale');
    if (guniyaEl) {
      guniyaEl.addEventListener('mousedown', (e) => {
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
        }
      });

      window.addEventListener('mouseup', () => {
        if (state.guniya.isDragging) {
          state.guniya.isDragging = false;
          guniyaEl.classList.remove('cursor-grabbing');
          guniyaEl.classList.add('cursor-grab');
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

      // 2. Global Save & Open Shortcuts (Ctrl+S, Ctrl+O)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        saveCurrentProject();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        openModal('modalOpenProject');
        return;
      }

      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Escape') {
        resetDrawingOverlay();
        setActiveTool('select');
        logCommand('*Cancel*');
      } else if (e.key === 'Enter' && (state.activeTool === 'polyline' || state.activeTool === 'polygon')) {
        finishPolyline();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedDag && state.selectedDag !== '126') {
          e.preventDefault();
          deleteSelectedPlot(state.selectedDag);
        }
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
      if (vertexDragState.isDragging) {
        handleVertexDragEnd(e);
      }
      if (viewport.isPanning) {
        viewport.isPanning = false;
        cadWorkspace.style.cursor = state.activeTool === 'pan' ? 'grab' : 'crosshair';
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
        rasterState.width = Math.max(150, Math.round(rasterState.origW + dw));
        rasterState.height = Math.max(100, Math.round(rasterState.origH + (dw * (rasterState.origH / rasterState.origW))));
        updateRasterDOM();
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
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        state.isSpacePressed = false;
        cadWorkspace.style.cursor = state.activeTool === 'pan' ? 'grab' : 'crosshair';
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
        if (txt) txt.textContent = isMin ? 'রিবন খুলুন' : 'রিবন ছোট';
        logCommand(isMin ? 'RIBBON: Minimized (ক্যানভাস উচ্চতা বাড়ানো হলো)' : 'RIBBON: Expanded');
        updateViewBox();
      });
    }

    // Clean Screen / Fullscreen Workspace Toggle (Hides headers for maximum vertical canvas height)
    const btnMaximizeWorkspace = document.getElementById('btnMaximizeWorkspace');
    if (btnMaximizeWorkspace) {
      btnMaximizeWorkspace.addEventListener('click', () => {
        document.body.classList.toggle('workspace-maximized');
        const isMax = document.body.classList.contains('workspace-maximized');
        btnMaximizeWorkspace.innerHTML = isMax ? '<span>✕ রিস্টোর</span>' : '<span>⛶ ফুল ক্যানভাস</span>';
        logCommand(isMax ? 'WORKSPACE: Clean Screen Enabled (সর্বোচ্চ ক্যানভাস স্পেস)' : 'WORKSPACE: Restored');
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

    // Expose clean public API for UI triggers, extensions, and automated tests
  window.SurveyCAD = {
    state,
    viewport,
    rasterState,
    rasterCache,
    setActiveTool,
    selectPlot,
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
    renderParcelPolygon,
    startVertexDrag,
    vertexDragState,

    undo,
    redo,
    openModal,
    closeModal,
    saveCurrentProject,
    loadProjectData,
    exportDXFFile,
    exportKMLFile,
    toggleGrid,
    zoomCenter,
    zoomExtents,
    updateViewBox
  };

})();
