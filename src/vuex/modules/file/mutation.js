/**
 * Created by 15236 on 2017/10/25.
 */
export const fileMutation = {
	['UPDATE_FILE_DATA'] (state,data) {
		state.treeData = data
	},
	['SET_ACTIVE_FILE'] (state,activeFile) {
		state.activeFile = activeFile
	},
	['UPDATE_URL'] (state,url) {
		state.url = url
	},
	['UPDATE_EDIT_FILE'] (state,fileObj) {
		state.editFile = fileObj
	}
};