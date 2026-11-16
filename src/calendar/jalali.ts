import { toGregorian, toJalaali, jalaaliMonthLength, isValidJalaaliDate } from 'jalaali-js';

export const months = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
export const weekdays = ['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
export const weekdaysShort = ['ش','ی','د','س','چ','پ','ج'];

const DAY_MS = 86400000;

export const normalizeDigits = (s: string) =>
  s.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
export const fa = (n: number | string) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]);
/** عدد با جداکننده هزارگان فارسی، مثلاً ۱۲٬۳۴۵ */
export const faNum = (n: number) => fa(Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '٬'));

export const todayJ = () => { const d = new Date(); return toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate()); };
export const dateKey = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
export const parseKey = (s: string) => { const [jy, jm, jd] = normalizeDigits(s).split('-').map(Number); return { jy, jm, jd }; };
export const monthDays = (y: number, m: number) => jalaaliMonthLength(y, m);
export const monthOffset = (y: number, m: number) => { const g = toGregorian(y, m, 1); return (new Date(g.gy, g.gm - 1, g.gd).getDay() + 1) % 7; };
export const validJalali = (y: number, m: number, d: number) => isValidJalaaliDate(y, m, d);

/** تاریخ را به قالب استاندارد «YYYY-MM-DD» (با صفر ابتدایی) تبدیل می‌کند؛ اگر نامعتبر بود null برمی‌گرداند. */
export const canonicalKey = (s: string | undefined | null): string | null => {
  if (!s) return null;
  const { jy, jm, jd } = parseKey(String(s).trim());
  if (!Number.isInteger(jy) || !Number.isInteger(jm) || !Number.isInteger(jd)) return null;
  if (!validJalali(jy, jm, jd)) return null;
  return dateKey(jy, jm, jd);
};

/** شماره پیوسته روز (تعداد روز از ۱۹۷۰-۰۱-۰۱ میلادی) برای محاسبه فاصله‌ها و جای هفته‌ها */
export const keyToSerial = (key: string) => {
  const { jy, jm, jd } = parseKey(key);
  const g = toGregorian(jy, jm, jd);
  return Math.round(Date.UTC(g.gy, g.gm - 1, g.gd) / DAY_MS);
};
export const serialToParts = (serial: number) => {
  const d = new Date(serial * DAY_MS);
  return toJalaali(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
};
export const serialToKey = (serial: number) => { const p = serialToParts(serial); return dateKey(p.jy, p.jm, p.jd); };
/** ۰ = شنبه … ۶ = جمعه */
export const weekdayIndex = (serial: number) => (((serial + 5) % 7) + 7) % 7;
export const gregorianOfSerial = (serial: number) => {
  const d = new Date(serial * DAY_MS);
  return { gy: d.getUTCFullYear(), gm: d.getUTCMonth() + 1, gd: d.getUTCDate() };
};

export const ageAtDate = (birth: string, target = new Date()) => {
  const { jy: by, jm: bm, jd: bd } = parseKey(birth);
  const t = toJalaali(target.getFullYear(), target.getMonth() + 1, target.getDate());
  return Math.max(0, t.jy - by - (t.jm < bm || (t.jm === bm && t.jd < bd) ? 1 : 0));
};
export const jalaliYearForAge = (birth: string, yearOfLife: number) => Number(birth.split('-')[0]) + yearOfLife - 1;
export const formatDate = (key: string) => { const { jy, jm, jd } = parseKey(key); return `${fa(jd)} ${months[jm - 1]} ${fa(jy)}`; };
export const formatDateShort = (key: string) => { const { jm, jd } = parseKey(key); return `${fa(jd)} ${months[jm - 1]}`; };
export const isoToday = () => { const t = todayJ(); return dateKey(t.jy, t.jm, t.jd); };
export const weekdayName = (key: string) => weekdays[weekdayIndex(keyToSerial(key))];

type JParts = { jy: number; jm: number; jd: number };
/** اختلاف دقیق سال/ماه/روز شمسی بین دو تاریخ (a ≤ b) */
export const ymdDiff = (a: JParts, b: JParts) => {
  let years = b.jy - a.jy, months = b.jm - a.jm, days = b.jd - a.jd;
  if (days < 0) {
    months -= 1;
    const pm = b.jm === 1 ? 12 : b.jm - 1, py = b.jm === 1 ? b.jy - 1 : b.jy;
    days += monthDays(py, pm);
  }
  if (months < 0) { years -= 1; months += 12; }
  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
};

export interface LifeStats {
  daysLived: number; daysRemaining: number; totalDays: number; percent: number;
  elapsed: { years: number; months: number; days: number };
  remaining: { years: number; months: number; days: number };
  monthsLived: number; monthsRemaining: number; weeksLived: number;
  endKey: string; pastHorizon: boolean;
}
export const lifeStats = (birth: string, lifespan: number): LifeStats | null => {
  const b = parseKey(birth);
  if (!validJalali(b.jy, b.jm, b.jd)) return null;
  const t = todayJ();
  const birthSerial = keyToSerial(birth), todaySerial = keyToSerial(dateKey(t.jy, t.jm, t.jd));
  const endY = b.jy + lifespan, endD = Math.min(b.jd, monthDays(endY, b.jm));
  const endKey = dateKey(endY, b.jm, endD), endSerial = keyToSerial(endKey);
  const daysLived = Math.max(0, todaySerial - birthSerial);
  const totalDays = Math.max(1, endSerial - birthSerial);
  const daysRemaining = Math.max(0, endSerial - todaySerial);
  const elapsed = todaySerial >= birthSerial ? ymdDiff(b, t) : { years: 0, months: 0, days: 0 };
  const e = { jy: endY, jm: b.jm, jd: endD };
  const remaining = todaySerial < endSerial ? ymdDiff(t, e) : { years: 0, months: 0, days: 0 };
  return {
    daysLived, daysRemaining, totalDays, percent: Math.min(100, (daysLived / totalDays) * 100),
    elapsed, remaining,
    monthsLived: elapsed.years * 12 + elapsed.months, monthsRemaining: remaining.years * 12 + remaining.months,
    weeksLived: Math.floor(daysLived / 7), endKey, pastHorizon: todaySerial >= endSerial
  };
};
