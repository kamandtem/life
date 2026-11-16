import type { Memory } from '../types';
import { canonicalKey, keyToSerial } from './jalali';

/** پالت رنگ رویدادها؛ رنگ‌ها به‌قدری پررنگ‌اند که متن سفید روی نوار چندروزه خوانا بماند. */
export const EVENT_COLORS = [
  { hex: '#7567D9', name: 'بنفش' },
  { hex: '#4F7FE0', name: 'آبی' },
  { hex: '#1F9488', name: 'سبزآبی' },
  { hex: '#5E9A2B', name: 'سبز' },
  { hex: '#D9731A', name: 'نارنجی' },
  { hex: '#D9507F', name: 'صورتی' },
  { hex: '#D6525A', name: 'قرمز' },
  { hex: '#86705C', name: 'قهوه‌ای' }
] as const;
export const DEFAULT_COLOR = EVENT_COLORS[0].hex;

export const CATEGORIES = ['زندگی روزمره', 'خانواده', 'دوستان', 'عشق', 'سفر', 'موفقیت', 'یادگیری', 'لحظه‌های کوچک', 'مهم'];
export const CATEGORY_COLORS: Record<string, string> = {
  'زندگی روزمره': '#5E9A2B',
  'خانواده': '#D9731A',
  'دوستان': '#4F7FE0',
  'عشق': '#D9507F',
  'سفر': '#1F9488',
  'موفقیت': '#7567D9',
  'یادگیری': '#4F7FE0',
  'لحظه‌های کوچک': '#86705C',
  'مهم': '#D6525A'
};

/** رنگ‌های پاستلی نسخه قبلی برنامه به رنگ‌های جدید نگاشت می‌شوند تا داده‌های قدیمی خوانا بمانند. */
const LEGACY_COLORS: Record<string, string> = {
  '#eeeaff': '#7567D9', '#e8f7f1': '#1F9488', '#fff0f2': '#D9507F', '#fff6e6': '#D9731A',
  '#eaf3ff': '#4F7FE0', '#f2edff': '#7567D9', '#f0f5e9': '#5E9A2B'
};
export const resolveColor = (c: string | undefined): string => {
  if (!c) return DEFAULT_COLOR;
  const low = c.trim().toLowerCase();
  if (LEGACY_COLORS[low]) return LEGACY_COLORS[low];
  return /^#[0-9a-f]{6}$/i.test(low) ? c.trim() : DEFAULT_COLOR;
};
export const tint = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};

/** رکورد خام (از دیتابیس یا فایل پشتیبان) را به رکورد استاندارد تبدیل می‌کند؛ نامعتبر → null */
export const normalizeMemory = (raw: any): Memory | null => {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string') return null;
  const date = canonicalKey(raw.date);
  if (!date) return null;
  let end = canonicalKey(raw.eventEndDate) || '';
  if (end && end <= date) end = '';
  const now = new Date().toISOString();
  return {
    id: raw.id,
    date,
    eventEndDate: end,
    title: String(raw.title ?? '').trim() || 'بدون عنوان',
    description: String(raw.description ?? ''),
    emojis: Array.isArray(raw.emojis) ? raw.emojis.filter((e: unknown) => typeof e === 'string').slice(0, 6) : [],
    category: String(raw.category ?? CATEGORIES[0]),
    color: resolveColor(raw.color),
    photos: Array.isArray(raw.photos) ? raw.photos.filter((p: unknown) => typeof p === 'string') : [],
    createdAt: String(raw.createdAt ?? now),
    updatedAt: String(raw.updatedAt ?? raw.createdAt ?? now)
  };
};

export interface EventSpan { memory: Memory; start: number; end: number }

export const toSpan = (m: Memory): EventSpan | null => {
  const date = canonicalKey(m.date);
  if (!date) return null;
  const start = keyToSerial(date);
  const endKey = canonicalKey(m.eventEndDate);
  const end = endKey ? Math.max(start, keyToSerial(endKey)) : start;
  return { memory: m, start, end };
};
export const toSpans = (memories: Memory[]): EventSpan[] => {
  const seen = new Set<string>();
  const out: EventSpan[] = [];
  for (const m of memories) {
    if (seen.has(m.id)) continue; // جلوگیری از نمایش تکراری
    seen.add(m.id);
    const s = toSpan(m);
    if (s) out.push(s);
  }
  return out;
};
export const isMultiDay = (s: EventSpan) => s.end > s.start;

const byOrder = (a: EventSpan, b: EventSpan) =>
  a.start - b.start || (b.end - b.start) - (a.end - a.start) ||
  a.memory.createdAt.localeCompare(b.memory.createdAt) || a.memory.id.localeCompare(b.memory.id);

export const eventsOnDay = (spans: EventSpan[], serial: number) =>
  spans.filter(s => s.start <= serial && s.end >= serial).sort((a, b) => (Number(isMultiDay(b)) - Number(isMultiDay(a))) || byOrder(a, b));
export const eventsInRange = (spans: EventSpan[], from: number, to: number) =>
  spans.filter(s => s.start <= to && s.end >= from).sort(byOrder);

export interface Segment { span: EventSpan; col: number; len: number; lane: number; contStart: boolean; contEnd: boolean }
export interface WeekLayout {
  segments: Segment[];     // فقط بخش‌های قابل‌نمایش
  rows: number;            // تعداد ردیف‌های لازم (شامل ردیف «+N مورد دیگر»)
  visibleLanes: number;
  moreByCol: number[];     // تعداد رویدادهای پنهان در هر ستون (۰ = شنبه)
}

/**
 * چیدمان یک هفته (۷ ستون، شروع از شنبه): هر رویداد در هر هفته فقط یک قطعه دارد
 * و در یک «خط» (lane) ثابت قرار می‌گیرد تا نوار رویدادهای چندروزه پیوسته دیده شود.
 */
export function layoutWeek(spans: EventSpan[], weekStart: number, maxLanes = 3, relaxedMax = 4): WeekLayout {
  const weekEnd = weekStart + 6;
  const segs: Segment[] = eventsInRange(spans, weekStart, weekEnd).map(span => {
    const from = Math.max(span.start, weekStart), to = Math.min(span.end, weekEnd);
    return { span, col: from - weekStart, len: to - from + 1, lane: -1, contStart: span.start < weekStart, contEnd: span.end > weekEnd };
  });
  segs.sort((a, b) => a.col - b.col || b.len - a.len || byOrder(a.span, b.span));
  const occupied: boolean[][] = [];
  for (const s of segs) {
    let lane = 0;
    for (;; lane++) {
      const row = occupied[lane] || (occupied[lane] = new Array(7).fill(false));
      let free = true;
      for (let c = s.col; c < s.col + s.len; c++) if (row[c]) { free = false; break; }
      if (free) { for (let c = s.col; c < s.col + s.len; c++) row[c] = true; break; }
    }
    s.lane = lane;
  }
  const totalLanes = occupied.length;
  const visibleLanes = totalLanes <= relaxedMax ? totalLanes : maxLanes;
  const moreByCol = new Array(7).fill(0);
  for (const s of segs) if (s.lane >= visibleLanes) for (let c = s.col; c < s.col + s.len; c++) moreByCol[c]++;
  const hasMore = moreByCol.some(n => n > 0);
  return { segments: segs.filter(s => s.lane < visibleLanes), rows: visibleLanes + (hasMore ? 1 : 0), visibleLanes, moreByCol };
}
