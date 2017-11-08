/*
 * @Author: liangyanxiang
 * @Date: 2017-11-07 14:05:12
 * @Last Modified by: liangyanxiang
 * @Last Modified time: 2017-11-07 15:39:11
 * 用于管理部署日志
 */

const isArray = (o) => {
    return Object.prototype.toString.call(o) === '[object Array]';
}
class DeployLogStorage {
    constructor() {
        this.key = 'deployLog';
        this.saveLength = 200;//保存日志的数量
        this.data = [];//存放数据
    }

    get() {
        return JSON.parse(window.localStorage.getItem(this.key))
    }

    set(content) {
        try {
            if (isArray(content)){
                window.localStorage.setItem(this.key, JSON.stringify(content))
            } else {
                window.localStorage.setItem(this.key, content)
            }

        } catch (exception) {
            return false
        }
        return true
    }


    //添加日志
    push(...items) {
        if (!this.data||this.data==null||this.data.length==0) {
            this.data = this.get();
            this.data ? '' : this.data = [];
        }
        items.forEach((item) => {
            this.data.push(item);
            this.data.length > this.saveLength ? this.data.shift() : '';
        });
        this.set(this.data)
    }

    remove() {
        window.localStorage.removeItem(this.key)
        return true
    }

    //设置保存条数
    setSaveLength(len) {
        this.saveLength = len;
        return true;
    }

}

//导出一个类
export default  DeployLogStorage;