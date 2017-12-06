/**
 * Created by 15236 on 2017/10/25.
 */
import file from '@/services/API-file'
const{dialog} = require('electron').remote;

export const fileAction = {
	queryFileListData({ commit, state,rootState, dispatch}){
		let data = file.getFileList(state.url);
		rootState.editor.editData.forEach((item,index)=>{
			data = file.updateFile(data,{keyId:item.keyId,save:false})
		});
		commit('UPDATE_FILE_DATA', data);
	},
	setActiveFile({ commit, state },activeFile){
		commit('SET_ACTIVE_FILE', activeFile);
	},
	doneUrlFn({ commit, state ,dispatch},filesList){
		state.url.forEach((item,index,data)=>{
			if(filesList.value === item.value){
				data.splice(index,1);
				dispatch('updateUrl',data,{ root: true });
				return;
			}
		})
	},
	updateUrl({ dispatch,commit, state,rootState },url){
		localStorage.setItem('dirPath',JSON.stringify(url))
		commit('UPDATE_URL', url);
		// 监听文件变化
		let dirPathArr = state.url.filter((item)=>{
			return item.value;
		});
		file.watchFile(dirPathArr,(data)=>{
			if(data.type === 'add' || data.type === 'unlinkDir' || data.type === 'addDir'){
				dispatch('queryFileListData',null,{ root: true });
			}else if(data.type === 'unlink'){
				dispatch('doneUrlFn',{value:data.path},{ root: true });  // 更新根目录路径列表
				dispatch('updateDeleteStatus',{keyId:file.keyIdFn(),value:data.path},{ root: true }); // 更新删除状态
				dispatch('queryFileListData',null,{ root: true });
			}else if(data.type === 'change'){
				rootState.editor.fileData.forEach((item,index,fileData)=>{
					if(item.value === data.path){
						if(rootState.editor.activeEditor.value === data.path){
							//  设置值

							const sessionData = rootState.editor.editor.getValue();

							const source = file.readFileSync(data.path);
							if(sessionData != source){
								rootState.editor.editor.setValue(source.toString());
							}
						}else{
							// 更新source
							const arr = rootState.editor.editData;
							arr.forEach((itm,ind,result)=>{
								if(itm.value === data.path){
									const source = file.readFileSync(data.path);
									result[ind].source = source;
									dispatch('updateData',result,{ root: true });
								}
							})
						}
					}
				})
			}
		});
		dispatch('queryFileListData',null,{ root: true });
	},
	updateEditFile({ commit, state },fileObj){
		commit('UPDATE_EDIT_FILE', fileObj);
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
		let arr = localStorage.getItem('editFileData') ? JSON.parse(localStorage.getItem('editFileData')):[];
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
					alert(`${item.name}文件保存失败！`)
				}else{
					arr = file.deleteArrItem(arr,item);
					dispatch('updateData',arr,{ root: true });
					dispatch('updateTreeData',{keyId:item.keyId,save:true},{ root: true });
				}
			});



			// 递归调用保存没有地址的文件
			function saveAllNoFile(dialogFile){
				if(dialogFile.length>0){
					let currentFile = dialogFile[0]
					dialog.showSaveDialog({
						defaultPath:currentFile.name
					},(filename)=>{
						const filepath = filename ? filename.replace(/\\/g,'/') :'';
						if(filepath){
							arr = file.deleteArrItem(arr,currentFile);
							dispatch('updateData',arr,{ root: true });
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
											item.value = filepath;
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
			// dispatch('updateData',[],{ root: true });
			saveAllNoFile(dialogFile);
			if(cb && typeof(cb)=='function'){
                cb();
            }
		}
	},
	renameFile({ commit, state,rootState,dispatch},name){
		const filesList = state.position.item;
		file.watcher.close();
		file.renameFile(filesList.value,name,(newFilePath,err)=>{
			// 重命名成功更新状态
			if(err){
				dispatch('changeTypeERR');
				throw err;
			}
			const keyId = newFilePath ? file.keyIdFn(newFilePath) : filesList.keyId;
			name = file.isDir(newFilePath) ? name :file.uffixName(name);
			// 更新updateFileData编辑去tabs
			if(file.isFile(newFilePath) || newFilePath === ''){ // 如果是文件
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
			}else if(file.isDir(newFilePath)){ //如果是文件夹
				let activeIndex = 0;
				let fileDataArr = rootState.editor.fileData.filter((item,index) => {
					if(item.value.indexOf(filesList.value) === -1){
						return true;
						
					}
				});
				fileDataArr.forEach((item,index)=>{
					if(item.value === rootState.editor.activeEditor.value){
						activeIndex = index;
					}
				})

				dispatch('changeFileData',fileDataArr,{root:true}) // 更新fileData;
				dispatch('updateRemoveData',{index:activeIndex,fileItem:{keyId:'setValue'}},{ root: true }); // 更新触发remove方法

				let editData = rootState.editor.editData.filter((item,index) => {
					if(item.value.indexOf(filesList.value) === -1){
						return true;
					}
				});

				dispatch('updateData',editData,{root:true}) // 更新fileData;
			}
			// 更新url
			const url = rootState.file.url;
			url.forEach((item,index)=>{
				if(item.name === filesList.name && item.value === filesList.value){
					item.value = newFilePath;
					item.name = name;
					return false;
				}
			})
			dispatch('updateUrl',url,{ root: true });
		})
	},
	// 另存为
	saveOtherPath({ commit, state,rootState,dispatch},type){
		if(type == 1){
			const activeFile = rootState.editor.activeEditor;
			file.saveFile('',activeFile.name,activeFile.source,()=>{})
		}else if(type == 2){
			let activeFile = state.activeFile;
			if(activeFile.value){
				file.saveFile('',activeFile.name,null,(err,filename)=>{
					if(err){
						if (err) return console.error(err)
					}else{
						file.copeFn(activeFile.value,filename)
					}
				})

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
				})
			}
		})
	},

	// 更新当前新建文件
	updateCurrentId({ commit, state}){
		let id = state.fileCurrentId + 1;
		commit('UPDATE_CURRENT_ID', id);
	},

	removeFileFn({ commit, state ,dispatch ,rootState}){
		function updateUrlFn(){
			const arr = state.url.filter((item,index) =>{
				if(!(state.activeFile.value == item.value && state.activeFile.name == item.name)){
					return true;
				}
			});
			dispatch('updateUrl',arr,{root:true});
			dispatch('queryFileListData',null,{ root: true });
		}
		if(state.activeFile.value){
			if(file.isFile(state.activeFile.value)){ // 如果是文件
				file.removeFile(state.activeFile.value,()=>{
					dispatch('updateDeleteStatus',state.activeFile,{root:true})
					updateUrlFn();
					dispatch('setActiveFile','',{root:true})
				})
			}else if(file.isDir(state.activeFile.value)){ //如果是文件夹
				let activeIndex = 0;
				let fileDataArr = rootState.editor.fileData.filter((item,index) => {
					if(item.value.indexOf(state.activeFile.value) === -1){
						return true;
					}
				});
				fileDataArr.forEach((item,index)=>{
					if(item.value === rootState.editor.activeEditor.value){
						activeIndex = index;
					}
				})


				dispatch('changeFileData',fileDataArr,{root:true}) // 更新fileData;
				dispatch('updateRemoveData',{index:0,fileItem:{keyId:'setValue'}},{ root: true }); // 更新触发remove方法

				let editData = rootState.editor.editData.filter((item,index) => {
					if(item.value.indexOf(state.activeFile.value) === -1){
						return true;
					}
				});

				dispatch('updateData',editData,{root:true}) // 更新fileData;
				file.removeFile(state.activeFile.value,()=>{
					dispatch('setActiveFile','',{root:true})
				})
				updateUrlFn()
			}
		}else{
			updateUrlFn()
			dispatch('updateDeleteStatus',state.activeFile,{root:true});
			dispatch('setActiveFile','',{root:true})
		}
		dispatch('updateRightMenuBlock',false,{root:true})
	},
	changeShowTipModal({ commit, state },blo){
		commit('CHANGE_SHOW_MODAL',blo);
	},
	changeShowDeleteModal({ commit, state },blo){
		commit('CHANGE_DELETE_MODAL',blo);
	},
	changeDeleteFile({ commit, state },deleteFile){
		commit('CHANGE_DELETE_FILE',deleteFile);
	},
	changeShowFileNameModal({ commit, state },fileName){
		commit('CHANGE_FILE_NAME',fileName);
	},
	changeDirNameModal({ commit, state },showDirNameModal){
		commit('CHANGE_DIR_NAME',showDirNameModal);
	},
	setHintInfo({ commit, state },hintInfo){
		commit('SET_HINT_INFO',hintInfo);
	},
	updateNewOpenFile({ commit, state },fileItem){
		let id = state.newOpenFile.id + 1;
		const data = {
			id: id,
			newFile:fileItem
		}
		commit('UPDATE_NEW_OPEN_FILE',data)
	},
	changeTypeERR({ commit, state }){
		commit('CHANGE_TYPE_ERR',true)
		setTimeout(()=>{
			commit('CHANGE_TYPE_ERR',false)
		},2000)
	},
	changeDialogInfo({ commit, state },data){
		commit('CHANGE_DIALOG_INFO',data)
	}
}