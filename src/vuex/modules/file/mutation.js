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
	},
	['UPDATE_POSITION'] (state,position) {
		state.position = position
	},
	['UPDATE_RIGHT_MENU_BLOCK'] (state,blo) {
		state.rightMenuBlock = blo
	},
	['UPDATE_CURRENT_ID'](state,id){
		state.fileCurrentId = id;
	},
	['CHANGE_SHOW_MODAL'](state,blo){
		state.showTipModal = blo;
	},
	['CHANGE_DELETE_MODAL'](state,blo){
		state.showDeleteModal = blo;
	},
	['CHANGE_DELETE_FILE'](state,deleteFile){
		state.deleteFile = deleteFile;
	},
	['CHANGE_FILE_NAME'](state,fileName){
		state.showFileNameModal = fileName;
	},
	['CHANGE_DIR_NAME'](state,dirName){
		state.showDirNameModal = dirName;
	},
	['SET_HINT_INFO'](state,info){
		state.hintInfo = info;
	},
	['UPDATE_NEW_OPEN_FILE'](state,data){
		state.newOpenFile = data;
	}
};