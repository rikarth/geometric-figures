import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { FigureDefinition, Unit } from '../types/geometry';

interface FormulasReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  figure: FigureDefinition;
  unit: Unit;
}

export const FormulasReferenceModal: React.FC<FormulasReferenceModalProps> = ({
  isOpen,
  onClose,
  figure,
  unit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">{figure.name} Reference</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Definition</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{figure.description}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Geometric Parameters</h4>
            <div className="flex flex-col gap-1.5 divide-y divide-slate-100">
              {figure.parameters.map((p) => (
                <div key={p.id} className="pt-1.5 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 mr-2">{p.symbol}</span>
                    <span className="text-slate-700 font-medium">{p.name}</span>
                  </div>
                  <span className="font-mono text-slate-500 shrink-0">
                    {p.type === 'length' && `${p.value.toFixed(1)} ${unit}`}
                    {p.type === 'angle' && `${p.value.toFixed(1)}°`}
                    {p.type === 'area' && `${p.value.toFixed(1)} ${unit}²`}
                    {p.type === 'volume' && `${p.value.toFixed(1)} ${unit}³`}
                    {p.type === 'count' && p.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
