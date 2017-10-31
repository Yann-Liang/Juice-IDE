<template>
    <div class="">
        <el-form :label-position="'top'" label-width="220px" :model="form">
            <el-form-item label="选择需要部署的合约">
                <el-select v-model="form.select" placeholder="选择合约文件">
                    <el-option v-for="(item,index) in compileResult" :key="index" :label="item.name" :value="item"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="">
                <el-select v-model="form.contract" placeholder="选择合约文件">
                    <el-option v-for="(item,index) in form.select" :key="index" :label="item.contractName" :value="item"></el-option>
                </el-select>
            </el-form-item>
        </el-form>

        <el-button class="tab-btn" type="primary" @click="deploy">部署合约</el-button>
    </div>
</template>

<script>
    //import  from ''
    import {mapState, mapActions, mapGetters} from 'vuex';

    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
                form:{
                    select:'',
                    contract:'',
                },
                contratList:{
                    '1.sol':{
                        name:'1.sol',
                        data:[{
                            aaaa:'1'
                        }]
                    },
                    '2.sol':{
                        name:'2.sol',
                        data:[{
                            aaaa:'2'
                        }]
                    }
                }
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
                console.log('deploy');
                // let select=this.compileResult[this.form.select],
                //     data=null;
                // for(let i=0;i<select.length;i++){
                //     if(this.contract==select[i].contractName){

                //     }
                // }
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