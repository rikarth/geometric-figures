/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExportOptions {
  scale?: number;
  filename?: string;
  transparentBg?: boolean;
  bgColor?: string;
  trim?: boolean; // Trim whitespace around figure (default: true)
  padding?: number; // Padding around trimmed figure in px (default: 24)
  includeGrid?: boolean; // Whether to include grid in export (default: false)
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculates the bounding box of the geometric figure and annotations,
 * excluding the infinite background grid.
 */
export function getFigureBoundingBox(
  svgElement: SVGSVGElement,
  padding = 24
): BoundingBox {
  // Method 1: Check the designated figure content root group
  const contentRoot = svgElement.querySelector('#figure-content-root') as SVGGraphicsElement | null;
  if (contentRoot && typeof contentRoot.getBBox === 'function') {
    try {
      const bbox = contentRoot.getBBox();
      if (bbox.width > 0 && bbox.height > 0 && isFinite(bbox.x) && isFinite(bbox.y)) {
        return {
          x: Math.round(bbox.x - padding),
          y: Math.round(bbox.y - padding),
          width: Math.round(bbox.width + padding * 2),
          height: Math.round(bbox.height + padding * 2),
        };
      }
    } catch (e) {
      console.warn('Could not read BBox from #figure-content-root:', e);
    }
  }

  // Method 2: Iterate over child elements, excluding defs and background grid
  try {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let foundAny = false;

    const children = Array.from(svgElement.children);
    for (const child of children) {
      const tag = child.tagName.toLowerCase();
      if (
        tag === 'defs' ||
        tag === 'pattern' ||
        tag === 'marker' ||
        child.id === 'figure-grid-bg' ||
        child.classList.contains('figure-grid-bg')
      ) {
        continue;
      }

      if (typeof (child as SVGGraphicsElement).getBBox === 'function') {
        try {
          const b = (child as SVGGraphicsElement).getBBox();
          if (b.width > 0 && b.height > 0 && isFinite(b.x) && isFinite(b.y)) {
            minX = Math.min(minX, b.x);
            minY = Math.min(minY, b.y);
            maxX = Math.max(maxX, b.x + b.width);
            maxY = Math.max(maxY, b.y + b.height);
            foundAny = true;
          }
        } catch {
          // ignore individual element bbox issues
        }
      }
    }

    if (foundAny && minX < maxX && minY < maxY) {
      return {
        x: Math.round(minX - padding),
        y: Math.round(minY - padding),
        width: Math.round(maxX - minX + padding * 2),
        height: Math.round(maxY - minY + padding * 2),
      };
    }
  } catch (e) {
    console.warn('Fallback getBBox calculation failed:', e);
  }

  // Method 3: Fallback to existing viewBox or client dimensions
  const vb = svgElement.viewBox.baseVal;
  if (vb && vb.width > 0 && vb.height > 0) {
    return {
      x: Math.round(vb.x),
      y: Math.round(vb.y),
      width: Math.round(vb.width),
      height: Math.round(vb.height),
    };
  }

  return {
    x: 0,
    y: 0,
    width: svgElement.clientWidth || 500,
    height: svgElement.clientHeight || 450,
  };
}

/**
 * Prepares a cleaned, trimmed, self-contained SVG string and its exact dimensions
 */
export function prepareExportSvgString(
  svgElement: SVGSVGElement,
  options: ExportOptions = {}
): { svgString: string; width: number; height: number; viewBox: string } {
  const {
    trim = true,
    padding = 24,
    transparentBg = false,
    bgColor = '#ffffff',
    includeGrid = false,
  } = options;

  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  // Determine export viewBox and dimensions
  let bounds: BoundingBox;
  if (trim) {
    bounds = getFigureBoundingBox(svgElement, padding);
  } else {
    const vb = svgElement.viewBox.baseVal;
    bounds = {
      x: vb ? vb.x : 0,
      y: vb ? vb.y : 0,
      width: vb && vb.width > 0 ? vb.width : (svgElement.clientWidth || 500),
      height: vb && vb.height > 0 ? vb.height : (svgElement.clientHeight || 450),
    };
  }

  const { x, y, width, height } = bounds;
  const viewBoxStr = `${x} ${y} ${width} ${height}`;
  clone.setAttribute('viewBox', viewBoxStr);
  clone.setAttribute('width', `${width}`);
  clone.setAttribute('height', `${height}`);

  // Handle grid & background
  const gridEl = clone.querySelector('#figure-grid-bg, .figure-grid-bg');
  if (gridEl) {
    if (!includeGrid || transparentBg) {
      gridEl.remove();
    } else {
      // Adjust grid rect to cover the export viewBox exactly
      gridEl.setAttribute('x', `${x}`);
      gridEl.setAttribute('y', `${y}`);
      gridEl.setAttribute('width', `${width}`);
      gridEl.setAttribute('height', `${height}`);
    }
  }

  // If not transparent background, ensure a solid canvas background rect is placed behind all shapes
  if (!transparentBg) {
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', `${x}`);
    bgRect.setAttribute('y', `${y}`);
    bgRect.setAttribute('width', `${width}`);
    bgRect.setAttribute('height', `${height}`);
    bgRect.setAttribute('fill', bgColor);

    // Insert behind everything, right after defs if present
    const defs = clone.querySelector('defs');
    if (defs && defs.nextSibling) {
      clone.insertBefore(bgRect, defs.nextSibling);
    } else {
      clone.insertBefore(bgRect, clone.firstChild);
    }
  }

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(clone);

  // Add namespaces if missing
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  return {
    svgString: source,
    width,
    height,
    viewBox: viewBoxStr,
  };
}

/**
 * Downloads the SVG as a vector file with optional trimming
 */
export function downloadSvg(
  svgElement: SVGSVGElement,
  filename = 'geometric-figure.svg',
  options: ExportOptions = {}
): void {
  const { svgString } = prepareExportSvgString(svgElement, options);

  // Prepend XML declaration
  const xmlHeader = '<?xml version="1.0" standalone="no"?>\r\n';
  const blob = new Blob([xmlHeader + svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

/**
 * Normalizes arguments for functions that accept either an options object or legacy parameters
 */
function normalizeExportOptions(
  optionsOrScale?: ExportOptions | number,
  transparentBg = false,
  bgColor = '#ffffff'
): ExportOptions {
  if (typeof optionsOrScale === 'number') {
    return {
      scale: optionsOrScale,
      transparentBg,
      bgColor,
      trim: true,
      padding: 24,
    };
  }
  return {
    scale: 2,
    transparentBg: false,
    bgColor: '#ffffff',
    trim: true,
    padding: 24,
    ...optionsOrScale,
  };
}

/**
 * Converts the SVG element into a PNG blob with crisp scaling and snug whitespace trimming
 */
export async function svgToPngBlob(
  svgElement: SVGSVGElement,
  optionsOrScale?: ExportOptions | number,
  legacyTransparentBg = false,
  legacyBgColor = '#ffffff'
): Promise<Blob> {
  const options = normalizeExportOptions(optionsOrScale, legacyTransparentBg, legacyBgColor);
  const scale = options.scale ?? 2;
  const transparentBg = options.transparentBg ?? false;
  const bgColor = options.bgColor ?? '#ffffff';

  const { svgString, width, height } = prepareExportSvgString(svgElement, options);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create canvas 2D rendering context');
  }

  // Fill canvas background if not transparent
  if (!transparentBg) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const URLObj = window.URL || window.webkitURL || window;
  const blobURL = URLObj.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URLObj.revokeObjectURL(blobURL);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png');
    };

    img.onerror = (e) => {
      URLObj.revokeObjectURL(blobURL);
      reject(new Error(`Failed to load SVG for rasterization: ${e}`));
    };

    img.src = blobURL;
  });
}

/**
 * Downloads the figure as a high-resolution PNG image with snug trimming
 */
export async function downloadPng(
  svgElement: SVGSVGElement,
  filename = 'geometric-figure.png',
  optionsOrScale?: ExportOptions | number,
  legacyTransparentBg = false,
  legacyBgColor = '#ffffff'
): Promise<void> {
  const options = normalizeExportOptions(optionsOrScale, legacyTransparentBg, legacyBgColor);
  const blob = await svgToPngBlob(svgElement, options);
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

/**
 * Copies the figure as PNG to the user's system clipboard with snug trimming
 */
export async function copyToClipboard(
  svgElement: SVGSVGElement,
  optionsOrScale?: ExportOptions | number,
  legacyTransparentBg = false,
  legacyBgColor = '#ffffff'
): Promise<boolean> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error('Clipboard API not supported in this browser environment');
  }

  const options = normalizeExportOptions(optionsOrScale, legacyTransparentBg, legacyBgColor);
  const blob = await svgToPngBlob(svgElement, options);
  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob,
    }),
  ]);
  return true;
}
