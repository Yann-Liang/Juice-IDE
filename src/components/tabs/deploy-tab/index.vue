<template>
    <div class="deploy">
        <el-form :label-position="'top'" label-width="220px" :model="form">
            <el-form-item label="选择需要部署的合约">
                <el-select v-model="form.select" placeholder="选择合约文件">
                    <el-option v-for="(item,key) in compileResult" :key="key" :label="item.name" :value="key"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="">
                <el-select v-model="form.contractItem" placeholder="选择合约文件">
                    <el-option v-for="(item,index) in compileData" :key="index" :label="item.contractName" :value="item"></el-option>
                </el-select>
            </el-form-item>
        </el-form>

        <el-button class="tab-btn btn-info" @click="deploy" :disabled="disabled">部署合约</el-button>
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
                deployedData:contractServies.data,
                user:{
                    address:''
                }
            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {
            ...mapGetters(['compileResult','activeEditor']),
            disabled:function(){
                return !(this.form.select && this.form.contractItem);
            },
            compileData(){
                return this.form.select?this.compileResult[this.form.select].data :[];

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
                let item=this.form.contractItem,
                deploy=()=>{
                    contractServies.deploy(this.compileResult[this.form.select].name,item.contractName,item.abi,item.bin,this.user.userAddress).then((address)=>{
                        if(address){
                            this.form.address=address;
                            this.flag=true;
                        }else{
                            this.flag=false;
                        }
                    })
                }
                this.user.address?deploy():this.getUserInfo(deploy);
            },
            getContractLog(){
                contractServies.getContractLog()
            },
            //没有选择合约文件 选择编辑区当前编辑的文件
            autoSelet(){
                if(!this.form.select){
                    for (const key in this.compileResult) {
                        if (this.compileResult.hasOwnProperty(key)) {
                            if(this.activeEditor.value== key){
                                this.form.select=key;
                            }

                        }
                    }
                }
            },
            getUserInfo(callback){
                this.user.address='0x00c7d00f41f528794f002de6a8fe72ec35519ae6'//;'0x3864bc90a9b8ee5f6d414d6ef3e459f2a3513668'
                try {
                    Juice.user.getUserInfo((res)=>{
                        if(!res.code){
                            console.log('Juice.user.getUserInfo',res);
                            this.user=res.data;
                            callback&&callback();
                        }
                    })
                } catch (error) {

                }
            }
        },
        //生命周期函数
        created() {
            this.autoSelet();
            this.getUserInfo();
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