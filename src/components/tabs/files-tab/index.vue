<template>
    <div class="file">
        <ul class="tab-list">
            <li @click="newFile()">新建</li>
            <li @click="exportFile('file')">导入</li>
            <li @click="exportFile('dir')">dir</li>
            <li @click="newDir()">nD</li>
            <li @click="saveAllFile()">save</li>
            <li @click="removeAllFile()">delete</li>
        </ul>
        <ul class="file-content">
            <item v-for="(item,index) in fileTreeData" :key="index" :filesList="item"></item>
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
            ...mapActions(['queryFileListData','updateUrl','updateEditFile','updateRightMenuBlock','updateTreeData']),
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
	        saveAllFile(){
		        let fileData = this.fileTreeData.filter((item)=>{
		        	console.log(item)
			        return item.value;
		        });
		        let dialogFile = this.getUrl.filter((item)=>{
			        return !item.value;
		        });
		        console.log(fileData);
		        console.log(dialogFile);
		        file.saveAllHaveFile(fileData,(fileObj)=>{
		        	alert(1111)
		        	console.log('dsafsafsafasfsaf:')
		        	console.log(fileObj);
//		        	file.writeFile()
                });
		        file.saveAllNoFile(dialogFile,()=>{

                });
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
        width:35px;
        height:30px;
        line-height:30px;
        cursor:pointer;
        color:blue;
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