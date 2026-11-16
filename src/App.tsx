import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, Download, Heart, Home, ImagePlus, Bell, Pencil, Plus, Save, Search, Settings, Trash2, Upload, X } from 'lucide-react';
import { db, ensureDefaults } from './database/db';
import type { Memory, Note, Profile, Reminder } from './types';
import {
  ageAtDate, canonicalKey, dateKey, fa, faNum, formatDate, isoToday, keyToSerial, lifeStats, monthDays, months,
  parseKey, serialToKey, serialToParts, todayJ, validJalali, weekdayName
} from './calendar/jalali';
import {
  CATEGORIES, CATEGORY_COLORS, DEFAULT_COLOR, EVENT_COLORS, eventsInRange, eventsOnDay, normalizeMemory, resolveColor, toSpans
} from './calendar/events';
import { onReminderTapped, restoreReminder, scheduleDailyReminder } from './notifications/reminders';
import { exportBackup, getLastBackup } from './platform/backup';
import { fileToCompressedDataUrl } from './platform/photos';
import { MonthCalendar } from './components/MonthCalendar';
import { DayDetails } from './components/DayDetails';
import { MemoryCard } from './components/MemoryCard';
import { JalaliDateField } from './components/JalaliDateField';
import { ConfirmDialog, PhotoViewer, type ConfirmState } from './components/Overlays';

const EMOJIS = ['🌸', '❤️', '🎂', '☕', '✈️', '🏡', '🎓', '📚', '🎬', '🏕️', '🌿', '✨', '🎉', '👨‍👩‍👧', '💍', '🏆', '🌧️', '🌅', '🐾', '🎨', '🧳', '🙏', '💡', '😊', '🛒', '💼', '🧘', '🚗'];
const MAX_PHOTOS = 8;
const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
const today = () => isoToday();
const DEFAULT_REMINDER_TEXT = 'امروز چه چیزی ارزش به خاطر سپردن داشت؟ قبل از اینکه روزت تموم بشه، خاطره‌ات رو ثبت کن.';

type MemForm = { date: string; title: string; description: string; emojis: string[]; category: string; color: string; multi: boolean; eventEndDate: string; photos: string[] };
const blankMemory = (date = today()): MemForm => ({ date, title: '', description: '', emojis: ['✨'], category: CATEGORIES[0], color: CATEGORY_COLORS[CATEGORIES[0]] || DEFAULT_COLOR, multi: false, eventEndDate: '', photos: [] });

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tab, setTab] = useState<'home' | 'calendar' | 'archive' | 'notebook' | 'settings'>('home');
  const [zoom, setZoom] = useState<'life' | 'year' | 'month' | 'day'>('month');
  const [jYear, setJYear] = useState(todayJ().jy);
  const [month, setMonth] = useState(todayJ().jm);
  const [day, setDay] = useState(todayJ().jd);
  const [modal, setModal] = useState<'memory' | 'note' | 'profile' | null>(null);
  const [sheetDay, setSheetDay] = useState<string | null>(null);
  const [viewer, setViewer] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [editing, setEditing] = useState<Memory | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);
  const [fatal, setFatal] = useState('');
  const [colorTouched, setColorTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [memForm, setMemForm] = useState<MemForm>(blankMemory());
  const [noteForm, setNoteForm] = useState({ title: '', content: '', emoji: '📖', category: 'شخصی' });
  const [profileForm, setProfileForm] = useState({ name: '', birthDate: '', lifespan: 85 });
  const [reminderForm, setReminderForm] = useState({ enabled: false, time: '21:30', message: DEFAULT_REMINDER_TEXT });
  const noticeTimer = useRef<number | undefined>(undefined);

  /* ---------- بارگذاری و ذخیره ---------- */
  const loadAll = useCallback(async () => {
    const [rawMem, rawNotes] = await Promise.all([db.memories.toArray(), db.notes.toArray()]);
    const normalized: Memory[] = [];
    const fixes: Memory[] = [];
    for (const raw of rawMem) {
      const n = normalizeMemory(raw);
      if (!n) continue; // رکورد خراب نمایش داده نمی‌شود اما از پایگاه داده پاک هم نمی‌شود
      normalized.push(n);
      if (JSON.stringify(n) !== JSON.stringify(raw)) fixes.push(n); // مهاجرت رنگ/تاریخ قدیمی
    }
    if (fixes.length) await db.memories.bulkPut(fixes);
    normalized.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
    setMemories(normalized);
    setNotes([...rawNotes].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))));
  }, []);

  const notify = useCallback((s: string) => {
    setNotice(s);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(''), 3200);
  }, []);

  const openNewMemory = useCallback((date = today(), endDate = '') => {
    setEditing(null); setColorTouched(false);
    setMemForm({ ...blankMemory(date), multi: !!endDate, eventEndDate: endDate });
    setModal('memory');
  }, []);

  const boot = useCallback(async () => {
    setFatal('');
    try {
      await ensureDefaults();
      try { await navigator.storage?.persist?.(); } catch { /* اختیاری */ }
      const [p, r] = await Promise.all([db.profile.get('profile'), db.reminder.get('reminder')]);
      if (p) { setProfile(p); setProfileForm({ name: p.name, birthDate: p.birthDate, lifespan: p.lifespan }); } else { setModal('profile'); }
      if (r) { setReminder(r); setReminderForm({ enabled: r.enabled, time: r.time, message: r.message }); }
      await loadAll();
      void restoreReminder(r);
    } catch (e) {
      setFatal(e instanceof Error ? e.message : 'خطا در باز کردن حافظه برنامه');
    }
    setReady(true);
  }, [loadAll]);

  useEffect(() => { void boot(); }, [boot]);
  useEffect(() => {
    let off = () => {};
    void onReminderTapped(() => { setTab('home'); openNewMemory(); }).then(f => { off = f; });
    return () => off();
  }, [openNewMemory]);

  /* ---------- دکمه بازگشت اندروید: ابتدا پنجره‌های باز را می‌بندد ---------- */
  const overlayCount = (modal ? 1 : 0) + (sheetDay ? 1 : 0) + (viewer ? 1 : 0) + (confirmState ? 1 : 0);
  const depthRef = useRef(0);
  const skipPop = useRef(0);
  const closeTopRef = useRef<() => void>(() => {});
  closeTopRef.current = () => { if (confirmState) setConfirmState(null); else if (viewer) setViewer(null); else if (modal) setModal(null); else if (sheetDay) setSheetDay(null); };
  useEffect(() => {
    while (depthRef.current < overlayCount) { history.pushState({ lc: depthRef.current + 1 }, ''); depthRef.current++; }
    if (depthRef.current > overlayCount) { const n = depthRef.current - overlayCount; depthRef.current = overlayCount; skipPop.current++; history.go(-n); }
  }, [overlayCount]);
  useEffect(() => {
    const onPop = () => {
      if (skipPop.current > 0) { skipPop.current--; return; }
      if (depthRef.current > 0) { depthRef.current--; closeTopRef.current(); }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /* ---------- مقادیر محاسبه‌شده ---------- */
  const currentJ = todayJ();
  const age = profile ? ageAtDate(profile.birthDate) : 0;
  const lifespan = profile?.lifespan || 85;
  const birthYear = profile ? parseKey(profile.birthDate).jy : currentJ.jy - 30;
  const minYear = birthYear, maxYear = birthYear + lifespan;
  const life = useMemo(() => (profile ? lifeStats(profile.birthDate, profile.lifespan) : null), [profile]);
  const todayKey = today();
  const safeDay = Math.min(day, monthDays(jYear, month));
  const selectedKey = dateKey(jYear, month, safeDay);
  const spans = useMemo(() => toSpans(memories), [memories]);
  const monthStart = keyToSerial(dateKey(jYear, month, 1));
  const monthEnd = monthStart + monthDays(jYear, month) - 1;
  const monthEvents = useMemo(() => eventsInRange(spans, monthStart, monthEnd), [spans, monthStart, monthEnd]);
  const yearCounts = useMemo(() => {
    const map = new Map<number, number>();
    for (const m of memories) { const y = parseKey(m.date).jy; map.set(y, (map.get(y) || 0) + 1); }
    return map;
  }, [memories]);
  const monthCountsOfYear = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const s = keyToSerial(dateKey(jYear, i + 1, 1));
    return eventsInRange(spans, s, s + monthDays(jYear, i + 1) - 1).length;
  }), [spans, jYear]);
  const dayItems = (key: string) => eventsOnDay(spans, keyToSerial(key)).map(s => s.memory);

  /* ---------- پیمایش تقویم ---------- */
  const goTo = (jy: number, jm: number, jd = 1) => { setJYear(jy); setMonth(jm); setDay(jd); };
  const changeMonth = (delta: number) => {
    let m = month + delta, y = jYear;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    if (y < minYear || y > maxYear) return;
    goTo(y, m, 1);
  };
  const shiftDay = (delta: number) => {
    const p = serialToParts(keyToSerial(selectedKey) + delta);
    if (p.jy < minYear || p.jy > maxYear) return;
    goTo(p.jy, p.jm, p.jd);
  };
  const goToday = () => goTo(currentJ.jy, currentJ.jm, currentJ.jd);

  /* ---------- خاطره‌ها ---------- */
  const openEditMemory = (m: Memory) => {
    setEditing(m); setColorTouched(true);
    setMemForm({ date: m.date, title: m.title, description: m.description, emojis: m.emojis, category: m.category, color: resolveColor(m.color), multi: !!m.eventEndDate, eventEndDate: m.eventEndDate || '', photos: m.photos || [] });
    setModal('memory');
  };
  const saveMemory = async () => {
    const date = canonicalKey(memForm.date);
    if (!date) { notify('تاریخ خاطره را انتخاب کن.'); return; }
    let end = '';
    if (memForm.multi) {
      const e = canonicalKey(memForm.eventEndDate);
      if (!e) { notify('تاریخ پایان رویداد را انتخاب کن.'); return; }
      if (e < date) { notify('تاریخ پایان نباید قبل از تاریخ شروع باشد.'); return; }
      end = e > date ? e : '';
    }
    if (!memForm.title.trim()) { notify('برای خاطره یک عنوان بنویس.'); return; }
    const now = new Date().toISOString();
    const item: Memory = {
      id: editing?.id || uid(), date, eventEndDate: end, title: memForm.title.trim(), description: memForm.description.trim(),
      emojis: memForm.emojis, category: memForm.category, color: memForm.color, photos: memForm.photos,
      createdAt: editing?.createdAt || now, updatedAt: now
    };
    try { await db.memories.put(item); await loadAll(); setModal(null); notify(editing ? 'تغییرات ذخیره شد.' : 'خاطره‌ات ثبت شد ❤️'); }
    catch { notify('ذخیره انجام نشد؛ شاید فضای حافظه کم است.'); }
  };
  const deleteMemory = (m: Memory) => setConfirmState({
    message: m.eventEndDate ? 'این رویداد چندروزه در تمام روزهایش حذف شود؟' : 'این خاطره حذف شود؟', confirmLabel: 'حذف', danger: true,
    onYes: async () => { try { await db.memories.delete(m.id); await loadAll(); setModal(null); notify('حذف شد.'); } catch { notify('حذف انجام نشد.'); } }
  });
  const addPhotos = async (files: FileList | null, input: HTMLInputElement) => {
    if (!files || files.length === 0) return;
    const room = MAX_PHOTOS - memForm.photos.length;
    if (room <= 0) { notify(`حداکثر ${fa(MAX_PHOTOS)} عکس برای هر خاطره.`); input.value = ''; return; }
    setBusy(true);
    try {
      const encoded: string[] = [];
      for (const f of Array.from(files).slice(0, room)) { try { encoded.push(await fileToCompressedDataUrl(f)); } catch { notify('یکی از عکس‌ها خوانده نشد.'); } }
      setMemForm(v => ({ ...v, photos: [...v.photos, ...encoded] }));
      if (files.length > room) notify(`فقط ${fa(MAX_PHOTOS)} عکس نگه داشته می‌شود.`);
    } finally { setBusy(false); input.value = ''; }
  };
  const changeStart = (key: string) => setMemForm(v => ({ ...v, date: key, eventEndDate: v.multi && v.eventEndDate && key && v.eventEndDate < key ? key : v.eventEndDate }));
  const toggleMulti = (on: boolean) => setMemForm(v => {
    if (!on) return { ...v, multi: false, eventEndDate: '' };
    const start = canonicalKey(v.date);
    return { ...v, multi: true, eventEndDate: v.eventEndDate || (start ? serialToKey(keyToSerial(start) + 1) : '') };
  });

  /* ---------- پروفایل، یادداشت، یادآوری ---------- */
  const saveProfile = async () => {
    const birth = canonicalKey(profileForm.birthDate);
    if (!birth) { notify('تاریخ تولد را کامل انتخاب کن.'); return; }
    if (birth > today()) { notify('تاریخ تولد نمی‌تواند در آینده باشد.'); return; }
    if (profileForm.lifespan < 50 || profileForm.lifespan > 110) { notify('طول عمر باید بین ۵۰ تا ۱۱۰ سال باشد.'); return; }
    if (profileForm.lifespan <= ageAtDate(birth)) { notify('طول عمر تخمینی باید بیشتر از سن فعلی باشد.'); return; }
    const p: Profile = { id: 'profile', name: profileForm.name.trim(), birthDate: birth, lifespan: profileForm.lifespan, createdAt: profile?.createdAt || new Date().toISOString() };
    try { await db.profile.put(p); setProfile(p); setModal(null); notify('مشخصات ذخیره شد.'); } catch { notify('ذخیره مشخصات انجام نشد.'); }
  };
  const saveNote = async () => {
    if (!noteForm.title.trim() && !noteForm.content.trim()) { notify('متن یادداشت خالی است.'); return; }
    const now = new Date().toISOString();
    try { await db.notes.put({ id: editingNote?.id || uid(), ...noteForm, createdAt: editingNote?.createdAt || now, updatedAt: now }); await loadAll(); setModal(null); notify('یادداشت ذخیره شد.'); }
    catch { notify('ذخیره یادداشت انجام نشد.'); }
  };
  const deleteNote = (n: Note) => setConfirmState({
    message: 'این یادداشت حذف شود؟', confirmLabel: 'حذف', danger: true,
    onYes: async () => { try { await db.notes.delete(n.id); await loadAll(); setModal(null); notify('یادداشت حذف شد.'); } catch { notify('حذف انجام نشد.'); } }
  });
  const saveReminder = async () => {
    if (!/^\d{2}:\d{2}$/.test(reminderForm.time)) { notify('ساعت یادآوری را انتخاب کن.'); return; }
    const r: Reminder = { id: 'reminder', ...reminderForm };
    try { await db.reminder.put(r); setReminder(r); } catch { notify('ذخیره تنظیمات انجام نشد.'); return; }
    try { notify((await scheduleDailyReminder(r)).message); } catch (e) { notify(e instanceof Error ? e.message : 'تنظیم یادآوری ناموفق بود.'); }
  };

  /* ---------- پشتیبان‌گیری ---------- */
  const exportData = async () => {
    try {
      const payload = { app: 'life-calendar', version: 2, exportedAt: new Date().toISOString(), profile: await db.profile.get('profile') ?? null, reminder: await db.reminder.get('reminder') ?? null, memories: await db.memories.toArray(), notes: await db.notes.toArray() };
      notify(await exportBackup(payload));
    } catch (e) { notify(e instanceof Error ? `پشتیبان‌گیری ناموفق بود: ${e.message}` : 'پشتیبان‌گیری ناموفق بود.'); }
  };
  const importData = async (input: HTMLInputElement) => {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    let data: any;
    try { data = JSON.parse(await file.text()); } catch { notify('فایل پشتیبان معتبر نیست.'); return; }
    const mems = (Array.isArray(data?.memories) ? data.memories : []).map(normalizeMemory).filter(Boolean) as Memory[];
    const nts = (Array.isArray(data?.notes) ? data.notes : []).filter((n: any) => n && typeof n.id === 'string').map((n: any): Note => ({ id: n.id, title: String(n.title ?? ''), content: String(n.content ?? ''), emoji: String(n.emoji ?? '📖'), category: String(n.category ?? 'شخصی'), createdAt: String(n.createdAt ?? new Date().toISOString()), updatedAt: String(n.updatedAt ?? n.createdAt ?? new Date().toISOString()) }));
    const prof = data?.profile && canonicalKey(data.profile.birthDate) ? { id: 'profile' as const, name: String(data.profile.name ?? ''), birthDate: canonicalKey(data.profile.birthDate)!, lifespan: Math.min(110, Math.max(50, Number(data.profile.lifespan) || 85)), createdAt: String(data.profile.createdAt ?? new Date().toISOString()) } : null;
    if (!mems.length && !nts.length && !prof) { notify('در این فایل داده‌ای برای بازیابی پیدا نشد.'); return; }
    setConfirmState({
      message: `${fa(mems.length)} خاطره و ${fa(nts.length)} یادداشت${prof ? ' و مشخصات تولد' : ''} بازیابی شود؟ داده‌های فعلی حفظ می‌شوند و موارد هم‌شناسه با نسخه پشتیبان جایگزین می‌شوند.`,
      confirmLabel: 'بازیابی',
      onYes: async () => {
        try {
          await db.transaction('rw', db.profile, db.reminder, db.memories, db.notes, async () => {
            if (prof) await db.profile.put(prof);
            if (data.reminder && typeof data.reminder.time === 'string') await db.reminder.put({ id: 'reminder', enabled: !!data.reminder.enabled, time: data.reminder.time, message: String(data.reminder.message ?? DEFAULT_REMINDER_TEXT) });
            if (mems.length) await db.memories.bulkPut(mems);
            if (nts.length) await db.notes.bulkPut(nts);
          });
          const p = await db.profile.get('profile'); const r = await db.reminder.get('reminder');
          if (p) { setProfile(p); setProfileForm({ name: p.name, birthDate: p.birthDate, lifespan: p.lifespan }); } else { setModal('profile'); }
          if (r) { setReminder(r); setReminderForm({ enabled: r.enabled, time: r.time, message: r.message }); void restoreReminder(r); }
          await loadAll();
          notify('نسخه پشتیبان بازیابی شد.');
        } catch { notify('بازیابی انجام نشد.'); }
      }
    });
  };
  const lastBackup = getLastBackup();

  /* ---------- نمایش ---------- */
  if (!ready) return <div className="loading"><div className="loader" /><b>تقویم زندگی</b><span>در حال آماده‌سازی خاطراتت…</span></div>;
  if (fatal) return <div className="loading"><b>مشکل در باز کردن اطلاعات</b><span>{fatal}</span><button className="primary-solid" onClick={() => { setReady(false); void boot(); }}>تلاش دوباره</button></div>;

  const recent = [...memories].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const filtered = memories.filter(m => (m.title + ' ' + m.description + ' ' + m.category).includes(search.trim())).sort((a, b) => b.date.localeCompare(a.date));
  const ymd = (v: { years: number; months: number; days: number }) => `${fa(v.years)} سال و ${fa(v.months)} ماه و ${fa(v.days)} روز`;
  const NAV = [{ id: 'home', label: 'خانه', icon: Home }, { id: 'calendar', label: 'تقویم', icon: CalendarDays }, { id: 'archive', label: 'خاطرات', icon: Heart }, { id: 'notebook', label: 'دفترچه', icon: BookOpen }, { id: 'settings', label: 'تنظیمات', icon: Settings }] as const;

  return <div className="app" dir="rtl">
    <header className="topbar">
      <img className="brandlogo" src="icon.svg" alt="" width={42} height={42} />
      <div className="brand"><b>تقویم زندگی</b><small>هر روز، یک داستان برای به یاد آوردن</small></div>
      <button className="iconbtn" onClick={() => setTab('settings')} aria-label="تنظیمات"><Settings size={20} /></button>
    </header>
    <main className="main">
      {tab === 'home' && <>
        <section className="hero">
          <div className="hero-copy"><span className="eyebrow">سلام {profile?.name?.trim() || 'دوست من'} 🌱</span><h1>زندگی از همین<br />لحظه‌ها ساخته می‌شه.</h1><p>امروز چه چیزی ارزش به خاطر سپردن داشت؟</p><button className="primary" onClick={() => openNewMemory()}><Plus size={17} /> ثبت خاطره امروز</button></div>
          <div className="hero-art"><div className="sunblob">☀️</div><div className="bear">🐻</div><span className="float f1">💌</span><span className="float f2">🌷</span><span className="float f3">✨</span></div>
        </section>
        <section className="stats">
          <div className="statcard"><span>سال‌های سپری‌شده</span><strong>{fa(age)}</strong><small>از مسیر زندگی</small></div>
          <div className="statcard purple"><span>خاطرات ثبت‌شده</span><strong>{fa(memories.length)}</strong><small>لحظه‌های ماندگار</small></div>
          <div className="statcard peach"><span>افق انتخابی عمر</span><strong>{fa(lifespan)}</strong><small>سال</small></div>
        </section>
        {life ? <section className="lifecard">
          <div className="lc-top"><b>مسیر زندگی تو</b><span>{fa(life.percent.toFixed(1)).replace('.', '٫')}٪</span></div>
          <div className="lc-bar" role="progressbar" aria-valuenow={Math.round(life.percent)} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${life.percent}%` }} /></div>
          <div className="lc-grid">
            <div><small>سپری‌شده</small><b>{ymd(life.elapsed)}</b></div>
            <div><small>{life.pastHorizon ? 'از افق انتخابی گذشته‌ای' : 'باقی‌مانده تا افق انتخابی'}</small><b>{life.pastHorizon ? '—' : ymd(life.remaining)}</b></div>
            <div><small>روزهای سپری‌شده</small><b>{faNum(life.daysLived)} روز</b></div>
            <div><small>روزهای باقی‌مانده</small><b>{faNum(life.daysRemaining)} روز</b></div>
            <div><small>ماه‌های سپری‌شده</small><b>{faNum(life.monthsLived)} ماه</b></div>
            <div><small>ماه‌های باقی‌مانده</small><b>{faNum(life.monthsRemaining)} ماه</b></div>
          </div>
        </section> : <button className="add-day" onClick={() => setModal('profile')}>برای دیدن مسیر زندگی، تاریخ تولدت را وارد کن</button>}
        <section className="sectionhead"><div><h2>خاطرات تازه</h2><p>چیزهایی که ثبت کردی</p></div><button className="textbtn" onClick={() => setTab('archive')}>همه خاطرات <ChevronLeft size={16} /></button></section>
        {memories.length === 0
          ? <div className="empty"><div>📔</div><b>هنوز خاطره‌ای ثبت نکردی</b><p>اولین خاطره‌ات رو ثبت کن تا تقویم زندگی‌ات کم‌کم رنگ بگیره.</p><button className="secondary" onClick={() => openNewMemory()}>ثبت اولین خاطره</button></div>
          : <div className="memory-list">{recent.map(m => <MemoryCard key={m.id} memory={m} onClick={() => openEditMemory(m)} />)}</div>}
        <section className="quote"><span>“</span><p>قرار نیست همه روزها فوق‌العاده باشن؛ فقط کافیه بعضی لحظه‌ها رو فراموش نکنیم.</p></section>
      </>}

      {tab === 'calendar' && <>
        <div className="page-title"><div><span className="eyebrow">نقشه شخصی زندگی</span><h1>تقویم من</h1></div><button className="roundplus" aria-label="افزودن خاطره" onClick={() => openNewMemory(selectedKey)}><Plus /></button></div>
        <div className="zoom-tabs">{([{ id: 'life', label: 'کل عمر' }, { id: 'year', label: 'سال' }, { id: 'month', label: 'ماه' }, { id: 'day', label: 'روز' }] as const).map(x => <button className={zoom === x.id ? 'active' : ''} onClick={() => setZoom(x.id)} key={x.id}>{x.label}</button>)}</div>

        {zoom === 'life' && <>
          <div className="life-summary"><div><span>افق انتخابی تو</span><strong>{fa(lifespan)} سال</strong></div><div><span>سال زندگی</span><strong>{fa(age + 1)} از {fa(lifespan)}</strong></div><div><span>خاطره‌ها</span><strong>{fa(memories.length)}</strong></div></div>
          <div className="year-grid">{Array.from({ length: lifespan }, (_, i) => i + 1).map(y => {
            const jy = birthYear + y - 1, count = yearCounts.get(jy) || 0;
            const state = jy < currentJ.jy ? 'past' : jy === currentJ.jy ? 'now' : 'future';
            return <button key={y} className={`yearbox ${state}`} aria-label={`سال ${fa(jy)}`} onClick={() => { setJYear(jy); setZoom('year'); }}><b>{fa(y)}</b>{count > 0 && <i />}</button>;
          })}</div>
          <p className="hint">هر خانه یک سال شمسی از سال تولد توست؛ برای دیدن ماه‌های آن سال، روی خانه بزن.</p>
        </>}

        {zoom === 'year' && <>
          <div className="selector"><button aria-label="سال قبل" disabled={jYear <= minYear} onClick={() => setJYear(v => Math.max(minYear, v - 1))}><ChevronRight /></button><div><b>سال {fa(jYear)}</b><small>سال {fa(jYear - birthYear + 1)} از مسیر زندگی</small></div><button aria-label="سال بعد" disabled={jYear >= maxYear} onClick={() => setJYear(v => Math.min(maxYear, v + 1))}><ChevronLeft /></button></div>
          <div className="month-grid">{months.map((m, i) => <button key={m} className="month-tile" onClick={() => { goTo(jYear, i + 1, 1); setZoom('month'); }}><span>{['🌸', '🌿', '☀️', '🍉', '🏖️', '🌾', '🍂', '🌧️', '☕', '❄️', '⛄', '🌱'][i]}</span><b>{m}</b><small>{fa(monthCountsOfYear[i])} رویداد</small></button>)}</div>
        </>}

        {zoom === 'month' && <>
          <div className="selector"><button aria-label="ماه قبل" onClick={() => changeMonth(-1)}><ChevronRight /></button><div><b>{months[month - 1]} {fa(jYear)}</b><small>{fa(monthEvents.length)} رویداد در این ماه</small></div><button aria-label="ماه بعد" onClick={() => changeMonth(1)}><ChevronLeft /></button></div>
          {(jYear !== currentJ.jy || month !== currentJ.jm) && <button className="today-pill" onClick={goToday}>برگشت به امروز</button>}
          <div className="mc-card"><MonthCalendar jy={jYear} jm={month} memories={memories} todayKey={todayKey} selectedKey={sheetDay} onDayClick={k => { const p = parseKey(k); setDay(p.jd); setSheetDay(k); }} /></div>
          <section className="sectionhead month-head"><div><h2>رویدادهای {months[month - 1]}</h2><p>برای دیدن جزئیات یا ویرایش، روی هر مورد بزن</p></div></section>
          <div className="month-memories">{monthEvents.length === 0 ? <p className="hint">هنوز رویدادی برای این ماه ثبت نشده.</p> : monthEvents.map(s => <MemoryCard key={s.memory.id} memory={s.memory} onClick={() => openEditMemory(s.memory)} />)}</div>
        </>}

        {zoom === 'day' && <>
          <div className="selector"><button aria-label="روز قبل" onClick={() => shiftDay(-1)}><ChevronRight /></button><div><b>{formatDate(selectedKey)}</b><small>{weekdayName(selectedKey)}{selectedKey === todayKey ? ' · امروز' : ''}</small></div><button aria-label="روز بعد" onClick={() => shiftDay(1)}><ChevronLeft /></button></div>
          <button className="add-day" onClick={() => openNewMemory(selectedKey)}><Plus /> افزودن خاطره برای این روز</button>
          <DayDetails dayKey={selectedKey} items={dayItems(selectedKey)} onEdit={openEditMemory} onPhoto={setViewer} />
        </>}
      </>}

      {tab === 'archive' && <>
        <div className="page-title"><div><span className="eyebrow">مرور گذشته</span><h1>آرشیو خاطرات</h1></div><span className="countpill">{fa(memories.length)} خاطره</span></div>
        <div className="searchbox"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="جست‌وجو در خاطرات…" /></div>
        <div className="memory-list">{filtered.map(m => <MemoryCard key={m.id} memory={m} onClick={() => openEditMemory(m)} />)}</div>
        {memories.length === 0 && <div className="empty"><div>🗂️</div><b>آرشیو هنوز خالیه</b><p>خاطراتی که ثبت می‌کنی اینجا جمع می‌شن.</p></div>}
        {memories.length > 0 && filtered.length === 0 && <div className="empty"><div>🔍</div><b>چیزی پیدا نشد</b></div>}
      </>}

      {tab === 'notebook' && <>
        <div className="page-title"><div><span className="eyebrow">جایی برای فکرهایت</span><h1>دفترچه من</h1></div><button className="roundplus" aria-label="یادداشت جدید" onClick={() => { setEditingNote(null); setNoteForm({ title: '', content: '', emoji: '📖', category: 'شخصی' }); setModal('note'); }}><Plus /></button></div>
        <div className="notebook-cover"><div>📖</div><b>صفحه‌هایی برای خودم</b><span>یادداشت‌ها، ایده‌ها و حرف‌های نگفته</span></div>
        {notes.map(n => <button className="note-card" key={n.id} onClick={() => { setEditingNote(n); setNoteForm({ title: n.title, content: n.content, emoji: n.emoji, category: n.category }); setModal('note'); }}><span>{n.emoji}</span><div><b>{n.title || 'یادداشت بدون عنوان'}</b><p>{n.content.slice(0, 100)}</p><small>{new Date(n.updatedAt).toLocaleDateString('fa-IR')}</small></div><ChevronLeft /></button>)}
        {notes.length === 0 && <div className="empty"><div>✍️</div><b>دفترچه‌ات منتظر اولین نوشته است</b><p>هر چیزی که نمی‌خواهی فراموش کنی اینجا بنویس.</p></div>}
      </>}

      {tab === 'settings' && <>
        <div className="page-title"><div><span className="eyebrow">شخصی‌سازی تجربه</span><h1>تنظیمات</h1></div><div className="settings-icon"><Settings /></div></div>
        <div className="setting-card">
          <div className="setting-head"><div className="setting-symbol">👤</div><div><b>مشخصات من</b><small>تاریخ تولد و افق عمر</small></div><button aria-label="ویرایش مشخصات" onClick={() => setModal('profile')}><Pencil size={17} /></button></div>
          <div className="setting-line"><span>تاریخ تولد</span><b>{profile ? formatDate(profile.birthDate) : '—'}</b></div>
          <div className="setting-line"><span>طول عمر انتخابی</span><b>{fa(lifespan)} سال</b></div>
        </div>
        <div className="setting-card">
          <div className="setting-head"><div className="setting-symbol">🔔</div><div><b>یادآوری روزانه</b><small>هر شب یک تلنگر برای ثبت خاطره</small></div><label className="switch"><input type="checkbox" checked={reminderForm.enabled} onChange={e => setReminderForm(v => ({ ...v, enabled: e.target.checked }))} /><span /></label></div>
          <label className="field-label">ساعت یادآوری</label>
          <input className="field" type="time" value={reminderForm.time} onChange={e => setReminderForm(v => ({ ...v, time: e.target.value }))} />
          <label className="field-label">متن اعلان</label>
          <textarea className="field" rows={3} value={reminderForm.message} onChange={e => setReminderForm(v => ({ ...v, message: e.target.value }))} />
          <button className="primary-solid full" onClick={saveReminder}><Bell size={17} /> ذخیره تنظیمات یادآوری</button>
          <p className="microhint">برای دریافت اعلان واقعی، نسخه اندروید باید نصب شده و اجازه اعلان‌ها فعال باشد.</p>
        </div>
        <div className="setting-card">
          <div className="setting-head"><div className="setting-symbol">💾</div><div><b>پشتیبان‌گیری اطلاعات</b><small>{lastBackup ? `آخرین پشتیبان: ${new Date(lastBackup).toLocaleDateString('fa-IR')}` : 'هنوز پشتیبان نگرفته‌ای'}</small></div></div>
          <div className="backup-actions">
            <button className="secondary" onClick={exportData}><Download size={16} /> خروجی پشتیبان</button>
            <label className="secondary filelabel"><Upload size={16} /> بازیابی پشتیبان<input type="file" accept=".json,application/json" onChange={e => void importData(e.target)} /></label>
          </div>
          <p className="microhint">فایل پشتیبان شامل خاطرات، عکس‌ها، یادداشت‌ها و تنظیمات است. آن را در Drive یا جای امن دیگری نگه دار تا با حذف برنامه یا تعویض گوشی از بین نرود.</p>
        </div>
        <div className="about">تقویم زندگی · نسخه ۱.۱.۰<br />خاطراتت، بخشی از داستان تو هستند. 💜</div>
      </>}
    </main>

    <nav className="bottomnav">{NAV.map(x => <button key={x.id} className={tab === x.id ? 'selected' : ''} onClick={() => setTab(x.id)}><x.icon size={20} /><span>{x.label}</span></button>)}</nav>
    {notice && <div className="toast" role="status">{notice}</div>}

    {sheetDay && <div className="modal-backdrop sheet-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSheetDay(null); }}>
      <section className="modal sheet" role="dialog" aria-modal="true">
        <div className="modal-head"><div><span className="eyebrow">{weekdayName(sheetDay)}{sheetDay === todayKey ? ' · امروز' : ''}</span><h2>{formatDate(sheetDay)}</h2></div><button className="iconbtn" aria-label="بستن" onClick={() => setSheetDay(null)}><X /></button></div>
        <DayDetails dayKey={sheetDay} items={dayItems(sheetDay)} onEdit={openEditMemory} onPhoto={setViewer} />
        <button className="add-day" onClick={() => openNewMemory(sheetDay)}><Plus /> افزودن رویداد یا خاطره در این روز</button>
      </section>
    </div>}

    {modal && <div className="modal-backdrop form-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}>
      <section className="modal" role="dialog" aria-modal="true">
        <div className="modal-head"><div><span className="eyebrow">{modal === 'memory' ? 'ثبت لحظه ماندگار' : modal === 'note' ? 'دفترچه شخصی' : 'پروفایل من'}</span><h2>{modal === 'memory' ? (editing ? 'ویرایش خاطره' : 'خاطره جدید') : modal === 'note' ? (editingNote ? 'ویرایش یادداشت' : 'یادداشت جدید') : 'مشخصات زندگی'}</h2></div><button className="iconbtn" aria-label="بستن" onClick={() => setModal(null)}><X /></button></div>

        {modal === 'memory' && <div className="formbody">
          <label className="field-label">عنوان خاطره یا رویداد</label>
          <input className="field" value={memForm.title} maxLength={80} onChange={e => setMemForm(v => ({ ...v, title: e.target.value }))} placeholder="مثلاً تولد علی" />
          <label className="field-label">{memForm.multi ? 'تاریخ شروع' : 'تاریخ'}</label>
          <JalaliDateField label="تاریخ" value={memForm.date} minYear={Math.min(minYear, currentJ.jy - 1)} maxYear={Math.max(maxYear, currentJ.jy + 5)} onChange={changeStart} />
          <div className="switchrow"><div><b>رویداد چندروزه</b><small>مثلاً سفر یا مسافرت چندروزه</small></div><label className="switch"><input type="checkbox" checked={memForm.multi} onChange={e => toggleMulti(e.target.checked)} /><span /></label></div>
          {memForm.multi && <><label className="field-label">تاریخ پایان</label><JalaliDateField label="تاریخ پایان" value={memForm.eventEndDate} minYear={Math.min(minYear, currentJ.jy - 1)} maxYear={Math.max(maxYear, currentJ.jy + 5)} onChange={k => setMemForm(v => ({ ...v, eventEndDate: k }))} />
            {memForm.date && memForm.eventEndDate && memForm.eventEndDate >= memForm.date && <p className="microhint">مدت رویداد: {fa(keyToSerial(memForm.eventEndDate) - keyToSerial(memForm.date) + 1)} روز</p>}</>}
          <label className="field-label">شرح (اختیاری)</label>
          <textarea className="field" rows={3} value={memForm.description} onChange={e => setMemForm(v => ({ ...v, description: e.target.value }))} placeholder="دوست داری از این روز چی یادت بمونه؟" />
          <label className="field-label">دسته‌بندی</label>
          <select className="field" value={memForm.category} onChange={e => { const c = e.target.value; setMemForm(v => ({ ...v, category: c, color: !colorTouched ? (CATEGORY_COLORS[c] || v.color) : v.color })); }}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
          <label className="field-label">رنگ رویداد در تقویم</label>
          <div className="color-picker">{EVENT_COLORS.map(c => <button type="button" key={c.hex} aria-label={c.name} style={{ background: c.hex }} className={resolveColor(memForm.color) === c.hex ? 'chosen' : ''} onClick={() => { setColorTouched(true); setMemForm(v => ({ ...v, color: c.hex })); }} />)}</div>
          <label className="field-label">ایموجی (اولی کنار عنوان در تقویم نمایش داده می‌شود)</label>
          <div className="emoji-picker">{EMOJIS.map(e => <button type="button" key={e} className={memForm.emojis.includes(e) ? 'chosen' : ''} onClick={() => setMemForm(v => ({ ...v, emojis: v.emojis.includes(e) ? v.emojis.filter(x => x !== e) : [...v.emojis, e] }))}>{e}</button>)}</div>
          <label className="secondary filelabel photo-upload"><ImagePlus size={17} /> {busy ? 'در حال آماده‌سازی عکس…' : `افزودن عکس (${fa(memForm.photos.length)}/${fa(MAX_PHOTOS)})`}<input type="file" accept="image/*" multiple disabled={busy} onChange={e => void addPhotos(e.target.files, e.target)} /></label>
          {memForm.photos.length > 0 && <div className="photo-strip">{memForm.photos.map((p, i) => <div className="photo-item" key={i}><img src={p} alt="" onClick={() => setViewer(p)} /><button type="button" aria-label="حذف عکس" onClick={() => setMemForm(v => ({ ...v, photos: v.photos.filter((_, j) => j !== i) }))}><X size={12} /></button></div>)}</div>}
          <button className="primary-solid full" onClick={saveMemory}><Save size={17} /> ذخیره</button>
          {editing && <button className="danger full" onClick={() => deleteMemory(editing)}><Trash2 size={17} /> حذف {editing.eventEndDate ? 'رویداد' : 'خاطره'}</button>}
        </div>}

        {modal === 'note' && <div className="formbody">
          <label className="field-label">عنوان</label><input className="field" value={noteForm.title} onChange={e => setNoteForm(v => ({ ...v, title: e.target.value }))} placeholder="عنوان یادداشت" />
          <label className="field-label">متن یادداشت</label><textarea className="field" rows={8} value={noteForm.content} onChange={e => setNoteForm(v => ({ ...v, content: e.target.value }))} placeholder="هر چیزی که می‌خواهی برای خودت بنویس…" />
          <label className="field-label">نشانه</label>
          <div className="emoji-picker">{['📖', '💡', '💭', '🌱', '❤️', '⭐', '📝', '🎯'].map(e => <button type="button" className={noteForm.emoji === e ? 'chosen' : ''} key={e} onClick={() => setNoteForm(v => ({ ...v, emoji: e }))}>{e}</button>)}</div>
          <button className="primary-solid full" onClick={saveNote}><Save size={17} /> ذخیره یادداشت</button>
          {editingNote && <button className="danger full" onClick={() => deleteNote(editingNote)}><Trash2 size={17} /> حذف یادداشت</button>}
        </div>}

        {modal === 'profile' && <div className="formbody">
          <label className="field-label">نام (اختیاری)</label><input className="field" value={profileForm.name} onChange={e => setProfileForm(v => ({ ...v, name: e.target.value }))} placeholder="نام تو" />
          <label className="field-label">تاریخ تولد (شمسی)</label>
          <JalaliDateField label="تاریخ تولد" value={profileForm.birthDate} minYear={1300} maxYear={currentJ.jy} onChange={k => setProfileForm(v => ({ ...v, birthDate: k }))} />
          <label className="field-label">افق تخمینی عمر: {fa(profileForm.lifespan)} سال</label>
          <input type="range" min="50" max="110" value={profileForm.lifespan} onChange={e => setProfileForm(v => ({ ...v, lifespan: Number(e.target.value) }))} />
          <p className="microhint">این عدد فقط برای نمایش تصویری مسیر زندگی است و پیش‌بینی طول عمر نیست.</p>
          <button className="primary-solid full" onClick={saveProfile}><Save size={17} /> ذخیره مشخصات</button>
        </div>}
      </section>
    </div>}

    {viewer && <PhotoViewer src={viewer} onClose={() => setViewer(null)} />}
    {confirmState && <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />}
  </div>;
}
