/**
 * Created by 15236 on 2017/10/24.
 */
import store from '@/vuex/store';
class consoleServies {
    constructor() {

    }
    trigger(bool){
        store.dispatch('triggerConsoleFlag',bool);
    }
    output(log){
        this.trigger(true);
        store.dispatch('updateConsoleDetail',log);
    }
}

export default new consoleServies;
