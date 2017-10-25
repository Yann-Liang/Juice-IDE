/**
 * Created by 15236 on 2017/10/24.
 */
import store from '@/vuex/store';
class consoleServies {
    constructor() {

    }
    output(bool,compileFn){
        store.dispatch('triggerConsoleFlag',bool);
        if(compileFn && typeof(compileFn)=='function'){
            compileFn();
        }
    }
}

export default new consoleServies;
