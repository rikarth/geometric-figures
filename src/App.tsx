import React, { useState, useCallback, useMemo } from 'react';
import {
  FigureCategory,
  FigureDefinition,
  FigureId,
  LabelStyle,
  ThemeId,
  Unit,
} from './types/geometry';
import { INITIAL_FIGURES, recalculateParameters, convertUnit } from './utils/geometryMath';
import { THEMES } from './utils/themes';
import { Header } from './components/Header';
import { FigureSelector } from './components/FigureSelector';
import { ParameterControls } from './components/ParameterControls';
import { FigureRenderer } from './components/FigureRenderer';
import { ExportModal } from './components/ExportModal';
import { FormulasReferenceModal } from './components/FormulasReferenceModal';
import {
  Grid,
  Palette,
  Maximize2,
  Info,
  Download,
  Eye,
  Sliders,
  CheckCircle2,
  Compass,
} from 'lucide-react';

export default function App() {
  const [figures, setFigures] = useState<FigureDefinition[]>(INITIAL_FIGURES);
  const [currentFigureId, setCurrentFigureId] = useState<FigureId>('right_triangle');
  const [activeCategory, setActiveCategory] = useState<FigureCategory>('triangles');
  const [unit, setUnit] = useState<Unit>('cm');
  const [themeId, setThemeId] = useState<ThemeId>('textbook');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [gridType, setGridType] = useState<'lines' | 'dots' | 'none'>('lines');
  const [labelStyle, setLabelStyle] = useState<LabelStyle>('symbol_and_value');
  const [hoveredParamId, setHoveredParamId] = useState<string | null>(null);

  // Modals
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [formulasModalOpen, setFormulasModalOpen] = useState<boolean>(false);

  // Active figure definition
  const currentFigure = useMemo(() => {
    return figures.find((f) => f.id === currentFigureId) || figures[0];
  }, [figures, currentFigureId]);

  const currentTheme = THEMES[themeId];

  // Parameter Change Handler
  const handleParamChange = useCallback((paramId: string, newValue: number) => {
    setFigures((prevFigures) =>
      prevFigures.map((fig) => {
        if (fig.id !== currentFigureId) return fig;

        const updatedParams = fig.parameters.map((p) => {
          if (p.id === paramId) {
            return { ...p, value: Math.max(p.min ?? 0.01, newValue) };
          }
          return p;
        });

        const recomputed = recalculateParameters(fig.id, updatedParams);
        return { ...fig, parameters: recomputed };
      })
    );
  }, [currentFigureId]);

  // Toggle Visibility for a single parameter
  const handleToggleVisibility = useCallback((paramId: string) => {
    setFigures((prevFigures) =>
      prevFigures.map((fig) => {
        if (fig.id !== currentFigureId) return fig;
        return {
          ...fig,
          parameters: fig.parameters.map((p) =>
            p.id === paramId ? { ...p, isVisible: !p.isVisible } : p
          ),
        };
      })
    );
  }, [currentFigureId]);

  // Bulk set visibility
  const handleSetAllVisibility = useCallback((visible: boolean) => {
    setFigures((prevFigures) =>
      prevFigures.map((fig) => {
        if (fig.id !== currentFigureId) return fig;
        return {
          ...fig,
          parameters: fig.parameters.map((p) => ({ ...p, isVisible: visible })),
        };
      })
    );
  }, [currentFigureId]);

  // Unit Change Handler
  const handleUnitChange = useCallback((newUnit: Unit, convertValues: boolean) => {
    if (newUnit === unit) return;

    if (convertValues) {
      setFigures((prevFigures) =>
        prevFigures.map((fig) => ({
          ...fig,
          parameters: fig.parameters.map((p) => ({
            ...p,
            value: convertUnit(p.value, unit, newUnit, p.type),
          })),
        }))
      );
    }
    setUnit(newUnit);
  }, [unit]);

  // Reset current figure parameters to factory default
  const handleResetDefaults = useCallback(() => {
    const defaultDef = INITIAL_FIGURES.find((f) => f.id === currentFigureId);
    if (!defaultDef) return;

    setFigures((prevFigures) =>
      prevFigures.map((fig) => (fig.id === currentFigureId ? { ...defaultDef } : fig))
    );
  }, [currentFigureId]);

  // Switch figure
  const handleSelectFigure = (id: FigureId) => {
    setCurrentFigureId(id);
    const target = INITIAL_FIGURES.find((f) => f.id === id);
    if (target) {
      setActiveCategory(target.category);
    }
  };

  const visibleParamsCount = currentFigure.parameters.filter((p) => p.isVisible).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Top Bar Header */}
      <Header
        onOpenExport={() => setExportModalOpen(true)}
        onNavigateSection={(sec) => {
          if (sec === 'reference') setFormulasModalOpen(true);
        }}
      />

      {/* Main Two-Zone Studio Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1720px] w-full mx-auto p-4 md:p-6 gap-6">
        {/* Left Column: Figures Selection & Parameters Deck */}
        <section
          id="parameters"
          className="w-full lg:w-[420px] shrink-0 flex flex-col gap-5 overflow-y-auto pr-1"
        >
          {/* Section 1: Figure Picker */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Figure Type
                </h2>
              </div>
              <button
                onClick={() => setFormulasModalOpen(true)}
                className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Reference</span>
              </button>
            </div>

            <FigureSelector
              figures={figures}
              currentFigureId={currentFigureId}
              onSelectFigure={handleSelectFigure}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </div>

          {/* Section 2: Parameters & Visibility Configuration */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <ParameterControls
              parameters={currentFigure.parameters}
              unit={unit}
              onUnitChange={handleUnitChange}
              onParamChange={handleParamChange}
              onToggleVisibility={handleToggleVisibility}
              onSetAllVisibility={handleSetAllVisibility}
              labelStyle={labelStyle}
              onLabelStyleChange={setLabelStyle}
              hoveredParamId={hoveredParamId}
              onHoverParam={setHoveredParamId}
              onResetDefaults={handleResetDefaults}
            />
          </div>
        </section>

        {/* Right Column: Drafting Canvas & Live Preview Stage */}
        <section
          id="canvas"
          className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden min-h-[520px]"
        >
          {/* Canvas Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
            {/* Figure Title & Breadcrumb */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900">{currentFigure.name}</h1>
                <span className="text-[11px] font-mono text-slate-500">
                  ({visibleParamsCount} visible dimensions)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">{currentFigure.shortDesc}</p>
            </div>

            {/* Canvas Customization Controls */}
            <div className="flex items-center gap-2">
              {/* Grid Toggle */}
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => {
                    setShowGrid(true);
                    setGridType('lines');
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    showGrid && gridType === 'lines' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Square Grid"
                >
                  Grid
                </button>
                <button
                  onClick={() => {
                    setShowGrid(true);
                    setGridType('dots');
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    showGrid && gridType === 'dots' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Dot Matrix"
                >
                  Dots
                </button>
                <button
                  onClick={() => {
                    setShowGrid(false);
                    setGridType('none');
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    !showGrid ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Blank Canvas"
                >
                  Plain
                </button>
              </div>

              {/* Theme Picker */}
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
                {(['textbook', 'blueprint', 'dark', 'monochrome'] as ThemeId[]).map((tId) => {
                  const t = THEMES[tId];
                  const isSel = themeId === tId;
                  return (
                    <button
                      key={tId}
                      onClick={() => setThemeId(tId)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                        isSel ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={t.name}
                    >
                      {tId === 'textbook' && 'Textbook'}
                      {tId === 'blueprint' && 'Blueprint'}
                      {tId === 'dark' && 'Dark'}
                      {tId === 'monochrome' && 'Mono'}
                    </button>
                  );
                })}
              </div>

              {/* Save Image Action Button */}
              <button
                onClick={() => setExportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Image</span>
              </button>
            </div>
          </div>

          {/* Large Interactive Figure Canvas Area */}
          <div className="flex-1 relative flex items-center justify-center p-4">
            <FigureRenderer
              figure={currentFigure}
              unit={unit}
              theme={currentTheme}
              showGrid={showGrid}
              gridType={gridType}
              labelStyle={labelStyle}
              hoveredParamId={hoveredParamId}
              onHoverParam={setHoveredParamId}
              onToggleParamVisibility={handleToggleVisibility}
            />
          </div>

          {/* Canvas Footer Status & Instruction Bar */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-200 bg-slate-50/80 text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                True-to-Scale Vector Rendering
              </span>
              <span>·</span>
              <span>Units: <strong className="text-slate-800 font-mono">{unit}</strong></span>
              <span>·</span>
              <span>Click any dimension or eye icon to toggle visibility</span>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setExportModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                Export PNG / SVG
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Save Image / Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        figureName={currentFigure.name}
        theme={currentTheme}
      />

      {/* Mathematical Reference Modal */}
      <FormulasReferenceModal
        isOpen={formulasModalOpen}
        onClose={() => setFormulasModalOpen(false)}
        figure={currentFigure}
        unit={unit}
      />
    </div>
  );
}
