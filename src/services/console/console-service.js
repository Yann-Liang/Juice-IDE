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
        if(bool){
            store.dispatch('updateConsoleHeight','300')
        }else{
            store.dispatch('updateConsoleHeight','34')
        }
    }
    output(...logs){
        //输出内容log,log如果需要颜色变化需要规定key值，否则直接传字符串
        //绿色：logSuccess,eg:consoleServies.output({logSuccess:'你想输出什么'}),红色:logError,警告色:logWarning,info色:logInfo
        this.trigger(true);
        logs.forEach((log) => {
            store.dispatch('updateConsoleDetail',log);
        });
    }
    command(order){
        //执行命令order
        store.dispatch('updateCommandList',order);
        this.output('>'+order);
        try {
            this.output(eval(order));
        } catch(err) {
            this.output({'logError':err.toString()});
        }

    }
}

export default new consoleServies;
