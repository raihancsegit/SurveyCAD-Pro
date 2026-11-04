/**
 * Land Survey CAD - Export & Project Storage Engine
 * AutoCAD DXF, Google Earth KMZ Maker & Native .lscad project serializer
 */

(function(global) {
  'use strict';

  function escapeXml(unsafe) {
    if (unsafe === undefined || unsafe === null) return '';
    return String(unsafe).replace(/[<>&'"]/g, function(c) {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
      return c;
    });
  }

  const Exporters = {
    escapeXml: escapeXml,

    /**
     * Download blob or text data as a client-side file
     */
    downloadFile: function(content, fileName, mimeType) {
      let blob;
      if (content instanceof Blob) {
        blob = content;
      } else {
        blob = new Blob([content], { type: mimeType || 'text/plain;charset=utf-8' });
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 200);
    },

    /**
     * Generate standard Release 12 / 2000 compliant DXF
     */
    generateDXF: function(plots, pillars, mouzaTitle) {
      mouzaTitle = mouzaTitle || 'LAND_SURVEY_CAD';
      let dxf = '';

      dxf += '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n9\n$PROJECTNAME\n1\n' + mouzaTitle + '\n0\nENDSEC\n';
      dxf += '0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n3\n';
      dxf += '0\nLAYER\n2\nPLOTS\n70\n0\n62\n5\n6\nCONTINUOUS\n';
      dxf += '0\nLAYER\n2\nPILLARS\n70\n0\n62\n1\n6\nCONTINUOUS\n';
      dxf += '0\nLAYER\n2\nLABELS\n70\n0\n62\n7\n6\nCONTINUOUS\n';
      dxf += '0\nENDTAB\n0\nENDSEC\n';
      dxf += '0\nSECTION\n2\nENTITIES\n';

      // Closed Polylines for Plots
      (plots || []).forEach(plot => {
        if (!plot.vertices || plot.vertices.length < 2) return;
        const pts = plot.vertices;
        const n = pts.length;

        dxf += '0\nPOLYLINE\n8\nPLOTS\n66\n1\n70\n1\n';
        for (let i = 0; i < n; i++) {
          dxf += '0\nVERTEX\n8\nPLOTS\n10\n' + pts[i].x.toFixed(4) + '\n20\n' + pts[i].y.toFixed(4) + '\n30\n0.0\n';
        }
        dxf += '0\nSEQEND\n';

        // Centroid Label
        let cx = 0, cy = 0;
        pts.forEach(p => { cx += p.x; cy += p.y; });
        cx /= n; cy /= n;

        dxf += '0\nTEXT\n8\nLABELS\n10\n' + cx.toFixed(4) + '\n20\n' + cy.toFixed(4) + '\n30\n0.0\n40\n15.0\n1\n' + (plot.name || 'PLOT') + '\n';
      });

      // Pillars
      (pillars || []).forEach(pillar => {
        dxf += '0\nCIRCLE\n8\nPILLARS\n10\n' + pillar.x.toFixed(4) + '\n20\n' + pillar.y.toFixed(4) + '\n30\n0.0\n40\n6.0\n';
        dxf += '0\nTEXT\n8\nLABELS\n10\n' + (pillar.x + 8).toFixed(4) + '\n20\n' + (pillar.y + 8).toFixed(4) + '\n30\n0.0\n40\n10.0\n1\n' + (pillar.name || 'PILLAR') + '\n';
      });

      dxf += '0\nENDSEC\n0\nEOF\n';
      return dxf;
    },

    /**
     * Generate Comprehensive Google Earth KML XML
     * Supports: Mouza GroundOverlay, Plot Polygons, Daag Centroid Pins,
     * Khatian Metadata, Custom Opacity & Line Styling
     */
    generateKML: function(plots, activeMap, originGPS, anchorWorld, options = {}) {
      originGPS = originGPS || { lat: 23.1275, lng: 90.7509 };
      anchorWorld = anchorWorld || { x: 0, y: 0 };

      const opts = Object.assign({
        title: 'মৌজা ম্যাপ ও জমির দাগ নির্ধারণ (Land Survey CAD)',
        description: 'Land Survey CAD Cadastral KMZ Map',
        includeOverlay: true,
        overlayImagePath: 'files/mouza.jpg',
        overlayOpacity: 0.85,
        includePolygons: true,
        includeCentroidPins: true,
        includeKhatian: true,
        polygonColor: 'ff00e5ff', // KML AABBGGRR: Yellow/Cyan outline
        fillOpacityHex: '40',     // 25% transparent fill
        lineWidth: 3.0
      }, options);

      // Coordinate converter helper
      const toGPS = (x, y) => {
        if (window.LSCAD?.PlotOps?.canvasToGPS) {
          return window.LSCAD.PlotOps.canvasToGPS(x, y, originGPS, anchorWorld);
        }
        const latRad = ((originGPS?.lat || 23.1275) * Math.PI) / 180;
        const linksPerDegLat = 550530;
        const linksPerDegLng = linksPerDegLat * Math.cos(latRad);
        const dx = x - (anchorWorld.x || 0);
        const dy = y - (anchorWorld.y || 0);
        return {
          lat: originGPS.lat - (dy / linksPerDegLat),
          lng: originGPS.lng + (dx / linksPerDegLng)
        };
      };

      // Alpha in hex for GroundOverlay (e.g. 0.85 -> d9)
      const overlayAlpha = Math.min(255, Math.max(0, Math.round(opts.overlayOpacity * 255)));
      const overlayAlphaHex = overlayAlpha.toString(16).padStart(2, '0');

      let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
  <Document>
    <name>${escapeXml(opts.title)}</name>
    <description>${escapeXml(opts.description)}</description>
    <open>1</open>

    <!-- Google Earth Smooth Auto-Flight Camera -->
    <LookAt>
      <longitude>${originGPS.lng.toFixed(7)}</longitude>
      <latitude>${originGPS.lat.toFixed(7)}</latitude>
      <altitude>0</altitude>
      <heading>0</heading>
      <tilt>15</tilt>
      <range>1500</range>
      <altitudeMode>relativeToGround</altitudeMode>
    </LookAt>

    <!-- Styles for Plots & Centroid Labels -->
    <Style id="plotPolygonStyle">
      <LineStyle>
        <color>${opts.polygonColor}</color>
        <width>${opts.lineWidth}</width>
      </LineStyle>
      <PolyStyle>
        <color>${opts.fillOpacityHex}00e5ff</color>
        <fill>1</fill>
        <outline>1</outline>
      </PolyStyle>
      <BalloonStyle>
        <bgColor>ffffffff</bgColor>
        <textColor>ff1e293b</textColor>
        <text><![CDATA[$[description]]]></text>
      </BalloonStyle>
    </Style>

    <Style id="centroidPinStyle">
      <IconStyle>
        <scale>0.85</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href>
        </Icon>
        <color>ff0284c7</color>
      </IconStyle>
      <LabelStyle>
        <scale>0.9</scale>
        <color>ffffffff</color>
      </LabelStyle>
    </Style>
`;

      // 1. Mouza Map Ground Overlay (Raster Sheet on Earth)
      if (opts.includeOverlay && activeMap && activeMap.loaded && opts.overlayImagePath) {
        const mx = activeMap.x || 0;
        const my = activeMap.y || 0;
        const mw = activeMap.width || 1200;
        const mh = activeMap.height || 900;
        const rot = activeMap.rotation || 0;

        const nwGps = toGPS(mx, my);
        const seGps = toGPS(mx + mw, my + mh);

        const north = Math.max(nwGps.lat, seGps.lat);
        const south = Math.min(nwGps.lat, seGps.lat);
        const east = Math.max(nwGps.lng, seGps.lng);
        const west = Math.min(nwGps.lng, seGps.lng);

        kml += `    <!-- Mouza Map Scanned Sheet Ground Overlay -->
    <GroundOverlay>
      <name>${escapeXml(activeMap.name || 'মৌজা নকশা শিট')}</name>
      <description>Georeferenced Mouza Cadastral Sheet (Land Survey CAD)</description>
      <color>${overlayAlphaHex}ffffff</color>
      <altitude>0</altitude>
      <altitudeMode>clampToGround</altitudeMode>
      <Icon>
        <href>${escapeXml(opts.overlayImagePath)}</href>
        <viewBoundScale>0.75</viewBoundScale>
      </Icon>
      <LatLonBox>
        <north>${north.toFixed(7)}</north>
        <south>${south.toFixed(7)}</south>
        <east>${east.toFixed(7)}</east>
        <west>${west.toFixed(7)}</west>
        <rotation>${rot.toFixed(2)}</rotation>
      </LatLonBox>
    </GroundOverlay>
`;
      }

      // 2. Plot Polygons Folder
      if (opts.includePolygons && plots && plots.length > 0) {
        kml += `    <Folder>
      <name>জমির দাগ ও সীমানা (Plots / Daag)</name>
      <open>1</open>
`;

        plots.forEach(plot => {
          if (!plot.vertices || plot.vertices.length < 3) return;

          // Convert all vertices to GPS
          const gpsPoints = plot.vertices.map(v => toGPS(v.x, v.y));
          gpsPoints.push(gpsPoints[0]); // Close polygon loop

          const coordsStr = gpsPoints
            .map(p => `${p.lng.toFixed(7)},${p.lat.toFixed(7)},0`)
            .join(' ');

          // Calculate Centroid & Area
          let cx = 0, cy = 0;
          plot.vertices.forEach(v => { cx += v.x; cy += v.y; });
          cx /= plot.vertices.length;
          cy /= plot.vertices.length;
          const centroidGPS = toGPS(cx, cy);

          // Area breakdown (Shatak, Katha, Sq.Ft)
          let areaSqFt = plot.area || 0;
          if (window.LSCAD?.Geometry?.calculateShoelaceArea) {
            const rawArea = window.LSCAD.Geometry.calculateShoelaceArea(plot.vertices);
            // Default CAD units: 1 unit = 0.66 ft -> 1 sq unit = 0.4356 sq.ft
            areaSqFt = rawArea * (0.66 * 0.66);
          }
          const shatak = (areaSqFt / 435.60).toFixed(2);
          const katha = (areaSqFt / 720.00).toFixed(2);
          const bigha = (areaSqFt / 14400.00).toFixed(3);
          const sqFeet = Math.round(areaSqFt).toLocaleString('en-US');

          const khatianNo = plot.khatian || plot.khatianNo || 'স্বত্ব খতিয়ান';
          const landClass = plot.class || plot.landClass || 'নাল';

          const balloonHtml = `
<div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #0f172a; min-width: 240px; padding: 4px;">
  <div style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; padding: 8px 12px; border-radius: 8px; font-weight: bold; font-size: 15px; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    📌 ${escapeXml(plot.name || 'জমির দাগ')}
  </div>
  <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
    <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 5px; color: #64748b;">খতিয়ান নম্বর:</td><td style="padding: 5px; font-weight: bold; color: #b45309;">${escapeXml(khatianNo)}</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 5px; color: #64748b;">জমির শ্রেণি:</td><td style="padding: 5px; font-weight: bold;">${escapeXml(landClass)}</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 5px; color: #64748b;">জমির পরিমাণ:</td><td style="padding: 5px; font-weight: bold; color: #16a34a; font-size: 13px;">${shatak} শতাংশ (${katha} কাঠা)</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 5px; color: #64748b;">মোট বর্গফুট:</td><td style="padding: 5px; font-mono; font-weight: 600;">${sqFeet} sq.ft</td></tr>
    <tr><td style="padding: 5px; color: #64748b;">বিঘা সমতুল্য:</td><td style="padding: 5px;">${bigha} বিঘা</td></tr>
  </table>
  <div style="margin-top: 10px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 6px;">
    Land Survey CAD Platform • Cadastral Map
  </div>
</div>`.trim();

          // Polygon Placemark
          kml += `      <Placemark>
        <name>${escapeXml(plot.name || 'দাগ')}</name>
        <description><![CDATA[${balloonHtml}]]></description>
        <styleUrl>#plotPolygonStyle</styleUrl>
        <Polygon>
          <extrude>1</extrude>
          <altitudeMode>clampToGround</altitudeMode>
          <outerBoundaryIs>
            <LinearRing>
              <coordinates>${coordsStr}</coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
      </Placemark>
`;

          // Centroid Daag Number Pin
          if (opts.includeCentroidPins) {
            kml += `      <Placemark>
        <name>${escapeXml(plot.name || '')}</name>
        <description><![CDATA[${balloonHtml}]]></description>
        <styleUrl>#centroidPinStyle</styleUrl>
        <Point>
          <altitudeMode>clampToGround</altitudeMode>
          <coordinates>${centroidGPS.lng.toFixed(7)},${centroidGPS.lat.toFixed(7)},0</coordinates>
        </Point>
      </Placemark>
`;
          }
        });

        kml += `    </Folder>\n`;
      }

      kml += `  </Document>
</kml>`;
      return kml;
    },

    /**
     * Convert Image Source (ImageElement or Canvas) to optimized high-res JPEG Blob
     */
    extractImageBlob: function(activeMap, quality = 0.92) {
      return new Promise((resolve) => {
        if (!activeMap) return resolve(null);
        const source = activeMap.filteredCanvas || activeMap.highResCanvas || activeMap.imageObj;
        if (!source) return resolve(null);

        try {
          const nw = source.naturalWidth || source.width || 1600;
          const nh = source.naturalHeight || source.height || 1200;

          // Limit dimension to 3072px for smooth mobile Google Earth rendering
          const maxDim = 3072;
          let tw = nw;
          let th = nh;
          if (Math.max(tw, th) > maxDim) {
            const ratio = maxDim / Math.max(tw, th);
            tw = Math.round(tw * ratio);
            th = Math.round(th * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = tw;
          canvas.height = th;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(source, 0, 0, tw, th);

          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', quality);
        } catch (e) {
          console.warn('Image blob extraction failed:', e);
          resolve(null);
        }
      });
    },

    /**
     * Master Google Earth KMZ Generator
     * Packages doc.kml and files/mouza.jpg into a standalone .kmz archive
     */
    generateKMZ: async function(plots, activeMap, originGPS, anchorWorld, options = {}, onProgress = null) {
      if (typeof window.JSZip === 'undefined') {
        throw new Error('JSZip লাইব্রেরি লোড হয়নি। দয়া করে পেজটি রিফ্রেশ করুন।');
      }

      const zip = new window.JSZip();
      const opts = Object.assign({
        fileName: 'mouza_survey_kmz.kmz',
        includeOverlay: true,
        overlayOpacity: 0.85,
        imageQuality: 0.85
      }, options);

      let imageBlob = null;
      let overlayImagePath = null;

      if (opts.includeOverlay && activeMap && activeMap.loaded) {
        if (onProgress) onProgress(15, 'মৌজা ম্যাপ অপটিমাইজ করা হচ্ছে...');
        imageBlob = await this.extractImageBlob(activeMap, opts.imageQuality);
        if (imageBlob) {
          zip.file('files/mouza.jpg', imageBlob);
          overlayImagePath = 'files/mouza.jpg';
        }
      }

      if (onProgress) onProgress(45, 'গুগল ম্যাপ KML জিও-কোঅর্ডিনেট তৈরি হচ্ছে...');
      const kmlOptions = Object.assign({}, opts, {
        overlayImagePath: overlayImagePath,
        includeOverlay: !!overlayImagePath
      });

      const kmlContent = this.generateKML(plots, activeMap, originGPS, anchorWorld, kmlOptions);
      zip.file('doc.kml', kmlContent);

      if (onProgress) onProgress(70, 'KMZ প্যাকেজ কম্প্রেস করা হচ্ছে...');
      const kmzBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      }, (metadata) => {
        if (onProgress) {
          const pct = Math.round(70 + (metadata.percent * 0.28));
          onProgress(pct, `প্যাকেজিং হচ্ছে: ${metadata.percent.toFixed(0)}%`);
        }
      });

      if (onProgress) onProgress(100, 'ডাউনলোড সম্পূর্ণ!');
      this.downloadFile(kmzBlob, opts.fileName, 'application/vnd.google-earth.kmz');
      return kmzBlob;
    }
  };

  global.LSCAD = global.LSCAD || {};
  global.LSCAD.Exporters = Exporters;

})(typeof window !== 'undefined' ? window : this);
