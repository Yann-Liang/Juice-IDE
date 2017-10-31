<template>
    <div id="javascript-editor" class='javascript-editor'></div>
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
        props: ["currentView","source","searchValue"],
        //计算
        computed: {
            // this.select = this.fileTotal;
        },
        //方法
        methods: {
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
                this.editor.getSession().setTabSize(6);
            },
            //设置值
            setValue:function(){
                //读取文件中的值
                if(this.source){
                    fs.readFile(this.source,"utf-8",  (err, data)=> {
                   if (err) {
                       return console.error(err);
                   }
                   // console.log("异步读取: " + data.toString());
                   this.editor.setValue(data.toString());
                });
                }else{
                    this.editor.setValue("pragma solidity ^0.4.2");
                }

                // var data = fs.readFileSync(this.source,"utf-8");
                // console.log("同步读取: " + data.toString());

            }

        },
        //生命周期函数
        created() {
        },
        beforeMount() {

        },
        mounted() {
            console.log(11)
            console.log(this.currentView);
            console.log(this.source);
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
            //设置值
            this.setValue();
        },
        //监视
        watch: {
            currentView:function(){
                console.log(this.currentView);
                this.setValue();
            },
            source:function(){
                console.log(this.source);
                this.setValue();
            }
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
.tools{

    height:30px;
    color:#fff;
    background-color:#000;
    position: relative;
    width:100%;
    .tool{
        text-align: right;
        span{
            display: inline-block;
            line-height: 25px;
            padding:0 5px;
            border:1px solid #000;
            cursor: pointer;
            border-left:1px solid #fff;
        }
    }
    .search-model{
        width: 460px;
        height: 40px;
        padding: 5px;
        border-radius: 10px;
        background-color: #000;
        position: absolute;
        top: 30px;
        left: 50%;
        margin-left: -;
        z-index: 1000000;
        margin-left: -230px;
    }
}
.javascript-editor{
    width:100%;
    flex-grow:1;
}

</style>