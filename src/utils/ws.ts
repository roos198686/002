class WebSocketClient {
    private ws: WebSocket | null = null;
    private userId: number | null = null;
    private url: string = 'ws://localhost:3000'; // 你的后端服务地址
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    // 初始化连接
    connect(userId: number) {
        if (!userId) return;
        this.userId = userId;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('✅ WebSocket 连接成功');
            // 绑定用户ID
            this.send({ type: 'bind_user', userId });
            if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        };

        this.ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.type === 'new_msg') {
                    const realMsg = data.data; // 这行是关键！！

                    window.dispatchEvent(new CustomEvent('new_msg', {
                        detail: realMsg  // 推送正确结构
                    }));
                }
            } catch (err) {
                console.log('消息解析失败', err);
            }
        };

        this.ws.onclose = () => {
            console.log('❌ WebSocket 连接断开，准备重连');
            this.reconnectTimer = setTimeout(() => {
                if (this.userId) this.connect(this.userId);
            }, 3000);
        };

        this.ws.onerror = (err) => {
            console.error('⚠️ WebSocket 错误:', err);
        };
    }

    // 处理后端推送的消息
    private handleMessage(data: any) {
        switch (data.type) {
            case 'new_msg':
                // 自定义事件，让页面可以监听
                window.dispatchEvent(new CustomEvent('ws_new_msg', { detail: data.data }));
                break;
        }
    }

    // 发送消息
    send(data: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    // 关闭连接
    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    }
}

export default new WebSocketClient();