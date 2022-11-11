import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
//auth文件主要依赖js-cookie模块，把getToken，setToken，removeToken设置在这里
import { getToken } from '@/utils/auth' // get token from cookie
//get-page-title文件主要是网站的标题，get-page-title通过依赖setting.js里的title变量修改网站标题
//如果需要更改网站的标题，可以直接到setting.js修改title属性
import getPageTitle from '@/utils/get-page-title'

//NProgress是封装的进度条，基本不用动
NProgress.configure({ showSpinner: false }) // NProgress Configuration

//路由白名单列表，把路由添加到这个数组，不用登陆也可以访问
const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
    // start progress bar // 请求路由时进度条开始
    NProgress.start()

    // set page title // 设置标题
    document.title = getPageTitle(to.meta.title)

    // determine whether the user has logged in
    // 这里的getToken()就是在上面导入的auth.js里的getToken()方法
    const hasToken = getToken()

    if (hasToken) {
        if (to.path === '/login') {
            //如果用户存在令牌的情况请求登录页面，就让用户直接跳转到首页，避免存在重复登录的情况
            // if is logged in, redirect to the home page
            next({ path: '/' })
            //一定要关闭进度条
            NProgress.done()
        } else {
            //如果已经有令牌的用户请求的不是登录页，是其他页面
            //就从Vuex里拿用户的信息
            const hsaRoles = store.getters.roles && store.getters.roles.length > 0
            if (hsaRoles) {
                //如果有信息，就证明用户不是第一次登录了，用户请求哪就跳转哪
                next()
            } else {
                try {
                    // get user info
                    // 有令牌，但是没有用户信息，证明用户是第一次登录，通过Vuex获取和设置用户信息
                    // 抽取用户信息的 roles 
                    const { roles } = await store.dispatch('user/getInfo')

                    const accessedRoutes = await store.dispatch('permission/generateRoutes', roles)

                    router.addRoutes(accessedRoutes)
                    //设置好了之后，依然可以请求哪就跳转哪
                    // newx() 是放行的意思  此时如果放行会因为 addRoutes()没有执行完毕，to没有找到对应的被添加的路由而出现页面白屏
                    next({ ...to, replace: true })
                    // 所以要执行 next({ ...to })，再次执行 beforeEach((to, from, next)，直到找到to
                } catch (error) {
                    // remove token and go to login page to re-login
                    // 如果出错了，把令牌去掉，并让用户重新去到登录页面
                    await store.dispatch('user/resetToken')
                    Message.error(error || 'Has Error')
                    next(`/login?redirect=${to.path}`)
                    NProgress.done()
                }
            }
        }
    } else {
        /* has no token*/
        //这里是没有令牌的情况
        //还记得上面的白名单吗，现在起作用了
        //whiteList.indexOf(to.path) !== -1)判断用户请求的路由是否在白名单里
        if (whiteList.indexOf(to.path) !== -1) {
            // in the free login whitelist, go directly
            // 不是-1就证明存在白名单里，不管你有没有令牌，都直接去到白名单路由对应的页面
            next()
        } else {
            // other pages that do not have permission to access are redirected to the login page.
            // 如果这个页面不在白名单里，直接跳转到登录页面
            next(`/login?redirect=${to.path}`)
            NProgress.done()
        }
    }
})

router.afterEach(() => {
    // finish progress bar //每次请求结束后都需要关闭进度条
    NProgress.done()
})