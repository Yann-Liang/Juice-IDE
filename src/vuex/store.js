import Vue from 'vue'
import Vuex from 'vuex'
import console from './modules/console/module.js'
import compile from './modules/compile/module.js'
import file from './modules/file/module.js'
import deploy from './modules/deploy/module.js'
import editor from './modules/editor/module.js'

Vue.use(Vuex)

// 应用初始状态
const state = {

};

// 定义所需的 mutations
const mutations = {

};

// 创建 store 实例
export default new Vuex.Store({
	modules: {
		console,
	    compile,
		file,
		deploy,
		editor
	},
	state
})

