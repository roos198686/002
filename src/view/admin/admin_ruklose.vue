<template>
    <div class="maina">
        <div class="all">
            <!-- 搜索好友：-->
            <div class="search-box">
                <span class="search-label">输入用户名：</span>
                <input v-model="searchUsername" placeholder="请输入用户名搜索" clearable @input="handleSearch"  class="input"/>
            </div>

            <!-- 列表 滚动容器 -->
            <div ref="scrollWrap" class="list-wrap" @scroll="handleScroll">
                <div v-for="item in list" :key="item.dynamic_id" class="item">
                    <div style="display: flex;flex-direction: row;text-align: left;align-items:flex-start;font-size: 14px;">
                        <div class="user-info">
                            <img :src="baseURL + item.avatar" class="avatar" />
                        </div>
                        <div style="display: flex;flex-direction: column;padding-left: 10px;">
                            <div style="font-size: 18px;font-weight: 800;margin-top: -5px;">{{ item.nickname }}</div>
                            <div style="color:#666;font-size: 12px;margin-bottom: 5px;margin-top: -5px;">@{{ item.username }}</div>
                            <div class="imgs">
                                <img :src="baseURL + item.image_url.split(',')[0]" class="img" />
                            </div>
                            <div style="white-space: nowrap;padding-top: 5px;color:#666;font-size: 11px;">
                                阅读:{{ item.view_num }} 点赞:{{ item.like_num }} 收藏：{{ item.collect_num }}
                            </div>
                            <div style="white-space: nowrap;padding-bottom: 5px;color:#666;font-size: 12px;">
                                {{ moment(item.created_at).format('YYYY/MM/DD HH:mm:ss') }}
                            </div>
                            <div style="display: flex;margin-bottom: 10px;">
                                <div class="timedelel" :style="userinfo.status != 3 ? '' : 'pointer-events: none;background-color: #555;'" @click="openEditDate(item)">修改数据</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="noMore" class="tip">没有更多了</div>
            </div>
        </div>

        <!-- 修改弹窗：日期时间+ 阅读/点赞/收藏 -->
        <el-dialog v-model="showDateDialog" title="修改数据" width="500px">
            <div style="margin-bottom: 15px;">
                <label style="display: inline-block;width: 80px;">发布时间：</label>
                <el-date-picker v-model="editTime" type="datetime" placeholder="选择日期时间" style="width: calc(100% - 85px)"
                    :editable="false" />
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: inline-block;width: 80px;">阅读量：</label>
                <el-input v-model.number="editViewNum" type="number" placeholder="请输入阅读量" style="width: calc(100% - 85px)" />
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: inline-block;width: 80px;">点赞数：</label>
                <el-input v-model.number="editLikeNum" type="number" placeholder="请输入点赞数" style="width: calc(100% - 85px)" />
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: inline-block;width: 80px;">收藏数：</label>
                <el-input v-model.number="editCollectNum" type="number" placeholder="请输入收藏数" style="width: calc(100% - 85px)" />
            </div>

            <template #footer>
                <el-button @click="showDateDialog = false">取消</el-button>
                <el-button type="primary" @click="saveEditTime">确认保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue'
import { ElInput, ElDialog, ElDatePicker, ElMessage } from 'element-plus'
import request from '@/utils/request'
import moment from 'moment';
import router from '@/router';
const baseURL = request.defaults.baseURL || '';
const searchUsername = ref('')
const list = ref<any[]>([])
const loading = ref(false)

// 滚动加载分页'
const scrollWrap = ref<HTMLDivElement | null>(null)
const page = ref(1)
const pageSize = 10
const noMore = ref(false)

// 修改数据相关'
const showDateDialog = ref(false)
const currentDynamicId = ref<number | null>(null)
const editTime = ref('')
const editViewNum = ref(0)
const editLikeNum = ref(0)
const editCollectNum = ref(0)

// 打开弹窗，回显原有数据ID
const openEditDate = (row: any) => {
    currentDynamicId.value = row.dynamic_id
    editTime.value = moment(row.created_at).format('YYYY-MM-DD HH:mm:ss')
    editViewNum.value = Number(row.view_num) || 0
    editLikeNum.value = Number(row.like_num) || 0
    editCollectNum.value = Number(row.collect_num) || 0
    showDateDialog.value = true
}

// 保存修改'
const saveEditTime = async () => {
    if (!currentDynamicId.value) {
        ElMessage.warning('数据ID异常')
        return
    }
    if (!moment(editTime.value).isValid()) {
        ElMessage.error('时间格式不正确')
        return
    }
    // 校验数字非负'
    if (editViewNum.value < 0 || editLikeNum.value < 0 || editCollectNum.value < 0) {
        ElMessage.error('数字不能为负数')
        return
    }

    try {
        const submitTime = moment(editTime.value).format('YYYY-MM-DD HH:mm:ss')

        await request.post('/api/admin/ruklose/updateImageTime', {
            dynamic_id: currentDynamicId.value,
            created_at: submitTime,
            view_num: editViewNum.value,
            like_num: editLikeNum.value,
            collect_num: editCollectNum.value
        })

        ElMessage.success('修改成功')
        showDateDialog.value = false
        resetPage()
        getList()
    } catch (err) {
        ElMessage.error('修改失败')
    }
}

// 重置分页'
const resetPage = () => {
    page.value = 1
    list.value = []
    noMore.value = false
}
const userInfo = reactive(JSON.parse(localStorage.getItem("adminuser") || "{}"));
// 获取列表"
const getList = async () => {
    if (loading.value || noMore.value) return
    loading.value = true
    
    const remark = userInfo.group_level

    try {
        const res = await request.post('/api/admin/ruklose/userimages', {
            username: searchUsername.value,
            page: page.value,
            limit: pageSize,
            remark: remark
        })

        const data = res.data.data || []
        if (data.length < pageSize) {
            noMore.value = true
        }
        list.value = [...list.value, ...data]
        page.value++
    } finally {
        loading.value = false
    }
}

// 滚动触底加载'
const handleScroll = () => {
    if (!scrollWrap.value) return
    const { scrollTop, scrollHeight, clientHeight } = scrollWrap.value
    if (scrollHeight - scrollTop - clientHeight < 80) {
        getList()
    }
}

// 搜索'
const handleSearch = async () => {
    resetPage()
    if (!searchUsername.value) return
    await getList()
}

onMounted(() => {
    const adminStr = localStorage.getItem('adminuser');
    if (!adminStr) {
        router.replace('/admin_login');
        return
    }
    getList()
});
</script>

<style scoped>
.maina {
  padding: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
}
.search-box :deep(.el-input) {
  width: 260px;
}
.search-label {
  white-space: nowrap;
  font-size: 13px;
}

.list-wrap {
  border-radius: 6px;
  margin-top: 15px;
  overflow-y: auto;
  max-height: 70vh;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
  align-items: stretch;
}

.item {
  box-sizing: border-box;
  padding: 15px 15px 5px 15px;
  border: 1px solid #d8d6d6;
  border-radius: 5px;
  overflow: hidden;
  height: 260px;
}

.tip {
  grid-column: 1 / -1;
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #969696;
}
.content {
  margin-bottom: 5px;
  color: #3a3a3a;
}
.imgs {
  display: flex;
  flex-wrap: wrap;
}
.img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
}
.timedelel {
  background-color: #00962d;
  color: #333;
  font-size: 13px;
  padding: 3px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.list-wrap::-webkit-scrollbar {
  display: none;
}

:global(.input) {
  border: 1px solid #ccc;
  padding: 5px;
  border-radius: 4px;
  outline: none;
}

:global(.input:focus) {
  border: 1px solid #ccc;
  /* 强制提权，覆盖全局样式 */
  /* border-color: #ff33ee !important; */
}
</style>