/**
 * Created by 15236 on 2017/10/25.
 */
import file from '@/services/API-file'


export const editorAction = {
	saveCode({commit,state},code){
		commit('UPDATE_SAVE_CODE',code)
	},
	updateData({commit,state},data){
		localStorage.setItem('editFileData',JSON.stringify(data))
		commit('UPLOAD_EDIT_FILEDATA',data)
	},
	updateSaveCode({commit,state},data){
		commit('UPDATE_ACTION_CODE',data)
	},
	updateActiveEditor({commit,state},data){
		commit('UPDATE_ACTION_EDITOR',data)
	},
	saveEditorFile({dispatch,commit,state}){
		console.log(state.activeEditor)
		file.saveFile(state.activeEditor.value,state.activeEditor.name,state.activeEditor.source,(err)=>{
			if(err){

			}else{
				dispatch('updateTreeData',{value:state.activeEditor.value,name:state.activeEditor.name,save:true},{ root: true });
			}
		})
	},
	saveEditor({commit,state},obj){
		commit('SAVE_EDITOR',obj);
	},
	boolSearchVisible({commit,state},bool){
		commit('CHANGE_SEARCH_VISIBLE',bool)
	},
	boolReplaceVisible({commit,state},bool){
		commit('CHANGE_REPLACE_VISIBLE',bool)
	}
	// updateObj({commit,state},obj){
	// 	commit('UPLOAD_EDIT_FILEOBJ',obj)
	// }
}