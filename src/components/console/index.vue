<template>
    <div class="console" :style="{height:consoleHeight+'px'}">
        <div class="log-header">
             <i class="log-border" @mousedown="mousedown($event)"></i>
            <h4 class="bggray">
                <span class="default no-chose"  ondragstart="return false">控制台</span>
                <span class="search no-chose">
                    <input class="dark" :style="{backgroundColor:hasMatch?'#fff':'#d43718'}" type="text" v-model="inputValue" placeholder="搜索" @focus="saveData" @input="searchFn()" @keyup.enter="near(1)" @keyup.right="near(1)" @keyup.left="near(-1)" @keyup.up="near(-1)" @keyup.down="near(1)">
                    <!--<span class="direction" @click="near(-1)">↑</span>-->
                    <!--<span class="direction" @click="near(1)">↓</span>-->
                     <span class="icon" @click="viewRecord()"><i class="iconfont info">&#xe628;</i></span>
                     <span class="icon" v-if="consoleFlag" @click="viewLog()"><i class="iconfont info">&#xe62d;</i></span>
                    <span class="icon" v-else @click="viewLog()"><i class="iconfont info">&#xe62c;</i></span>
                </span>
            </h4>
        </div>
        <div v-show="consoleFlag" class="log-area bgwhite">
            <div class="log-output bgwhite default" id="log-id">
                <div class="log-detail">
                    <ul>
                        <li v-for="(item,index) in consoleDetail" :key="index" class="log-item">
                            <div v-if="typeof(item)=='object'">
                                <div v-if="item.path">
                                    <p v-if="item.path">{{item.path}}:</p>
                                    <ul v-if="item.error" class="danger">
                                        <li v-for="(errorItem,errorIndex) in item.error" :key="errorIndex"> {{errorItem}} </li>
                                    </ul>
                                    <div v-if="item.data">
                                        <ul>
                                            <li v-for="(value,key) in item.data" :key="key" class="console-item">
                                                <p v-for="(obj,objKey) in value" :key="objKey">
                                                    <span class="log-title info">{{objKey}}</span>
                                                    <span >{{obj}}</span>
                                                </p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div v-else>
                                    <p v-if="item.logError" class="danger">{{item.logError}}</p>
                                    <p v-else-if="item.logSuccess" class="success" >{{item.logSuccess}}</p>
                                    <p v-else-if="item.logInfo" class="info">{{item.logInfo}}</span></p>
                                    <p v-else-if="item.logWarning" class="warning">{{item.logWarning}}</p>
                                    <p v-else v-for="(obj,objKey) in item" :key="objKey">
                                        <span v-if="JSON.stringify(obj)!=='{}'">
                                            <span class="log-title info">{{objKey}}</span>
                                            <span>{{obj}}</span>
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div v-else>
                                <p>{{item}}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="command-line bggray dark" id="command" contenteditable="true" @focus="command()" @blur="commandBlur" @keyup.enter="comply($event)" @keyup.up="complyNear($event,-1)" @keyup.down="complyNear($event,1)">
                请输入需要执行的命令
            </div>
        </div>
         <div class="log-ghostbar bgblue" :style="{bottom:ghostbarBottom+'px'}" v-if="ghostbarFlag"></div>
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
                hasMatch:true,
                currentCommand:0,
                ghostbarFlag:false,
                ghostbarBottom:287,
            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {
            ...mapGetters(['compileStatus','consoleFlag','consoleDetail','commandList','editor','consoleHeight'])
        },
        //方法
        methods: {
            ...mapActions(['updateConsoleHeight']),
            viewLog(){
                // this.editor.resize(false);
                consoleService.trigger(!this.consoleFlag);
                // if(this.consoleFlag == true){

                // }
                this.updateConsoleHeight(this.consoleFlag?287:34);
            },
            viewRecord(){
                var log = window.localStorage.getItem('deployLog');
                if(log){
                    var arr = JSON.parse(log);
                    arr.forEach(function(item){
                        consoleService.output(item)
                    });
                }else{
                    consoleService.output('未找到部署记录~');
                }
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
                    document.getElementById('log-id').innerHTML=data.replace(reg,'<span style="border:solid 1px #0066cc;" class="high-lighter">' +key+ '</span>' );
                    //滚动条定位
                    this.regList = document.getElementsByClassName('high-lighter');
                    var container = this.$el.querySelector("#log-id");
                    if(container && this.regList.length>0){ //有匹配值
                        container.scrollTop = this.regList[0].offsetTop-container.offsetTop;
                        this.current = 0;
                        this.regList[0].style.backgroundColor="#0066cc";
                        this.regList[0].style.color="#fff";
                        this.hasMatch = true;
                    }else{ //无匹配值
                        this.hasMatch = false;
                    }
                }else{
                    this.hasMatch = true;
                    document.getElementById('log-id').innerHTML=data;
                }
            },
            near(dire){
                if(this.regList.length>0){
                   this.current = (this.current+dire<0)?this.regList.length-1:(this.current+dire>this.regList.length-1)?0:this.current+dire;
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
            comply(e){
                e.preventDefault();
                var commandLine = this.$el.querySelector("#command");
                if(commandLine.innerText && !/^\s*$/.test(commandLine.innerText)){
                    consoleService.command(commandLine.innerText);
                    commandLine.innerText='';
                    this.currentCommand = this.commandList.length;
                }
            },
            complyNear(e,dire){
                if(this.commandList.length==0)return;
                this.currentCommand = (this.currentCommand+dire<0)?0:(this.currentCommand+dire>this.commandList.length-1)?this.commandList.length-1:this.currentCommand+dire;
                var commandLine = this.$el.querySelector("#command");
                commandLine.innerHTML = this.commandList[this.currentCommand];
            },
            mousedown(event){
                const cancelGhostbar =(event)=> {
                    if (event.keyCode === 27) {
                    document.body.removeChild(ghostbar)
                    document.removeEventListener('mousemove', moveGhostbar)
                    document.removeEventListener('mouseup', removeGhostbar)
                    document.removeEventListener('keydown', cancelGhostbar)
                    }
                },getPosition =(event)=>  {
                    return document.body.clientHeight-event.pageY;
                },moveGhostbar  =(event)=>  {
                    this.ghostbarBottom = getPosition(event)
                },removeGhostbar =(event)=>  {
                    this.ghostbarFlag=false;
                    document.removeEventListener('mousemove', moveGhostbar)
                    document.removeEventListener('mouseup', removeGhostbar)
                    document.removeEventListener('keydown', cancelGhostbar)
                    let data=getPosition(event);
                    if(data<120){
                        this.updateConsoleHeight(120);
                    }else{
                        this.updateConsoleHeight(data);
                    }
                    this.height=data;
                }
                if (event.which === 1) {
                    moveGhostbar(event)
                    this.ghostbarFlag=true;
                    document.addEventListener('mousemove', moveGhostbar)
                    document.addEventListener('mouseup', removeGhostbar)
                    document.addEventListener('keydown', cancelGhostbar);

                }
            },
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
                this.regList[old].style.backgroundColor="#fff";
                this.regList[old].style.borderColor="#0066cc";
                this.regList[old].style.color="#333";
                if(container){
                    container.scrollTop = this.regList[this.current].offsetTop-container.offsetTop;
                    this.regList[val].style.backgroundColor="#0066cc";
                    this.regList[val].style.borderColor="#0b8aee";
                    this.regList[val].style.color="#fff";
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
    @import "../../less/modules/theme.less";
    .console{
        display: flex;
        flex-direction: column;
        height: 287px;
    }
    .log-header{
        position: relative;
        align-items:flex-end;
        h4{
            padding:0 14px 0 10px;
            height:32px;
            line-height:32px;
            border-top:solid 1px #e4e4e4;
            .search{
                float:right;
            }
            .icon{
                margin-left:20px;
                cursor:pointer;
            }
            input{
                position: relative;
                top: -2px;
                padding-left:10px;
                width:200px;
                height: 22px;
                line-height: 22px;
                border:solid 1px #e7e7e7;
                &:focus{
                    outline:none;
                    border:solid 1px @blue;
                }
            }
        }
    }
    .log-border{
        position: absolute;
        width: 100%;
        height: 3px;
        cursor: row-resize;
        background-color: transparent;
    }
    .log-output{
        flex: 1;
        box-sizing:border-box;
        width:100%;
        overflow-x: hidden;
        overflow-y: auto;
        padding:10px 15px;
        line-height:24px;
    }
    .log-output::-webkit-scrollbar {
        width:5px;
        height:5px;
    }
    .log-output::-webkit-scrollbar-track-piece {
        background:#fff;
    }
    .log-output::-webkit-scrollbar-thumb{
        background:#e5e5e5;
        height:50px;
        border-radius:5px;
        z-index:999999;
    }
    .log-item{
        margin-bottom:15px;
    }
    .log-item-title{
        margin-bottom:10px;
    }
    .log-area{
        flex: 1;
        display: flex;
        width: 100%;
        flex-direction: column;
    }
    .log-detail{
        p,li,span{
            word-break:break-all;
        }
        p{
            margin-bottom:10px;
            line-height:16px;
        }
    }
    .log-title{
        margin-right:30px;
    }
    .console-item{
        margin-bottom:10px;
    }
    .direction{
        padding:0 6px;
        cursor:pointer;
    }
    .command-line{
        padding-left:25px;
        line-height:28px;
        font-size:12px;
        border:solid 1px transparent;
        background: url('./images/command.png') no-repeat 10px center;
        &:focus{
            outline:none;
            border:solid 1px @blue;
         }
    }
    .log-ghostbar{
        height:3px ;
        opacity           : 0.5;
        position          : fixed;
        cursor            : row-resize;
        z-index           : 9999;
        left: 0px;
        right: 0px;
    }
</style>