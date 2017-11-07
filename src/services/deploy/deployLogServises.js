/*
 * @Author: liangyanxiang
 * @Date: 2017-11-07 14:05:12
 * @Last Modified by: liangyanxiang
 * @Last Modified time: 2017-11-07 14:07:28
 * 用于管理部署日志
 */

class DeployLogStorage {
    constructor() {
        this.key = 'deployLog';
    }

    get = function (name) {
        return window.localStorage.getItem(key)
    }

    set = function (content) {
        try {
            window.localStorage.setItem(key, content)
        } catch (exception) {
            return false
        }
        return true
    }

    remove = function () {
        window.localStorage.removeItem(this.key)
        return true
    }

    rename = function (originalName, newName) {
        var content = this.get(originalName)
        if (!this.set(newName, content)) {
            return false
        }
        this.remove(originalName)
        return true
    }


}

//导出一个类
export default  DeployLogStorage;