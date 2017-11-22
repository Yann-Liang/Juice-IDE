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
                    <li @click="saveFile()" @mousedown.stop="" v-if="position.item && !position.item.children">保存</li>
                    <li @click="saveOtherPathFn()" @mousedown.stop="" v-if="position.item && !position.item.children">另存为</li>
                    <li @click="rename" @mousedown.stop="">重命名</li>
                    <li @click="removeFileFn" @mousedown.stop="">删除</li>
                </ul>
            </div>
        </ul>

        <!--删除所有提示-->
        <div class="tip-modal modal" v-if="showTipModal">
            <div class="modal-main">
                <h4 class="modal-title">
                    提示
                    <span class="modal-close" @click="cancelFn"></span>
                </h4>
                <div class="modal-content">
                    <div class="content-tip">
                        <p class="tip-text"><span class="warning-icon"></span>确定删除全部文件吗！</p>
                    </div>
                </div>
                <div class="modal-btn">
                    <el-button class="cancel" @click="cancelFn">取消</el-button>
                    <el-button type="primary" @click="sureDeleteAllFile()">确定</el-button>
                </div>
            </div>
        </div>


        <!--删除提示-->
        <div class="tip-modal modal" v-if="showDeleteModal">
            <div class="modal-main">
                <h4 class="modal-title">
                    提示
                    <span class="modal-close" @click="cancelDeleteFn"></span>
                </h4>
                <div class="modal-content">
                    <div class="content-tip">
                        <p class="tip-text"><span class="warning-icon"></span>确定删除{{deleteFile.value || deleteFile.name}}文件吗！</p>
                    </div>
                </div>
                <div class="modal-btn">
                    <el-button class="cancel" @click="cancelDeleteFn">取消</el-button>
                    <el-button type="primary" @click="sureDeleteFile()">确定</el-button>
                </div>
            </div>
        </div>


        <!--输入提示-->
        <div class="tip-modal modal" v-if="showFileNameModal">
            <div class="modal-main">
                <h4 class="modal-title">
                    {{title}}
                    <span class="modal-close" @click="cancelFileNameFn"></span>
                </h4>
                <div class="modal-content">
                    <el-form label-width="60px" :model="ruleForm" :rules="rules" class="demo-dynamic" ref="ruleForm">
                        <el-form-item prop="newFileName" label="Name：">
                            <el-input v-model="ruleForm.newFileName"></el-input>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="modal-btn">
                    <el-button class="cancel" @click="cancelFileNameFn('ruleForm')">取消</el-button>
                    <el-button type="primary" @click="sureFileNameFn('ruleForm')">确定</el-button>
                </div>
            </div>
        </div>



        <!--输入文件夹提示-->
        <div class="tip-modal modal" v-if="showDirNameModal">
            <div class="modal-main">
                <h4 class="modal-title">
                    文件夹名
                    <span class="modal-close" @click="cancelDirNameFn"></span>
                </h4>
                <div class="modal-content">
                    <el-form label-width="60px" :model="ruleForm" :rules="rules" class="demo-dynamic" ref="ruleForm2">
                        <el-form-item prop="newDirName" label="Name：">
                            <el-input v-model="ruleForm.newDirName"></el-input>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="modal-btn">
                    <el-button class="cancel" @click="cancelDirNameFn('ruleForm2')">取消</el-button>
                    <el-button type="primary" @click="sureDirNameFn('ruleForm2')">确定</el-button>
                </div>
            </div>
        </div>


        <!--各种提示-->
        <div class="tip-modal modal" v-if="hintInfo.show">
            <div class="modal-main">
                <h4 class="modal-title">
                    提示
                    <span class="modal-close" @click="cancelHintModalFn"></span>
                </h4>
                <div class="modal-content">
                    <div class="content-tip">
                        <p class="tip-text"><span class="warning-icon"></span>{{hintInfo.message}}</p>
                    </div>
                </div>
                <div class="modal-btn">
                    <el-button type="primary" @click="cancelHintModalFn">确定</el-button>
                </div>
            </div>
        </div>
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
		        ruleForm:{
			        newFileName:'',
			        newDirName:''
                },
		        rules: {
			        newFileName: [
				        {required: true, message: '请输入名字', trigger: 'change,blur'}
			        ],
			        newDirName: [
				        {required: true, message: '请输入名字', trigger: 'change,blur'}
			        ],
		        },
                title:'SOL文件',
                type:'newFileName'
	        }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {
            ...mapGetters(['fileTreeData','activeFile','getUrl','editFile','position','rightMenuBlock','currentName'
                ,'showTipModal','showDeleteModal','deleteFile','showFileNameModal','showDirNameModal','hintInfo'])
        },
        //方法
        methods: {
            ...mapActions(['queryFileListData','updateUrl','updateEditFile','updateRightMenuBlock',
                'updateTreeData','saveAllFile','renameFile','saveEditorFile','saveOtherPath','updateDeleteStatus'
                ,'updateCurrentId','removeFileFn','changeShowTipModal','changeShowDeleteModal','changeShowFileNameModal'
                ,'changeDirNameModal','setHintInfo','updateNewOpenFile','updateData','updateActiveEditor','changeFileData','setActiveFile']),
            newFile(){
            	let blo = true;
	            this.fileTreeData.forEach((item,index)=>{
	            	if(item.keyId === this.activeFile.keyId && file.isFile(this.activeFile.value)){
			            blo = false;
                    }
                });

            	if(this.activeFile.value && blo){
            		this.title = 'SOL文件';
		            this.ruleForm.newFileName = '';
		            this.type = 'newFileName';
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
	        updateUrlFn(filesList){
		        this.getUrl.forEach((item,index,data)=>{
			        if(filesList.value == item.value && filesList.name == item.name){
				        data.splice(index,1);
				        this.updateUrl(data)
			        }
		        })
	        },
	        removeAllFile(){
		        this.changeShowTipModal(true);
            },
	        saveFile(){
	        	this.saveEditorFile();
		        this.updateRightMenuBlock(false);
            },
            rename(){ // 重命名
	            this.title = '重命名';
	            this.ruleForm.newFileName = '';
	            this.type = 'rename';
	            this.changeShowFileNameModal(true);
            },
	        saveOtherPathFn(){
		        this.updateRightMenuBlock(false);
		        this.saveOtherPath(2);
            },
	        cancelFn(){
	        	this.changeShowTipModal(false);
            },
	        sureDeleteAllFile(){
		        const arr = this.getUrl;
		        arr.forEach((item,index)=>{
		        	if(item.value){
				        file.removeFile(item.value,()=>{
					        this.updateUrlFn(item)
				        })
                    }else{
				        this.updateUrlFn(item)
                    }
		        });
		        // 更新初始状态
                this.setActiveFile('');
                this.updateEditFile({unWatch:true});
                this.updateData([]);
                this.updateActiveEditor({});
                this.changeFileData([]);

		        this.changeShowTipModal(false);
            },
	        cancelDeleteFn(){
	        	this.changeShowDeleteModal(false);
            },
	        sureDeleteFile(){
		        this.removeFileFn();
		        this.changeShowDeleteModal(false);
            },
	        cancelFileNameFn(formName){
		        this.ruleForm.newFileName = '';
	        	this.changeShowFileNameModal(false)
            },
	        sureFileNameFn(formName){
		        this.$refs[formName].validate((valid) => {
			        if (valid) {
				        this.changeShowFileNameModal(false);
				        if(this.type == 'newFileName'){
					        file.newFile(this.activeFile.value,this.ruleForm.newFileName,(res)=>{
					        	if(this.activeFile.id === 1){
							        this.updateNewOpenFile(this.activeFile);
                                }
						        if(res.code === 0){
							        this.queryFileListData();
							        this.updateEditFile({
								        name:file.uffixName(this.ruleForm.newFileName),
								        value:res.value,
								        keyId:res.keyId
							        })
						        }else if(res.code === 1){
							        this.setHintInfo({
								        show:true,
								        title:'',
								        message:'文件已存在，请更换文件名'
							        })
						        }
						        this.ruleForm.newFileName = '';
					        })
                        }else if(this.type == 'rename'){
					        this.type = 'newFileName';
					        this.renameFile(this.ruleForm.newFileName);
					        this.ruleForm.newFileName = '';
                        }

			        } else {
				        this.ruleForm.newFileName = '';
				        console.log('error submit!!');
				        return false;
			        }
		        });
            },
	        cancelDirNameFn(formName){
		        this.ruleForm.newDirName = '';
		        this.changeDirNameModal(false)
	        },
	        sureDirNameFn(formName){
		        this.$refs[formName].validate((valid) => {
			        if (valid) {
				        if(this.activeFile.id === 1){
					        this.updateNewOpenFile(this.activeFile);
				        }
				        this.changeDirNameModal(false);
				        file.newMkdir(this.activeFile.value,this.ruleForm.newDirName,(res)=>{
					        if(res.code === 0){
						        this.queryFileListData();
					        }else if(res.code === 1){
						        this.setHintInfo({
							        show:true,
							        title:'',
							        message:'文件夹已存在，请更换文件夹名'
						        })
					        }else if(res.code === 2){

					        }
					        this.updateRightMenuBlock(false);
					        this.ruleForm.newFileName = '';
				        })
			        } else {
				        this.ruleForm.newDirName = '';
				        console.log('error submit!!');
				        return false;
			        }
		        });
	        },
	        cancelHintModalFn(){
	        	this.setHintInfo({
                    show:false,
                    title:'',
                    message:''
                })
            }
        },
        //生命周期函数
        created() {
        	console.log(this.getUrl)
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
</style>