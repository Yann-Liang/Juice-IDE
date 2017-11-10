<template class="wrap">

    <div id="javascript-editor" class='javascript-editor'></div>
   <!--  <div id="tips"  v-show='tipsVisible'></div> -->


</template>

<script>
    //import  from ''
    //brace
    import * as ace from 'brace';
    import 'brace/mode/javascript';
    import 'brace/theme/monokai';
    import 'brace/ext/language_tools'
    import '@/services/Mode-solidity'
    import 'brace/keybinding/vim'
    import {mapState, mapActions, mapGetters} from 'vuex';
    import file from '@/services/API-file'
    import compileService from '@/services/compile-exe/compile-service';
    var beautify = require('js-beautify').js_beautify
    var fs = require('fs')
    ace.acequire('ace/ext/language_tools')
    export default {
        //组件名
        name: '',
        //实例的数据对象
        data() {
            return {
                editor:{},

            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: ["currentView","value","searchValue",'name','keyId'],
        //计算
        computed: {
            ...mapGetters(['actionCode','editData','editFile'])
        },
        //方法
        methods: {
            ...mapActions(['saveCode','updateData','updateTreeData','updateActiveEditor','saveEditorFile','saveEditor']),
            //放大
            increase:function(){
                this.editor.setFontSize(this.editor.getFontSize() + 1)
            },
            //缩小
            decrease:function(){
                this.editor.setFontSize(this.editor.getFontSize() - 1)
            },
            //全局搜索
            onSearch:function(name){
                this.editor.find(name,{
                    backwards: false,
                    wrap: false,
                    caseSensitive: true,
                    wholeWord: false,
                    regExp: false,
                    range:"",
                    start:{row:1,column:1}
                });
                // this.editor.findNext(false);
                this.onSearchUp();
                this.onSearchDown();
            },
            //向上搜索
            onSearchUp:function(){

                this.editor.findPrevious(true);
            },
            //向下搜索
            onSearchDown:function(){
                this.editor.findNext(false);
            },
            //单个替换
            replaceSign:function(oldValue,newValue){
                this.editor.find(oldValue);
                this.editor.replace(newValue);
            },
            //全部替换
            replaceAll:function(oldValue,newValue){
                this.editor.find(oldValue,{
                    backwards: false,
                    wrap: false,
                    caseSensitive: true,
                    wholeWord: false,
                    regExp: false,
                    range:"",
                    start:{row:1,column:1}
                });
                // this.editor.findNext(false);
                this.onSearchUp();
                this.onSearchDown();
                this.editor.replaceAll(newValue);
            },
            //代码格式化
            format:function(){
                this.editor.setValue(beautify(this.editor.getValue()));
                //引用了js-beautify库
            },
            //设置值
            setValue:function(){
                console.log('setvalue')
                let arr = this.editData.filter((item)=>{
                    return item.keyId === this.keyId
                });
                if(arr.length != 0){
                    console.log('缓存中的值')
                    this.editor.setValue(arr[0].source);
                    this.setActiveEditor(this.getResult);
                }else{
                    if(this.value){
                        if(this.value == 'readonly'){
                            this.editor.setReadOnly(true);
                        }else{
                           fs.readFile(this.value,"utf-8",  (err, data)=> {
                                if (err) {
                                    return console.error(err);
                                }
                                console.log('读取路径文件的值')
                                this.editor.setValue(data.toString());
	                            this.setActiveEditor(this.getResult);
                            });
                        }
                    }else{
                        this.editor.setValue("pragma solidity ^0.4.2;");
	                    this.setActiveEditor(this.getResult);
                    }
                }
            },
            setActiveEditor(cb){
	            const editorData = {
		            value: this.editFile.value,
		            name: this.editFile.name,
		            keyId:this.editFile.keyId,
		            source: this.getValue()
	            }
                // console.log(editorData.source)
	            this.updateActiveEditor(editorData);
                if(cb && typeof(cb)=='function'){
                    cb();
                }
            },
            //编辑区的change事件
            change:function(){
                //监听编辑区的change事件
                console.log(this.editor.getSession().on)
	            console.log(this.editor.getSession().off)
//                this.editor.getSession().on('change', (e)=> {
//	                //监听鼠标获得焦点
//                    console.log("cccccccccccccccccccccccccccccccc")
//	                this.editor.on("focus",()=>{
//		                console.log("focusssssssssssssssssssssssss")
//		                this.updateTreeData({keyId:this.keyId,save:false,value:this.value});
//		                this.initChange();
//		                this.getResult();
//	                });
//                });
	            this.editor.on("focus",()=>{
			            this.editor.getSession().on('change', (e)=> {
				            console.log("开始监听")
				            this.updateTreeData({keyId:this.keyId,save:false,value:this.value});
				            this.initChange();
				            this.getResult();
                        })
	            });

	            this.editor.on("blur",()=>{
		            this.editor.getSession().removeAllListeners('change')
	            });
            },
            //设置错误警示css
            setBreakpoint:function(row,css){
                console.log(row,css)
                this.editor.session.setBreakpoint(row,css);
            },
            //语法检查
            getResult:function(){
                //语法检查
                // var _this = this;
                compileService.grammarCheck((result, missingInputs, source)=>{
                    console.log('语法检查',result)
                    if(result.errors && result.errors.length>0){
                        /*
                            语法检查：依次遍历错误数组，获取错误行数，然后依次显示在编辑区的相应位置，每次切换tab时去掉class
                        */
                        let css='';
                        result.errors.forEach((error)=>{
                            var errorId = error.match(/\w+\.sol\:[0-9]+/i);
                            var rowId = errorId[0].match(/\w+\.sol\:(\S*)/i);
                            var tips = errorId.input.replace(/\s/g,"").match(/\w+\.sol\:[0-9]+\:[0-9]+\:(\S*)\:/i)
                            console.log(rowId[1],tips[1]);
                            if(tips[1] == 'Warning'){
                                css = 'ace_warning'
                            }else{
                                css = 'ace_error'
                            }
                            this.setBreakpoint(rowId[1]-1,css);
                            this.mouseHover(error)
                        });
                    }else{
                        console.log('没有错误警示')
                        this.editor.session.clearBreakpoints();
                    }
                },this.value);
            },
            initChange:function(){
                const data = this.editData;
                const item = {
                    value:this.value,
                    name:this.name,
                    keyId:this.keyId,
                    source:this.editor.getValue()
                }
	            this.setActiveEditor();
                console.log("当前item为");
                for (let i = data.length - 1; i >= 0; i--) {
                    if(item.keyId === data[i].keyId){
                        data[i].source = item.source
                        this.updateData(data);
                        return false;
                    }
                }
                data.push(item);
                this.updateData(data);
            },
            //获取当前值
            getValue:function(){
                return this.editor.getValue();
            },
            //失去焦点
            loseBlur:function(){
                this.editor.on('blur',()=>{
                    this.updateTreeData({value:this.value,name:this.name,save:true});
                });
            },
            //鼠标hover事件
            mouseHover:function(str){
                //点击报错行显示报错的是啥信息
                this.editor.on('guttermousemove',(e)=>{
                    var target = e.domEvent.target;
                    // console.log('guttermousemove',e)
                    var row = e.getDocumentPosition().row;
//                    console.log(row);
                    var className = e.domEvent.toElement.className;
//                    console.log(className);
                    if(className.indexOf("ace_error")>=0 || className.indexOf("ace_warning")>=0){
                        e.domEvent.toElement.title=str;
                        return false;
                    }else{
                        e.domEvent.toElement.title=""
                    }
                });
            }

        },
        //生命周期函数
        created() {

        },
        beforeMount() {

        },
        mounted() {
            this.editor = ace.edit('javascript-editor');
            //把editor对象存在vuex中，方便在别的文件中使用editor的方法
            this.saveEditor(this.editor);
            console.log(this.editor)
            var _this = this;
            require('brace/ext/language_tools')
            ace.acequire('ace/ext/language_tools')
            this.editor = ace.edit('javascript-editor');
            this.editor.$blockScrolling = Infinity;
            this.editor.getSession().setMode('ace/mode/javascript');
            this.editor.setTheme('ace/theme/clouds');
            //启用提示菜单
            this.editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true
            });
            //字体大小
            this.editor.setFontSize(12);
            //自动换行,设置为off关闭
            this.editor.setOption("wrap", "free");
            this.setValue();
            this.change();
            this.editor.clearSelection();
            var sourceAnnotations = [];
            // this.getResult();

            //监听光标移动
            this.editor.getSession().selection.on('changeCursor', (e)=> {

            });



            //设置格式化
            this.editor.commands.addCommand({
                name: 'myCommand',
                bindKey: {win: 'Ctrl-L',  mac: 'Command-L'},
                exec: function(editor) {
                    _this.format();
                    //...
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });
            //设置ctrl+s 保存当前
            this.editor.commands.addCommand({
                name: 'save',
                bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
                exec: function(editor) {
                    _this.saveEditorFile()
	                _this.editor.blur();
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });
            //绑定搜索
            this.editor.commands.addCommand({
                name: 'find',
                bindKey: {win: 'Ctrl-F',  mac: 'Command-F'},
                exec: function(editor) {
                    _this.$emit("findFunction",true);
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });
            //绑定替换
            this.editor.commands.addCommand({
                name: 'replace',
                bindKey: {win: 'Ctrl-H',  mac: 'Command-H'},
                exec: function(editor) {
                    _this.$emit("replaceFunction",true);
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });


        },
        //监视
        watch: {
            keyId:function(){
            	if(!this.editFile.unWatch){
		            this.setValue();
                }
            },
        },
        //组件
        components: {

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
.wrap{

}
.javascript-editor{
    width:100%;
    flex-grow:1;
}



</style>