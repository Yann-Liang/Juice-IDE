/**
 * Created by 15236 on 2017/10/25.
 */
import file from '@/services/API-file'
const{dialog} = require('electron').remote;

export const fileAction = {
	queryFileListData({ commit, state }){
		const data = file.getFileList(state.url);
		commit('UPDATE_FILE_DATA', data);
	},
	setActiveFile({ commit, state },activeFile){
		commit('SET_ACTIVE_FILE', activeFile);
	},
	updateUrl({ dispatch,commit, state },url){
		localStorage.setItem('dirPath',JSON.stringify(url))
		commit('UPDATE_URL', url);
		// 监听文件变化
		let dirPathArr = state.url.filter((item)=>{
			return item.value;
		});
		file.watchFile(dirPathArr,(data)=>{
			if(data.type === 'add'){
			
			}else if(data.type === 'unlink'){
				const keyId = file.keyIdFn(data.path);
				dispatch('updateDeleteStatus',{keyId:keyId,value:data.path},{ root: true });
			}else if(data.type === 'change'){
			
			}
			dispatch('queryFileListData',null,{ root: true });
		});
		dispatch('queryFileListData',null,{ root: true });
	},
	updateEditFile({ commit, state },fileObj){
		commit('UPDATE_EDIT_FILE', fileObj);
		// console.log('state.editFile',state.editFile)
	},
	updatePosition({ commit, state },position){
		commit('UPDATE_POSITION', position);
	},
	updateRightMenuBlock({ commit, state },blo){
		commit('UPDATE_RIGHT_MENU_BLOCK', blo);
	},
	updateTreeData({ commit, state },OBJ){
		const data = file.updateFile(state.treeData,OBJ)
		commit('UPDATE_FILE_DATA', data);
	},
	saveAllFile({ commit, state,rootState,dispatch},cb){
		// 获取编辑未保存的文件数据
		const data = rootState.editor.editData;
		console.log('下面是编辑未保存的数据：')
		console.log(data);
		if(data.length>0){
			let fileData =data.filter((item)=>{
				return item.value;
			});
			let dialogFile = data.filter((item)=>{
				return !item.value;
			});
			// 递归调用保存有地址的文件
			file.saveAllHaveFile(fileData,(err,item)=>{
				if(err){

				}else{
					dispatch('updateTreeData',{keyId:item.keyId,save:true},{ root: true });
				}
			})

			// 递归调用保存没有地址的文件
			function saveAllNoFile(dialogFile){
				if(dialogFile.length>0){
					let currentFile = dialogFile[0]
					dialog.showSaveDialog({
						defaultPath:currentFile.name
					},(filename)=>{
						const filepath = filename ? filename.replace(/\\/g,'/') :'';
						if(filepath){
							file.writeFile(filepath,currentFile.source,(err)=>{
								if(err){

								}else{
									const keyId = file.keyIdFn(filepath);
									dispatch('updateFileData',{param:{keyId:currentFile.keyId,value:filepath,name:file.basename(filepath)},id:keyId},{ root: true });

									dispatch('updateTreeData',{keyId:currentFile.keyId,save:true,value:filepath,name:file.basename(filepath)},{ root: true });
									// 更新url
									const url = rootState.file.url;
									url.forEach((item,index)=>{
										if(item.name === currentFile.name && item.value === currentFile.value){
											item.value = keyId;
											item.name = file.basename(filepath)
											return false;
										}
									})
									dispatch('updateUrl',url,{ root: true });

									if(currentFile.keyId == rootState.editor.activeEditor.keyId){
										commit('UPDATE_ACTION_EDITOR',{  // 更新当前编辑的状态
											value: filepath,
											name: file.basename(filepath),
											keyId:keyId,
											source: rootState.editor.activeEditor.source
										})
										// 更新当前激活的文件状态
										dispatch('updateEditFile',{keyId:keyId,value:filepath,name:file.basename(filepath)},{ root: true });
									}

								}
							})
						}
						dialogFile.splice(0,1);
						saveAllNoFile(dialogFile)
					})
				}
			}
			// 更新未保存vuex的状态
			dispatch('updateData',[],{ root: true });
			saveAllNoFile(dialogFile);
			if(cb && typeof(cb)=='function'){
                cb();
            }
		}
	},
	renameFile({ commit, state,rootState,dispatch},name){
		const filesList = state.position.item;
		file.renameFile(filesList.value,name,(newFilePath)=>{
			// 重命名成功更新状态
			const keyId = file.keyIdFn(newFilePath);
			name = file.uffixName(name);
			// 更新updateFileData编辑去tabs
			dispatch('updateFileData',{param:{keyId:keyId,value:newFilePath,name:name}},{ root: true });

			// 更新当前编辑的状态
			if(keyId == rootState.editor.activeEditor.keyId){
				dispatch('updateActiveEditor',{
					value: newFilePath,
					name: name,
					keyId:keyId,
					source: rootState.editor.activeEditor.source
				},{ root: true });
				// 更新当前激活的文件状态
				dispatch('updateEditFile',{keyId:keyId,value:newFilePath,name:name},{ root: true });
			}

			// 更新未保存vuex的状态
			let edit = rootState.editor.editData;
			rootState.editor.editData.forEach((item,index)=>{
				if(item.keyId ===  keyId){
					edit[index].name = name;
					edit[index].value = newFilePath;
					dispatch('updateData',edit,{ root: true });
					return false;
				}
			})
		})
	},
	// 另存为
	saveOtherPath({ commit, state,rootState,dispatch},type){
		if(type == 1){
			const activeFile = rootState.editor.activeEditor;
			file.saveFile(activeFile.value,activeFile.name,activeFile.source,()=>{})
		}else if(type == 2){
			let activeFile = state.activeFile;
			if(activeFile.value){
				file.fsReadFile(activeFile.value,(err,data)=>{
					if(!err){
						file.saveFile('',activeFile.name,data,()=>{})
					}else{

					}
				});
			}else{
				let data = rootState.editor.editData.filter((item)=>{
					return item.keyId === activeFile.keyId
				});
				const name = data.length ? data[0].name : activeFile.name;
				const source =  data.length ? data[0].source : '';
				file.saveFile('',name,source,(err,filepath)=>{
					if(err){

					}else{
						const oldKeyId = activeFile.keyId;
						if(filepath){
							const keyId = file.keyIdFn(filepath);

							dispatch('updateFileData',{param:{keyId:oldKeyId,value:filepath,name:file.basename(filepath)},id:keyId},{ root: true });

							dispatch('updateTreeData',{keyId:oldKeyId,save:true,value:filepath,name:file.basename(filepath)},{ root: true });
							// 更新url
							let url = rootState.file.url;
							rootState.file.url.forEach((item,index)=>{
								if(item.keyId === oldKeyId ){
									url[index].value = filepath;
									url[index].name = file.basename(filepath);
									url[index].keyId = keyId;
									return;
								}
							})
							dispatch('updateUrl',url,{ root: true });
							console.log(rootState.file.url);

							if(oldKeyId == rootState.editor.activeEditor.keyId){
								commit('UPDATE_ACTION_EDITOR',{  // 更新当前编辑的状态
									value: filepath,
									name: file.basename(filepath),
									keyId:keyId,
									source: rootState.editor.activeEditor.source
								})
								// 更新当前激活的文件状态
								dispatch('updateEditFile',{keyId:keyId,value:filepath,name:file.basename(filepath)},{ root: true });
							}

						}else{
							dispatch('updateTreeData',{keyId:state.activeEditor.keyId,save:true},{ root: true });
						}
						// 更新未保存vuex的状态
						// let edit = rootState.editor.editData;
						// rootState.editor.editData.forEach((item,index)=>{
						// 	if(item.keyId ===  oldKeyId){
						// 		edit[index].value = filepath;
						// 		edit[index].name = file.basename(filepath);
						// 		edit[index].keyId = keyId;
						// 		return;
						// 	}
						// })
						let edit = [];
						rootState.editor.editData.forEach((item,index)=>{
							if(item.keyId !==  oldKeyId){
								edit.push(item);
							}
						})
						dispatch('updateData',edit,{ root: true });
					}
				})
			}
		}
	},
	// 删除所有文件
	removeAllFile({ commit, state}){
		const arr = state.url;
		arr.forEach((item,index)=>{
			if(item.value){
				file.removeFile(item.value,()=>{
					console.log('删除文件'+item.value+'成功');
				})
			}
		})
	}
}