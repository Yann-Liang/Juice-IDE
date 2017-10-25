<template>
    <div class="file">
        <ul class="tab-list">
            <li>新建</li>
            <li>export</li>
            <li>new</li>
            <li>save</li>
            <li>delete</li>
        </ul>
        <div class="file-content">
            <item :model="treeData"></item>
        </div>
    </div>
</template>

<script>
    //import  from ''
    import item from '@/components/tree/tree.vue'
    import file from '@/services/API-file'

    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
	        return {
		        treeData:[]
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
            console.log(111)
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
	        item
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
    .file{
        height:100%;
        min-width:200px;
        background:#666;
    }
    .tab-list{
        border-bottom:1px solid #fff;
        height:30px;
    }
    .tab-list li{
        float:left;
        width:50px;
        height:30px;
        line-height:30px;
        cursor:pointer;
        color:blue;
    }
</style>