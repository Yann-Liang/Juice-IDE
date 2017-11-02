/**
 * Created by 15236 on 2017/10/25.
 */
import { deployAction } from './action'
import { deployGetter } from './getter'
import { deployMutation } from './mutation'

export const deploy = {
    state: {
        deployedData: {},
    },
    actions: deployAction,
    getters: deployGetter,
    mutations: deployMutation
};

export default deploy;
