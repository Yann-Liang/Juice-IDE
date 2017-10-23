<template>
    <div class="">
        <com-header>

        </com-header>
        <ul class="tabs">
            <li>文件</li>
            <li>编译</li>
            <li>控制台</li>
            <li>部署</li>
            <li>运行</li>
        </ul>
            <deploy-tab></deploy-tab>
        <editor></editor>
        <console></console>
    </div>
</template>

<script>
    //import  from ''
    import comHeader from '@/components/Header/Header.vue'
    import filesTab from '@/components/tabs/files-tab/'
    import compileTab from '@/components/tabs/compile-tab/'
    import deployTab from '@/components/tabs/deploy-tab/'
    import runTab from '@/components/tabs/run-tab/'
    import console from '@/components/console/'
    import editor from '@/components/editor/'

    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {

            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {

        },
        //方法
        methods: {

        },
        //生命周期函数
        created() {

        },
        beforeMount() {

        },
        mounted() {

        },
        //监视
        watch: {

        },
        //组件
        components: {
            comHeader,
            filesTab,
            compileTab,
            deployTab,
            runTab,
            console,
            editor,
        },
        //过滤器
        filters:{

        },
        //自定义指令
        directive:{

        }
    }
</script>

<style lang="less" scoped>
    .tabs{

    }
</style>