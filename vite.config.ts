import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path';

// 代理錯誤兜底：客戶端刷新/切頁導致的中斷屬正常現象，吞掉避免刷屏
const IGNORE_CODES = ['ECONNABORTED', 'ECONNRESET', 'EPIPE', 'ERR_STREAM_PREMATURE_CLOSE'];
const onProxyError = (proxy: any) => {
  proxy.on('error', (err: any & { code?: string }, _req: any, res: any) => {
    if (err && err.code && IGNORE_CODES.includes(err.code)) return;
    console.error('[proxy error]', err && err.message);
    try {
      if (res && !res.headersSent && typeof res.writeHead === 'function') {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 0, msg: '後端服務不可用' }));
      } else if (res && typeof res.destroy === 'function') {
        res.destroy();
      }
    } catch { /* ignore */ }
  });
};

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    }
  },
  server: {
    host: '0.0.0.0',  // 允许手机访问前端
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',  // 本机 Node 后端
        changeOrigin: true,
        secure: false,
        configure: onProxyError
      },
      '/uploads': {
        target: 'http://127.0.0.1:3000',  // 后端静态图片/文件
        changeOrigin: true,
        secure: false,
        configure: onProxyError
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3000',  // socket.io（含 websocket 升级）
        changeOrigin: true,
        ws: true,
        secure: false,
        configure: onProxyError
      }
    }
  }
})
//APP端=====================================================
// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
// import path from 'node:path';

// export default defineConfig({
//   plugins: [vue()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "src"),
//     }
//   },
//   // 核心：打包使用相对路径，解决App内资源404/白屏
//   base: './',
//   server: {
//     host: '0.0.0.0',  // 局域网手机可访问开发服务
//     port: 5173,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:3000',
//         changeOrigin: true,
//         secure: false
//       }
//     }
//   },
//   build: {
//     // 打包产物输出到外层 SWapp 根目录
//     outDir: './dist',
//     // 不清空外层目录（保护 manifest.json、unpackage 文件夹）
//     emptyOutDir: true,
//     sourcemap: true // 关闭源码映射，减小包体积
//   }
// })