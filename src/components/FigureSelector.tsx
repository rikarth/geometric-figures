import React from 'react';
import { FigureCategory, FigureDefinition, FigureId } from '../types/geometry';
import {
  Triangle,
  Square,
  Circle,
  Hexagon,
  Box,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface FigureSelectorProps {
  figures: FigureDefinition[];
  currentFigureId: FigureId;
  onSelectFigure: (id: FigureId) => void;
  activeCategory: FigureCategory;
  onSelectCategory: (category: FigureCategory) => void;
}

const CATEGORIES: { id: FigureCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'triangles', label: 'Triangles', icon: <Triangle className="w-4 h-4" /> },
  { id: 'quadrilaterals', label: 'Quadrilaterals', icon: <Square className="w-4 h-4" /> },
  { id: 'curved', label: 'Curved', icon: <Circle className="w-4 h-4" /> },
  { id: 'polygons', label: 'Polygons', icon: <Hexagon className="w-4 h-4" /> },
  { id: '3d', label: '3D Forms', icon: <Box className="w-4 h-4" /> },
];

export const FigureSelector: React.FC<FigureSelectorProps> = ({
  figures,
  currentFigureId,
  onSelectFigure,
  activeCategory,
  onSelectCategory,
}) => {
  const filteredFigures = figures.filter((f) => f.category === activeCategory);

  return (
    <div className="flex flex-col gap-3">
      {/* Category Tabs (Interactive Segmented Control) */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Figures Grid in Active Category */}
      <div className="grid grid-cols-2 gap-2">
        {filteredFigures.map((fig) => {
          const isSelected = fig.id === currentFigureId;
          return (
            <button
              key={fig.id}
              onClick={() => onSelectFigure(fig.id)}
              className={`flex flex-col text-left p-2.5 rounded-lg border transition-all text-xs ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 text-slate-900 ring-1 ring-blue-500/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-slate-900 truncate">{fig.name}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal">
                {fig.shortDesc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
