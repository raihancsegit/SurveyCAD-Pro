/**
 * AutoCAD DXF Format Serializer Engine
 * Generates standard Release 12 / 2000 compliant DXF text
 */

import { Point2D } from '../geometry/point';

export interface DXFPlot {
  id: string;
  name: string;
  vertices: Point2D[];
  layer?: string;
}

export interface DXFPillar {
  name: string;
  x: number;
  y: number;
  type?: string;
}

export function generateDXF(
  plots: DXFPlot[],
  pillars: DXFPillar[] = [],
  mouzaTitle: string = 'LAND_SURVEY_CAD'
): string {
  let dxf = '';

  // HEADER SECTION
  dxf += '0\nSECTION\n';
  dxf += '2\nHEADER\n';
  dxf += '9\n$ACADVER\n1\nAC1009\n'; // AutoCAD R12 standard (universally readable)
  dxf += '9\n$PROJECTNAME\n1\n' + mouzaTitle + '\n';
  dxf += '0\nENDSEC\n';

  // TABLES SECTION (Layers)
  dxf += '0\nSECTION\n';
  dxf += '2\nTABLES\n';
  dxf += '0\nTABLE\n2\nLAYER\n70\n2\n';
  dxf += '0\nLAYER\n2\nPLOTS\n70\n0\n62\n5\n6\nCONTINUOUS\n'; // Blue
  dxf += '0\nLAYER\n2\nPILLARS\n70\n0\n62\n1\n6\nCONTINUOUS\n'; // Red
  dxf += '0\nLAYER\n2\nLABELS\n70\n0\n62\n7\n6\nCONTINUOUS\n'; // White
  dxf += '0\nENDTAB\n';
  dxf += '0\nENDSEC\n';

  // ENTITIES SECTION
  dxf += '0\nSECTION\n';
  dxf += '2\nENTITIES\n';

  // 1. Draw Closed Polylines for Plots
  for (const plot of plots) {
    if (!plot.vertices || plot.vertices.length < 2) continue;
    const pts = plot.vertices;
    const n = pts.length;

    dxf += '0\nPOLYLINE\n';
    dxf += '8\nPLOTS\n';
    dxf += '66\n1\n'; // Vertices follow
    dxf += '70\n1\n'; // Flag 1 = Closed Polyline

    for (let i = 0; i < n; i++) {
      dxf += '0\nVERTEX\n';
      dxf += '8\nPLOTS\n';
      dxf += '10\n' + pts[i].x.toFixed(4) + '\n';
      dxf += '20\n' + pts[i].y.toFixed(4) + '\n';
      dxf += '30\n0.0\n';
    }

    dxf += '0\nSEQEND\n';

    // Plot Centroid Label
    let cx = 0, cy = 0;
    pts.forEach(p => { cx += p.x; cy += p.y; });
    cx /= n;
    cy /= n;

    dxf += '0\nTEXT\n';
    dxf += '8\nLABELS\n';
    dxf += '10\n' + cx.toFixed(4) + '\n';
    dxf += '20\n' + cy.toFixed(4) + '\n';
    dxf += '30\n0.0\n';
    dxf += '40\n15.0\n'; // Text Height
    dxf += '1\n' + (plot.name || 'PLOT') + '\n';
  }

  // 2. Draw Pillars as Circles with Markers
  for (const pillar of pillars) {
    dxf += '0\nCIRCLE\n';
    dxf += '8\nPILLARS\n';
    dxf += '10\n' + pillar.x.toFixed(4) + '\n';
    dxf += '20\n' + pillar.y.toFixed(4) + '\n';
    dxf += '30\n0.0\n';
    dxf += '40\n6.0\n'; // Radius

    dxf += '0\nTEXT\n';
    dxf += '8\nLABELS\n';
    dxf += '10\n' + (pillar.x + 8).toFixed(4) + '\n';
    dxf += '20\n' + (pillar.y + 8).toFixed(4) + '\n';
    dxf += '30\n0.0\n';
    dxf += '40\n10.0\n';
    dxf += '1\n' + (pillar.name || 'PILLAR') + '\n';
  }

  dxf += '0\nENDSEC\n';
  dxf += '0\nEOF\n';

  return dxf;
}
