/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 解决 JS 文件隐式 any 报错
declare module '*.js' {
  const value: any
  export default value
}