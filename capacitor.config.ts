import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'www.stockings.top',
  appName: 'SKS',
  webDir: 'dist',
  // iOS 開啟左邊緣右滑返回上一頁
  ios: {
    allowsBackForwardNavigationGestures: true,
  },
};

export default config;
