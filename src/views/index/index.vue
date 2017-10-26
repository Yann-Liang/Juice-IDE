<template>
    <div class="index">
        <com-title></com-title>
        <com-header></com-header>

        <div class="main">
            <ul class="tabs">
                <li @click="filesTab()">文件</li>
                <li @click="compile()">编译</li>
                <li @click="deployTab()">部署</li>
                <li @click="runTab()">运行</li>
            </ul>
            <files-tab class="tab" v-if="filesTabFlag"></files-tab>
            <deploy-tab class="tab" v-if="deployTabFlag"></deploy-tab>
            <run-tab class="tab" v-if="runTabFlag"></run-tab>
            <div class="main-right">
                <editor class="editor"></editor>
                <console class="console"></console>
            </div>
        </div>
    </div>
</template>

<script>
    //import  from ''
    import comTitle from "@/components/title/";
    import comHeader from "@/components/Header/Header.vue";
    import filesTab from "@/components/tabs/files-tab/";
    import deployTab from "@/components/tabs/deploy-tab/";
    import runTab from "@/components/tabs/run-tab/";
    import console from "@/components/console/";
    import editor from "@/components/editor/";
    import compileService from '@/services/compile-exe/compile-service';
    import consoleService from '@/services/compile-exe/console-service';
    import {mapState, mapActions, mapGetters} from 'vuex';
    export default {
        //组件名
        name: "index",
        //实例的数据对象
        data() {
            return {
                filesTabFlag: false,
                deployTabFlag: false,
                runTabFlag: false
            };
        },
        //数组或对象，用于接收来自父组件的数据
        props: {},
        //计算
        computed: {
            ...mapGetters(['consoleFlag'])
        },
        //方法
        methods: {
            filesTab() {
                this.filesTabFlag = !this.filesTabFlag;
                this.deployTabFlag = false;
                this.runTabFlag = false;
            },
            compile() {
                this.filesTabFlag = false;
                this.deployTabFlag = false;
                this.runTabFlag = false;
                consoleService.output(true,compileService.compiler());
            },
            deployTab() {
                this.deployTabFlag = !this.deployTabFlag;
                this.filesTabFlag = false;
                this.runTabFlag = false;
            },
            runTab() {
                this.runTabFlag = !this.runTabFlag;
                this.deployTabFlag = false;
                this.filesTabFlag = false;
            },
            viewLog(){
                consoleService.output(!this.consoleFlag);
            }
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
            comTitle,
            comHeader,
            filesTab,
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

    .main {
        display: flex;
        flex: 1;
    }

    .tabs {
        width: 48px;
        background: #0b8aee;
        color: #fff;
        text-align: center;
        >li {
            cursor: pointer;
        }
    }

    .tab{
        width: 220px;
        border-right: 1px solid #0b8aee;
    }

    .main-right {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .editor {
        /*height: 70%;*/
        flex-grow:1;
    }

    .console-container{
        align-items:flex-end;
        h4{
            padding:0 10px;
            height:50px;
            line-height:50px;
            background-color: #000;
            color:#fff;
            .fr{
               cursor:pointer;
               float:right;
            }
        }
    }
</style>