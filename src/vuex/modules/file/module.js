/**
 * Created by 15236 on 2017/10/25.
 */
import { fileAction } from './action'
import { fileGetter } from './getter'
import { fileMutation } from './mutation'

export const file = {
    state: {
	    treeData:[],
	    url:[
	    	    {"value":"E:/wamp/www/webapp/static/js/js","name":"js"}
	    	],
	    activeFile:'',
	    editFile:''
    },
    actions: fileAction,
    getters: fileGetter,
    mutations: fileMutation
};

export default file;
