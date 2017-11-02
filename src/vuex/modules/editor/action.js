/**
 * Created by 15236 on 2017/10/25.
 */
export const editorAction = {
	saveCode({commit,state},code){
		commit('UPDATE_SAVE_CODE',code)
	},
	updateData({commit,state},data){
		localStorage.setItem('editFileData',JSON.stringify(data))
		commit('UPLOAD_EDIT_FILEDATA',data)
	},
	// updateObj({commit,state},obj){
	// 	commit('UPLOAD_EDIT_FILEOBJ',obj)
	// }
}