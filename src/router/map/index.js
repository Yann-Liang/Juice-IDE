//home组件
const Index = resolve => require(['@/views/index/index.vue'], resolve)

export default {
    path: '/',
    component: Index,
    name: '主页',
    icon: '', //图标样式class
    children: []
}