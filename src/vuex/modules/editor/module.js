/**
 * Created by 15236 on 2017/10/25.
 */
import { editorAction } from './action'
import { editorGetter } from './getter'
import { editorMutation } from './mutation'
//actionCode:用户在编辑栏选择的操作：
//0 没操作 初始值
//1 撤销
//2 回复
//3 复制
//4 剪切
//5 粘贴
//6 查找
//7 替换
//8 格式化
export const editor = {
    state: {
        actionCode:0
    },
    actions: editorAction,
    getters: editorGetter,
    mutations: editorMutation
};

export default editor;
