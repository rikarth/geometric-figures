export interface ExportOptions {
  scale?: number;
  filename?: string;
  transparentBg?: boolean;
}

/**
 * Downloads the SVG as an SVG vector file
 */
export function downloadSvg(svgElement: SVGSVGElement, filename = 'geometric-figure.svg'): void {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);

  // Add namespaces if missing
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  // Prepend XML declaration
  const xmlHeader = '<?xml version="1.0" standalone="no"?>\r\n';
  const blob = new Blob([xmlHeader + source], { type: 'image/svg+xml;charset=utf-8' });
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
 * Converts the SVG element into a PNG blob with custom scale (e.g. 2x, 3x for crisp output)
 */
export async function svgToPngBlob(
  svgElement: SVGSVGElement,
  scale = 2,
  transparentBg = false,
  bgColor = '#ffffff'
): Promise<Blob> {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);

  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Get viewBox or bounding dimensions
  const viewBox = svgElement.viewBox.baseVal;
  const width = (viewBox && viewBox.width > 0 ? viewBox.width : svgElement.clientWidth) || 800;
  const height = (viewBox && viewBox.height > 0 ? viewBox.height : svgElement.clientHeight) || 600;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create canvas 2D rendering context');
  }

  // Fill background if not transparent
  if (!transparentBg) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
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
 * Downloads the figure as a high-resolution PNG image
 */
export async function downloadPng(
  svgElement: SVGSVGElement,
  filename = 'geometric-figure.png',
  scale = 2,
  transparentBg = false,
  bgColor = '#ffffff'
): Promise<void> {
  const blob = await svgToPngBlob(svgElement, scale, transparentBg, bgColor);
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
 * Copies the figure as PNG to the user's system clipboard
 */
export async function copyToClipboard(
  svgElement: SVGSVGElement,
  scale = 2,
  transparentBg = false,
  bgColor = '#ffffff'
): Promise<boolean> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error('Clipboard API not supported in this browser environment');
  }

  const blob = await svgToPngBlob(svgElement, scale, transparentBg, bgColor);
  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob,
    }),
  ]);
  return true;
}
