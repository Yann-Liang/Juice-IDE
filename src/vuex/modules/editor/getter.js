/**
 * Created by 15236 on 2017/10/25.
 */
export const editorGetter = {
    actionCode(state){
        return state.actionCode
    },
    saveCode(state){
        return state.saveCode
    },
    editData(state){
        // console.log(typeof state.editData,state.editData)
        return state.editData
    },
	activeEditor(state){
        console.log('state.activeEditor',state.activeEditor)
    	return state.activeEditor
	},
    editor(state){
        console.log('editor对象',state.editor)
        return state.editor
    },
    searchVisible(state){
        return state.searchVisible
    },
    replaceVisible(state){
        return state.replaceVisible
    }
};