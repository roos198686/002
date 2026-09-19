import { defineStore } from 'pinia'

// 动态单项结构
export interface DynamicItem {
  dynamic_id: string | number
  isLike: boolean
  like_num: number
  isCollect: boolean
  collect_num: number
  comment_num: number
  view_num: number
  // 其他原有字段按需保留
  avatar?: string
  nickname?: string
  username?: string
  content?: string
  images?: string[]
  video_url?: string
  vip_level?: string
  created_at?: string
  user_id?: string | number
}

interface DynamicState {
  // 全局所有动态池（核心：三页面共享数据源）
  allDynamicMap: Record<string | number, DynamicItem>
}

export const useDynamicStore = defineStore('dynamic', {
  state: (): DynamicState => ({
    allDynamicMap: {}
  }),

  actions: {
    /**
     * 批量写入动态到全局池（初始化列表/个人页数据）
     * @param list 动态数组
     */
    setDynamicList(list: DynamicItem[]) {
      list.forEach(item => {
        this.allDynamicMap[item.dynamic_id] = {
          ...this.allDynamicMap[item.dynamic_id], // 保留已有状态
          ...item
        }
      })
    },

    /**
     * 根据 dynamic_id 获取单条动态
     */
    getDynamicById(id: string | number): DynamicItem | null {
      return this.allDynamicMap[id] || null
    },

    /**
     * 点赞/取消点赞 全局更新
     * @param dynamicId 动态ID
     * @param isLike 最新状态
     * @param likeNum 最新数量
     */
    updateLike(dynamicId: string | number, isLike: boolean, likeNum: number) {
      const item = this.allDynamicMap[dynamicId]
      if (item) {
        item.isLike = isLike
        item.like_num = likeNum
      }
    },

    /**
     * 收藏/取消收藏 全局更新
     */
    updateCollect(dynamicId: string | number, isCollect: boolean, collectNum: number) {
      const item = this.allDynamicMap[dynamicId]
      if (item) {
        item.isCollect = isCollect
        item.collect_num = collectNum
      }
    },

    /**
     * 评论数 +1（发表评论后全局同步）
     */
    incCommentNum(dynamicId: string | number) {
      const item = this.allDynamicMap[dynamicId]
      if (item) {
        item.comment_num = (item.comment_num || 0) + 1
      }
    },

    /**
     * 浏览量更新（按需调用）
     */
    updateViewNum(dynamicId: string | number, viewNum: number) {
      const item = this.allDynamicMap[dynamicId]
      if (item) {
        item.view_num = viewNum
      }
    },

    /**
     * 清空（页面卸载/切换账号）
     */
    clear() {
      this.allDynamicMap = {}
    }
  }
})