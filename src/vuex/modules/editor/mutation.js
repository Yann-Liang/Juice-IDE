/**
 * Created by 15236 on 2017/10/25.
 */
export const editorMutation = {
    ['UPDATE_ACTION_CODE'] (state,code) {
        state.actionCode = code;
    },
    ['UPDATE_SAVE_CODE'] (state,code) {
        state.saveCode = code;
    },
    ['UPLOAD_EDIT_FILEDATA'](state,data){
        state.editData = data
    },
	['UPDATE_ACTION_EDITOR'](state,data){
		state.activeEditor = data
	},
    ['SAVE_EDITOR'](state,obj){
        state.editor = obj
    },
    ['CHANGE_SEARCH_VISIBLE'](state,bool){
        state.searchVisible = bool
    },
    ['CHANGE_REPLACE_VISIBLE'](state,bool){
        state.replaceVisible = bool
    },
	['UPDATE_File_DATA'](state,data){
		state.fileData = data
	},
};