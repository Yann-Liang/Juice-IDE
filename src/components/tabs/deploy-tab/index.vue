<template>
    <div class="deploy">
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

        <el-button class="tab-btn btn-info" @click="deploy" :disabled="disabled">部署合约</el-button>
        <el-button class="tab-btn btn-info" @click="getContractLog">日志</el-button>
        <run ref="ref" v-if="flag" :abi="form.contractItem.abi" :address="form.address"></run>

    </div>
</template>

<script>
    //import  from ''
    import {mapState, mapActions, mapGetters} from 'vuex';
    import contractServies from '@/services/contract-servies';
    import APIServies from '@/services/API-servies';
    import run from "@/components/run/";

    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
                abi:[],
                form:{
                    select:'',
                    contractItem:'',
                    address:'',
                },
                flag:false,
                args:[],
                deployedData:contractServies.data
            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {
            ...mapGetters(['compileResult',/*'deployedData'*/]),
            disabled:function(){
                return !(this.form.select && this.form.contractItem);
            },
            contractFn:function() {
                console.log(this.deployedData,this.form2.selectDeployData)
                // return this.deployedData[this.form2.selectDeployData].contract.abi
            },
            runDisabled:function() {
                let bool=false;
                // for(let i=0;i<this.form2.selectFnIndex.inputs.length;i++){
                //      console.log(this.selectFnIndex.inputs[i].arg)
                //     if(!this.selectFnIndex.inputs[i].arg){
                //         bool=true;
                //         break;
                //     }
                // }
                return bool;
            }
        },
        //方法
        methods: {
            deploy(){
                let item=this.form.contractItem;
                contractServies.deploy(this.form.select.name,item.contractName,item.abi,item.bin,'0x859376269bb8a56f63f8b8964430c68f69e1cba0').then((address)=>{
                    console.log('address',address)
                     this.form.address=address;
                     this.flag=true;
                })
            },
            getContractLog(){
                contractServies.getContractLog()
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
            run
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
    .deploy{
        padding:28px 10px;
        color:#666;
        .el-form-item{
            margin-bottom:10px;
        }
    }
    .tab-btn{
        margin:20px 0 30px;
    }
</style>