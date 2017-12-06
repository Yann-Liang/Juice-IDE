<template>
    <div class="modal" v-if="validFlag">
        <div class="modal-main  info-model">
            <el-row class="modal-title model-right">
                <span>JUICE区块链账户验证</span>
                <span class="modal-close" @click='closeVaild'></span>
            </el-row>
            <div class="modal-content model-password">
                <el-form :model='login2' ref='form3' :rules='rules' label-width='70px'>
                    <el-form-item label="账户名" >
                        <el-input v-model="login2.userName" class="input-box" :disabled="true"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="accountPwd">
                        <el-input type="password" v-model="login2.accountPwd" class="input-box" placeholder='请输入区块链账户身份证书密码'></el-input>
                        <div class="el-form-item__error" v-if="passwordERR">密码输入错误</div>
                    </el-form-item>
                    <el-form-item label="验证码" prop="code">
                        <el-input v-model="login2.code" class="input-box" id="code" @blur='checkLpicma' placeholder='请输入验证码'></el-input>
                        <div class="code-img">
                            <img :src='imgURL'>
                            <input type="text" v-model='checkCode' :style='{color:activeColor}'>
                        </div>
                        <span unselectable="on" @click="codeURL" class='update-code'>

                            </span>
                        <div class="el-form-item__error" v-if="codeERR">验证码不正确</div>
                    </el-form-item>
                </el-form>
            </div>
            <div class="modal-btn">
                <el-button class='bgcanbtn white btn-info' @click='closeVaild'>取消</el-button>
                <el-button class="bgblue white btn-info" type="p
                rimary" @click='sureValid' :disabled='disabled'>确定</el-button>
            </div>
        </div>
    </div>
</template>
<script>

import helpText from '@/config/input-info-congif.js'
import contractServies from '@/services/contract-servies';

export default{
   //组件名
        name: 'index',
        //实例的数据对象
        data() {
            return {
                passwordERR:false,
                login2:{
                    accountPwd:"",
                    code:"",
                    userName:contractServies.user.username,
                },
                imgURL:'',
                codeERR: false,
                checkCode:"",
                activeColor:"",
                disabled:false,
                rules:{
                    accountPwd:{required:true,message:helpText.NOTEMPTY.pwd},
                    code:{required:true,message:helpText.NOTEMPTY.code}
                }
            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: {
            boolValidVisible:{
				type: Boolean,
      			default: false,
            },
            validFlag:{
				type: Boolean,
      			default: false,
            },
        },
        //计算
        computed: {

        },
        //方法
        methods: {
           //生成随机颜色
            getColor(){
                return '#'+Math.floor(Math.random()*0xffffff).toString(16);
            },
            //生成图片验证码
            codeURL(){
                var code = "";
                var codeLength = 4;
                var random = new Array(0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R',
     'S','T','U','V','W','X','Y','Z');
                for(var i = 0; i < codeLength; i++) {
                   //循环操作
                   var index = Math.floor(Math.random()*36);//取得随机数的索引（0~35）
                   // code.style.color = this.getColor();
                   code += random[index];//根据索引取得随机数加到code上

                }
                // console.log(this.getColor())
                this.checkCode = code;
                this.activeColor = this.getColor();
                console.log("this.activeColor",this.activeColor)
            },
            //失焦验证
            checkLpicma(){
                this.login2.code.toUpperCase();
                if(this.login2.code == ""){
                    this.codeERR = false;
                    // return false;
                }else if(this.login2.code.toUpperCase() != this.checkCode){
                    this.codeERR = true;
                }else{
                   this.codeERR = false;
                }
            },
            closeVaild(){
                this.$emit('close');
            },
            sureValid(){
                this.$refs.form3.validate((valid)=>{
                    if(valid){
                        if(this.login2.code.toUpperCase() != this.checkCode){
                            this.codeERR = true;
                        }else{
                            this.codeERR = false;
                            try {
                                Juice.wallet.login({
                                    username:contractServies.user.username,
                                    password:this.login2.accountPwd,
                                    type:contractServies.user.type,
                                },(res)=>{
                                    this.codeURL();//更新验证码
                                    if(!res.code){
                                        this.login2.accountPwd='';
                                        this.login2.code='';
                                        this.$emit('emitDeploy');
                                    }else{
                                        //不存在
                                        this.passwordERR = true;
                                    }
                                })
                            } catch (error) {
                                alert(error)
                            }
                            //this.$emit('emitDeploy');
                        }

                    }
                })
                // this.sureLeadIn();
            },
        },
        //生命周期函数
        created() {
            try {
                Juice.user.getUserInfo((res)=>{
                    if(!res.code){
                        this.login2.userName=res.data.uuid;
                    }
                })
            } catch (error) {

            }
            this.login2.accountPwd='';
            this.login2.code='';
            this.codeURL();
        },
        beforeMount() {

        },
        mounted() {

        },
        //监视
        watch: {
            focusEle: function (val) {
                this.classObj['psw-icon'] = (val == '1');
                this.classObj['psw-icon-s'] = (val == '2');
                this.classObj['psw-icon-r'] = (val == '3');
            }
        },
        //组件
        components: {

        },
        //过滤器
        filters:{

        },
        //自定义指令
        directive:{

        }
}
</script>
<style lang="less" scoped>
@height:50px;
@blue:#0b8aee;
@red:red;
  .modal{
        .modal-main{
            .modal-btn{
                height:70px;
                line-height: 70px;
                span{
                    cursor: pointer;
                }
            }
            .modal-content{
                // width: 310px;
                color: #000;
                padding: 35px 25px 25px;
                p{
                    height:40px;
                    line-height: 40px;
                }
            }
            .model-password{
                color: #000;
                padding: 28px 25px 5px;
            }


        }
    }

    .input-box {
        width: 100%;
        height: 50px;
        padding-left: 0px;
        font-size: 16px;
        color: #949494;

        &:focus {
            border-color: #20a0ff;
        }
    }

    .code-img{
        display: inline-block;
        height:36px;
        vertical-align: top;
        margin:0 5px 0 5px;
        border:1px solid #bfbfbf;
        width:100px;
        overflow: hidden;
        border-radius:3px;
        >input{
            width:100%;
            height:100%;
            border:0;
            text-align: center;
            background:#f2f2f2;
            border-radius:3px;
            font-weight:bolder;
            letter-spacing: 3px;
            font-style:italic;
            font-family:Arial;
            font-size:20px;
            // color:blue;
        }
    }
    .update-code{
        display: inline-block;
        width: 25px;
        height:25px;
        float:right;
        margin-top:2px;
        margin-right:10px;
        background: url('images/update.png') no-repeat  center 7px;
        cursor: pointer;
    }
    .el-icon-refresh{
        height:36px;
        line-height: 36px;
    }
    .codeERR{
        margin-left:60px;
        font-size:12px;
        color:@red;
    }
    .el-form-item__error{
        top:80%;
    }
    #code{
        width:56%;
    }
</style>