<template>
    <div class="">
        <div class="file-tab bggrayer">
            <div class="tabs" ref='tabs'>

                <div class='scroll-bar left-bar bggrayer'  v-if='showOrHideOne' ref='leftbar' @click='scrollLeft' >
                    <i class="iconfont small">&#xe62f;</i>

                </div>
                <ul class='files' ref='files'>
                    <li class='file' v-for="(item,index) in fileData" :key='item.name' :title="item.value" :class="{'li-active':select===index}"  v-on:click="selectProp(index,item)" :id='item.name'>
                        <span>{{item.name}}</span>
                        <span class="remove" @click.stop="remove(index,item.keyId)" v-if='cha'></span>
                        <span class="remove" v-if='dian'>...</span>
                    </li>
                    <li class='new-file' @click='newFile'><i class="iconfont darker">&#xe621;</i></li>
                </ul>

                <div class='scroll-bar right-bar bggrayer'  v-if='showOrHideTwo'  @click='scrollRight' ref='rightbar'>
                    <i class="iconfont small">&#xe630;</i>

                </div>
            </div>
            <div class="tools">
                <div class="tool">
                    <span @click.prevent='save' title="保存当前文件"><i class="iconfont info">&#xe633;</i></span>
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
                        <input class="dark" type="text"  :style="{backgroundColor:hasMatch?'#fff':'#d43718'}" v-model='inputValue' @keyup.up="findPrev" @keyup.left="findPrev" @keyup.down="findNext" @keyup.right="findNext" placeholder="搜索" @input='find' @keyup.enter='find' ref='search' autofocus="autofocus"  spellcheck="false" v-focus>
                    </span>
                    <span class="btn btn-info" @click='find'>查找</span>
                    <span @click='findPrev'><i class="iconfont info">&#xe638;</i></span>
                    <span @click='findNext'><i class="iconfont info">&#xe637;</i></span>
                    <span @click="offSearch" class="close-search"><i class="iconfont dark">&#xe61f;</i></span>
                </div>
            </div>
            <div class="replace-model shadow" v-if='replaceVisible'>
                <div class="replace-content replace-one">
                    <span>
                        <input class="dark" type="text"  :style="{backgroundColor:repMatch?'#fff':'#d43718'}" v-model='fromValue'  placeholder="查找内容"  @keyup.up="findReplacePrev" @keyup.left="findReplacePrev" @keyup.down="findReplaceNext" @keyup.right="findReplaceNext"  @input='findReplace'   @keyup.enter="findReplace" autofocus="autofocus"  spellcheck="false" v-focus>
                    </span>
                    <span class="btn btn-info" @click='findReplace'>查找</span>
                    <span @click='findReplacePrev'><i class="iconfont info">&#xe638;</i></span>
                    <span @click='findReplaceNext'><i class="iconfont info">&#xe637;</i></span>
                    <span @click="offReplace" class="close-search"><i class="iconfont dark">&#xe61f;</i></span>
                </div>
                <div class="replace-content">
                    <span>
                        <input class="dark" type="text" v-model='toValue'  placeholder="替换为" @keyup.enter='replace' spellcheck="false">
                    </span>
                    <span class="btn btn-info" @click='replaceAndFindNext'>替换</span>
                    <span class="btn btn-info" @click='replaceAll'>全部替换</span>
                </div>
            </div>
            <div class="tip-modal modal" v-if="askVisible">
                <div class="modal-main">
                    <h4 class="modal-title">
                        提示
                        <span class="modal-close" @click="calcel"></span>
                    </h4>
                    <div class="modal-content">
                        <div class="content-tip">
                            <p class="warning">{{fileName}}文件已经被更改过了，要保存更改吗？</p>
                        </div>
                    </div>
                    <div class="modal-btn">
                        <span  class='btn-info'  @click='yes($event)' :data-index='dataindex' :data-arr='dataarr'>是</span>
                        <span  class='btn-info' type="primary" @click='no($event)' :data-index='dataindex' :data-arr='dataarr'>否</span>
                        <span class="btn-info cancel" :data-index='dataindex' @click='calcel'>取消</span>
                     <!--    <el-button class="cancel" @click="calcel">取消</el-button>
                        <el-button type="primary" @click="sureDeleteAllFile()">确定</el-button> -->
                    </div>
                </div>
            </div>

            <div class="tip-modal modal" v-if="asksVisible">
                <div class="modal-main">
                    <h4 class="modal-title">
                        提示
                        <span class="modal-close" @click="calcels"></span>
                    </h4>
                    <div class="modal-content">
                        <div class="content-tip">
                            <p class="warning">有尚未保存的文件，确定关闭所有窗口吗！</p>
                        </div>
                    </div>
                    <div class="modal-btn">
                        <el-button class="cancel" @click='nos($event)'>取消</el-button>
                        <el-button type="primary" @click='yess($event)'>确定</el-button>
                    </div>
                </div>
            </div>
            <div class="success-model" v-if='successVisible'>
                <div class="success-content">
                    <i class='icon'>保存成功</i>
                </div>
            </div>
        </div>
        <v-editor :currentView='currentView' :value='value' :keyId="keyId" :name='name' :searchValue='searchValue' keep-alive
                  class='javascript-editor' ref="childMethod" @findFunction='findFunction'
                  @replaceFunction='replaceFunction' v-show="fileData.length > 0">。

        </v-editor>
        <div class="tips default"  v-show="fileData.length == 0">
            <i class='icons'>请在文件管理器面板中点击打开一个文件</i>
        </div>
        <!-- 弹窗 -->

    </div>
</template>

<script>

    import {mapState, mapActions, mapGetters} from 'vuex';
    import Editor from '@/components/editor-panel/panel'
    import file from '@/services/API-file'

    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
                htmlData:"",
                repMatch:true,
                hasMatch:true,
                // hiddenLength:"",
                showOrHideOne:false,
                showOrHideTwo:false,
                fileName:"",
                searchErr:false,
                dataarr:[],
                dataindex:"",
                cha:true,
                dian:false,
                tipsVisible:false,
                editorVisible:false,
                askVisible:false,
                asksVisible:false,
                // successVisible:true,
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
            ...mapGetters(['editFile','fileTreeData','activeFile','getUrl','saveCode','editData','fileData','editor'
                ,'searchVisible','replaceVisible','removeData','currentName','successVisible']),
        },
        //方法
        methods: {
            ...mapActions(['queryFileListData','updateUrl','updateEditFile','updateData','updateTreeData','saveEditorFile'
                ,'changeFileData','boolSearchVisible','boolReplaceVisible','saveAllFile','updateCurrentId','boolSuccessVisible','updateRightMenuBlock']),
            //放大
            increase:function(){
                // this.$refs.childMethod.increase();
                console.log('放大')
                if(this.editor.getFontSize() == 24){
                    return false;
                }else{
                    this.$refs.childMethod.editorFontSize(1);
                }

                // this.editor.setFontSize(this.editor.getFontSize() + 1)
            },
            //缩小
            decrease:function(){
                console.log('缩小')
                if(this.editor.getFontSize() == 14){
                    return false;
                }else{
                    this.$refs.childMethod.editorFontSize(-1)
                }

                // this.editor.setFontSize(this.editor.getFontSize() - 1)
            },
            findFunction:function(bool){
                this.boolSearchVisible(bool);
            },
            replaceFunction:function(bool){
                this.boolReplaceVisible(bool);
            },
            //点击搜索
            search:function(){
                //弹窗出现
                this.boolSearchVisible(true);
                // this.editor.commands.commands.find.exec(this.editor);
            },
            highlight :function(value) {
                // console.log(value)
                var re =new RegExp("" + value + "","gim");
                console.log(re);
                if(value == ""){
                    this.editor.session.highlight(false);
                }else{
                    this.editor.session.highlight(re);
                }
                this.editor.renderer.updateBackMarkers();
            },
            find:function(skipCurrent, backwards, preventScroll){
                var range = this.editor.find(this.inputValue,{
                    skipCurrent: skipCurrent,
                    backwards: backwards,
                    wrap: true,
                    regExp: undefined,
                    caseSensitive: false,
                    wholeWord: undefined,
                    preventScroll: preventScroll
                });
                var noMatch = !range && this.inputValue;
                if(noMatch == false || noMatch == ""){
                    this.hasMatch = true;
                }else{
                    this.hasMatch = false;
                }
                this.highlight(this.inputValue);
            },
            //向下搜索
            findNext:function(){
                this.find(true,false);
            },
            //向上搜索
            findPrev:function(){
                this.find(true,true);
            },
            //关闭弹窗
            offSearch:function(){
                //弹窗关闭
                this.boolSearchVisible(false);
                // this.searchVisible = false;
                this.inputValue = "";
                this.searchValue = "";
                this.hasMatch = true;
            },
            //替换的搜索
            findReplace:function(skipCurrent, backwards, preventScroll){
                console.log('this.fromValue',this.fromValue)
                var range = this.editor.find(this.fromValue,{
                    skipCurrent: skipCurrent,
                    backwards: backwards,
                    wrap: true,
                    regExp: undefined,
                    caseSensitive: undefined,
                    wholeWord: undefined,
                    preventScroll: preventScroll
                });
                var noMatch = !range && this.fromValue;
                if(noMatch == false || noMatch == ""){
                    this.repMatch = true;
                }else{
                    this.repMatch = false;
                }
                this.highlight(this.fromValue);
            },
            //向下搜索
            findReplaceNext:function(){
                this.findReplace(true,false);
            },
            //向上搜索
            findReplacePrev:function(){
                this.findReplace(true,true);
            },
            //enter替换
            replace :function(){
                if(!this.editor.getReadOnly()){
                    //进行判断
                    if(this.toValue == ""){
                        //什么也不做
                    }else{
                        this.editor.replace(this.toValue);
                        this.updateTreeData({keyId:this.keyId,save:false,value:this.value});
                        this.$refs.childMethod.initChange();
                        this.highlight(this.fromValue);
                    }
                }

            },
            //单个替换
            replaceAndFindNext :function(){
                if(!this.editor.getReadOnly()){
                    if(this.toValue == ""){
                        //什么也不做
                    }else{
                        this.editor.replace(this.toValue);
                        this.updateTreeData({keyId:this.keyId,save:false,value:this.value});
                        this.$refs.childMethod.initChange();
                        this.findReplaceNext();
                    }

                }
            },
            //全部替换
            replaceAll:function(){
                if(!this.editor.getReadOnly()){
                    if(this.toValue == ""){
                        //什么也不做
                    }else{
                        this.editor.replaceAll(this.toValue);
                        this.updateTreeData({keyId:this.keyId,save:false,value:this.value});
                        this.$refs.childMethod.initChange();
                    }

                }
            },
            //关闭替换弹窗
            offReplace:function(){
                this.boolReplaceVisible(false);
                // this.replaceVisible = false;
                this.fromValue = "";
                this.toValue = "";
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
            //保存当前文件
            save:function(){
                this.saveEditorFile(()=>{
                    this.success();
                });
            },
            //代码格式化
            format:function(){
                this.$refs.childMethod.format();
            },
            //切换tab
            selectProp: function (index,item) {
                this.select = index;
                this.currentView = index;
                this.value = item.value;
                this.name = item.name;
                this.keyId = item.keyId;
                this.updateEditFile({
	                name:this.name,
	                value:this.value,
                    keyId:this.keyId
                })
                // this.$refs.childMethod.change();
            },
            //效果切换
            activeTab:function(index){
                if(this.fileData.length == 1){
                    //提示用户打开文件
                    this.editorVisible = false;
                    this.tipsVisible = true;
                    this.changeFileData([]);
                }else{
                    this.editorVisible = true;
                    this.tipsVisible = false;
                    if(this.select == index){
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
                        let result = this.fileData;
                        result.splice(index,1);
                        this.changeFileData(result);
                        this.select = this.select - 1;
                        this.currentView = this.select - 1;
                        this.value= this.fileData[this.select].value;
                        this.name = this.fileData[this.select].name;
                        this.keyId = this.fileData[this.select].keyId;
                    }else if(this.select < index){
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
                arr = JSON.parse(arr);
                if(this.select == index){
                    /*
                        当前高亮和要关闭的当前窗口相等
                        保存当前文件，并进行更改状态，tab切换，关闭弹窗操作操作
                    */
                    this.saveEditorFile(()=>{
                        this.askVisible = false;
                        this.success(()=>{
                            this.activeTab(index);
                        });

                    });
                }else{
                    /*
                        当前高亮和要关闭的当前窗口不相等
                        分为两种情况：
                        1》要关闭的当前窗口大于当前高亮显示的
                        2》要关闭的当前窗口小于当前高亮显示的
                        之后保存要关闭的那个窗口文件，并进行左边状态更改，tab切换，fileData状态更改，关闭弹窗操作
                    */
                    file.saveFile(arr[0].value,arr[0].name,arr[0].source,()=>{
                        //关闭弹窗
                        this.askVisible = false;
                        this.success(()=>{
                            //更改tab切换
                            this.activeTab(index);
                        });
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


                    });
                }
            },
            //no
            no:function(e){
                var index = e.target.getAttribute("data-index");
                var arr = e.target.getAttribute("data-arr");
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
                    console.log(arr)
                    this.askVisible = true;
                    this.dataindex = index;
                    this.fileName = arr[0].name;
                    this.dataarr = JSON.stringify(arr);
                    //
                }else{
                    //不存在
                    this.askVisible = false;
                    if(id === 'setValue'){
	                    this.select = index;
	                    this.currentView = index ;
	                    this.value = this.fileData[index] ? this.fileData[index].value : this.value;
	                    this.name = this.fileData[index] ? this.fileData[index].name  : this.name;
	                    this.keyId = this.fileData[index] ? this.fileData[index].keyId  : this.keyId;
	                    if(this.fileData.length){
		                    this.updateEditFile({
			                    name:this.name,
			                    value:this.value,
			                    keyId:this.keyId
		                    })
                        }
                    }else{
	                    this.activeTab(index);
                    }
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
                    this.success(()=>{
                        this.editorVisible = false;
                        this.tipsVisible = true;
                        this.changeFileData([]);
                        this.showOrHideTwo = false;
                        this.showOrHideOne = false;
                        this.$refs.files.style.left = '0';
                    });

                });

            },
            //nos
            nos:function(e){
                this.asksVisible = false;
                // this.showOrHideTwo = false;
                // this.showOrHideOne = false;
                // this.$refs.files.style.left = '0';
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
                    this.changeFileData([]);
                    this.showOrHideTwo = false;
                    this.showOrHideOne = false;
                    this.$refs.files.style.left = '0';
                }else{
                    //保存所有
                    this.asksVisible = true;
                }
            },
            //新建文件
	        newFile(){
		        file.newFile('','',(res)=>{
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
		        this.updateRightMenuBlock(false);
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
                        //为true 高亮显示当前，并且不push
                        this.select = index;
                        this.currentView = index;
                        this.value = this.editFile.value;
                        this.name = this.editFile.name;
                        this.keyId = this.editFile.keyId;
                        blo = true;
                        //获取当前这个元素
                        this.$nextTick(()=>{
                            var id = this.editFile.name;
                            this.alreadyArrow(id);
                        })
                    }
                });
                 //为false，push进数组，并高亮显示数组最后一个
                if(blo == false){
                    console.log('push进数组')
	                let data = this.fileData;
	                data.push(this.editFile);
	                this.changeFileData(data);
                    this.select = this.fileData.length - 1;
                    this.currentView = this.fileData.length - 1;
                    this.value = this.fileData[this.fileData.length - 1].value;
                    this.name = this.fileData[this.fileData.length - 1].name;
	                this.keyId = this.fileData[this.fileData.length - 1].keyId;

                    this.$nextTick(()=>{
                        this.initArrow();
                    })
                }
            },
            //点击向右滑动
            scrollRight:function(e){
                console.log('执行向右滑动')
                this.showOrHideOne = true;
                var rightArrow = this.$refs.rightbar;
                var leftArrow = this.$refs.leftbar;
                var hiddenLength = this.$refs.files.offsetWidth - this.$refs.tabs.offsetWidth;
                var currentLeft = this.$refs.files.offsetLeft || 0;
                var hiddenRight = hiddenLength + currentLeft;
                console.log('hiddenRight>>>>>>>>>>>>>>>',hiddenLength,currentLeft,hiddenRight)
                if(hiddenRight > 0){
                    if(hiddenRight > this.vistual){
                       this.$refs.files.style.left = `${currentLeft - this.vistual}px`
                    }else{
                        this.$refs.files.style.left = `${currentLeft - hiddenRight - 100}px`;
                        this.showOrHideTwo = false;
                        // this.showOrHideTwo = 'hide';
                        // this.showOrHideOne = 'hide';
                    }
                }
            },
            //点击向左滑动
            scrollLeft:function(){
                this.showOrHideTwo = true;
                var leftArrow = this.$refs.leftbar;
                var rightArrow = this.$refs.rightbar;
                var currentLeft = this.$refs.files.offsetLeft || 20;
                console.log('currentLeft>>>>>>>>>',currentLeft)
                if(currentLeft < 0){
                    if(currentLeft < -this.vistual){
                       this.$refs.files.style.left = `${currentLeft + this.vistual}px`
                    }else{
                        this.$refs.files.style.left = `${currentLeft - currentLeft }px`;
                        this.showOrHideOne = false;
                        // this.showOrHideTwo = 'hide';
                        // this.showOrHideOne = 'hide';
                    }
                }
            },
            //初始化左移右移箭头
            initArrow:function(){
                if(this.fileData.length == 0){
                    //什么也不做
                }else{
                    var leftArrow = this.$refs.leftbar;
                    var rightArrow = this.$refs.rightbar;
                    var filetabWidth = this.$refs.files.offsetWidth;
                    var tabWidth = this.$refs.tabs.offsetWidth;
                    var hiddenLength = filetabWidth - tabWidth;
                    var currentLeft = this.$refs.files.offsetLeft || 0;
                    var hiddenRight = hiddenLength + currentLeft;
                    console.log('hiddenLength',hiddenLength)
                    if(hiddenLength > 0){
                        //已超过，此时需要显示出来箭头
                        // this.showOrHideTwo = true;
                        this.showOrHideOne = true;
                        if(hiddenRight > 0){
                            if(hiddenRight > this.vistual){
                               this.$refs.files.style.left = `${currentLeft - this.vistual}px`
                            }else{
                                this.$refs.files.style.left = `${currentLeft - hiddenRight - 100}px`
                            }
                        }

                    }else{
                        this.showOrHideTwo = false;
                        this.showOrHideOne = false;
                        this.$refs.files.style.left = '0';
                    }
                    // console.log()
                }

            },
            //已push进数组
            alreadyArrow:function(id){
                if(this.fileData.length == 0){
                    //什么也不做
                }else{
                    var filetabWidth = this.$refs.files.offsetWidth;
                    var tabWidth = this.$refs.tabs.offsetWidth;
                    var hiddenLength = filetabWidth - tabWidth;
                    var element = document.getElementById(""+id+"");
                    var elementLeft = element.offsetLeft;//当前元素距离父元素的距离
                    var elementWidth = element.offsetWidth;//当前元素的宽度
                    // console.log('fileLeft',fileLeft)
                    // console.log('elementLeft',elementLeft)
                    // console.log('elementWidth',elementWidth)
                    // console.log('current',current );
                    var currentLeft = this.$refs.files.offsetLeft || 0;
                    var hiddenRight = hiddenLength + currentLeft;
                    console.log('hiddenRight',hiddenRight)
                    if(hiddenLength > 0){
                        //已超过
                        this.showOrHideTwo = true;
                        if(elementLeft == 0){
                            this.showOrHideOne = false;
                            this.$refs.files.style.left = `0px`;
                        }else{
                            this.showOrHideOne = true;
                            this.$refs.files.style.left = `${ - elementLeft + 100}px`;
                        }
                    }else{
                        this.showOrHideTwo = false;
                        this.showOrHideOne = false;
                        this.$refs.files.style.left = `0px`;
                    }
                    // if(elementLeft == 0){

                    // }else{

                    // }
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
                if(e.keyCode == 27 && e){ // 按 Esc
                    _this.offSearch();
                    _this.offReplace();
                }

            }
         },
        beforeMount() {

        },
        mounted() {

        },
        //监视
        watch: {
            editFile:function(){
            	console.log('this.editFile.unWatch',this.editFile.unWatch)
                if(!this.editFile.unWatch){
                    if(this.editFile){
                        if(this.editFile.keyId){
                            this.pushArray();
                        }
                    }
                }
            },
            'removeData.id':function(){
            	this.remove(this.removeData.index,this.removeData.fileItem.keyId)
            },
            // 'fileData.length':function(){
            //     this.$nextTick(()=>{
            //         console.log('this.fileData.length',this.fileData.length)
            //         this.initArrow();
            //     })

            // }
        },
        //组件
        components: {
            "v-editor":Editor
        },
        //过滤器
        filters:{

        },
        //自定义指令
        directives:{
            focus: {
                inserted: function (el) {
                    el.focus();
                    // if (value) {
                    //     el.focus();
                    // }
                }
            }
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
    height:32px;
    line-height:32px;
    position: relative;
    // padding-left:10px;
    .tabs{
        flex-grow: 1;
        position: relative;
        padding-right:20px;
        overflow:hidden;
        .scroll-bar{
            position: absolute;
            width:20px;
            top:0;
            z-index:2;//梁燕翔 挡住弹窗 改小
            font-size:16px;
            cursor: pointer;
            // background:#fff;
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
            left:0px;
            overflow:hidden;
            cursor:default;
            li{
                padding:0 5px 0 10px;
                display: flex;
                flex-wrap:nowrap;
                flex-direction:row;
                justify-content:flex-end;
                font-size:12px;
                color:#888;
                border-right:1px dashed #fefefe;
                // background-color:#eee;
                span{
                    display: inline-block;
                    white-space: nowrap;
                    &:first-child{
                        // float:right;
                        padding-right:10px;

                    }
                    &:last-child{
                        // float:right;
                        padding:0 5px;
                        cursor: pointer;
                        &:hover{
                            /*background-color:gray*/
                            color:#000;
                        }
                    }
                }
                .remove{
                    padding:0;
                    margin-top:12px;
                    display:inline-block;
                    width:8px;
                    height:8px;
                    background: url(images/close-blue.png) no-repeat center center;
                    &:hover{
                         background: url(images/close-darker.png) no-repeat center center;
                     }
                }
            }
            .new-file{
                margin-left:10px;
                padding:0;
                background-color:transparent;
                border-right:none;
            }
            .li-active{
                color:@fontBase;
                background-color: #fff;
                font-weight: bold;
                border-bottom: 0 none;
            }
        }

    }
}
.show{
    opacity: 1;
}
.hide{
    opacity: 0;
}
.tools{
    width:175px;
    position: relative;
    .tool{
        text-align: right;
        span{
            margin-right:8px;
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
    width: 480px;
    height: 50px;
    line-height: 50px;
    border:solid 1px #e5e5e5;
    border-radius: 3px;
    background-color:#fff;
    padding-right:0;
    .iconfont{
        font-size:14px;
        margin:0 5px;
        cursor:pointer;
    }
    input{
        padding-left:10px;
        width:266px;
        height:32px;
        line-height:32px;
        border:solid 1px #bfbfbf;
        &:focus{
            outline:none;
            border:solid 1px @blue;
         }
    }
    .btn{
        display: inline-block;
        padding:0;
        width:60px;
        height:32px;
        line-height:32px;
        margin:0 10px;
        text-align: center;
        border-radius:3px;
    }
    .close-search{
        float:right;
        cursor: pointer;
        margin-right:11px;
    }
    .search-err{
        color:red;
        display: inline-block;
        width:42px;
    }
}
.replace-model{
    position: absolute;
    top: 40px;
    left: 50%;
    z-index: 100000;
    margin-left: -240px;
    padding: 10px 10px 0px;
    width: 480px;
    height: 90px;
    // line-height: 50px;
    border:solid 1px #e5e5e5;
    border-radius: 3px;
    background-color:#fff;
    padding-right:0;
    .replace-one{
        margin-bottom:10px;
    }
    .iconfont{
        font-size:14px;
        margin:0 5px;
        cursor:pointer;
    }
    input{
        padding-left:10px;
        width:266px;
        height:32px;
        line-height:32px;
        border:solid 1px #bfbfbf;
        &:focus{
            outline:none;
            border:solid 1px @blue;
         }
    }
    .btn{
        display: inline-block;
        padding:0;
        width:65px;
        height:32px;
        line-height:32px;
        margin:0 10px;
        text-align: center;
        border-radius:3px;
    }
    .close-search{
        float:right;
        cursor: pointer;
        margin-right:11px;
    }
    .search-err{
        color:red;
        display: inline-block;
        width:42px;
    }
}
.success-model{
    position: absolute;
    top: 40px;
    left: 50%;
    z-index: 100000;
    margin-left: -240px;
    padding: 0 10px;
    width: 150px;
    height: 60px;
    line-height: 60px;
    border:solid 1px #e5e5e5;
    border-radius: 3px;
    background-color:#fff;
    .success-content{
        .icon{
            display: inline-block;
            // width:26px;
            height:60px;
            padding-left:30px;
            font-style: normal;
            background: url(images/yes.png) no-repeat left center;
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
.btn-info{
    background-color: #0b8aee;
    color: #fff;
    padding: 9px 31px;
    margin: 0 10px;
    /* border: 1px solid #0b8aee; */
    border-radius: 3px;
    cursor: pointer;
}
.cancel{
    background: #bfbfbf;
    color: #fff;
    border: 1px solid #bfbfbf;
}
.warning{
    background:url(images/warnning.png) no-repeat left center;
    padding-left:34px;
    color:#000;
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
    .icons{
        display: inline-block;
        width: 252px;
        height: 100px;
        background: url(images/icon.png) no-repeat top center;
        padding-top: 108px;
        font-style: normal;
        // border:1px solid red;
    }
}
    .small{
        font-size:12px;
        color:#666;
    }
</style>