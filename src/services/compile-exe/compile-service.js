/**
 * Created by 15236 on 2017/10/24.
 */
import cp from 'child_process';
import store from '@/vuex/store';
class compileServies {
    constructor() {

    }
    compiler(path = 'C:/zhangpingping/99/rainbow/src/contract/Test.sol'){
        console.info('开始编译....');
        store.dispatch('compileAction',1);
        var spawn = require('child_process').spawn,
            free = spawn('src/services/compile-exe/solc',['--overwrite','--optimize','--bin','--abi',path]);
        // 捕获标准输出并将其打印到控制台
        free.stdout.on('data', function (data) {
            store.dispatch('compileAction',2);
            console.log('standard output:\n' + data);
        });
        // 捕获标准错误输出并将其打印到控制台
        free.stderr.on('data', function (data) {
            store.dispatch('compileAction',3);
        });
        // 注册子进程关闭事件
        free.on('exit', function (code, signal) {

        });
    }
}

export default new compileServies;
