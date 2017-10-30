<template>
    <div>
        <div class="log-header">
            <h4>
                <span>控制台</span>
                <span class="search">
                    <input type="text" v-model="inputValue" placeholder="搜索" @focus="saveData" @input="searchFn()">
                    <span class="direction" @click="near(-1)">↑</span>
                    <span class="direction" @click="near(1)">↓</span>
                    <span class="icon" @click="viewLog()">trigger icon</span>
                </span>
            </h4>
        </div>
        <div class="log-output" v-show="consoleFlag" id="log-id">
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
                regList:[]
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
                var reg =  new  RegExp(key+ "(?=[^<>]*<)" , "ig" );
                //高亮显示
                document.getElementById('log-id').innerHTML=data.replace(reg,'<span style="background-color:#0066cc;color:#fff" class="high-lighter">' +key+ '</span>' );
                //滚动条定位
                this.regList = document.getElementsByClassName('high-lighter');
                var container = this.$el.querySelector("#log-id");
                if(container && this.regList.length>0){
                    container.scrollTop = this.regList[0].offsetTop-container.offsetTop;
                    this.current = 0;
                }
            },
            near(dir){
                if(this.regList.length>0){
                    this.current = this.current+dir<0?0:this.current+dir>this.regList.length-1?this.regList.length-1:this.current+dir;
                }
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
            current:function(){
                var container = this.$el.querySelector("#log-id");
                console.info(container.offsetTop);
                if(container){
                    container.scrollTop = this.regList[this.current].offsetTop-container.offsetTop;
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
                background-color: #333;
            }
        }
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
</style>