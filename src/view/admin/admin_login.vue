<template>
    <div \x00ATTR0\x00>
        <div \x00ATTR1\x00>
            <div \x00ATTR2\x00>
                <div \x00ATTR3\x00>
                    <div \x00ATTR4\x00>
                        <div \x00ATTR5\x00>用户登录</div>
                    </div>
                    <div \x00ATTR6\x00>
                        <!-- 用户名-->
                        <div>
                            <div \x00ATTR7\x00>用户名</div>
                            <el-input 
                                \x00ATTR8\x00 
                                \x00ATTR9\x00  
                                \x00ATTR10\x00
                                \x00ATTR11\x00
                            />
                        </div>
                        
                        <!-- 密码 -->
                        <div>
                            <div \x00ATTR12\x00>密码</div>
                            <el-input 
                                \x00ATTR13\x00 
                                \x00ATTR14\x00  
                                \x00ATTR15\x00 
                                show-password 
                                \x00ATTR16\x00
                            />
                        </div>
                    </div>
                    
                    <!-- 登录按钮（添加加载状态） -->
                    <div \x00ATTR17\x00 \x00ATTR18\x00 \x00ATTR19\x00>
                        <!-- <el-loading \x00ATTR20\x00 \x00ATTR21\x00 /> -->
                        <span>登录</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive, inject, ref } from "vue";
import { ElMessage, ElLoading } from "element-plus";
import axios from 'axios';
import { goapi } from '../admin/hpps';
import router from "../../router"; // 导入路由（推荐用路由跳转而非window.locationst
import request from '@/utils/request'
// 注入API地址'
// const injectedApi = inject<string>('api'); 
// const api = injectedApi || goapi.value; 
// 加载状态（防止重复点击左侧联'
const isLoading = ref(false);

// 表单数据'
const form = reactive({
    username: '',
    password: ''
});

// 登录逻辑（只改接口：request.post，其余完全不动）'
const loginbutt = async () => {
    if (!form.username.trim()) {
        return ElMessage.warning('请输入用户名');
    }
    if (!form.password.trim()) {
        return ElMessage.warning('请输入密码');
    }
    console.log(form.username,form.password)
    isLoading.value = true;

    try {
        // nc完全按你发的：request.post + /api/login
        const { data: res } = await request.post('/api/login/login', {
            username: form.username,
            password: form.password
        });

        // .tr你发的判断：res.code === 1
        if (res.code === 1) {
            localStorage.setItem('adminuser', JSON.stringify(res.user))
            
            ElMessage.success('登录成功');
            setTimeout(() => {
                router.push('/admin_index');
            }, 800);
        } else {
            ElMessage.warning(res.message || '登录失败');
        }

    } catch (err) {
        ElMessage.error('服务器异常');
    } finally {
        isLoading.value = false;
    }
};

</script>

<style scoped>
.main {
    position: absolute;
    display: flex;
    flex-direction: column;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: #fff;
}

.bot {
    display: flex;
    flex-direction: row;
    flex: 1;
    height: 100%;
    width: 100%;
}

.bot-all {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: -200px;
}

.bot-alltop {
    width: 20%;
    padding: 30px;
}

.bot-alltop-a {
    display: flex;
    flex-direction: row;
}



.bot-alltop-text {
    font-size: 30px;
    color: #000;
    display: flex;
    align-items: end;
    justify-content: end;
    font-weight: bolder;
    margin-bottom: 20px;
}


.bot-alltop-c-name {
    margin: 0px 0 10px 0;
    height: 35px;
    --el-input-text-color: green;
}
.bot-alltop-c-name::placeholder {
    margin: 0px 0 10px 0;
    height: 48px;
    --el-input-text-color: green;
}

.bot-alltop-ctext {
    margin: 5px 0 3px 0;
    font-size: 13px;
    color: #575656;
    text-align: left;
}



::v-deep .el-input__wrapper {
    background-color: rgba(53, 52, 52, 0.089);
    padding-left: 15px;
    margin: 0;
    border-radius: 10px;
    border-width: 1px;
    border-style: solid;
    border-color: #ddd;
    box-shadow: 0 0 0 0;
    
}

::v-deep .el-input__wrapper:hover {
    border-color: #8a8a8a;

}

::v-deep .el-input__inner {
    color: #000 !important;
    font-size: 15px;
}


::v-deep .birthday .el-input__inner {
  background-color: yellow !important; 
  color: red !important;
}



.account {
    font-size: 16px;
    color: #333;
    display: flex;
    flex-direction: row;
    background-color: #ad047b;
    border-radius: 5px;
    /* padding: 6px 0; */
    justify-content: center;
    margin: 20px 0;
    cursor: pointer;
    height: 35px;
    line-height: 35px;
}

.account:hover {
    background-color: #ec8bcf;
    color: #000;
}


@media (max-width: 1200px) {
    .bot {
        height: auto;
    }

    .bot-all {
        width: 100%;
        min-width: auto;
        /* flex: 1; */
    }


    .bot-alltop {
        width: 90%;
    }

    .bot-alltop-text {
        font-size: 20px;
        margin-left: 10px;
    }

    .account {
        font-size: 14px;
    }

}

/* 加载状态样�?*/
.account.loading {
    position: relative;
    pointer-events: none; /* 防止加载时重复点击左侧*/
}
</style>
    