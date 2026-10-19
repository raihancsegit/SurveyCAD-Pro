/**
 * Land Survey CAD - Export & Project Storage Engine
 * AutoCAD DXF, Google Earth KML & Native .lscad project serializer
 */

(function(global) {
  'use strict';

  const Exporters = {
    /**
     * Download text data as a client-side file
     */
    downloadFile: function(content, fileName, mimeType) {
      const blob = new Blob([content], { type: mimeType || 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
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
     * Generate standard Google Earth KML XML
     */
    generateKML: function(plots, originGPS) {
      originGPS = originGPS || { lat: 23.3167, lng: 90.7500 };
      const linksPerDegreeLat = 550000;
      const linksPerDegreeLng = 505000;

      let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Land Survey Mouza Plots</name>
    <description>Exported from Land Survey CAD Platform</description>
    <Style id="plotStyle">
      <LineStyle><color>ff00aaff</color><width>2.5</width></LineStyle>
      <PolyStyle><color>4d00aaff</color></PolyStyle>
    </Style>
`;

      (plots || []).forEach(plot => {
        if (!plot.vertices || plot.vertices.length < 3) return;
        let coordsStr = '';
        const pts = [...plot.vertices, plot.vertices[0]];

        pts.forEach(pt => {
          const lat = originGPS.lat + (pt.y / linksPerDegreeLat);
          const lng = originGPS.lng + (pt.x / linksPerDegreeLng);
          coordsStr += `${lng.toFixed(7)},${lat.toFixed(7)},0 `;
        });

        kml += `    <Placemark>
      <name>${plot.name || 'দাগ'}</name>
      <description>মৌজা জরিপ দাগ বাউন্ডারি</description>
      <styleUrl>#plotStyle</styleUrl>
      <Polygon>
        <extrude>1</extrude>
        <altitudeMode>clampToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coordsStr.trim()}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
`;
      });

      kml += `  </Document>
</kml>`;
      return kml;
    }
  };

  global.LSCAD = global.LSCAD || {};
  global.LSCAD.Exporters = Exporters;

})(typeof window !== 'undefined' ? window : this);
