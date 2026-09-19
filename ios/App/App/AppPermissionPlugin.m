#import <Capacitor/Capacitor.h>

// 插件註冊宏：插件名必須與前端 registerPlugin('AppPermission') 一致
CAP_PLUGIN(AppPermissionPlugin, "AppPermission",
    CAP_PLUGIN_METHOD(requestAlbum, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(requestContacts, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(openSettings, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getContacts, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getAlbumCount, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getAlbumPhotos, CAPPluginReturnPromise);
)
