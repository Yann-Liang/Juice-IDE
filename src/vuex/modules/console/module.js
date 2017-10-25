/**
 * Created by 15236 on 2017/10/25.
 */
import { consoleAction } from './action'
import { consoleGetter } from './getter'
import { consoleMutation } from './mutation'

export const console = {
    state: {
        consoleFlag:false,
        compileStatus:0
    },
    actions: consoleAction,
    getters: consoleGetter,
    mutations: consoleMutation
};

export default console;
