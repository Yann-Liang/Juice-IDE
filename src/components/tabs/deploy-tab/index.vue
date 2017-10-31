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

        <el-button class="tab-btn" type="primary" @click="deploy">部署合约</el-button>
    </div>
</template>

<script>
    //import  from ''
    import {mapState, mapActions, mapGetters} from 'vuex';
    import contractServies from '@/services/contract-servies';

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
            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {

        },
        //计算
        computed: {
            ...mapGetters(['compileResult',])
        },
        //方法
        methods: {
            deploy(){
                let item=this.form.contractItem;
                let deployeAddr='0x268bb04bd0ce585a7fffda8fe0ddc27f89252359';
                let calcContract = contractServies.web3.eth.contract(item.abi),
                    deployCode = item.bin;
                 console.log('deployCode',deployCode,'from',deployeAddr,contractServies.web3.eth.accounts[0])
                let myContractReturned = calcContract.new({
                    data: deployCode,
                    from: deployeAddr
                }, function(err, myContract) {console.log('err, myContract',err, myContract)
                    if (!err) {
                        if (!myContract.address) {
                            console.log("contract deploy transaction hash: " + myContract.transactionHash) //部署合约的交易哈希值
                        } else {
                            console.log("contract deploy address: " + myContract.address) // 合约的部署地址

                            //使用transaction方式调用，写入到区块链上
                            myContract.add.sendTransaction(1, 2,{
                                from: deployeAddr
                            });

                            console.log("after contract deploy, call:" + myContract.getCount.call());
                        }
                    }
                });

                //注意，异步执行，此时还是没有地址的。
                console.log("returned deployed didn't have address now: " + myContractReturned.address);
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

</style>