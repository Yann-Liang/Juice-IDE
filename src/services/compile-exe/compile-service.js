/**
 * Created by 15236 on 2017/10/24.
 */
import store from '@/vuex/store';
var fs = require('fs') ;
class compileServies {
    constructor() {

    }
    compiler(path = 'src/contract/FileServerManager.sol'){
        var name = path.slice(path.lastIndexOf('/')+1,path.length);
        console.info('开始编译....');
        store.dispatch('compileWatch',1);
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
            store.dispatch('compileWatch',2);
        });
        // 捕获标准错误输出并将其打印到控制台
        free.stderr.on('data', function (data) {
            store.dispatch('compileWatch',3);
            falseData.error = data.toString();
        });
        // 注册子进程关闭事件
        free.on('exit', function (code, signal) {
            store.dispatch('compileWatch',4);
            var dataABI = fs.readFileSync("output/"+name.slice(0,name.indexOf('.'))+'.abi',"utf-8");
            var dataBIN = fs.readFileSync("output/"+name.slice(0,name.indexOf('.'))+'.bin',"utf-8");
            falseData.data = {
                abi:JSON.parse(dataABI),
                bin:dataBIN
            };
            store.dispatch('compileDone',{
                key:fileId,
                value:falseData
            });
        });
    }
}

export default new compileServies;
