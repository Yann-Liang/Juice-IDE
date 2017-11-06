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
		file.saveFile(state.activeEditor.value,state.activeEditor.name,state.activeEditor.source,(err,filepath)=>{
			if(err){
			
			}else{
				if(filepath){
					dispatch('updateTreeData',{keyId:state.activeEditor.keyId,save:true,value:filepath,name:file.basename(filepath)},{ root: true });
				}else{
					dispatch('updateTreeData',{keyId:state.activeEditor.keyId,save:true},{ root: true });
				}
			}
		})
	}
	// updateObj({commit,state},obj){
	// 	commit('UPLOAD_EDIT_FILEOBJ',obj)
	// }
}