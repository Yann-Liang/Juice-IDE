<template>
    <div class="index">
        <header class="header1">
            <i class="header-icon"></i>
            <ul class="header-right fr" id="toolbar">
                <li class="min"></li>
                <li class="max"></li>
                <li class="close"></li>
            </ul>
            <p>Juice IDE</p>

        </header>
        <com-header>

        </com-header>
        <div class="main">
            <ul class="tabs">
                <li @click="filesTab()">文件</li>
                <li @click="compileTab()">编译</li>
                <li @click="deployTab()">部署</li>
                <li @click="runTab()">运行</li>
            </ul>
            <files-tab class="tab" v-if="filesTabFlag"></files-tab>
            <deploy-tab class="tab" v-if="deployTabFlag"></deploy-tab>
            <run-tab class="tab" v-if="runTabFlag"></run-tab>
            <compile-tab class="tab" v-if="compileTabFlag"></compile-tab>
            <div class="main-right">
                <editor class="editor"></editor>
                <console class="console"></console>
            </div>
        </div>
    </div>
</template>

<script>
    //import  from ''
    import comHeader from "@/components/Header/Header.vue";
    import filesTab from "@/components/tabs/files-tab/";
    import compileTab from "@/components/tabs/compile-tab/";
    import deployTab from "@/components/tabs/deploy-tab/";
    import runTab from "@/components/tabs/run-tab/";
    import console from "@/components/console/";
    import editor from "@/components/editor/";
    //var child_process = require('child_process');

    export default {
        //组件名
        name: "index",
        //实例的数据对象
        data() {
            return {
                filesTabFlag: false,
                compileTabFlag: false,
                deployTabFlag: false,
                runTabFlag: false,
            };
        },
        //数组或对象，用于接收来自父组件的数据
        props: {},
        //计算
        computed: {},
        //方法
        methods: {
            filesTab() {
                this.filesTabFlag = !this.filesTabFlag;
                this.compileTabFlag = false;
                this.deployTabFlag = false;
                this.runTabFlag = false;
            },
            compileTab() {
                this.compileTabFlag = !this.compileTabFlag;
                this.filesTabFlag = false;
                this.deployTabFlag = false;
                this.runTabFlag = false;
            },
            deployTab() {
                this.deployTabFlag = !this.deployTabFlag;
                this.compileTabFlag = false;
                this.filesTabFlag = false;
                this.runTabFlag = false;
            },
            runTab() {
                this.runTabFlag = !this.runTabFlag;
                this.compileTabFlag = false;
                this.deployTabFlag = false;
                this.filesTabFlag = false;
            },
        },
        //生命周期函数
        created() {

        },
        beforeMount() {},
        mounted() {},
        //监视
        watch: {},
        //组件
        components: {
            comHeader,
            filesTab,
            compileTab,
            deployTab,
            runTab,
            console,
            editor
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

    .header1 {
			height: 50px;
			line-height: 50px;
			color: white;
			background: #0b8aee;
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

    .main {
        display: flex;
        flex: 1;
    }

    .tabs {
        width: 48px;
        background: #eee;
        >li {
            cursor: pointer;
        }
    }

    .tab{
        width: 220px;
        border-right: 1px solid #999;
    }

    .main-right {
        display: flex;
        flex-direction: column;
    }

    .editor {
        height: 70%;
    }

    .console {
        height: 30%;
    }
</style>