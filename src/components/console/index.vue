<template>
    <div>
        <div class="log-header">
            <h4>
                <span>控制台</span>
                <span class="fr" @click="viewLog()">trigger icon</span>
            </h4>
        </div>
        <div class="log-output" v-if="consoleFlag">
            <p v-if="compileStatus > 0">[开始编译]</p>
            <p v-if="compileStatus > 0">编译中...</p>
            <div class="compile-success" v-if="compileStatus == 2">
                <p>Compiler Success</p>
                <div>
                    <div class="log-kind"></div>
                    <div class="log-cont"></div>
                </div>
            </div>
            <div class="compile-failed" v-if="compileStatus == 3">
                <p>Compiler Failed</p>
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
            ...mapGetters(['compileStatus','consoleFlag','compileResult'])
        },
        //方法
        methods: {
            viewLog(){
                consoleService.trigger(!this.consoleFlag);
            }
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
        padding:10px 15px;
        line-height:30px;
        color:#fff;
        background-color: #222;
    }
</style>