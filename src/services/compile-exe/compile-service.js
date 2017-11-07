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
    compiler(){
        var _this = this;
        store.dispatch('saveEditorFile',function(){
            //编译之前默认执行保存文件的操作
            var name = store.state.file.editFile.name,path= store.state.file.editFile.value;
            if(store.state.compile.compileStatus==1) return;
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
                                        contractName:item,
                                        abi:JSON.parse(dataABI),
                                        bin:dataBIN
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
                                consoleService.output({logSuccess:'Compiler Success'});
                                consoleService.output(falseData);
                                _this.clearOutput();
                            }
                        },100)
                    }else{
                        store.dispatch('compileWatch',3);
                        consoleService.output({logError:'Compiler Failed'});
                        consoleService.output(falseData);
                        _this.clearOutput();
                    }
                }else{
                    store.dispatch('compileWatch',3);
                    consoleService.output({logError:'Compiler Failed'});
                    consoleService.output(falseData);
                    _this.clearOutput();
                }
            });
        });
    }
    //语法检查
    grammarCheck(cb){
        var source = {
            sources:{
                [store.state.editor.activeEditor.name]:store.state.editor.activeEditor.source
            },
            target:store.state.editor.activeEditor.name
        };
        console.log('source',source)
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
        if(result.errors && result.errors.length>0){
            let errors = result.errors,errorsKeyArr={},errorsArr=[];
            errors.forEach(function(error){
                var errorId = error.match(/\w+\.sol\:[0-9]+/i);
                if(!errorsKeyArr[errorId[0]]){
                    errorsKeyArr[errorId[0]]=true;
                    errorsArr.push(errorId.input);
                }
            });
            result.errors = errorsArr;
        }
        if(cb && typeof(cb)=='function'){
            cb(result, missingInputs, source)
        }
    }
    //获取合约名称
    getContractName(path){
        var contractStrArr=[],contractList=[],_this = this;
        fs.exists(path, function(exists){
            if(exists){
               var resource = fs.readFileSync(path,"utf-8");
               contractStrArr = resource.match(/contract\s+\w+\s+/gi);
                if(contractStrArr && contractStrArr.length>0){
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
    //清空合约编译结果输出目录
    clearOutput(dir='output'){
        fs.exists(dir, function(exists) {
            if(exists){
                var dirList = fs.readdirSync(dir);
                dirList.forEach(function(fileName){
                    fs.unlinkSync(dir + '\\' + fileName);
                });
            }
        });
    }
}

export default new compileServies;
