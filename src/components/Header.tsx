import React from 'react';
import { Download } from 'lucide-react';

interface HeaderProps {
  onOpenExport: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenExport, onNavigateSection }) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-xs">
          G
        </div>
        <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
          GeoDraft
        </span>
      </div>

      {/* Zone 2: 4-5 clean single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
        <a
          href="#canvas"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection?.('canvas');
          }}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
        >
          Drafting Canvas
        </a>
        <a
          href="#parameters"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection?.('parameters');
          }}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
        >
          Parameters &amp; Dimensions
        </a>
        <a
          href="#figures"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection?.('figures');
          }}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
        >
          Figures Library
        </a>
        <a
          href="#reference"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection?.('reference');
          }}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
        >
          Formulas Reference
        </a>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save Image</span>
        </button>
      </div>
    </header>
  );
};
