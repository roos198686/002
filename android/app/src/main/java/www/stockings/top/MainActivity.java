package www.stockings.top;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // 注册自定义运行时权限插件（相册/通讯录），必须在 super.onCreate 之前
        registerPlugin(AppPermissionPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
