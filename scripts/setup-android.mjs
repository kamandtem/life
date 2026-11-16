#!/usr/bin/env node
/**
 * اصلاحات بومی اندروید؛ بعد از `npx cap add android` / `npx cap sync android` و قبل از Gradle اجرا کنید:
 *   node scripts/setup-android.mjs
 * چند بار اجرا کردنش بی‌خطر است (idempotent).
 *
 * کارهایی که انجام می‌دهد:
 *  1) MainActivity: حالت edge-to-edge پایدار روی همه نسخه‌های اندروید + ارسال اندازه نوار وضعیت،
 *     نوار ناوبری، بریدگی نمایشگر و کیبورد به صفحه (متغیرهای CSS) تا هدر و نوار پایین با سیستم تداخل نکنند.
 *  2) AndroidManifest: windowSoftInputMode=adjustResize و مجوز اعلان‌ها.
 *  3) آیکن برنامه (launcher) و آیکن اعلان از پوشه android-assets.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const androidDir = path.join(root, 'android');
if (!fs.existsSync(androidDir)) { console.error('پوشه android وجود ندارد. ابتدا `npx cap add android` را اجرا کنید.'); process.exit(1); }

const cfgText = fs.readFileSync(path.join(root, 'capacitor.config.ts'), 'utf8');
const appId = /appId:\s*'([^']+)'/.exec(cfgText)?.[1];
if (!appId) { console.error('appId در capacitor.config.ts پیدا نشد.'); process.exit(1); }

const mainRes = path.join(androidDir, 'app/src/main');
const javaDir = path.join(mainRes, 'java', ...appId.split('.'));
fs.mkdirSync(javaDir, { recursive: true });

/* ---- 1) MainActivity ---- */
for (const f of fs.readdirSync(javaDir)) if (f === 'MainActivity.kt') fs.rmSync(path.join(javaDir, f));
const activity = `package ${appId};

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import java.util.Locale;

/**
 * تولیدشده توسط scripts/setup-android.mjs
 * برنامه زیر نوار وضعیت و نوار ناوبری کشیده می‌شود (edge-to-edge) و اندازه آن‌ها به صفحه داده می‌شود؛
 * هدر بنفش از زیر نوار وضعیت شروع می‌شود و نوار پایین بالاتر از دکمه‌های ناوبری می‌ماند.
 */
public class MainActivity extends BridgeActivity {
    private volatile String lastInsetsJson = "{\\"top\\":0,\\"bottom\\":0,\\"left\\":0,\\"right\\":0,\\"ime\\":false}";

    public class InsetsBridge {
        @JavascriptInterface
        public String get() {
            return lastInsetsJson;
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= 29) {
            window.setNavigationBarContrastEnforced(false);
        }
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams lp = window.getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(lp);
        }
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        controller.setAppearanceLightStatusBars(false);     // آیکن‌های سفید روی هدر بنفش
        controller.setAppearanceLightNavigationBars(true);  // آیکن‌های تیره روی زمینه روشن

        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().addJavascriptInterface(new InsetsBridge(), "LifeInsets");
        }

        final View content = findViewById(android.R.id.content);
        ViewCompat.setOnApplyWindowInsetsListener(content, (v, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            boolean imeOpen = insets.isVisible(WindowInsetsCompat.Type.ime()) && ime.bottom > bars.bottom;
            // وقتی کیبورد باز است، ناحیه وب‌ویو کوچک می‌شود تا فیلد در حال تایپ پشت کیبورد نرود
            v.setPadding(0, 0, 0, imeOpen ? ime.bottom : 0);
            pushInsets(bars, imeOpen);
            return WindowInsetsCompat.CONSUMED;
        });
        ViewCompat.requestApplyInsets(content);
    }

    private void pushInsets(Insets bars, boolean imeOpen) {
        float d = getResources().getDisplayMetrics().density;
        lastInsetsJson = String.format(Locale.US,
            "{\\"top\\":%.2f,\\"bottom\\":%.2f,\\"left\\":%.2f,\\"right\\":%.2f,\\"ime\\":%b}",
            bars.top / d, imeOpen ? 0f : bars.bottom / d, bars.left / d, bars.right / d, imeOpen);
        if (getBridge() == null) return;
        WebView web = getBridge().getWebView();
        if (web == null) return;
        web.evaluateJavascript("window.__applyNativeInsets&&window.__applyNativeInsets(" + lastInsetsJson + ")", null);
    }
}
`;
fs.writeFileSync(path.join(javaDir, 'MainActivity.java'), activity);
console.log('✔ MainActivity.java');

/* ---- 2) AndroidManifest ---- */
const manifestPath = path.join(mainRes, 'AndroidManifest.xml');
let manifest = fs.readFileSync(manifestPath, 'utf8');
if (!manifest.includes('android:windowSoftInputMode')) manifest = manifest.replace('<activity ', '<activity android:windowSoftInputMode="adjustResize" ');
if (!manifest.includes('android.permission.POST_NOTIFICATIONS')) manifest = manifest.replace('</manifest>', '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n</manifest>');
fs.writeFileSync(manifestPath, manifest);
console.log('✔ AndroidManifest.xml');

/* ---- 3) آیکن‌ها ---- */
const assets = path.join(root, 'android-assets');
const res = path.join(mainRes, 'res');
const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
if (fs.existsSync(assets)) {
  for (const d of Object.keys(densities)) {
    const copy = (from, toDir, to) => {
      const src = path.join(assets, from);
      if (!fs.existsSync(src)) return;
      fs.mkdirSync(path.join(res, toDir), { recursive: true });
      fs.copyFileSync(src, path.join(res, toDir, to));
    };
    copy(`ic_launcher-${d}.png`, `mipmap-${d}`, 'ic_launcher.png');
    copy(`ic_launcher-${d}.png`, `mipmap-${d}`, 'ic_launcher_round.png');
    copy(`lc_icon_foreground-${d}.png`, `mipmap-${d}`, 'lc_icon_foreground.png');
    copy(`ic_stat-${d}.png`, `drawable-${d}`, 'ic_stat_lifecalendar.png');
  }
  const anydpi = path.join(res, 'mipmap-anydpi-v26');
  fs.mkdirSync(anydpi, { recursive: true });
  const adaptive = '<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/lc_icon_background"/>\n    <foreground android:drawable="@mipmap/lc_icon_foreground"/>\n</adaptive-icon>\n';
  fs.writeFileSync(path.join(anydpi, 'ic_launcher.xml'), adaptive);
  fs.writeFileSync(path.join(anydpi, 'ic_launcher_round.xml'), adaptive);
  fs.mkdirSync(path.join(res, 'values'), { recursive: true });
  fs.writeFileSync(path.join(res, 'values', 'lc_colors.xml'), '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="lc_icon_background">#7669D8</color>\n</resources>\n');
  console.log('✔ آیکن‌ها');
} else console.log('⚠ پوشه android-assets پیدا نشد؛ آیکن‌ها تغییر نکردند.');
