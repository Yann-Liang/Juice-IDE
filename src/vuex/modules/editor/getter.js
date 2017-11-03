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
        console.log(typeof state.editData,state.editData)
        return state.editData
    },
	activeEditor(state){
    	return state.activeEditor
	}
};