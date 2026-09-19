/**
 * cap sync ios 後處理：
 * 把手工內建於 Xcode 工程的自定義插件注入 capacitor.config.json 的
 * packageClassList 白名單（Capacitor 8 只註冊白名單中的插件）。
 *
 * 用法：npx cap sync ios && node scripts/inject-ios-plugin.cjs
 */
const fs = require('fs')
const path = require('path')

const TARGET = path.join(__dirname, '..', 'ios', 'App', 'App', 'capacitor.config.json')
const PLUGIN_CLASS = 'AppPermissionPlugin'

if (!fs.existsSync(TARGET)) {
  console.error(`[inject-ios-plugin] 找不到 ${TARGET}，請先執行 npx cap sync ios`)
  process.exit(1)
}

const cfg = JSON.parse(fs.readFileSync(TARGET, 'utf8'))
const list = Array.isArray(cfg.packageClassList) ? cfg.packageClassList : []

if (!list.includes(PLUGIN_CLASS)) {
  list.push(PLUGIN_CLASS)
  cfg.packageClassList = list
  fs.writeFileSync(TARGET, JSON.stringify(cfg, null, 2) + '\n', 'utf8')
  console.log(`[inject-ios-plugin] 已注入 ${PLUGIN_CLASS} -> packageClassList`)
} else {
  console.log(`[inject-ios-plugin] ${PLUGIN_CLASS} 已存在，無需處理`)
}
