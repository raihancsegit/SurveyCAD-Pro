/**
 * Mouza Map Raster Image Processing Filters
 * High-performance pixel manipulation for scanned cadastral maps
 */

export interface ImageFilterOptions {
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  threshold: number;  // 0 to 255 (0 = disabled)
  invert: boolean;
}

/**
 * Apply Binarization (Thresholding), Brightness, Contrast to an ImageData buffer
 */
export function applyMouzaFilters(
  imageData: ImageData,
  options: ImageFilterOptions
): ImageData {
  const data = imageData.data;
  const len = data.length;

  const brightness = options.brightness * 2.55;
  const contrastFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
  const threshold = options.threshold;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Brightness
    if (brightness !== 0) {
      r += brightness;
      g += brightness;
      b += brightness;
    }

    // 2. Contrast
    if (options.contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // 3. Grayscale
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // 4. Threshold (Binarization)
    if (threshold > 0) {
      gray = gray < threshold ? 0 : 255;
    }

    // 5. Invert
    if (options.invert) {
      gray = 255 - gray;
    }

    // Clamp to 0-255
    gray = Math.max(0, Math.min(255, gray));

    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  return imageData;
}
