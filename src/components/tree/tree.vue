<template>
    <div class="tree">
        <ul>
            <li>
                <div
                    :class="{bold: isFolder}"
                    @click="toggle"
                    @dblclick="changeType">
                      <img :src="imgPath" v-if="isFolder"/>
                    <!--<img src="{{isFolder ? 'images/folder.png':'images/card.png'}}"/>-->
                    {{model.name}}
          <!--<span v-if="isFolder">[{{open ? '-' : '+'}}]</span>-->
                      <!--<span v-if="isFolder">[{{open ? '-' : '+'}}]</span>-->
                </div>

                <ul v-show="open" v-if="isFolder">
                    <item
                            class="item"
                            v-for="model in model.children"
                            :key="index"
                            :model="model">
                    </item>
                </ul>
            </li>
        </ul>
    </div>
</template>

<script>
	//import  from ''
	
	export default {
		//组件名
		name: 'item',
		//实例的数据对象
		data () {
			return {
				open: false
			}
		},
		//数组或对象，用于接收来自父组件的数据
		props: {
			model: Array
        },
		//计算
		computed: {
			isFolder: function () {
				return this.model.children &&
					this.model.children.length
			},
            imgPath(){
	           const path = open ?  './images/icon-right.png':'./images/icon-right.png'
                return path;
            }
        },
		//方法
		methods: {
			toggle: function () {
				if (this.isFolder) {
					this.open = !this.open
				}
				else {
					alert(this.model.value);
				}
			},
			changeType: function () {
				if (!this.isFolder) {
					Vue.set(this.model, 'children', [])
					this.addChild()
					this.open = true
				}
			},
			addChild: function () {
				this.model.children.push({
					name: 'new stuff'
				})
			},
			openFolder: function () {

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
</style>
