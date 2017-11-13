<template>
    <div class="file no-chose">
        <ul class="tab-list">
            <li title="新建文件" @click="newFile()"><i class="iconfont info">&#xe620;</i></li>
            <li title="导入文件" @click="exportFile('file')"><i class="iconfont info">&#xe625;</i></li>
            <li title="导入文件夹" @click="exportFile('dir')"><i class="iconfont info">&#xe626;</i></li>
            <li title="新建文件夹" @click="newDir()"><i class="iconfont info">&#xe627;</i></li>
            <li title="保存所有文件" @click="saveAllFile()"><i class="iconfont info">&#xe629;</i></li>
            <li title="删除所有文件" @click="removeAllFile()"><i class="iconfont info">&#xe623;</i></li>
        </ul>
        <ul class="file-content">
            <item v-for="(item,index) in fileTreeData" class="file-item" :key="index" :filesList="item" ref="treeItem"></item>
            <div ref="rightMenu" class="right-menu" v-show="rightMenuBlock" :style="{top:position.y+'px',left:position.x+'px'}">
                <ul class="wrap-menu-list">
                    <li @click="newFile()" @mousedown.stop="">新建文件</li>
                    <li @click="newDir()" @mousedown.stop="">新建文件夹</li>
                    <li @click="saveFile()" @mousedown.stop="">保存</li>
                    <li @click="saveOtherPathFn()" @mousedown.stop="">另存为</li>
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
            ...mapActions(['queryFileListData','updateUrl','updateEditFile','updateRightMenuBlock',
                'updateTreeData','saveAllFile','renameFile','saveEditorFile','saveOtherPath','updateDeleteStatus']),
            newFile(){
            	this.open((name)=>{
		            file.newFile(this.activeFile.value,name,(res)=>{
			            const child = this.$refs.treeItem;
			            console.log(child);
			            child.toggle(this.activeFile);

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
		        this.updateRightMenuBlock(false);
		        this.$prompt('请输入邮箱', '提示', {
			        confirmButtonText: '确定',
			        cancelButtonText: '取消',
		        }).then(({ value }) => {
			        fn && fn(value)
		        })
	        },
	        tipOpen(str) {
		        str = str || '文件已存在，请更换文件名'
		        this.$alert(str, '提示', {
			        confirmButtonText: '确定',
		        });
	        },
	        exportFile(type){
            	file.exportFile(type,this.fileTreeData,(filename)=>{
            		if(filename && file.isObject(filename)){
			            this.tipOpen('文件已存在在项目中');
                    }else if(filename){
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
	        	this.saveEditorFile();
		        this.updateRightMenuBlock(false);
            },
	        removeFileFn(){
		        if(this.activeFile.value){
		        	console.log(this.activeFile.value);
			        file.removeFile(this.activeFile.value,()=>{
				        this.updateUrlFn(this.activeFile);
				        this.queryFileListData();
				        console.log('删除文件成功');
				        this.updateDeleteStatus(filesList)
			        })
		        }else{
			        this.updateUrlFn(this.activeFile);
		        }
		        this.updateRightMenuBlock(false);
		        return false;
	        },
            rename(){ // 重命名
	            this.open((name)=>{
	            	this.renameFile(name)
	            });
            },
	        saveOtherPathFn(){
		        this.updateRightMenuBlock(false);
		        this.saveOtherPath(2);
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
    @import '../../../less/modules/theme.less';
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

        }
    }
    .right-menu{
        position:fixed;
        left:0px;
        top:0px;
        width:150px;
        background:#f7f7f7;
        z-index:100;
        box-shadow: 0 0 5px #ccc;
    }
    .wrap-menu-list{
        li{
            height:30px;
            line-height:30px;
            text-align: center;
            border-bottom:1px solid #e5e5e5;
            cursor:pointer;
            color:#333;
        }
        li:hover{
            background:@blue
        }
    }
</style>