/**
 * Created by 15236 on 2017/10/25.
 */
export const compileAction = {
    compileWatch({ commit, state },num){
        commit('UPDATE_COMPILE_STATUS', num);
    },
    compileDone({ commit, state },param){
        commit('UPDATE_COMPILE',param);
    }
}