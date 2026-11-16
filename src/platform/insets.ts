/**
 * فاصله‌های امن (Safe Area) در اندروید.
 * کد بومی MainActivity (که اسکریپت scripts/setup-android.mjs می‌سازد) اندازه نوار وضعیت،
 * نوار ناوبری، بریدگی نمایشگر و کیبورد را به‌صورت متغیرهای CSS به صفحه می‌دهد:
 *   --ni-top  --ni-bottom  --ni-left  --ni-right   و کلاس kb-open روی <html> هنگام باز بودن کیبورد
 * در مرورگر عادی این متغیرها تنظیم نمی‌شوند و CSS به env(safe-area-inset-*) برمی‌گردد.
 */
export interface NativeInsets { top: number; bottom: number; left: number; right: number; ime: boolean }
declare global {
  interface Window {
    LifeInsets?: { get: () => string };
    __applyNativeInsets?: (i: NativeInsets) => void;
  }
}
export function initInsets() {
  const root = document.documentElement;
  const apply = (i: NativeInsets) => {
    root.style.setProperty('--ni-top', `${i.top}px`);
    root.style.setProperty('--ni-bottom', `${i.bottom}px`);
    root.style.setProperty('--ni-left', `${i.left}px`);
    root.style.setProperty('--ni-right', `${i.right}px`);
    root.classList.toggle('kb-open', !!i.ime);
  };
  window.__applyNativeInsets = apply;
  try {
    const raw = window.LifeInsets?.get?.();
    if (raw) apply(JSON.parse(raw));
  } catch { /* در مرورگر عادی بی‌اثر است */ }
}
