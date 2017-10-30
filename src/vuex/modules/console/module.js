/**
 * Created by 15236 on 2017/10/25.
 */
import { consoleAction } from './action'
import { consoleGetter } from './getter'
import { consoleMutation } from './mutation'
//compileStatus:编译状态  0未开始编译  1开始编译  2编译成功  3编译失败  4编译退出
export const console = {
    state: {
        consoleFlag:false,
        consoleDetail:[]
    },
    actions: consoleAction,
    getters: consoleGetter,
    mutations: consoleMutation
};

export default console;
