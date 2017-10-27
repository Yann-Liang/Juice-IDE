<template>
    <div>
        <div class="log-header">
            <h4>
                <span>控制台</span>
                <span class="fr" @click="viewLog()">trigger icon</span>
            </h4>
        </div>
        <div class="log-output" v-if="consoleFlag" id="log-id">
            <div class="log-detail">
                <ul>
                    <li v-for="(item,index) in consoleDetail" :key="index" class="log-item">
                        <p v-if="typeof(item)=='string'">{{item}}</p>
                        <p v-if="item.path">{{item.path}}:</p>
                        <p v-if="item.error" class="error">{{item.error}}</p>
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
            .fr{
                cursor:pointer;
                float:right;
            }
        }
    }
    .log-output{
        height:300px;
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
        p,li{
            word-break:break-all;
        }
    }
    .log-title{
        margin-right:30px;
        color:#20a0ff;
    }
</style>