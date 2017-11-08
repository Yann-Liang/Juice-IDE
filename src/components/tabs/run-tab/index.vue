<template>
    <div class="run-index">
        <el-form :label-position="'top'" label-width="80px" :model="form">
            <el-form-item label="查询需要运行的合约">
                <el-input v-model="form.input" placeholder="输入合约地址"></el-input>
            </el-form-item>
            <el-button class="tab-btn btn-info" @click="queryContract">查询合约</el-button>
        </el-form>
        <el-form :label-position="'top'" label-width="80px" :model="form2">
            <el-form-item label="选择需要运行的函数">
                <el-select v-model="form2.select" placeholder="选择需要运行的函数">
                    <el-option label="区域一" value="shanghai"></el-option>
                    <el-option label="区域二" value="beijing"></el-option>
                </el-select>
            </el-form-item>

            <p class="item darker">输入函数运行所需参数</p>
             <el-form-item label="To">
                <el-input v-model="form.input" placeholder="输入合约地址"></el-input>
            </el-form-item>
             <el-form-item label="Value" class="top20">
                <el-input v-model="form.input" placeholder="输入合约地址"></el-input>
            </el-form-item>
            <el-button class="tab-btn btn-info" @click="run">运行</el-button>
        </el-form>

    </div>
</template>

<script>
    //import  from ''

    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
                form:{
                    input:''
                },
                form2:{

                }
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
            queryContract(){
                console.log('queryContract',this.form.input)
            },
            run(){
                console.log(11)
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

        },
        //过滤器
        filters: {

        },
        //自定义指令
        directive: {

        }
    }
</script>

<style lang="less" scoped>
    @import "../../../less/modules/theme.less";
    .run-index{
        padding:28px 10px;
        color:#666;
        .el-form-item{
            margin-bottom:10px;
        }
    }
    .tab-btn,.item{
        margin:30px 0 20px;
    }
    .top20{
        margin-top:20px;
    }
</style>