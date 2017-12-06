//请求地址
import fs from 'fs';
import path from 'path';
const app = require('electron').remote.app;

const BASE = process.env.NODE_ENV === 'development' ? 'http://192.168.9.92:9200/' : JSON.parse(fs.readFileSync(path.join(app.getPath('exe'), '..', 'config.json'),'utf8')).logUrl,//'http://192.168.9.94:9200/juevm/'//process.env.API_ROOT,
    USER_URL = `${BASE}/user/`,

    LOG = {
        search: `${BASE}juevm/juevm/_search`,
        juethSearch:`${BASE}jueth/jueth/_search`,
    },
    //用户
    USER = {
        register: `${USER_URL}register.do`,
        login: `${USER_URL}login.do`,
        verificationCode: `${USER_URL}validation.do`,
        baseInfo: `${USER_URL}getUserInfo.do`,
        getMenuList: `${USER_URL}getMenus.do`,
        logout: `${USER_URL}logout.do`,
    };



export default {
    BASE: BASE,
    USER: USER,
    LOG:LOG,
}