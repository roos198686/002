import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
// 引入超时校验、登出方法
// import { isLoginTimeout, logoutAndRedirect } from '../utils/authTimeout'

const router = createRouter({
    history: createWebHistory(),//h5
    // history: createWebHashHistory(),//app
    routes: [
        //user
        { path: "/user_vip", component: () => import('../view/index/user/user_vip.vue') },
        { path: "/user_withdraw", component: () => import('../view/index/user/user_withdraw.vue') },
        { path: "/cardlist", component: () => import('../view/index/user/cardlist.vue') },
        { path: "/addcard", component: () => import('../view/index/user/addcard.vue') },
        { path: "/user_resetpass", component: () => import('../view/index/user/user_resetpass.vue') },
        { path: "/user_resrtpaypass", component: () => import('../view/index/user/user_resrtpaypass.vue') },
        { path: "/user_recharge", component: () => import('../view/index/user/user_recharge.vue') },
        { path: "/rpaymentconfirm", component: () => import('../view/index/user/rpaymentconfirm.vue') },
        { path: "/userinfo", component: () => import('../view/index/user/userinfo.vue') },
        { path: "/datingorders", component: () => import('../view/index/user/user_datingorders.vue') },
        { path: "/applyin", component: () => import('../view/index/user/ApplyIn.vue') },
        { path: "/innotice", component: () => import('../view/index/user/InNotice.vue') },

        //contacts
        { path: "/message/:id", component: () => import('../view/index/contacts/message.vue') },

        //shop
        { path: "/collect", component: () => import('../view/index/shop/collect.vue') },
        { path: "/orders", component: () => import('../view/index/shop/orders.vue') },
        { path: "/cart", component: () => import('../view/index/shop/cart.vue') },
        { path: "/address", component: () => import('../view/index/shop/address.vue') },
        { path: "/goods-detail", component: () => import('../view/index/shop/goods-detail.vue') },
        { path: "/myshop", component: () => import('../view/index/shop/myshop.vue') },
        { path: "/shop_goodsadd", component: () => import('../view/index/shop/shop_goodsadd.vue') },
        { path: "/shopsearch", component: () => import('../view/index/shop/SearchPage.vue') },
        { path: "/logistics", component: () => import('../view/index/shop/logistics.vue') },
        { path: "/orderLogistics", component: () => import('../view/index/shop/orderLogistics.vue') },

        //home
        { path: "/dynamicIndex", component: () => import('../view/index/home/dynamicIndex.vue') },
        { path: "/artist", component: () => import('../view/index/home/artist.vue') },
        { path: "/dynamicPublish", component: () => import('../view/index/home/dynamicPublish.vue') },
        { path: "/search", component: () => import('../view/index/home/SearchPage.vue') },

        //login
        { path: "/login", component: () => import('../view/index/login.vue') },
        { path: "/register", component: () => import('../view/index/register.vue') },
        {
            path: "/home", component: () => import('../view/index/home/home.vue'),
            children: [
                { path: "/", component: () => import('../view/index/home/index.vue') },
                {
                    path: "/index",
                    name: 'DynamicList',
                    component: () => import('../view/index/home/index.vue'),
                    meta: {
                        keepAlive: true
                    }
                },
                { path: "/user", component: () => import('../view/index/user/user.vue') },
                { path: "/shop", component: () => import('../view/index/shop/shop.vue') },
                { path: "/contacts", component: () => import('../view/index/contacts/contacts.vue') },
            ]
        },
        // 后台
        {
            path: "/admin_index",
            component: () => import('../view/admin/admin_index.vue'),
            children: [
                { path: "/admin_rueixisk", component: () => import('../view/admin/admin_rueixisk.vue') },
                { path: "/admin_publiczl", component: () => import('../view/admin/admin_publiczl.vue') },
                { path: "/admin_ruklose", component: () => import('../view/admin/admin_ruklose.vue') },
                { path: "/admin_user", component: () => import('../view/admin/admin_user.vue') },
                { path: "/admin_contacts", component: () => import('../view/admin/admin_contacts.vue') },
                { path: "/admin_suoruotoji", component: () => import('../view/admin/admin_suoruotoji.vue') },
                { path: "/admin_message", component: () => import('../view/admin/admin_message.vue') },
                { path: "/admin_settings", component: () => import('../view/admin/admin_settings.vue') },
                { path: "/admin_shopgl", component: () => import('../view/admin/admin_shopgl.vue') },
                { path: "/admin_apply", component: () => import('../view/admin/admin_apply.vue') },
                { path: "/admin_shopindex", component: () => import('../view/admin/admin_shopindex.vue') },
            ]
        },
        { path: "/admin_login", component: () => import('../view/admin/admin_login.vue') },
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }
        if (to.hash) {
            return { el: to.hash, behavior: 'instant' }
        }
        return { top: 0, left: 0, behavior: 'instant' }
    }
})

// 路由全局前置守卫
router.beforeEach((to, from, next) => {
    const user = localStorage.getItem('user')    // 前台用户登录态
    const admin = localStorage.getItem('adminuser') // 后台管理员登录态
    const publicPages = ['/login', '/register', '/admin_login']

    // 1. 后台路由拦截
    if (to.path.startsWith('/admin')) {
        // 前台已登录，禁止进后台
        if (user) {
            next('/login')
            return
        }
        // 后台登录页直接放行
        if (to.path === '/admin_login') {
            next()
            return
        }
        // 后台无登录态 → 跳后台登录
        if (!admin) {
            next('/admin_login')
            return
        }
        // 👉 管理员单独判断：如需后台也做超时，可在此加逻辑，当前仅前台超时
        next()
        return
    }

    // 2. 前台路由拦截
    // 后台已登录，禁止进前台
    if (admin) {
        next('/admin_login')
        return
    }

    // 公开页面直接放行
    if (publicPages.includes(to.path)) {
        next()
        return
    }

    // 非公开页面
    if (!user) {
        next('/login')
        return
    }

    // 👉 核心：前台已登录，校验30分钟无操作超时
    // if (isLoginTimeout()) {
    //     logoutAndRedirect(router)
    //     next('/login')
    //     return
    // }

    // 全部校验通过，正常放行
    next()
})

export default router