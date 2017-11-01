<template>
    <div class="">
        <el-form :label-position="'top'" label-width="220px" :model="form">
            <el-form-item label="选择需要部署的合约">
                <el-select v-model="form.select" placeholder="选择合约文件">
                    <el-option v-for="(item,index) in compileResult" :key="index" :label="item.name" :value="item"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="">
                <el-select v-model="form.contractItem" placeholder="选择合约文件">
                    <el-option v-for="(item,index) in form.select.data" :key="index" :label="item.contractName" :value="item"></el-option>
                </el-select>
            </el-form-item>
        </el-form>

        <el-button class="tab-btn" type="primary" @click="deploy" :disabled="disabled">部署合约</el-button>
        <div v-if="flag">
            <el-form :label-position="'top'" label-width="80px" :model="form2">
                <el-select v-model="form2.selectDeployData" placeholder="选择合约文件">
                    <el-option v-for="(item,index) in deployedData" :key="index" :label="item.contractAddress" :value="item.contractAddress"></el-option>
                </el-select>
            </el-form>
            <el-form :label-position="'top'" label-width="80px" :model="form2">
                <el-select v-model="form2.selectFn" placeholder="运行选择需要运行的函数">
                    <el-option v-for="(item,index) in contractFn" :key="index" :label="item.name" :value="item"></el-option>
                </el-select>

                <p>输入函数运行所需参数</p>
                <el-form-item v-for="(item,index) in form2.selectFn.inputs" :key="index" :label="item.name">
                    <el-input v-model="form2.agrs[index]" :placeholder="item.type"></el-input>
                </el-form-item>

                <el-button class="tab-btn" type="primary" @click="run">运行</el-button>
            </el-form>

        </div>
    </div>
</template>

<script>
    //import  from ''
    import {mapState, mapActions, mapGetters} from 'vuex';
    import deployServies from '@/services/deploy-servies';

    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
                form:{
                    select:'',
                    contractItem:'',
                    input:''
                },
                form2:{
                    selectDeployData:'',
                    selectFn:{
                        inputs:[]
                    },
                    args:[]
                },
                flag:false,
            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {
            ...mapGetters(['compileResult','deployedData']),
            disabled:function(){
                return !(this.form.select && this.form.contractItem);
            },
            contractFn:function() {
                console.log(this.deployedData[this.form2.selectDeployData])
                return this.deployedData[this.form2.selectDeployData].abi
            }
        },
        //方法
        methods: {
            deploy(){
                let item=this.form.contractItem;
                deployServies.deploy(this.form.select.name,item.contractName,item.abi,item.bin,'0x268bb04bd0ce585a7fffda8fe0ddc27f89252359').then((address)=>{
                    console.log(deployServies.data)
                    this.form2.selectDeployData=address;
                    this.flag=true;
                })
            },
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
        filters:{

        },
        //自定义指令
        directive:{

        }
    }
</script>

<style lang="less" scoped>

</style>