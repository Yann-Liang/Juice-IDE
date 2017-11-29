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
                <files-tab class="tab" v-if="filesTabFlag" :style="{width:tabWidth+'px'}"></files-tab>

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
        <div class="ghostbar bgblue" :style="{left:ghostbarLeft}" v-if="ghostbarFlag"></div>
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
    const beautify = require('js-beautify').js_beautify
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
                activeMenu:'1' //当前操作菜单项
            };
        },
        //数组或对象，用于接收来自父组件的数据
        props: {},
        //计算
        computed: {
	        ...mapGetters(['fileTreeData','activeFile','getUrl','editFile','currentName'])
        },
        //方法
        methods: {
	        ...mapActions(['updateRightMenuBlock','saveEditorFile','saveOtherPath','saveAllFile','removeAllFile','queryFileListData'
                ,'updateEditFile','updateUrl','updateCurrentId','removeFileFn','changeShowTipModal','changeShowDeleteModal','changeDeleteFile'
            ,'boolSuccessVisible','boolSearchVisible','boolReplaceVisible','changeShowFileNameModal','changeDirNameModal','setHintInfo','updateData']),

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
                    this.ghostbarLeft = getPosition(event) + 'px'
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
            deleteFile(){

            },
            //设置节点地址
            setProvider(){
                //contractServies.setProvider('http://192.168.9.95:5788')
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
            setIntSol(){
            	const url = this.getUrl;
            	if(url && url.length === 0){
            		const data = [
                        {
                        	name: 'example1.sol',
                            value:'',
                            keyId:file.keyIdFn('')+'example1.sol'
                        },
			            {
				            name: 'example2.sol',
				            value:'',
				            keyId:file.keyIdFn('')+'example2.sol'
			            }
                    ]
		            this.updateUrl(data);
                }
            }
        },
        //生命周期函数
        created() {
            this.setProvider();
            this.getUserInfo();
	        this.initUrlFn();
	        this.setIntSol();
        },
        beforeMount() {},
        mounted() {
	        this.hotkeysFn();
	        this.updateData([]);
        },
        //监视
        watch: {},
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

</style>
