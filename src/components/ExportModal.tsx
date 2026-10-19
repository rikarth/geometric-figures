import React, { useState, useEffect, useMemo } from 'react';
import { Download, Copy, Check, X, FileImage, Crop, Maximize2, Sparkles, Layers } from 'lucide-react';
import {
  downloadPng,
  downloadSvg,
  copyToClipboard,
  prepareExportSvgString,
  getFigureBoundingBox,
  ExportOptions,
} from '../utils/svgExport';
import { ThemeConfig } from '../types/geometry';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  figureName: string;
  theme: ThemeConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  figureName,
  theme,
}) => {
  const [scale, setScale] = useState<number>(2);
  const [transparentBg, setTransparentBg] = useState<boolean>(false);
  const [trim, setTrim] = useState<boolean>(true);
  const [padding, setPadding] = useState<number>(24);
  const [includeGrid, setIncludeGrid] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [previewSvg, setPreviewSvg] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const sanitizedName = figureName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const getSvgElement = (): SVGSVGElement | null => {
    return document.getElementById('geometric-canvas-svg') as SVGSVGElement | null;
  };

  // Re-generate preview SVG string whenever settings or modal state change
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const svg = getSvgElement();
      if (!svg) return;

      try {
        const { svgString, width, height } = prepareExportSvgString(svg, {
          trim,
          padding,
          transparentBg,
          bgColor: theme.canvasBg,
          includeGrid,
        });

        setPreviewSvg(svgString);
        setDimensions({ width, height });
      } catch (err) {
        console.error('Failed to generate export preview:', err);
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [isOpen, trim, padding, transparentBg, includeGrid, theme.canvasBg]);

  if (!isOpen) return null;

  const currentOptions: ExportOptions = {
    scale,
    transparentBg,
    bgColor: theme.canvasBg,
    trim,
    padding,
    includeGrid,
  };

  const handleDownloadPng = async () => {
    const svg = getSvgElement();
    if (!svg) return;
    try {
      setIsExporting(true);
      await downloadPng(
        svg,
        `${sanitizedName}_${scale}x.png`,
        currentOptions
      );
    } catch (err) {
      console.error('PNG export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSvg = () => {
    const svg = getSvgElement();
    if (!svg) return;
    downloadSvg(svg, `${sanitizedName}.svg`, currentOptions);
  };

  const handleCopyToClipboard = async () => {
    const svg = getSvgElement();
    if (!svg) return;
    try {
      setIsExporting(true);
      await copyToClipboard(svg, currentOptions);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Clipboard copy failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Export Figure Image</h3>
            <p className="text-xs text-slate-500">Save crisp, tight image with custom padding</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Visual Thumbnail Preview */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-blue-600" />
                <span>Export Framing Preview</span>
              </span>
              {dimensions && (
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {Math.round(dimensions.width * scale)} × {Math.round(dimensions.height * scale)} px
                  {trim && <span className="text-blue-600 ml-1 font-semibold">· Trimmed</span>}
                </span>
              )}
            </div>

            {/* Preview Box */}
            <div
              className="relative w-full h-44 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden p-3 transition-colors"
              style={{
                backgroundColor: transparentBg ? 'transparent' : theme.canvasBg,
                backgroundImage: transparentBg
                  ? 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)'
                  : undefined,
                backgroundSize: transparentBg ? '12px 12px' : undefined,
              }}
            >
              {previewSvg ? (
                <div
                  className="w-full h-full flex items-center justify-center drop-shadow-xs"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                  }}
                />
              ) : (
                <span className="text-xs text-slate-400">Loading figure preview...</span>
              )}

              {/* Snug Trim indicator badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-white/90 backdrop-blur-xs rounded text-[10px] font-medium text-slate-600 border border-slate-200 shadow-2xs">
                {trim ? (
                  <>
                    <Crop className="w-3 h-3 text-blue-600" />
                    <span>Snug Fit (+{padding}px)</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 h-3 text-slate-400" />
                    <span>Full Canvas</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Trim / Crop Controls */}
          <div className="p-3.5 rounded-lg border border-blue-100 bg-blue-50/40 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <label
                  htmlFor="trim-toggle"
                  className="text-xs font-semibold text-slate-900 cursor-pointer flex items-center gap-1.5"
                >
                  <Crop className="w-3.5 h-3.5 text-blue-600" />
                  <span>Trim whitespace / Ajustar espais buits</span>
                </label>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  Elimina l&apos;espai sobrant per ajustar la imatge al voltant de la figura, cotes i dades.
                </p>
              </div>
              <input
                type="checkbox"
                id="trim-toggle"
                checked={trim}
                onChange={(e) => setTrim(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer mt-0.5 shrink-0"
              />
            </div>

            {/* Padding presets (when trim is active) */}
            {trim && (
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-blue-100">
                <span className="text-[11px] font-medium text-slate-600 shrink-0">
                  Marge / Padding:
                </span>
                <div className="grid grid-cols-3 gap-1.5 w-full max-w-[280px]">
                  {[
                    { val: 12, label: 'Tight', desc: '12 px' },
                    { val: 24, label: 'Balanced', desc: '24 px' },
                    { val: 40, label: 'Spacious', desc: '40 px' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => setPadding(p.val)}
                      className={`flex flex-col items-center py-1 px-1.5 rounded border text-[11px] transition-all ${
                        padding === p.val
                          ? 'bg-blue-600 border-blue-600 text-white font-medium shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{p.label}</span>
                      <span className={`text-[9px] ${padding === p.val ? 'text-blue-100' : 'text-slate-400'}`}>
                        {p.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resolution / Scale Option */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-700">PNG Resolution</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { s: 1, label: '1x (Standard)', desc: 'Screen preview' },
                { s: 2, label: '2x (High-Res)', desc: 'Docs & Slides' },
                { s: 4, label: '4x (Ultra-HD)', desc: 'Print & Posters' },
              ].map((opt) => (
                <button
                  key={opt.s}
                  onClick={() => setScale(opt.s)}
                  className={`flex flex-col items-center justify-center py-2 px-2 rounded-lg border text-xs transition-all ${
                    scale === opt.s
                      ? 'bg-slate-900 border-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`text-[10px] font-normal ${
                      scale === opt.s ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Export Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Background Transparency */}
            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-xs font-medium text-slate-800">Transparent PNG</p>
                <p className="text-[10px] text-slate-500">No background color</p>
              </div>
              <input
                type="checkbox"
                checked={transparentBg}
                onChange={(e) => setTransparentBg(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
            </label>

            {/* Include Grid */}
            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-xs font-medium text-slate-800">Include Canvas Grid</p>
                <p className="text-[10px] text-slate-500">Render grid in output</p>
              </div>
              <input
                type="checkbox"
                checked={includeGrid}
                onChange={(e) => setIncludeGrid(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                Download PNG Image ({scale}x
                {dimensions ? ` · ${Math.round(dimensions.width * scale)}×${Math.round(dimensions.height * scale)}px` : ''})
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyToClipboard}
                disabled={isExporting}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Image!' : 'Copy to Clipboard'}</span>
              </button>

              <button
                onClick={handleDownloadSvg}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                <FileImage className="w-3.5 h-3.5 text-blue-600" />
                <span>Save Vector SVG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center shrink-0">
          Tight trim ensures no wasted whitespace around figures, dimensions, and badges.
        </div>
      </div>
    </div>
  );
};
