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
		file.watchFile(dirPathArr,()=>{
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
	saveAllFile({ commit, state,rootState,dispatch}){
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
									
									if(currentFile.keyId == rootState.editor.activeEditor){
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
		}
	}
}