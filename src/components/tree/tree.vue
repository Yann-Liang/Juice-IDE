<template>
    <div >
        <li class="tree">
            <div
                class="ellipsis root-file"
                :class="{bold: isFolder,activeClass:filesList.value == activeFile.value && filesList.name ==  activeFile.name}"
                @mousedown.stop="rightMenu(filesList, $event)"
                @click="toggle(filesList)">
                <!--@dblclick="changeType">-->
                <i class="el-icon-date dir-icon" v-show="filesList.children"></i>
                <i class="el-icon-document dir-icon" v-show="!filesList.children"></i>
                {{filesList.name}}
                <span class="no-save" v-if="!filesList.save">未保存</span>
                <div class="wrap-delete">
                    <i class="el-icon-delete dir-icon" v-if="!filesList.children" @click.stop="removeFile(filesList)"></i>
                </div>
            </div>

            <ul v-show="open" v-if="isFolder">
                <item
                    class="item ellipsis"
                    v-for="(item,index) in filesList.children"
                    :key="index"
                    :value="item.value"
                    :filesList="item">
                </item>
            </ul>
        </li>
    </div>
</template>

<script>
	//import  from ''
	import file from '@/services/API-file'
	import {mapState, mapActions, mapGetters} from 'vuex';

	export default {
		//组件名
		name: 'item',
		//实例的数据对象
		data () {
			return {
				open: false,
			}
		},
		//数组或对象，用于接收来自父组件的数据
		props: {
			filesList: Object
        },
		//计算
		computed: {
            ...mapGetters(['activeFile','getUrl','editFile']),
			isFolder: function () {
				return this.filesList.children
			},
            imgPath(){
	           const path = open ?  './images/icon-right.png':'./images/icon-right.png'
                return path;
            }
        },
		//方法
		methods: {
			...mapActions(['queryFileListData','setActiveFile','updateUrl','updateEditFile','updatePosition','updateRightMenuBlock','updateDeleteStatus']),
			toggle(itemInfo) {
				console.log('正在点击的→→→→→→→→→→→→→→→→');
				console.log(itemInfo);
				this.setActiveFile(itemInfo);
				if (this.isFolder) {
					this.open = !this.open
				}else {
					this.updateEditFile({
                        name:itemInfo.name,
                        value:itemInfo.value,
                        keyId:itemInfo.keyId
                    })
				}
			},
			changeType: function () {
				if (!this.isFolder) {
					this.set(this.filesList, 'children', [])
					this.addChild()
					this.open = true
				}
			},
			addChild: function () {
				this.filesList.children.push({
					name: 'new stuff'
				})
			},
            updateUrlFn(filesList){
	            this.getUrl.forEach((item,index,data)=>{
		            if(filesList.keyId === item.keyId){
			            data.splice(index,1);
			            this.updateUrl(data)
                        return;
		            }
	            })
            },
            removeFile(filesList){
				if(filesList.value){
					file.removeFile(filesList.value,()=>{
						this.updateUrlFn(filesList);
						this.queryFileListData();
						console.log('删除文件成功');
                        this.updateDeleteStatus(filesList)
					})
                }else{
					this.updateUrlFn(filesList);
                }
            },
			rightMenu(filesList,e){
            	console.log(filesList)
            	console.log(e)
            	if(e.button === 2){
		            this.setActiveFile(filesList);
                    const position = {
                    	x:e.clientX,
                        y:e.clientY,
                        item:filesList
                    };
                    this.updatePosition(position)
		            this.updateRightMenuBlock(true)
                }
            }
		},
		//生命周期函数
		created(){

		},
		//监视
		watch: {},
		//组件
		components: {}
	}
</script>

<style lang="less" scoped>
    body {
        font-family: Menlo, Consolas, monospace;
        color: #444;
    }
    .item {
        cursor: pointer;
    }
    .bold {
        font-weight: bold;
    }
    ul {
        padding-left: 13px;
        line-height: 23px;
        list-style-type:none;
    }
    .index{

    }
    .file-img{
        display:inline-block;
        width:14px;
        height:14px;
    }
    .root-file{
        cursor: pointer;
        position: relative;
    }
    .dir-icon{
        color: #f0fffc;
    }
    .wrap-delete{
        position: absolute;
        right:10px;
        top:0px;
        width:16px;
        height:15px;
        display:none;
    }
    .root-file:hover .wrap-delete{
        display:block;
    }
    .activeClass{
        background: #a8d9ff;
    }
    .no-save{
        color:red;
        margin-left:20px;
    }
</style>
