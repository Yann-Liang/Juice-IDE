<template>
    <div class="header">

        <div>
            <ul class="list" style="cursor:default" @click.stop='setTab($event)'>
                <li>
                    文件
                    <!-- <div v-show="visible" ref="filedata" style="background:#000">弹出层</div> -->
                    <!-- <file-data :fileVisible="fileVisible" ref="filedata"></file-data> -->
                    <ul v-show='fileVisible' ref="filedata" >
                        <li v-for="fileName in fileData" :key="fileName" @mouseenter="showActive(fileName)" @mouseleave="removeActive()" @click="clickFileEvent($event)" :class="{'same': iSame,active: activeClass == fileName}">{{fileName}}</li>
                    </ul>
                </li>
                <li>
                    编辑
                    <ul v-show='editVisible' ref="editdata" >
                        <li v-for="(value,key) in editData"  :key="value" @mouseenter="showActive(value)" @mouseleave="removeActive()" :class="{'same': iSame,active: activeClass == value}" :data-type="value" @click.stop="clickEditEvent($event)">
                            {{value}}
                            <span :data-type="value">{{key}}</span>
                        </li>
                    </ul>
                </li>
                <li>
                    帮助
                </li>
            </ul>

        </div>
    </div>
</template>
<script>
    export default {
        name: 'header',
        data() {
            return {
                fileVisible:false,
                editVisible:false,
                iSame:true,
                activeClass:"",
                fileData:['新建文件', '新建文件夹', '导入本地文件', '保存', '导出到本地','全部保存','删除','删除所有文件'],
                editData:{
                    "Ctrl+Z":"撤销",
                    "Ctrl+Y":"恢复",
                    "Ctrl+C":"复制",
                    "Ctrl+X":"剪切",
                    "Ctrl+V":"粘贴",
                    "Ctrl+F":"查找",
                    "Ctrl+H":"替换",
                    "":"格式化",
                },

            }
        },
        props: {

        },
        methods: {
            setTab:function(e){
                if(e.target.innerText=='文件'){
                    console.log(1)
                    // this.fileVisible=true;
                    this.editVisible=false;
                    this.fileVisible ? this.hideFile() : this.showFile();
                    // this.visible ? this.hide() : this.show()
                }else if(e.target.innerText=='编辑'){
                    console.log(2)
                    // this.editVisible=true;
                    this.editVisible ? this.hideEdit() : this.showEdit()
                    this.fileVisible=false;
                }else{
                    console.log(3);
                    this.editVisible=false;
                    this.fileVisible=false;

                }
            },
            showFile () {
                this.fileVisible = true
                document.addEventListener('click', this.hidePanelFile, false)
            },
            hideFile () {
                this.fileVisible = false
                document.removeEventListener('click', this.hidePanelFile, false)
            },
            hidePanelFile (e) {
                console.log(this.$refs.filedata)
                console.log(this.$refs.filedata.contains(e.target));
                if (!this.$refs.filedata.contains(e.target)) {
                    this.hideFile()
                }
            },
            showEdit () {
                this.editVisible = true
                document.addEventListener('click', this.hidePanelEdit, false)
            },
            hideEdit () {
                this.editVisible = false
                document.removeEventListener('click', this.hidePanelEdit, false)
            },
            hidePanelEdit (e) {
                console.log(this.$refs.editdata)
                console.log(this.$refs.editdata.contains(e.target));
                if (!this.$refs.editdata.contains(e.target)) {
                    this.hideEdit();
                }
            },
            //鼠标悬停效果
            showActive: function(name) {
              this.activeClass = name
            },
            //鼠标离开效果
            removeActive: function(){
                this.activeClass = ""
            },
            //文件每个li的点击事件
            clickFileEvent:function(e){
                console.log(e.target.innerText);
            },
            //编辑每个li的点击事件
            clickEditEvent:function(e){
                this.editVisible = false
                console.log(e.target.getAttribute("data-type"));
            }

        },
        beforeDestroy () {
            this.hideFile();
            this.hideEdit();
        },
        created() {

        },
        //组件
        components: {

        },

    }
</script>

<style lang="less" scoped>
@height:48px;
   .header{
       height: @height;
       display: flex;
       flex-direction:row;
       background-color:#1b1b1b;
       color:#fff;
       .img{
        img{
            display: block;
            height:100%;
        }
       }
       .list{
        display: flex;
        flex-direction:row;
        height:@height;
        padding-left:0px;
        li{
            line-height: @height;
            padding:0 30px;
            position: relative;
            ul{
                position: absolute;
                width:170px;
                top:@height;
                left:0px;
                padding:5px 0;
                background-color:#1b1b1b;
                .same{
                    height:35px;
                    line-height: 35px;
                    padding:0 20px;
                    span{
                        float:right;
                        color:#999999;
                    }
                }
                .active{
                    background-color:gray;
                }
            }
            &:hover{
                background:gray;

            }
        }
       }
   }
</style>