/**
 * Created by 15236 on 2017/10/24.
 */
import store from '@/vuex/store';
import consoleService from '@/services/console/console-service';
var fs = require('fs') ;
class compileServies {
    constructor() {

    }
    compiler(path = 'src/contract/Test.sol'){
        var name = path.slice(path.lastIndexOf('/')+1,path.length);
        consoleService.output('[开始编译]');
        store.dispatch('compileWatch',1);
        consoleService.output('编译中...');
        var falseData = {
            resource:fs.readFileSync(path,"utf-8"),
            name:name,
            path:path,
            data:null,
        };
        var fileId = path;
        var spawn = require('child_process').spawn,free;
            free = spawn('src/services/compile-exe/solc',['--overwrite','-o','output','--optimize','--bin','--abi',path]);
        // 捕获标准输出并将其打印到控制台
        free.stdout.on('data', function (data) {

        });
        // 捕获标准错误输出并将其打印到控制台
        free.stderr.on('data', function (data) {
            falseData.error = data.toString();
        });
        // 注册子进程关闭事件
        free.on('exit', function (code, signal) {
            if(code==0){
                //需判断以该合约命名的abi和bin文件是否存在
                var dataABI,dataBIN;
                fs.exists("output/"+name.slice(0,name.indexOf('.'))+'.abi', function(exists){
                    if(exists){
                        dataABI = fs.readFileSync("output/"+name.slice(0,name.indexOf('.'))+'.abi',"utf-8");
                        dataBIN = fs.readFileSync("output/"+name.slice(0,name.indexOf('.'))+'.bin',"utf-8");
                    }else{
                        dataABI = fs.readFileSync("output/Ballot.abi","utf-8");
                        dataBIN = fs.readFileSync("output/Ballot.bin","utf-8");
                    }
                    store.dispatch('compileWatch',2);
                    falseData.data = {
                        abi:JSON.parse(dataABI),
                        bin:dataBIN
                    };
                    store.dispatch('compileDone',{
                        key:fileId,
                        value:falseData
                    });
                    consoleService.output('Compiler Success');
                    consoleService.output(falseData);
                });
            }else{
                store.dispatch('compileWatch',3);
                consoleService.output('Compiler Failed');
                consoleService.output(falseData);
            }
        });
    }
}

export default new compileServies;
