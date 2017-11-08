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
        <div v-if="flag">
            <el-form :label-position="'top'" label-width="80px" :model="form2">
                <el-select v-model="form2.selectDeployData" filterable  placeholder="选择合约文件">
                    <el-option v-for="(item,index) in deployedData" :key="index" :label="item.contractAddress" :value="item.contractAddress"></el-option>
                </el-select>
            </el-form>
            <el-form :label-position="'top'" label-width="80px" :model="form2">
                <el-form-item label="选择需要运行的函数">
                    <el-select v-model="form2.selectFn" placeholder="运行选择需要运行的函数">
                        <el-option v-for="(item,index) in contractFn" :key="index" :label="item.name" :value="index"></el-option>
                    </el-select>
                </el-form-item>
                <p class="darker">输入函数运行所需参数</p>
                <el-form-item v-for="(item,index) in contractFn[form2.selectFn].inputs" :key="index" :label="item.name">
                    <el-input v-model="args[index].arg" :placeholder="item.type"></el-input>
                </el-form-item>

                <el-button class="tab-btn btn-info" @click="run" :disabled="runDisabled">运行</el-button>
            </el-form>

        </div>
    </div>
</template>

<script>
    //import  from ''
    import {mapState, mapActions, mapGetters} from 'vuex';
    import contractServies from '@/services/contract-servies';
    import APIServies from '@/services/API-servies';

    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
                form:{
                    select:'',
                    contractItem:'',
                },
                form2:{
                    selectDeployData:'',
                    selectFn:0,

                },
                flag:false,
                args:[{},{}],
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
                console.log(this.deployedData[this.form2.selectDeployData])
                return this.deployedData[this.form2.selectDeployData].contract.abi
            },
            runDisabled:function() {
                let bool=false;
                // for(let i=0;i<this.form2.selectFn.inputs.length;i++){
                //      console.log(this.selectFn.inputs[i].arg)
                //     if(!this.selectFn.inputs[i].arg){
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
                contractServies.deploy(this.form.select.name,item.contractName,item.abi,item.bin,'0x2619db00823169359d24697fb38fff5062e11334').then((address)=>{
                    console.log('address',address)
                    this.form2.selectDeployData=address;
                    this.flag=true;
                })
            },
            queryContract(){
                console.log('queryContract',this.form.input)
            },
            run(){
                console.log(this.args);
                let argsList=[],
                    inputs=this.contractFn[this.form2.selectFn].inputs;
                for(let i=0;i<this.args.length;i++){
                    if(inputs[i].type=='string'){
                        argsList[i]=this.args[i].arg;
                    }else{
                        try{
                            argsList[i]=Number(this.args[i].arg);
                        }catch(e){
                            console.warn(e);
                            argsList[i]=this.args[i].arg;
                        }
                    }
                }
                contractServies.run(this.form2.selectDeployData,this.contractFn[this.form2.selectFn].name,this.form2.selectFn,argsList).then((res)=>{
                    console.log('run result=',res)
                })
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
            'form2.selectFn':function () {
                //alert(12323);
                //this.args=
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