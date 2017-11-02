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
    var beautify = require('js-beautify').js_beautify
    var fs = require('fs')
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
        props: ["currentView","value","searchValue",'name'],
        //计算
        computed: {
            ...mapGetters(['actionCode','editData','editFile'])
        },
        //方法
        methods: {
            ...mapActions(['saveCode','updateData','updateTreeData']),
            //放大
            increase:function(){
                this.editor.setFontSize(this.editor.getFontSize() + 1)
            },
            //缩小
            decrease:function(){
                this.editor.setFontSize(this.editor.getFontSize() - 1)
            },
            //全局搜索
            onSearch:function(){
                this.editor.find(this.searchValue,{
                    backwards: false,
                    wrap: false,
                    caseSensitive: true,
                    wholeWord: false,
                    regExp: false,
                    range:""
                });
                this.editor.findNext();
                this.editor.findPrevious();
            },
            //代码格式化
            format:function(){
                this.editor.setValue(beautify(this.editor.getValue()));
                //引用了js-beautify库
            },
            //设置值
            setValue:function(){
                console.log("this.editData",this.editData)
                let arr = this.editData.filter((item)=>{
                    return item.name === this.name && item.value === this.value
                });
                console.log(arr);
                if(arr.length != 0){
                    console.log('读取缓存中的值并设置')
                    this.editor.setValue(arr[0].source);
                }else{
                    console.log('通过文件fs读取文件内容')
                    if(this.value){
                        if(this.value == 'readonly'){
                            this.editor.setReadOnly(true);
                        }else{
                           fs.readFile(this.value,"utf-8",  (err, data)=> {
                                if (err) {
                                    return console.error(err);
                                }
                                this.editor.setValue(data.toString());
                            });
                        }
                    }else{
                        this.editor.setValue("pragma solidity ^0.4.2");
                    }
                }


            },
            //编辑区的change事件
            change:function(){
                //监听编辑区的change事件
                this.editor.on('focus',()=>{
                    console.log(1111111111)
                    this.editor.getSession().on('change', (e)=> {
                        this.updateTreeData({value:this.value,name:this.name,save:false});
                        this.initChange();
                    });
                });
                // this.editor.on("blur",()=>{
                //     this.editor.getSession().on('change', (e)=> {
                //         alert('重新change')
                //     });
                // });
            },
            initChange:function(){
                console.log('changeeeee',this.value)
                console.log('内容>>>>',this.editor.getValue());
                const data = this.editData;
                const item = {
                    value:this.value,
                    name:this.name,
                    source:this.editor.getValue()
                }
                console.log("当前item为",item);
                for (let i = data.length - 1; i >= 0; i--) {
                    if(item.value === data[i].value && item.name === data[i].name){
                        data[i].source = item.source
                        this.updateData(data);
                        return false;
                    }
                }
                data.push(item);
                this.updateData(data);
            }
        },
        //生命周期函数
        created() {

        },
        beforeMount() {

        },
        mounted() {
            console.log(this.editData)
            var _this = this;
            this.editor = ace.edit('javascript-editor');
            console.log(this.editor);
            this.editor.$blockScrolling = Infinity;
            this.editor.getSession().setMode('ace/mode/javascript');
            this.editor.setTheme('ace/theme/monokai');
            //启用提示菜单
            ace.acequire('ace/ext/language_tools')
            this.editor.setOptions({
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true
            });
            //字体大小
            this.editor.setFontSize(12);
            //自动换行,设置为off关闭
            this.editor.setOption("wrap", "free");
            //设置事件处理程序
            // this.editor.setKeyboardHandler('ace/keyboard/vim');
            this.editor.clearSelection();
            // this.setValue();

            this.setValue();
            this.change();
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
            //监听键盘按下事件
            // this.editor.on("focus",function(){
            //     console.log(1111)
            // })
        },
        //监视
        watch: {
            name:function(){
                console.log('this.name',this.name);
                this.setValue();
                // this.change();
                // this.change();
            },
            // value:function(){
            //     console.log(this.value,this.name);
            //     this.setValue();
            //     // this.change();
            // },
            actionCode:function(){
                switch(this.actionCode){
                    case 8:
                        this.format();
                        break;
                }
            },
            // editFile:function(){
            //     console.log(1111)
            //     // this.pushArray();
            //     this.initChange();
            // }
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