import { ChevronLeft, Images } from 'lucide-react';
import type { Memory } from '../types';
import { resolveColor, tint } from '../calendar/events';
import { fa, formatDate, formatDateShort, keyToSerial } from '../calendar/jalali';

export const rangeLabel = (m: Memory) => {
  if (!m.eventEndDate) return formatDate(m.date);
  const days = keyToSerial(m.eventEndDate) - keyToSerial(m.date) + 1;
  return `${formatDateShort(m.date)} تا ${formatDate(m.eventEndDate)} · ${fa(days)} روز`;
};

export function MemoryCard({ memory, onClick }: { memory: Memory; onClick: () => void }) {
  const color = resolveColor(memory.color);
  return <button className="memory-card" onClick={onClick} style={{ borderRightColor: color }}>
    <div className="memory-emoji" style={{ background: tint(color, 0.16) }}>{memory.emojis[0] || '✨'}</div>
    <div className="memory-info">
      <b>{memory.title}</b>
      <p>{memory.description || memory.category}</p>
      <small>{rangeLabel(memory)} · {memory.category}</small>
    </div>
    {memory.photos.length > 0 && <span className="photo-badge"><Images size={13} />{fa(memory.photos.length)}</span>}
    <ChevronLeft size={18} />
  </button>;
}
