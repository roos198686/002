import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'www.stockings.top',
  appName: 'SKS',
  webDir: 'dist',
  // iOS 左邊緣右滑返回改由 App.vue 內建 JS 手勢處理，
  // 關閉原生手勢避免 SPA 下重複返回
  ios: {
    allowsBackForwardNavigationGestures: false,
  },
};

export default config;
