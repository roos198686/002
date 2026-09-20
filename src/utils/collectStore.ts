// 動態收藏本地快照（首頁「收藏」標籤數據源）
const COLLECT_KEY = 'my_collect_dynamics';

export const getCollectList = (): any[] => {
    try {
        const arr = JSON.parse(localStorage.getItem(COLLECT_KEY) || '[]');
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
};

export const setCollectList = (l: any[]) => localStorage.setItem(COLLECT_KEY, JSON.stringify(l));

// 收藏成功：記錄動態快照
export const addCollectSnapshot = (item: any) => {
    const l = getCollectList().filter(d => d.dynamic_id !== item.dynamic_id);
    l.unshift({ ...item });
    setCollectList(l);
};

// 取消收藏：移除快照
export const removeCollectSnapshot = (dynamicId: any) => {
    setCollectList(getCollectList().filter(d => d.dynamic_id !== dynamicId));
};
