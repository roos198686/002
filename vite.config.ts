import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path';

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
        target: 'http://localhost:3000',  // 这里必须是 localhost！
        changeOrigin: true,
        secure: false
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