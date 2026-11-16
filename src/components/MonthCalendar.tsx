import { useMemo } from 'react';
import { layoutWeek, resolveColor, tint, toSpans } from '../calendar/events';
import type { Memory } from '../types';
import {
  dateKey, fa, formatDate, gregorianOfSerial, keyToSerial, monthDays, serialToKey, weekdayIndex, weekdays, weekdaysShort
} from '../calendar/jalali';

interface Props {
  jy: number; jm: number; memories: Memory[]; todayKey: string; selectedKey?: string | null;
  onDayClick: (key: string) => void;
}

/**
 * تقویم ماهانه: در هر خانه شماره روز و عنوان رویدادها دیده می‌شود.
 * رویدادهای چندروزه به‌صورت نوار رنگی پیوسته روی ستون‌های روزها رسم می‌شوند و در هفته/ماه بعد ادامه می‌یابند.
 */
export function MonthCalendar({ jy, jm, memories, todayKey, selectedKey, onDayClick }: Props) {
  const spans = useMemo(() => toSpans(memories), [memories]);
  const weeks = useMemo(() => {
    const first = keyToSerial(dateKey(jy, jm, 1));
    const offset = weekdayIndex(first);
    const count = Math.ceil((offset + monthDays(jy, jm)) / 7);
    const monthStart = first, monthEnd = first + monthDays(jy, jm) - 1;
    return Array.from({ length: count }, (_, w) => {
      const start = first - offset + w * 7;
      return { start, layout: layoutWeek(spans, start), monthStart, monthEnd };
    });
  }, [spans, jy, jm]);

  return <div className="mc" dir="rtl">
    <div className="mc-head" aria-hidden="true">
      {weekdays.map((w, i) => <span key={w} className={i === 6 ? 'fri' : ''}><b className="full">{w}</b><b className="short">{weekdaysShort[i]}</b></span>)}
    </div>
    <div className="mc-weeks">
      {weeks.map(({ start, layout, monthStart, monthEnd }) => {
        const rows = layout.rows;
        const template = `40px ${rows > 0 ? `repeat(${rows}, auto) ` : ''}minmax(2px, 1fr)`;
        return <div className="mc-week" key={start} style={{ gridTemplateRows: template }}>
          {Array.from({ length: 7 }, (_, c) => {
            const serial = start + c, key = serialToKey(serial), g = gregorianOfSerial(serial);
            const parts = key.split('-').map(Number);
            const out = serial < monthStart || serial > monthEnd;
            const cls = ['mc-cell', out ? 'out' : '', c === 6 ? 'fri' : '', key === todayKey ? 'today' : '', key === selectedKey ? 'sel' : ''].filter(Boolean).join(' ');
            const count = spans.filter(s => s.start <= serial && s.end >= serial).length;
            return <button key={key} className={cls} style={{ gridColumn: c + 1 }} onClick={() => onDayClick(key)}
              aria-label={`${formatDate(key)}${count ? `، ${fa(count)} رویداد` : ''}`}>
              <span className="mc-num">{fa(parts[2])}</span>
              <span className="mc-greg">{fa(`${g.gm}/${g.gd}`)}</span>
            </button>;
          })}
          {layout.segments.map(seg => {
            const m = seg.span.memory, color = resolveColor(m.color), multi = seg.span.end > seg.span.start;
            const cls = ['mc-ev', multi ? 'bar' : 'dot', seg.len > 2 ? 'wide' : '', seg.contStart ? 'cs' : '', seg.contEnd ? 'ce' : ''].filter(Boolean).join(' ');
            return <div key={m.id + ':' + seg.col} className={cls}
              style={{ gridColumn: `${seg.col + 1} / span ${seg.len}`, gridRow: seg.lane + 2, ['--c' as string]: color, ['--bg' as string]: tint(color, 0.16) }}>
              <span className="mc-t">{m.emojis[0] ? `${m.emojis[0]} ${m.title}` : m.title}</span>
            </div>;
          })}
          {layout.moreByCol.map((n, c) => n > 0 && <div key={'more' + c} className="mc-more" style={{ gridColumn: c + 1, gridRow: layout.visibleLanes + 2 }}>
            +{fa(n)} مورد دیگر
          </div>)}
        </div>;
      })}
    </div>
  </div>;
}
