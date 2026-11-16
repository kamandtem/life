import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifecalendar.app',
  appName: 'تقویم زندگی',
  webDir: 'dist',
  backgroundColor: '#faf9fe',
  android: {
    // فاصله‌های امن را خود MainActivity (scripts/setup-android.mjs) مدیریت می‌کند
    adjustMarginsForEdgeToEdge: 'disable'
  },
  plugins: {
    LocalNotifications: { smallIcon: 'ic_stat_lifecalendar', iconColor: '#7669d8' },
    // برنامه edge-to-edge است: هدر بنفش زیر نوار وضعیت شفاف کشیده می‌شود (آیکن‌های سفید)
    StatusBar: { style: 'DARK', overlaysWebView: true, backgroundColor: '#00000000' }
  }
} as CapacitorConfig;

export default config;
