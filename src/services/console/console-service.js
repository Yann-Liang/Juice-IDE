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
    output(compileFn){
        this.trigger(true);
        if(compileFn && typeof(compileFn)=='function'){
            compileFn();
        }
    }
}

export default new consoleServies;
