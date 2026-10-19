/**
 * Two-Point Cadastral Map Scale Calibration
 */

export interface CalibrationPoint {
  pixelX: number;
  pixelY: number;
}

export interface CalibrationResult {
  pixelDistance: number;
  groundDistance: number;
  groundUnit: 'link' | 'feet' | 'feet_inch' | 'chain' | 'meter';
  scaleFactor: number; // Ground units per pixel
  feetPerPixel: number;
  linksPerPixel: number;
  metersPerPixel: number;
  ratioAgainst16Inch: number;
}

export function computeTwoPointCalibration(
  p1: CalibrationPoint,
  p2: CalibrationPoint,
  groundDistance: number,
  groundUnit: 'link' | 'feet' | 'feet_inch' | 'chain' | 'meter' = 'link'
): CalibrationResult {
  const dx = p2.pixelX - p1.pixelX;
  const dy = p2.pixelY - p1.pixelY;
  const pixelDistance = Math.sqrt(dx * dx + dy * dy);

  if (pixelDistance <= 0) {
    throw new Error('Points must not be identical');
  }

  let effectiveLinks = groundDistance;
  if (groundUnit === 'chain') {
    effectiveLinks = groundDistance * 100;
  } else if (groundUnit === 'feet' || groundUnit === 'feet_inch') {
    effectiveLinks = groundDistance / 0.66;
  } else if (groundUnit === 'meter') {
    effectiveLinks = (groundDistance * 3.28084) / 0.66;
  }

  const linksPerPixel = effectiveLinks / pixelDistance;
  const feetPerPixel = linksPerPixel * 0.66;
  const metersPerPixel = linksPerPixel * 0.201168;
  const scaleFactor = linksPerPixel;

  // Ratio comparison against 16" = 1 mile (where 1 inch = 500 links)
  const ratioAgainst16Inch = linksPerPixel / 500.0;

  return {
    pixelDistance: Number(pixelDistance.toFixed(2)),
    groundDistance,
    groundUnit,
    scaleFactor: Number(scaleFactor.toFixed(6)),
    feetPerPixel: Number(feetPerPixel.toFixed(6)),
    linksPerPixel: Number(linksPerPixel.toFixed(6)),
    metersPerPixel: Number(metersPerPixel.toFixed(6)),
    ratioAgainst16Inch: Number(ratioAgainst16Inch.toFixed(4))
  };
}
