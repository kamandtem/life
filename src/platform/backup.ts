import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const LAST_BACKUP_KEY = 'lc_last_backup';
export const getLastBackup = (): string | null => { try { return localStorage.getItem(LAST_BACKUP_KEY); } catch { return null; } };
const markBackup = () => { try { localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString()); } catch { /* ignore */ } };

const stamp = () => { const d = new Date(); const p = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`; };

/**
 * در اندروید دانلود با <a download> کار نمی‌کند؛ فایل را در حافظه موقت برنامه می‌نویسیم
 * و با پنجره اشتراک‌گذاری اندروید می‌دهیم (ذخیره در Files / Drive / ارسال در پیام‌رسان).
 * خروجی: پیام نتیجه برای نمایش به کاربر.
 */
export async function exportBackup(payload: object): Promise<string> {
  const json = JSON.stringify(payload);
  const name = `life-calendar-backup-${stamp()}.json`;
  if (Capacitor.isNativePlatform()) {
    const written = await Filesystem.writeFile({ path: name, data: json, directory: Directory.Cache, encoding: Encoding.UTF8 });
    try {
      await Share.share({ title: 'پشتیبان تقویم زندگی', dialogTitle: 'ذخیره یا ارسال نسخه پشتیبان', url: written.uri });
      markBackup();
      return 'پنجره ذخیره/ارسال پشتیبان باز شد.';
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (/cancel/i.test(msg)) return 'ارسال پشتیبان لغو شد.';
      const doc = await Filesystem.writeFile({ path: name, data: json, directory: Directory.Documents, encoding: Encoding.UTF8, recursive: true });
      markBackup();
      return `پشتیبان در پوشه Documents ذخیره شد: ${name}${doc.uri ? '' : ''}`;
    }
  }
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  markBackup();
  return 'فایل پشتیبان دانلود شد.';
}
