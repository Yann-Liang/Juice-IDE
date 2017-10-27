<template>
    <div class="">
        <div class="tabs">
            <div class="tool">
                <span class='save' @click='save'>保存当前文件</span>
                <span class="search" @click='search'>搜索</span>
                <span class='format' @click='format' >格式化</span>
                <span class='increase' @click='increase'>字体放大</span>
                <span class='decrease' @click='decrease'>字体缩小</span>
                <span class='close' @click='close'>关闭所有窗口</span>
            </div>
            <div class="search-model" v-if='searchVisible'>
                <div class='search-content'>
                    <el-form :model="form"  :inline="true">
                        <el-form-item label="">
                            <el-input v-model.trim="form.search" placeholder="搜索" style="width:300px;"></el-input>
                        </el-form-item>
                        <el-form-item >
                            <el-button type="primary" @click="onSearch">搜索</el-button>
                        </el-form-item>
                        <el-form-item >
                            <el-button type="primary" @click="offSearch">X</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </div>
        <div id="javascript-editor" style="min-height:562px" class='editor'></div>




    </div>



</template>

<script>
    //import  from ''
    //brace
    import * as ace from 'brace';
    import 'brace/mode/javascript';
    import 'brace/theme/monokai';
    import 'brace/ext/language_tools'
    import '@/services/Mode-solidity'

    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
                editor:{},
                form:{
                   search:"",
                },
                searchVisible:false,

            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {

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
            //点击搜索
            search:function(){
                //弹窗出现
                this.searchVisible = !this.searchVisible;
            },
            //全局搜索
            onSearch:function(){
                this.editor.find(this.form.search,{
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
            //关闭弹窗
            offSearch:function(){
                //弹窗关闭
                this.searchVisible = false;
            },
            //保存当前文件
            save:function(){
                console.log('保存当前文件')
            },
            //代码格式化
            format:function(){
                console.log('代码格式化')
                this.editor.getSession().setTabSize(6);
            },
            //关闭所有窗口
            close:function(){
                console.log('关闭所有窗口')
            },
        },
        //生命周期函数
        created() {

        },
        beforeMount() {

        },
        mounted() {
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
            this.editor.setFontSize(14);
            //自动换行,设置为off关闭
            this.editor.setOption("wrap", "free");

        },
        //监视
        watch: {

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
.tabs{
    height:30px;
    // width:100%;
    background-color:gray;
    position: relative;
    .tool{
        float:right;
        padding:0 10px;
        span{
            display: inline-block;
            line-height: 25px;
            padding:0 5px;
            border:1px solid #000;
            cursor: pointer;
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
        z-index: 1000;
        margin-left: -230px;
    }
}
.editor{
    width:100%;
}

</style>