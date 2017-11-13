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
            <el-button class="tab-btn btn-info" @click="queryContract">查询合约</el-button>
        </el-form>
    	<run v-if="flag" :abi="abi" :address="form.address"></run>

    </div>
</template>

<script>
    //import  from ''
	import contractServies from '@/services/contract-servies';
	import run from "@/components/run/";

    export default {
        //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
                form:{
                    address:'0x0000000000000000000000000000000000000012',
                    abi:`[{
			"constant": true,
			"inputs": [{
				"name": "_account",
				"type": "string"
			}],
			"name": "getAccountState",
			"outputs": [{
				"name": "_state",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_departmentId",
				"type": "string"
			}, {
				"name": "_pageNum",
				"type": "uint256"
			}, {
				"name": "_pageSize",
				"type": "uint256"
			}],
			"name": "findByDepartmentIdTree",
			"outputs": [{
				"name": "_strjson",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_mobile",
				"type": "string"
			}],
			"name": "findByMobile",
			"outputs": [{
				"name": "_strjson",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}],
			"name": "userExists",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [],
			"name": "getRevision",
			"outputs": [{
				"name": "_revision",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [],
			"name": "getErrno",
			"outputs": [{
				"name": "",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}, {
				"name": "_roleId",
				"type": "string"
			}],
			"name": "checkUserRole",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": false,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}, {
				"name": "_status",
				"type": "uint256"
			}],
			"name": "updatePasswordStatus",
			"outputs": [{
				"name": "_ret",
				"type": "bool"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_actionId",
				"type": "string"
			}],
			"name": "actionUsed",
			"outputs": [{
				"name": "_used",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_str",
				"type": "string"
			}, {
				"name": "_str2",
				"type": "string"
			}, {
				"name": "_str3",
				"type": "string"
			}],
			"name": "log",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_str",
				"type": "string"
			}, {
				"name": "_addr",
				"type": "address"
			}],
			"name": "log",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": false,
			"inputs": [{
				"name": "_account",
				"type": "string"
			}],
			"name": "login",
			"outputs": [{
				"name": "_json",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_str",
				"type": "string"
			}, {
				"name": "_i",
				"type": "int256"
			}],
			"name": "log",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_accountStatus",
				"type": "uint256"
			}, {
				"name": "_pageNo",
				"type": "uint256"
			}, {
				"name": "_pageSize",
				"type": "uint256"
			}],
			"name": "pageByAccountStatus",
			"outputs": [{
				"name": "_strjson",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": false,
			"inputs": [{
				"name": "_userJson",
				"type": "string"
			}],
			"name": "update",
			"outputs": [{
				"name": "",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": false,
			"inputs": [{
				"name": "_name",
				"type": "string"
			}, {
				"name": "_version",
				"type": "string"
			}],
			"name": "register",
			"outputs": [],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_str",
				"type": "string"
			}],
			"name": "log",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}],
			"name": "getUserState",
			"outputs": [{
				"name": "_state",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": false,
			"inputs": [],
			"name": "kill",
			"outputs": [],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_addr",
				"type": "address"
			}, {
				"name": "_departmentId",
				"type": "string"
			}],
			"name": "checkWritePermission",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_email",
				"type": "string"
			}],
			"name": "findByEmail",
			"outputs": [{
				"name": "_strjson",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_str",
				"type": "string"
			}, {
				"name": "_str2",
				"type": "string"
			}],
			"name": "log",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_roleId",
				"type": "string"
			}, {
				"name": "_actionId",
				"type": "string"
			}],
			"name": "checkRoleAction",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_name",
				"type": "string"
			}],
			"name": "findByLoginName",
			"outputs": [{
				"name": "_strjson",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": false,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}, {
				"name": "_status",
				"type": "uint256"
			}],
			"name": "updateUserStatus",
			"outputs": [{
				"name": "_ret",
				"type": "bool"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [],
			"name": "getSender",
			"outputs": [{
				"name": "_ret",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_roleId",
				"type": "string"
			}],
			"name": "getRoleModuleId",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": false,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}],
			"name": "eraseAdminByAddress",
			"outputs": [],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_roleIds",
				"type": "string"
			}],
			"name": "getUserCountMappingByRoleIds",
			"outputs": [{
				"name": "_json",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_departmentId",
				"type": "string"
			}, {
				"name": "_index",
				"type": "uint256"
			}],
			"name": "getChildIdByIndex",
			"outputs": [{
				"name": "_childDepartmentId",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_departmentId",
				"type": "string"
			}],
			"name": "departmentExists",
			"outputs": [{
				"name": "_exists",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [],
			"name": "listAll",
			"outputs": [{
				"name": "_userListJson",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}, {
				"name": "_index",
				"type": "uint256"
			}],
			"name": "getUserRoleId",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_roleId",
				"type": "string"
			}],
			"name": "findByRoleId",
			"outputs": [{
				"name": "_strjson",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_departmentId",
				"type": "string"
			}],
			"name": "getUserCountByDepartmentId",
			"outputs": [{
				"name": "_count",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_name",
				"type": "string"
			}, {
				"name": "_key",
				"type": "string"
			}, {
				"name": "_value",
				"type": "string"
			}],
			"name": "writedb",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [],
			"name": "getOwner",
			"outputs": [{
				"name": "_ret",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_actionId",
				"type": "string"
			}],
			"name": "checkActionExists",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": false,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}],
			"name": "deleteByAddress",
			"outputs": [],
			"payable": false,
			"type": "function"
		}, {
			"constant": false,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}, {
				"name": "_roleId",
				"type": "string"
			}],
			"name": "addUserRole",
			"outputs": [{
				"name": "",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}],
			"name": "findByAddress",
			"outputs": [{
				"name": "_ret",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_status",
				"type": "uint256"
			}, {
				"name": "_name",
				"type": "string"
			}, {
				"name": "_departmentId",
				"type": "string"
			}, {
				"name": "_pageNum",
				"type": "uint256"
			}, {
				"name": "_pageSize",
				"type": "uint256"
			}],
			"name": "findByDepartmentIdTreeAndContion",
			"outputs": [{
				"name": "_strjson",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_account",
				"type": "string"
			}],
			"name": "findByAccount",
			"outputs": [{
				"name": "_strjson",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_roleId",
				"type": "string"
			}],
			"name": "roleUsed",
			"outputs": [{
				"name": "_used",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_actionId",
				"type": "string"
			}],
			"name": "actionExists",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}],
			"name": "getUserDepartmentId",
			"outputs": [{
				"name": "_departId",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}, {
				"name": "_actionId",
				"type": "string"
			}],
			"name": "checkUserAction",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}],
			"name": "getUserAddrByAddr",
			"outputs": [{
				"name": "_address",
				"type": "address"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": false,
			"inputs": [{
				"name": "_userJson",
				"type": "string"
			}],
			"name": "insert",
			"outputs": [{
				"name": "",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [],
			"name": "getUserCount",
			"outputs": [{
				"name": "_count",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_str",
				"type": "string"
			}, {
				"name": "_ui",
				"type": "uint256"
			}],
			"name": "log",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}],
			"name": "getOwnerAddrByAddr",
			"outputs": [{
				"name": "_address",
				"type": "address"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_actionId",
				"type": "string"
			}],
			"name": "getUserCountByActionId",
			"outputs": [{
				"name": "_count",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": false,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}, {
				"name": "_ownerAddr",
				"type": "address"
			}, {
				"name": "_publilcKey",
				"type": "string"
			}, {
				"name": "_cipherGroupKey",
				"type": "string"
			}, {
				"name": "_uuid",
				"type": "string"
			}],
			"name": "resetPasswd",
			"outputs": [{
				"name": "_ret",
				"type": "bool"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_roleId",
				"type": "string"
			}],
			"name": "roleExists",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_departmentId",
				"type": "string"
			}],
			"name": "findByDepartmentId",
			"outputs": [{
				"name": "_strjson",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_uuid",
				"type": "string"
			}],
			"name": "findByUuid",
			"outputs": [{
				"name": "_strjson",
				"type": "string"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}, {
				"name": "_contractAddr",
				"type": "address"
			}, {
				"name": "_funcSha3",
				"type": "string"
			}],
			"name": "checkUserPrivilege",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_departmentId",
				"type": "string"
			}],
			"name": "getAdmin",
			"outputs": [{
				"name": "_admin",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_actionId",
				"type": "string"
			}, {
				"name": "_index",
				"type": "uint256"
			}],
			"name": "getRoleIdByActionIdAndIndex",
			"outputs": [{
				"name": "_roleId",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": true,
			"inputs": [{
				"name": "_actionId",
				"type": "string"
			}, {
				"name": "_resKey",
				"type": "address"
			}, {
				"name": "_opSha3Key",
				"type": "string"
			}],
			"name": "checkActionWithKey",
			"outputs": [{
				"name": "_ret",
				"type": "uint256"
			}],
			"payable": false,
			"type": "function"
		}, {
			"constant": false,
			"inputs": [{
				"name": "_userAddr",
				"type": "address"
			}, {
				"name": "_status",
				"type": "uint256"
			}],
			"name": "updateAccountStatus",
			"outputs": [{
				"name": "_ret",
				"type": "bool"
			}],
			"payable": false,
			"type": "function"
		}, {
			"inputs": [],
			"payable": false,
			"type": "constructor"
		}, {
			"anonymous": false,
			"inputs": [{
				"indexed": false,
				"name": "_errno",
				"type": "uint256"
			}, {
				"indexed": false,
				"name": "_info",
				"type": "string"
			}],
			"name": "Notify",
			"type": "event"
		}]`,
                },
				flag:false,
				abi:[]
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
				console.log('queryContract',this.form);
				let contract=contractServies.queryContract(this.form.address,this.form.abi);
				if(contract){
					this.flag=true;
					this.abi=contract.abi;
				}
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
			run
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