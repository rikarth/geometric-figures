import React, { useState } from 'react';
import { Download, Copy, Check, X, FileImage, Sparkles } from 'lucide-react';
import { downloadPng, downloadSvg, copyToClipboard } from '../utils/svgExport';
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
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const sanitizedName = figureName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const getSvgElement = (): SVGSVGElement | null => {
    return document.getElementById('geometric-canvas-svg') as SVGSVGElement | null;
  };

  const handleDownloadPng = async () => {
    const svg = getSvgElement();
    if (!svg) return;
    try {
      setIsExporting(true);
      await downloadPng(
        svg,
        `${sanitizedName}_${scale}x.png`,
        scale,
        transparentBg,
        theme.canvasBg
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
    downloadSvg(svg, `${sanitizedName}.svg`);
  };

  const handleCopyToClipboard = async () => {
    const svg = getSvgElement();
    if (!svg) return;
    try {
      setIsExporting(true);
      await copyToClipboard(svg, scale, transparentBg, theme.canvasBg);
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
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Save Figure Image</h3>
            <p className="text-xs text-slate-500">Export high-resolution raster or vector format</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Options */}
        <div className="p-5 flex flex-col gap-4">
          {/* Resolution / Scale Option */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-700">PNG Resolution</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { s: 1, label: '1x (Standard)', desc: 'Web preview' },
                { s: 2, label: '2x (High-Res)', desc: 'Retina & Docs' },
                { s: 4, label: '4x (Ultra-HD)', desc: 'Print & Posters' },
              ].map((opt) => (
                <button
                  key={opt.s}
                  onClick={() => setScale(opt.s)}
                  className={`flex flex-col items-center justify-center py-2 px-2 rounded-lg border text-xs transition-all ${
                    scale === opt.s
                      ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background Transparency */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <div>
              <p className="text-xs font-medium text-slate-800">Transparent Background</p>
              <p className="text-[11px] text-slate-500">Remove canvas color &amp; grid from PNG</p>
            </div>
            <input
              type="checkbox"
              id="trans-toggle"
              checked={transparentBg}
              onChange={(e) => setTransparentBg(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG Image ({scale}x)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyToClipboard}
                disabled={isExporting}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Image!' : 'Copy to Clipboard'}</span>
              </button>

              <button
                onClick={handleDownloadSvg}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition-colors"
              >
                <FileImage className="w-3.5 h-3.5 text-blue-600" />
                <span>Save Vector SVG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
          Includes all currently visible parameters and dimension annotations.
        </div>
      </div>
    </div>
  );
};
