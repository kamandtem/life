import Dexie, { type Table } from 'dexie';
import type { Memory, Note, Profile, Reminder } from '../types';
class LifeCalendarDB extends Dexie {
  profile!: Table<Profile, string>; memories!: Table<Memory, string>; notes!: Table<Note, string>; reminder!: Table<Reminder, string>;
  constructor() { super('LifeCalendarDB'); this.version(1).stores({ profile: 'id', memories: 'id,date,category,createdAt', notes: 'id,category,createdAt', reminder: 'id' }); }
}
export const db = new LifeCalendarDB();
export async function ensureDefaults() {
  if (!(await db.reminder.get('reminder'))) await db.reminder.put({ id:'reminder', enabled:false, time:'21:30', message:'امروز چه چیزی ارزش به خاطر سپردن داشت؟ قبل از اینکه روزت تموم بشه، خاطره‌ات رو ثبت کن.' });
}
