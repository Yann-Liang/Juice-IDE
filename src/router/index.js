import Vue from 'vue'
import Router from 'vue-router'

//home组件
import Index from './map/index'

//重定向 放最后面
import Redirect from './map/Redirect'

Vue.use(Router)

export default new Router({
    routes: [
        Index,//主页
        Redirect, //路由重定向(访问不存在的页面时，重定向到这个页面) 放最后面
    ]
})