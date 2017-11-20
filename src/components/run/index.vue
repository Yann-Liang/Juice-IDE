<template>
    <el-form :label-position="'top'" label-width="80px" :model="form">

		<el-form-item label="选择需要运行的函数">
			<el-select filterable v-model="form.selectFnIndex" placeholder="运行选择需要运行的函数">
				<el-option v-for="(item,index) in abi" :key="index" :label="item.name" :value="index"></el-option>
			</el-select>
		</el-form-item>
		<p class="darker">输入函数运行所需参数</p>
		<el-form-item filterable v-for="(item,index) in abi[form.selectFnIndex].inputs" :key="index" :label="item.name">
			<el-input v-model="args[index]" :placeholder="item.type"></el-input>
		</el-form-item>
		<el-button class="tab-btn btn-info" @click="run" :disabled="runDisabled">运行</el-button>
	</el-form>
</template>

<script>
	//import  from ''
	import contractServies from '@/services/contract-servies';

    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
				form:{
					input:'',
					select:'',
					selectDeployData:'',
                    selectFnIndex:0,//运行的函数的下标
				},
				args:[],
				runDisabled:false,
            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {
			abi:{
				type: Array,
      			default: [],
			},
			address:{
				type: String,
      			default: '',
			}
        },
        //计算
        computed: {

        },
        //方法
        methods: {
            run(){
				console.log('args',this.args);
                contractServies.run(this.address,this.abi[this.form.selectFnIndex].name,this.args,()=>{

				});
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
			'form.selectFnIndex':function () {
				console.log('change index')
                this.args=[];
            }
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
	@import "../../less/modules/theme.less";

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