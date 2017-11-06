/*
 * @Author: liangyanxiang
 * @Date: 2017-10-25 17:34:42
 * @Last Modified by: liangyanxiang
 * @Last Modified time: 2017-11-03 18:25:46
 */

import contractServies from '@/services/contract-servies';
import consoleService from '@/services/console/console-service';
import APIServies from '@/services/API-servies';
//import store from '@/vuex/store';

function Storage (prefix) {
    this.exists = function (name) {
      return this.get(name) !== null
    }

    this.get = function (name) {
      return window.localStorage.getItem(prefix + name)
    }

    this.set = function (name, content) {
      try {
        window.localStorage.setItem(prefix + name, content)
      } catch (exception) {
        return false
      }
      return true
    }

    this.remove = function (name) {
      window.localStorage.removeItem(prefix + name)
      return true
    }

    this.rename = function (originalName, newName) {
      var content = this.get(originalName)
      if (!this.set(newName, content)) {
        return false
      }
      this.remove(originalName)
      return true
    }

    function safeKeys () {
      // NOTE: this is a workaround for some browsers
      return Object.keys(window.localStorage).filter(function (item) { return item !== null && item !== undefined })
    }

    this.keys = function () {
      return safeKeys()
        // filter any names not including the prefix
        .filter(function (item) { return item.indexOf(prefix, 0) === 0 })
        // remove prefix from filename and add the 'browser' path
        .map(function (item) { return item.substr(prefix.length) })
    }

    // on startup, upgrade the old storage layout
    safeKeys().forEach(function (name) {
      if (name.indexOf('sol-cache-file-', 0) === 0) {
        var content = window.localStorage.getItem(name)
        window.localStorage.setItem(name.replace(/^sol-cache-file-/, 'sol:'), content)
        window.localStorage.removeItem(name)
      }
    })

    // remove obsolete key
    window.localStorage.removeItem('editor-size-cache')
  }

//请求类
class DeployService {
    constructor() {
        this.result = {
            contractAddress: '',
            TxHash: '',
            From:'',
        }

        this.data = {};

        this.time = '';
    }
    //部署合约
    deploy(fileName, contractName, abi, bin, userAddress) {
        console.log(abi)
        this.deployStart(fileName,contractName);
        this.result = {
            contractAddress: '',
            TxHash: '',
            From: userAddress,
        };
        return new Promise((resolve, reject) => {
            this.deployRunning();

            let calcContract = contractServies.web3.eth.contract(abi);
            console.log('contractServies.web3', contractServies.web3, calcContract.new)
            debugger;
            let myContractReturned = calcContract.new({
                data: bin,
                from: userAddress,
                gasPrice: 21000000000,
                gasLimit: 843314949521407,
            },  (err, myContract)=> {
                console.log('err', err)
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
                }
            });
        })

    }


    deployStart(fileName,contractName) {
        consoleService.output(new Date().Format("yyyy-MM-dd HH:mm:ss"));
        consoleService.output('[开始部署]');
        consoleService.output(`${fileName}:${contractName}合约正在部署`);
        return new Promise((resolve, reject) => {

        })
    }
    deployRunning() {
        return new Promise((resolve, reject) => {

        })
    }

    deployFinish() {
        consoleService.output('[部署结果]');
        consoleService.output({ logSuccess: 'Deploy Success' });
        consoleService.output(this.result);
        return new Promise((resolve, reject) => {

        })
    }

    run(contractAddress) {
        console.log(arguments);
        console.log(this.data[contractAddress]);
        this.getContractLog();
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