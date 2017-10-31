/**
 * Created by 15236 on 2017/10/24.
 */
import store from '@/vuex/store';
import consoleService from '@/services/console/console-service';
var fs = require('fs'), solc = require('solc/wrapper');
class compileServies {
    constructor() {
        this.contractName=null;
    }
    compiler(path = 'src/contract/Test.sol'){
        var _this = this;
        var name = path.slice(path.lastIndexOf('/')+1,path.length);
        consoleService.output('[开始编译]');
        store.dispatch('compileWatch',1);
        consoleService.output('编译中...');
        _this.getContractName(path);
        var falseData = {
            resource:fs.readFileSync(path,"utf-8"),
            name:name,
            path:path,
            data:[],
        };
        var fileId = path;
        var spawn = require('child_process').spawn,free;
            free = spawn('src/services/compile-exe/solc',['--overwrite','-o','output','--optimize','--bin','--abi',path]);
        //保存语法错误
        _this.grammarCheck(function(result, missingInputs, source){
            if(result.errors && result.errors.length>0){
                falseData.error = result.errors;
            }
        },path);
        // 捕获标准输出并将其打印到控制台
        free.stdout.on('data', function (data) {

        });
        // 捕获标准错误输出并将其打印到控制台
        free.stderr.on('data', function (data) {

        });
        // 注册子进程关闭事件
        free.on('exit', function (code, signal) {
            if(code==0){
                if(_this.contractName && _this.contractName.length>0){
                    _this.contractName.forEach(function(item){
                        //需判断以该合约命名的abi和bin文件是否存在
                        var dataABI,dataBIN;
                        fs.exists("output/"+item+".abi", function(exists){
                            if(exists){
                                dataABI = fs.readFileSync("output/"+item+'.abi',"utf-8");
                                dataBIN = fs.readFileSync("output/"+item+'.bin',"utf-8");
                                falseData.data.push({
                                    abi:JSON.parse(dataABI),
                                    bin:dataBIN,
                                    contractName:item
                                });
                            };
                        });
                    });
                    var timer = setInterval(function(){
                        if(_this.contractName.length==falseData.data.length){
                            clearInterval(timer);
                            store.dispatch('compileWatch',2);
                            store.dispatch('compileDone',{
                                key:fileId,
                                value:falseData
                            });
                            consoleService.output('Compiler Success');
                            consoleService.output(falseData);
                        }
                    },100)
                }
            }else{
                store.dispatch('compileWatch',3);
                consoleService.output('Compiler Failed');
                consoleService.output(falseData);
            }
        });
    }
    //语法检查
    grammarCheck(cb,resource="src/contract/Test.sol"){
        var source = {
            sources:{
                [resource]:fs.readFileSync(resource,"utf-8")
            },
            target:resource
        };
        var compiler = solc(window.Module);
        var missingInputs = []
        var missingInputsCallback = function (path) {
            missingInputs.push(path)
            return { error: 'Deferred import' }
        }

        var result
        try {
            result = compiler.compile(source, 0, missingInputsCallback);
        } catch (exception) {
            result = { error: 'Uncaught JavaScript exception:\n' + exception }
        }
        if(cb && typeof(cb)=='function'){
            cb(result, missingInputs, source)
        }
    }
    //获取合约名称
    getContractName(path = 'src/contract/Test.sol'){
        var contractStrArr=[],contractList=[],_this = this;
        fs.exists(path, function(exists){
            if(exists){
               var resource = fs.readFileSync(path,"utf-8");
               contractStrArr = resource.match(/contract\s+\w+\s+{/gi);
                if(contractStrArr.length>0){
                    contractStrArr.forEach(function(item){
                        contractList.push(item.slice(item.indexOf(' ')+1,item.lastIndexOf(' ')));
                    });
                    _this.contractName = contractList;
                }else{
                    _this.contractName = null
                }
            }
        });
    }

}

export default new compileServies;
