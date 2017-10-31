<template>
    <div>
        <div class="log-header">
            <h4>
                <span>控制台</span>
                <span class="search">
                    <input :style="{backgroundColor:hasMatch?'#333':'#6f3c37'}" type="text" v-model="inputValue" placeholder="搜索" @focus="saveData" @input="searchFn()" @keyup.enter="near(1)" @keyup.up="near(-1)" @keyup.down="near(1)">
                    <span class="direction" @click="near(-1)">↑</span>
                    <span class="direction" @click="near(1)">↓</span>
                    <span class="icon" @click="viewLog()">trigger icon</span>
                </span>
            </h4>
        </div>
        <div v-show="consoleFlag" class="log-area">
            <div class="log-output" id="log-id">
                <div class="log-detail">
                    <ul>
                        <li v-for="(item,index) in consoleDetail" :key="index" class="log-item">
                            <p v-if="typeof(item)=='string'">{{item}}</p>
                            <p v-if="item.path">{{item.path}}:</p>
                            <ul v-if="item.error" class="error">
                                <li v-for="(errorItem,errorIndex) in item.error" :key="errorIndex"> {{errorItem}} </li>
                            </ul>
                            <div v-if="item.data">
                                <ul>
                                    <li class="log-item-title" v-for="(value,key) in item.data" :key="key"><span class="log-title">{{key}}</span>{{value}}</li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="command-line" id="command" contenteditable="true" @focus="command()" @blur="commandBlur" @keyup.13="comply($event)">
                请输入需要执行的命令
            </div>
        </div>
    </div>
</template>

<script>
    import {mapState, mapActions, mapGetters} from 'vuex';
    import consoleService from '@/services/console/console-service';
    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
                inputValue:"",
                htmlData:"",
                current:0,
                regList:[],
                hasMatch:true
            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {
            ...mapGetters(['compileStatus','consoleFlag','consoleDetail'])
        },
        //方法
        methods: {
            viewLog(){
                consoleService.trigger(!this.consoleFlag);
            },
            saveData(){
                this.htmlData = document.getElementById('log-id').innerHTML;
            },
            searchFn(){
                consoleService.trigger(true);
                this.highlight(this.inputValue);
            },
            highlight(key) {
                document.getElementById('log-id').innerHTML = data;
                var data = JSON.parse(JSON.stringify(this.htmlData));
                if(key && key.length>0){
                    var reg =  new  RegExp(key+ "(?=[^<>]*<)" , "ig" );
                    //高亮显示
                    document.getElementById('log-id').innerHTML=data.replace(reg,'<span style="background-color:#2b5170;border:solid 1px #0066cc;color:#fff" class="high-lighter">' +key+ '</span>' );
                    //滚动条定位
                    this.regList = document.getElementsByClassName('high-lighter');
                    var container = this.$el.querySelector("#log-id");
                    if(container && this.regList.length>0){ //有匹配值
                        container.scrollTop = this.regList[0].offsetTop-container.offsetTop;
                        this.current = 0;
                        this.regList[0].style.backgroundColor="#0066cc";
                        this.hasMatch = true;
                    }else{ //无匹配值
                        this.hasMatch = false;
                    }
                }else{
                    document.getElementById('log-id').innerHTML=data;
                }
            },
            near(dir){
                if(this.regList.length>0){
                    this.current = this.current+dir<0?0:this.current+dir>this.regList.length-1?this.regList.length-1:this.current+dir;
                }
            },
            command(){
                var commandLine = this.$el.querySelector("#command");
                commandLine.innerText = commandLine.innerText=='请输入需要执行的命令'?'':commandLine.innerText
            },
            commandBlur(){
                var commandLine = this.$el.querySelector("#command");
                commandLine.innerText=commandLine.innerText==""?"请输入需要执行的命令":commandLine.innerText;
            },
            comply(){
                var commandLine = this.$el.querySelector("#command");
                consoleService.command(commandLine.innerText);
                commandLine.innerText='';
            }
        },
        mounted() {
        },
        watch: {
            consoleDetail:function(){
                var container = this.$el.querySelector("#log-id");
                var timer = setInterval(function(){
                    if(container){
                        var copy;
                        if(container.scrollTop < container.scrollHeight){
                            copy = container.scrollTop;
                            container.scrollTop += 800;
                            if(copy == container.scrollTop){
                                clearInterval(timer);
                            }
                        }else{
                            clearInterval(timer);
                        }

                    }

                },100)
            },
            current:function(val,old){
                var container = this.$el.querySelector("#log-id");
                this.regList[old].style.backgroundColor="#2b5170";
                this.regList[old].style.borderColor="#0066cc";
                if(container){
                    container.scrollTop = this.regList[this.current].offsetTop-container.offsetTop;
                    this.regList[val].style.backgroundColor="#0066cc";
                    this.regList[val].style.borderColor="#0b8aee";
                }
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

<style lang="less" scoped>
    .log-header{
        align-items:flex-end;
        h4{
            padding:0 10px;
            height:50px;
            line-height:50px;
            background-color: #000;
            color:#fff;
            .search{
                float:right;
            }
            .icon{
                cursor:pointer;
            }
            input{
                padding-left:10px;
                width:180px;
                height:28px;
                line-height:28px;
                border-style:none;
                color:#bbb;
            }
        }
    }
    .log-area{
        background-color: #222;
    }
    .log-output{
        height:300px;
        overflow-x: hidden;
        overflow-y: auto;
        padding:10px 15px;
        line-height:24px;
        color:#fff;
        background-color: #222;
    }
    .log-output::-webkit-scrollbar-track {
        background-color: #222;
        -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.22);
     }
    .log-output::-webkit-scrollbar {
        width: 10px;
        background-color: #222;
    }
    .log-output::-webkit-scrollbar-thumb {
        background-color: #555;
        height:50px;
        border-radius: 10px;
    }
    .log-item{
        margin-bottom:15px;
    }
    .log-item-title{
        margin-bottom:10px;
    }
    .error{
        color:orange;
    }
    .success{
        color:green;
    }
    .failed{
        color:red;
    }
    .log-detail{
        p,li,span{
            word-break:break-all;
        }
    }
    .log-title{
        margin-right:30px;
        color:#20a0ff;
    }
    .direction{
        padding:0 6px;
        cursor:pointer;
    }
    .command-line{
        margin-top:16px;
        padding-left:20px;
        line-height:34px;
        color:#bbb;
        background-color: #333;
    }
</style>