import Foundation
import Capacitor
import Photos
import Contacts
import UIKit

/**
 * 運行時權限 + 數據讀取插件（iOS）
 * 與安卓端 AppPermissionPlugin 保持相同的插件名、方法名與返回結構：
 * - requestAlbum / requestContacts / openSettings
 * - getContacts：{ contacts: [{name, phones:[...]}], total }
 * - getAlbumCount：{ total }
 * - getAlbumPhotos({offset, limit})：{ photos:[{id,data,modified,width,height}], total, hasMore }
 */
@objc(AppPermissionPlugin)
public class AppPermissionPlugin: CAPPlugin {

    private let maxImageDimension: CGFloat = 1280
    private let jpegQuality: CGFloat = 0.7

    // MARK: - 權限申請

    /// 請求相冊權限。iOS 14+ 的 .limited（僅限部分照片）視為已授權
    @objc public func requestAlbum(_ call: CAPPluginCall) {
        let status: PHAuthorizationStatus
        if #available(iOS 14, *) {
            status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
        } else {
            status = PHPhotoLibrary.authorizationStatus()
        }

        switch status {
        case .authorized, .limited:
            call.resolve(["granted": true])
        case .denied, .restricted:
            call.resolve(["granted": false])
        case .notDetermined:
            if #available(iOS 14, *) {
                PHPhotoLibrary.requestAuthorization(for: .readWrite) { newStatus in
                    DispatchQueue.main.async {
                        call.resolve(["granted": newStatus == .authorized || newStatus == .limited])
                    }
                }
            } else {
                PHPhotoLibrary.requestAuthorization { newStatus in
                    DispatchQueue.main.async {
                        call.resolve(["granted": newStatus == .authorized])
                    }
                }
            }
        @unknown default:
            call.resolve(["granted": false])
        }
    }

    /// 請求通訊錄權限
    @objc public func requestContacts(_ call: CAPPluginCall) {
        let status = CNContactStore.authorizationStatus(for: .contacts)

        switch status {
        case .authorized:
            call.resolve(["granted": true])
        case .denied, .restricted:
            call.resolve(["granted": false])
        case .notDetermined:
            CNContactStore().requestAccess(for: .contacts) { granted, _ in
                DispatchQueue.main.async {
                    call.resolve(["granted": granted])
                }
            }
        @unknown default:
            call.resolve(["granted": false])
        }
    }

    /// 跳轉到系統設定頁（用戶永久拒絕後引導開啟）
    @objc public func openSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let url = URL(string: UIApplication.openSettingsURLString) else {
                call.reject("cannot open settings")
                return
            }
            UIApplication.shared.open(url) { success in
                if success { call.resolve() } else { call.reject("cannot open settings") }
            }
        }
    }

    // MARK: - 通訊錄讀取

    @objc public func getContacts(_ call: CAPPluginCall) {
        guard CNContactStore.authorizationStatus(for: .contacts) == .authorized else {
            call.reject("contacts permission not granted")
            return
        }

        DispatchQueue.global(qos: .userInitiated).async {
            let store = CNContactStore()
            let keys: [CNKeyDescriptor] = [
                CNContactGivenNameKey as CNKeyDescriptor,
                CNContactFamilyNameKey as CNKeyDescriptor,
                CNContactOrganizationNameKey as CNKeyDescriptor,
                CNContactPhoneNumbersKey as CNKeyDescriptor
            ]
            let request = CNContactFetchRequest(keysToFetch: keys)
            request.sortOrder = .familyName

            var result: [[String: Any]] = []
            do {
                try store.enumerateContacts(with: request) { contact, _ in
                    var name = [contact.familyName, contact.givenName]
                        .filter { !$0.isEmpty }
                        .joined(separator: "")
                    if name.isEmpty { name = contact.organizationName }

                    let phones = contact.phoneNumbers.map { $0.value.stringValue }
                    guard !name.isEmpty || !phones.isEmpty else { return }
                    result.append([
                        "name": name,
                        "phones": phones
                    ])
                }
            } catch {
                DispatchQueue.main.async { call.reject(error.localizedDescription) }
                return
            }

            DispatchQueue.main.async {
                call.resolve(["contacts": result, "total": result.count])
            }
        }
    }

    // MARK: - 相冊讀取

    @objc public func getAlbumCount(_ call: CAPPluginCall) {
        let status: PHAuthorizationStatus
        if #available(iOS 14, *) {
            status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
        } else {
            status = PHPhotoLibrary.authorizationStatus()
        }
        guard status == .authorized || status == .limited else {
            call.reject("album permission not granted")
            return
        }

        DispatchQueue.global(qos: .userInitiated).async {
            let options = PHFetchOptions()
            let count = PHAsset.fetchAssets(with: .image, options: options).count
            DispatchQueue.main.async {
                call.resolve(["total": count])
            }
        }
    }

    @objc public func getAlbumPhotos(_ call: CAPPluginCall) {
        let status: PHAuthorizationStatus
        if #available(iOS 14, *) {
            status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
        } else {
            status = PHPhotoLibrary.authorizationStatus()
        }
        guard status == .authorized || status == .limited else {
            call.reject("album permission not granted")
            return
        }

        let offset = call.getInt("offset") ?? 0
        let limit = max(1, call.getInt("limit") ?? 10)

        DispatchQueue.global(qos: .userInitiated).async {
            let options = PHFetchOptions()
            options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
            let fetchResult = PHAsset.fetchAssets(with: .image, options: options)
            let total = fetchResult.count

            let start = min(max(0, offset), total)
            let end = min(start + limit, total)
            var assets: [PHAsset] = []
            if start < end {
                let indexes = IndexSet(integersIn: start..<end)
                fetchResult.enumerateObjects(at: indexes, options: []) { asset, _, _ in
                    assets.append(asset)
                }
            }

            self.loadPhotoData(assets: assets) { photos in
                call.resolve([
                    "photos": photos,
                    "total": total,
                    "hasMore": end < total
                ])
            }
        }
    }

    /// 逐張讀取圖片數據 -> 縮放 -> JPEG base64
    private func loadPhotoData(assets: [PHAsset], completion: @escaping ([[String: Any]]) -> Void) {
        let imageManager = PHImageManager.default()
        let requestOptions = PHImageRequestOptions()
        requestOptions.isNetworkAccessAllowed = true
        requestOptions.version = .current
        requestOptions.deliveryMode = .highQualityFormat
        requestOptions.resizeMode = .none

        var output: [[String: Any]] = []
        let group = DispatchGroup()
        let lock = NSLock()

        for asset in assets {
            group.enter()
            imageManager.requestImageDataAndOrientation(for: asset, options: requestOptions) { [weak self] data, _, _, _ in
                defer { group.leave() }
                guard let self = self, let data = data, let image = UIImage(data: data) else { return }

                guard let jpeg = self.resize(image: image, maxDimension: self.maxImageDimension)
                    .jpegData(compressionQuality: self.jpegQuality) else { return }

                let safeId = asset.localIdentifier
                    .components(separatedBy: CharacterSet.alphanumerics.inverted)
                    .joined(separator: "_")
                let modified = Int((asset.modificationDate ?? asset.creationDate ?? Date()).timeIntervalSince1970)

                let item: [String: Any] = [
                    "id": safeId,
                    "data": jpeg.base64EncodedString(),
                    "modified": modified,
                    "width": asset.pixelWidth,
                    "height": asset.pixelHeight
                ]
                lock.lock()
                output.append(item)
                lock.unlock()
            }
        }

        group.notify(queue: .main) {
            completion(output)
        }
    }

    private func resize(image: UIImage, maxDimension: CGFloat) -> UIImage {
        let largest = max(image.size.width, image.size.height)
        guard largest > maxDimension else { return image }
        let scale = maxDimension / largest
        let newSize = CGSize(width: image.size.width * scale, height: image.size.height * scale)

        let renderer = UIGraphicsImageRenderer(size: newSize)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: newSize))
        }
    }
}
