import { useEffect, useState } from 'react';
import { canonicalKey, dateKey, fa, monthDays, months, parseKey } from '../calendar/jalali';

interface Props { value: string; onChange: (key: string) => void; minYear: number; maxYear: number; label: string }

/** انتخاب تاریخ شمسی با سه لیست (روز، ماه، سال)؛ بدون نیاز به تایپ دستی تاریخ. */
export function JalaliDateField({ value, onChange, minYear, maxYear, label }: Props) {
  const parse = (v: string) => { const k = canonicalKey(v); if (!k) return { y: '', m: '', d: '' }; const p = parseKey(k); return { y: String(p.jy), m: String(p.jm), d: String(p.jd) }; };
  const [parts, setParts] = useState(parse(value));
  useEffect(() => { setParts(parse(value)); }, [value]);

  const update = (next: { y: string; m: string; d: string }) => {
    let { y, m, d } = next;
    if (y && m && d) {
      const max = monthDays(Number(y), Number(m));
      if (Number(d) > max) d = String(max);
    }
    setParts({ y, m, d });
    onChange(y && m && d ? dateKey(Number(y), Number(m), Number(d)) : '');
  };
  const lo = Math.min(minYear, Number(parts.y) || minYear), hi = Math.max(maxYear, Number(parts.y) || maxYear);
  const years: number[] = [];
  for (let y = hi; y >= lo; y--) years.push(y);
  const dayCount = parts.y && parts.m ? monthDays(Number(parts.y), Number(parts.m)) : 31;

  return <div className="datefield" role="group" aria-label={label}>
    <select className="field" aria-label={`${label} - روز`} value={parts.d} onChange={e => update({ ...parts, d: e.target.value })}>
      <option value="">روز</option>
      {Array.from({ length: dayCount }, (_, i) => i + 1).map(d => <option key={d} value={d}>{fa(d)}</option>)}
    </select>
    <select className="field" aria-label={`${label} - ماه`} value={parts.m} onChange={e => update({ ...parts, m: e.target.value })}>
      <option value="">ماه</option>
      {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
    </select>
    <select className="field" aria-label={`${label} - سال`} value={parts.y} onChange={e => update({ ...parts, y: e.target.value })}>
      <option value="">سال</option>
      {years.map(y => <option key={y} value={y}>{fa(y)}</option>)}
    </select>
  </div>;
}
