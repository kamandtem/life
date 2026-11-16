import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import type { Reminder } from '../types';

const NOTIFICATION_ID = 7101;
const CHANNEL_ID = 'daily-memory';

export async function scheduleDailyReminder(settings: Reminder) {
  if (!Capacitor.isNativePlatform()) return { native: false, message: 'یادآوری اندروید پس از نصب نسخه APK فعال می‌شود.' };
  await LocalNotifications.createChannel({ id: CHANNEL_ID, name: 'یادآوری روزانه', description: 'یادآوری برای ثبت خاطره روزانه', importance: 4, visibility: 1 });
  await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
  if (!settings.enabled) return { native: true, message: 'یادآوری خاموش شد.' };
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== 'granted') throw new Error('اجازه اعلان‌ها داده نشد؛ از تنظیمات گوشی اعلان‌های برنامه را فعال کن.');
  const [hour, minute] = settings.time.split(':').map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) throw new Error('ساعت یادآوری معتبر نیست.');
  await LocalNotifications.schedule({
    notifications: [{
      id: NOTIFICATION_ID, title: 'تقویم زندگی', body: settings.message,
      schedule: { on: { hour, minute }, allowWhileIdle: true }, channelId: CHANNEL_ID, smallIcon: 'ic_stat_lifecalendar'
    }]
  });
  return { native: true, message: 'یادآوری روزانه تنظیم شد.' };
}

/** هنگام باز شدن برنامه، یادآوری فعال را دوباره زمان‌بندی می‌کند (مثلاً بعد از به‌روزرسانی برنامه). */
export async function restoreReminder(settings: Reminder | null | undefined) {
  if (!settings?.enabled || !Capacitor.isNativePlatform()) return;
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display === 'granted') await scheduleDailyReminder(settings);
  } catch { /* بی‌صدا؛ کاربر می‌تواند از تنظیمات دوباره ذخیره کند */ }
}

/** لمس اعلان → باز شدن فرم ثبت خاطره */
export async function onReminderTapped(handler: () => void) {
  if (!Capacitor.isNativePlatform()) return () => {};
  const sub = await LocalNotifications.addListener('localNotificationActionPerformed', () => handler());
  return () => { sub.remove(); };
}
