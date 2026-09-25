import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'www.stockings.top',
  appName: 'SKS',
  webDir: 'dist',
  // App 直接加載線上站點：頁面/接口/圖片/WebSocket 全部同源，
  // 前端代碼無需內置任何域名。日後換域名時，舊域名在服務器做 301 跳轉到新域名，
  // App 會自動跟隨，無需重新打包（更換新包時才需改此處）
  server: {
    url: 'https://takeout.appsldodspptg.top',
    cleartext: false,
  },
  // iOS 左邊緣右滑返回改由 App.vue 內建 JS 手勢處理，
  // 關閉原生手勢避免 SPA 下重複返回
  ios: {
    allowsBackForwardNavigationGestures: false,
  },
};

export default config;
