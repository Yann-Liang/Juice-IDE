<template>
    <div class="file">
        <ul class="tab-list">
            <li @click="newFile()">新建</li>
            <li>导入</li>
            <li>new</li>
            <li>save</li>
            <li @click="removeFile()">delete</li>
        </ul>
        <ul class="file-content">
            <item v-for="(item,index) in fileTreeData" :key="index" :filesList="item"></item>
        </ul>
    </div>
</template>

<script>
    //import  from ''
    import item from '@/components/tree/tree.vue'
    import file from '@/services/API-file'
    import {mapState, mapActions, mapGetters} from 'vuex';

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
            ...mapGetters(['fileTreeData','activeFile'])
        },
        //方法
        methods: {
            ...mapActions(['queryFileListData']),
            newFile(){
            	console.log(this.activeFile.value)
	            file.newMkdir(this.activeFile.value,'8999',()=>{
		            this.queryFileListData();
                })
            }
        },
        //生命周期函数
        created() {
	        this.queryFileListData();
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
        overflow:hidden;
        position: relative;
    }
    .file-content{
        position:absolute;
        top:31px;
        bottom:0;
        width:100%;
        overflow-y: auto;
    }
    .tab-list{
        border-bottom:1px solid #fff;
        height:30px;
    }
    .tab-list li{
        float:left;
        width:40px;
        height:30px;
        line-height:30px;
        cursor:pointer;
        color:blue;
    }
</style>