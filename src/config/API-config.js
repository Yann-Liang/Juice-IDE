//请求地址
const BASE = 'http://192.168.9.92:9200/',//'http://192.168.9.94:9200/juevm/'//process.env.API_ROOT,
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