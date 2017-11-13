<template>
    <div class="">
        <div class="file-tab bggray">
            <div class="tabs" ref='tabs'>
                <div class='scroll-bar left-bar' ref='leftbar' @click='scrollLeft' >
                    <i class='el-icon-d-arrow-left darker'></i>
                </div>
                <ul class='files white' ref='files'>
                    <li class='file' v-for="(item,index) in fileData" :key='item.name' :class="{'li-active':select===index}"  v-on:click="selectProp(index,item)">
                        <span>{{item.name}}</span>
                        <span class="remove" @click.stop="remove(index,item.keyId)" v-if='cha'>X</span>
                        <span class="remove" v-if='dian'>...</span>
                    </li>
                    <li class='new-file' @click='newFile'><i class="iconfont darker">&#xe621;</i></li>
                </ul>
                <div class='scroll-bar right-bar' @click='scrollRight' ref='rightbar'>
                    <i class='el-icon-d-arrow-right darker'></i>
                </div>
            </div>
            <div class="tools">
                <div class="tool">
                    <span @click.prevent='save' title="保存当前文件"><i class="iconfont info">&#xe62a;</i></span>
                    <span @click.prevent='search' title="搜索"><i class="iconfont info">&#xe62b;</i></span>
                    <span @click.prevent='format' title="代码格式化"><i class="iconfont info">&#xe624;</i></span>
                    <span @click.prevent='increase' title="字体放大"><i class="iconfont info">&#xe61d;</i></span>
                    <span @click.prevent='decrease' title="字体缩小"><i class="iconfont info">&#xe622;</i></span>
                    <span @click.prevent='close' title="关闭所有窗口"><i class="iconfont info">&#xe61e;</i></span>
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
                    <span @click="offSearch" class="close-search"><i class="iconfont dark">&#xe61f;</i></span>
                </div>
            </div>
            <div class="replace-model" v-if='replaceVisible'>
                <div class="replace-content">
                    <ul class="left">
                        <li>
                            <label for="">form:</label>
                            <input type="text" name="" v-model='fromValue' @input='fromSearch'/>
                        </li>
                        <li>
                            <label for="">to:</label>
                           <input type="text" name="" v-model="toValue"/>
                        </li>
                    </ul>
                    <ul class="center">
                        <li>
                            <span @click='replaceSign' class='btn-info'>Replace</span>
                        </li>
                        <li>
                            <span @click='replaceAll' class='btn-info'>ReplaceAll</span>
                        </li>
                    </ul>
                    <ul class="right">
                        <li @click='offReplace' class="close-search">
                            <i class="iconfont dark">&#xe61f;</i>
                        </li>
                    </ul>

                </div>
            </div>
            <div class="popup" v-if='askVisible'>
                <div class="mask">
                   <div class="ask-model">
                        <div class="ask-content">
                            <ul>
                                <li><i class="iconfont dark" @click='calcel'>&#xe61f;</i></li>
                                <li>此文件已经被更改过，确定关闭？</li>
                                <li>
                                    <span class='btn-info' @click='yes($event)' :data-index='dataindex' :data-arr='dataarr'>是</span>
                                    <span class='btn-info' @click='no($event)' :data-index='dataindex' :data-arr='dataarr'>否</span>
                                    <span class='btn-info' @click='calcel' :data-index='dataindex'>取消</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="popup"  v-if='asksVisible'>
                <div class="mask">
                    <div class="ask-model">
                        <div class="ask-content">
                            <ul>
                                <li><i class="iconfont dark" @click='calcels'>&#xe61f;</i></li>
                                <li>有尚未保存的文件，确定要关闭所有窗口吗？</li>
                                <li>
                                    <span class='btn-info' @click='yess($event)'>是</span>
                                    <span class='btn-info' @click='nos($event)'>否</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <v-editor :currentView='currentView' :value='value' :keyId="keyId" :name='name' :searchValue='searchValue' keep-alive  class='javascript-editor' ref="childMethod" v-if='editorVisible' @findFunction='findFunction' @replaceFunction='replaceFunction'></v-editor>
        <div class="tips default" v-if='tipsVisible'>
            请在文件管理器面板中点击打开一个文件
        </div>
        <!-- 弹窗 -->

    </div>
</template>

<script>
    //import  from ''
    //brace
    import {mapState, mapActions, mapGetters} from 'vuex';
    import Editor from '@/components/editor-panel/panel'
    import file from '@/services/API-file'
    // import {remote} from 'electron'
    // const globalShortcut = remote.globalShortcut
    const {globalShortcut} = require('electron').remote

    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
                dataarr:[],
                dataindex:"",
                cha:true,
                dian:false,
                tipsVisible:false,
                editorVisible:false,
                askVisible:false,
                asksVisible:false,
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
            ...mapGetters(['editFile','fileTreeData','activeFile','getUrl','saveCode','editData','fileData','editor','searchVisible','replaceVisible','removeData'])
        },
        //方法
        methods: {
            ...mapActions(['queryFileListData','updateUrl','updateEditFile','updateData','updateTreeData','saveEditorFile','changeFileData','boolSearchVisible','boolReplaceVisible','saveAllFile']),
            //放大
            increase:function(){
                // this.$refs.childMethod.increase();
                console.log('放大')
                this.editor.setFontSize(this.editor.getFontSize() + 1)
            },
            //缩小
            decrease:function(){
                console.log('缩小')
                this.editor.setFontSize(this.editor.getFontSize() - 1)
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
                console.log(this.name)
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
                this.select = index;
                this.currentView = index;
                this.value = item.value;
                this.name = item.name;
                this.keyId = item.keyId;
	            console.log('切换tab现在的keyId:'+this.keyId+this.name);
                this.updateEditFile({
	                name:this.name,
	                value:this.value,
                    keyId:this.keyId
                })
                // this.$refs.childMethod.change();
            },
            //效果切换
            activeTab:function(index){
                console.log('index',index)
                console.log('this.select',this.select);
                if(this.fileData.length == 1){
                    //提示用户打开文件
                    this.editorVisible = false;
                    this.tipsVisible = true;
                    this.value = "readonly";
                    this.changeFileData([]);
                }else{
                    this.editorVisible = true;
                    this.tipsVisible = false;
                    if(this.select == index){
                        console.log('高亮=删除')
                        let result = this.fileData;
                        result.splice(index,1);
                        this.changeFileData(result);
                        //如果当前高亮为0
                        if(this.select == 0){
                            // debugger;
                            this.select = index;
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
                    this.updateEditFile({
                        name:this.name,
                        value:this.value,
                        keyId:this.keyId
                    })
                }

            },
            //yes
            yes:function(e){
                var index = e.target.getAttribute("data-index");
                var arr = e.target.getAttribute("data-arr");
                console.log("当前关闭窗口的位置以及信息",index+arr);
                arr = JSON.parse(arr);
                if(this.select == index){
                    console.log('当前关闭和当前高亮显示一样')
                    /*
                        当前高亮和要关闭的当前窗口相等
                        保存当前文件，并进行更改状态，tab切换，关闭弹窗操作操作
                    */
                    this.saveEditorFile(()=>{
                        this.activeTab(index);
                        this.askVisible = false;
                    });
                }else{
                    /*
                        当前高亮和要关闭的当前窗口不相等
                        分为两种情况：
                        1》要关闭的当前窗口大于当前高亮显示的
                        2》要关闭的当前窗口小于当前高亮显示的
                        之后保存要关闭的那个窗口文件，并进行左边状态更改，tab切换，fileData状态更改，关闭弹窗操作
                    */
                    console.log('当前关闭和当前高亮显示不同',arr[0])
                    console.log(arr[0].value,arr[0].name,arr[0].source)
                    file.saveFile(arr[0].value,arr[0].name,arr[0].source,()=>{
                        console.log(111)
                        //更改左边文件栏状态
                        this.updateTreeData({keyId:arr[0].keyId,save:true,value:arr[0].value});
                        //更新未保存vuex的状态
                        let edit = [];
                        this.editData.forEach((item,index)=>{
                            if(item.keyId !== arr[0].keyId){
                                edit.push(item);
                            }
                        })
                        edit = JSON.stringify(edit);
                        this.updateData(JSON.parse(edit));
                        //更改tab切换
                        this.activeTab(index);
                        //关闭弹窗
                        this.askVisible = false;
                    });
                }
            },
            //no
            no:function(e){
                var index = e.target.getAttribute("data-index");
                var arr = e.target.getAttribute("data-arr");
                console.log("当前关闭窗口的位置以及信息",index+arr);
                arr = JSON.parse(arr);
                //更改左边文件栏状态
                this.updateTreeData({keyId:arr[0].keyId,save:true,value:arr[0].value});
                //更新未保存vuex状态
                let edit = [];
                this.editData.forEach((item,index)=>{
                    if(item.keyId !== arr[0].keyId){
                        edit.push(item);
                    }
                })
                edit = JSON.stringify(edit);
                this.updateData(JSON.parse(edit));
                //更改tab切换
                this.activeTab(index);
                //关闭弹窗
                this.askVisible = false;

            },
            //calcel
            calcel:function(){
                this.askVisible = false;
            },
            //关闭当前窗口
            remove:function(index,id){
                console.log('index',index);
                /*
                    关闭当前窗口，判断当前高亮this.select与要关闭的index是否相等
                    然后判断要关闭的这个窗口是否是未保存状态
                    然后进行状态更改，tab切换操作
                */
                let arr = this.editData.filter((item)=>{
                    return item.keyId == id;
                });
                if(arr.length != 0){
                    //存在，
                    this.askVisible = true;
                    this.dataindex = index;
                    this.dataarr = JSON.stringify(arr);
                }else{
                    //不存在
                    this.askVisible = false;
                    this.activeTab(index);
                }
                /*
                    如果是别的地方依旧高亮，直接删除别的tab标签的话，依旧还显示为别的地方的高亮，如果是当前地方高亮，删除当前，高亮显示为下一个 如果是最后一个地方高亮，删除最后一个tab标签，高亮显示为上一个
                */
                //关闭窗口时，提示用户是否已保存

            },
            //yess
            yess:function(e){
                this.saveAllFile(()=>{
                    this.asksVisible = false;
                    this.editorVisible = false;
                    this.tipsVisible = true;
                    this.value = "readonly";
                    this.changeFileData([]);
                });

            },
            //nos
            nos:function(e){
                this.asksVisible = false;
            },
            //calcels
            calcels:function(){
                this.asksVisible = false;
            },
            //关闭所有窗口
            close:function(){
                /*
                    判断editData是否为空，为空则没有需要保存的文件，直接更新fileDaa为空即可
                    不为空则有需要保存的文件，此时处理：
                    new一个数组
                    遍历fileData和editData，根据keyId是否相等
                    相等：
                    则push进新数组中
                    然后更新未保存vuex状态
                    保存所有文件
                    更新左边文件管理处状态
                    更新fileData为空
                */
                if(this.editData.length == 0){
                    this.editorVisible = false;
                    this.tipsVisible = true;
                    this.asksVisible = false;
                    this.value = "readonly";
                    this.changeFileData([]);
                }else{
                    //保存所有
                    this.asksVisible = true;
                }
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
            var _this = this;
            document.onkeydown = function(event){
                event.stopPropagation();
                var e = event || window.event || arguments.callee.caller.arguments[0];
                if(e && e.keyCode==38){ // 按 up
                    //要做的事情
                    _this.onSearchUp();
                }
                if(e && e.keyCode==40){ // 按 down
                    //要做的事情
                    _this.onSearchDown();
                }
                if(e && e.keyCode==27){ // 按 Esc
                    //要做的事情
                    _this.boolSearchVisible(false);
                    _this.boolReplaceVisible(false);
                }
                if (e.ctrlKey && e.keyCode == 187){ //按 ctrl++
                    console.log('方法')
                    _this.increase();
                }
                if (e.ctrlKey && e.keyCode == 189){ //按 ctrl--
                    console.log("fafff")
                    _this.decrease();
                }

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
            'removeData.id':function(){
            	this.remove(this.removeData.index)
            }

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
                margin-left:10px;
                padding:0;
                background-color:transparent;
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
            margin-right:14px;
            display: inline-block;
            cursor: pointer;
        }
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
    .close-search{
        float:right;
        cursor: pointer;
    }
}
.replace-model{
    position: absolute;
    top: 40px;
    left: 50%;
    z-index: 100000;
    margin-left: -260px;
    padding: 0 10px;
    width: 520px;
    height: 80px;
    line-height: 100px;
    border:solid 1px #e5e5e5;
    border-radius: 3px;
    .replace-content{
        display: flex;
        flex-wrap:nowrap;
        flex-direction:row;
        justify-content:flex-start;
        height:80px;
        ul{
            height:80px;
            margin-top:0;
            padding-left:0;
            flex-grow:1;
            li{
                height:40px;
                line-height: 40px;
                label{
                    display: inline-block;
                    width:50px;
                }
                input{
                    display: inline-block;
                    width:300px;
                    height:25px;
                    line-height: 25px;
                    &:focus{
                        outline:none;
                        border:solid 1px @blue;
                    }
                }

                span{
                    display: inline-block;
                    height:30px;
                    line-height: 28px;
                    width:80px;
                    text-align: center;
                    border-radius:3px;
                }
            }
            .close-search{
                height:80px;
                line-height: 80px;
                cursor: pointer;
                text-align: center;
            }
        }
    }


}
.popup {
    width: 100%;
    height: 100%;
    position: fixed;
    background-color: rgba(0, 0, 0, .4);
    z-index: 1500;
    top: 0;
    left: 0;

}
.mask {
    width: 100%;
    height: 100%;
    position: relative;
}
.ask-model{
    position: absolute;
    top: 140px;
    left: 50%;
    z-index: 100000;
    margin-left: -240px;
    width: 440px;
    height: 125px;
    border: solid 1px #e5e5e5;
    border-radius: 3px;
    background-color:#fff;
    ul{
        height: 125px;
        li{
            &:nth-child(1){
                padding:5px;
                height:20px;
                line-height: 20px;
                text-align: right;
                i{
                    display: inline-block;
                    width:100px;
                    cursor: pointer;
                }
                // background:@blue;
            }
            &:nth-child(2){
                height: 48px;
                line-height: 30px;
                padding-left: 20px;
            }
            &:nth-child(3){
                height: 35px;
                line-height: 35px;
                span{
                    display: inline-block;
                    height: 35px;
                    line-height: 40px;
                    width: 80px;
                    text-align: center;
                    border-radius: 3px;
                    margin: 0 29px;
                    cursor: pointer;
                }
            }
        }
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
</style>