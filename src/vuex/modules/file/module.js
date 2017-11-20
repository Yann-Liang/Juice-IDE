/**
 * Created by 15236 on 2017/10/25.
 */
import { fileAction } from './action'
import { fileGetter } from './getter'
import { fileMutation } from './mutation'

export const file = {
    state: {
	    treeData:[],
	    url:[],
	    activeFile:'',
	    editFile:'',
	    position:{
	    	x:0,
		    y:0
	    },
	    rightMenuBlock:false,
	    fileCurrentId:1,
	    currentName:'',
	    showTipModal: false,
	    showDeleteModal: false,
	    deleteFile:'',
	    showFileNameModal:'',
	    showDirNameModal:'',
	    hintInfo:{
	    	show: false,
		    title:'',
		    message:''
	    },
	    newOpenFile:{
	    	id: 0
	    }
    },
    actions: fileAction,
    getters: fileGetter,
    mutations: fileMutation
};

export default file;
