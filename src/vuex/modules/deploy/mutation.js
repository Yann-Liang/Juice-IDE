/**
 * Created by 15236 on 2017/10/25.
 */
export const deployMutation = {
    ['ADD_DEPLOYED_DATA'](state, param) {
        console.log('state.deployedData',state.deployedData)
        state.deployedData[param.contractAddress] = param;
    },
};