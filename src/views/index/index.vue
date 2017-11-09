<template>
    <div class="index" @mousedown="topFn">
        <com-title></com-title>
        <com-header></com-header>


        <div class="main">
            <ul class="tabs">
                <li @click="filesTab()">文件</li>
                <li @click="compile()">编译</li>
                <li @click="deployTab()">部署</li>
                <li @click="runTab()">运行</li>
            </ul>
            <div class="tab-box">
                <files-tab class="tab" v-if="filesTabFlag" :style="{width:tabWidth+'px'}"></files-tab>
                <deploy-tab class="tab" v-if="deployTabFlag" :style="{width:tabWidth+'px'}"></deploy-tab>
                <run-tab class="tab" v-if="runTabFlag" :style="{width:tabWidth+'px'}"></run-tab>
                <i class="border" v-if="runTabFlag||filesTabFlag||deployTabFlag" @mousedown="mousedown($event)"></i>
            </div>
            <div class="main-right">
                <editor class="editor"></editor>
                <console-ele class="console"></console-ele>
            </div>

        </div>
        <div class="ghostbar" :style="{left:ghostbarLeft}" v-if="ghostbarFlag"></div>
    </div>
</template>

<script>
    //import  from ''
    import comTitle from "@/components/title/";
    import comHeader from "@/components/Header/Header.vue";
    import filesTab from "@/components/tabs/files-tab/";
    import deployTab from "@/components/tabs/deploy-tab/";
    import runTab from "@/components/tabs/run-tab/";
    import consoleEle from "@/components/console/";
    import editor from "@/components/editor/";
    import {mapState, mapActions, mapGetters} from 'vuex';
    import consoleService from '@/services/console/console-service';
    import compileService from '@/services/compile-exe/compile-service';
    import contractServies from '@/services/contract-servies';
    import hotkeys from 'hotkeys-js'
    import file from '@/services/API-file'

    export default {
        //组件名
        name: "index",
        //实例的数据对象
        data() {
            return {
                filesTabFlag: true,
                deployTabFlag: false,
                runTabFlag: false,
                ghostbarFlag:false,
                ghostbarLeft:100,
                tabWidth:223,
            };
        },
        //数组或对象，用于接收来自父组件的数据
        props: {},
        //计算
        computed: {
	        ...mapGetters(['activeFile','getUrl','editFile'])
        },
        //方法
        methods: {
	        ...mapActions(['updateRightMenuBlock','saveEditorFile','saveOtherPath','saveAllFile','removeAllFile','queryFileListData','updateEditFile','updateUrl']),
            filesTab() {
                this.filesTabFlag = !this.filesTabFlag;
                this.deployTabFlag = false;
                this.runTabFlag = false;
            },
            compile() {
                this.filesTabFlag = false;
                this.deployTabFlag = false;
                this.runTabFlag = false;
                compileService.compiler();
            },
            deployTab() {
                this.deployTabFlag = !this.deployTabFlag;
                this.filesTabFlag = false;
                this.runTabFlag = false;
            },
            runTab() {
                this.runTabFlag = !this.runTabFlag;
                this.deployTabFlag = false;
                this.filesTabFlag = false;
            },
            hiddenTabs(){
                this.runTabFlag = false;
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
		        hotkeys('ctrl+a', (event,handler)=>{
			        alert('ctrl+n');
			        this.newFile();
		        });

		        // 新建文件夹
		        hotkeys('ctrl+q', (event,handler)=>{
			        alert('ctrl+w');
			        this.newDir();
		        });

		        // 导入本地文件
		        hotkeys('ctrl+shift+o', (event,handler)=>{
			        this.exportFile('file')
			        alert('ctrl+shift+o');
		        });

		        // 导入本地文件夹
		        hotkeys('ctrl+o', (event,handler)=>{
			        alert('ctrl+o');
			        this.exportFile('dir')
		        });

		        // 保存
		        hotkeys('ctrl+s', (event,handler)=>{
			        console.log('ctrl+s')
			        this.saveEditorFile()
		        });

		        // 另存为
		        hotkeys('ctrl+shift+s', (event,handler)=>{
			        this.saveOtherPath(1)
		        });

		        // 全部保存
		        hotkeys('ctrl+alt+s', (event,handler)=>{
			        this.saveAllFile();
		        });

		        // 删除
		        hotkeys('ctrl+delete', (event,handler)=>{
			        alert('ctrl+delete');
		        });

		        // 删除所有文件
		        hotkeys('ctrl+shift+delete', (event,handler)=>{
			        alert('ctrl+shift+delete');
			        this.removeAllFile();
		        });

	        },
	        topFn(){
		        this.updateRightMenuBlock(false);
            },
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
		        this.updateRightMenuBlock(false);
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
            initUrlFn(){
	        	let data = localStorage.getItem('dirPath') ? JSON.parse(localStorage.getItem('dirPath')): [];
	            data = data.filter((item,index)=>{
		            if(file.exists(item.value)){
			            return true;
		            }
                });
	            this.updateUrl(data)
            }
        },
        //生命周期函数
        created() {
        	this.initUrlFn();
            contractServies.setProvider('http://10.10.8.202:6789')
        },
        beforeMount() {},
        mounted() {
	        this.hotkeysFn();
        },
        //监视
        watch: {},
        //组件
        components: {
            comTitle,
            comHeader,
            filesTab,
            deployTab,
            runTab,
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
        background: #0b8aee;
        color: #fff;
        text-align: center;
        >li {
            cursor: pointer;
        }
    }

    .tab-box{
        display: flex;
        flex-direction:column;
        overflow-y:auto;
    }
    .tab{
        width: 223px;

    }

    .border{
        width: 1px;
        height: 100%;
        background:#0b8aee;
        cursor: col-resize;
        //border-right: 1px solid ;
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
        background-color  : #0b8aee;
        opacity           : 0.5;
        position          : absolute;
        cursor            : col-resize;
        z-index           : 9999;
        top               : 100px;
        bottom            : 0;
    }

</style>