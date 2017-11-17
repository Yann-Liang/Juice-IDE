<template>
    <div class="header bgwhite info no-chose">
        <div>
            <ul class="list" style="cursor:default" @click.stop='setHeaderTab($event)'>
                <li>
                    文件
                    <!-- <div v-show="visible" ref="filedata" style="background:#000">弹出层</div> -->
                    <!-- <file-data :fileVisible="fileVisible" ref="filedata"></file-data> -->
                    <ul v-show='fileVisible' ref="filedata" class="bgwhite shadow xwidth">
                        <li v-for="item in fileData" :key="item.keys" @mouseenter="showActive(item.keys)" @mouseleave="removeActive()"  :data-id="item.id" @click.stop="clickFileEvent($event)" :class="{'same': iSame,active: activeClass == item.keys}">
                            <i class="default"  :data-id="item.id">{{item.ZH}}</i>
                            <span :data-id="item.id" class="dark">{{item.keys}}</span>
                        </li>
                    </ul>
                </li>
                <li>
                    编辑
                    <ul v-show='editVisible' ref="editdata" class="bgwhite shadow">
                        <li v-for="item in editData"  :key="item.keys" @mouseenter="showActive(item.keys)" @mouseleave="removeActive()" :class="{'same': iSame,active: activeClass == item.keys}" :data-id="item.id" @click.stop="clickEditEvent($event)">
                            <i class="default"  :data-id="item.id">{{item.ZH}}</i>
                            <span :data-id="item.id" class="darker">{{item.keys}}</span>
                        </li>
                    </ul>
                </li>
                <li @click="help">
                    帮助
                </li>
            </ul>

        </div>
    </div>
</template>
<script>
	import {mapState, mapActions, mapGetters} from 'vuex';
    import file from '@/services/API-file'
    const beautify = require('js-beautify').js_beautify,
        {shell} = require('electron');

    export default {
        name: 'header',
        data() {
            return {
                fileVisible:false,
                editVisible:false,
                iSame:true,
                activeClass:"",
                fileData:[
                    {
                        id:"1",
                        ZH:"新建文件",
                        keys:"Ctrl+N",
                    },
                    {
                        id:"2",
                        ZH:"新建文件夹",
                        keys:"Ctrl+W",
                    },
                    {
                        id:"3",
                        ZH:"导入本地文件",
                        keys:"Ctrl+Shift+O",
                    },
                    {
                        id:"4",
                        ZH:"导入本地文件夹",
                        keys:"Ctrl+O",
                    },
                    {
                        id:"5",
                        ZH:"保存",
                        keys:"Ctrl+S",
                    },
                    {
                        id:"6",
                        ZH:"另存为",
                        keys:"Ctrl+Shift+S",
                    },
                    {
                        id:"7",
                        ZH:"全部保存",
                        keys:"Ctrl+Alt+S",
                    },
                    {
                        id:"8",
                        ZH:"删除",
                        keys:"Ctrl+Delete",
                    },
                    {
                        id:"9",
                        ZH:"删除所有文件",
                        keys:"Ctrl+Shift+Del",
                    },
                ],
                editData:[
                    {
                        id:"1",
                        ZH:"撤销",
                        keys:"Ctrl+Z",
                    },
                    {
                        id:"2",
                        ZH:"恢复",
                        keys:"Ctrl+Y",
                    },
                    {
                        id:"3",
                        ZH:"复制",
                        keys:"Ctrl+C",
                    },
                    {
                        id:"4",
                        ZH:"剪切",
                        keys:"Ctrl+X",
                    },
                    {
                        id:"5",
                        ZH:"粘贴",
                        keys:"Ctrl+V",
                    },
                    {
                        id:"6",
                        ZH:"查找",
                        keys:"Ctrl+F",
                    },
                    {
                        id:"7",
                        ZH:"替换",
                        keys:"Ctrl+H",
                    },
                    {
                        id:"8",
                        ZH:"格式化",
                        keys:"Ctrl+L",
                    },
                ]

            }
        },
        props: {

        },
        //计算
        computed: {
            ...mapGetters(['fileTreeData','editor','copyText','activeFile','getUrl','editFile','currentName'])
        },
        methods: {
	        ...mapActions(['saveEditorFile','boolSearchVisible','boolReplaceVisible','updateCopyText','updateRightMenuBlock','saveOtherPath','saveAllFile','removeAllFile','changeShowTipModal','queryFileListData','updateEditFile','updateUrl','boolSuccessVisible','updateCurrentId','removeFileFn','changeShowDeleteModal','changeDeleteFile',]),

            setHeaderTab:function(e){
                if(e.target.innerText=='文件'){
                    console.log('文件')
                    // this.fileVisible=true;
                    this.editVisible=false;
                    this.fileVisible ? this.hideFile() : this.showFile();
                    // this.visible ? this.hide() : this.show()
                }else if(e.target.innerText=='编辑'){
                    console.log('编辑')
                    // this.editVisible=true;
                    this.editVisible ? this.hideEdit() : this.showEdit()
                    this.fileVisible=false;
                }else{
                    console.log(3);
                    this.editVisible=false;
                    this.fileVisible=false;

                }
            },
            showFile () {
                this.fileVisible = true
                document.addEventListener('click', this.hidePanelFile, false)
            },
            hideFile () {
                this.fileVisible = false
                document.removeEventListener('click', this.hidePanelFile, false)
            },
            hidePanelFile (e) {
                console.log(this.$refs.filedata)
                console.log(this.$refs.filedata.contains(e.target));
                if (!this.$refs.filedata.contains(e.target)) {
                    this.hideFile()
                }
            },
            showEdit () {
                this.editVisible = true
                document.addEventListener('click', this.hidePanelEdit, false)
            },
            hideEdit () {
                this.editVisible = false
                document.removeEventListener('click', this.hidePanelEdit, false)
            },
            hidePanelEdit (e) {
                console.log(this.$refs.editdata)
                console.log(this.$refs.editdata.contains(e.target));
                if (!this.$refs.editdata.contains(e.target)) {
                    this.hideEdit();
                }
            },
            //鼠标悬停效果
            showActive: function(name) {
              this.activeClass = name
            },
            //鼠标离开效果
            removeActive: function(){
                this.activeClass = ""
            },
            //文件每个li的点击事件
            clickFileEvent:function(e){
                var _this = this;
                this.fileVisible = false
                console.log(e.target.getAttribute("data-id"));
                // switch(e.target.innerText){
                //     case '保存':
                //         this.saveEditorFile();
                //         break;
                // }
                switch(e.target.getAttribute("data-id")){
                    case '1':
                    case 1:
                        //新建文件
                        _this.newFile();
                        break;
                    case '2':
                    case 2:
                        //新建文件夹
                        _this.newDir();
                        break;
                    case '3':
                    case 3:
                        _this.exportFile('file');//导入本地文件
                        break;
                    case '4':
                    case 4:
                        //导入本地文件夹
                        _this.exportFile('dir')
                        break;
                    case '5':
                    case 5:
                        _this.saveEditorFile(_this.success);//保存
                        break;
                    case '6':
                    case 6:
                        //另存为
                        _this.saveOtherPath(1)
                        break;
                    case '7':
                    case 7:
                        //全部保存
                        _this.saveAllFile(_this.success);
                        break;
                    case '8':
                    case 8:
                        if(_this.activeFile){
                            _this.changeDeleteFile(_this.activeFile)
                            _this.changeShowDeleteModal(true);
                        };//删除
                        break;
                    case '9':
                    case 9:
                        //删除所有文件
//                        _this.removeAllFile();
	                    _this.changeShowTipModal(true)
                        break;
                }
            },
            //代码格式化
            format:function(){
                console.log('设置格式化')
                this.editor.setValue(beautify(this.editor.getValue()),1);
                //引用了js-beautify库
            },
            //编辑每个li的点击事件
            clickEditEvent:function(e){
                var _this = this;
                this.editVisible = false
                console.log(e.target.getAttribute("data-id"));
                switch(e.target.getAttribute("data-id")){
                    case '1':
                    case 1:
                    console.log(_this.editor.commands.commands.undo.exec(_this.editor))
                        _this.editor.commands.commands.undo.exec(_this.editor);//撤销
                        break;
                    case '2':
                    case 2:
                    console.log(_this.editor.commands.commands.redo.exec(_this.editor))
                        _this.editor.commands.commands.redo.exec(_this.editor);//恢复
                        break;
                    case '3':
                    case 3:
                        console.log(_this.editor.getCopyText())
                        _this.updateCopyText(_this.editor.getCopyText());//复制
                        // _this.editor.onCopy();

                        break;
                    case '4':
                    case 4:
                        _this.editor.commands.commands.cut.exec(_this.editor);//剪切
                        break;
                    case '5':
                    case 5:
                        _this.editor.commands.commands.paste.exec(_this.editor,_this.copyText)
                        // _this.editor.insert(_this.copyText);//粘贴
                        // _this.editor.onPaste(_this.copyText)
                        break;
                    case '6':
                    case 6:
                        _this.boolSearchVisible(true);//查找
                        break;
                    case '7':
                    case 7:
                        _this.boolReplaceVisible(true);//替换
                        break;
                    case '8':
                    case 8:
                        _this.format();//格式化
                        break;
                }
            },
            help(){
                shell.openExternal('http://www.juzhen.io/index.php');
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
                if(this.activeFile.value){
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
                            }
                        })
                    });
                }else{
                    file.newFile(this.activeFile.value,name,(res)=>{
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
        },
        beforeDestroy () {
            this.hideFile();
            this.hideEdit();
        },
        created() {
            // alert(111)
        },
        //组件
        components: {

        },

    }
</script>

<style lang="less" scoped>
@height:30px;
   .header{
       height: @height;
       display: flex;
       flex-direction:row;
       border-bottom:solid 1px #e5e5e5;
       .img{
        img{
            display: block;
            height:100%;
        }
       }
       .list{
        display: flex;
        flex-direction:row;
        height:@height;
        padding-left:20px;
        >li{
            line-height: @height;
            margin-right:126px;
            position: relative;
            ul{
                position: absolute;
                width:150px;
                top:@height;
                left:0px;
                z-index:1000;
                .same{
                    height:30px;
                    line-height: 30px;
                    padding:0 18px;
                    span{
                        float:right;
                    }
                    i{
                        font-style: normal;
                    }
                }
            }
            .xwidth{
                width:220px;
            }
        }
       }
   }
</style>