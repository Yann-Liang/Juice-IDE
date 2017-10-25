/**
 * Created by 15236 on 2017/10/25.
 */
export const consoleAction = {
    triggerConsoleFlag ({ commit, state },bool) {
        commit('TRIGGER_CONSOLE', bool);
    },
    compileAction({ commit, state },num){
        commit('UPDATE_COMPILE_STATUS', num);
    }
}