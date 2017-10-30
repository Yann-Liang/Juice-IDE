/**
 * Created by 15236 on 2017/10/25.
 */
export const consoleMutation = {
    ['TRIGGER_CONSOLE'] (state,bool) {
        state.consoleFlag = bool
    },
    ['UPDATE_CONSOLE'] (state,string) {
        state.consoleDetail.push(string);
    }
};