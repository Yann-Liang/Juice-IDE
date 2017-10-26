/**
 * Created by 15236 on 2017/10/25.
 */
import { compileAction } from './action'
import { compileGetter } from './getter'
import { compileMutation } from './mutation'
//compileStatus:编译状态  0未开始编译  1开始编译  2编译成功  3编译失败  4编译退出
export const compile = {
    state: {
        compileStatus:0,
        compileResult:{}
    },
    actions: compileAction,
    getters: compileGetter,
    mutations: compileMutation
};

export default compile;
