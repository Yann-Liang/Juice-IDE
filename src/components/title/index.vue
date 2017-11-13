<template>
    <header class="title-header bgblue white">
        <i class="header-icon"></i>
        <ul class="header-right fr" id="toolbar">
            <li class="min" @click="min"></li>
            <li class="max" @click="max"></li>
            <li class="close" @click="close"></li>
        </ul>
        <p>JUICE IDE</p>
        <!--
        	作者：liangyanxiangde@163.com
        	时间：2017-08-16
        	描述：提示弹窗
        -->
		<div class="modal" v-if="info.flag">
			<div class="modal-main  info-model">
				<el-row class="modal-title">
					<span>{{info.title}}</span>
					<i class="modal-close" @click="closeModal()"></i>
				</el-row>
				<ul class="modal-content">
					<p class="info-text"><i class="info-icon fl" :class="info.class"></i>{{info.text}}</p>
				</ul>
				<div class="modal-btn">
					<el-button class="cancel-btn" @click="closeModal()">取消</el-button>
					<el-button class="" type="primary" @click="infoConfirm()">确定</el-button>
				</div>
			</div>
		</div>
    </header>
</template>

<script>
    //import  from ''
    const BrowserWindow = require('electron').remote.BrowserWindow;
    let win=null;

    export default {
        //组件名
        name: "index",
        //实例的数据对象
        data() {
            return {
                isMaximized:false,
                info: {
					flag: false,
					title: '',
					text: '',
					class: '',
				},
            };
        },
        //数组或对象，用于接收来自父组件的数据
        props: {},
        //计算
        computed: {
        },
        //方法
        methods: {
            min(){
                win.minimize();
            },
            max(){
                console.log(this.isMaximized)
                this.isMaximized?win.unmaximize():win.maximize();
                this.isMaximized=!this.isMaximized;
            },
            close(){
                this.info={
					flag: true,
					title: '是否退出IDE?',
					text: '是否退出IDE？退出前，请确保所有文件已经保存！',
					class: 'warning',
				}

            },
            infoConfirm(){
                win.close();
                // 清空编辑的localStorage
                localStorage.setItem('editFileData',[]);
            },
            closeModal(){
                this.info={
					flag: false,
					title: '',
					text: '',
					class: '',
				}
            }
        },
        //生命周期函数
        created() {
            BrowserWindow.getAllWindows().map((item, index, arr) => {
                if (item.getTitle() == document.title) {
                    win = item;
                }
            });
        },
        beforeMount() {},
        mounted() {},
        //监视
        watch: {},
        //组件
        components: {

        },
        //过滤器
        filters: {},
        //自定义指令
        directive: {}
    };
</script>

<style lang="less" scoped>
    .index {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }

    .title-header {
        height: 50px;
        line-height: 50px;
        -webkit-app-region: drag;
    }

    .header-icon {
        float: left;
        margin: 9px;
        width: 32px;
        height: 32px;
        background: url(./images/icon.png);
        background-size: 100% 100%;
    }

    .header-right {
        -webkit-app-region: no-drag;
    }

    .header-right>li {
        cursor: pointer;
        display: inline-block;
        margin: 14px 15px 0px;
        width: 16px;
        height: 16px;
        background-repeat: no-repeat;
        background-size: 90%;
    }

    .min{
        background: url(./images/shrink.png) 0 8px;
    }

    .max{
        background: url(./images/magnify.png) 0 0;
    }

    .close{
        background: url(./images/close.png);
    }

    .info-model{
		.modal-content {
			width: 650px;
			color: #000;
			padding: 50px 0 60px 45px;
		}
		.info-icon {
			margin: 0 10px 0 0;
			width: 40px;
			height: 40px;
			background-repeat: no-repeat;
		}
		.warning {
			background: url(./images/hint_big.png);
		}
		.info-text {
			font-size: 18px;
			line-height: 40px;
		}
		.success {
			background: url(./images/complete.png);
		}
		.error {
			background: url(./images/error.png);
		}
	}

	.info-text {
		line-height: 40px;
	}
</style>