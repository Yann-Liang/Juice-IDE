<template>
    <div class="">
        <div class="file-tab">
            <div class="tabs" ref='tabs'>
                <div class='scroll-bar left-bar' ref='leftbar' @click='scrollLeft' >
                    <i>&lt;</i>
                </div>
                <ul class='files' ref='files'>
                    <li class='file' v-for="(item,index) in fileData" :key='item.name' :class="{'li-active':select===index}"  v-on:click="selectProp(index,item)">
                        <span>{{item.name}}</span>
                        <span class="remove" @click="remove">X</span>
                    </li>
                </ul>
                <div class='scroll-bar right-bar' @click='scrollRight' ref='rightbar'>
                    <i>&gt;</i>
                </div>
            </div>
        </div>
        <div class="tools">
            <div class="tool">
                <span class='save' @click='save'>保存</span>
                <span class="search" @click='search'>搜索</span>
                <span class='format' @click='format' >格式化</span>
                <span class='increase' @click='increase'>放大</span>
                <span class='decrease' @click='decrease'>缩小</span>
                <span class='close' @click='close'>关所</span>
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
        <v-editor :currentView='currentView' :source='source' :searchValue='searchValue' keep-alive  class='javascript-editor' ref="childMethod"></v-editor>
    </div>
</template>

<script>
    //import  from ''
    //brace
    import Editor from '@/components/editor-panel/panel'

    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
                form:{
                   search:"",
                },
                searchValue:"",
                searchVisible:false,
                vistual:200,
                activeClass:"",
                fileData:[
                    {"value":"E:/wamp/www/webapp/static/js/js/apply.js","name":"apply.js"},
                    {"value":"E:/wamp/www/webapp/static/js/js/block.js","name":"block.js"},
                    {"value":"E:/wamp/www/webapp/static/js/js/contract.js","name":"contract.js"},
                    {"value":"E:/wamp/www/webapp/static/js/js/dept.js","name":"dept.js"}
                ],
                fileTotal:10,
                select:0,
                currentView:0,
                source:"E:/wamp/www/webapp/static/js/js/apply.js"
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
                this.$refs.childMethod.increase();
                // this.editor.setFontSize(this.editor.getFontSize() + 1)
            },
            //缩小
            decrease:function(){
                this.$refs.childMethod.decrease();
                // this.editor.setFontSize(this.editor.getFontSize() - 1)
            },
            //点击搜索
            search:function(){
                //弹窗出现
                this.searchVisible = !this.searchVisible;
            },
            //全局搜索
            onSearch:function(){
                this.searchValue = this.form.search;
                this.$refs.childMethod.onSearch();
                // this.editor.find(this.form.search,{
                //     backwards: false,
                //     wrap: false,
                //     caseSensitive: true,
                //     wholeWord: false,
                //     regExp: false,
                //     range:""
                // });
                // this.editor.findNext();
                // this.editor.findPrevious();
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
                console.log('代码格式化');
                this.$refs.childMethod.format();
                // this.editor.getSession().setTabSize(6);
            },
            //关闭所有窗口
            close:function(){
                console.log('关闭所有窗口')
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
                        this.$refs.files.style.left = `${currentLeft - hiddenRight - 50}px`
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
                this.source = item.value;
            },
            //移除当前文件
            remove:function(){

            },

        },
        //生命周期函数
        created() {

        },
        beforeMount() {

        },
        mounted() {

        },
        //监视
        watch: {

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
.file-tab{
    height:30px;
    // width:100%;
    background-color:gray;
    position: relative;
    overflow:hidden;
    .tabs{
        width:100%;
        position: relative;
        .scroll-bar{
            position: absolute;
            width:20px;
            height:30px;
            background:red;
            color:#fff;
            top:0;
            z-index:999;
            // height:100%;
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
            height:30px;
            line-height: 30px;
            position: absolute;
            left:20px;
            overflow:hidden;
            cursor: pointer;
            li{
                width:100px;
                border-right:1px solid #fff;
                background-color:hsla(229, 100%, 97%, 1);
                color:#000;
                text-align: center;
                span{
                    display: inline-block;
                    line-height: 30px;
                    &:last-child{
                        float:right;
                        padding:0 10px;
                        &:hover{
                            background-color:gray
                        }
                    }
                }
            }
            .li-active{
                color: red;
                font-weight: bold;
                border-bottom: 0 none;

            }
        }

    }
}
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