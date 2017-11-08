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
	saveEditorFile({dispatch,commit,state,rootState}){
		console.log(state.activeEditor);
		file.saveFile(state.activeEditor.value,state.activeEditor.name,state.activeEditor.source,(err,filepath)=>{
			if(err){

			}else{
				if(filepath){
					console.log(state.fileData);
					const keyId = file.keyIdFn(filepath);
					dispatch('updateFileData',{param:{keyId:state.activeEditor.keyId,value:filepath,name:file.basename(filepath)},id:keyId},{ root: true });
					
					dispatch('updateTreeData',{keyId:state.activeEditor.keyId,save:true,value:filepath,name:file.basename(filepath)},{ root: true });
					// 更新url
					let url = rootState.file.url;
					rootState.file.url.forEach((item,index)=>{
						if(item.name === state.activeEditor.name && item.value === state.activeEditor.value){
							url[index].value = filepath;
							url[index].name = file.basename(filepath);
							url[index].keyId = keyId;
							return;
						}
					})
					
					dispatch('updateUrl',url,{ root: true });

					// 更新未保存vuex的状态
					let editData = state.editData;
					state.editData.forEach((item,index)=>{
						console.log(item.keyId ==  state.activeEditor.keyId);
						if(item.keyId ==  state.activeEditor.keyId){
							editData.splice(index,1);
							return;
						}
					});
					
					
					console.log(editData);
					
					dispatch('updateData',editData,{ root: true });


					commit('UPDATE_ACTION_EDITOR',{  // 更新当前编辑的状态
						value: filepath,
						name: file.basename(filepath),
						keyId:keyId,
						source: state.activeEditor.source
					})
					// 更新当前激活的文件状态
					dispatch('updateEditFile',{keyId:state.activeEditor.keyId,value:filepath,name:file.basename(filepath)},{ root: true });
				}else{
					dispatch('updateTreeData',{keyId:state.activeEditor.keyId,save:true},{ root: true });
				}
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
	},
	// 增删改fileData
	// 删
	deleteFileData({commit,state},index){
		let data = state.fileData;
		data.splice(index,1);
		commit('UPDATE_File_DATA',data)
	},
	// 增加
	addFileData({commit,state},obj){
		let blo = false;
		let data = state.fileData;
		data.forEach((item,index)=>{
			if(item.keyId == obj.keyId){
				blo = true;
			}
		});
		if(blo){

		}else{
			data.push(obj);
		}
		commit('UPDATE_File_DATA',data)
	},
	// 改
	updateFileData({commit,state},obj){
		let data = state.fileData;
		data.forEach((item,index)=>{
			if(item.keyId == obj.param.keyId){
				for (var key in obj.param){
					item[key] = obj.param[key]
				}
				if(obj.id){
					item.keyId = obj.id
				}
				return false;
			}
		});
		commit('UPDATE_File_DATA',data)
	},
	changeFileData({commit,state},data){
		commit('UPDATE_File_DATA',data)
	}
}
