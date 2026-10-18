export type Unit = 'cm' | 'mm' | 'm' | 'in' | 'ft';

export type FigureCategory = 'triangles' | 'quadrilaterals' | 'curved' | 'polygons' | '3d';

export type FigureId =
  | 'right_triangle'
  | 'equilateral_triangle'
  | 'isosceles_triangle'
  | 'scalene_triangle'
  | 'rectangle'
  | 'square'
  | 'parallelogram'
  | 'rhombus'
  | 'trapezoid'
  | 'circle'
  | 'ellipse'
  | 'regular_polygon'
  | 'sector'
  | 'cuboid'
  | 'cylinder'
  | 'cone';

export type ParameterType = 'length' | 'angle' | 'area' | 'volume' | 'count';

export interface Parameter {
  id: string;
  name: string;
  symbol: string;
  type: ParameterType;
  value: number;
  isVisible: boolean;
  isDerived?: boolean;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  precision?: number;
}

export interface FigureDefinition {
  id: FigureId;
  name: string;
  category: FigureCategory;
  shortDesc: string;
  description: string;
  parameters: Parameter[];
}

export type ThemeId = 'textbook' | 'blueprint' | 'dark' | 'monochrome';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  canvasBg: string;
  gridColor: string;
  shapeFill: string;
  shapeStroke: string;
  dimensionLine: string;
  dimensionText: string;
  dimensionBg: string;
  angleArc: string;
  heightLine: string;
  accent: string;
}

export type LabelStyle = 'value_only' | 'symbol_and_value' | 'full_name_and_value';
