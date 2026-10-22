import React, { useRef, useId, useMemo } from 'react';
import { FigureDefinition, Parameter, Unit, ThemeConfig, LabelStyle } from '../types/geometry';
import { formatLabel as mathFormatLabel, formatValue } from '../utils/geometryMath';

interface FigureRendererProps {
  figure: FigureDefinition;
  unit: Unit;
  theme: ThemeConfig;
  showGrid: boolean;
  gridType: 'lines' | 'dots' | 'none';
  labelStyle: LabelStyle;
  hoveredParamId: string | null;
  onHoverParam?: (id: string | null) => void;
  onToggleParamVisibility?: (id: string) => void;
  onSelectParam?: (id: string) => void;
  roundZeroDecimals?: boolean;
  emptyLabels?: boolean;
}

interface Point {
  x: number;
  y: number;
}

export const FigureRenderer: React.FC<FigureRendererProps> = ({
  figure,
  unit,
  theme,
  showGrid,
  gridType,
  labelStyle,
  hoveredParamId,
  onHoverParam,
  onToggleParamVisibility,
  onSelectParam,
  roundZeroDecimals = false,
  emptyLabels = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const patternId = useId();
  const arrowMarkerId = useId();
  const arrowRevMarkerId = useId();

  const formatLabel = (param: Parameter, u = unit, ls = labelStyle) =>
    mathFormatLabel(param, u, ls, roundZeroDecimals, emptyLabels);

  const paramMap = useMemo(() => {
    const map = new Map<string, Parameter>();
    figure.parameters.forEach((p) => map.set(p.id, p));
    return map;
  }, [figure]);

  const isVis = (id: string) => paramMap.get(id)?.isVisible ?? false;
  const getParam = (id: string) => paramMap.get(id);

  // Helper to render interactive dimension line with witness/extension lines
  const renderDimensionLine = (
    paramId: string,
    p1: Point,
    p2: Point,
    offsetDist: number, // positive = perpendicular to right/outward
    options?: {
      overrideLabel?: string;
      labelSide?: 'auto' | 'inside' | 'outside';
      alwaysVisible?: boolean;
      keySuffix?: string;
    }
  ) => {
    const param = getParam(paramId);
    if (!param) return null;
    if (!param.isVisible && !options?.alwaysVisible) return null;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.001) return null;

    // Unit normal vector (pointing to the right of p1 -> p2)
    const nx = -dy / len;
    const ny = dx / len;

    // Dimension line endpoints
    const dim1 = { x: p1.x + nx * offsetDist, y: p1.y + ny * offsetDist };
    const dim2 = { x: p2.x + nx * offsetDist, y: p2.y + ny * offsetDist };

    // Witness / Extension lines (with 4px gap from point, and 5px overshoot past dimension line)
    const gap = offsetDist > 0 ? 4 : -4;
    const overshoot = offsetDist > 0 ? 5 : -5;
    const w1Start = { x: p1.x + nx * gap, y: p1.y + ny * gap };
    const w1End = { x: dim1.x + nx * overshoot, y: dim1.y + ny * overshoot };
    const w2Start = { x: p2.x + nx * gap, y: p2.y + ny * gap };
    const w2End = { x: dim2.x + nx * overshoot, y: dim2.y + ny * overshoot };

    // Midpoint for dimension label
    const midX = (dim1.x + dim2.x) / 2;
    const midY = (dim1.y + dim2.y) / 2;

    const isHovered = hoveredParamId === paramId;
    const labelText = emptyLabels
      ? (labelStyle === 'value_only' ? '' : `${param.symbol} = ____`)
      : (options?.overrideLabel ?? formatLabel(param, unit, labelStyle));

    // Approximate label width based on string length
    const labelBoxW = emptyLabels
      ? (labelText ? Math.max(54, labelText.length * 7.5 + 24) : 48)
      : Math.max(38, labelText.length * 7.5 + 14);
    const labelBoxH = 22;

    const elementKey = options?.keySuffix ? `dim-${paramId}-${options.keySuffix}` : `dim-${paramId}`;

    return (
      <g
        key={elementKey}
        className="group cursor-pointer select-none"
        onMouseEnter={() => onHoverParam?.(paramId)}
        onMouseLeave={() => onHoverParam?.(null)}
        onClick={() => {
          onSelectParam?.(paramId);
          onToggleParamVisibility?.(paramId);
        }}
      >
        {/* Extension witness lines */}
        <line
          x1={w1Start.x}
          y1={w1Start.y}
          x2={w1End.x}
          y2={w1End.y}
          stroke={theme.dimensionLine}
          strokeWidth="1"
          strokeOpacity={isHovered ? '0.9' : '0.45'}
          strokeDasharray="none"
        />
        <line
          x1={w2Start.x}
          y1={w2Start.y}
          x2={w2End.x}
          y2={w2End.y}
          stroke={theme.dimensionLine}
          strokeWidth="1"
          strokeOpacity={isHovered ? '0.9' : '0.45'}
          strokeDasharray="none"
        />

        {/* Main dimension line with arrow markers */}
        <line
          x1={dim1.x}
          y1={dim1.y}
          x2={dim2.x}
          y2={dim2.y}
          stroke={isHovered ? theme.accent : theme.dimensionLine}
          strokeWidth={isHovered ? '2' : '1.5'}
          markerStart={`url(#${arrowRevMarkerId})`}
          markerEnd={`url(#${arrowMarkerId})`}
        />

        {/* Label Badge with Background */}
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x={-labelBoxW / 2}
            y={-labelBoxH / 2}
            width={labelBoxW}
            height={labelBoxH}
            rx="4"
            fill={isHovered ? theme.accent : theme.dimensionBg}
            stroke={isHovered ? '#ffffff' : theme.dimensionLine}
            strokeWidth="1"
            className="transition-colors duration-150"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill={isHovered ? '#ffffff' : theme.dimensionText}
            fontSize="11.5"
            fontFamily="JetBrains Mono, monospace"
            fontWeight={isHovered ? '600' : '500'}
            className="pointer-events-none"
          >
            {labelText}
          </text>
        </g>
      </g>
    );
  };

  // Helper to render Angle Arc
  const renderAngleArc = (
    paramId: string,
    vertex: Point,
    startAngleRad: number,
    sweepAngleRad: number,
    arcRadius = 28,
    isRightAngle = false,
    keySuffix?: string
  ) => {
    const param = getParam(paramId);
    if (!param) return null;
    if (!param.isVisible) return null;

    const isHovered = hoveredParamId === paramId;
    const labelText = emptyLabels
      ? (labelStyle === 'value_only' ? '' : `${param.symbol} = ____`)
      : formatLabel(param, unit, labelStyle);
    const elementKey = keySuffix ? `angle-${paramId}-${keySuffix}` : `angle-${paramId}`;

    if (isRightAngle) {
      // Draw standard square corner symbol
      const s = 14;
      const cosA = Math.cos(startAngleRad);
      const sinA = Math.sin(startAngleRad);
      const cosB = Math.cos(startAngleRad + Math.PI / 2);
      const sinB = Math.sin(startAngleRad + Math.PI / 2);

      const p1 = { x: vertex.x + cosA * s, y: vertex.y + sinA * s };
      const p2 = { x: p1.x + cosB * s, y: p1.y + sinB * s };
      const p3 = { x: vertex.x + cosB * s, y: vertex.y + sinB * s };

      return (
        <g
          key={elementKey}
          className="cursor-pointer"
          onMouseEnter={() => onHoverParam?.(paramId)}
          onMouseLeave={() => onHoverParam?.(null)}
          onClick={() => onToggleParamVisibility?.(paramId)}
        >
          <polyline
            points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
            fill="none"
            stroke={isHovered ? theme.accent : theme.angleArc}
            strokeWidth={isHovered ? '2' : '1.5'}
          />
          <circle cx={vertex.x + (cosA + cosB) * 6} cy={vertex.y + (sinA + sinB) * 6} r="1.5" fill={theme.angleArc} />
        </g>
      );
    }

    // Arc path
    const endAngleRad = startAngleRad + sweepAngleRad;
    const pStart = {
      x: vertex.x + Math.cos(startAngleRad) * arcRadius,
      y: vertex.y + Math.sin(startAngleRad) * arcRadius,
    };
    const pEnd = {
      x: vertex.x + Math.cos(endAngleRad) * arcRadius,
      y: vertex.y + Math.sin(endAngleRad) * arcRadius,
    };

    const largeArcFlag = Math.abs(sweepAngleRad) > Math.PI ? 1 : 0;
    const sweepFlag = sweepAngleRad > 0 ? 1 : 0;

    const d = `M ${pStart.x} ${pStart.y} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} ${sweepFlag} ${pEnd.x} ${pEnd.y}`;

    // Label position along bisector
    const midAngle = startAngleRad + sweepAngleRad / 2;
    const labelDist = arcRadius + 18;
    const labelX = vertex.x + Math.cos(midAngle) * labelDist;
    const labelY = vertex.y + Math.sin(midAngle) * labelDist;

    const labelBoxW = emptyLabels
      ? (labelText ? Math.max(46, labelText.length * 7.2 + 20) : 40)
      : Math.max(34, labelText.length * 7.2 + 10);
    const labelBoxH = 20;

    return (
      <g
        key={elementKey}
        className="group cursor-pointer select-none"
        onMouseEnter={() => onHoverParam?.(paramId)}
        onMouseLeave={() => onHoverParam?.(null)}
        onClick={() => {
          onSelectParam?.(paramId);
          onToggleParamVisibility?.(paramId);
        }}
      >
        <path
          d={d}
          fill="none"
          stroke={isHovered ? theme.accent : theme.angleArc}
          strokeWidth={isHovered ? '2' : '1.5'}
        />
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-labelBoxW / 2}
            y={-labelBoxH / 2}
            width={labelBoxW}
            height={labelBoxH}
            rx="3"
            fill={isHovered ? theme.accent : theme.dimensionBg}
            stroke={isHovered ? '#ffffff' : theme.angleArc}
            strokeWidth="1"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill={isHovered ? '#ffffff' : theme.dimensionText}
            fontSize="10.5"
            fontFamily="JetBrains Mono, monospace"
            fontWeight={isHovered ? '600' : '500'}
            className="pointer-events-none"
          >
            {labelText}
          </text>
        </g>
      </g>
    );
  };

  // Helper to render Area & Perimeter badges below the entire figure and below any other data or arrow
  const renderBottomMetrics = (
    centerX: number,
    bottomY: number,
    options?: {
      areaId?: string;
      perimeterId?: string;
    }
  ) => {
    const areaParamId = options?.areaId ?? (figure.category === '3d' ? 'surface_area' : 'area');
    const perimParamId = options?.perimeterId ?? (
      figure.category === '3d'
        ? 'volume'
        : figure.id === 'circle'
          ? 'circumference'
          : 'perimeter'
    );

    const areaParam = getParam(areaParamId);
    const perimParam = getParam(perimParamId);

    const showArea = areaParam && areaParam.isVisible;
    const showPerim = perimParam && perimParam.isVisible;

    if (!showArea && !showPerim) return null;

    const isAreaHovered = hoveredParamId === areaParamId;
    const isPerimHovered = hoveredParamId === perimParamId;

    const formatMetricText = (param: Parameter) => {
      if (emptyLabels) {
        if (labelStyle === 'value_only') {
          return `${param.name}: _______`;
        }
        if (labelStyle === 'full_name_and_value') {
          return `${param.name} = _______`;
        }
        return `${param.name} (${param.symbol}) = _______`;
      }
      const valStr = formatValue(param.value, param.type, unit, param.precision ?? 2, roundZeroDecimals);
      if (labelStyle === 'value_only') {
        return `${param.name}: ${valStr}`;
      }
      if (labelStyle === 'full_name_and_value') {
        return `${param.name} = ${valStr}`;
      }
      return `${param.name} (${param.symbol}) = ${valStr}`;
    };

    const areaText = areaParam ? formatMetricText(areaParam) : '';
    const perimText = perimParam ? formatMetricText(perimParam) : '';

    const areaBoxW = Math.max(110, areaText.length * 7.5 + 24);
    const perimBoxW = Math.max(110, perimText.length * 7.5 + 24);
    const boxH = 28;
    const gap = 16;

    let areaX = centerX;
    let perimX = centerX;

    if (showArea && showPerim) {
      const totalWidth = areaBoxW + gap + perimBoxW;
      areaX = centerX - totalWidth / 2 + areaBoxW / 2;
      perimX = centerX + totalWidth / 2 - perimBoxW / 2;
    }

    return (
      <g key="bottom-metrics-group" className="select-none">
        {/* Subtle decorative separator hairline strictly below all figure elements, data, and arrows */}
        <line
          x1={centerX - 160}
          y1={bottomY - 22}
          x2={centerX + 160}
          y2={bottomY - 22}
          stroke={theme.gridColor}
          strokeWidth="1.25"
          strokeDasharray="4 4"
          opacity="0.9"
        />

        {/* Area / Surface Area Badge */}
        {showArea && (
          <g
            key={`bottom-metric-${areaParamId}`}
            transform={`translate(${areaX}, ${bottomY})`}
            className="cursor-pointer group"
            onMouseEnter={() => onHoverParam?.(areaParamId)}
            onMouseLeave={() => onHoverParam?.(null)}
            onClick={() => {
              onSelectParam?.(areaParamId);
              onToggleParamVisibility?.(areaParamId);
            }}
          >
            <rect
              x={-areaBoxW / 2}
              y={-boxH / 2}
              width={areaBoxW}
              height={boxH}
              rx="6"
              fill={isAreaHovered ? theme.accent : theme.dimensionBg}
              stroke={isAreaHovered ? '#ffffff' : theme.dimensionLine}
              strokeWidth={isAreaHovered ? '2' : '1.25'}
              className="transition-colors duration-150"
            />
            <text
              x="0"
              y="4.5"
              textAnchor="middle"
              fill={isAreaHovered ? '#ffffff' : theme.dimensionText}
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="600"
              className="pointer-events-none"
            >
              {areaText}
            </text>
          </g>
        )}

        {/* Perimeter / Circumference / Volume Badge */}
        {showPerim && (
          <g
            key={`bottom-metric-${perimParamId}`}
            transform={`translate(${perimX}, ${bottomY})`}
            className="cursor-pointer group"
            onMouseEnter={() => onHoverParam?.(perimParamId)}
            onMouseLeave={() => onHoverParam?.(null)}
            onClick={() => {
              onSelectParam?.(perimParamId);
              onToggleParamVisibility?.(perimParamId);
            }}
          >
            <rect
              x={-perimBoxW / 2}
              y={-boxH / 2}
              width={perimBoxW}
              height={boxH}
              rx="6"
              fill={isPerimHovered ? theme.accent : theme.dimensionBg}
              stroke={isPerimHovered ? '#ffffff' : theme.dimensionLine}
              strokeWidth={isPerimHovered ? '2' : '1.25'}
              className="transition-colors duration-150"
            />
            <text
              x="0"
              y="4.5"
              textAnchor="middle"
              fill={isPerimHovered ? '#ffffff' : theme.dimensionText}
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="600"
              className="pointer-events-none"
            >
              {perimText}
            </text>
          </g>
        )}
      </g>
    );
  };

  // Helper to draw Right Angle Marker
  const renderRightAngleSquare = (vertex: Point, dirX: number, dirY: number, size = 12) => {
    // dirX, dirY are unit vectors along the two perpendicular legs
    const p1 = { x: vertex.x + dirX * size, y: vertex.y };
    const p2 = { x: vertex.x + dirX * size, y: vertex.y + dirY * size };
    const p3 = { x: vertex.x, y: vertex.y + dirY * size };

    return (
      <polyline
        points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
        fill="none"
        stroke={theme.shapeStroke}
        strokeWidth="1.25"
      />
    );
  };

  // ----------------------------------------------------
  // Dynamic Shape Geometry & ViewBox Computation
  // ----------------------------------------------------
  const renderedContent = useMemo(() => {
    const p = (id: string, def = 1) => paramMap.get(id)?.value ?? def;

    // Fixed internal coordinate space baseline (e.g. 500x400 normalized)
    // We scale figure dimensions proportionally to fit nicely
    switch (figure.id) {
      case 'right_triangle': {
        const rawA = p('side_a', 8);
        const rawB = p('side_b', 6);
        const maxDim = Math.max(rawA, rawB);
        const scale = 240 / maxDim;
        const a = rawA * scale;
        const b = rawB * scale;

        const pA: Point = { x: 90, y: 310 }; // Right angle corner (bottom-left)
        const pB: Point = { x: 90 + a, y: 310 }; // Base corner (bottom-right)
        const pC: Point = { x: 90, y: 310 - b }; // Apex corner (top-left)

        // Hypotenuse normal direction (outward to top-right)
        // Vector along hypotenuse: from pB to pC = (-a, -b)
        // Normal to right: (-(-b), -a) = (b, -a) -> normalized
        const hLen = Math.hypot(a, b);
        const altParam = getParam('altitude');
        const showAltitude = altParam && altParam.isVisible;

        // Altitude foot on hypotenuse: projection of pA onto pB-pC
        // Foot point coordinates:
        const t = (a * a) / (a * a + b * b);
        const pFoot: Point = {
          x: pC.x + (pB.x - pC.x) * (1 - t),
          y: pC.y + (pB.y - pC.y) * (1 - t),
        };

        return {
          viewBox: '-20 -20 540 485',
          elements: (
            <>
              {/* Right angle marker at corner A */}
              {renderRightAngleSquare(pA, 1, -1, 14)}

              {/* Triangle Body */}
              <polygon
                points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`}
                fill={theme.shapeFill}
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Altitude Line if visible */}
              {showAltitude && (
                <g
                  className="cursor-pointer"
                  onMouseEnter={() => onHoverParam?.('altitude')}
                  onMouseLeave={() => onHoverParam?.(null)}
                  onClick={() => onToggleParamVisibility?.('altitude')}
                >
                  <line
                    x1={pA.x}
                    y1={pA.y}
                    x2={pFoot.x}
                    y2={pFoot.y}
                    stroke={theme.heightLine}
                    strokeWidth="1.75"
                    strokeDasharray="4 3"
                  />
                  {/* Altitude label */}
                  <g transform={`translate(${(pA.x + pFoot.x) / 2 - 14}, ${(pA.y + pFoot.y) / 2})`}>
                    <rect
                      x="-26"
                      y="-10"
                      width="52"
                      height="20"
                      rx="3"
                      fill={theme.dimensionBg}
                      stroke={theme.heightLine}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={theme.heightLine}
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {formatLabel(altParam, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Base dimension (side_a) below bottom edge */}
              {renderDimensionLine('side_a', pA, pB, 42)}

              {/* Height dimension (side_b) left of vertical edge */}
              {renderDimensionLine('side_b', pC, pA, 42)}

              {/* Hypotenuse dimension line (side c) along the diagonal - placed OUTSIDE the triangle */}
              {renderDimensionLine('hypotenuse', pB, pC, 46)}

              {/* Angle alpha at bottom-right corner pB */}
              {renderAngleArc('angle_alpha', pB, Math.PI, -(Math.atan2(b, a)), 36)}

              {/* Angle beta at top apex pC */}
              {renderAngleArc('angle_beta', pC, Math.PI / 2, -(Math.PI / 2 - Math.atan2(b, a)), 34)}

              {/* Area and Perimeter strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(pA.x + a / 2, 415)}
            </>
          ),
        };
      }

      case 'equilateral_triangle': {
        const rawA = p('side_a', 10);
        const scale = 260 / 10;
        const a = 10 * scale;
        const h = (a * Math.sqrt(3)) / 2;

        const pLeft: Point = { x: 250 - a / 2, y: 310 };
        const pRight: Point = { x: 250 + a / 2, y: 310 };
        const pApex: Point = { x: 250, y: 310 - h };
        const pMidBase: Point = { x: 250, y: 310 };

        const showHeight = isVis('height');

        return {
          viewBox: '20 15 460 475',
          elements: (
            <>
              {/* Shape polygon */}
              <polygon
                points={`${pLeft.x},${pLeft.y} ${pRight.x},${pRight.y} ${pApex.x},${pApex.y}`}
                fill={theme.shapeFill}
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Dashed Height Altitude Line */}
              {showHeight && (
                <g
                  className="cursor-pointer"
                  onMouseEnter={() => onHoverParam?.('height')}
                  onMouseLeave={() => onHoverParam?.(null)}
                  onClick={() => onToggleParamVisibility?.('height')}
                >
                  <line
                    x1={pApex.x}
                    y1={pApex.y}
                    x2={pMidBase.x}
                    y2={pMidBase.y}
                    stroke={theme.heightLine}
                    strokeWidth="1.75"
                    strokeDasharray="4 3"
                  />
                  {/* Right angle at base of height */}
                  {renderRightAngleSquare(pMidBase, 1, -1, 10)}
                  {/* Height label */}
                  <g transform={`translate(${pMidBase.x + 28}, ${pApex.y + h / 2})`}>
                    <rect
                      x="-30"
                      y="-10"
                      width="60"
                      height="20"
                      rx="3"
                      fill={theme.dimensionBg}
                      stroke={theme.heightLine}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={theme.heightLine}
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {formatLabel(getParam('height')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Side dimension on base */}
              {renderDimensionLine('side_a', pLeft, pRight, 42)}

              {/* Angles at vertices */}
              {renderAngleArc('angle_all', pLeft, 0, -(Math.PI / 3), 32, false, 'left')}
              {renderAngleArc('angle_all', pRight, Math.PI, Math.PI / 3, 32, false, 'right')}

              {/* Area and Perimeter strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(250, 415)}
            </>
          ),
        };
      }

      case 'isosceles_triangle': {
        const rawB = p('base', 8);
        const rawA = p('leg', 7);
        const scale = 250 / Math.max(rawB, rawA * 1.2);
        const b = rawB * scale;
        const a = rawA * scale;
        const h = Math.sqrt(Math.max(10, a * a - (b / 2) * (b / 2)));

        const pLeft: Point = { x: 250 - b / 2, y: 310 };
        const pRight: Point = { x: 250 + b / 2, y: 310 };
        const pApex: Point = { x: 250, y: 310 - h };
        const pMidBase: Point = { x: 250, y: 310 };

        const showHeight = isVis('height');
        const baseAngleRad = Math.atan2(h, b / 2);

        return {
          viewBox: '20 15 460 475',
          elements: (
            <>
              <polygon
                points={`${pLeft.x},${pLeft.y} ${pRight.x},${pRight.y} ${pApex.x},${pApex.y}`}
                fill={theme.shapeFill}
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {showHeight && (
                <g
                  className="cursor-pointer"
                  onMouseEnter={() => onHoverParam?.('height')}
                  onMouseLeave={() => onHoverParam?.(null)}
                  onClick={() => onToggleParamVisibility?.('height')}
                >
                  <line
                    x1={pApex.x}
                    y1={pApex.y}
                    x2={pMidBase.x}
                    y2={pMidBase.y}
                    stroke={theme.heightLine}
                    strokeWidth="1.75"
                    strokeDasharray="4 3"
                  />
                  {renderRightAngleSquare(pMidBase, 1, -1, 10)}
                  <g transform={`translate(${pMidBase.x + 28}, ${pApex.y + h / 2})`}>
                    <rect
                      x="-30"
                      y="-10"
                      width="60"
                      height="20"
                      rx="3"
                      fill={theme.dimensionBg}
                      stroke={theme.heightLine}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={theme.heightLine}
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {formatLabel(getParam('height')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Base dimension */}
              {renderDimensionLine('base', pLeft, pRight, 42)}

              {/* Leg dimension (placed OUTSIDE the triangle) */}
              {renderDimensionLine('leg', pRight, pApex, 44)}

              {/* Angles */}
              {renderAngleArc('angle_base', pLeft, 0, -baseAngleRad, 32, false, 'left')}
              {renderAngleArc('angle_base', pRight, Math.PI, baseAngleRad, 32, false, 'right')}
              {renderAngleArc('angle_vertex', pApex, Math.PI / 2 + (Math.PI / 2 - baseAngleRad), -(Math.PI - 2 * baseAngleRad), 32)}

              {/* Area and Perimeter strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(250, 415)}
            </>
          ),
        };
      }

      case 'scalene_triangle': {
        const rawA = p('side_a', 10);
        const rawB = p('side_b', 8);
        const gamma = Math.min(170, Math.max(10, p('angle_c', 55)));
        const gammaRad = (gamma * Math.PI) / 180;
        const scale = 240 / Math.max(rawA, rawB * 1.2);

        const a = rawA * scale;
        const b = rawB * scale;

        const pA: Point = { x: 100, y: 310 }; // (0, 0)
        const pB: Point = { x: 100 + a, y: 310 }; // (a, 0)
        const pC: Point = { x: 100 + b * Math.cos(gammaRad), y: 310 - b * Math.sin(gammaRad) };

        const showHeight = isVis('height');
        const h = b * Math.sin(gammaRad);
        const pFoot: Point = { x: pC.x, y: 310 };

        return {
          viewBox: '20 15 510 475',
          elements: (
            <>
              <polygon
                points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`}
                fill={theme.shapeFill}
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {showHeight && (
                <g>
                  <line
                    x1={pC.x}
                    y1={pC.y}
                    x2={pFoot.x}
                    y2={pFoot.y}
                    stroke={theme.heightLine}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  {renderRightAngleSquare(pFoot, pFoot.x > pA.x ? -1 : 1, -1, 10)}
                  <g transform={`translate(${pFoot.x - 26}, ${(pC.y + pFoot.y) / 2})`}>
                    <rect
                      x="-24"
                      y="-10"
                      width="48"
                      height="20"
                      rx="3"
                      fill={theme.dimensionBg}
                      stroke={theme.heightLine}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={theme.heightLine}
                      fontSize="9.5"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {formatLabel(getParam('height')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Side a (base) */}
              {renderDimensionLine('side_a', pA, pB, 42)}
              {/* Side b */}
              {renderDimensionLine('side_b', pC, pA, 42)}
              {/* Side c (third side - placed OUTSIDE the triangle) */}
              {renderDimensionLine('side_c', pB, pC, 44)}

              {/* Angles */}
              {renderAngleArc('angle_c', pA, 0, -gammaRad, 32)}

              {/* Area and Perimeter strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(100 + a / 2, 415)}
            </>
          ),
        };
      }

      case 'rectangle': {
        const rawW = p('width', 12);
        const rawH = p('height', 7);
        const maxD = Math.max(rawW, rawH);
        const scale = 250 / maxD;
        const w = rawW * scale;
        const h = rawH * scale;

        const x0 = 250 - w / 2;
        const y0 = 220 - h / 2;

        const pTL = { x: x0, y: y0 };
        const pTR = { x: x0 + w, y: y0 };
        const pBR = { x: x0 + w, y: y0 + h };
        const pBL = { x: x0, y: y0 + h };

        const showDiagonal = isVis('diagonal');

        const bottomDimY = y0 + h + 42;
        const bottomMetricsY = bottomDimY + 54;
        const totalHeight = bottomMetricsY + 44;

        return {
          viewBox: `20 15 460 ${totalHeight}`,
          elements: (
            <>
              {/* Right angle corner indicators */}
              {renderRightAngleSquare(pBL, 1, -1, 12)}
              {renderRightAngleSquare(pTL, 1, 1, 12)}

              <rect
                x={x0}
                y={y0}
                width={w}
                height={h}
                fill={theme.shapeFill}
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
                rx="1"
              />

              {showDiagonal && (
                <g
                  className="cursor-pointer"
                  onMouseEnter={() => onHoverParam?.('diagonal')}
                  onMouseLeave={() => onHoverParam?.(null)}
                  onClick={() => onToggleParamVisibility?.('diagonal')}
                >
                  <line
                    x1={pBL.x}
                    y1={pBL.y}
                    x2={pTR.x}
                    y2={pTR.y}
                    stroke={theme.heightLine}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <g transform={`translate(${250}, ${220 - 18})`}>
                    <rect
                      x="-36"
                      y="-10"
                      width="72"
                      height="20"
                      rx="3"
                      fill={theme.dimensionBg}
                      stroke={theme.heightLine}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={theme.heightLine}
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {formatLabel(getParam('diagonal')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Width dimension (bottom) */}
              {renderDimensionLine('width', pBL, pBR, 42)}

              {/* Height dimension (left) */}
              {renderDimensionLine('height', pTL, pBL, 42)}

              {/* Area and Perimeter strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(250, bottomMetricsY)}
            </>
          ),
        };
      }

      case 'square': {
        const rawS = p('side', 8);
        const scale = 220 / 8;
        const s = 8 * scale;
        const x0 = 250 - s / 2;
        const y0 = 210 - s / 2;

        const pTL = { x: x0, y: y0 };
        const pTR = { x: x0 + s, y: y0 };
        const pBR = { x: x0 + s, y: y0 + s };
        const pBL = { x: x0, y: y0 + s };

        const showDiagonal = isVis('diagonal');
        const bottomDimY = y0 + s + 42;
        const bottomMetricsY = bottomDimY + 54;
        const totalHeight = bottomMetricsY + 44;

        return {
          viewBox: `20 15 460 ${totalHeight}`,
          elements: (
            <>
              {renderRightAngleSquare(pBL, 1, -1, 12)}
              {renderRightAngleSquare(pTL, 1, 1, 12)}

              <rect
                x={x0}
                y={y0}
                width={s}
                height={s}
                fill={theme.shapeFill}
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
                rx="1"
              />

              {showDiagonal && (
                <g
                  className="cursor-pointer"
                  onMouseEnter={() => onHoverParam?.('diagonal')}
                  onMouseLeave={() => onHoverParam?.(null)}
                  onClick={() => onToggleParamVisibility?.('diagonal')}
                >
                  <line
                    x1={pBL.x}
                    y1={pBL.y}
                    x2={pTR.x}
                    y2={pTR.y}
                    stroke={theme.heightLine}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <g transform={`translate(${250}, ${210 - 20})`}>
                    <rect
                      x="-34"
                      y="-10"
                      width="68"
                      height="20"
                      rx="3"
                      fill={theme.dimensionBg}
                      stroke={theme.heightLine}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={theme.heightLine}
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {formatLabel(getParam('diagonal')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Side dimension */}
              {renderDimensionLine('side', pBL, pBR, 42, { keySuffix: 'bottom' })}
              {renderDimensionLine('side', pTL, pBL, 42, { keySuffix: 'left' })}

              {/* Area and Perimeter strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(250, bottomMetricsY)}
            </>
          ),
        };
      }

      case 'parallelogram': {
        const rawB = p('base', 10);
        const rawA = p('side', 6);
        const theta = Math.min(85, Math.max(15, p('angle', 60)));
        const thetaRad = (theta * Math.PI) / 180;

        const maxSpan = rawB + rawA * Math.cos(thetaRad);
        const scale = 250 / maxSpan;
        const b = rawB * scale;
        const a = rawA * scale;
        const h = a * Math.sin(thetaRad);
        const xOffset = a * Math.cos(thetaRad);

        const pBL = { x: 100, y: 280 };
        const pBR = { x: 100 + b, y: 280 };
        const pTR = { x: 100 + b + xOffset, y: 280 - h };
        const pTL = { x: 100 + xOffset, y: 280 - h };

        const showHeight = isVis('height');
        const pHFoot = { x: pTL.x, y: pBL.y };

        const bottomDimY = pBL.y + 42;
        const bottomMetricsY = bottomDimY + 54;
        const totalHeight = bottomMetricsY + 44;

        return {
          viewBox: `20 15 500 ${totalHeight}`,
          elements: (
            <>
              <polygon
                points={`${pBL.x},${pBL.y} ${pBR.x},${pBR.y} ${pTR.x},${pTR.y} ${pTL.x},${pTL.y}`}
                fill={theme.shapeFill}
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {showHeight && (
                <g>
                  <line
                    x1={pTL.x}
                    y1={pTL.y}
                    x2={pHFoot.x}
                    y2={pHFoot.y}
                    stroke={theme.heightLine}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  {renderRightAngleSquare(pHFoot, 1, -1, 10)}
                  <g transform={`translate(${pHFoot.x - 24}, ${(pTL.y + pHFoot.y) / 2})`}>
                    <rect
                      x="-24"
                      y="-10"
                      width="48"
                      height="20"
                      rx="3"
                      fill={theme.dimensionBg}
                      stroke={theme.heightLine}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={theme.heightLine}
                      fontSize="9.5"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {formatLabel(getParam('height')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Base dimension */}
              {renderDimensionLine('base', pBL, pBR, 42)}

              {/* Side dimension */}
              {renderDimensionLine('side', pBL, pTL, -42)}

              {/* Acute angle */}
              {renderAngleArc('angle', pBL, 0, -thetaRad, 32)}

              {/* Diagonals if visible */}
              {isVis('diagonal_1') && (
                <line
                  x1={pBL.x}
                  y1={pBL.y}
                  x2={pTR.x}
                  y2={pTR.y}
                  stroke={theme.dimensionLine}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}

              {/* Area and Perimeter strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(100 + b / 2 + xOffset / 2, bottomMetricsY)}
            </>
          ),
        };
      }

      case 'rhombus': {
        const rawD1 = p('diagonal_1', 13.86);
        const rawD2 = p('diagonal_2', 8);
        const scale = 230 / Math.max(rawD1, rawD2);
        const halfD1 = (rawD1 * scale) / 2;
        const halfD2 = (rawD2 * scale) / 2;

        const cX = 250;
        const cY = 210;

        const pTop = { x: cX, y: cY - halfD2 };
        const pRight = { x: cX + halfD1, y: cY };
        const pBottom = { x: cX, y: cY + halfD2 };
        const pLeft = { x: cX - halfD1, y: cY };

        const len = Math.hypot(halfD1, halfD2);
        const maxShapeArrowY = pBottom.y + (halfD1 / len) * 44;
        const bottomMetricsY = Math.max(340, maxShapeArrowY + 52);
        const totalHeight = bottomMetricsY + 44;

        return {
          viewBox: `20 15 460 ${totalHeight}`,
          elements: (
            <>
              {/* Diagonals interior lines */}
              <line
                x1={pLeft.x}
                y1={pLeft.y}
                x2={pRight.x}
                y2={pRight.y}
                stroke={theme.dimensionLine}
                strokeWidth="1.25"
                strokeDasharray="4 3"
              />
              <line
                x1={pTop.x}
                y1={pTop.y}
                x2={pBottom.x}
                y2={pBottom.y}
                stroke={theme.dimensionLine}
                strokeWidth="1.25"
                strokeDasharray="4 3"
              />
              {/* Right angle at diagonal center */}
              {renderRightAngleSquare({ x: cX, y: cY }, 1, -1, 10)}

              <polygon
                points={`${pTop.x},${pTop.y} ${pRight.x},${pRight.y} ${pBottom.x},${pBottom.y} ${pLeft.x},${pLeft.y}`}
                fill={theme.shapeFill}
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Side dimension on bottom-right edge pointing outward */}
              {renderDimensionLine('side', pBottom, pRight, 38)}

              {/* Diagonals dimensions */}
              {renderDimensionLine('diagonal_1', pLeft, pRight, -halfD2 - 28)}
              {renderDimensionLine('diagonal_2', pBottom, pTop, halfD1 + 28)}

              {/* Area and Perimeter strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(250, bottomMetricsY)}
            </>
          ),
        };
      }

      case 'trapezoid': {
        const rawB = p('base_b', 12);
        const rawA = p('base_a', 6);
        const rawH = p('height', 5);
        const rawOffset = p('offset', 3);

        const scale = 250 / Math.max(rawB, rawH * 1.5);
        const b = rawB * scale;
        const a = rawA * scale;
        const h = rawH * scale;
        const xOff = rawOffset * scale;

        const pBL = { x: 100, y: 280 };
        const pBR = { x: 100 + b, y: 280 };
        const pTR = { x: 100 + xOff + a, y: 280 - h };
        const pTL = { x: 100 + xOff, y: 280 - h };

        const showHeight = isVis('height');
        const pHFoot = { x: pTL.x, y: pBL.y };

        const bottomDimY = pBL.y + 42;
        const bottomMetricsY = bottomDimY + 54;
        const totalHeight = bottomMetricsY + 44;

        return {
          viewBox: `20 15 500 ${totalHeight}`,
          elements: (
            <>
              <polygon
                points={`${pBL.x},${pBL.y} ${pBR.x},${pBR.y} ${pTR.x},${pTR.y} ${pTL.x},${pTL.y}`}
                fill={theme.shapeFill}
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {showHeight && (
                <g>
                  <line
                    x1={pTL.x}
                    y1={pTL.y}
                    x2={pHFoot.x}
                    y2={pHFoot.y}
                    stroke={theme.heightLine}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  {renderRightAngleSquare(pHFoot, 1, -1, 10)}
                  <g transform={`translate(${pHFoot.x - 26}, ${(pTL.y + pHFoot.y) / 2})`}>
                    <rect
                      x="-24"
                      y="-10"
                      width="48"
                      height="20"
                      rx="3"
                      fill={theme.dimensionBg}
                      stroke={theme.heightLine}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={theme.heightLine}
                      fontSize="9.5"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {formatLabel(getParam('height')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Bottom base b */}
              {renderDimensionLine('base_b', pBL, pBR, 42)}

              {/* Top base a */}
              {renderDimensionLine('base_a', pTL, pTR, -38)}

              {/* Left leg */}
              {renderDimensionLine('leg_left', pTL, pBL, 42)}

              {/* Right leg */}
              {renderDimensionLine('leg_right', pBR, pTR, 42)}

              {/* Area and Perimeter strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(100 + b / 2, bottomMetricsY)}
            </>
          ),
        };
      }

      case 'circle': {
        const rawR = p('radius', 5);
        const r = 110; // fixed display radius
        const cX = 250;
        const cY = 210;

        const showRadius = isVis('radius');
        const showDiameter = isVis('diameter');

        // Radius line at 38 degrees
        const angleRad = (38 * Math.PI) / 180;
        const rEdge = { x: cX + r * Math.cos(angleRad), y: cY - r * Math.sin(angleRad) };

        // Center marker (+)
        const cCross = 8;
        const bottomCircleY = cY + r;
        const bottomMetricsY = bottomCircleY + 54;
        const totalHeight = bottomMetricsY + 44;

        return {
          viewBox: `20 15 460 ${totalHeight}`,
          elements: (
            <>
              {/* Main Circle */}
              <circle
                cx={cX}
                cy={cY}
                r={r}
                fill={theme.shapeFill}
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
              />

              {/* Center crosshair */}
              <line
                x1={cX - cCross}
                y1={cY}
                x2={cX + cCross}
                y2={cY}
                stroke={theme.dimensionLine}
                strokeWidth="1.5"
              />
              <line
                x1={cX}
                y1={cY - cCross}
                x2={cX}
                y2={cY + cCross}
                stroke={theme.dimensionLine}
                strokeWidth="1.5"
              />

              {/* Diameter line through center if visible */}
              {showDiameter && (
                <g
                  className="cursor-pointer"
                  onMouseEnter={() => onHoverParam?.('diameter')}
                  onMouseLeave={() => onHoverParam?.(null)}
                  onClick={() => onToggleParamVisibility?.('diameter')}
                >
                  <line
                    x1={cX - r}
                    y1={cY}
                    x2={cX + r}
                    y2={cY}
                    stroke={theme.heightLine}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    markerStart={`url(#${arrowRevMarkerId})`}
                    markerEnd={`url(#${arrowMarkerId})`}
                  />
                  <g transform={`translate(${cX}, ${cY - 18})`}>
                    <rect
                      x="-38"
                      y="-10"
                      width="76"
                      height="20"
                      rx="3"
                      fill={theme.dimensionBg}
                      stroke={theme.heightLine}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={theme.heightLine}
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {formatLabel(getParam('diameter')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Radius line from center to edge */}
              {showRadius && (
                <g
                  className="cursor-pointer"
                  onMouseEnter={() => onHoverParam?.('radius')}
                  onMouseLeave={() => onHoverParam?.(null)}
                  onClick={() => onToggleParamVisibility?.('radius')}
                >
                  <line
                    x1={cX}
                    y1={cY}
                    x2={rEdge.x}
                    y2={rEdge.y}
                    stroke={theme.dimensionLine}
                    strokeWidth="1.75"
                    markerEnd={`url(#${arrowMarkerId})`}
                  />
                  <g transform={`translate(${(cX + rEdge.x) / 2 - 8}, ${(cY + rEdge.y) / 2 - 14})`}>
                    <rect
                      x="-30"
                      y="-10"
                      width="60"
                      height="20"
                      rx="3"
                      fill={theme.dimensionBg}
                      stroke={theme.dimensionLine}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={theme.dimensionText}
                      fontSize="10.5"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {formatLabel(getParam('radius')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Area and Perimeter strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(cX, bottomMetricsY, { perimeterId: 'circumference' })}
            </>
          ),
        };
      }

      case 'ellipse': {
        const rawA = p('semi_major', 8);
        const rawB = p('semi_minor', 5);
        const rX = 135;
        const rY = 85;
        const cX = 250;
        const cY = 210;

        const showMajor = isVis('semi_major');
        const showMinor = isVis('semi_minor');
        const showFocal = isVis('focal_distance');

        const focalDistPx = Math.sqrt(Math.max(0, rX * rX - rY * rY));
        const bottomEllipseY = cY + rY;
        const bottomMetricsY = bottomEllipseY + 54;
        const totalHeight = bottomMetricsY + 44;

        return {
          viewBox: `20 15 460 ${totalHeight}`,
          elements: (
            <>
              {/* Ellipse curve */}
              <ellipse
                cx={cX}
                cy={cY}
                rx={rX}
                ry={rY}
                fill={theme.shapeFill}
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
              />

              {/* Center Crosshair */}
              <line x1={cX - 8} y1={cY} x2={cX + 8} y2={cY} stroke={theme.dimensionLine} strokeWidth="1.5" />
              <line x1={cX} y1={cY - 8} x2={cX + 8} y2={cY + 8} stroke={theme.dimensionLine} strokeWidth="1.5" />

              {/* Foci points */}
              {showFocal && (
                <g>
                  <circle cx={cX - focalDistPx} cy={cY} r="3" fill={theme.heightLine} />
                  <circle cx={cX + focalDistPx} cy={cY} r="3" fill={theme.heightLine} />
                  <text x={cX - focalDistPx} y={cY - 8} textAnchor="middle" fill={theme.heightLine} fontSize="9" fontWeight="bold">F₁</text>
                  <text x={cX + focalDistPx} y={cY - 8} textAnchor="middle" fill={theme.heightLine} fontSize="9" fontWeight="bold">F₂</text>
                </g>
              )}

              {/* Semi-major axis dimension (horizontal) */}
              {showMajor && (
                <g
                  className="cursor-pointer"
                  onMouseEnter={() => onHoverParam?.('semi_major')}
                  onMouseLeave={() => onHoverParam?.(null)}
                  onClick={() => onToggleParamVisibility?.('semi_major')}
                >
                  <line
                    x1={cX}
                    y1={cY}
                    x2={cX + rX}
                    y2={cY}
                    stroke={theme.dimensionLine}
                    strokeWidth="1.75"
                    markerEnd={`url(#${arrowMarkerId})`}
                  />
                  <g transform={`translate(${cX + rX / 2}, ${cY - 16})`}>
                    <rect x="-30" y="-10" width="60" height="20" rx="3" fill={theme.dimensionBg} stroke={theme.dimensionLine} strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" fill={theme.dimensionText} fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                      {formatLabel(getParam('semi_major')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Semi-minor axis dimension (vertical) */}
              {showMinor && (
                <g
                  className="cursor-pointer"
                  onMouseEnter={() => onHoverParam?.('semi_minor')}
                  onMouseLeave={() => onHoverParam?.(null)}
                  onClick={() => onToggleParamVisibility?.('semi_minor')}
                >
                  <line
                    x1={cX}
                    y1={cY}
                    x2={cX}
                    y2={cY - rY}
                    stroke={theme.dimensionLine}
                    strokeWidth="1.75"
                    markerEnd={`url(#${arrowMarkerId})`}
                  />
                  <g transform={`translate(${cX - 40}, ${cY - rY / 2})`}>
                    <rect x="-30" y="-10" width="60" height="20" rx="3" fill={theme.dimensionBg} stroke={theme.dimensionLine} strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" fill={theme.dimensionText} fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                      {formatLabel(getParam('semi_minor')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Area and Perimeter strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(cX, bottomMetricsY, { perimeterId: 'perimeter' })}
            </>
          ),
        };
      }

      case 'sector': {
        const rawR = p('radius', 7);
        const theta = Math.min(350, Math.max(10, p('central_angle', 72)));
        const thetaRad = (theta * Math.PI) / 180;
        const r = 130;
        const cX = 220;
        const cY = 240;

        const pEdge1 = { x: cX + r, y: cY };
        const pEdge2 = { x: cX + r * Math.cos(-thetaRad), y: cY + r * Math.sin(-thetaRad) };

        const largeArc = theta > 180 ? 1 : 0;
        const pathData = `M ${cX} ${cY} L ${pEdge1.x} ${pEdge1.y} A ${r} ${r} 0 ${largeArc} 0 ${pEdge2.x} ${pEdge2.y} Z`;

        const showArc = isVis('arc_length');
        const showChord = isVis('chord_length');

        // Dynamically compute the lowest Y coordinate of the sector including arc and radius arrow
        const arcBottomY = theta > 180 ? cY + r : Math.max(cY, pEdge2.y);
        const maxSectorArrowY = Math.max(arcBottomY, cY + 52);
        const bottomMetricsY = maxSectorArrowY + 54;
        const totalHeight = bottomMetricsY + 44;

        return {
          viewBox: `20 15 460 ${totalHeight}`,
          elements: (
            <>
              {/* Sector Path */}
              <path
                d={pathData}
                fill={theme.shapeFill}
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Chord line if visible */}
              {showChord && (
                <g>
                  <line
                    x1={pEdge1.x}
                    y1={pEdge1.y}
                    x2={pEdge2.x}
                    y2={pEdge2.y}
                    stroke={theme.heightLine}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <g transform={`translate(${(pEdge1.x + pEdge2.x) / 2}, ${(pEdge1.y + pEdge2.y) / 2 - 12})`}>
                    <rect x="-30" y="-10" width="60" height="20" rx="3" fill={theme.dimensionBg} stroke={theme.heightLine} strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" fill={theme.heightLine} fontSize="9.5" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                      {formatLabel(getParam('chord_length')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Radius dimension along bottom edge */}
              {renderDimensionLine('radius', { x: cX, y: cY }, pEdge1, 40)}

              {/* Central Angle arc */}
              {renderAngleArc('central_angle', { x: cX, y: cY }, 0, -thetaRad, 36)}

              {/* Arc length label placed along curved outer arc */}
              {showArc && (
                <g transform={`translate(${cX + (r + 26) * Math.cos(-thetaRad / 2)}, ${cY + (r + 26) * Math.sin(-thetaRad / 2)})`}>
                  <rect x="-36" y="-10" width="72" height="20" rx="3" fill={theme.dimensionBg} stroke={theme.dimensionLine} strokeWidth="1" />
                  <text x="0" y="4" textAnchor="middle" fill={theme.dimensionText} fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                    {formatLabel(getParam('arc_length')!, unit, labelStyle)}
                  </text>
                </g>
              )}

              {/* Area and Perimeter strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(cX, bottomMetricsY)}
            </>
          ),
        };
      }

      case 'regular_polygon': {
        const n = Math.max(3, Math.round(p('num_sides', 6)));
        const R = 115;
        const cX = 250;
        const cY = 210;

        // Generate vertices
        const pts: Point[] = [];
        const startOffsetAngle = -Math.PI / 2 + Math.PI / n;
        for (let i = 0; i < n; i++) {
          const angle = startOffsetAngle + (i * 2 * Math.PI) / n;
          pts.push({
            x: cX + R * Math.cos(angle),
            y: cY + R * Math.sin(angle),
          });
        }

        const ptsString = pts.map((pt) => `${pt.x},${pt.y}`).join(' ');

        // Extents (bounding box)
        const minX = Math.min(...pts.map((pt) => pt.x));
        const maxX = Math.max(...pts.map((pt) => pt.x));
        const minY = Math.min(...pts.map((pt) => pt.y));
        const maxY = Math.max(...pts.map((pt) => pt.y));

        // Extreme vertices
        const minXPt = pts.find((pt) => Math.abs(pt.x - minX) < 0.001) ?? { x: minX, y: cY };
        const maxXPt = pts.find((pt) => Math.abs(pt.x - maxX) < 0.001) ?? { x: maxX, y: cY };
        const topPt = pts.filter((pt) => Math.abs(pt.y - minY) < 0.001).sort((a, b) => a.x - b.x)[0] ?? { x: cX, y: minY };
        const bottomPt = pts.filter((pt) => Math.abs(pt.y - maxY) < 0.001).sort((a, b) => a.x - b.x)[0] ?? { x: cX, y: maxY };

        // Apothem: line from center to midpoint of bottom edge
        // Find bottom-most edge (highest Y coordinates)
        let bottomIdx = 0;
        let maxAvgY = -Infinity;
        for (let i = 0; i < n; i++) {
          const nextIdx = (i + 1) % n;
          const avgY = (pts[i].y + pts[nextIdx].y) / 2;
          if (avgY > maxAvgY) {
            maxAvgY = avgY;
            bottomIdx = i;
          }
        }
        const bP1 = pts[bottomIdx];
        const bP2 = pts[(bottomIdx + 1) % n];
        const midBottom = { x: (bP1.x + bP2.x) / 2, y: (bP1.y + bP2.y) / 2 };

        // Ensure side length dimension line and label are placed OUTSIDE the polygon
        const edgeDx = bP2.x - bP1.x;
        const edgeDy = bP2.y - bP1.y;
        const edgeLen = Math.hypot(edgeDx, edgeDy);
        const normX = -edgeDy / edgeLen;
        const normY = edgeDx / edgeLen;
        // Dot product with outward vector from center:
        const outDot = normX * (midBottom.x - cX) + normY * (midBottom.y - cY);
        const outwardSideOffset = outDot >= 0 ? 38 : -38;

        const showApothem = isVis('apothem');
        const showCircumradius = isVis('circumradius');
        const showFullWidth = isVis('full_width');
        const showFullHeight = isVis('full_height');

        // Dynamically compute max Y of all vertices & bottom side dimension arrow placed outside
        const maxVertexY = maxY;
        const sideDimY = midBottom.y + Math.max(0, normY * outwardSideOffset);
        const maxPolygonArrowY = Math.max(maxVertexY, sideDimY + 20);
        const bottomMetricsY = maxPolygonArrowY + 54;
        const totalHeight = bottomMetricsY + 44;

        return {
          viewBox: `10 10 480 ${totalHeight}`,
          elements: (
            <>
              {/* Full Width projection guide lines & dimension line (top) */}
              {showFullWidth && (
                <g key="full-width-group">
                  {minXPt.y > minY && (
                    <line
                      x1={minX}
                      y1={minXPt.y}
                      x2={minX}
                      y2={minY}
                      stroke={theme.dimensionLine}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      opacity="0.5"
                    />
                  )}
                  {maxXPt.y > minY && (
                    <line
                      x1={maxX}
                      y1={maxXPt.y}
                      x2={maxX}
                      y2={minY}
                      stroke={theme.dimensionLine}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      opacity="0.5"
                    />
                  )}
                  {renderDimensionLine('full_width', { x: minX, y: minY }, { x: maxX, y: minY }, -38)}
                </g>
              )}

              {/* Full Height projection guide lines & dimension line (left) */}
              {showFullHeight && (
                <g key="full-height-group">
                  {topPt.x > minX && (
                    <line
                      x1={minX}
                      y1={minY}
                      x2={topPt.x}
                      y2={minY}
                      stroke={theme.dimensionLine}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      opacity="0.5"
                    />
                  )}
                  {bottomPt.x > minX && (
                    <line
                      x1={minX}
                      y1={maxY}
                      x2={bottomPt.x}
                      y2={maxY}
                      stroke={theme.dimensionLine}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      opacity="0.5"
                    />
                  )}
                  {renderDimensionLine('full_height', { x: minX, y: minY }, { x: minX, y: maxY }, 42)}
                </g>
              )}

              {/* Polygon outline */}
              <polygon
                points={ptsString}
                fill={theme.shapeFill}
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Center point */}
              <circle cx={cX} cy={cY} r="3" fill={theme.dimensionLine} />

              {/* Circumradius line from center to a vertex */}
              {showCircumradius && (
                <g>
                  <line
                    x1={cX}
                    y1={cY}
                    x2={pts[0].x}
                    y2={pts[0].y}
                    stroke={theme.dimensionLine}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <g transform={`translate(${(cX + pts[0].x) / 2 - 20}, ${(cY + pts[0].y) / 2})`}>
                    <rect x="-24" y="-10" width="48" height="20" rx="3" fill={theme.dimensionBg} stroke={theme.dimensionLine} strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" fill={theme.dimensionText} fontSize="9.5" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                      {formatLabel(getParam('circumradius')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Apothem line from center to bottom edge midpoint */}
              {showApothem && (
                <g>
                  <line
                    x1={cX}
                    y1={cY}
                    x2={midBottom.x}
                    y2={midBottom.y}
                    stroke={theme.heightLine}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  {renderRightAngleSquare(midBottom, 1, -1, 10)}
                  <g transform={`translate(${midBottom.x + 24}, ${(cY + midBottom.y) / 2})`}>
                    <rect x="-26" y="-10" width="52" height="20" rx="3" fill={theme.dimensionBg} stroke={theme.heightLine} strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" fill={theme.heightLine} fontSize="9.5" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                      {formatLabel(getParam('apothem')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Side length dimension along bottom edge - placed OUTSIDE the figure */}
              {renderDimensionLine('side_length', bP1, bP2, outwardSideOffset)}

              {/* Area and Perimeter strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(cX, bottomMetricsY)}
            </>
          ),
        };
      }

      // --- 3D FIGURES (ISOMETRIC / TECHNICAL AXONOMETRIC DRAFTING) ---
      case 'cuboid': {
        const rawL = p('length', 9);
        const rawW = p('width', 5);
        const rawH = p('height', 6);

        // Isometric projection constants
        const isoAngle = Math.PI / 6; // 30 deg
        const cosIso = Math.cos(isoAngle);
        const sinIso = Math.sin(isoAngle);

        const scale = 14;
        const l = rawL * scale;
        const w = rawW * scale;
        const h = rawH * scale;

        const origin: Point = { x: 230, y: 260 };

        // Front Face
        const p0 = origin; // bottom-front-left
        const p1 = { x: p0.x + l, y: p0.y }; // bottom-front-right
        const p2 = { x: p1.x, y: p1.y - h }; // top-front-right
        const p3 = { x: p0.x, y: p0.y - h }; // top-front-left

        // Top Face (extending back-up at 30 deg)
        const p4 = { x: p3.x + w * cosIso, y: p3.y - w * sinIso }; // top-back-left
        const p5 = { x: p2.x + w * cosIso, y: p2.y - w * sinIso }; // top-back-right

        // Right Face
        const p6 = { x: p1.x + w * cosIso, y: p1.y - w * sinIso }; // bottom-back-right

        // Hidden Back Corner
        const pBack = { x: p0.x + w * cosIso, y: p0.y - w * sinIso };

        const showDiagonal = isVis('space_diagonal');
        const bottomDimY = p0.y + 40;
        const bottomMetricsY = bottomDimY + 54;
        const totalHeight = bottomMetricsY + 44;

        return {
          viewBox: `20 15 460 ${totalHeight}`,
          elements: (
            <>
              {/* Hidden Back Edges (dashed) */}
              <line x1={p0.x} y1={p0.y} x2={pBack.x} y2={pBack.y} stroke={theme.shapeStroke} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <line x1={pBack.x} y1={pBack.y} x2={p6.x} y2={p6.y} stroke={theme.shapeStroke} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <line x1={pBack.x} y1={pBack.y} x2={p4.x} y2={p4.y} stroke={theme.shapeStroke} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

              {/* Space Diagonal if visible */}
              {showDiagonal && (
                <g>
                  <line
                    x1={p0.x}
                    y1={p0.y}
                    x2={p5.x}
                    y2={p5.y}
                    stroke={theme.heightLine}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <g transform={`translate(${(p0.x + p5.x) / 2}, ${(p0.y + p5.y) / 2 - 16})`}>
                    <rect x="-36" y="-10" width="72" height="20" rx="3" fill={theme.dimensionBg} stroke={theme.heightLine} strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" fill={theme.heightLine} fontSize="9.5" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                      {formatLabel(getParam('space_diagonal')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Top Face */}
              <polygon
                points={`${p3.x},${p3.y} ${p2.x},${p2.y} ${p5.x},${p5.y} ${p4.x},${p4.y}`}
                fill={theme.shapeFill}
                fillOpacity="0.45"
                stroke={theme.shapeStroke}
                strokeWidth="2"
              />

              {/* Right Face */}
              <polygon
                points={`${p1.x},${p1.y} ${p6.x},${p6.y} ${p5.x},${p5.y} ${p2.x},${p2.y}`}
                fill={theme.shapeFill}
                fillOpacity="0.3"
                stroke={theme.shapeStroke}
                strokeWidth="2"
              />

              {/* Front Face */}
              <polygon
                points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
                fill={theme.shapeFill}
                fillOpacity="0.75"
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
              />

              {/* Length dimension (front bottom) */}
              {renderDimensionLine('length', p0, p1, 40)}

              {/* Height dimension (front left) */}
              {renderDimensionLine('height', p3, p0, 40)}

              {/* Width / Depth dimension along top right edge */}
              {renderDimensionLine('width', p2, p5, -34)}

              {/* Surface Area and Volume strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics((p0.x + p1.x) / 2, bottomMetricsY, { areaId: 'surface_area', perimeterId: 'volume' })}
            </>
          ),
        };
      }

      case 'cylinder': {
        const rawR = p('radius', 4);
        const rawH = p('height', 10);
        const rX = 75;
        const rY = 25;
        const h = 160;

        const cX = 250;
        const topY = 120;
        const botY = topY + h;

        const showRadius = isVis('radius');
        const showDiameter = isVis('diameter');
        const bottomCylinderY = botY + rY;
        const bottomMetricsY = bottomCylinderY + 54;
        const totalHeight = bottomMetricsY + 44;

        return {
          viewBox: `20 15 460 ${totalHeight}`,
          elements: (
            <>
              {/* Bottom dashed back ellipse */}
              <path
                d={`M ${cX - rX} ${botY} A ${rX} ${rY} 0 0 1 ${cX + rX} ${botY}`}
                fill="none"
                stroke={theme.shapeStroke}
                strokeWidth="1.25"
                strokeDasharray="4 3"
              />

              {/* Lower front curved boundary */}
              <path
                d={`M ${cX - rX} ${botY} A ${rX} ${rY} 0 0 0 ${cX + rX} ${botY}`}
                fill="none"
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
              />

              {/* Vertical side walls */}
              <line x1={cX - rX} y1={topY} x2={cX - rX} y2={botY} stroke={theme.shapeStroke} strokeWidth="2.5" />
              <line x1={cX + rX} y1={topY} x2={cX + rX} y2={botY} stroke={theme.shapeStroke} strokeWidth="2.5" />

              {/* Cylinder lateral fill */}
              <path
                d={`M ${cX - rX} ${topY} L ${cX - rX} ${botY} A ${rX} ${rY} 0 0 0 ${cX + rX} ${botY} L ${cX + rX} ${topY} Z`}
                fill={theme.shapeFill}
                fillOpacity="0.45"
              />

              {/* Top Face Ellipse */}
              <ellipse
                cx={cX}
                cy={topY}
                rx={rX}
                ry={rY}
                fill={theme.shapeFill}
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
              />

              {/* Center point on top base */}
              <circle cx={cX} cy={topY} r="2.5" fill={theme.dimensionLine} />

              {/* Radius line on top base */}
              {showRadius && (
                <g>
                  <line
                    x1={cX}
                    y1={topY}
                    x2={cX + rX}
                    y2={topY}
                    stroke={theme.dimensionLine}
                    strokeWidth="1.5"
                    markerEnd={`url(#${arrowMarkerId})`}
                  />
                  <g transform={`translate(${cX + rX / 2}, ${topY - 14})`}>
                    <rect x="-24" y="-9" width="48" height="18" rx="3" fill={theme.dimensionBg} stroke={theme.dimensionLine} strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" fill={theme.dimensionText} fontSize="9.5" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                      {formatLabel(getParam('radius')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Height dimension line (right side) */}
              {renderDimensionLine('height', { x: cX + rX, y: topY }, { x: cX + rX, y: botY }, -36)}

              {/* Surface Area and Volume strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(cX, bottomMetricsY, { areaId: 'surface_area', perimeterId: 'volume' })}
            </>
          ),
        };
      }

      case 'cone': {
        const rawR = p('radius', 5);
        const rawH = p('height', 8);
        const rX = 85;
        const rY = 26;
        const h = 180;

        const cX = 250;
        const apexY = 80;
        const botY = apexY + h;

        const pApex = { x: cX, y: apexY };
        const pLeft = { x: cX - rX, y: botY };
        const pRight = { x: cX + rX, y: botY };

        const showRadius = isVis('radius');
        const showHeight = isVis('height');
        const showSlant = isVis('slant_height');

        const bottomConeY = botY + rY;
        const maxConeArrowY = Math.max(bottomConeY, botY + 28);
        const bottomMetricsY = maxConeArrowY + 54;
        const totalHeight = bottomMetricsY + 44;

        return {
          viewBox: `20 15 460 ${totalHeight}`,
          elements: (
            <>
              {/* Back dashed ellipse half */}
              <path
                d={`M ${pLeft.x} ${botY} A ${rX} ${rY} 0 0 1 ${pRight.x} ${botY}`}
                fill="none"
                stroke={theme.shapeStroke}
                strokeWidth="1.25"
                strokeDasharray="4 3"
              />

              {/* Front solid ellipse half */}
              <path
                d={`M ${pLeft.x} ${botY} A ${rX} ${rY} 0 0 0 ${pRight.x} ${botY}`}
                fill="none"
                stroke={theme.shapeStroke}
                strokeWidth="2.5"
              />

              {/* Cone body fill */}
              <path
                d={`M ${pApex.x} ${pApex.y} L ${pLeft.x} ${botY} A ${rX} ${rY} 0 0 0 ${pRight.x} ${botY} Z`}
                fill={theme.shapeFill}
                fillOpacity="0.5"
              />

              {/* Silhouette slant edges */}
              <line x1={pApex.x} y1={pApex.y} x2={pLeft.x} y2={botY} stroke={theme.shapeStroke} strokeWidth="2.5" />
              <line x1={pApex.x} y1={pApex.y} x2={pRight.x} y2={botY} stroke={theme.shapeStroke} strokeWidth="2.5" />

              {/* Center altitude height axis (dashed) */}
              {showHeight && (
                <g>
                  <line
                    x1={pApex.x}
                    y1={pApex.y}
                    x2={cX}
                    y2={botY}
                    stroke={theme.heightLine}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  {renderRightAngleSquare({ x: cX, y: botY }, 1, -1, 10)}
                  <g transform={`translate(${cX - 24}, ${apexY + h / 2})`}>
                    <rect x="-24" y="-10" width="48" height="20" rx="3" fill={theme.dimensionBg} stroke={theme.heightLine} strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" fill={theme.heightLine} fontSize="9.5" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                      {formatLabel(getParam('height')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Base radius line */}
              {showRadius && (
                <g>
                  <line
                    x1={cX}
                    y1={botY}
                    x2={pRight.x}
                    y2={botY}
                    stroke={theme.dimensionLine}
                    strokeWidth="1.5"
                    markerEnd={`url(#${arrowMarkerId})`}
                  />
                  <g transform={`translate(${cX + rX / 2}, ${botY + 16})`}>
                    <rect x="-24" y="-9" width="48" height="18" rx="3" fill={theme.dimensionBg} stroke={theme.dimensionLine} strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" fill={theme.dimensionText} fontSize="9.5" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                      {formatLabel(getParam('radius')!, unit, labelStyle)}
                    </text>
                  </g>
                </g>
              )}

              {/* Slant Height dimension line along right edge */}
              {renderDimensionLine('slant_height', pApex, pRight, -38)}

              {/* Surface Area and Volume strictly below the figure and below any other data or arrow */}
              {renderBottomMetrics(cX, bottomMetricsY, { areaId: 'surface_area', perimeterId: 'volume' })}
            </>
          ),
        };
      }

      default:
        return {
          viewBox: '0 0 500 400',
          elements: <text x="250" y="200" textAnchor="middle">Figure preview</text>,
        };
    }
  }, [figure, paramMap, theme, unit, labelStyle, hoveredParamId, arrowMarkerId, arrowRevMarkerId]);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center p-4 select-none overflow-hidden"
      style={{ backgroundColor: theme.canvasBg }}
    >
      <svg
        ref={svgRef}
        id="geometric-canvas-svg"
        viewBox={renderedContent.viewBox}
        className="w-full h-full max-h-[560px] drop-shadow-sm transition-all duration-200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Grid pattern: Lines */}
          <pattern id={`${patternId}-lines`} width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke={theme.gridColor} strokeWidth="0.75" />
          </pattern>

          {/* Grid pattern: Dots */}
          <pattern id={`${patternId}-dots`} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.25" fill={theme.gridColor} />
          </pattern>

          {/* Dimension Arrowhead Markers */}
          <marker
            id={arrowMarkerId}
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={theme.dimensionLine} />
          </marker>
          <marker
            id={arrowRevMarkerId}
            viewBox="0 0 10 10"
            refX="4"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill={theme.dimensionLine} />
          </marker>
        </defs>

        {/* Background Grid */}
        {showGrid && gridType !== 'none' && (
          <rect
            id="figure-grid-bg"
            className="figure-grid-bg"
            x="-500"
            y="-500"
            width="2000"
            height="2000"
            fill={`url(#${patternId}-${gridType === 'dots' ? 'dots' : 'lines'})`}
          />
        )}

        {/* Rendered Geometry */}
        <g id="figure-content-root" className="figure-content-root">
          {renderedContent.elements}
        </g>
      </svg>
    </div>
  );
};
