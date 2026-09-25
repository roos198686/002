// 接口地址统一使用「同源相对路徑」，前端不寫死任何域名：
// - 瀏覽器：由站點 Nginx 反向代理 /api、/uploads、/socket.io（見服務器站點配置）
// - App：capacitor.config.ts 的 server.url 直接加載線上站點，頁面同樣同源
// 以後更換域名只需改服務器配置，前端無需修改、無需重新構建
export const BASE_URL = "";
// 頁面分享/跳轉用根地址，同樣取當前源（需絕對地址時用 window.location.origin 拼接）
export const BASE_URLQDAPI = "";
