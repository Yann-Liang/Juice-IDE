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
	saveEditorFile({dispatch,commit,state,rootState},cb){
		if(state.fileData.length > 0){
			file.saveFile(state.activeEditor.value,state.activeEditor.name,state.activeEditor.source,(err,filepath)=>{
				console.log("filepath+keyId",filepath)
				if(err){
					console.log(err)
				}else{
					const oldKeyId = state.activeEditor.keyId;
					if(filepath){
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
						
						// 更新当前激活的文件状态
						dispatch('updateEditFile',{keyId:keyId,value:filepath,name:file.basename(filepath),unWatch:true},{ root: true });
						
						commit('UPDATE_ACTION_EDITOR',{  // 更新当前编辑的状态
							value: filepath,
							name: file.basename(filepath),
							keyId:keyId,
							source: state.activeEditor.source
						})
						// console.log('宝宝宝宝宝宝啊')
						
					}else{
						dispatch('updateTreeData',{keyId:state.activeEditor.keyId,save:true},{ root: true });
					}
					// 更新未保存vuex的状态
					let edit = [];
					console.log(state.editData.length)
					state.editData.forEach((item,index)=>{
						console.log(oldKeyId);
						console.log(item.keyId)
						if(item.keyId !==  oldKeyId){
							edit.push(item);
						}
					})
					edit = JSON.stringify(edit)
					dispatch('updateData',JSON.parse(edit),{ root: true });
					if(cb && typeof(cb)=='function'){
						cb();
					}
				}
			})
		}
		
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
	},
	// 删除文件后更新状态
	updateDeleteStatus({dispatch,commit,state,rootState},fileItem){
		// 判断tabs列表有没有
		const data1 = state.fileData;
		data1.forEach((item,index)=>{
			if(fileItem.value && fileItem.value === item.value){
				dispatch('updateRemoveData',index,{ root: true }); // 更新触发remove方法
				return ;
			}else if(fileItem.keyId === item.keyId){
				dispatch('updateRemoveData',index,{ root: true }); // 更新触发remove方法
			}

		});

		// 更新未保存vuex的状态
		let edit = state.editData;
		edit.forEach((item,index,data)=>{
			if(item.keyId === fileItem.keyId){
				data.splice(index,1);
				dispatch('updateData',edit,{ root: true });
			}
		})
	},
	updateRemoveData({commit,state},index){
		let id = state.removeData.id + 1
		const data = {
			id: id,
			index:index
		}
		commit('UPDATE_REMOVE_DATA',data)
	},

	//复制信息保存
	updateCopyText({commit,state},data){
		commit('UPDATE_COPY_TEXT',data)
	},
	boolSuccessVisible({commit,state},bool){
		commit('CHANGE_SUCCESS_VISIBLE',bool)
	}
}
