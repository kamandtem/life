import { Pencil } from 'lucide-react';
import type { Memory } from '../types';
import { resolveColor, tint } from '../calendar/events';
import { fa, formatDate, formatDateShort, keyToSerial } from '../calendar/jalali';

interface Props { dayKey: string; items: Memory[]; onEdit: (m: Memory) => void; onPhoto: (src: string) => void }

/** فهرست کامل رویدادها و خاطرات یک روز با جزئیات (شرح، عکس، بازه رویداد چندروزه) */
export function DayDetails({ dayKey, items, onEdit, onPhoto }: Props) {
  if (items.length === 0) return <div className="empty"><div>🌱</div><b>این روز هنوز خالیه</b><p>یک اتفاق کوچک هم می‌تونه ارزش ثبت کردن داشته باشه.</p></div>;
  const serial = keyToSerial(dayKey);
  return <div className="daydetails">
    {items.map(m => {
      const color = resolveColor(m.color);
      const multi = !!m.eventEndDate;
      const total = multi ? keyToSerial(m.eventEndDate!) - keyToSerial(m.date) + 1 : 1;
      const nth = multi ? serial - keyToSerial(m.date) + 1 : 1;
      return <article className="dd-item" key={m.id} style={{ borderRightColor: color }}>
        <div className="dd-head">
          <div className="memory-emoji" style={{ background: tint(color, 0.16) }}>{m.emojis[0] || '✨'}</div>
          <div className="dd-title">
            <b>{m.title}</b>
            <small>
              {multi ? `${formatDateShort(m.date)} تا ${formatDate(m.eventEndDate!)} · روز ${fa(nth)} از ${fa(total)}` : formatDate(m.date)}
            </small>
          </div>
          <button className="dd-edit" onClick={() => onEdit(m)} aria-label="ویرایش"><Pencil size={16} /></button>
        </div>
        <div className="dd-tags">
          <span className="tag" style={{ background: tint(color, 0.14), color }}>{m.category}</span>
          {multi && <span className="tag tag-multi" style={{ background: color }}>{fa(total)} روزه</span>}
          {m.emojis.slice(1).map((e, i) => <span className="tag-emoji" key={i}>{e}</span>)}
        </div>
        {m.description && <p className="dd-desc">{m.description}</p>}
        {m.photos.length > 0 && <div className="dd-photos">
          {m.photos.map((p, i) => <button key={i} onClick={() => onPhoto(p)} aria-label="نمایش عکس"><img src={p} alt="" loading="lazy" /></button>)}
        </div>}
      </article>;
    })}
  </div>;
}
