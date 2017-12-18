<template>
    <div class="index" @mousedown="topFn">
        <com-title></com-title>
        <com-header></com-header>
        <div class="main">
            <ul class="tabs bgblue menu-def no-chose">
                <li @click="filesTab()" :class="{active:activeMenu==1}"><i class="iconfont" title="合约文件管理器">&#xe615;</i></li>
                <li @click="compile()" :class="{active:activeMenu==2}"><i class="iconfont" title="编译合约">&#xe613;</i></li>
                <li @click="deployTab()" :class="{active:activeMenu==3}"><i class="iconfont" title="部署并运行合约">&#xe614;</i></li>
                <li @click="queryTab()" :class="{active:activeMenu==4}"><i class="iconfont" title="查询并运行合约">&#xe616;</i></li>
            </ul>
            <div class="tab-box bggray no-chose">
                <files-tab class="tab" v-show="filesTabFlag" :style="{width:tabWidth+'px'}" @fileNameFn="fileNameFn"></files-tab>

                <deploy-tab class="tab" v-if="deployTabFlag" :style="{width:tabWidth+'px'}"></deploy-tab>
                <keep-alive>
                    <query-tab class="tab" v-if="queryTabFlag" :style="{width:tabWidth+'px'}"></query-tab>
                </keep-alive>
                <i class="border" v-if="queryTabFlag ||filesTabFlag||deployTabFlag" @mousedown="mousedown($event)"></i>
            </div>
            <div class="main-right">
                <editor class="editor"></editor>
                <console-ele class="console"></console-ele>
            </div>

        </div>
        <div class="ghostbar bgblue" :style="{left:ghostbarLeft+'px'}" v-if="ghostbarFlag"></div>

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
                        <p class="tip-text"><span class="warning-icon"></span>确定删除{{deleteFile.value || deleteFile.name}}{{deleteFile.id ==2 ? '文件': '文件夹'}}吗！</p>
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
                    {{dialogInfo.title}}
                    <span class="modal-close" @click="cancelFileNameFn"></span>
                </h4>
                <div class="modal-content">
                    <el-form label-width="100px" :model="ruleForm" :rules="rules" class="demo-dynamic" ref="ruleForm">
                        <el-form-item prop="newFileName" :label="dialogInfo.label">
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
        <div class="dir-modal modal" v-if="showDirNameModal">
            <div class="modal-main">
                <h4 class="modal-title">
                    新建文件夹
                    <span class="modal-close" @click="cancelDirNameFn"></span>
                </h4>
                <div class="modal-content">
                    <el-form label-width="100px" :model="ruleForm" :rules="rules" class="demo-dynamic" ref="ruleForm2">
                        <el-form-item prop="newDirName" label="文件夹名">
                            <el-input v-model="ruleForm.newDirName"></el-input>
                        </el-form-item>
                        <el-form-item label="存放目录">
                            <el-input v-model="newDirPathFn" readonly></el-input>
                            <span class="scan" v-if="isScan" @click="scanFn">
                                浏览...
                            </span>
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

        <transition name="fade">
            <div class="error-type" v-show="typeERR">文件被占用，重命名失败！</div>
        </transition>
    </div>
</template>

<script>
    //import  from ''
    import comTitle from "@/components/title/";
    import comHeader from "@/components/Header/Header.vue";
    import filesTab from "@/components/tabs/files-tab/";
    import deployTab from "@/components/tabs/deploy-tab/";
    import queryTab from "@/components/tabs/query-tab/";
    import consoleEle from "@/components/console/";
    import editor from "@/components/editor/";
    import {mapState, mapActions, mapGetters} from 'vuex';
    import consoleService from '@/services/console/console-service';
    import compileService from '@/services/compile-exe/compile-service';
    import contractServies from '@/services/contract-servies';
    import hotkeys from 'hotkeys-js'
    import file from '@/services/API-file'
    const beautify = require('js-beautify').js_beautify;
    let ipcRenderer=null;
    try {
       ipcRenderer= require('electron').ipcRenderer;
    } catch (error) {
        console.warn('不是eletron环境',error);
    }
    export default {
        //组件名
        name: "index",
        //实例的数据对象
        data() {
            return {
                filesTabFlag: true,
                deployTabFlag: false,
                queryTabFlag: false,
                ghostbarFlag:false,
                ghostbarLeft:100,
                tabWidth:223,
                activeMenu:'1', //当前操作菜单项
	            ruleForm:{
		            newFileName:'',
		            newDirName:'',
		            newDirPath:''
	            },
	            rules: {
		            newFileName: [
			            {required: true, message: '请输入名字', trigger: 'change,blur'}
		            ],
		            newDirName: [
			            {required: true, message: '请输入名字', trigger: 'change,blur'}
		            ],
	            },
	            newDirPathFn:'',
            };
        },
        //数组或对象，用于接收来自父组件的数据
        props: {},
        //计算
        computed: {
	        ...mapGetters(['fileTreeData','activeFile','getUrl','editFile','currentName','typeERR','showTipModal','showDeleteModal'
                ,'deleteFile','showFileNameModal','dialogInfo','showDirNameModal','hintInfo'])
        },
        //方法
        methods: {
	        ...mapActions(['updateRightMenuBlock','saveEditorFile','saveOtherPath','saveAllFile','removeAllFile','queryFileListData'
                ,'updateEditFile','updateUrl','updateCurrentId','removeFileFn','changeShowTipModal','changeShowDeleteModal','changeDeleteFile'
            ,'boolSuccessVisible','boolSearchVisible','boolReplaceVisible','changeShowFileNameModal','changeDirNameModal','setHintInfo','updateData'
            ,'setActiveFile','updateActiveEditor','changeFileData','updateNewOpenFile','renameFile','changeDialogInfo']),

            filesTab() {
                this.filesTabFlag = !this.filesTabFlag;
                this.deployTabFlag = false;
                this.queryTabFlag = false;
                this.activeMenu = '1';
            },
            compile() {
                // this.filesTabFlag = false;
                // this.deployTabFlag = false;
                // this.queryTabFlag = false;
                compileService.compiler();
                this.activeMenu = '2';
            },
            deployTab() {
                this.deployTabFlag = !this.deployTabFlag;
                this.filesTabFlag = false;
                this.queryTabFlag = false;
                this.activeMenu = '3';
            },
            queryTab() {
                this.queryTabFlag = !this.queryTabFlag;
                this.deployTabFlag = false;
                this.filesTabFlag = false;
                this.activeMenu = '4';
            },
            hiddenTabs(){
                this.queryTabFlag = false;
                this.deployTabFlag = false;
                this.filesTabFlag = false;
            },
            mousedown(event){
                 const cancelGhostbar =(event)=> {
                    if (event.keyCode === 27) {
                    document.body.removeChild(ghostbar)
                    document.removeEventListener('mousemove', moveGhostbar)
                    document.removeEventListener('mouseup', removeGhostbar)
                    document.removeEventListener('keydown', cancelGhostbar)
                    }
                },getPosition =(event)=>  {
                    return event.pageX;
                },moveGhostbar  =(event)=>  {
                    this.ghostbarLeft = getPosition(event)
                },removeGhostbar =(event)=>  {
                    this.ghostbarFlag=false;
                    document.removeEventListener('mousemove', moveGhostbar)
                    document.removeEventListener('mouseup', removeGhostbar)
                    document.removeEventListener('keydown', cancelGhostbar)
                    let data=getPosition(event);
                    if(data<223){
                        this.tabWidth=223;
                        this.hiddenTabs();
                    }else{
                        this.tabWidth=data;
                    }
                }
                if (event.which === 1) {
                    moveGhostbar(event)
                    this.ghostbarFlag=true;
                    document.addEventListener('mousemove', moveGhostbar)
                    document.addEventListener('mouseup', removeGhostbar)
                    document.addEventListener('keydown', cancelGhostbar);

                }
            },
	        hotkeysFn(){
		        // 注册快捷键
		        // 新建
		        hotkeys('ctrl+n', (event,handler)=>{
                    this.newFile();
		        });

		        // 新建文件夹
		        hotkeys('ctrl+w', (event,handler)=>{
			        this.newDir();
		        });

		        // 导入本地文件
		        hotkeys('ctrl+shift+o', (event,handler)=>{
			        this.exportFile('file')
		        });

		        // 导入本地文件夹
		        hotkeys('ctrl+o', (event,handler)=>{
			        this.exportFile('dir')
		        });

		        // 保存
		        hotkeys('ctrl+s', (event,handler)=>{
			        this.saveEditorFile(this.success)
		        });

		        // 另存为
		        hotkeys('ctrl+shift+s', (event,handler)=>{
			        this.saveOtherPath(1)
		        });

		        // 全部保存
		        hotkeys('ctrl+alt+s', (event,handler)=>{
			        this.saveAllFile(this.success);
		        });

		        // 删除
		        hotkeys('ctrl+delete', (event,handler)=>{
                    if(this.activeFile){
	                    this.changeDeleteFile(this.activeFile)
	                    this.changeShowDeleteModal(true);
                    }
		        });

		        // 删除所有文件
		        hotkeys('ctrl+shift+delete', (event,handler)=>{
			        this.changeShowTipModal(true)
		        });

                //查找
                hotkeys('ctrl+f', (event,handler)=>{
                    this.boolSearchVisible(true);
                });
                //替换
                hotkeys('ctrl+h', (event,handler)=>{
                    this.boolReplaceVisible(true);
                });
                //格式化
                hotkeys('ctrl+l', (event,handler)=>{
                    alert('ctrl+l');
                    this.format();//格式化
                });

	        },
            //代码格式化
            format:function(){
                console.log('设置格式化')
                this.editor.setValue(beautify(this.editor.getValue()),1);
                //引用了js-beautify库
            },
            //保存成功提示
            success:function(cb){
                this.boolSuccessVisible(true);
                setTimeout(()=>{
                    this.boolSuccessVisible(false);
                },500);
                if(cb && typeof(cb)=='function'){
                    cb();
                }
            },
	        topFn(){
		        this.updateRightMenuBlock(false);
            },
	        fileNameFn(data){
                this.ruleForm.newFileName = data;
            },
	        newFile(){
		        let blo = true;
		        this.fileTreeData.forEach((item,index)=>{
			        if(item.keyId === this.activeFile.keyId && file.isFile(this.activeFile.value)){
				        blo = false;
			        }
		        });
		        if(this.activeFile.value && blo){
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
		        this.changeDirNameModal(true);
	        },
	        exportFile(type){
		        file.exportFile(type,this.fileTreeData,(filename)=>{
			        if(filename && file.isObject(filename)){
				        this.setHintInfo({
					        show:true,
					        title:'',
					        message:type == 'file' ? '文件已存在在项目中' : '文件夹已存在项目中'
				        })
			        }else if(filename){
				        const url = this.getUrl;
				        url.push({value:filename,name:file.basename(filename)});
				        this.updateUrl(url);
			        }
		        });
	        },
            initUrlFn(){
	        	let data = localStorage.getItem('dirPath') ? JSON.parse(localStorage.getItem('dirPath')): [];
	            data = data.filter((item,index)=>{
		            if(file.exists(item.value)){
			            return true;
		            }
                });
	            this.updateUrl(data)
            },
	        cancelFn(){
		        this.changeShowTipModal(false);
	        },
	        sureDeleteAllFile(){
		        var arr = [];
		        for (var x = 0; x < this.getUrl.length; x++){
			        arr.push(this.getUrl[x])
		        }
		        arr.forEach((item,index)=>{
			        if(item.value){
				        file.removeFile(item.value,()=>{})
			        }
		        });
		        this.updateUrl([])
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
		        this.updateRightMenuBlock(false);
	        },
	        cancelFileNameFn(){
		        this.ruleForm.newFileName = '';
		        this.changeShowFileNameModal(false)
	        },
	        sureFileNameFn(formName){
		        this.$refs[formName].validate((valid) => {
			        if (valid) {
				        this.changeShowFileNameModal(false);
				        if(this.dialogInfo.type == 'newFileName'){
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
				        }else if(this.dialogInfo.type == 'rename'){
					        this.changeDialogInfo({
						        type: 'newFileName',
						        title:'SOL文件',
						        label: '文件名'
                            });
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
				        this.changeDirNameModal(false)
				        let blo = false;
				        this.fileTreeData.forEach((item,index) => {
					        if(this.activeFile.keyId ==item.keyId){
						        if(item.id == 2){
							        blo = true;
						        }
						        return;
					        }
				        })
				        if(!blo && this.activeFile.value){
					        // 有父文件夹的情况
					        if(this.activeFile.id === 1){
						        this.updateNewOpenFile(this.activeFile);
					        }
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
				        }else if(blo || !this.activeFile.value){
					        if(this.newDirPathFn == file.homeDirFn()){
						        file.creatTempDir(this.ruleForm.newDirName,()=>{
							        const url = this.getUrl;
							        const dirPath = this.newDirPathFn + '/' + this.ruleForm.newDirName;
							        url.push({value:dirPath,name:this.ruleForm.newDirName});
							        this.updateUrl(url);
							        this.ruleForm.newDirName = '';
						        })
					        }else{
						        const url = this.getUrl;
						        const dirPath = this.newDirPathFn + '/' + this.ruleForm.newDirName;
						        file.newDirFn(dirPath,()=>{
							        url.push({value:dirPath,name:this.ruleForm.newDirName});
							        this.updateUrl(url);
							        this.ruleForm.newDirName = '';
						        })
					        }
				        }
			        } else {
				        this.ruleForm.newDirName = '';
				        console.log('error submit!!');
				        return false;
			        }
		        });
	        },
	        newDirPathFunction(){
		        this.newDirPathFn = null;
		        if(this.activeFile && this.activeFile.value){
			        this.fileTreeData.forEach((item,index) => {
				        if(this.activeFile.keyId ==item.keyId){
					        if(item.id == 1){
						        this.newDirPathFn =  item.value;
					        }else if(item.id == 2){
						        this.newDirPathFn = file.homeDirFn();
					        }
					        return;
				        }
			        })
			        if(!this.newDirPathFn){
				        if(file.isDir(this.activeFile.value)){
					        this.newDirPathFn = this.activeFile.value;
				        }else{
					        this.newDirPathFn = file.dirnameFn(this.activeFile.value);
				        }
			        }
		        }else{
			        this.newDirPathFn = file.homeDirFn();
		        }
		        if(this.newDirPathFn  == file.homeDirFn()){
			        this.isScan = true;
		        }else{
			        this.isScan = false;
		        }
	        },
	        cancelHintModalFn(){
		        this.setHintInfo({
			        show:false,
			        title:'',
			        message:''
		        })
	        },
	        scanFn(){
		        file.dialogFn((filename)=>{
			        if(filename){
				        this.newDirPathFn = filename
			        }
		        })
	        },
            //设置节点地址
            setProvider(){
                //contractServies.setProvider('http://192.168.9.76:6789')
                try {
                    Juice.app.getAppInfo((res)=>{
                        if(!res.code){
                            contractServies.setProvider(res.data.contractUrl);
                        }
                    })
                } catch (error) {

                }
            },
            getUserInfo(callback){
                //this.user.address='0x00c7d00f41f528794f002de6a8fe72ec35519ae6'
                try {
                    Juice.user.getUserInfo((res)=>{
                        if(!res.code){
                            console.log('Juice.user.getUserInfo',res);
                            contractServies.user.username=res.data.uuid;
                            contractServies.user.address=res.data.address;
                            contractServies.user.type=res.data.type;
                            callback&&callback();
                        }
                    })
                } catch (error) {
                    console.warn('Juice.user.getUserInfo:',error)
                }
            },
            setLastTime(){
                if(ipcRenderer!=null){
                    document.addEventListener('mousemove',(e)=>{
                        ipcRenderer.send('item-last-time',new Date().getTime())
                    });

                    document.addEventListener('keyup',(e)=>{
                        ipcRenderer.send('item-last-time',new Date().getTime())
                    });
                }
            },
//            setIntSol(){
//            	const url = this.getUrl;
//            	if(url && url.length === 0){
//            		let data = [];
//            		const path1 = file.getTemplatePath('example1.sol');
//		            const path2 = file.getTemplatePath('example2.sol');
//            		if(file.isFile(path1)){
//			            data.push({
//				            name: 'example1.sol',
//				            value:path1
//			            })
//                    }
//                    if(file.isFile(path2)){
//			            data.push({
//				            name: 'example2.sol',
//				            value:path2
//			            })
//                    }
//		            this.updateUrl(data);
//                }
//            },
	        setIntSol(){
		        const url = this.getUrl;
		        if(url && url.length === 0){
			        let data = [];
                    const path = file.getTemplatePath();
                    if(file.isDir(path)){
	                    data.push({
		                    name: 'demo',
		                    value:path
	                    })
                    }
			        this.updateUrl(data);
		        }
	        },
	        setStorageFn(){
		        const data = localStorage.getItem('fileData') ? JSON.parse(localStorage.getItem('fileData')) : [];
		        this.setIntSol();
		        if(data.length === 0 &&　this.fileTreeData.length > 0){
		        	const itemFile = file.GetById(this.fileTreeData,2);
		        	if(itemFile){
				        localStorage.setItem('fileData',JSON.stringify(
					        [{
						        name:itemFile.name,
						        value:itemFile.value,
						        keyId: itemFile.keyId,
					        }]
				        ))
                    }
		        }

	        }
        },
        //生命周期函数
        created() {
            this.setProvider();
            this.getUserInfo();
	        this.initUrlFn();
	        this.setStorageFn();
            this.setLastTime();
        },
        beforeMount() {},
        mounted() {
	        this.hotkeysFn();
	        this.updateData([]);
        },
        //监视
        watch: {
	        'showDirNameModal':function(){
		        if(this.showDirNameModal){
			        this.newDirPathFunction();
		        }
	        }
        },
        //组件
        components: {
            comTitle,
            comHeader,
            filesTab,
            deployTab,
            queryTab,
            consoleEle,
            editor
        },
        //过滤器
        filters: {},
        //自定义指令
        directive: {}
    };
</script>

<style lang="less" scoped>
    .index {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }

    .main {
        display: flex;
        flex: 1;
    }

    .tabs {
        width: 48px;
        min-width:48px;
        text-align: center;
        >li {
            margin:20px 0 30px;
            cursor: pointer;
        }
    }

    .tab-box{
        display: flex;
        /*flex-direction:column;*/
        overflow-y:auto;
        border-right:solid 1px #e5e5e5;
    }
    .tab{
        width: 223px;
    }

    .border{
        width: 1px;
        height: 100%;
        cursor: col-resize;
        background-color: transparent;
    }

    .main-right {
        width:0px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .editor {
        /*height: 70%;*/
        flex-grow:1;
        display:flex;
        flex-direction: column;
    }

    .console{
        display: flex;
        flex-direction: column;
        height: 287px;
    }


    .ghostbar{
        width             : 3px;
        opacity           : 0.5;
        position          : absolute;
        cursor            : col-resize;
        z-index           : 9999;
        top               : 50px;
        bottom            : 0;
    }
    .iconfont{
        font-size:24px;
    }
    .menu-def{
        color:rgba(255,255,255,0.7);
    }
    .active{
        color:rgba(255,255,255,1)
    }
    .error-type{
        position: fixed;
        left:50%;
        top:20px;
        margin-left:-100px;
        min-width:200px;
        padding:0 20px;
        height:50px;
        line-height:50px;
        text-indent: 35px;
        background:url(./images/error.png)no-repeat 20px center #fff;
        background-size: 30px 30px;
        border:1px solid #f1f1f1;
        z-index:9999;
    }
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active in below version 2.1.8 */ {
        opacity: 0
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
