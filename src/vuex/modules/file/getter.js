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
	}
};