/**
 * Created by 15236 on 2017/10/25.
 */
export const configAction = {
    updateConsoleHeight ({ commit, state },string) {
        commit('UPDATE_CONSOLE_HEIGHT', string);
    },
}