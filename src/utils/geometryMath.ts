import { FigureDefinition, FigureId, Parameter, ParameterType, Unit, LabelStyle } from '../types/geometry';

export const UNIT_FACTORS: Record<Unit, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  in: 25.4,
  ft: 304.8,
};

export const INITIAL_FIGURES: FigureDefinition[] = [
  // --- TRIANGLES ---
  {
    id: 'right_triangle',
    name: 'Right Triangle',
    category: 'triangles',
    shortDesc: 'Triangle with a 90° right angle',
    description: 'A three-sided polygon with one interior angle equal to 90 degrees. Satisfies the Pythagorean Theorem: a² + b² = c².',
    parameters: [
      { id: 'side_a', name: 'Base / Leg (a)', symbol: 'a', type: 'length', value: 8, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'side_b', name: 'Height / Leg (b)', symbol: 'b', type: 'length', value: 6, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'hypotenuse', name: 'Hypotenuse (c)', symbol: 'c', type: 'length', value: 10, isVisible: true, isDerived: true, precision: 2 },
      { id: 'angle_alpha', name: 'Base Angle (α)', symbol: 'α', type: 'angle', value: 36.87, isVisible: true, isDerived: true, precision: 2 },
      { id: 'angle_beta', name: 'Apex Angle (β)', symbol: 'β', type: 'angle', value: 53.13, isVisible: true, isDerived: true, precision: 2 },
      { id: 'altitude', name: 'Altitude to Hypotenuse', symbol: 'hc', type: 'length', value: 4.8, isVisible: false, isDerived: true, precision: 2 },
      { id: 'perimeter', name: 'Perimeter', symbol: 'P', type: 'length', value: 24, isVisible: true, isDerived: true, precision: 2 },
      { id: 'area', name: 'Area', symbol: 'A', type: 'area', value: 24, isVisible: true, isDerived: true, precision: 2 },
    ],
  },
  {
    id: 'equilateral_triangle',
    name: 'Equilateral Triangle',
    category: 'triangles',
    shortDesc: 'All three sides and angles equal',
    description: 'A regular triangle where all three sides have equal length and all interior angles measure exactly 60°.',
    parameters: [
      { id: 'side_a', name: 'Side Length (a)', symbol: 'a', type: 'length', value: 10, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'height', name: 'Height (h)', symbol: 'h', type: 'length', value: 8.66, isVisible: true, isDerived: true, precision: 2 },
      { id: 'angle_all', name: 'Interior Angles', symbol: 'θ', type: 'angle', value: 60, isVisible: true, isDerived: true, precision: 0 },
      { id: 'perimeter', name: 'Perimeter', symbol: 'P', type: 'length', value: 30, isVisible: true, isDerived: true, precision: 2 },
      { id: 'area', name: 'Area', symbol: 'A', type: 'area', value: 43.3, isVisible: true, isDerived: true, precision: 2 },
    ],
  },
  {
    id: 'isosceles_triangle',
    name: 'Isosceles Triangle',
    category: 'triangles',
    shortDesc: 'Two equal sides and two equal angles',
    description: 'A triangle with at least two sides of equal length. The angles opposite the equal sides are also congruent.',
    parameters: [
      { id: 'base', name: 'Base (b)', symbol: 'b', type: 'length', value: 8, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'leg', name: 'Equal Legs (a)', symbol: 'a', type: 'length', value: 7, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'height', name: 'Height (h)', symbol: 'h', type: 'length', value: 5.74, isVisible: true, isDerived: true, precision: 2 },
      { id: 'angle_base', name: 'Base Angles (α)', symbol: 'α', type: 'angle', value: 55.15, isVisible: true, isDerived: true, precision: 2 },
      { id: 'angle_vertex', name: 'Vertex Angle (β)', symbol: 'β', type: 'angle', value: 69.7, isVisible: true, isDerived: true, precision: 2 },
      { id: 'perimeter', name: 'Perimeter', symbol: 'P', type: 'length', value: 22, isVisible: true, isDerived: true, precision: 2 },
      { id: 'area', name: 'Area', symbol: 'A', type: 'area', value: 22.98, isVisible: true, isDerived: true, precision: 2 },
    ],
  },
  {
    id: 'scalene_triangle',
    name: 'Scalene Triangle',
    category: 'triangles',
    shortDesc: 'All sides and angles of different lengths',
    description: 'A general triangle where no two sides are equal and all three interior angles are distinct.',
    parameters: [
      { id: 'side_a', name: 'Base (a)', symbol: 'a', type: 'length', value: 10, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'side_b', name: 'Side (b)', symbol: 'b', type: 'length', value: 8, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'angle_c', name: 'Included Angle (γ)', symbol: 'γ', type: 'angle', value: 55, isVisible: true, min: 1, max: 179, step: 0.01, precision: 2 },
      { id: 'side_c', name: 'Third Side (c)', symbol: 'c', type: 'length', value: 8.5, isVisible: true, isDerived: true, precision: 2 },
      { id: 'angle_a', name: 'Angle (α)', symbol: 'α', type: 'angle', value: 74.62, isVisible: true, isDerived: true, precision: 2 },
      { id: 'angle_b', name: 'Angle (β)', symbol: 'β', type: 'angle', value: 50.38, isVisible: false, isDerived: true, precision: 2 },
      { id: 'height', name: 'Height (h)', symbol: 'h', type: 'length', value: 6.55, isVisible: true, isDerived: true, precision: 2 },
      { id: 'perimeter', name: 'Perimeter', symbol: 'P', type: 'length', value: 26.5, isVisible: true, isDerived: true, precision: 2 },
      { id: 'area', name: 'Area', symbol: 'A', type: 'area', value: 32.77, isVisible: true, isDerived: true, precision: 2 },
    ],
  },

  // --- QUADRILATERALS ---
  {
    id: 'rectangle',
    name: 'Rectangle',
    category: 'quadrilaterals',
    shortDesc: 'Four right angles with opposite equal sides',
    description: 'A 2D quadrilateral with four right angles (90°). Opposite sides are equal in length and parallel.',
    parameters: [
      { id: 'width', name: 'Width / Base (w)', symbol: 'w', type: 'length', value: 12, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'height', name: 'Height / Length (h)', symbol: 'h', type: 'length', value: 7, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'diagonal', name: 'Diagonal (d)', symbol: 'd', type: 'length', value: 13.89, isVisible: true, isDerived: true, precision: 2 },
      { id: 'perimeter', name: 'Perimeter', symbol: 'P', type: 'length', value: 38, isVisible: true, isDerived: true, precision: 2 },
      { id: 'area', name: 'Area', symbol: 'A', type: 'area', value: 84, isVisible: true, isDerived: true, precision: 2 },
    ],
  },
  {
    id: 'square',
    name: 'Square',
    category: 'quadrilaterals',
    shortDesc: 'Four equal sides and four right angles',
    description: 'A regular quadrilateral with four equal sides and four right angles (90°). Both a rhombus and a rectangle.',
    parameters: [
      { id: 'side', name: 'Side Length (s)', symbol: 's', type: 'length', value: 8, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'diagonal', name: 'Diagonal (d)', symbol: 'd', type: 'length', value: 11.31, isVisible: true, isDerived: true, precision: 2 },
      { id: 'perimeter', name: 'Perimeter', symbol: 'P', type: 'length', value: 32, isVisible: true, isDerived: true, precision: 2 },
      { id: 'area', name: 'Area', symbol: 'A', type: 'area', value: 64, isVisible: true, isDerived: true, precision: 2 },
    ],
  },
  {
    id: 'parallelogram',
    name: 'Parallelogram',
    category: 'quadrilaterals',
    shortDesc: 'Opposite sides parallel and equal',
    description: 'A simple quadrilateral with two pairs of parallel sides. Opposite angles are equal.',
    parameters: [
      { id: 'base', name: 'Base (b)', symbol: 'b', type: 'length', value: 10, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'side', name: 'Slanted Side (a)', symbol: 'a', type: 'length', value: 6, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'angle', name: 'Acute Angle (θ)', symbol: 'θ', type: 'angle', value: 60, isVisible: true, min: 1, max: 89, step: 0.01, precision: 2 },
      { id: 'height', name: 'Height (h)', symbol: 'h', type: 'length', value: 5.2, isVisible: true, isDerived: true, precision: 2 },
      { id: 'diagonal_1', name: 'Long Diagonal (d1)', symbol: 'd1', type: 'length', value: 13.99, isVisible: true, isDerived: true, precision: 2 },
      { id: 'diagonal_2', name: 'Short Diagonal (d2)', symbol: 'd2', type: 'length', value: 8.72, isVisible: false, isDerived: true, precision: 2 },
      { id: 'perimeter', name: 'Perimeter', symbol: 'P', type: 'length', value: 32, isVisible: true, isDerived: true, precision: 2 },
      { id: 'area', name: 'Area', symbol: 'A', type: 'area', value: 51.96, isVisible: true, isDerived: true, precision: 2 },
    ],
  },
  {
    id: 'rhombus',
    name: 'Rhombus',
    category: 'quadrilaterals',
    shortDesc: 'Equilateral quadrilateral with perpendicular diagonals',
    description: 'A quadrilateral whose four sides all have the same length. Diagonals bisect each other at right angles (90°).',
    parameters: [
      { id: 'side', name: 'Side Length (a)', symbol: 'a', type: 'length', value: 8, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'angle', name: 'Acute Angle (θ)', symbol: 'θ', type: 'angle', value: 60, isVisible: true, min: 1, max: 89, step: 0.01, precision: 2 },
      { id: 'diagonal_1', name: 'Major Diagonal (d1)', symbol: 'd1', type: 'length', value: 13.86, isVisible: true, isDerived: true, precision: 2 },
      { id: 'diagonal_2', name: 'Minor Diagonal (d2)', symbol: 'd2', type: 'length', value: 8, isVisible: true, isDerived: true, precision: 2 },
      { id: 'height', name: 'Height (h)', symbol: 'h', type: 'length', value: 6.93, isVisible: false, isDerived: true, precision: 2 },
      { id: 'perimeter', name: 'Perimeter', symbol: 'P', type: 'length', value: 32, isVisible: true, isDerived: true, precision: 2 },
      { id: 'area', name: 'Area', symbol: 'A', type: 'area', value: 55.43, isVisible: true, isDerived: true, precision: 2 },
    ],
  },
  {
    id: 'trapezoid',
    name: 'Trapezoid',
    category: 'quadrilaterals',
    shortDesc: 'Quadrilateral with at least one pair of parallel sides',
    description: 'A four-sided flat shape with straight sides that has a pair of opposite parallel sides (bases).',
    parameters: [
      { id: 'base_b', name: 'Bottom Base (b)', symbol: 'b', type: 'length', value: 12, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'base_a', name: 'Top Base (a)', symbol: 'a', type: 'length', value: 6, isVisible: true, min: 0.1, max: 50, step: 0.01, precision: 2 },
      { id: 'height', name: 'Height (h)', symbol: 'h', type: 'length', value: 5, isVisible: true, min: 0.1, max: 50, step: 0.01, precision: 2 },
      { id: 'offset', name: 'Left Inset (x)', symbol: 'x', type: 'length', value: 3, isVisible: false, min: 0, max: 10, step: 0.01, precision: 2 },
      { id: 'leg_left', name: 'Left Leg (c)', symbol: 'c', type: 'length', value: 5.83, isVisible: true, isDerived: true, precision: 2 },
      { id: 'leg_right', name: 'Right Leg (d)', symbol: 'd', type: 'length', value: 5.83, isVisible: true, isDerived: true, precision: 2 },
      { id: 'perimeter', name: 'Perimeter', symbol: 'P', type: 'length', value: 29.66, isVisible: true, isDerived: true, precision: 2 },
      { id: 'area', name: 'Area', symbol: 'A', type: 'area', value: 45, isVisible: true, isDerived: true, precision: 2 },
    ],
  },

  // --- CURVED FIGURES ---
  {
    id: 'circle',
    name: 'Circle',
    category: 'curved',
    shortDesc: 'Set of all points equidistant from center',
    description: 'A round plane figure whose boundary consists of points equidistant from a fixed center point.',
    parameters: [
      { id: 'radius', name: 'Radius (r)', symbol: 'r', type: 'length', value: 5, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'diameter', name: 'Diameter (d)', symbol: 'd', type: 'length', value: 10, isVisible: true, isDerived: true, precision: 2 },
      { id: 'circumference', name: 'Circumference (C)', symbol: 'C', type: 'length', value: 31.42, isVisible: true, isDerived: true, precision: 2 },
      { id: 'area', name: 'Area', symbol: 'A', type: 'area', value: 78.54, isVisible: true, isDerived: true, precision: 2 },
    ],
  },
  {
    id: 'ellipse',
    name: 'Ellipse',
    category: 'curved',
    shortDesc: 'Oval curve with two focal points',
    description: 'A smooth closed curve where the sum of the distances from two focal points to any point on the curve is constant.',
    parameters: [
      { id: 'semi_major', name: 'Semi-Major Axis (a)', symbol: 'a', type: 'length', value: 8, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'semi_minor', name: 'Semi-Minor Axis (b)', symbol: 'b', type: 'length', value: 5, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'focal_distance', name: 'Focal Distance (c)', symbol: 'c', type: 'length', value: 6.24, isVisible: true, isDerived: true, precision: 2 },
      { id: 'eccentricity', name: 'Eccentricity (e)', symbol: 'e', type: 'count', value: 0.78, isVisible: false, isDerived: true, precision: 2 },
      { id: 'perimeter', name: 'Circumference (approx)', symbol: 'C', type: 'length', value: 41.51, isVisible: true, isDerived: true, precision: 2 },
      { id: 'area', name: 'Area', symbol: 'A', type: 'area', value: 125.66, isVisible: true, isDerived: true, precision: 2 },
    ],
  },
  {
    id: 'sector',
    name: 'Circular Sector',
    category: 'curved',
    shortDesc: 'Pie slice of a circle enclosed by two radii and arc',
    description: 'The portion of a disk enclosed by two radii and an arc. Often called a wedge or pie slice.',
    parameters: [
      { id: 'radius', name: 'Radius (r)', symbol: 'r', type: 'length', value: 7, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'central_angle', name: 'Central Angle (θ)', symbol: 'θ', type: 'angle', value: 72, isVisible: true, min: 1, max: 359, step: 0.01, precision: 2 },
      { id: 'arc_length', name: 'Arc Length (L)', symbol: 'L', type: 'length', value: 8.8, isVisible: true, isDerived: true, precision: 2 },
      { id: 'chord_length', name: 'Chord Length (c)', symbol: 'c', type: 'length', value: 8.23, isVisible: true, isDerived: true, precision: 2 },
      { id: 'perimeter', name: 'Perimeter', symbol: 'P', type: 'length', value: 22.8, isVisible: true, isDerived: true, precision: 2 },
      { id: 'area', name: 'Sector Area', symbol: 'A', type: 'area', value: 30.79, isVisible: true, isDerived: true, precision: 2 },
    ],
  },

  // --- REGULAR POLYGONS ---
  {
    id: 'regular_polygon',
    name: 'Regular Polygon',
    category: 'polygons',
    shortDesc: 'Equilateral and equiangular multi-sided shape',
    description: 'A polygon that is equiangular (all angles equal) and equilateral (all sides equal), e.g. Pentagon, Hexagon, Octagon.',
    parameters: [
      { id: 'num_sides', name: 'Number of Sides (n)', symbol: 'n', type: 'count', value: 6, isVisible: true, min: 3, max: 12, step: 1, precision: 0 },
      { id: 'side_length', name: 'Side Length (s)', symbol: 's', type: 'length', value: 6, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'full_width', name: 'Full Width (W)', symbol: 'W', type: 'length', value: 12, isVisible: true, isDerived: true, precision: 2 },
      { id: 'full_height', name: 'Full Height (H)', symbol: 'H', type: 'length', value: 10.39, isVisible: true, isDerived: true, precision: 2 },
      { id: 'circumradius', name: 'Circumradius (R)', symbol: 'R', type: 'length', value: 6, isVisible: false, isDerived: true, precision: 2 },
      { id: 'apothem', name: 'Apothem / Inradius (r)', symbol: 'r', type: 'length', value: 5.2, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'interior_angle', name: 'Interior Angle (θ)', symbol: 'θ', type: 'angle', value: 120, isVisible: false, isDerived: true, precision: 2 },
      { id: 'perimeter', name: 'Perimeter', symbol: 'P', type: 'length', value: 36, isVisible: true, isDerived: true, precision: 2 },
      { id: 'area', name: 'Area', symbol: 'A', type: 'area', value: 93.53, isVisible: true, isDerived: true, precision: 2 },
    ],
  },

  // --- 3D FORMS (TECHNICAL PERSPECTIVE) ---
  {
    id: 'cuboid',
    name: 'Cuboid / Rectangular Prism',
    category: '3d',
    shortDesc: '3D convex polyhedron with 6 rectangular faces',
    description: 'A three-dimensional box-like solid with six rectangular faces. Diagonals connect opposite vertices.',
    parameters: [
      { id: 'length', name: 'Length (l)', symbol: 'l', type: 'length', value: 9, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'width', name: 'Width / Depth (w)', symbol: 'w', type: 'length', value: 5, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'height', name: 'Height (h)', symbol: 'h', type: 'length', value: 6, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'space_diagonal', name: 'Space Diagonal (d)', symbol: 'd', type: 'length', value: 11.92, isVisible: true, isDerived: true, precision: 2 },
      { id: 'surface_area', name: 'Surface Area', symbol: 'SA', type: 'area', value: 258, isVisible: true, isDerived: true, precision: 2 },
      { id: 'volume', name: 'Volume', symbol: 'V', type: 'volume', value: 270, isVisible: true, isDerived: true, precision: 2 },
    ],
  },
  {
    id: 'cylinder',
    name: 'Cylinder',
    category: '3d',
    shortDesc: '3D solid with straight parallel sides and circular ends',
    description: 'A curvilinear geometric shape with two parallel circular bases of equal size and a curved lateral surface.',
    parameters: [
      { id: 'radius', name: 'Base Radius (r)', symbol: 'r', type: 'length', value: 4, isVisible: true, min: 0.1, max: 50, step: 0.01, precision: 2 },
      { id: 'diameter', name: 'Base Diameter (d)', symbol: 'd', type: 'length', value: 8, isVisible: true, isDerived: true, precision: 2 },
      { id: 'height', name: 'Height (h)', symbol: 'h', type: 'length', value: 10, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'surface_area', name: 'Total Surface Area', symbol: 'SA', type: 'area', value: 351.86, isVisible: true, isDerived: true, precision: 2 },
      { id: 'volume', name: 'Volume', symbol: 'V', type: 'volume', value: 502.65, isVisible: true, isDerived: true, precision: 2 },
    ],
  },
  {
    id: 'cone',
    name: 'Right Circular Cone',
    category: '3d',
    shortDesc: '3D shape that tapers smoothly from base to apex',
    description: 'A three-dimensional geometric shape that tapers smoothly from a flat circular base to a point called the apex.',
    parameters: [
      { id: 'radius', name: 'Base Radius (r)', symbol: 'r', type: 'length', value: 5, isVisible: true, min: 0.1, max: 50, step: 0.01, precision: 2 },
      { id: 'height', name: 'Altitude / Height (h)', symbol: 'h', type: 'length', value: 8, isVisible: true, min: 0.1, max: 100, step: 0.01, precision: 2 },
      { id: 'slant_height', name: 'Slant Height (s)', symbol: 's', type: 'length', value: 9.43, isVisible: true, isDerived: true, precision: 2 },
      { id: 'surface_area', name: 'Total Surface Area', symbol: 'SA', type: 'area', value: 226.73, isVisible: true, isDerived: true, precision: 2 },
      { id: 'volume', name: 'Volume', symbol: 'V', type: 'volume', value: 209.44, isVisible: true, isDerived: true, precision: 2 },
    ],
  },
];

export function recalculateParameters(
  figureId: FigureId,
  currentParams: Parameter[],
  changedParamId?: string
): Parameter[] {
  const paramMap = new Map<string, number>();
  currentParams.forEach((p) => paramMap.set(p.id, p.value));

  const get = (id: string, fallback = 1) => paramMap.get(id) ?? fallback;

  const updatedValues: Record<string, number> = {};

  switch (figureId) {
    case 'right_triangle': {
      const a = Math.max(0.01, get('side_a'));
      const b = Math.max(0.01, get('side_b'));
      const c = Math.sqrt(a * a + b * b);
      const alpha = Math.atan2(b, a) * (180 / Math.PI);
      const beta = 90 - alpha;
      const altitude = (a * b) / c;
      const perimeter = a + b + c;
      const area = 0.5 * a * b;

      updatedValues.hypotenuse = c;
      updatedValues.angle_alpha = alpha;
      updatedValues.angle_beta = beta;
      updatedValues.altitude = altitude;
      updatedValues.perimeter = perimeter;
      updatedValues.area = area;
      break;
    }

    case 'equilateral_triangle': {
      const a = Math.max(0.01, get('side_a'));
      const h = (a * Math.sqrt(3)) / 2;
      const perimeter = 3 * a;
      const area = (Math.sqrt(3) / 4) * a * a;

      updatedValues.height = h;
      updatedValues.angle_all = 60;
      updatedValues.perimeter = perimeter;
      updatedValues.area = area;
      break;
    }

    case 'isosceles_triangle': {
      const b = Math.max(0.01, get('base'));
      let a = Math.max(0.01, get('leg'));
      if (a <= b / 2) {
        a = b / 2 + 0.1;
      }
      const h = Math.sqrt(Math.max(0.001, a * a - (b / 2) * (b / 2)));
      const alpha = Math.atan2(h, b / 2) * (180 / Math.PI);
      const vertex = 180 - 2 * alpha;
      const perimeter = 2 * a + b;
      const area = 0.5 * b * h;

      updatedValues.leg = a;
      updatedValues.height = h;
      updatedValues.angle_base = alpha;
      updatedValues.angle_vertex = vertex;
      updatedValues.perimeter = perimeter;
      updatedValues.area = area;
      break;
    }

    case 'scalene_triangle': {
      const a = Math.max(0.01, get('side_a'));
      const b = Math.max(0.01, get('side_b'));
      const gamma = Math.min(179, Math.max(1, get('angle_c')));
      const gammaRad = (gamma * Math.PI) / 180;
      const c = Math.sqrt(Math.max(0.01, a * a + b * b - 2 * a * b * Math.cos(gammaRad)));
      const sinAlpha = (a * Math.sin(gammaRad)) / c;
      const clampedSinAlpha = Math.max(-1, Math.min(1, sinAlpha));
      const alpha = Math.asin(clampedSinAlpha) * (180 / Math.PI);
      const beta = 180 - gamma - alpha;
      const h = b * Math.sin(gammaRad);
      const perimeter = a + b + c;
      const area = 0.5 * a * b * Math.sin(gammaRad);

      updatedValues.side_c = c;
      updatedValues.angle_a = alpha;
      updatedValues.angle_b = beta;
      updatedValues.height = h;
      updatedValues.perimeter = perimeter;
      updatedValues.area = area;
      break;
    }

    case 'rectangle': {
      const w = Math.max(0.01, get('width'));
      const h = Math.max(0.01, get('height'));
      const d = Math.sqrt(w * w + h * h);
      const perimeter = 2 * (w + h);
      const area = w * h;

      updatedValues.diagonal = d;
      updatedValues.perimeter = perimeter;
      updatedValues.area = area;
      break;
    }

    case 'square': {
      const s = Math.max(0.01, get('side'));
      const d = s * Math.SQRT2;
      const perimeter = 4 * s;
      const area = s * s;

      updatedValues.diagonal = d;
      updatedValues.perimeter = perimeter;
      updatedValues.area = area;
      break;
    }

    case 'parallelogram': {
      const b = Math.max(0.01, get('base'));
      const a = Math.max(0.01, get('side'));
      const theta = Math.min(89, Math.max(1, get('angle')));
      const thetaRad = (theta * Math.PI) / 180;
      const h = a * Math.sin(thetaRad);
      const d1 = Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(thetaRad));
      const d2 = Math.sqrt(Math.max(0.01, a * a + b * b - 2 * a * b * Math.cos(thetaRad)));
      const perimeter = 2 * (a + b);
      const area = b * h;

      updatedValues.height = h;
      updatedValues.diagonal_1 = d1;
      updatedValues.diagonal_2 = d2;
      updatedValues.perimeter = perimeter;
      updatedValues.area = area;
      break;
    }

    case 'rhombus': {
      const a = Math.max(0.01, get('side'));
      const theta = Math.min(89, Math.max(1, get('angle')));
      const halfRad = ((theta / 2) * Math.PI) / 180;
      const d2 = 2 * a * Math.sin(halfRad);
      const d1 = 2 * a * Math.cos(halfRad);
      const h = a * Math.sin((theta * Math.PI) / 180);
      const area = 0.5 * d1 * d2;
      const perimeter = 4 * a;

      updatedValues.diagonal_1 = d1;
      updatedValues.diagonal_2 = d2;
      updatedValues.height = h;
      updatedValues.perimeter = perimeter;
      updatedValues.area = area;
      break;
    }

    case 'trapezoid': {
      const b = Math.max(0.01, get('base_b'));
      const a = Math.min(b - 0.1, Math.max(0.01, get('base_a')));
      const h = Math.max(0.01, get('height'));
      const x = Math.min(b - a, Math.max(0, get('offset', (b - a) / 2)));
      const leftLeg = Math.sqrt(x * x + h * h);
      const rightX = b - a - x;
      const rightLeg = Math.sqrt(rightX * rightX + h * h);
      const area = 0.5 * (a + b) * h;
      const perimeter = a + b + leftLeg + rightLeg;

      updatedValues.leg_left = leftLeg;
      updatedValues.leg_right = rightLeg;
      updatedValues.area = area;
      updatedValues.perimeter = perimeter;
      break;
    }

    case 'circle': {
      const r = Math.max(0.01, get('radius'));
      const d = 2 * r;
      const c = 2 * Math.PI * r;
      const a = Math.PI * r * r;

      updatedValues.diameter = d;
      updatedValues.circumference = c;
      updatedValues.area = a;
      break;
    }

    case 'ellipse': {
      const a = Math.max(0.01, get('semi_major'));
      const b = Math.min(a, Math.max(0.01, get('semi_minor')));
      const c = Math.sqrt(Math.max(0, a * a - b * b));
      const e = a > 0 ? c / a : 0;
      // Ramanujan approximation for ellipse circumference
      const h = ((a - b) * (a - b)) / ((a + b) * (a + b));
      const circ = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
      const area = Math.PI * a * b;

      updatedValues.focal_distance = c;
      updatedValues.eccentricity = e;
      updatedValues.perimeter = circ;
      updatedValues.area = area;
      break;
    }

    case 'sector': {
      const r = Math.max(0.01, get('radius'));
      const theta = Math.min(359, Math.max(1, get('central_angle')));
      const arcLen = 2 * Math.PI * r * (theta / 360);
      const chord = 2 * r * Math.sin(((theta / 2) * Math.PI) / 180);
      const area = Math.PI * r * r * (theta / 360);
      const perimeter = 2 * r + arcLen;

      updatedValues.arc_length = arcLen;
      updatedValues.chord_length = chord;
      updatedValues.area = area;
      updatedValues.perimeter = perimeter;
      break;
    }

    case 'regular_polygon': {
      const n = Math.max(3, Math.round(get('num_sides')));
      const angleRad = Math.PI / n;
      let s: number;
      let apothem: number;

      if (changedParamId === 'apothem') {
        apothem = Math.max(0.01, get('apothem'));
        // s = 2 * r * tan(pi / n)
        s = 2 * apothem * Math.tan(angleRad);
        updatedValues.side_length = s;
        updatedValues.apothem = apothem;
      } else {
        s = Math.max(0.01, get('side_length'));
        apothem = s / (2 * Math.tan(angleRad));
        updatedValues.apothem = apothem;
      }

      const circumradius = s / (2 * Math.sin(angleRad));
      const interiorAngle = ((n - 2) * 180) / n;
      const perimeter = n * s;
      const area = 0.5 * n * s * apothem;

      // Calculate bounding box extents matching the renderer's orientation
      const startOffsetAngle = -Math.PI / 2 + Math.PI / n;
      let minCos = Infinity;
      let maxCos = -Infinity;
      let minSin = Infinity;
      let maxSin = -Infinity;

      for (let i = 0; i < n; i++) {
        const angle = startOffsetAngle + (i * 2 * Math.PI) / n;
        const c = Math.cos(angle);
        const sn = Math.sin(angle);
        if (c < minCos) minCos = c;
        if (c > maxCos) maxCos = c;
        if (sn < minSin) minSin = sn;
        if (sn > maxSin) maxSin = sn;
      }

      const fullWidth = circumradius * (maxCos - minCos);
      const fullHeight = circumradius * (maxSin - minSin);

      updatedValues.num_sides = n;
      updatedValues.circumradius = circumradius;
      updatedValues.full_width = fullWidth;
      updatedValues.full_height = fullHeight;
      updatedValues.interior_angle = interiorAngle;
      updatedValues.perimeter = perimeter;
      updatedValues.area = area;
      break;
    }

    case 'cuboid': {
      const l = Math.max(0.01, get('length'));
      const w = Math.max(0.01, get('width'));
      const h = Math.max(0.01, get('height'));
      const spaceDiag = Math.sqrt(l * l + w * w + h * h);
      const sa = 2 * (l * w + l * h + w * h);
      const vol = l * w * h;

      updatedValues.space_diagonal = spaceDiag;
      updatedValues.surface_area = sa;
      updatedValues.volume = vol;
      break;
    }

    case 'cylinder': {
      const r = Math.max(0.01, get('radius'));
      const h = Math.max(0.01, get('height'));
      const d = 2 * r;
      const sa = 2 * Math.PI * r * (r + h);
      const vol = Math.PI * r * r * h;

      updatedValues.diameter = d;
      updatedValues.surface_area = sa;
      updatedValues.volume = vol;
      break;
    }

    case 'cone': {
      const r = Math.max(0.01, get('radius'));
      const h = Math.max(0.01, get('height'));
      const s = Math.sqrt(r * r + h * h);
      const sa = Math.PI * r * (r + s);
      const vol = (1 / 3) * Math.PI * r * r * h;

      updatedValues.slant_height = s;
      updatedValues.surface_area = sa;
      updatedValues.volume = vol;
      break;
    }
  }

  return currentParams.map((p) => {
    if (updatedValues[p.id] !== undefined) {
      return { ...p, value: updatedValues[p.id] };
    }
    return p;
  });
}

export function formatValue(
  value: number,
  type: ParameterType,
  unit: Unit,
  precision = 2,
  roundZeroDecimals = false
): string {
  let formattedNum: string;

  if (roundZeroDecimals) {
    formattedNum = Math.round(value).toString();
  } else {
    const p = Math.max(0, precision);
    const rounded = Number(value.toFixed(p));
    formattedNum = rounded.toString();
  }

  switch (type) {
    case 'length':
      return `${formattedNum} ${unit}`;
    case 'angle':
      return `${formattedNum}°`;
    case 'area':
      return `${formattedNum} ${unit}²`;
    case 'volume':
      return `${formattedNum} ${unit}³`;
    case 'count':
      return `${formattedNum}`;
    default:
      return `${formattedNum}`;
  }
}

export function formatLabel(
  param: Parameter,
  unit: Unit,
  style: LabelStyle = 'symbol_and_value',
  roundZeroDecimals = false,
  emptyLabels = false
): string {
  if (emptyLabels) {
    if (style === 'value_only') {
      return '';
    }
    if (style === 'full_name_and_value') {
      return `${param.name}: ____`;
    }
    return `${param.symbol} = ____`;
  }

  const precision = roundZeroDecimals ? 0 : (param.precision ?? 2);
  const valStr = formatValue(param.value, param.type, unit, precision, roundZeroDecimals);

  if (style === 'value_only') {
    return valStr;
  }
  if (style === 'full_name_and_value') {
    return `${param.name}: ${valStr}`;
  }
  return `${param.symbol} = ${valStr}`;
}

export function convertUnit(val: number, fromUnit: Unit, toUnit: Unit, type: ParameterType): number {
  if (fromUnit === toUnit || type === 'angle' || type === 'count') return val;

  const fromFactor = UNIT_FACTORS[fromUnit];
  const toFactor = UNIT_FACTORS[toUnit];

  if (type === 'length') {
    return (val * fromFactor) / toFactor;
  }
  if (type === 'area') {
    return (val * fromFactor * fromFactor) / (toFactor * toFactor);
  }
  if (type === 'volume') {
    return (val * fromFactor * fromFactor * fromFactor) / (toFactor * toFactor * toFactor);
  }
  return val;
}
