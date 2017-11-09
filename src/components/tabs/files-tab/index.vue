<template>
    <div class="file">
        <ul class="tab-list">
            <li title="新建文件" @click="newFile()"><i class="iconfont info">&#xe620;</i></li>
            <li title="导入文件" @click="exportFile('file')"><i class="iconfont info">&#xe625;</i></li>
            <li title="导入文件夹" @click="exportFile('dir')"><i class="iconfont info">&#xe626;</i></li>
            <li title="新建文件夹" @click="newDir()"><i class="iconfont info">&#xe627;</i></li>
            <li title="保存所有文件" @click="saveAllFile()"><i class="iconfont info">&#xe629;</i></li>
            <li title="删除所有文件" @click="removeAllFile()"><i class="iconfont info">&#xe623;</i></li>
        </ul>
        <ul class="file-content">
            <item v-for="(item,index) in fileTreeData" class="file-item" :key="index" :filesList="item"></item>
            <div ref="rightMenu" class="right-menu" v-show="rightMenuBlock" :style="{top:position.y+'px',left:position.x+'px'}">
                <ul class="wrap-menu-list">
                    <li @click="newFile()" @mousedown.stop="">新建文件</li>
                    <li @click="newDir()" @mousedown.stop="">新建文件夹</li>
                    <li @click="saveFile()" @mousedown.stop="">保存</li>
                    <li @click="saveOtherPath()" @mousedown.stop="">另存为</li>
                    <li @click="rename" @mousedown.stop="">重命名</li>
                    <li @click="removeFileFn" @mousedown.stop="">删除</li>
                </ul>
            </div>
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
            ...mapGetters(['fileTreeData','activeFile','getUrl','editFile','position','rightMenuBlock'])
        },
        //方法
        methods: {
            ...mapActions(['queryFileListData','updateUrl','updateEditFile','updateRightMenuBlock','updateTreeData','saveAllFile']),
            newFile(){
            	this.open((name)=>{
		            file.newFile(this.activeFile.value,name,(res)=>{
			            if(res.code === 0){
				            this.queryFileListData();
				            this.updateEditFile({
					            name:file.uffixName(name),
					            value:res.value,
					            keyId:res.keyId
				            })
				            console.log(this.editFile);
			            }else if(res.code === 1){
				            this.tipOpen()
			            }else if(res.code === 2){
				            const url = this.getUrl;
				            url.push({value:'',name:file.uffixName(name),keyId:res.keyId});
				            this.updateUrl(url);
				            this.updateEditFile({
					            name:file.uffixName(name),
					            value:res.value,
					            keyId:res.keyId
				            })
			            }
			            this.updateRightMenuBlock(false);
		            })
                });
            },
	        newDir(){
		        this.open((name)=>{
			        file.newMkdir(this.activeFile.value,name,(res)=>{
				        if(res.code === 0){
					        this.queryFileListData();
				        }else if(res.code === 1){
					        this.tipOpen()
				        }else if(res.code === 2){

				        }
				        this.updateRightMenuBlock(false);
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
            },
	        exportFile(type){
            	file.exportFile(type,(filename)=>{
            		if(filename){
			            const url = this.getUrl;
			            console.log(file.basename(filename));
			            url.push({value:filename,name:file.basename(filename)});
			            this.updateUrl(url);
                    }
                });
            },
	        updateUrlFn(filesList){
		        this.getUrl.forEach((item,index,data)=>{
			        if(filesList.keyId == item.keyId){
				        data.splice(index,1);
				        this.updateUrl(data)
			        }
		        })
	        },
	        removeAllFile(){
		        const arr = this.getUrl;
		        arr.forEach((item,index)=>{
	        		file.removeFile(item.value,()=>{
	        			console.log('删除文件'+item.value+'成功');
				        this.updateUrlFn(item)
                    })
               })
            },
	        saveFile(){
	        	file.saveFile('','123456','2222',()=>{

                })
            },
	        saveAllFileFn(){
		        this.saveAllFile()
	        },
	        removeFileFn(){
		        if(this.activeFile.value){
		        	console.log(this.activeFile.value);
			        file.removeFile(this.activeFile.value,()=>{
				        this.updateUrlFn(this.activeFile);
				        this.queryFileListData();
				        console.log('删除文件成功');
			        })
		        }else{
			        this.updateUrlFn(this.activeFile);
		        }
		        this.updateRightMenuBlock(false);
		        return false;
	        },
            rename(){

            },
	        saveOtherPath(){
		        file.fsReadFile(this.activeFile.value,(err,data)=>{
		        	if(!err){
				        file.saveFile('',this.activeFile.name,data,()=>{

                        })
                    }else{

                    }
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
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        min-width:200px;
        position: relative;
    }
    .file-content{
        flex-grow: 1;
    }
    .tab-list{
        height:40px;
        min-height:40px;
        padding:0 15px;
        display: flex;
        align-content: space-between;
        border-bottom:solid 1px #e5e5e5;
    }
    .tab-list li{
        flex-grow: 1;
        height:40px;
        line-height:40px;
        cursor:pointer;
    }
    .file-content{
        .file-item{
            height:40px;
            line-height:40px;
        }
    }
    .right-menu{
        position:fixed;
        left:0px;
        top:0px;
        width:200px;
        padding-bottom:20px;
        background:#ccc;
        z-index:100
    }
    .wrap-menu-list{
        li{
            height:35px;
            line-height:35px;
            text-align: center;
            border-bottom:1px solid #fff;
            cursor:pointer;
        }
        li:hover{
            background:#fff;
        }
    }
</style>