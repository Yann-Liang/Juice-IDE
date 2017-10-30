/**
 * Created by 15236 on 2017/10/25.
 */
export const compileMutation = {
    ['UPDATE_COMPILE_STATUS'] (state,num) {
        state.compileStatus = num
    },
    ['UPDATE_COMPILE'] (state,param) {
        state.compileResult[param.key]= param.value
    },
};