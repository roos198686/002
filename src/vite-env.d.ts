/// <reference types="vite/client" />

declare module '@/utils/*' {
  import type { AxiosInstance } from 'axios';
  const content: AxiosInstance;
  export default content;
}