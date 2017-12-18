<template>
    <div class="file no-chose">
        <div class="tab-container">
            <ul class="tab-list">
                <li title="新建文件" @click="newFile()"><i class="iconfont info">&#xe620;</i></li>
                <li title="导入文件" @click="exportFile('file')"><i class="iconfont info">&#xe625;</i></li>
                <li title="导入文件夹" @click="exportFile('dir')"><i class="iconfont info">&#xe626;</i></li>
                <li title="新建文件夹" @click="newDir()"><i class="iconfont info">&#xe627;</i></li>
                <li title="保存所有文件" @click="saveAllFile()"><i class="iconfont info">&#xe634;</i></li>
                <li title="删除所有文件" @click="removeAllFile()"><i class="iconfont info">&#xe623;</i></li>
            </ul>
        </div>
        <ul class="file-content">
            <item v-for="(item,index) in fileTreeData" class="file-item" :key="index" :filesList="item" ref="treeItem"></item>
            <div ref="rightMenu" class="right-menu" v-show="rightMenuBlock" :style="{top:position.y+'px',left:position.x+'px'}">
                <ul class="wrap-menu-list" id="wrap-menu-list">
                    <li @click="newFile()" @mousedown.stop="">新建文件</li>
                    <li @click="newDir()" @mousedown.stop="">新建文件夹</li>
                    <li @click="saveFile()" @mousedown.stop="" v-if="position.item && !position.item.children">保存</li>
                    <li @click="saveOtherPathFn()" @mousedown.stop="" v-if="position.item && !position.item.children">另存为</li>
                    <li @click="rename(position.item)" @mousedown.stop="">重命名</li>
                    <li @click="removeFile(position.item)" @mousedown.stop="">删除</li>
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
                isScan: true,
	        }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {
            ...mapGetters(['fileTreeData','activeFile','getUrl','editFile','position','rightMenuBlock','currentName'
                ,'showTipModal','showDeleteModal','deleteFile','showFileNameModal','showDirNameModal','hintInfo','dialogInfo'])
        },
        //方法
        methods: {
            ...mapActions(['queryFileListData','updateUrl','updateEditFile','updateRightMenuBlock',
                'updateTreeData','saveAllFile','renameFile','saveEditorFile','saveOtherPath','updateDeleteStatus'
                ,'updateCurrentId','removeFileFn','changeShowTipModal','changeShowDeleteModal','changeShowFileNameModal'
                ,'changeDirNameModal','setHintInfo','updateNewOpenFile','updateData','updateActiveEditor','changeFileData'
                ,'setActiveFile','changeDeleteFile','changeDialogInfo']),
            newFile(){
            	let blo = true;
	            this.fileTreeData.forEach((item,index)=>{
	            	if(item.keyId === this.activeFile.keyId && file.isFile(this.activeFile.value)){
			            blo = false;
                    }
                });

            	if(this.activeFile.value && blo){
		            this.changeDialogInfo({
			            type:'newFileName',
			            title:'SOL文件',
			            label:'文件名'
		            })
//		            this.ruleForm.newFileName = '';
            		this.changeShowFileNameModal(true);
                }else{
		            file.newFile('',name,(res)=>{

			            if(this.activeFile.id === 1){
				            this.updateNewOpenFile(this.activeFile);
			            }
			            if(res.code === 2){
				            const url = this.getUrl;
				            url.push({value:'',name:file.uffixName(this.currentName),keyId:res.keyId});
				            this.updateUrl(url);
				            this.updateEditFile({
					            name:file.uffixName(this.currentName),
					            value:res.value,
					            keyId:res.keyId
				            })
				            this.updateCurrentId() // 更新id
			            }
		            })
                }
	            this.updateRightMenuBlock(false);
            },
	        newDir(){
		        this.changeDirNameModal(true)
            },
	        exportFile(type){
            	file.exportFile(type,this.fileTreeData,(filename)=>{
			        if(filename && file.isObject(filename)){
				        this.setHintInfo({
					        show:true,
					        title:'',
					        message:'文件已存在在项目中'
				        })
			        }else if(filename){
				        const url = this.getUrl;
				        url.push({value:filename,name:file.basename(filename)});
				        this.updateUrl(url);
			        }
		        });
            },
	        removeAllFile(){
		        this.changeShowTipModal(true);
            },
	        saveFile(){
	        	this.saveEditorFile();
		        this.updateRightMenuBlock(false);
            },
            rename(item){ // 重命名
	            this.changeDialogInfo({
	            	type:'rename',
		            title:'重命名',
		            label:this.activeFile.id == 1 ? '文件夹名': '文件名'
                })
	            let data = this.activeFile.id == 1 ? item.name : file.originName(item.name);
	            this.$emit('fileNameFn',data)
	            this.changeShowFileNameModal(true);
            },
	        saveOtherPathFn(){
		        this.updateRightMenuBlock(false);
		        this.saveOtherPath(2);
            },
	        removeFile(filesList){
		        this.changeDeleteFile(filesList);
		        this.changeShowDeleteModal(true)
	        },
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
    .tab-container{
        border-bottom:solid 1px #e5e5e5;
    }
    .tab-list{
        box-sizing:border-box;
        height:32px;
        min-height:32px;
        padding:0 15px;
    }
    .tab-list li{
        margin-right:13px;
        display:inline-block;
        height:32px;
        line-height:32px;
        cursor:pointer;
        &:last-child{
            margin-right:0;
        }
    }
    // .file-content{
    //     .file-item{

    //     }
    // }
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



    .tip-modal{
        .modal-main{
            width:511px;
        }
        .cancel{
            background:#bfbfbf;
            color:#fff;
            &.el-button:hover{
                border-color:#bfbfbf;
            }
        }
    }
    .dir-modal{
        .modal-main{
            width:650px;
            .modal-content{
                padding-right:10px;
            }
            .el-input{
                width:450px;
            }
        }
    }
    .warning-icon{
        display:inline-block;
        width:30px;
        height:30px;
        vertical-align: top;
        line-height:30px;
        background:url(./images/warning.png) no-repeat center;
        margin-right:10px;
    }
    .tip-text{
        line-height:30px;
    }
    .scan{
        margin-left:15px;
        color:#20a0ff;
        cursor: pointer;
    }
</style>