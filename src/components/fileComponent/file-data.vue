<template>
    <!-- <div class="file-data" > -->
        <ul v-show='fileVisible'>
            <!-- <li>新建文件</li>
            <li>新建文件夹</li>
            <li>导入本地文件</li>
            <li>保存</li>
            <li>导出到本地</li>
            <li>全部保存</li>
            <li>删除</li>
            <li>删除所有文件</li> -->
            <li v-for="fileName in fileData" @mouseenter="showFileActive(fileName)" @mouseleave="removeFileActive()" @click="clickFileEvent($event)" :class="{'file-same': isFileSame,factive: fileClass == fileName}">{{fileName}}</li>
        </ul>
    <!-- </div> -->
</template>
<script>
    export default {
        name: '',
        data() {
            return {
                fileData:['新建文件', '新建文件夹', '导入本地文件', '保存', '导出到本地','全部保存','删除','删除所有文件'],
                fileClass:"",
                isFileSame:true
            }
        },
        props: {
            fileVisible:{
                type:Boolean,
                default:false
            }
        },
        methods: {
            //鼠标悬停效果
            showFileActive: function(fileName) {
              this.fileClass = fileName
            },
            //鼠标离开效果
            removeFileActive: function(){
                this.fileClass = ""
            },
            //每个li的点击事件
            clickFileEvent:function(e){
                console.log(e.target.innerText);
            }
        },
        created() {

        },

    }
</script>

<style lang="less" scoped>
@height:48px;
    ul{
        position: absolute;
        width:170px;
        top:@height;
        left:30px;
        padding:5px 0;
        background-color:#1b1b1b;
        .file-same{
            height:35px;
            line-height: 35px;
            padding-left:20px;
        }
        .factive{
            background-color:gray;
        }
    }
</style>