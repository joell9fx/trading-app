/**
 * Typed shapes for trade screenshot annotations.
 * All coordinates are normalized 0–1 relative to image width/height for resolution independence.
 */

export type AnnotationType =
  | 'arrow'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'entry_marker'
  | 'stop_loss_marker'
  | 'take_profit_marker';

export interface BaseAnnotation {
  id: string;
  type: AnnotationType;
  color?: string;
}

export interface ArrowAnnotation extends BaseAnnotation {
  type: 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RectangleAnnotation extends BaseAnnotation {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleAnnotation extends BaseAnnotation {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize?: number;
}

export interface EntryMarkerAnnotation extends BaseAnnotation {
  type: 'entry_marker';
  x: number;
  y: number;
}

export interface StopLossMarkerAnnotation extends BaseAnnotation {
  type: 'stop_loss_marker';
  x: number;
  y: number;
}

export interface TakeProfitMarkerAnnotation extends BaseAnnotation {
  type: 'take_profit_marker';
  x: number;
  y: number;
}

export type TradeAnnotation =
  | ArrowAnnotation
  | RectangleAnnotation
  | CircleAnnotation
  | TextAnnotation
  | EntryMarkerAnnotation
  | StopLossMarkerAnnotation
  | TakeProfitMarkerAnnotation;

export type AnnotationData = TradeAnnotation[];

const ANNOTATION_TYPES: AnnotationType[] = [
  'arrow',
  'rectangle',
  'circle',
  'text',
  'entry_marker',
  'stop_loss_marker',
  'take_profit_marker',
];

function isNum(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1;
}

function isStr(v: unknown): v is string {
  return typeof v === 'string';
}

function hasId(o: unknown): o is { id: string; type: string } {
  return typeof o === 'object' && o !== null && isStr((o as Record<string, unknown>).id) && isStr((o as Record<string, unknown>).type);
}

export function parseAnnotation(raw: unknown): TradeAnnotation | null {
  if (!hasId(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const type = obj.type as string;
  const id = obj.id as string;
  const color = obj.color as string | undefined;
  if (!ANNOTATION_TYPES.includes(type as AnnotationType)) return null;

  switch (type) {
    case 'arrow':
      if (isNum(obj.x1) && isNum(obj.y1) && isNum(obj.x2) && isNum(obj.y2)) {
        return { id, type: 'arrow', x1: obj.x1, y1: obj.y1, x2: obj.x2, y2: obj.y2, color };
      }
      return null;
    case 'rectangle':
      if (isNum(obj.x) && isNum(obj.y) && isNum(obj.width) && isNum(obj.height)) {
        return { id, type: 'rectangle', x: obj.x, y: obj.y, width: obj.width, height: obj.height, color };
      }
      return null;
    case 'circle':
      if (isNum(obj.x) && isNum(obj.y) && isNum(obj.radius)) {
        return { id, type: 'circle', x: obj.x, y: obj.y, radius: obj.radius, color };
      }
      return null;
    case 'text':
      if (isNum(obj.x) && isNum(obj.y) && isStr(obj.text)) {
        return {
          id,
          type: 'text',
          x: obj.x,
          y: obj.y,
          text: obj.text,
          fontSize: typeof obj.fontSize === 'number' && Number.isFinite(obj.fontSize) ? obj.fontSize : undefined,
          color,
        };
      }
      return null;
    case 'entry_marker':
      if (isNum(obj.x) && isNum(obj.y)) {
        return { id, type: 'entry_marker', x: obj.x, y: obj.y, color };
      }
      return null;
    case 'stop_loss_marker':
      if (isNum(obj.x) && isNum(obj.y)) {
        return { id, type: 'stop_loss_marker', x: obj.x, y: obj.y, color };
      }
      return null;
    case 'take_profit_marker':
      if (isNum(obj.x) && isNum(obj.y)) {
        return { id, type: 'take_profit_marker', x: obj.x, y: obj.y, color };
      }
      return null;
    default:
      return null;
  }
}

export function parseAnnotationData(raw: unknown): AnnotationData {
  if (!Array.isArray(raw)) return [];
  const out: TradeAnnotation[] = [];
  for (const item of raw) {
    const a = parseAnnotation(item);
    if (a) out.push(a);
  }
  return out;
}

export function generateId(): string {
  return `ann-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
