<template>
    <ul v-show='editVisible'>
        <!-- <li>新建文件</li>
        <li>新建文件夹</li>
        <li>导入本地文件</li>
        <li>保存</li>
        <li>导出到本地</li>
        <li>全部保存</li>
        <li>删除</li>
        <li>删除所有文件</li> -->
        <li v-for="(value,key) in editData" @mouseenter="showEditActive(value)" @mouseleave="removeEditActive()" :class="{'edit-same': isEditSame,eactive: editClass == value}" :data-type="value" @click.stop="clickEditEvent($event)">
            {{value}}
            <span :data-type="value">{{key}}</span>
        </li>
    </ul>
</template>
<script>
    export default {
        name: '',
        data() {
            return {
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
                editClass:"",
                isEditSame:true
            }
        },
        props: {
            editVisible:{
                type:Boolean,
                default:false
            }
        },
        methods: {
            //鼠标悬停效果
            showEditActive: function(editName) {
              this.editClass = editName
            },
            //鼠标离开效果
            removeEditActive: function(){
                this.editClass = ""
            },
            //每个li的点击事件
            clickEditEvent:function(e){
                e.stopPropagation();
                console.log(e.target.getAttribute("data-type"));
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
        .edit-same{
            height:35px;
            line-height: 35px;
            padding:0 20px;
            span{
                float:right;
            }
        }
        .eactive{
            background-color:gray;
        }
    }
</style>