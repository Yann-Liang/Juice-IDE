/*
 * @Author: liangyanxiang
 * @Date: 2017-10-25 17:34:42
 * @Last Modified by: liangyanxiang
 * @Last Modified time: 2017-11-01 15:42:40
 */

import contractServies from '@/services/contract-servies';
import consoleService from '@/services/console/console-service';
import store from '@/vuex/store';

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
    }

    deploy(fileName, contractName, abi, bin, userAddress) {
        this.start(fileName,contractName);
        this.result = {
            contractAddress: '',
            TxHash: '',
            From: userAddress,
        };
        return new Promise((resolve, reject) => {

            let calcContract = contractServies.web3.eth.contract(abi);
            let myContractReturned = calcContract.new({
                data: bin,
                from: userAddress,
                gasPrice: 21000000000,
                gasLimit: 843314949521407,
            },  (err, myContract)=> {
                console.log('err, myContract', err, myContract)
                if (!err) {
                    if (!myContract.address) {
                        this.result.TxHash = myContract.transactionHash;
                        console.log("部署合约的交易哈希值: " + myContract.transactionHash);
                    } else {
                        console.log("合约的部署地址: " + myContract.address);
                        this.result.contractAddress = myContract.address;
                        this.data[myContract.address] = {
                            contractAddress: this.result.contractAddress,
                            TxHash: this.result.TxHash,
                            From: this.result.From,
                            fileName: fileName,
                            contractName: contractName,
                            abi:abi,
                        };
                        store.dispatch('addDeployedData',this.data[myContract.address]);

                        this.finish();
                        resolve(myContract.address);
                    }
                }
            });
        })

    }


    start(fileName,contractName) {
        consoleService.output(new Date().Format("yyyy-MM-dd HH:mm:ss"));
        consoleService.output('[开始部署]');
        consoleService.output(`${fileName}:${contractName}合约正在部署`);
        return new Promise((resolve, reject) => {

        })
    }
    running() {
        return new Promise((resolve, reject) => {

        })
    }

    finish() {
        consoleService.output('[部署结果]');
        consoleService.output({ logSuccess: 'Deploy Success' });
        consoleService.output(this.result);
        return new Promise((resolve, reject) => {

        })
    }
}

//导出一个类
export default new DeployService;