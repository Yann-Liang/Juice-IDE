<template>
    <div class="log-output">
        <p v-if="compileStatus < 4">[开始编译]</p>
        <p v-if="compileStatus < 4">编译中...</p>
        <div class="compile-success" v-if="compileStatus == 2">
            <p>Compiler Success</p>
        </div>
        <div class="compile-failed" v-if="compileStatus == 3">
            <p>Compiler Failed</p>
        </div>
    </div>
</template>

<script>
    import {mapState, mapActions, mapGetters} from 'vuex';
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
            ...mapGetters(['compileStatus'])
        },
        //方法
        methods: {

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
    .log-output{
        padding:10px 15px;
        line-height:30px;
        color:#fff;
        background-color: #222;
    }
</style>