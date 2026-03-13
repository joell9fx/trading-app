'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ArrowAnnotation,
  RectangleAnnotation,
  CircleAnnotation,
  TextAnnotation,
  EntryMarkerAnnotation,
  StopLossMarkerAnnotation,
  TakeProfitMarkerAnnotation,
  TradeAnnotation,
  AnnotationData,
  parseAnnotationData,
  generateId,
  type AnnotationType,
} from '@/lib/dashboard/trade-annotation-types';
import {
  ArrowRightIcon,
  Square2StackIcon,
  CircleStackIcon,
  ChatBubbleBottomCenterTextIcon,
  MapPinIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

const TOOL_COLORS: Record<string, string> = {
  arrow: '#EAB308',
  rectangle: '#EAB308',
  circle: '#EAB308',
  text: '#EAB308',
  entry_marker: '#22c55e',
  stop_loss_marker: '#ef4444',
  take_profit_marker: '#3b82f6',
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export interface TradeAnnotationEditorProps {
  screenshotUrl: string;
  initialData?: unknown;
  journalEntryId: string;
  onSave: (data: AnnotationData) => Promise<void>;
  saveLabel?: string;
}

export function TradeAnnotationEditor({
  screenshotUrl,
  initialData,
  journalEntryId,
  onSave,
  saveLabel = 'Save annotations',
}: TradeAnnotationEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [annotations, setAnnotations] = useState<AnnotationData>(() =>
    parseAnnotationData(initialData)
  );
  const [history, setHistory] = useState<AnnotationData[]>([]);
  const [tool, setTool] = useState<AnnotationType>('arrow');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const [textPrompt, setTextPrompt] = useState<{ x: number; y: number } | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number }>({ w: 800, h: 600 });
  const canvasWidth = canvasSize.w;
  const canvasHeight = canvasSize.h;

  const toNorm = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      return { x: clamp01(x), y: clamp01(y) };
    },
    []
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const px = (x: number) => x * w;
    const py = (y: number) => y * h;

    annotations.forEach((ann) => {
      const color = ann.color ?? TOOL_COLORS[ann.type] ?? '#EAB308';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = Math.max(2, w / 300);
      const fontSize = ann.type === 'text' ? ((ann as TextAnnotation).fontSize ?? 14) : 14;
      ctx.font = `${fontSize * (w / 400)}px sans-serif`;

      switch (ann.type) {
        case 'arrow': {
          const a = ann as ArrowAnnotation;
          const x1 = px(a.x1);
          const y1 = py(a.y1);
          const x2 = px(a.x2);
          const y2 = py(a.y2);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const head = 12;
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - head * Math.cos(angle - 0.4), y2 - head * Math.sin(angle - 0.4));
          ctx.lineTo(x2 - head * Math.cos(angle + 0.4), y2 - head * Math.sin(angle + 0.4));
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'rectangle': {
          const r = ann as RectangleAnnotation;
          ctx.strokeRect(px(r.x), py(r.y), r.width * w, r.height * h);
          break;
        }
        case 'circle': {
          const c = ann as CircleAnnotation;
          ctx.beginPath();
          ctx.arc(px(c.x), py(c.y), c.radius * Math.min(w, h), 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'text': {
          const t = ann as TextAnnotation;
          ctx.fillText(t.text, px(t.x), py(t.y));
          break;
        }
        case 'entry_marker': {
          const m = ann as EntryMarkerAnnotation;
          const cx = px(m.x);
          const cy = py(m.y);
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(cx, cy, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('E', cx, cy + 4);
          break;
        }
        case 'stop_loss_marker': {
          const m = ann as StopLossMarkerAnnotation;
          const cx = px(m.x);
          const cy = py(m.y);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(cx, cy, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('SL', cx, cy + 4);
          break;
        }
        case 'take_profit_marker': {
          const m = ann as TakeProfitMarkerAnnotation;
          const cx = px(m.x);
          const cy = py(m.y);
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(cx, cy, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('TP', cx, cy + 4);
          break;
        }
      }
    });

    if (drawStart && drawCurrent && isDrawing) {
      const color = TOOL_COLORS[tool] ?? '#EAB308';
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, w / 300);
      const x1 = px(drawStart.x);
      const y1 = py(drawStart.y);
      const x2 = px(drawCurrent.x);
      const y2 = py(drawCurrent.y);
      if (tool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const head = 12;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - head * Math.cos(angle - 0.4), y2 - head * Math.sin(angle - 0.4));
        ctx.lineTo(x2 - head * Math.cos(angle + 0.4), y2 - head * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      } else if (tool === 'rectangle') {
        const rx = Math.min(x1, x2);
        const ry = Math.min(y1, y2);
        ctx.strokeRect(rx, ry, Math.abs(x2 - x1), Math.abs(y2 - y1));
      } else if (tool === 'circle') {
        const rad = Math.hypot(x2 - x1, y2 - y1);
        ctx.beginPath();
        ctx.arc(x1, y1, rad, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [annotations, tool, isDrawing, drawStart, drawCurrent]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleImageLoad = useCallback(() => {
    const img = imageRef.current;
    if (!img || !img.complete) return;
    const nw = img.naturalWidth || 800;
    const nh = img.naturalHeight || 600;
    const max = 1000;
    let w = nw;
    let h = nh;
    if (nw > max || nh > max) {
      const r = max / Math.max(nw, nh);
      w = Math.round(nw * r);
      h = Math.round(nh * r);
    }
    setCanvasSize({ w, h });
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pt = toNorm(e.clientX, e.clientY);
      if (!pt) return;
      if (tool === 'text') {
        setTextPrompt(pt);
        return;
      }
      if (
        tool === 'entry_marker' ||
        tool === 'stop_loss_marker' ||
        tool === 'take_profit_marker'
      ) {
        const id = generateId();
        const newAnn: TradeAnnotation =
          tool === 'entry_marker'
            ? { id, type: 'entry_marker', x: pt.x, y: pt.y }
            : tool === 'stop_loss_marker'
              ? { id, type: 'stop_loss_marker', x: pt.x, y: pt.y }
              : { id, type: 'take_profit_marker', x: pt.x, y: pt.y };
        setHistory((h) => [...h, annotations]);
        setAnnotations((a) => [...a, newAnn]);
        return;
      }
      setIsDrawing(true);
      setDrawStart(pt);
      setDrawCurrent(pt);
    },
    [tool, toNorm, annotations]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const pt = toNorm(e.clientX, e.clientY);
      if (pt) setDrawCurrent(pt);
    },
    [isDrawing, toNorm]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !drawStart || !drawCurrent) return;
    const id = generateId();
    const color = TOOL_COLORS[tool];
    let newAnn: TradeAnnotation | null = null;
    if (tool === 'arrow') {
      newAnn = {
        id,
        type: 'arrow',
        x1: drawStart.x,
        y1: drawStart.y,
        x2: drawCurrent.x,
        y2: drawCurrent.y,
        color,
      };
    } else if (tool === 'rectangle') {
      const x = Math.min(drawStart.x, drawCurrent.x);
      const y = Math.min(drawStart.y, drawCurrent.y);
      const width = Math.abs(drawCurrent.x - drawStart.x) || 0.05;
      const height = Math.abs(drawCurrent.y - drawStart.y) || 0.05;
      newAnn = { id, type: 'rectangle', x, y, width, height, color };
    } else if (tool === 'circle') {
      const radius = Math.hypot(
        drawCurrent.x - drawStart.x,
        drawCurrent.y - drawStart.y
      );
      newAnn = {
        id,
        type: 'circle',
        x: drawStart.x,
        y: drawStart.y,
        radius: Math.min(1, radius),
        color,
      };
    }
    if (newAnn) {
      setHistory((h) => [...h, annotations]);
      setAnnotations((a) => [...a, newAnn]);
    }
    setIsDrawing(false);
    setDrawStart(null);
    setDrawCurrent(null);
  }, [isDrawing, drawStart, drawCurrent, tool, annotations]);

  const handleTextSubmit = useCallback(
    (text: string) => {
      if (!textPrompt) return;
      const id = generateId();
      const newAnn: TextAnnotation = {
        id,
        type: 'text',
        x: textPrompt.x,
        y: textPrompt.y,
        text: text.trim(),
        color: TOOL_COLORS.text,
      };
      setHistory((h) => [...h, annotations]);
      setAnnotations((a) => [...a, newAnn]);
      setTextPrompt(null);
    },
    [textPrompt, annotations]
  );

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setAnnotations(prev);
  }, [history]);

  const handleClear = useCallback(() => {
    setHistory((h) => [...h, annotations]);
    setAnnotations([]);
  }, [annotations]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onSave(annotations);
    } finally {
      setSaving(false);
    }
  }, [annotations, onSave]);

  const tools: { type: AnnotationType; label: string; icon: React.ReactNode }[] = [
    { type: 'arrow', label: 'Arrow', icon: <ArrowRightIcon className="h-5 w-5" /> },
    { type: 'rectangle', label: 'Rectangle', icon: <Square2StackIcon className="h-5 w-5" /> },
    { type: 'circle', label: 'Circle', icon: <CircleStackIcon className="h-5 w-5" /> },
    { type: 'text', label: 'Text', icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5" /> },
    { type: 'entry_marker', label: 'Entry', icon: <MapPinIcon className="h-5 w-5" /> },
    { type: 'stop_loss_marker', label: 'SL', icon: <XCircleIcon className="h-5 w-5" /> },
    { type: 'take_profit_marker', label: 'TP', icon: <CheckCircleIcon className="h-5 w-5" /> },
  ];

  return (
    <Card className="border-border-subtle bg-panel rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border-subtle pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Annotate screenshot</h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleUndo}
              disabled={history.length === 0}
            >
              <ArrowUturnLeftIcon className="h-5 w-5 mr-1" />
              Undo
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-400"
              onClick={handleClear}
              disabled={annotations.length === 0}
            >
              <TrashIcon className="h-5 w-5 mr-1" />
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              className="font-semibold"
              onClick={handleSave}
              disabled={saving}
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
              {saving ? 'Saving…' : saveLabel}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 pt-2">
          {tools.map(({ type: t, label, icon }) => (
            <button
              key={t}
              type="button"
              onClick={() => setTool(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                tool === t
                  ? 'bg-accent-muted text-primary border border-primary/40'
                  : 'text-muted-foreground hover:text-foreground hover:bg-panel border border-transparent'
              }`}
              title={label}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {imageError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-8 text-center text-red-200 text-sm">
            Could not load screenshot image.
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative inline-block max-w-full overflow-hidden rounded-lg border border-border-subtle bg-panel"
          >
            <img
              ref={(el) => {
                imageRef.current = el;
              }}
              src={screenshotUrl}
              alt="Trade chart"
              className="hidden"
              crossOrigin="anonymous"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {imageLoaded && imageRef.current && (
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="max-w-full h-auto cursor-crosshair border-0"
                style={{ maxHeight: '70vh', width: 'auto', height: 'auto' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  if (isDrawing) {
                    setIsDrawing(false);
                    setDrawStart(null);
                    setDrawCurrent(null);
                  }
                }}
              />
            )}
            {!imageLoaded && !imageError && (
              <div className="flex items-center justify-center w-full min-h-[300px] text-muted-foreground">
                Loading image…
              </div>
            )}
          </div>
        )}

        {textPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/80 p-4">
            <div className="rounded-xl border border-border bg-elevated p-4 w-full max-w-sm">
              <label className="block text-sm font-medium text-white mb-2">Text note</label>
              <input
                ref={textInputRef}
                type="text"
                autoFocus
                className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSubmit((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                  if (e.key === 'Escape') setTextPrompt(null);
                }}
                onBlur={(e) => {
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (v) handleTextSubmit(v);
                  setTextPrompt(null);
                }}
              />
              <div className="flex gap-2 mt-3">
                <Button
                  type="button"
                  size="sm"
                  className=""
                  onClick={() => {
                    const v = textInputRef.current?.value?.trim();
                    if (v) handleTextSubmit(v);
                    setTextPrompt(null);
                  }}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setTextPrompt(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
