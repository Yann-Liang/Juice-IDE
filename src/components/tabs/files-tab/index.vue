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
            ...mapGetters(['fileTreeData','activeFile','getUrl','editFile'])
        },
        //方法
        methods: {
            ...mapActions(['queryFileListData','updateUrl','updateEditFile']),
            newFile(){
            	this.open((name)=>{
		            file.newFile(this.activeFile.value,name,(res)=>{
		            	if(res.code === 0){
				            this.queryFileListData();
				            this.updateEditFile({
					            name:name,
					            value:res.value
				            })
                            console.log(this.editFile);
                        }else if(res.code === 1){
				            this.tipOpen()
                        }else if(res.code === 2){
                            const url = this.getUrl;
                            url.push({value:'',name:name});
                            this.updateUrl(url);
				            this.updateEditFile({
					            name:name,
					            value:res.value
				            })
                        }
		            })
                });
            },
	        open(fn) {
		        this.$prompt('请输入邮箱', '提示', {
			        confirmButtonText: '确定',
			        cancelButtonText: '取消',
		        }).then(({ value }) => {
			        fn && fn(value)
		        })
	        },
            tipOpen() {
	            this.$alert('文件已存在，请更换文件名', '提示', {
		            confirmButtonText: '确定',
	            });
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