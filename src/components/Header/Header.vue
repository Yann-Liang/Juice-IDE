<template>
    <div class="header">
        <div class="img">
            <img src="./image/img.png" height="32" width="115" alt="">
        </div>
        <div>
            <ul class="list" @click='setTab($event)'>
                <li>
                    文件
                    <ul v-if='fileVisible'>
                        <li>新建文件</li>
                        <li>新建文件夹</li>
                        <li>导入本地文件</li>
                        <li>保存</li>
                        <li>导出到本地</li>
                        <li>全部保存</li>
                        <li>删除</li>
                        <li>删除所有文件</li>
                    </ul>
                </li>
                <li>
                    编辑
                    <ul v-if='editVisible'>
                        <li>撤销 <span>Ctrl+Z</span></li>
                        <li>恢复 <span>Ctrl+Y</span></li>
                        <li>复制 <span>Ctrl+C</span></li>
                        <li>剪切 <span>Ctrl+X</span></li>
                        <li>粘贴 <span>Ctrl+V</span></li>
                        <li>查找 <span>Ctrl+F</span></li>
                        <li>替换 <span>Ctrl+H</span></li>
                        <li>格式化</li>
                    </ul>
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
                    this.fileVisible=true;
                    this.editVisible=false;
                }else if(e.target.innerText=='编辑'){
                    this.editVisible=true;
                    this.fileVisible=false;
                }else if(e.target.innerText !=='文件' || e.target.innerText !=='编辑'){
                    this.editVisible=false;
                    this.fileVisible=false;
                    return;
                }
            }
        },
        created() {

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
        padding-left:40px;
        li{
            line-height: @height;
            padding:0 30px;
            position: relative;
            ul{
                // display: none;
                position: absolute;
                width:200px;
                top:@height;
                left:30px;
                padding:5px 0;
                background-color:#000;
                li{
                    height:35px;
                    line-height: 35px;
                }
            }
        }
       }
   }
</style>