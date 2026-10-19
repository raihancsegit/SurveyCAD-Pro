/**
 * Google Earth KML Format Serializer
 * Generates standard KML XML with coordinate conversion support
 */

import { Point2D } from '../geometry/point';

export interface KMLPlot {
  name: string;
  description?: string;
  vertices: Point2D[];
}

export interface KMLOriginGPS {
  lat: number;
  lng: number;
}

export function generateKML(
  plots: KMLPlot[],
  origin: KMLOriginGPS = { lat: 23.3167, lng: 90.7500 }, // Default: Faridganj, Chandpur
  linksPerDegreeLat: number = 550000,
  linksPerDegreeLng: number = 505000
): string {
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Land Survey Mouza Plots</name>
    <description>Exported from Land Survey CAD Platform</description>
    <Style id="plotStyle">
      <LineStyle>
        <color>ff00aaff</color>
        <width>2.5</width>
      </LineStyle>
      <PolyStyle>
        <color>4d00aaff</color>
      </PolyStyle>
    </Style>
`;

  for (const plot of plots) {
    if (!plot.vertices || plot.vertices.length < 3) continue;

    let coordsStr = '';
    const pts = [...plot.vertices, plot.vertices[0]]; // Close polygon

    for (const pt of pts) {
      const lat = origin.lat + (pt.y / linksPerDegreeLat);
      const lng = origin.lng + (pt.x / linksPerDegreeLng);
      coordsStr += `${lng.toFixed(7)},${lat.toFixed(7)},0 `;
    }

    kml += `    <Placemark>
      <name>${escapeXml(plot.name || 'দাগ')}</name>
      <description>${escapeXml(plot.description || 'মৌজা জরিপ দাগ বাউন্ডারি')}</description>
      <styleUrl>#plotStyle</styleUrl>
      <Polygon>
        <extrude>1</extrude>
        <altitudeMode>clampToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              ${coordsStr.trim()}
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
`;
  }

  kml += `  </Document>
</kml>`;

  return kml;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
