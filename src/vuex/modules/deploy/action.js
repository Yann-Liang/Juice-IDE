/**
 * Created by 15236 on 2017/10/25.
 */
export const deployAction = {
    addDeployedData({ commit, state }, param) {
        console.log('param',param)
        commit('ADD_DEPLOYED_DATA',param);
    }
}