<template>
    <div >
        <li class="tree-file">
            <div
                class="ellipsis root-file"
                :class="{bold: isFolder,activeFile:filesList.keyId == activeFile.keyId}"
                @mousedown.stop="rightMenu(filesList, $event)"
                @click="toggle(filesList)">
                <!--@dblclick="changeType">-->
                <!--<i class="el-icon-date dir-icon" v-show="filesList.children"></i>-->
                <i class="el-icon-caret-bottom tip" v-show="open" v-if="isFolder"></i>
                <i class="el-icon-caret-right tip" v-show="!open" v-if="isFolder"></i>
                <img src="./images/dir.png" v-if="isFolder">
                <img src="./images/file-default.png" v-if="!isFolder">
                {{filesList.name}}
                <span class="no-save" v-if="!filesList.save"></span>
                <div class="wrap-delete">
                    <i class="el-icon-delete dir-icon default" v-if="!filesList.children" @click.stop="removeFile(filesList)"></i>
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
            ...mapGetters(['activeFile','getUrl','editFile','newOpenFile']),
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

			...mapActions(['queryFileListData','setActiveFile','updateUrl','updateEditFile','updatePosition','updateRightMenuBlock',
                'compileWatch','updateDeleteStatus','changeShowDeleteModal','changeDeleteFile']),
			toggle(itemInfo) {
				console.log('正在点击的→→→→→→→→→→→→→→→→');
				console.log(itemInfo);
				this.compileWatch(0);//编译状态重置
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
				this.updateRightMenuBlock(false)
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
	            this.setActiveFile(filesList);
            	this.changeDeleteFile(filesList);
            	this.changeShowDeleteModal(true)
            },
			rightMenu(filesList,e){
            	if(e.button === 2){
		            const documentHeight = window.innerHeight;;

		            let clientY, divWidth;
		            if(filesList.id == 1){
			            divWidth = 124
                    }else{
			            divWidth = 186
                    }
		            if(documentHeight - e.clientY < divWidth){
			            clientY = e.clientY - divWidth
		            }else{
			            clientY = e.clientY
		            }

		            this.setActiveFile(filesList);
                    const position = {
                    	x:e.clientX,
                        y:clientY,
                        item:filesList
                    };
                    this.updatePosition(position);
		            this.updateRightMenuBlock(true)
                }
            },

		},
		//生命周期函数
		created(){

		},
		//监视
		watch: {
//            'newOpenFile.id':function(){
//            	if(this.newOpenFile.newFile.keyId === this.filesList.keyId){
//            		this.open = true;
//                }
//            }
        },
		//组件
		components: {}
	}
</script>

<style lang="less" scoped>
    .tree-file{
        .item {
            cursor: pointer;
        }
        .bold {

        }
        ul {
            padding-left: 20px;
            line-height: 35px;
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
            height:35px;
            line-height:35px;
            padding-left:20px;
            img{
                display:inline-block;
                margin-right:4px;
            }
        }
        .root-file:hover{
            background-color: #6ad0ee;
        }
        .dir-icon{
            font-size: 14px;
        }
        .dir-icon:hover{
            font-size: 16px;
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
        .no-save{
            margin-left:30px;
            display: inline-block;
            width:6px;
            height:6px;
            border-radius:6px;
            background-color: rgba(255, 102, 0, 0.717647);
        }
        .tip{
            font-size:8px;
            display:inline-block;
            vertical-align: top;
            line-height:35px;
        }
    }
</style>
