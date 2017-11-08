/*
 * @Author: liangyanxiang
 * @Date: 2017-10-25 17:34:42
 * @Last Modified by: liangyanxiang
 * @Last Modified time: 2017-11-07 15:57:35
 */
//引入web3
let Web3 = require('web3');

import consoleService from '@/services/console/console-service';
import APIServies from '@/services/API-servies';
//import store from '@/vuex/store';
import DeployLogService from '@/services/deploy/deployLogServises'

const deployLogService = new DeployLogService();
//是否为数组
const isArray = (o) => {
    return Object.prototype.toString.call(o) === '[object Array]';
},
isJson = (obj) => {
    let isjson = typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
    return isjson;
},
dealArgumentList = (argumentList) => {
    let result = argumentList.map(function (item, index, input) {
        if (isJson(item)) {
            return JSON.stringify(item);
        }
        return item;
    });
    return result;
},
dealData = (str) => {
    const code = parseInt(str.substr(2, 64), 16),
        start = parseInt(str.substr(66, 64), 16),
        dataLength = parseInt(str.substr(130, 64), 16) * 2,
        data = str.substr(194, dataLength);
    if (dataLength % 2 == 0) { //当输入够偶数位；
        var StrHex = "";
        for (var i = 0; i < dataLength; i = i + 2) {
            var str = data.substr(i, 2); //16进制；

            var n = parseInt(str, 16); //10进制；
            StrHex = StrHex + String.fromCharCode(n);
        }
    }
    console.log('code==', code, 'data==', data);
    return {
        code: code,
        data: StrHex,
    }
}

//请求类
class DeployService {
    constructor() {
        this.web3 = null;
		this.provider = localStorage.getItem('chainInfo') ? JSON.parse(localStorage.getItem('chainInfo')).url : 'http://10.10.8.42:6789'; //节点地址18
		this._contracts = {}; //所有的合约
		this.callbacks = {}; //存放sendRawTrasaction回调函数
		this.wrapCount = 60; //轮询次数
        this.timeout = 60; //超时时间
        this.user = {
            privateKey : '', //用户私钥
            userAddress :'',//用户钱包地址
        }


        this.result = {
            contractAddress: '',
            TxHash: '',
            From:'',
        }

        this.data = {};

        this.time = '';
    }


    //设置节点地址
    setProvider(url) {
		this.provider = url;
		try {
            this.web3 = new Web3(new Web3.providers.HttpProvider(this.provider));
            return true;
		} catch (e) {
			console.log(e);
            alert('sorry,找不到链！！！');
            return false;
		}
    }

    //部署合约187ca65697e1765a062313219481bf5817901096fd20a2c4e1df634965d0979a
    deploy(fileName, contractName, abi, bin, userAddress) {
        console.log(abi);
        this.deployStart(fileName, contractName);
        this.user.userAddress = userAddress;
        this.result = {
            contractAddress: '',
            TxHash: '',
            From: userAddress,
        };
        return new Promise((resolve, reject) => {
            this.deployRunning();
            let calcContract = this.web3.eth.contract(abi);
            debugger;
            let myContractReturned = calcContract.new({
                data: bin,
                from: userAddress,
                gasPrice: 21000000000,
                gasLimit: 843314949521407,
            },  (err, myContract)=> {
                console.log('err', err,myContract)
                if (!err) {
                    if (!myContract.address) {
                        this.result.TxHash = myContract.transactionHash;
                        console.log("部署合约的交易哈希值: " + myContract.transactionHash);
                    } else {
                        console.log("合约的部署地址: " + myContract.address);
                        this.result.contractAddress = myContract.address;
                        this.data[myContract.address] = {
                            contractAddress: this.result.contractAddress,
                            from: this.result.From,
                            fileName: fileName,
                            contractName: contractName,
                            contract:myContract
                        };
                        //store.dispatch('addDeployedData',this.data[myContract.address]);

                        this.deployFinish();
                        resolve(myContract.address);
                    }
                } else {
                    this.deployFailure(err);
                }
            });
        })

    }


    //合约部署-开始
    deployStart(fileName, contractName) {
        let time = new Date().Format("yyyy-MM-dd HH:mm:ss"),
            str = `${fileName}:${contractName}合约正在部署`;
        consoleService.output(time,'[开始部署]',str,);
        deployLogService.push(time,'[开始部署]',str);
        return new Promise((resolve, reject) => {

        })
    }

    //合约部署-部署中
    deployRunning() {
        return new Promise((resolve, reject) => {
            resolve()
        })
    }

    //合约部署-部署完成
    deployFinish() {
        consoleService.output('[部署结果]',{ logSuccess: 'Deploy Success' },this.result);
        deployLogService.push('[部署结果]',{ logSuccess: 'Deploy Success' },this.result);
        return new Promise((resolve, reject) => {

        })
    }

    //合约部署-部署失败
    deployFailure(err) {
        consoleService.output('[部署结果]',{ logError: 'Deploy failure' },{ info: err.message });
        deployLogService.push('[部署结果]',{ logError: 'Deploy failure' },{ info: err.message });
        return new Promise((resolve, reject) => {
            resolve()
        })
    }


    /* 运行合约

     */
    run(contractAddress, contractFnName, IndexInAbi, argumentList = []) {
        console.log(contractAddress, contractFnName, IndexInAbi, argumentList)
        let contract = this.data[contractAddress].contract,
        constant = contract.abi[IndexInAbi].constant,
        payable = contract.abi[IndexInAbi].payable

        return new Promise((resolve, reject) => {
            debugger;
            if (constant){
                try {
                    //加上from
                    argumentList.push({
                        from: this.user.userAddress
                    });
                    let result = contract[contractFnName].apply(null, argumentList);
                    console.log("result:\n", result);
                    if (isJson(result)) {
                        resolve(JSON.parse(result));
                    } else {
                        resolve(result);
                    }

                } catch (e) {
                    console.warn(e);
                    return {
                        ret: 999,
                        messge: '合约异常',
                        data: '',

                    };
                }
            } else {
                let data = '';
                argumentList = dealArgumentList(argumentList);
                if (isArray(argumentList)) { //数组
                    data=contract.getData.apply(null, argumentList);
                } else if (typeof argumentList == 'string') { //字符串
                    data=contract.getData(argumentList);
                } else {
                    console.warn('argumentList参数类型不正确！！！');
                }
                console.log('data',data)
                const txParams = {
                        //from就是钱包地址，但是用私钥签名后，钱包地址可以通过签名得到公钥再通过公钥得到钱包地址 不用传
                        //from: '0x5fd205613e71810387265e7505997c69c27f9ae9',
                        //防重 每次都生成一个新的nonce，用过之后就失效了
                        nonce: this.web3.nonce(),
                        gasPrice: 21000000000,
                        gasLimit: 843314949521407,
                        to: constant.address,
                        value: 0,
                        data: data,
                    }; //下删
                console.log('txParams', txParams);
                //钱包签名
                this.privateKey = 'fcfd8ebca10b54b36cb6e47c61606b4ae355d78120ce3dd5e41ba6492b51d316';
                let privateKey = Buffer.from(this.privateKey, 'hex');
                debugger;
                tx.sign(privateKey);

                const serializedTx = tx.serialize();
                let serializedTxHex = "0x" + serializedTx.toString('hex');

                let hash = this.web3.eth.sendRawTransaction(serializedTxHex);
                this.callbacks[hash] = {
                	cb: cb,
                	wrapCount: this.wrapCount,
                }
                this.getTransactionReceipt(hash);
            }

            this.getContractLog();

        })

    }

    getTransactionReceipt(hash) {
		console.log('getTransactionReceipt hash==>', hash);
		let id = '',
			result = this.web3.eth.getTransactionReceipt(hash),
			data = {};
		if (result && result.transactionHash && hash == result.transactionHash) {
			clearTimeout(id);
			if (result.logs.length != 0) {
				data = dealData(result.logs[0].data);
				this.callbacks[hash].cb(data.code, data.data);
				delete this.callbacks[hash];
			} else {
				this.callbacks[hash].cb(1001, '合约异常，失败');
			}
		} else {
			if (this.callbacks[hash].wrapCount--) {
				console.log(this.wrapCount - this.callbacks[hash].wrapCount);
				id = setTimeout(() => {
					this.getTransactionReceipt(hash);
				}, 1000); //this.timeout / this.wrapCount
			} else {
				this.callbacks[hash].cb(1000, '超时');
				console.warn('sendRawTrasaction超时');
				id = '';
				delete this.callbacks[hash];
			}
		}
	}

    getContractLog(nodeId='192.168.9.36',time='2017-10-25T03:20:09.516Z') {
        APIServies.log.search({
            "_source": [ "address", "fields.ip" ,"message","@timestamp"],
            "query": {
                "bool": {
                "must": [
                    {
                    "term": {
                        "address": "0xa7aecd267cdc0995cf7be374c26e394e385252a1"
                    }
                    },
                    {
                    "term": {
                        "fields.ip":nodeId
                    }
                    }
                ],
                "must_not": [],
                "should": [],
                "filter": {
                    "range": {
                    "@timestamp":{
                        "gt":time
                        }
                    }
                }
                }
            },
            "from": 0,
            "size": 10000,
            "sort": [
                {"@timestamp": { "order": "desc" }}
            ],
            "aggs": {}
        }).then((res)=>{
            console.log('res',res)
        })
    }
}

//导出一个类
export default new DeployService;