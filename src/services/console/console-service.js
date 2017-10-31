/**
 * Created by 15236 on 2017/10/24.
 */
import store from '@/vuex/store';
class consoleServies {
    constructor() {

    }
    trigger(bool){
        //展开/折叠控制台
        store.dispatch('triggerConsoleFlag',bool);
    }
    output(log){
        //输出内容log
        this.trigger(true);
        store.dispatch('updateConsoleDetail',log);
    }
    command(order){
        //执行命令order
        this.output('>'+order);
        this.output(eval(order));
    }
}

export default new consoleServies;
