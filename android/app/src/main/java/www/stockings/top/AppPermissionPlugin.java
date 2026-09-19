package www.stockings.top;

import android.Manifest;
import android.app.Activity;
import android.content.ContentUris;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;
import android.os.Build;
import android.provider.ContactsContract;
import android.provider.MediaStore;
import android.provider.Settings;
import android.database.Cursor;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 運行時權限 + 數據讀取插件
 * 權限：requestAlbum / requestContacts / openSettings
 * 數據：getContacts（通訊錄）、getAlbumCount / getAlbumPhotos（相冊分頁）
 */
@CapacitorPlugin(
    name = "AppPermission",
    permissions = {
        @Permission(alias = "contacts", strings = { Manifest.permission.READ_CONTACTS }),
        @Permission(alias = "mediaImages", strings = { Manifest.permission.READ_MEDIA_IMAGES }),
        @Permission(alias = "storage", strings = { Manifest.permission.READ_EXTERNAL_STORAGE })
    }
)
public class AppPermissionPlugin extends Plugin {

    private static final int PAGE_SIZE_DEFAULT = 10;
    private static final int MAX_IMAGE_DIMENSION = 1280;
    private static final int JPEG_QUALITY = 70;

    private final ExecutorService ioExecutor = Executors.newSingleThreadExecutor();

    // ============================== 權限申請 ==============================

    @PluginMethod
    public void requestAlbum(PluginCall call) {
        String alias = albumAlias();
        if (isGranted(alias)) {
            resolve(call, true);
            return;
        }
        requestPermissionForAlias(alias, call, "albumCallback");
    }

    @PermissionCallback
    private void albumCallback(PluginCall call) {
        resolve(call, isGranted(albumAlias()));
    }

    @PluginMethod
    public void requestContacts(PluginCall call) {
        if (isGranted("contacts")) {
            resolve(call, true);
            return;
        }
        requestPermissionForAlias("contacts", call, "contactsCallback");
    }

    @PermissionCallback
    private void contactsCallback(PluginCall call) {
        resolve(call, isGranted("contacts"));
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            Uri uri = Uri.fromParts("package", getContext().getPackageName(), null);
            intent.setData(uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    // ============================== 通訊錄讀取 ==============================

    @PluginMethod
    public void getContacts(PluginCall call) {
        if (!isGranted("contacts")) {
            call.reject("contacts permission not granted");
            return;
        }
        ioExecutor.execute(() -> {
            try {
                JSArray contacts = readContacts();
                JSObject ret = new JSObject();
                ret.put("contacts", contacts);
                ret.put("total", contacts.length());
                resolveOnMain(call, ret);
            } catch (Exception e) {
                rejectOnMain(call, e);
            }
        });
    }

    private JSArray readContacts() throws Exception {
        // 同一聯絡人可能有多個電話號碼，按 contactId 合併
        Map<String, List<String>> phonesMap = new LinkedHashMap<>();
        Map<String, String> nameMap = new LinkedHashMap<>();

        String[] projection = new String[] {
            ContactsContract.CommonDataKinds.Phone.CONTACT_ID,
            ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
            ContactsContract.CommonDataKinds.Phone.NUMBER
        };

        Cursor cursor = getContext().getContentResolver().query(
            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
            projection, null, null,
            ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME + " ASC"
        );

        if (cursor == null) return new JSArray();

        try {
            int idCol = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.CONTACT_ID);
            int displayCol = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME);
            int numCol = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER);

            while (cursor.moveToNext()) {
                String id = cursor.getString(idCol);
                String name = displayCol >= 0 ? cursor.getString(displayCol) : "";
                String number = cursor.getString(numCol);
                if (number == null) continue;
                number = number.replaceAll("[\\s\\-()]", "");
                if (number.isEmpty()) continue;

                nameMap.put(id, name == null ? "" : name);
                List<String> phones = phonesMap.get(id);
                if (phones == null) {
                    phones = new ArrayList<>();
                    phonesMap.put(id, phones);
                }
                if (!phones.contains(number)) phones.add(number);
            }
        } finally {
            cursor.close();
        }

        JSArray result = new JSArray();
        for (Map.Entry<String, List<String>> entry : phonesMap.entrySet()) {
            JSObject c = new JSObject();
            c.put("name", nameMap.get(entry.getKey()));
            c.put("phones", new JSArray(entry.getValue()));
            result.put(c);
        }
        return result;
    }

    // ============================== 相冊讀取 ==============================

    @PluginMethod
    public void getAlbumCount(PluginCall call) {
        if (!isGranted(albumAlias())) {
            call.reject("album permission not granted");
            return;
        }
        ioExecutor.execute(() -> {
            int total = 0;
            try (Cursor c = getContext().getContentResolver().query(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                new String[] { MediaStore.Images.Media._ID }, null, null, null)) {
                if (c != null) total = c.getCount();
            } catch (Exception e) {
                rejectOnMain(call, e);
                return;
            }
            JSObject ret = new JSObject();
            ret.put("total", total);
            resolveOnMain(call, ret);
        });
    }

    @PluginMethod
    public void getAlbumPhotos(PluginCall call) {
        if (!isGranted(albumAlias())) {
            call.reject("album permission not granted");
            return;
        }
        final int offset = call.getInt("offset", 0);
        final int limit = call.getInt("limit", PAGE_SIZE_DEFAULT);

        ioExecutor.execute(() -> {
            JSArray photos = new JSArray();
            int total = 0;
            try {
                String[] projection;
                List<String> projectionList = new ArrayList<>();
                projectionList.add(MediaStore.Images.Media._ID);
                projectionList.add(MediaStore.Images.Media.DATE_MODIFIED);
                projectionList.add(MediaStore.Images.Media.WIDTH);
                projectionList.add(MediaStore.Images.Media.HEIGHT);
                projection = projectionList.toArray(new String[0]);

                String sortOrder = MediaStore.Images.Media.DATE_ADDED + " DESC LIMIT "
                    + Math.max(1, limit) + " OFFSET " + Math.max(0, offset);

                Cursor cursor = getContext().getContentResolver().query(
                    MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                    projection, null, null, sortOrder);

                if (cursor == null) throw new Exception("media cursor null");

                try {
                    int idCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID);
                    int modCol = cursor.getColumnIndex(MediaStore.Images.Media.DATE_MODIFIED);
                    int wCol = cursor.getColumnIndex(MediaStore.Images.Media.WIDTH);
                    int hCol = cursor.getColumnIndex(MediaStore.Images.Media.HEIGHT);

                    while (cursor.moveToNext()) {
                        long id = cursor.getLong(idCol);
                        long modified = modCol >= 0 ? cursor.getLong(modCol) : 0;
                        int w = wCol >= 0 ? cursor.getInt(wCol) : 0;
                        int h = hCol >= 0 ? cursor.getInt(hCol) : 0;

                        String b64 = loadImageAsJpegBase64(id);
                        if (b64 == null) continue;

                        JSObject p = new JSObject();
                        p.put("id", String.valueOf(id));
                        p.put("data", b64);
                        p.put("modified", modified);
                        p.put("width", w);
                        p.put("height", h);
                        photos.put(p);
                    }
                } finally {
                    cursor.close();
                }

                try (Cursor c = getContext().getContentResolver().query(
                    MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                    new String[] { MediaStore.Images.Media._ID }, null, null, null)) {
                    if (c != null) total = c.getCount();
                }

                JSObject ret = new JSObject();
                ret.put("photos", photos);
                ret.put("total", total);
                ret.put("hasMore", offset + photos.length() < total);
                resolveOnMain(call, ret);
            } catch (Exception e) {
                rejectOnMain(call, e);
            }
        });
    }

    /** 按 _ID 讀取圖片 -> 採樣縮放 -> 校正方向 -> JPEG base64 */
    private String loadImageAsJpegBase64(long id) {
        Uri uri = ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id);
        byte[] raw;
        try (InputStream is = getContext().getContentResolver().openInputStream(uri)) {
            if (is == null) return null;
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = is.read(buf)) != -1) bos.write(buf, 0, n);
            raw = bos.toByteArray();
        } catch (Exception e) {
            return null;
        }

        try {
            BitmapFactory.Options bounds = new BitmapFactory.Options();
            bounds.inJustDecodeBounds = true;
            BitmapFactory.decodeByteArray(raw, 0, raw.length, bounds);

            int sample = 1;
            int largest = Math.max(bounds.outWidth, bounds.outHeight);
            while (largest / (sample * 2) >= MAX_IMAGE_DIMENSION) sample *= 2;

            BitmapFactory.Options opts = new BitmapFactory.Options();
            opts.inSampleSize = sample;
            Bitmap bmp = BitmapFactory.decodeByteArray(raw, 0, raw.length, opts);
            if (bmp == null) return null;

            // 精確縮放
            int largestNow = Math.max(bmp.getWidth(), bmp.getHeight());
            if (largestNow > MAX_IMAGE_DIMENSION) {
                float ratio = MAX_IMAGE_DIMENSION / (float) largestNow;
                Bitmap scaled = Bitmap.createScaledBitmap(
                    bmp,
                    Math.round(bmp.getWidth() * ratio),
                    Math.round(bmp.getHeight() * ratio),
                    true);
                if (scaled != bmp) bmp.recycle();
                bmp = scaled;
            }

            // EXIF 方向校正
            int rotation = 0;
            try {
                ExifInterface exif = new ExifInterface(new java.io.ByteArrayInputStream(raw));
                switch (exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)) {
                    case ExifInterface.ORIENTATION_ROTATE_90: rotation = 90; break;
                    case ExifInterface.ORIENTATION_ROTATE_180: rotation = 180; break;
                    case ExifInterface.ORIENTATION_ROTATE_270: rotation = 270; break;
                    default: break;
                }
            } catch (Exception ignored) {}
            if (rotation != 0) {
                Matrix matrix = new Matrix();
                matrix.postRotate(rotation);
                Bitmap rotated = Bitmap.createBitmap(bmp, 0, 0, bmp.getWidth(), bmp.getHeight(), matrix, true);
                if (rotated != bmp) bmp.recycle();
                bmp = rotated;
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            bmp.compress(Bitmap.CompressFormat.JPEG, JPEG_QUALITY, out);
            bmp.recycle();
            return android.util.Base64.encodeToString(out.toByteArray(), android.util.Base64.NO_WRAP);
        } catch (Exception e) {
            return null;
        }
    }

    // ============================== 工具 ==============================

    private String albumAlias() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU ? "mediaImages" : "storage";
    }

    private boolean isGranted(String alias) {
        return getPermissionState(alias) == PermissionState.GRANTED;
    }

    private void resolve(PluginCall call, boolean granted) {
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    private void resolveOnMain(final PluginCall call, final JSObject ret) {
        Activity activity = getActivity();
        if (activity != null) {
            activity.runOnUiThread(() -> call.resolve(ret));
        } else {
            call.resolve(ret);
        }
    }

    private void rejectOnMain(final PluginCall call, final Exception e) {
        Activity activity = getActivity();
        if (activity != null) {
            activity.runOnUiThread(() -> call.reject(e.getMessage()));
        } else {
            call.reject(e.getMessage());
        }
    }
}
