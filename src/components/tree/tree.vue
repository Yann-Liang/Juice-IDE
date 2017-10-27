<template>
    <!--<div >-->
        <li class="tree">
            <div
                class="ellipsis root-file"
                :class="{bold: isFolder}"
                :value="filesList.value"
                @click="toggle(filesList)">
                <!--@dblclick="changeType">-->
                <img src="./images/icon-right.png" class="file-img"/>
                <!--<img src="{{isFolder ? 'images/folder.png':'images/card.png'}}"/>-->
                {{filesList.name}}
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
    <!--</div>-->
</template>

<script>
	//import  from ''
	import file from '@/services/API-file'
	
	export default {
		//组件名
		name: 'item',
		//实例的数据对象
		data () {
			return {
				open: false,
                activeFile:''
			}
		},
		//数组或对象，用于接收来自父组件的数据
		props: {
			filesList: Object
        },
		//计算
		computed: {
			isFolder: function () {
				return this.filesList.children &&
					this.filesList.children.length
			},
            imgPath(){
	           const path = open ?  './images/icon-right.png':'./images/icon-right.png'
                return path;
            }
        },
		//方法
		methods: {
			toggle(itemInfo) {
				console.log(itemInfo.value)
				this.activeFile = itemInfo;
				if (this.isFolder) {
					this.open = !this.open
				}else {
//					alert(this.filesList.value);
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
            removeFile(){
	            file.removeFile(activeFile,()=>{
	            	console.log('删除文件成功');
                })
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
        line-height: 1.5em;
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
    }
</style>
