<template>
    <div class="">
        <div class="file-tab bggray">
            <div class="tabs" ref='tabs'>
                <div class='scroll-bar left-bar info' ref='leftbar' @click='scrollLeft' >
                    <i>&lt;</i>
                </div>
                <ul class='files white' ref='files'>
                    <li class='file' v-for="(item,index) in fileData" :key='item.name' :class="{'li-active':select===index}"  v-on:click="selectProp(index,item)">
                        <span>{{item.name}}</span>
                        <span class="remove" @click.stop="remove(index)" v-if='cha'>X</span>
                        <span class="remove" v-if='dian'>...</span>
                    </li>
                    <li class='new-file' @click='newFile'>+</li>
                </ul>
                <!-- <div class='new-file' @click='newFile'>+</div> -->
                <div class='scroll-bar right-bar info' @click='scrollRight' ref='rightbar'>
                    <i>&gt;</i>
                </div>
            </div>
            <div class="tools">
                <div class="tool">
                    <span class='icon icon-save' @click='save' title="保存当前文件"></span>
                    <span class="icon icon-search" @click='search' title="搜索"></span>
                    <span class='icon icon-format' @click='format' title="代码格式化"></span>
                    <span class='icon icon-big-font' @click='increase' title="字体放大"></span>
                    <span class='icon icon-sm-font' @click='decrease' title="字体缩小"></span>
                    <span class='icon icon-close-all' @click='close' title="关闭所有窗口"></span>
                </div>

                <div class="replace-model" v-if='replaceVisible'>
                <span>
                    form:<input type="text" name="" v-model='fromValue' @input='fromSearch'/>
                </span>
                    <span>
                    to  :<input type="text" name="" v-model="toValue"/>
                </span>
                    <span @click='replaceSign' >单个替换</span>
                    <span @click='replaceAll'>全部替换</span>
                    <span @click='offReplace'>x</span>
                </div>
            </div>
            <div class="search-model shadow" v-if='searchVisible'>
                <div class='search-content'>
                    <span>
                        <input class="dark" type="text" v-model='inputValue' @keyup.enter="onSearchDown" @keyup.up="onSearchUp" @keyup.down="onSearchDown" placeholder="搜索" @input='onSearch' style="width:300px;">
                    </span>
                    <span class="btn btn-info">查找</span>
                    <!--<span @click='onSearchUp'>↑</span>-->
                    <!--<span @click='onSearchDown'>↓</span>-->
                    <!--这里的上下切换，换成了input的键盘事件-->
                    <span @click="offSearch" class="icon icon-close"></span>
                </div>
            </div>
        </div>
        <v-editor :currentView='currentView' :value='value' :keyId="keyId" :name='name' :searchValue='searchValue' keep-alive  class='javascript-editor' ref="childMethod" v-if='editorVisible' @findFunction='findFunction' @replaceFunction='replaceFunction'></v-editor>
        <div class="tips default" v-if='tipsVisible'>
            请在文件管理器面板中点击打开一个文件
        </div>
    </div>
</template>

<script>
    //import  from ''
    //brace
    import {mapState, mapActions, mapGetters} from 'vuex';
    import Editor from '@/components/editor-panel/panel'
    import file from '@/services/API-file'
    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
                cha:true,
                dian:false,
                tipsVisible:false,
                editorVisible:false,
                inputValue:"",
                searchValue:"",
                // searchVisible:false,
                fromValue:"",
                toValue:"",
                // replaceVisible:false,
                vistual:200,
                activeClass:"",
                fileTotal:10,
                select:"",
                currentView:"",
                value:"",
                name:"",
                keyId:""
            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {
            ...mapGetters(['editFile','fileTreeData','activeFile','getUrl','saveCode','editData','fileData','editor','searchVisible','replaceVisible'])
        },
        //方法
        methods: {
            ...mapActions(['queryFileListData','updateUrl','updateEditFile','updateData','updateTreeData','saveEditorFile','changeFileData','boolSearchVisible','boolReplaceVisible']),
            //放大
            increase:function(){
                // this.$refs.childMethod.increase();
                this.editor.setFontSize(this.editor.getFontSize() + 1)
            },
            //缩小
            decrease:function(){
                this.$refs.childMethod.decrease();
            },
            //
            keydown:function(){
                document.onKeydown = function(){
                    if (event.ctrlKey && window.event.keyCode==67){
                        return true;
                    }
                }
            },
            //copy事件
            copy:function(event){
                console.log('发生复制事件');
                console.log(this.editor)
                // this.editor.commands.bindKeys({ 'ctrl-z': 'undo' })
                this.editor.onCommandKey()
                console.log()
            },
            //paste事件
            paste:function(event){
                // this.$refs.childMethod.paste();
                if(event.ctrlKey && window.event.keyCode == 86){
                    return true;
                }
            },
            //撤销事件
            repeal:function(){
                console.log(this.editor);
                this.editor.commands.commands.undo.exec(this.editor);
            },
            //恢复事件
            renew:function(){
                this.editor.commands.commands.redo.exec(this.editor);
            },
            //剪切事件
            cut:function(){
                this.editor.commands.commands.cut.exec(this.editor);
            },
            findFunction:function(bool){
                console.log(bool)
                this.boolSearchVisible(bool);
                // this.searchVisible = bool;
            },
            replaceFunction:function(bool){
                this.boolReplaceVisible(bool);
                // this.replaceVisible = bool;
            },
            //点击搜索
            search:function(){
                //弹窗出现
                this.boolSearchVisible(true);
                // this.searchVisible = !this.searchVisible;
            },
            //全局搜索
            onSearch:function(){
                console.log('diandiandian',this.inputValue)
                this.searchValue = this.inputValue;
                this.$refs.childMethod.onSearch(this.inputValue);
            },
            //向上搜索
            onSearchUp:function(){
                this.$refs.childMethod.onSearchUp();
            },
            //向下搜索
            onSearchDown:function(){
                this.$refs.childMethod.onSearchDown();
            },
            //关闭弹窗
            offSearch:function(){
                //弹窗关闭
                this.boolSearchVisible(false);
                // this.searchVisible = false;
                this.inputValue = "";
                this.searchValue = "";
            },
            fromSearch:function(){
                this.$refs.childMethod.onSearch(this.fromValue);
            },
            replace:function(){
                this.boolReplaceVisible(true);
                // this.replaceVisible = !this.replaceVisible;
            },
            //单个替换
            replaceSign:function(){
                // this.$refs.childMethod.onSearch(this.fromValue);
                this.$refs.childMethod.replaceSign(this.fromValue,this.toValue);
            },
            //全部替换
            replaceAll:function(){
                this.$refs.childMethod.replaceAll(this.fromValue,this.toValue);
            },
            //关闭替换弹窗
            offReplace:function(){
                this.boolReplaceVisible(false);
                // this.replaceVisible = false;
                this.fromValue = "";
                this.toValue = "";
            },
            //保存当前文件
            save:function(){
                console.log('保存当前文件')
                this.saveEditorFile();
            },
            //代码格式化
            format:function(){
                console.log('代码格式化');
                this.$refs.childMethod.format();
            },
            //向右滑动
            scrollRight:function(e){
                var rightArrow = this.$refs.rightbar;
                var leftArrow = this.$refs.leftbar;
                var hiddenLength = this.$refs.files.offsetWidth - this.$refs.tabs.offsetWidth;
                var currentLeft = this.$refs.files.offsetLeft || 20;
                var hiddenRight = hiddenLength + currentLeft;
                console.log(hiddenLength,currentLeft,hiddenRight);
                if(hiddenRight > 0){
                    if(hiddenRight > this.vistual){
                       this.$refs.files.style.left = `${currentLeft - this.vistual}px`
                    }else{
                        this.$refs.files.style.left = `${currentLeft - hiddenRight - 100}px`
                    }
                }
            },
            //向左滑动
            scrollLeft:function(){
                var leftArrow = this.$refs.leftbar;
                var rightArrow = this.$refs.rightbar;
                var currentLeft = this.$refs.files.offsetLeft || 20;
                console.log(currentLeft)
                if(currentLeft < 0){
                    if(currentLeft < -this.vistual){
                       this.$refs.files.style.left = `${currentLeft + this.vistual}px`
                    }else{
                        this.$refs.files.style.left = `${currentLeft - currentLeft + 20}px`
                    }
                }
            },
            //切换tab
            selectProp: function (index,item) {
                this.$refs.childMethod.loseBlur();
                this.select = index;
                this.currentView = index;
                this.value = item.value;
                this.name = item.name;
                this.keyId = item.keyId;
	            console.log('切换tab现在的keyId:'+this.keyId)
                this.updateEditFile({
	                name:this.name,
	                value:this.value,
                    keyId:this.keyId
                })
                // this.$refs.childMethod.change();
            },
            //关闭当前窗口
            remove:function(index){
                console.log(index);
                /*
                    如果是别的地方依旧高亮，直接删除别的tab标签的话，依旧还显示为别的地方的高亮，如果是当前地方高亮，删除当前，高亮显示为下一个 如果是最后一个地方高亮，删除最后一个tab标签，高亮显示为上一个
                */
                //关闭窗口时，提示用户是否已保存

                console.log("数组长度")
                console.log(this.fileData.length)
                if(this.fileData.length == 1){
                    //提示用户打开文件
                    this.editorVisible = false;
                    this.tipsVisible = true;
                    this.value = "readonly";
	                this.changeFileData([]);
                }else{
                    console.log("hahahahah")
                    this.editorVisible = true;
                    this.tipsVisible = false;
                    if(this.select == index){
                        console.log('高亮与删除相同')
                        let result = this.fileData;
	                    result.splice(index,1);
	                    this.changeFileData(result);
                        //如果当前高亮为0
                        if(this.select == 0){
                            this.select = index ;
                            this.currentView = index ;
                            this.value = this.fileData[index].value;
                            this.name = this.fileData[index].name;
	                        this.keyId = this.fileData[index].keyId;
                        }else{
                            this.select = index - 1;
                            this.currentView = index - 1;
                            this.value = this.fileData[index - 1].value;
                            this.name = this.fileData[index - 1].name;
                            this.keyId = this.fileData[index - 1].keyId;

                        }
                    }else if(this.select > index){
                        console.log('高亮>删除相同')
	                    let result = this.fileData;
	                    result.splice(index,1);
	                    this.changeFileData(result);
                        this.select = this.select - 1;
                        this.currentView = this.select - 1;
                        this.value= this.fileData[this.select].value;
                        this.name = this.fileData[this.select].name;
	                    this.keyId = this.fileData[this.select].keyId;
                    }else if(this.select < index){
                        console.log('高亮<删除相同')
	                    let result = this.fileData;
	                    result.splice(index,1);
	                    this.changeFileData(result);
                        this.select = this.select;
                        this.currentView = this.select;
                        this.value = this.fileData[this.select].value;
                        this.name = this.fileData[this.select].name;
	                    this.keyId = this.fileData[this.select].keyId;
                    }
                }
            },
            //关闭所有窗口
            close:function(){
                this.editorVisible = false;
                this.tipsVisible = true;
                this.value = "readonly";
	            this.changeFileData([]);
            },
            //新建文件
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
			                url.push({value:'',name:file.uffixName(name)});
			                this.updateUrl(url);
			                this.updateEditFile({
				                name:file.uffixName(name),
				                value:res.value,
				                keyId:res.keyId
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
            },
            //初始化fileData
            init:function(){
                /*
                    判断fileData是否为空，
                    为空：则不显示tab，并且编辑区显示为不可编辑状态     不为空：则默认显示第一个为高亮，且编辑区显示的为高亮tab下的代码
                */
                if(this.fileData.length == 0){
                    //不显示tab
                    this.select = "";
                    this.currentView = "";
                    this.value = "readonly";
                    this.name='';
                    this.editorVisible = false;
                    this.tipsVisible = true;
                }else{
                    //默认显示第一个高亮，且编辑区显示的为高亮tab下的代码
                    this.select = 0;
                    this.currentView = 0;
                    this.value = this.fileData[0].value;
                    this.name = this.fileData[0].name;
                    this.keyId = this.fileData[0].keyId;
                    this.editorVisible = true;
                    this.tipsVisible = false;
                }
            },
            //push对象进数组
            pushArray:function(){
                this.editorVisible = true;
                this.tipsVisible = false;
                //遍历已有的数组，查看是否已经有相同，有的话则高亮显示当前，没有则push进数组并高亮显示当前
                let blo = false;
                this.fileData.forEach((item,index)=>{
                    if(item.keyId == this.editFile.keyId){
                        console.log('不push进数组')
                        // console.log()
                        //为true 高亮显示当前，并且不push
                        this.select = index;
                        this.currentView = index;
                        this.value = this.editFile.value;
                        this.name = this.editFile.name;
                        this.keyId = this.editFile.keyId;
                        blo = true;
                    }
                });
                 //为false，push进数组，并高亮显示数组最后一个
                if(blo == false){
                    console.log('push进数组');
	                let data = this.fileData;
	                data.push(this.editFile);
	                this.changeFileData(data);
                    this.select = this.fileData.length - 1;
                    this.currentView = this.fileData.length - 1;
                    this.value = this.fileData[this.fileData.length - 1].value;
                    this.name = this.fileData[this.fileData.length - 1].name;
	                this.keyId = this.fileData[this.fileData.length - 1].keyId;
                }
            }
        },
        //生命周期函数
        created() {
            this.init();
            document.body.oncopy = function(){
                return true;
            },
            document.onselectstart = function(){
                //return false;
            }
        },
        beforeMount() {

        },
        mounted() {

            // console.log(this.saveCode)
        },
        //监视
        watch: {
            editFile:function(){
                this.pushArray();

                // 保存当前激活的文件
//                console.log(this.$refs.childMethod.getValue());
//                const editorData = {
//	                value: this.editFile.value,
//	                name: this.editFile.name,
//	                source: this.$refs.childMethod.getValue()
//                }
//                console.log(editorData);
//	            this.updateActiveEditor(editorData);




                // this.$refs.childMethod.initChange();
                // this.$refs.childMethod.change();
            },

        },
        //组件
        components: {
            "v-editor":Editor
        },
        //过滤器
        filters:{

        },
        //自定义指令
        directive:{

        }
    }
</script>

<!--
    作者：liangyanxiangde@163.com
    时间：2017-03-27
    描述：统一使用less,局部样式
-->
<style lang="less" scoped>
    @import "../../less/modules/theme.less";
.file-tab{
    display:flex;
    align-content: space-between;
    height:40px;
    line-height:40px;
    position: relative;
    .tabs{
        flex-grow: 1;
        position: relative;
        padding-right:20px;
        overflow-x:hidden;
        .scroll-bar{
            position: absolute;
            width:20px;
            top:0;
            z-index:999;
            font-size:16px;
            cursor: pointer;
        }
        .left-bar{
            left:0;
        }
        .right-bar{
            right:0;
        }
        .files{
            display: flex;
            flex-wrap:nowrap;
            flex-direction:row;
            justify-content:flex-start;
            position: absolute;
            left:20px;
            overflow:hidden;
            cursor: pointer;
            li{
                padding:0 10px;
                border-right:1px solid #fff;
                display: flex;
                flex-wrap:nowrap;
                flex-direction:row;
                justify-content:flex-end;
                background-color:#c0c0c0;
                span{
                    display: inline-block;
                    white-space: nowrap;
                    &:last-child{
                        // float:right;
                        padding:0 10px;
                        /*&:hover{*/
                            /*background-color:gray*/
                        /*}*/
                    }
                }
            }
            .new-file{
                margin:7px 0 0 10px;
                display:inline-block;
                padding:0;
                width:24px;
                height:24px;
                line-height:24px;
                text-align: center;
                border-radius: 24px;
                background-color:#838d93;
            }
            .li-active{
                background-color: #999;
                font-weight: bold;
                border-bottom: 0 none;
            }
        }

    }
}
.tools{
    width:227px;
    position: relative;
    .tool{
        text-align: right;
        span{
            display: inline-block;
            cursor: pointer;
        }
    }
    .replace-model{
        width: 480px;
        height: 40px;
        padding: 5px;
        border-radius: 10px;
        background-color: #000;
        position: absolute;
        top: 30px;
        left: 50%;
        z-index: 1000000;
        margin-left: -240px;
    }
}
.search-model{
    position: absolute;
    top: 40px;
    left: 50%;
    z-index: 100000;
    margin-left: -240px;
    padding: 0 10px;
    width: 440px;
    height: 60px;
    line-height: 60px;
    border:solid 1px #e5e5e5;
    border-radius: 3px;
    input{
        padding-left:10px;
        width:300px;
        height:38px;
        line-height:38px;
        border:solid 1px #bfbfbf;
        &:focus{
            outline:none;
            border:solid 1px @blue;
         }
    }
    .btn{
        margin:0 10px;
        display: inline-block;
        width:60px;
        height:38px;
        line-height:38px;
        text-align: center;
        border-radius:3px;
    }
    .icon-close{
        position:absolute;
        right:10px;
        top:23px;
        margin-right:0;
    }
}
.javascript-editor{
    width:100%;
    flex-grow:1;
}

.tips{
    display: -webkit-flex;
    align-items:center;
    justify-content:center;
    width:100%;
    flex-grow:1;

    // background-color:#000;
}
.icon{
    margin-right:14px;
    display:inline-block;
    width:16px;
    height:40px;
}
.icon-close{
    height:16px;
    background: url('./images/close.png') no-repeat center center;
}
.icon-save{
    background: url('./images/save_file.png') no-repeat center center;
}
.icon-search{
    background: url('./images/search.png') no-repeat center center;
}
.icon-format{
    width:20px;
    background: url('./images/formatting.png') no-repeat center center;
}
.icon-big-font{
    background: url('./images/big_font_widget.png') no-repeat center center;
}
.icon-sm-font{
    background: url('./images/decrease_font_size.png') no-repeat center center;
}
.icon-close-all{
    background: url('./images/close_all_libraries.png') no-repeat center center;
}
</style>