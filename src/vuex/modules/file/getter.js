/**
 * Created by 15236 on 2017/10/25.
 */
export const fileGetter = {
	fileTreeData(state){
		return state.treeData
	},
	activeFile(state){
		return state.activeFile
	},
	getUrl(state){
		return state.url
	},
	editFile(state){
		return state.editFile
	},
	position(state){
		return state.position
	},
	rightMenuBlock(state){
		return state.rightMenuBlock
	},
	fileCurrentId(state){
		return state.fileCurrentId;
	},
	currentName(state){
		let name = 'Untitled'+ state.fileCurrentId;
		return name
	},
	showTipModal(state){
		return state.showTipModal;
	},
	showDeleteModal(state){
		return state.showDeleteModal;
	},
	deleteFile(state){
		return state.deleteFile;
	},
	showFileNameModal(state){
		return state.showFileNameModal;
	},
	showDirNameModal(state){
		return state.showDirNameModal;
	},
	hintInfo(state){
		return state.hintInfo;
	},
	newOpenFile(state){
		return state.newOpenFile;
	},
	typeERR(state){
		return state.typeERR;
	},
	dialogInfo(state){
		return state.dialogInfo;
	}
};