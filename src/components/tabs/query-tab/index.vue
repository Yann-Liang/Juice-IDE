<template>
    <div class="run-index">
        <el-form :label-position="'top'" label-width="80px" :model="form">
            <el-form-item label="查询需要运行的合约">
                <el-input v-model="form.address" placeholder="输入合约地址"></el-input>
            </el-form-item>
            <el-form-item>
                <el-input
                    type="textarea"
                    :rows="8"
                    placeholder="输入合约ABI" v-model="form.abi"></el-input>
            </el-form-item>
            <el-button class="tab-btn btn-info" @click="query">查询合约</el-button>
        </el-form>
    	<run v-if="flag" :abi="abi" :address="form.address"></run>
        <validation :valid-flag="validFlag" @emitDeploy='queryContract' @close="closeValidation"></validation>
    </div>
</template>

<script>
    //import  from ''
	import contractServies from '@/services/contract-servies';
	import run from "@/components/run/";
    import validation from "@/components/validation/";

    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
                form:{
                    address:'',
                    abi:'',
                },
				flag:false,
                abi:[],
                validFlag:false,
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
            query(){
                this.validFlag=true;
            },
            queryContract(){
                this.validFlag=false;
				console.log('queryContract',this.form);
				let contract=contractServies.queryContract(this.form.address,this.form.abi);
				if(contract){
					this.flag=true;
					this.abi=contract.abi;
				}
            },
             closeValidation(){
                this.validFlag=false;
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
            run,
            validation,
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