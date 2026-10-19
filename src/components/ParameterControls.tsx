import React, { useState, useEffect } from 'react';
import { Parameter, Unit, LabelStyle } from '../types/geometry';
import {
  Eye,
  EyeOff,
  RotateCcw,
  Hash,
} from 'lucide-react';

interface ParameterControlsProps {
  parameters: Parameter[];
  unit: Unit;
  onUnitChange: (newUnit: Unit, convertValues: boolean) => void;
  onParamChange: (id: string, value: number) => void;
  onToggleVisibility: (id: string) => void;
  onSetAllVisibility: (visible: boolean) => void;
  labelStyle: LabelStyle;
  onLabelStyleChange: (style: LabelStyle) => void;
  hoveredParamId: string | null;
  onHoverParam: (id: string | null) => void;
  onResetDefaults: () => void;
  roundZeroDecimals: boolean;
  onToggleRoundZeroDecimals: (round: boolean) => void;
}

const AVAILABLE_UNITS: { id: Unit; label: string; desc: string }[] = [
  { id: 'cm', label: 'cm', desc: 'Centimeters' },
  { id: 'mm', label: 'mm', desc: 'Millimeters' },
  { id: 'm', label: 'm', desc: 'Meters' },
  { id: 'in', label: 'in', desc: 'Inches' },
  { id: 'ft', label: 'ft', desc: 'Feet' },
];

const ParameterInputField: React.FC<{
  param: Parameter;
  unitTag: string;
  roundZeroDecimals: boolean;
  onParamChange: (id: string, value: number) => void;
}> = ({ param, unitTag, roundZeroDecimals, onParamChange }) => {
  const [localText, setLocalText] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    if (!isFocused) {
      if (roundZeroDecimals) {
        setLocalText(Math.round(param.value).toString());
      } else {
        const p = param.precision ?? 2;
        const rounded = Number(param.value.toFixed(p));
        setLocalText(rounded.toString());
      }
    }
  }, [param.value, roundZeroDecimals, param.precision, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalText(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      const finalVal = roundZeroDecimals ? Math.round(parsed) : parsed;
      onParamChange(param.id, finalVal);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseFloat(localText);
    if (isNaN(parsed)) {
      setLocalText(
        roundZeroDecimals
          ? Math.round(param.value).toString()
          : Number(param.value.toFixed(param.precision ?? 2)).toString()
      );
    } else {
      const clamped = Math.max(param.min ?? 0.01, Math.min(param.max ?? 1000, parsed));
      const finalVal = roundZeroDecimals
        ? Math.round(clamped)
        : Number(clamped.toFixed(param.precision ?? 2));
      onParamChange(param.id, finalVal);
      setLocalText(finalVal.toString());
    }
  };

  const stepVal = roundZeroDecimals || param.type === 'count' ? '1' : '0.01';

  return (
    <div className="relative flex-1">
      <input
        type="number"
        step={stepVal}
        min={param.min ?? 0.01}
        max={param.max ?? 500}
        disabled={param.isDerived}
        value={localText}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder="0.00"
        className={`w-full py-1.5 pl-2.5 pr-10 text-xs font-mono font-semibold rounded-md border transition-colors ${
          param.isDerived
            ? 'bg-slate-100/80 border-slate-200 text-slate-600 cursor-not-allowed'
            : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs'
        }`}
      />
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 pointer-events-none">
        {unitTag}
      </span>
    </div>
  );
};

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  parameters,
  unit,
  onUnitChange,
  onParamChange,
  onToggleVisibility,
  onSetAllVisibility,
  labelStyle,
  onLabelStyleChange,
  hoveredParamId,
  onHoverParam,
  onResetDefaults,
  roundZeroDecimals,
  onToggleRoundZeroDecimals,
}) => {
  const visibleCount = parameters.filter((p) => p.isVisible).length;
  const allVisible = visibleCount === parameters.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Unit Selector & Conversion Options */}
      <div className="flex flex-col gap-1.5 p-3 bg-white rounded-lg border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">Measurement Unit</label>
          <span className="text-[11px] text-slate-500 font-mono">lengths, areas, volumes</span>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          {AVAILABLE_UNITS.map((u) => {
            const isSelected = unit === u.id;
            return (
              <button
                key={u.id}
                onClick={() => onUnitChange(u.id, false)}
                title={u.desc}
                className={`flex-1 py-1.5 px-2 text-xs font-mono font-medium rounded-md transition-colors text-center ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                {u.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visibility Quick Toolbar & Label Style */}
      <div className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px] font-medium">
            Visible in Image: <strong className="text-slate-900 font-mono">{visibleCount}/{parameters.length}</strong>
          </span>
          <button
            onClick={() => onSetAllVisibility(!allVisible)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
          >
            {allVisible ? <EyeOff className="w-3 h-3 text-slate-500" /> : <Eye className="w-3 h-3 text-slate-500" />}
            <span>{allVisible ? 'Hide All' : 'Show All'}</span>
          </button>
        </div>

        {/* Label Format Selector */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onLabelStyleChange('symbol_and_value')}
            title="Format: c = 10.00 cm"
            className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
              labelStyle === 'symbol_and_value'
                ? 'bg-blue-100 text-blue-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            c = 10 {unit}
          </button>
          <button
            onClick={() => onLabelStyleChange('value_only')}
            title="Format: 10.00 cm"
            className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
              labelStyle === 'value_only'
                ? 'bg-blue-100 text-blue-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            10 {unit}
          </button>
        </div>
      </div>

      {/* Decimal Rounding Checkbox (Zero Decimals vs 2 Decimals) */}
      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 transition-colors hover:border-slate-300">
        <label className="flex items-center gap-2.5 cursor-pointer select-none flex-1">
          <input
            type="checkbox"
            checked={roundZeroDecimals}
            onChange={(e) => onToggleRoundZeroDecimals(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 accent-blue-600 cursor-pointer"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-blue-600" />
              Round with zero decimals
            </span>
            <span className="text-[11px] text-slate-500">
              {roundZeroDecimals
                ? 'Displaying integer values (e.g. 10 cm, 84 cm²)'
                : 'Displaying and editable to two decimals (0.01 precision)'}
            </span>
          </div>
        </label>
        <span
          className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded shrink-0 ${
            roundZeroDecimals
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {roundZeroDecimals ? '0 DEC' : '0.00 DEC'}
        </span>
      </div>

      {/* Parameters List */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-800 tracking-tight">Parameters & Dimensions</span>
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 divide-y divide-slate-100">
          {parameters.map((param) => {
            const isHovered = hoveredParamId === param.id;
            const isAngle = param.type === 'angle';
            const isArea = param.type === 'area';
            const isVolume = param.type === 'volume';
            const isCount = param.type === 'count';

            let unitTag: string = unit;
            if (isAngle) unitTag = '°';
            if (isArea) unitTag = `${unit}²`;
            if (isVolume) unitTag = `${unit}³`;
            if (isCount) unitTag = 'qty';

            return (
              <div
                key={param.id}
                onMouseEnter={() => onHoverParam(param.id)}
                onMouseLeave={() => onHoverParam(null)}
                className={`pt-2 flex flex-col gap-1.5 p-2 rounded-lg transition-all ${
                  isHovered ? 'bg-blue-50/70 ring-1 ring-blue-400/30' : 'hover:bg-slate-50'
                }`}
              >
                {/* Row 1: Visibility toggle, Parameter Symbol, Name, and Derived Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleVisibility(param.id)}
                      title={param.isVisible ? 'Mark parameter as Hidden in image' : 'Mark parameter as Visible in image'}
                      className={`p-1 rounded-md transition-colors ${
                        param.isVisible
                          ? 'text-blue-600 bg-blue-100/70 hover:bg-blue-200'
                          : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {param.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    <span className="font-mono font-bold text-slate-900 text-xs w-6 text-center">
                      {param.symbol}
                    </span>

                    <span className="text-xs font-medium text-slate-800 truncate">
                      {param.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {param.isDerived ? (
                      <span className="text-[10px] text-slate-400 font-mono">
                        calculated
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-mono font-medium">
                        editable
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 2: Input Field and Slider (if editable) */}
                <div className="flex items-center gap-2 pl-7">
                  <ParameterInputField
                    param={param}
                    unitTag={unitTag}
                    roundZeroDecimals={roundZeroDecimals}
                    onParamChange={onParamChange}
                  />

                  {/* Slider for quick intuitive tweaking if editable */}
                  {!param.isDerived && param.min !== undefined && param.max !== undefined && (
                    <input
                      type="range"
                      min={param.min}
                      max={param.max}
                      step={roundZeroDecimals || param.type === 'count' ? 1 : (param.step ?? 0.01)}
                      value={roundZeroDecimals ? Math.round(param.value) : param.value}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onParamChange(param.id, roundZeroDecimals ? Math.round(val) : val);
                      }}
                      className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
