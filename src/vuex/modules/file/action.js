/**
 * Created by 15236 on 2017/10/25.
 */
import file from '@/services/API-file'

export const fileAction = {
	queryFileListData({ commit, state }){
		const data = file.getFileList(state.url);
		commit('UPDATE_FILE_DATA', data);
	},
	setActiveFile({ commit, state },activeFile){
		commit('SET_ACTIVE_FILE', activeFile);
	},
	updateUrl({ commit, state },url){
		localStorage.setItem('dirPath',JSON.stringify(url))
		commit('UPDATE_URL', url);
		
		const data = file.getFileList(state.url);
		commit('UPDATE_FILE_DATA', data);
	},
	updateEditFile({ commit, state },fileObj){
		commit('UPDATE_EDIT_FILE', fileObj);
	}
}