"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocketClient = /** @class */ (function () {
    function WebSocketClient() {
        this.ws = null;
        this.userId = null;
        this.url = 'ws://localhost:3000'; // 你的后端服务地址
        this.reconnectTimer = null;
    }
    // 初始化连接
    WebSocketClient.prototype.connect = function (userId) {
        var _this = this;
        if (!userId)
            return;
        this.userId = userId;
        this.ws = new WebSocket(this.url);
        this.ws.onopen = function () {
            console.log('✅ WebSocket 连接成功');
            // 绑定用户ID
            _this.send({ type: 'bind_user', userId: userId });
            if (_this.reconnectTimer)
                clearTimeout(_this.reconnectTimer);
        };
        this.ws.onmessage = function (e) {
            try {
                var data = JSON.parse(e.data);
                if (data.type === 'new_msg') {
                    var realMsg = data.data; // 这行是关键！！
                    window.dispatchEvent(new CustomEvent('new_msg', {
                        detail: realMsg // 推送正确结构
                    }));
                }
            }
            catch (err) {
                console.log('消息解析失败', err);
            }
        };
        this.ws.onclose = function () {
            console.log('❌ WebSocket 连接断开，准备重连');
            _this.reconnectTimer = setTimeout(function () {
                if (_this.userId)
                    _this.connect(_this.userId);
            }, 3000);
        };
        this.ws.onerror = function (err) {
            console.error('⚠️ WebSocket 错误:', err);
        };
    };
    // 处理后端推送的消息
    WebSocketClient.prototype.handleMessage = function (data) {
        switch (data.type) {
            case 'new_msg':
                // 自定义事件，让页面可以监听
                window.dispatchEvent(new CustomEvent('ws_new_msg', { detail: data.data }));
                break;
        }
    };
    // 发送消息
    WebSocketClient.prototype.send = function (data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    };
    // 关闭连接
    WebSocketClient.prototype.close = function () {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        if (this.reconnectTimer)
            clearTimeout(this.reconnectTimer);
    };
    return WebSocketClient;
}());
exports.default = new WebSocketClient();
