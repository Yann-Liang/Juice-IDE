<template>
    <div class="header">
        <div class="img">
            <img src="./image/img.png" height="32" width="115" alt="">
        </div>
        <div>
            <ul class="list" @click='setTab($event)'  style="cursor:default">
                <li>
                    文件
                    <file-data :fileVisible="fileVisible"></file-data>
                    <!-- <ul v-if='fileVisible'>
                        <li>新建文件</li>
                        <li>新建文件夹</li>
                        <li>导入本地文件</li>
                        <li>保存</li>
                        <li>导出到本地</li>
                        <li>全部保存</li>
                        <li>删除</li>
                        <li>删除所有文件</li>
                        <li  v-for="fileName in fileData" @mouseenter="showActive(fileName)" @mouseleave="removeActive()" @click="clickEvent($event)" :class="{active: fileClass == fileName}">{{fileName}}</li>
                    </ul> -->
                </li>
                <li>
                    编辑
                    <edit-data :editVisible="editVisible"></edit-data>
                </li>
                <li>
                    帮助
                </li>
            </ul>
        </div>
        <!-- 文件编辑帮助111 -->
    </div>
</template>
<script>
    import FileData from '@/components/fileComponent/file-data.vue';
    import EditData from '@/components/editComponent/edit-data.vue';
    export default {
        name: 'header',
        data() {
            return {
                fileVisible:false,
                editVisible:false,
            }
        },
        props: {

        },
        methods: {
            setTab:function(e){
                this.audit=e.target.innerText=='已审核'?'2':'1';
                if(e.target.innerText=='文件'){
                    console.log(1)
                    this.fileVisible=true;
                    this.editVisible=false;
                }else if(e.target.innerText=='编辑'){
                    console.log(22)
                    this.editVisible=true;
                    this.fileVisible=false;
                }else{
                    console.log(3);
                    this.editVisible=false;
                    this.fileVisible=false;

                }
            },

        },
        created() {

        },
        //组件
        components: {
            'file-data':FileData,
            'edit-data':EditData
        }

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
        padding-left:40px;
        li{
            line-height: @height;
            padding:0 30px;
            position: relative;

        }
       }
   }
</style>