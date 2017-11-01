/**
 * Created by 15236 on 2017/10/25.
 */
import { configAction } from './action'
import { configGetter } from './getter'
import { configMutation } from './mutation'

export const config = {
    state: {
        language:'zh_cn',
        theme:'default',
    },
    actions: configAction,
    getters: configGetter,
    mutations: configMutation
};

export default config;
